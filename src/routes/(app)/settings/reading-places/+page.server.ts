import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	getUserReadingPlaces,
	createReadingPlace,
	updateReadingPlace,
	deleteReadingPlace,
	getReadingPlaceById
} from '$lib/server/db/reading-places';
import { validateRequired } from '$lib/server/utils/validation';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user!;
	const places = getUserReadingPlaces(user.id);
	return { places };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const user = locals.user!;
		const data = await request.formData();
		const name = (data.get('name') as string) || '';

		const nameError = validateRequired(name, 'Name');
		if (nameError) return fail(400, { error: nameError });

		createReadingPlace(user.id, name);
	},

	update: async ({ request, locals }) => {
		const data = await request.formData();
		const placeId = data.get('place_id') as string;
		const name = (data.get('name') as string) || '';

		if (!placeId || !name) return fail(400, { error: 'Required fields missing' });

		const place = getReadingPlaceById(placeId);
		if (!place || place.user_id !== locals.user!.id) return fail(403, { error: 'Not authorized' });

		updateReadingPlace(placeId, name);
	},

	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const placeId = data.get('place_id') as string;
		if (!placeId) return fail(400, { error: 'Place ID required' });

		const place = getReadingPlaceById(placeId);
		if (!place || place.user_id !== locals.user!.id) return fail(403, { error: 'Not authorized' });

		deleteReadingPlace(placeId);
	}
};
