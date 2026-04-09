import type { Author } from '$lib/types';
import {
	createBook,
	getBookById,
	addTitleTranslation,
	getTranslatedTitle,
	getTitleTranslations
} from '../db/books';
import { getOrCreateAuthor, linkAuthorToBook, getAuthorsForBook } from '../db/authors';
import { indexBook } from '../db/search';
import { fetchCoverForBook } from './cover-fetcher';
import { createLogger } from '../utils/logger';

const log = createLogger('book-service');

export interface AddBookInput {
	original_title: string;
	original_language?: string;
	description?: string | null;
	cover_url?: string | null;
	authors: string[];
	translations?: { language_code: string; title: string }[];
}

export interface BookForDisplay {
	id: string;
	original_title: string;
	display_title: string;
	original_language: string;
	description: string | null;
	cover_url: string | null;
	authors: Author[];
	created_at: string;
	updated_at: string;
}

export function addBook(input: AddBookInput): string {
	const bookId = createBook({
		original_title: input.original_title,
		original_language: input.original_language,
		description: input.description,
		cover_url: input.cover_url
	});

	// Link authors
	const authorNames: string[] = [];
	for (let i = 0; i < input.authors.length; i++) {
		const name = input.authors[i].trim();
		if (!name) continue;
		const authorId = getOrCreateAuthor(name);
		linkAuthorToBook(bookId, authorId, i);
		authorNames.push(name);
	}

	// Add translations
	const titles = [input.original_title];
	if (input.translations) {
		for (const t of input.translations) {
			addTitleTranslation(bookId, t.language_code, t.title);
			titles.push(t.title);
		}
	}

	// Index for search
	indexBook(bookId, titles, authorNames);

	log.info('Book added', { bookId, title: input.original_title });

	// Fetch cover in background if not provided
	if (!input.cover_url) {
		fetchCoverForBook(bookId);
	}

	return bookId;
}

export function getBookForDisplay(bookId: string, userLanguage: string): BookForDisplay | null {
	const book = getBookById(bookId);
	if (!book) return null;

	const authors = getAuthorsForBook(bookId);
	const translatedTitle = getTranslatedTitle(bookId, userLanguage);

	return {
		id: book.id,
		original_title: book.original_title,
		display_title: translatedTitle || book.original_title,
		original_language: book.original_language,
		description: book.description,
		cover_url: book.cover_url,
		authors,
		created_at: book.created_at,
		updated_at: book.updated_at
	};
}

export function reindexBook(bookId: string): void {
	const book = getBookById(bookId);
	if (!book) return;

	const authors = getAuthorsForBook(bookId);
	const authorNames = authors.map((a) => a.name);

	const translations = getTitleTranslations(bookId);
	const titles = [book.original_title, ...translations.map((t) => t.translated_title)];

	indexBook(bookId, titles, authorNames);
}
