import type { ReadingList, ReadingListItem } from '$lib/types';
import { getDb } from './connection';
import { generateId } from '../utils/crypto';
import { createLogger } from '../utils/logger';

const log = createLogger('lists');

export function createList(
	userId: string,
	title: string,
	description?: string | null,
	visibility: string = 'private'
): string {
	const id = generateId();
	getDb()
		.prepare(
			'INSERT INTO reading_lists (id, user_id, title, description, visibility) VALUES (?, ?, ?, ?, ?)'
		)
		.run(id, userId, title, description || null, visibility);
	log.info('List created', { id, userId, title });
	return id;
}

export function getListById(id: string): ReadingList | null {
	return (
		(getDb().prepare('SELECT * FROM reading_lists WHERE id = ?').get(id) as ReadingList) ?? null
	);
}

export function getUserLists(
	userId: string
): (ReadingList & { item_count: number; cover_urls_json: string | null })[] {
	return getDb()
		.prepare(
			`SELECT rl.*, COUNT(rli.id) as item_count,
				(SELECT json_group_array(cover_url)
				 FROM (
					 SELECT b.cover_url
					 FROM reading_list_items preview_rli
					 JOIN books b ON b.id = preview_rli.book_id
					 WHERE preview_rli.list_id = rl.id AND b.cover_url IS NOT NULL
					 ORDER BY preview_rli.position ASC, preview_rli.added_at DESC
					 LIMIT 4
				 )) as cover_urls_json
			FROM reading_lists rl
			LEFT JOIN reading_list_items rli ON rli.list_id = rl.id
			WHERE rl.user_id = ?
			GROUP BY rl.id
			ORDER BY rl.updated_at DESC`
		)
		.all(userId) as (ReadingList & { item_count: number; cover_urls_json: string | null })[];
}

export function updateList(
	id: string,
	data: { title?: string; description?: string | null; visibility?: string }
): void {
	const list = getListById(id);
	if (!list) return;
	getDb()
		.prepare(
			"UPDATE reading_lists SET title = ?, description = ?, visibility = ?, updated_at = datetime('now') WHERE id = ?"
		)
		.run(
			data.title ?? list.title,
			data.description ?? list.description,
			data.visibility ?? list.visibility,
			id
		);
}

export function deleteList(id: string): void {
	getDb().prepare('DELETE FROM reading_lists WHERE id = ?').run(id);
	log.info('List deleted', { id });
}

export function getListItems(
	listId: string,
	userId: string
): (ReadingListItem & {
	original_title: string;
	cover_url: string | null;
	authors: string;
	status_label: string | null;
	system_category: string | null;
})[] {
	return getDb()
		.prepare(
			`SELECT rli.*, b.original_title, b.cover_url,
			GROUP_CONCAT(a.name, ', ') as authors,
			sd.label as status_label,
			sd.system_category
			FROM reading_list_items rli
			JOIN books b ON b.id = rli.book_id
			LEFT JOIN book_authors ba ON ba.book_id = b.id
			LEFT JOIN authors a ON a.id = ba.author_id
			LEFT JOIN user_books ub ON ub.book_id = b.id AND ub.user_id = ?
			LEFT JOIN status_definitions sd ON sd.id = ub.current_status_id
			WHERE rli.list_id = ?
			GROUP BY rli.id
			ORDER BY rli.position`
		)
		.all(userId, listId) as (ReadingListItem & {
		original_title: string;
		cover_url: string | null;
		authors: string;
		status_label: string | null;
		system_category: string | null;
	})[];
}

export function addItemToList(
	listId: string,
	bookId: string,
	note?: string,
	position?: number
): string {
	const id = generateId();
	const pos =
		position ??
		((
			getDb()
				.prepare('SELECT MAX(position) as max_pos FROM reading_list_items WHERE list_id = ?')
				.get(listId) as { max_pos: number | null }
		).max_pos ?? -1) + 1;
	getDb()
		.prepare(
			'INSERT OR IGNORE INTO reading_list_items (id, list_id, book_id, note, position) VALUES (?, ?, ?, ?, ?)'
		)
		.run(id, listId, bookId, note || null, pos);
	return id;
}

export function removeItemFromList(listId: string, bookId: string): void {
	getDb()
		.prepare('DELETE FROM reading_list_items WHERE list_id = ? AND book_id = ?')
		.run(listId, bookId);
}

export function reorderItems(listId: string, itemIds: string[]): void {
	const db = getDb();
	db.transaction(() => {
		for (let i = 0; i < itemIds.length; i++) {
			db.prepare('UPDATE reading_list_items SET position = ? WHERE id = ? AND list_id = ?').run(
				i,
				itemIds[i],
				listId
			);
		}
	})();
}
