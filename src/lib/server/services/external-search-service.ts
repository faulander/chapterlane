import { searchGoogleBooks } from './google-books';
import { searchFTS } from '../db/search';
import { getBookById } from '../db/books';
import { findBookByExternalRef } from '../db/books';
import { getAuthorsForBook } from '../db/authors';
import { getUserBook } from '../db/library';
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
	inLibrary: boolean;
	existingBookId: string | null;
	externalId: string | null;
	pageCount: number | null;
}

function normalizeForDedup(s: string): string {
	return s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}

export interface SearchQuery {
	title: string;
	author: string;
}

export async function searchBooks(query: SearchQuery, userId?: string): Promise<SearchResult[]> {
	const results: SearchResult[] = [];
	const seenIds = new Set<string>();
	const seenTitles = new Set<string>();

	// Build FTS query from title + author
	const ftsQuery = [query.title, query.author].filter(Boolean).join(' ');
	if (!ftsQuery.trim()) return results;

	// 1. Internal FTS search
	const internalResults = searchFTS(ftsQuery, 10);
	for (const ir of internalResults) {
		if (seenIds.has(ir.book_id)) continue;
		seenIds.add(ir.book_id);

		const book = getBookById(ir.book_id);
		if (!book) continue;

		const inLibrary = userId ? !!getUserBook(userId, ir.book_id) : true;
		const authors = getAuthorsForBook(ir.book_id);
		seenTitles.add(normalizeForDedup(book.original_title));
		results.push({
			id: ir.book_id,
			title: book.original_title,
			authors: authors.map((a) => a.name),
			language: book.original_language,
			description: book.description,
			coverUrl: book.cover_url,
			source: 'internal',
			inLibrary,
			existingBookId: ir.book_id,
			externalId: null,
			pageCount: null
		});
	}

	// 2. Google Books search with structured intitle:/inauthor: query
	const googleQuery = [
		query.title ? `intitle:${query.title}` : '',
		query.author ? `inauthor:${query.author}` : ''
	].filter(Boolean).join('+');
	const googleResults = await searchGoogleBooks(googleQuery);
	for (const gr of googleResults) {
		// Check if already in catalog via external ref
		const existingBookId = findBookByExternalRef('google_books', gr.googleBooksId);
		if (existingBookId && seenIds.has(existingBookId)) continue;
		if (existingBookId) seenIds.add(existingBookId);

		// If title already shown from internal results, enrich it with Google data
		const normalizedTitle = normalizeForDedup(gr.title);
		if (seenTitles.has(normalizedTitle)) {
			const existing = results.find((r) => normalizeForDedup(r.title) === normalizedTitle);
			if (existing) {
				if (!existing.coverUrl && gr.coverUrl) existing.coverUrl = gr.coverUrl;
				if (!existing.description && gr.description) existing.description = gr.description;
				if (!existing.externalId) existing.externalId = gr.googleBooksId;
			}
			continue;
		}

		const inLibrary = existingBookId && userId ? !!getUserBook(userId, existingBookId) : false;
		results.push({
			id: gr.googleBooksId,
			title: gr.title,
			authors: gr.authors,
			language: gr.language,
			description: gr.description,
			coverUrl: gr.coverUrl,
			source: 'google',
			inLibrary,
			existingBookId: inLibrary ? existingBookId : null,
			externalId: gr.googleBooksId,
			pageCount: gr.pageCount
		});
	}

	log.debug('Search completed', { title: query.title, author: query.author, total: results.length });
	return results;
}
