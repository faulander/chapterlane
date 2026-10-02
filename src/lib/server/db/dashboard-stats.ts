import { getDb } from './connection';
import { currentStreak, daysReadThisWeek } from '../../utils/reading-streak';

export interface RecentlyFinishedBook {
	book_id: string;
	title: string;
	cover_url: string | null;
}

export interface SoloStats {
	streak: number;
	daysReadThisWeek: number;
	booksFinishedThisWeek: number;
	booksFinishedThisYear: number;
	year: number;
	goal: number | null;
	recentlyFinished: RecentlyFinishedBook[];
}

const STREAK_LOOKBACK_DAYS = 400;
const RECENT_COVERS = 10;

/** Personal reading summary for a user with no friends to compare against. */
export function getSoloStats(userId: string, goal: number | null, now = new Date()): SoloStats {
	const db = getDb();
	const today = now.toISOString().slice(0, 10);
	const year = now.getUTCFullYear();

	const readingDays = (
		db
			.prepare(
				`SELECT DISTINCT date(pe.created_at) AS day
				FROM progress_entries pe
				JOIN user_books ub ON ub.id = pe.user_book_id
				WHERE ub.user_id = ? AND pe.created_at >= datetime(?, ?)`
			)
			.all(
				userId,
				now.toISOString().replace('T', ' ').slice(0, 19),
				`-${STREAK_LOOKBACK_DAYS} days`
			) as {
			day: string;
		}[]
	).map((row) => row.day);

	const finished = db
		.prepare(
			`SELECT
				COALESCE(SUM(CASE WHEN ub.finished_at >= date(?, '-6 days') THEN 1 END), 0) AS week,
				COALESCE(SUM(CASE WHEN strftime('%Y', ub.finished_at) = ? THEN 1 END), 0) AS year
			FROM user_books ub
			JOIN status_definitions sd ON sd.id = ub.current_status_id
			WHERE ub.user_id = ? AND sd.system_category = 'completed' AND ub.finished_at IS NOT NULL`
		)
		.get(today, String(year), userId) as { week: number; year: number };

	const recentlyFinished = db
		.prepare(
			`SELECT ub.book_id AS book_id,
				COALESCE(btt.translated_title, b.original_title) AS title,
				b.cover_url AS cover_url
			FROM user_books ub
			JOIN status_definitions sd ON sd.id = ub.current_status_id
			JOIN books b ON b.id = ub.book_id
			LEFT JOIN book_title_translations btt ON btt.book_id = b.id
				AND btt.language_code = (SELECT preferred_language FROM users WHERE id = ub.user_id)
			WHERE ub.user_id = ? AND sd.system_category = 'completed' AND ub.finished_at IS NOT NULL
			ORDER BY ub.finished_at DESC, ub.updated_at DESC
			LIMIT ?`
		)
		.all(userId, RECENT_COVERS) as RecentlyFinishedBook[];

	return {
		streak: currentStreak(readingDays, today),
		daysReadThisWeek: daysReadThisWeek(readingDays, today),
		booksFinishedThisWeek: finished.week,
		booksFinishedThisYear: finished.year,
		year,
		goal,
		recentlyFinished
	};
}
