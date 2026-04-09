import { getDb } from '../db/connection';
import { searchGoogleBooks } from './google-books';
import { createLogger } from '../utils/logger';

const log = createLogger('cover-fetcher');

interface BookWithoutCover {
	id: string;
	original_title: string;
	authors: string;
}

export function getBooksWithoutCovers(userId: string, limit: number = 50): BookWithoutCover[] {
	return getDb()
		.prepare(
			`SELECT b.id, b.original_title, GROUP_CONCAT(a.name, ', ') as authors
			FROM user_books ub
			JOIN books b ON b.id = ub.book_id
			LEFT JOIN book_authors ba ON ba.book_id = b.id
			LEFT JOIN authors a ON a.id = ba.author_id
			WHERE ub.user_id = ? AND b.cover_url IS NULL
			GROUP BY b.id
			ORDER BY ub.updated_at DESC
			LIMIT ?`
		)
		.all(userId, limit) as BookWithoutCover[];
}

export async function fetchCoversForUser(userId: string): Promise<number> {
	const books = getBooksWithoutCovers(userId);
	if (books.length === 0) return 0;

	let fetched = 0;
	const db = getDb();

	for (const book of books) {
		try {
			const query = `${book.original_title} ${book.authors || ''}`.trim();
			const results = await searchGoogleBooks(query, 1);

			if (results.length > 0 && results[0].coverUrl) {
				db.prepare("UPDATE books SET cover_url = ?, updated_at = datetime('now') WHERE id = ?").run(
					results[0].coverUrl,
					book.id
				);
				fetched++;
				log.debug('Cover fetched', { bookId: book.id, title: book.original_title });
			}

			// Rate limit: ~100ms between requests
			await new Promise((resolve) => setTimeout(resolve, 100));
		} catch (e) {
			log.warn('Cover fetch failed', { bookId: book.id, error: String(e) });
		}
	}

	log.info('Cover fetch complete', { userId, total: books.length, fetched });
	return fetched;
}
