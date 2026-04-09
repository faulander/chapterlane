import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	getShelfById,
	updateShelf,
	getShelfBooks,
	removeBookFromShelf
} from '$lib/server/db/shelves';
import { getUserBookById } from '$lib/server/db/library';
import { getBookForDisplay } from '$lib/server/services/book-service';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = locals.user!;
	const shelf = getShelfById(params.id);

	if (!shelf || shelf.user_id !== user.id) {
		throw error(404, 'Shelf not found');
	}

	const userBookIds = getShelfBooks(params.id);
	const books = userBookIds
		.map((ubId) => {
			const ub = getUserBookById(ubId);
			if (!ub) return null;
			const book = getBookForDisplay(ub.book_id, user.preferred_language);
			if (!book) return null;
			return { ...book, userBookId: ub.id };
		})
		.filter((b) => b !== null);

	return { shelf, books };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const shelf = getShelfById(params.id);
		if (!shelf || shelf.user_id !== locals.user!.id) {
			return fail(403, { error: 'Not authorized' });
		}

		const data = await request.formData();
		const name = (data.get('name') as string) || shelf.name;
		const description = (data.get('description') as string) || null;
		const visibility = (data.get('visibility') as string) || shelf.visibility;

		updateShelf(params.id, { name, description, visibility });
	},

	removeBook: async ({ request, params, locals }) => {
		const shelf = getShelfById(params.id);
		if (!shelf || shelf.user_id !== locals.user!.id) {
			return fail(403, { error: 'Not authorized' });
		}

		const data = await request.formData();
		const userBookId = data.get('user_book_id') as string;
		if (userBookId) removeBookFromShelf(params.id, userBookId);
	}
};
