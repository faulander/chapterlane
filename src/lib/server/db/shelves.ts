import type { Shelf } from '$lib/types';
import { getDb } from './connection';
import { generateId } from '../utils/crypto';
import { createLogger } from '../utils/logger';

const log = createLogger('shelves');

export function createShelf(
	userId: string,
	name: string,
	description?: string | null,
	visibility: string = 'private'
): string {
	const id = generateId();
	const maxOrder = (
		getDb()
			.prepare('SELECT MAX(sort_order) as max_order FROM shelves WHERE user_id = ?')
			.get(userId) as { max_order: number | null }
	).max_order;

	getDb()
		.prepare(
			`INSERT INTO shelves (id, user_id, name, description, visibility, sort_order)
			VALUES (?, ?, ?, ?, ?, ?)`
		)
		.run(id, userId, name, description || null, visibility, (maxOrder ?? -1) + 1);

	log.info('Shelf created', { id, userId, name });
	return id;
}

export function getShelfById(id: string): Shelf | null {
	return (getDb().prepare('SELECT * FROM shelves WHERE id = ?').get(id) as Shelf) ?? null;
}

export function getUserShelves(userId: string): Shelf[] {
	return getDb()
		.prepare('SELECT * FROM shelves WHERE user_id = ? ORDER BY sort_order')
		.all(userId) as Shelf[];
}

export interface ShelfWithCount extends Shelf {
	book_count: number;
}

export function getUserShelvesWithCounts(userId: string): ShelfWithCount[] {
	return getDb()
		.prepare(
			`SELECT s.*, COUNT(sb.user_book_id) as book_count
			FROM shelves s
			LEFT JOIN shelf_books sb ON sb.shelf_id = s.id
			WHERE s.user_id = ?
			GROUP BY s.id
			ORDER BY s.sort_order`
		)
		.all(userId) as ShelfWithCount[];
}

export function updateShelf(
	id: string,
	data: { name?: string; description?: string | null; visibility?: string }
): void {
	const shelf = getShelfById(id);
	if (!shelf) return;

	getDb()
		.prepare(
			`UPDATE shelves SET name = ?, description = ?, visibility = ?, updated_at = datetime('now')
			WHERE id = ?`
		)
		.run(
			data.name ?? shelf.name,
			data.description ?? shelf.description,
			data.visibility ?? shelf.visibility,
			id
		);
}

export function deleteShelf(id: string): void {
	getDb().prepare('DELETE FROM shelves WHERE id = ?').run(id);
	log.info('Shelf deleted', { id });
}

export function addBookToShelf(shelfId: string, userBookId: string): void {
	getDb()
		.prepare('INSERT OR IGNORE INTO shelf_books (shelf_id, user_book_id) VALUES (?, ?)')
		.run(shelfId, userBookId);
}

export function removeBookFromShelf(shelfId: string, userBookId: string): void {
	getDb()
		.prepare('DELETE FROM shelf_books WHERE shelf_id = ? AND user_book_id = ?')
		.run(shelfId, userBookId);
}

export function getShelfBooks(shelfId: string): string[] {
	return (
		getDb().prepare('SELECT user_book_id FROM shelf_books WHERE shelf_id = ?').all(shelfId) as {
			user_book_id: string;
		}[]
	).map((r) => r.user_book_id);
}

export function getShelvesForUserBook(userBookId: string): Shelf[] {
	return getDb()
		.prepare(
			`SELECT s.* FROM shelves s
			JOIN shelf_books sb ON sb.shelf_id = s.id
			WHERE sb.user_book_id = ?
			ORDER BY s.sort_order`
		)
		.all(userBookId) as Shelf[];
}
