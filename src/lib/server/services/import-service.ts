import { createLogger } from '../utils/logger';
import {
	createImportJob,
	updateImportJob,
	createImportRow,
	getImportRows,
	updateImportRow
} from '../db/imports';
import { addBook } from './book-service';
import { addBookToLibrary, getUserBook } from '../db/library';
import { matchBook } from './import-matcher';
import { parseGoodreadsCSV, mapGoodreadsStatus } from './parsers/goodreads-parser';
import { parseStorygraphCSV, mapStorygraphStatus } from './parsers/storygraph-parser';
import { parseCalibreCSV } from './parsers/calibre-parser';
import { getDb } from '../db/connection';
import { triggerCoverFetch } from './cover-fetcher';

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
		} else if (source === 'calibre') {
			const rows = parseCalibreCSV(fileContent);
			parsedRows = rows.map((r) => ({
				title: r.title,
				author: r.author,
				status: 'planned',
				pages: r.pages,
				dateRead: '',
				dateAdded: ''
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

export function executeImport(jobId: string, userId: string, language: string = 'en'): void {
	updateImportJob(jobId, { status: 'importing' });

	const rows = getImportRows(jobId);
	let importedCount = 0;
	let skippedCount = 0;

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

					if (!bookId && row.parsed_title) {
						const authors = row.parsed_author
							? row.parsed_author
									.split(/[,&]/)
									.map((a) => a.trim())
									.filter((a) => a)
							: [];

						bookId = addBook({
							original_title: row.parsed_title,
							original_language: language,
							authors
						});
					}

					if (!bookId) {
						updateImportRow(row.id, { import_result: 'skipped' });
						skippedCount++;
						continue;
					}

					const existing = getUserBook(userId, bookId);
					if (!existing) {
						const statusId = STATUS_MAP[row.parsed_status || 'planned'] || 'sys_want_to_read';
						addBookToLibrary(userId, bookId, statusId);
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

	// Trigger background cover fetch for newly imported books
	triggerCoverFetch();
}
