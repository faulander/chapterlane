import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getBookForDisplay } from '$lib/server/services/book-service';
import {
	getUserBook,
	addBookToLibrary,
	removeFromLibrary,
	updateUserBook
} from '$lib/server/db/library';
import { getStatusesForUser, setBookStatus } from '$lib/server/db/statuses';
import { getTitleTranslations } from '$lib/server/db/books';
import {
	getUserShelves,
	addBookToShelf,
	removeBookFromShelf,
	getShelvesForUserBook
} from '$lib/server/db/shelves';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = locals.user!;
	const book = getBookForDisplay(params.id, user.preferred_language);

	if (!book) {
		throw error(404, 'Book not found');
	}

	const userBook = getUserBook(user.id, params.id);
	const statuses = getStatusesForUser(user.id);
	const translations = getTitleTranslations(params.id);
	const shelves = getUserShelves(user.id);
	const bookShelves = userBook ? getShelvesForUserBook(userBook.id) : [];

	return { book, userBook, statuses, translations, shelves, bookShelves };
};

export const actions: Actions = {
	addToLibrary: async ({ params, locals }) => {
		const user = locals.user!;
		const existing = getUserBook(user.id, params.id);
		if (existing) return fail(400, { error: 'Already in library' });
		addBookToLibrary(user.id, params.id);
	},

	removeFromLibrary: async ({ params, locals }) => {
		const user = locals.user!;
		removeFromLibrary(user.id, params.id);
	},

	setStatus: async ({ request, params, locals }) => {
		const user = locals.user!;
		const data = await request.formData();
		const statusId = data.get('status_id') as string;
		if (!statusId) return fail(400, { error: 'Status is required' });

		const userBook = getUserBook(user.id, params.id);
		if (!userBook) return fail(400, { error: 'Book not in library' });

		setBookStatus(userBook.id, statusId);
	},

	updateDates: async ({ request, params, locals }) => {
		const user = locals.user!;
		const data = await request.formData();
		const startedAt = (data.get('started_at') as string) || null;
		const finishedAt = (data.get('finished_at') as string) || null;

		const userBook = getUserBook(user.id, params.id);
		if (!userBook) return fail(400, { error: 'Book not in library' });

		updateUserBook(userBook.id, { started_at: startedAt, finished_at: finishedAt });
	},

	addToShelf: async ({ request, params, locals }) => {
		const user = locals.user!;
		const data = await request.formData();
		const shelfId = data.get('shelf_id') as string;
		if (!shelfId) return fail(400, { error: 'Shelf is required' });

		const userBook = getUserBook(user.id, params.id);
		if (!userBook) return fail(400, { error: 'Book not in library' });

		addBookToShelf(shelfId, userBook.id);
	},

	removeFromShelf: async ({ request, params, locals }) => {
		const user = locals.user!;
		const data = await request.formData();
		const shelfId = data.get('shelf_id') as string;

		const userBook = getUserBook(user.id, params.id);
		if (!userBook) return fail(400, { error: 'Book not in library' });

		removeBookFromShelf(shelfId, userBook.id);
	}
};
