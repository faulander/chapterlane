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
import { getProgressHistory } from '$lib/server/db/progress';
import { getUserReadingPlaces } from '$lib/server/db/reading-places';
import { logProgress } from '$lib/server/services/progress-service';
import { emitStatusChanged, emitBookCompleted, emitEvent } from '$lib/server/services/feed-service';
import { getBookById } from '$lib/server/db/books';

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
	const progressHistory = userBook ? getProgressHistory(userBook.id) : [];
	const readingPlaces = getUserReadingPlaces(user.id);

	return {
		book,
		userBook,
		statuses,
		translations,
		shelves,
		bookShelves,
		progressHistory,
		readingPlaces
	};
};

export const actions: Actions = {
	addToLibrary: async ({ params, locals }) => {
		const user = locals.user!;
		const existing = getUserBook(user.id, params.id);
		if (existing) return fail(400, { error: 'Already in library' });
		const userBookId = addBookToLibrary(user.id, params.id);
		const book = getBookById(params.id);
		if (book && userBookId) {
			emitEvent(user.id, 'book_added', 'user_book', userBookId, 'public', {
				book_id: params.id,
				book_title: book.original_title
			});
		}
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

		const status = getStatusesForUser(user.id).find((s) => s.id === statusId);
		const book = getBookById(params.id);
		if (status && book) {
			if (status.system_category === 'active') {
				emitEvent(user.id, 'book_started', 'user_book', userBook.id, 'public', {
					book_id: params.id,
					book_title: book.original_title
				});
			} else if (status.system_category === 'completed') {
				emitBookCompleted(user.id, userBook.id, params.id, book.original_title);
			} else {
				emitStatusChanged(user.id, userBook.id, params.id, book.original_title, status.label);
			}
		}
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

	logProgress: async ({ request, params, locals }) => {
		const user = locals.user!;
		const data = await request.formData();
		const page = data.get('page') as string;
		const percent = data.get('percent') as string;
		const readingPlaceId = (data.get('reading_place_id') as string) || null;
		const note = (data.get('note') as string) || null;

		const userBook = getUserBook(user.id, params.id);
		if (!userBook) return fail(400, { error: 'Book not in library' });

		const result = logProgress({
			userBookId: userBook.id,
			page: page ? parseInt(page, 10) : null,
			percent: percent ? parseFloat(percent) : null,
			readingPlaceId,
			note
		});

		if (!result.success) return fail(400, { error: result.error });
	},

	updateTotalPages: async ({ request, params, locals }) => {
		const user = locals.user!;
		const data = await request.formData();
		const totalPages = data.get('total_pages') as string;

		const userBook = getUserBook(user.id, params.id);
		if (!userBook) return fail(400, { error: 'Book not in library' });

		updateUserBook(userBook.id, {
			user_total_pages: totalPages ? parseInt(totalPages, 10) : null
		});
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
