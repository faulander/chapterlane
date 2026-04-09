import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getUserBooks } from '$lib/server/db/library';
import { getUserReadingPlaces } from '$lib/server/db/reading-places';
import { logProgress } from '$lib/server/services/progress-service';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user!;
	const books = getUserBooks(user.id, { statusCategory: 'active' });
	const readingPlaces = getUserReadingPlaces(user.id);
	return { books, readingPlaces };
};

export const actions: Actions = {
	logProgress: async ({ request }) => {
		const data = await request.formData();
		const userBookId = data.get('user_book_id') as string;
		const page = data.get('page') as string;
		const percent = data.get('percent') as string;
		const readingPlaceId = (data.get('reading_place_id') as string) || null;
		const note = (data.get('note') as string) || null;

		if (!userBookId) return fail(400, { error: 'Book required' });

		const result = logProgress({
			userBookId,
			page: page ? parseInt(page, 10) : null,
			percent: percent ? parseFloat(percent) : null,
			readingPlaceId,
			note
		});

		if (!result.success) return fail(400, { error: result.error });
	}
};
