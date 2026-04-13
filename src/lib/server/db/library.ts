import type { UserBook } from '$lib/types';
import { getDb } from './connection';
import { generateId } from '../utils/crypto';

export function addBookToLibrary(userId: string, bookId: string, statusId?: string): string {
	const id = generateId();
	getDb()
		.prepare(
			`INSERT INTO user_books (id, user_id, book_id, current_status_id)
			VALUES (?, ?, ?, ?)`
		)
		.run(id, userId, bookId, statusId || 'sys_want_to_read');

	// Record initial status in history
	const historyId = generateId();
	getDb()
		.prepare('INSERT INTO user_book_status_history (id, user_book_id, status_id) VALUES (?, ?, ?)')
		.run(historyId, id, statusId || 'sys_want_to_read');

	return id;
}

export function getUserBook(userId: string, bookId: string): UserBook | null {
	return (
		(getDb()
			.prepare('SELECT * FROM user_books WHERE user_id = ? AND book_id = ?')
			.get(userId, bookId) as UserBook) ?? null
	);
}

export function getUserBookById(userBookId: string): UserBook | null {
	return (
		(getDb().prepare('SELECT * FROM user_books WHERE id = ?').get(userBookId) as UserBook) ?? null
	);
}

export interface UserBookWithDetails extends UserBook {
	original_title: string;
	display_title: string;
	cover_url: string | null;
	authors: string;
	status_label: string | null;
	system_category: string | null;
	shelves_json: string | null;
	lists_json: string | null;
}

export type BookSortOption = 'added_desc' | 'added_asc' | 'title_asc' | 'title_desc' | 'author_asc' | 'author_desc';

export function getUserBooks(
	userId: string,
	options: {
		statusCategory?: string;
		search?: string;
		sort?: BookSortOption;
		limit?: number;
		offset?: number;
	} = {}
): UserBookWithDetails[] {
	let sql = `
		SELECT ub.*,
			b.original_title,
			COALESCE(btt.translated_title, b.original_title) as display_title,
			b.cover_url,
			GROUP_CONCAT(DISTINCT a.name) as authors,
			sd.label as status_label,
			sd.system_category,
			(SELECT json_group_array(json_object('id', s.id, 'name', s.name))
			 FROM shelf_books sb
			 JOIN shelves s ON s.id = sb.shelf_id
			 WHERE sb.user_book_id = ub.id) as shelves_json,
			(SELECT json_group_array(json_object('id', rl.id, 'name', rl.title))
			 FROM reading_list_items rli
			 JOIN reading_lists rl ON rl.id = rli.list_id
			 WHERE rli.book_id = ub.book_id) as lists_json
		FROM user_books ub
		JOIN books b ON b.id = ub.book_id
		LEFT JOIN book_title_translations btt ON btt.book_id = b.id
			AND btt.language_code = (SELECT preferred_language FROM users WHERE id = ub.user_id)
		LEFT JOIN book_authors ba ON ba.book_id = b.id
		LEFT JOIN authors a ON a.id = ba.author_id
		LEFT JOIN status_definitions sd ON sd.id = ub.current_status_id
		WHERE ub.user_id = ?
	`;

	const params: (string | number)[] = [userId];

	if (options.statusCategory) {
		sql += ' AND sd.system_category = ?';
		params.push(options.statusCategory);
	}

	if (options.search) {
		sql += ' AND (b.original_title LIKE ? OR a.name LIKE ?)';
		const pattern = `%${options.search}%`;
		params.push(pattern, pattern);
	}

	sql += ' GROUP BY ub.id';

	const sortMap: Record<BookSortOption, string> = {
		added_desc: 'ub.created_at DESC',
		added_asc: 'ub.created_at ASC',
		title_asc: 'display_title ASC',
		title_desc: 'display_title DESC',
		author_asc: 'authors ASC',
		author_desc: 'authors DESC'
	};
	sql += ` ORDER BY ${sortMap[options.sort || 'added_desc']}`;

	if (options.limit) {
		sql += ' LIMIT ?';
		params.push(options.limit);
		if (options.offset) {
			sql += ' OFFSET ?';
			params.push(options.offset);
		}
	}

	return getDb()
		.prepare(sql)
		.all(...params) as UserBookWithDetails[];
}

export function getUserBookCount(userId: string, statusCategory?: string, search?: string): number {
	let sql = `
		SELECT COUNT(DISTINCT ub.id) as count FROM user_books ub
		LEFT JOIN status_definitions sd ON sd.id = ub.current_status_id
		LEFT JOIN books b ON b.id = ub.book_id
		LEFT JOIN book_authors ba ON ba.book_id = b.id
		LEFT JOIN authors a ON a.id = ba.author_id
		WHERE ub.user_id = ?
	`;
	const params: (string | number)[] = [userId];

	if (statusCategory) {
		sql += ' AND sd.system_category = ?';
		params.push(statusCategory);
	}

	if (search) {
		sql += ' AND (b.original_title LIKE ? OR a.name LIKE ?)';
		const pattern = `%${search}%`;
		params.push(pattern, pattern);
	}

	return (
		getDb()
			.prepare(sql)
			.get(...params) as { count: number }
	).count;
}

export function removeFromLibrary(userId: string, bookId: string): void {
	getDb().prepare('DELETE FROM user_books WHERE user_id = ? AND book_id = ?').run(userId, bookId);
}

export function updateUserBook(
	userBookId: string,
	data: {
		started_at?: string | null;
		finished_at?: string | null;
		user_total_pages?: number | null;
		current_page?: number | null;
		current_percent?: number | null;
	}
): void {
	const ub = getUserBookById(userBookId);
	if (!ub) return;

	getDb()
		.prepare(
			`UPDATE user_books SET
			started_at = ?, finished_at = ?, user_total_pages = ?,
			current_page = ?, current_percent = ?, updated_at = datetime('now')
			WHERE id = ?`
		)
		.run(
			data.started_at !== undefined ? data.started_at : ub.started_at,
			data.finished_at !== undefined ? data.finished_at : ub.finished_at,
			data.user_total_pages !== undefined ? data.user_total_pages : ub.user_total_pages,
			data.current_page !== undefined ? data.current_page : ub.current_page,
			data.current_percent !== undefined ? data.current_percent : ub.current_percent,
			userBookId
		);
}
