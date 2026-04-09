import type { Author } from '$lib/types';
import { getDb } from './connection';
import { generateId } from '../utils/crypto';

export function createAuthor(name: string, sortName?: string): string {
	const id = generateId();
	getDb()
		.prepare('INSERT INTO authors (id, name, sort_name) VALUES (?, ?, ?)')
		.run(id, name.trim(), sortName?.trim() || null);
	return id;
}

export function getAuthorById(id: string): Author | null {
	return (getDb().prepare('SELECT * FROM authors WHERE id = ?').get(id) as Author) ?? null;
}

export function findAuthorByName(name: string): Author | null {
	return (
		(getDb()
			.prepare('SELECT * FROM authors WHERE name = ? COLLATE NOCASE')
			.get(name.trim()) as Author) ?? null
	);
}

export function getOrCreateAuthor(name: string): string {
	const existing = findAuthorByName(name);
	if (existing) return existing.id;
	return createAuthor(name);
}

export function getAuthorsForBook(bookId: string): Author[] {
	return getDb()
		.prepare(
			`SELECT a.* FROM authors a
			JOIN book_authors ba ON ba.author_id = a.id
			WHERE ba.book_id = ?
			ORDER BY ba.author_order`
		)
		.all(bookId) as Author[];
}

export function linkAuthorToBook(bookId: string, authorId: string, order: number = 0): void {
	getDb()
		.prepare(
			'INSERT OR IGNORE INTO book_authors (book_id, author_id, author_order) VALUES (?, ?, ?)'
		)
		.run(bookId, authorId, order);
}

export function unlinkAuthorsFromBook(bookId: string): void {
	getDb().prepare('DELETE FROM book_authors WHERE book_id = ?').run(bookId);
}
