import { getDb } from './connection';

export function getBooksCompletedByMonth(
	userId: string,
	year: number
): { month: string; count: number }[] {
	return getDb()
		.prepare(
			`SELECT strftime('%m', ub.finished_at) as month, COUNT(*) as count
			FROM user_books ub
			JOIN status_definitions sd ON sd.id = ub.current_status_id
			WHERE ub.user_id = ? AND sd.system_category = 'completed'
			AND strftime('%Y', ub.finished_at) = ?
			GROUP BY month ORDER BY month`
		)
		.all(userId, String(year)) as { month: string; count: number }[];
}

export function getPagesReadByMonth(
	userId: string,
	year: number
): { month: string; pages: number }[] {
	return getDb()
		.prepare(
			`SELECT strftime('%m', pe.created_at) as month, SUM(pe.page) as pages
			FROM progress_entries pe
			JOIN user_books ub ON ub.id = pe.user_book_id
			WHERE ub.user_id = ? AND strftime('%Y', pe.created_at) = ?
			AND pe.page IS NOT NULL
			GROUP BY month ORDER BY month`
		)
		.all(userId, String(year)) as { month: string; pages: number }[];
}

export function getBooksByLanguage(userId: string): { language: string; count: number }[] {
	return getDb()
		.prepare(
			`SELECT b.original_language as language, COUNT(*) as count
			FROM user_books ub JOIN books b ON b.id = ub.book_id
			WHERE ub.user_id = ?
			GROUP BY language ORDER BY count DESC`
		)
		.all(userId) as { language: string; count: number }[];
}

export function getBooksByStatus(userId: string): { category: string; count: number }[] {
	return getDb()
		.prepare(
			`SELECT sd.system_category as category, COUNT(*) as count
			FROM user_books ub
			JOIN status_definitions sd ON sd.id = ub.current_status_id
			WHERE ub.user_id = ?
			GROUP BY category ORDER BY count DESC`
		)
		.all(userId) as { category: string; count: number }[];
}

export function getTopAuthors(
	userId: string,
	limit: number = 10
): { name: string; count: number }[] {
	return getDb()
		.prepare(
			`SELECT a.name, COUNT(DISTINCT ub.id) as count
			FROM user_books ub
			JOIN book_authors ba ON ba.book_id = ub.book_id
			JOIN authors a ON a.id = ba.author_id
			WHERE ub.user_id = ?
			GROUP BY a.id ORDER BY count DESC LIMIT ?`
		)
		.all(userId, limit) as { name: string; count: number }[];
}

export function getAveragePages(userId: string): number {
	const result = getDb()
		.prepare(
			`SELECT AVG(ub.user_total_pages) as avg_pages
			FROM user_books ub
			JOIN status_definitions sd ON sd.id = ub.current_status_id
			WHERE ub.user_id = ? AND sd.system_category = 'completed' AND ub.user_total_pages IS NOT NULL`
		)
		.get(userId) as { avg_pages: number | null };
	return Math.round(result.avg_pages ?? 0);
}

export function getActiveReadsCount(userId: string): number {
	return (
		getDb()
			.prepare(
				`SELECT COUNT(*) as count FROM user_books ub
			JOIN status_definitions sd ON sd.id = ub.current_status_id
			WHERE ub.user_id = ? AND sd.system_category = 'active'`
			)
			.get(userId) as { count: number }
	).count;
}

export function getBooksByReadingPlace(userId: string): { name: string; count: number }[] {
	return getDb()
		.prepare(
			`SELECT rp.name, COUNT(DISTINCT pe.user_book_id) as count
			FROM progress_entries pe
			JOIN reading_places rp ON rp.id = pe.reading_place_id
			JOIN user_books ub ON ub.id = pe.user_book_id
			WHERE ub.user_id = ? AND pe.reading_place_id IS NOT NULL
			GROUP BY rp.id ORDER BY count DESC`
		)
		.all(userId) as { name: string; count: number }[];
}
