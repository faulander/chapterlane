import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getBookForDisplay } from '$lib/server/services/book-service';
import { getUserBook } from '$lib/server/db/library';
import { getStatusesForUser } from '$lib/server/db/statuses';
import { getTitleTranslations } from '$lib/server/db/books';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = locals.user!;
	const book = getBookForDisplay(params.id, user.preferred_language);

	if (!book) {
		throw error(404, 'Book not found');
	}

	const userBook = getUserBook(user.id, params.id);
	const statuses = getStatusesForUser(user.id);
	const translations = getTitleTranslations(params.id);

	return {
		book,
		userBook,
		statuses,
		translations
	};
};
