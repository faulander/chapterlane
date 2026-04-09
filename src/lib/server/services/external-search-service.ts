import { searchGoogleBooks } from './google-books';
import { searchFTS } from '../db/search';
import { getBookById } from '../db/books';
import { findBookByExternalRef } from '../db/books';
import { getAuthorsForBook } from '../db/authors';
import { createLogger } from '../utils/logger';

const log = createLogger('external-search');

export interface SearchResult {
	id: string;
	title: string;
	authors: string[];
	language: string;
	description: string | null;
	coverUrl: string | null;
	source: 'internal' | 'google';
	inCatalog: boolean;
	existingBookId: string | null;
	externalId: string | null;
	pageCount: number | null;
}

export async function searchBooks(query: string): Promise<SearchResult[]> {
	const results: SearchResult[] = [];
	const seenIds = new Set<string>();

	// 1. Internal FTS search
	const internalResults = searchFTS(query, 10);
	for (const ir of internalResults) {
		if (seenIds.has(ir.book_id)) continue;
		seenIds.add(ir.book_id);

		const book = getBookById(ir.book_id);
		if (!book) continue;

		const authors = getAuthorsForBook(ir.book_id);
		results.push({
			id: ir.book_id,
			title: book.original_title,
			authors: authors.map((a) => a.name),
			language: book.original_language,
			description: book.description,
			coverUrl: book.cover_url,
			source: 'internal',
			inCatalog: true,
			existingBookId: ir.book_id,
			externalId: null,
			pageCount: null
		});
	}

	// 2. Google Books search
	const googleResults = await searchGoogleBooks(query);
	for (const gr of googleResults) {
		// Check if already in catalog via external ref
		const existingBookId = findBookByExternalRef('google_books', gr.googleBooksId);
		if (existingBookId && seenIds.has(existingBookId)) continue;
		if (existingBookId) seenIds.add(existingBookId);

		results.push({
			id: gr.googleBooksId,
			title: gr.title,
			authors: gr.authors,
			language: gr.language,
			description: gr.description,
			coverUrl: gr.coverUrl,
			source: 'google',
			inCatalog: !!existingBookId,
			existingBookId,
			externalId: gr.googleBooksId,
			pageCount: gr.pageCount
		});
	}

	log.debug('Search completed', { query, total: results.length });
	return results;
}
