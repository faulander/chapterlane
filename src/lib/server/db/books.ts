import type { Book, BookTitleTranslation, ExternalBookRef } from '$lib/types';
import { getDb } from './connection';
import { generateId } from '../utils/crypto';

export function createBook(data: {
	id?: string;
	original_title: string;
	original_language?: string;
	description?: string | null;
	cover_url?: string | null;
}): string {
	const id = data.id || generateId();
	getDb()
		.prepare(
			`INSERT INTO books (id, original_title, original_language, description, cover_url)
			VALUES (?, ?, ?, ?, ?)`
		)
		.run(
			id,
			data.original_title,
			data.original_language || 'en',
			data.description || null,
			data.cover_url || null
		);
	return id;
}

export function getBookById(id: string): Book | null {
	return (getDb().prepare('SELECT * FROM books WHERE id = ?').get(id) as Book) ?? null;
}

export function updateBook(
	id: string,
	data: {
		original_title?: string;
		original_language?: string;
		description?: string | null;
		cover_url?: string | null;
	}
): void {
	const book = getBookById(id);
	if (!book) return;

	getDb()
		.prepare(
			`UPDATE books SET original_title = ?, original_language = ?, description = ?, cover_url = ?,
			updated_at = datetime('now') WHERE id = ?`
		)
		.run(
			data.original_title ?? book.original_title,
			data.original_language ?? book.original_language,
			data.description !== undefined ? data.description : book.description,
			data.cover_url !== undefined ? data.cover_url : book.cover_url,
			id
		);
}

export function deleteBook(id: string): void {
	getDb().prepare('DELETE FROM books WHERE id = ?').run(id);
}

export function addTitleTranslation(
	bookId: string,
	languageCode: string,
	translatedTitle: string
): string {
	const id = generateId();
	getDb()
		.prepare(
			`INSERT INTO book_title_translations (id, book_id, language_code, translated_title)
			VALUES (?, ?, ?, ?)
			ON CONFLICT(book_id, language_code) DO UPDATE SET translated_title = excluded.translated_title`
		)
		.run(id, bookId, languageCode, translatedTitle);
	return id;
}

export function getTitleTranslations(bookId: string): BookTitleTranslation[] {
	return getDb()
		.prepare('SELECT * FROM book_title_translations WHERE book_id = ?')
		.all(bookId) as BookTitleTranslation[];
}

export function getTranslatedTitle(bookId: string, languageCode: string): string | null {
	const row = getDb()
		.prepare(
			'SELECT translated_title FROM book_title_translations WHERE book_id = ? AND language_code = ?'
		)
		.get(bookId, languageCode) as { translated_title: string } | undefined;
	return row?.translated_title ?? null;
}

export function addExternalRef(bookId: string, source: string, externalId: string): string {
	const id = generateId();
	getDb()
		.prepare(
			`INSERT OR IGNORE INTO external_book_refs (id, book_id, source, external_id)
			VALUES (?, ?, ?, ?)`
		)
		.run(id, bookId, source, externalId);
	return id;
}

export function findBookByExternalRef(source: string, externalId: string): string | null {
	const row = getDb()
		.prepare('SELECT book_id FROM external_book_refs WHERE source = ? AND external_id = ?')
		.get(source, externalId) as { book_id: string } | undefined;
	return row?.book_id ?? null;
}

export function getExternalRefs(bookId: string): ExternalBookRef[] {
	return getDb()
		.prepare('SELECT * FROM external_book_refs WHERE book_id = ?')
		.all(bookId) as ExternalBookRef[];
}
