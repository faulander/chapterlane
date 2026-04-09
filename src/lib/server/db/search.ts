import { getDb } from './connection';
import { createLogger } from '../utils/logger';

const log = createLogger('search');

export function indexBook(bookId: string, titles: string[], authorNames: string[]): void {
	const titleText = titles.join(' | ');
	const authorText = authorNames.join(', ');

	getDb()
		.prepare(
			`INSERT INTO books_search (book_id, title_text, author_text)
			VALUES (?, ?, ?)
			ON CONFLICT(book_id) DO UPDATE SET title_text = excluded.title_text, author_text = excluded.author_text`
		)
		.run(bookId, titleText, authorText);

	log.debug('Indexed book for search', { bookId, titleText, authorText });
}

export function removeBookFromIndex(bookId: string): void {
	getDb().prepare('DELETE FROM books_search WHERE book_id = ?').run(bookId);
}

export interface SearchResult {
	book_id: string;
	rank: number;
}

export function searchFTS(query: string, limit: number = 20): SearchResult[] {
	if (!query || query.trim().length === 0) return [];

	const sanitized = query
		.trim()
		.replace(/['"]/g, '')
		.split(/\s+/)
		.filter((t) => t.length > 0)
		.map((t) => `"${t}"*`)
		.join(' ');

	if (!sanitized) return [];

	try {
		return getDb()
			.prepare(
				`SELECT bs.book_id, fts.rank
				FROM books_fts fts
				JOIN books_search bs ON bs.rowid = fts.rowid
				WHERE books_fts MATCH ?
				ORDER BY fts.rank
				LIMIT ?`
			)
			.all(sanitized, limit) as SearchResult[];
	} catch (e) {
		log.warn('FTS search failed', { query, error: String(e) });
		return [];
	}
}

export function rebuildIndex(): void {
	getDb().prepare("INSERT INTO books_fts(books_fts) VALUES('rebuild')").run();
	log.info('FTS index rebuilt');
}
