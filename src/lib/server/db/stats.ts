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
			`WITH progress_points AS (
				SELECT pe.user_book_id, pe.created_at,
					CASE
						WHEN pe.page IS NOT NULL THEN pe.page
						WHEN pe.percent IS NOT NULL AND ub.user_total_pages IS NOT NULL
							THEN CAST(pe.percent * ub.user_total_pages / 100.0 AS INTEGER)
						ELSE NULL
					END as page_value
				FROM progress_entries pe
				JOIN user_books ub ON ub.id = pe.user_book_id
				WHERE ub.user_id = ?
			), progress_deltas AS (
				SELECT user_book_id, created_at, page_value,
					COALESCE(
						LAG(page_value) OVER (PARTITION BY user_book_id ORDER BY created_at),
						0
					) as previous_page_value
				FROM progress_points
				WHERE page_value IS NOT NULL
			), progress_pages AS (
				SELECT strftime('%m', created_at) as month,
					SUM(
						CASE
							WHEN page_value > previous_page_value THEN page_value - previous_page_value
							ELSE 0
						END
					) as pages
				FROM progress_deltas
				WHERE strftime('%Y', created_at) = ?
				GROUP BY month
			), completed_pages AS (
				SELECT strftime('%m', ub.finished_at) as month,
					SUM(
						CASE
							WHEN ub.user_total_pages > COALESCE(mp.max_page_value, 0)
								THEN ub.user_total_pages - COALESCE(mp.max_page_value, 0)
							ELSE 0
						END
					) as pages
				FROM user_books ub
				JOIN status_definitions sd ON sd.id = ub.current_status_id
				LEFT JOIN (
					SELECT user_book_id, MAX(page_value) as max_page_value
					FROM progress_points
					WHERE page_value IS NOT NULL
					GROUP BY user_book_id
				) mp ON mp.user_book_id = ub.id
				WHERE ub.user_id = ?
					AND sd.system_category = 'completed'
					AND ub.user_total_pages IS NOT NULL
					AND ub.finished_at IS NOT NULL
					AND strftime('%Y', ub.finished_at) = ?
				GROUP BY month
			), combined AS (
				SELECT month, pages FROM progress_pages
				UNION ALL
				SELECT month, pages FROM completed_pages
			)
			SELECT month, SUM(pages) as pages
			FROM combined
			GROUP BY month ORDER BY month`
		)
		.all(userId, String(year), userId, String(year)) as { month: string; pages: number }[];
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

export type AuthorScope = 'read' | 'wanted' | 'all';
export const AUTHOR_SCOPES: AuthorScope[] = ['read', 'wanted', 'all'];

const SCOPE_CATEGORY: Record<AuthorScope, string | null> = {
	read: 'completed',
	wanted: 'planned',
	all: null
};

export function getTopAuthors(
	userId: string,
	scope: AuthorScope = 'read',
	limit: number = 10
): { name: string; count: number }[] {
	const category = SCOPE_CATEGORY[scope];
	return getDb()
		.prepare(
			`SELECT a.name, COUNT(DISTINCT ub.id) as count
			FROM user_books ub
			LEFT JOIN status_definitions sd ON sd.id = ub.current_status_id
			JOIN book_authors ba ON ba.book_id = ub.book_id
			JOIN authors a ON a.id = ba.author_id
			WHERE ub.user_id = ? AND (? IS NULL OR sd.system_category = ?)
			GROUP BY a.id ORDER BY count DESC, a.name LIMIT ?`
		)
		.all(userId, category, category, limit) as { name: string; count: number }[];
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
