import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { searchBooks } from '$lib/server/services/external-search-service';
import { addBook } from '$lib/server/services/book-service';
import { addExternalRef, findBookByExternalRef, getBookById, updateBook } from '$lib/server/db/books';
import { addBookToLibrary, getUserBook } from '$lib/server/db/library';
import { fetchCoverForBook } from '$lib/server/services/cover-fetcher';

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = locals.user!;
	const title = url.searchParams.get('title') || '';
	const author = url.searchParams.get('author') || '';
	let results: Awaited<ReturnType<typeof searchBooks>> = [];

	if (title.trim() || author.trim()) {
		results = await searchBooks({ title, author }, user.id);
	}

	return { title, author, results };
};

export const actions: Actions = {
	addFromExternal: async ({ request, locals }) => {
		const user = locals.user!;
		const data = await request.formData();
		const title = (data.get('title') as string) || '';
		const authorsRaw = (data.get('authors') as string) || '';
		const language = (data.get('language') as string) || 'en';
		const description = (data.get('description') as string) || '';
		const coverUrl = (data.get('cover_url') as string) || '';
		const externalId = (data.get('external_id') as string) || '';
		const existingBookId = (data.get('existing_book_id') as string) || '';
		const source = (data.get('source') as string) || 'google_books';

		if (!title) return fail(400, { error: 'Title is required' });

		// Check if already in catalog
		let bookId: string | null = existingBookId || null;
		if (!bookId && externalId) {
			bookId = findBookByExternalRef(source, externalId);
		}

		if (!bookId) {
			const authors = authorsRaw
				.split(',')
				.map((a) => a.trim())
				.filter((a) => a.length > 0);

			bookId = addBook({
				original_title: title,
				original_language: language,
				authors,
				description: description || null,
				cover_url: coverUrl || null
			});

			if (externalId) {
				addExternalRef(bookId, source, externalId);
			}
		}

		// If reusing an existing book without a cover, update it
		const existingBook = getBookById(bookId);
		if (existingBook && !existingBook.cover_url && coverUrl) {
			updateBook(bookId, { cover_url: coverUrl });
		}

		// Add to user's library if not already there
		const existing = getUserBook(user.id, bookId);
		if (!existing) {
			addBookToLibrary(user.id, bookId);
		}

		if (!existingBook?.cover_url && !coverUrl) {
			fetchCoverForBook(bookId);
		}

		throw redirect(302, `/books/${bookId}`);
	}
};
