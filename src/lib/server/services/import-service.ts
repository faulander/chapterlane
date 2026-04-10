import { createLogger } from '../utils/logger';
import {
	createImportJob,
	updateImportJob,
	createImportRow,
	getImportRows,
	getImportJob,
	updateImportRow
} from '../db/imports';
import { addBook } from './book-service';
import { addBookToLibrary, getUserBook } from '../db/library';
import { matchBook } from './import-matcher';
import { parseGoodreadsCSV, mapGoodreadsStatus } from './parsers/goodreads-parser';
import { parseStorygraphCSV, mapStorygraphStatus } from './parsers/storygraph-parser';
import { parseCalibreDb } from './parsers/calibre-parser';
import { getDb } from '../db/connection';
import { triggerCoverFetch } from './cover-fetcher';
import { importCalibreCover } from './cover-storage';
import { updateBook } from '../db/books';
import { createShelf, getUserShelves, addBookToShelf } from '../db/shelves';
import { createList, getUserLists, addItemToList } from '../db/lists';

const log = createLogger('import-service');

const STATUS_MAP: Record<string, string> = {
	planned: 'sys_want_to_read',
	active: 'sys_reading',
	paused: 'sys_paused',
	completed: 'sys_completed',
	dropped: 'sys_dropped'
};

export function startImport(userId: string, source: string, fileContent: string): string {
	const jobId = createImportJob(userId, source);
	updateImportJob(jobId, { status: 'parsing' });

	try {
		let parsedRows: {
			title: string;
			author: string;
			status: string;
			pages: string;
			dateRead: string;
			dateAdded: string;
		}[];

		if (source === 'goodreads') {
			const rows = parseGoodreadsCSV(fileContent);
			parsedRows = rows.map((r) => ({
				title: r.title,
				author: r.author,
				status: mapGoodreadsStatus(r.exclusiveShelf),
				pages: r.numberOfPages,
				dateRead: r.dateRead,
				dateAdded: r.dateAdded
			}));
		} else if (source === 'storygraph') {
			const rows = parseStorygraphCSV(fileContent);
			parsedRows = rows.map((r) => ({
				title: r.title,
				author: r.author,
				status: mapStorygraphStatus(r.status),
				pages: r.pages,
				dateRead: r.dateRead,
				dateAdded: r.dateAdded
			}));
		} else {
			throw new Error(`Unknown source: ${source}`);
		}

		let matchedCount = 0;
		for (let i = 0; i < parsedRows.length; i++) {
			const row = parsedRows[i];
			if (!row.title) continue;

			const match = matchBook(row.title, row.author);
			if (match.bookId) matchedCount++;

			createImportRow({
				job_id: jobId,
				row_number: i + 1,
				raw_data: JSON.stringify(row),
				parsed_title: row.title,
				parsed_author: row.author,
				parsed_status: row.status,
				parsed_pages: row.pages,
				parsed_date_read: row.dateRead,
				parsed_date_added: row.dateAdded,
				matched_book_id: match.bookId,
				match_confidence: match.confidence
			});
		}

		updateImportJob(jobId, {
			status: 'previewing',
			total_rows: parsedRows.length,
			matched_rows: matchedCount
		});

		log.info('Import parsed', { jobId, totalRows: parsedRows.length, matchedCount });
	} catch (e) {
		updateImportJob(jobId, {
			status: 'failed',
			error_message: String(e),
			finished_at: new Date().toISOString()
		});
		log.error('Import parsing failed', { jobId, error: String(e) });
	}

	return jobId;
}

/**
 * Start a Calibre import by reading directly from the Calibre library's metadata.db.
 * The calibrePath is the root of the Calibre library on the filesystem.
 */
export function startCalibreImport(
	userId: string,
	calibrePath: string,
	statusColumnId: number | null
): string {
	const jobId = createImportJob(userId, 'calibre');
	updateImportJob(jobId, {
		status: 'parsing',
		calibre_path: calibrePath,
		calibre_status_column: statusColumnId ? String(statusColumnId) : null
	});

	try {
		const dbPath = `${calibrePath}/metadata.db`;
		const books = parseCalibreDb(dbPath, statusColumnId);

		let matchedCount = 0;
		for (let i = 0; i < books.length; i++) {
			const book = books[i];
			if (!book.title) continue;

			const match = matchBook(book.title, book.author);
			if (match.bookId) matchedCount++;

			createImportRow({
				job_id: jobId,
				row_number: i + 1,
				raw_data: JSON.stringify({
					calibreId: book.calibreId,
					hasCover: book.hasCover,
					path: book.path,
					language: book.language,
					isbn: book.isbn,
					tags: book.tags,
					series: book.series,
					seriesIndex: book.seriesIndex
				}),
				parsed_title: book.title,
				parsed_author: book.author,
				parsed_status: book.status,
				parsed_pages: book.pages,
				parsed_date_read: '',
				parsed_date_added: '',
				matched_book_id: match.bookId,
				match_confidence: match.confidence
			});
		}

		updateImportJob(jobId, {
			status: 'previewing',
			total_rows: books.length,
			matched_rows: matchedCount
		});

		log.info('Calibre import parsed', {
			jobId,
			totalRows: books.length,
			matchedCount,
			libraryPath: calibrePath
		});
	} catch (e) {
		updateImportJob(jobId, {
			status: 'failed',
			error_message: String(e),
			finished_at: new Date().toISOString()
		});
		log.error('Calibre import parsing failed', { jobId, error: String(e) });
	}

	return jobId;
}

export function executeImport(jobId: string, userId: string, language: string = 'en'): void {
	updateImportJob(jobId, { status: 'importing' });

	const job = getImportJob(jobId);
	const rows = getImportRows(jobId);
	let importedCount = 0;
	let skippedCount = 0;

	const isCalibre = job?.source === 'calibre';
	const calibrePath = job?.calibre_path || null;

	// Cache for shelf and list lookups during Calibre import
	// Maps tag name → shelfId, series name → listId
	const shelfCache = new Map<string, string>();
	const listCache = new Map<string, string>();

	if (isCalibre) {
		// Pre-load existing shelves and lists to avoid duplicates
		for (const shelf of getUserShelves(userId)) {
			shelfCache.set(shelf.name.toLowerCase(), shelf.id);
		}
		for (const list of getUserLists(userId)) {
			listCache.set(list.title.toLowerCase(), list.id);
		}
	}

	const db = getDb();
	const batchSize = 50;

	for (let i = 0; i < rows.length; i += batchSize) {
		const batch = rows.slice(i, i + batchSize);

		db.transaction(() => {
			for (const row of batch) {
				if (row.user_action === 'skip') {
					updateImportRow(row.id, { import_result: 'skipped' });
					skippedCount++;
					continue;
				}

				try {
					let bookId = row.matched_book_id;
					let rawData: {
						calibreId?: number;
						hasCover?: boolean;
						path?: string;
						language?: string;
						tags?: string[];
						series?: string | null;
						seriesIndex?: number | null;
					} = {};
					try {
						rawData = JSON.parse(row.raw_data);
					} catch {
						// ignore parse errors
					}

					// For Calibre imports, use the language from the Calibre DB if available
					const bookLanguage = (isCalibre && rawData.language) ? rawData.language : language;

					if (!bookId && row.parsed_title) {
						const authors = row.parsed_author
							? row.parsed_author
									.split(/[,&]/)
									.map((a) => a.trim())
									.filter((a) => a)
							: [];

						bookId = addBook({
							original_title: row.parsed_title,
							original_language: bookLanguage,
							authors
						});
					}

					if (!bookId) {
						updateImportRow(row.id, { import_result: 'skipped' });
						skippedCount++;
						continue;
					}

					// Import cover from Calibre library filesystem
					if (isCalibre && calibrePath && rawData.hasCover && rawData.path) {
						const coverUrl = importCalibreCover(calibrePath, rawData.path, bookId);
						if (coverUrl) {
							updateBook(bookId, { cover_url: coverUrl });
						}
					}

					let userBook = getUserBook(userId, bookId);
					if (!userBook) {
						const statusId = STATUS_MAP[row.parsed_status || 'planned'] || 'sys_want_to_read';
						const userBookId = addBookToLibrary(userId, bookId, statusId);
						userBook = { id: userBookId } as any;
					}

					// Calibre tags → shelves
					if (isCalibre && rawData.tags && rawData.tags.length > 0) {
						for (const tag of rawData.tags) {
							const key = tag.toLowerCase();
							let shelfId = shelfCache.get(key);
							if (!shelfId) {
								shelfId = createShelf(userId, tag);
								shelfCache.set(key, shelfId);
							}
							addBookToShelf(shelfId, userBook!.id);
						}
					}

					// Calibre series → reading lists (with series_index as position)
					if (isCalibre && rawData.series) {
						const key = rawData.series.toLowerCase();
						let listId = listCache.get(key);
						if (!listId) {
							listId = createList(userId, rawData.series);
							listCache.set(key, listId);
						}
						addItemToList(listId, bookId, undefined, rawData.seriesIndex ?? undefined);
					}

					updateImportRow(row.id, { import_result: 'imported' });
					importedCount++;
				} catch (e) {
					updateImportRow(row.id, {
						import_result: 'error',
						error_message: String(e)
					});
					log.warn('Row import failed', { rowId: row.id, error: String(e) });
				}
			}
		})();
	}

	updateImportJob(jobId, {
		status: 'completed',
		imported_rows: importedCount,
		finished_at: new Date().toISOString()
	});

	log.info('Import completed', { jobId, importedCount, skippedCount });

	// Trigger background cover fetch for books still missing covers (non-Calibre or Calibre books without covers)
	triggerCoverFetch();
}
