import { getDb } from '../db/connection';
import { searchGoogleBooks } from './google-books';
import { createLogger } from '../utils/logger';

const log = createLogger('cover-fetcher');

interface BookWithoutCover {
	id: string;
	original_title: string;
	authors: string;
}

const BATCH_SIZE = 20;
const DELAY_MS = 500;
let running = false;
let queued = false;

function normalize(s: string): string {
	return s
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s]/gu, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function titleMatches(bookTitle: string, resultTitle: string): boolean {
	const a = normalize(bookTitle);
	const b = normalize(resultTitle);

	// Exact or substring match
	if (a === b) return true;
	if (a.includes(b) || b.includes(a)) return true;

	// Word overlap -- at least one significant word must match
	const wordsA = new Set(a.split(' ').filter((w) => w.length > 2));
	const wordsB = new Set(b.split(' ').filter((w) => w.length > 2));
	if (wordsA.size === 0) return false;

	let overlap = 0;
	for (const w of wordsA) {
		if (wordsB.has(w)) overlap++;
	}

	// If title has good overlap, accept it
	if (wordsA.size <= 2) return overlap >= 1;
	return overlap / wordsA.size >= 0.4;
}

function getAllBooksWithoutCovers(limit: number = BATCH_SIZE): BookWithoutCover[] {
	return getDb()
		.prepare(
			`SELECT b.id, b.original_title, GROUP_CONCAT(a.name, ', ') as authors
			FROM books b
			LEFT JOIN book_authors ba ON ba.book_id = b.id
			LEFT JOIN authors a ON a.id = ba.author_id
			WHERE b.cover_url IS NULL
			GROUP BY b.id
			ORDER BY b.created_at DESC
			LIMIT ?`
		)
		.all(limit) as BookWithoutCover[];
}

async function fetchCoverForBookEntry(book: BookWithoutCover): Promise<boolean> {
	const query = `${book.original_title} ${book.authors || ''}`.trim();
	const results = await searchGoogleBooks(query, 5);

	const bookAuthors = normalize(book.authors || '');

	for (const result of results) {
		if (!result.coverUrl) continue;

		// Check title match
		if (titleMatches(book.original_title, result.title, result.authors)) {
			getDb()
				.prepare("UPDATE books SET cover_url = ?, updated_at = datetime('now') WHERE id = ?")
				.run(result.coverUrl, book.id);
			log.debug('Cover fetched (title match)', { bookId: book.id, title: book.original_title });
			return true;
		}

		// If title doesn't match but author does, it might be a translation
		if (bookAuthors && result.authors.some((a) => bookAuthors.includes(normalize(a)))) {
			getDb()
				.prepare("UPDATE books SET cover_url = ?, updated_at = datetime('now') WHERE id = ?")
				.run(result.coverUrl, book.id);
			log.debug('Cover fetched (author match)', {
				bookId: book.id,
				title: book.original_title,
				resultTitle: result.title
			});
			return true;
		}
	}

	log.debug('No matching cover found', { bookId: book.id, title: book.original_title });
	return false;
}

async function processBatch(): Promise<{ fetched: number; rateLimited: boolean }> {
	const books = getAllBooksWithoutCovers();
	if (books.length === 0) return { fetched: 0, rateLimited: false };

	let fetched = 0;
	let rateLimited = false;

	for (const book of books) {
		try {
			const found = await fetchCoverForBookEntry(book);
			if (found) fetched++;
			await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
		} catch (e) {
			const msg = String(e);
			if (msg.includes('RATE_LIMITED')) {
				log.warn('Rate limited by Google Books, backing off');
				rateLimited = true;
				break;
			}
			log.warn('Cover fetch failed', { bookId: book.id, error: msg });
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}
	}

	return { fetched, rateLimited };
}

async function runLoop(): Promise<void> {
	if (running) {
		queued = true;
		return;
	}

	running = true;
	log.info('Background cover fetch started');

	try {
		let totalFetched = 0;
		let attempts = 0;
		let consecutiveEmpty = 0;
		const maxAttempts = 100;

		while (attempts < maxAttempts) {
			const { fetched, rateLimited } = await processBatch();
			totalFetched += fetched;
			attempts++;

			if (rateLimited) {
				// Back off for 60 seconds on rate limit
				log.info('Rate limited, waiting 60s before retry', { totalFetched, attempts });
				await new Promise((resolve) => setTimeout(resolve, 60000));
				consecutiveEmpty = 0; // Reset -- we didn't actually try all books
				continue;
			}

			const remaining = getAllBooksWithoutCovers(1);
			if (remaining.length === 0) break;

			if (fetched === 0) {
				consecutiveEmpty++;
				// Only stop after 3 consecutive empty batches (not rate limited)
				if (consecutiveEmpty >= 3) {
					log.info('No more covers found after 3 attempts, stopping', { totalFetched, attempts });
					break;
				}
				// Wait a bit before retrying
				await new Promise((resolve) => setTimeout(resolve, 5000));
			} else {
				consecutiveEmpty = 0;
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
		}

		log.info('Background cover fetch complete', { totalFetched, attempts });
	} catch (e) {
		log.error('Background cover fetch error', { error: String(e) });
	} finally {
		running = false;

		if (queued) {
			queued = false;
			setTimeout(() => runLoop(), 5000);
		}
	}
}

/**
 * Trigger a background cover fetch for all books without covers.
 * Deferred via setTimeout so it never blocks the calling request.
 * Safe to call multiple times -- queues if already running.
 */
export function triggerCoverFetch(): void {
	setTimeout(() => runLoop(), 100);
}

/**
 * Fetch a single book's cover immediately.
 */
export async function fetchCoverForBook(bookId: string): Promise<void> {
	const book = getDb()
		.prepare(
			`SELECT b.id, b.original_title, GROUP_CONCAT(a.name, ', ') as authors
			FROM books b
			LEFT JOIN book_authors ba ON ba.book_id = b.id
			LEFT JOIN authors a ON a.id = ba.author_id
			WHERE b.id = ? AND b.cover_url IS NULL
			GROUP BY b.id`
		)
		.get(bookId) as BookWithoutCover | undefined;

	if (!book) return;

	try {
		await fetchCoverForBookEntry(book);
	} catch (e) {
		log.warn('Single cover fetch failed', { bookId, error: String(e) });
	}
}
