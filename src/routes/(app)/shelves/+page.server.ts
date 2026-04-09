import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getUserShelvesWithCounts, createShelf, deleteShelf } from '$lib/server/db/shelves';
import { validateRequired } from '$lib/server/utils/validation';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user!;
	const shelves = getUserShelvesWithCounts(user.id);
	return { shelves };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const user = locals.user!;
		const data = await request.formData();
		const name = (data.get('name') as string) || '';
		const description = (data.get('description') as string) || '';
		const visibility = (data.get('visibility') as string) || 'private';

		const nameError = validateRequired(name, 'Name');
		if (nameError) return fail(400, { error: nameError, name, description });

		createShelf(user.id, name.trim(), description.trim() || null, visibility);
	},

	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const shelfId = data.get('shelf_id') as string;
		if (!shelfId) return fail(400, { error: 'Shelf ID required' });

		const { getShelfById } = await import('$lib/server/db/shelves');
		const shelf = getShelfById(shelfId);
		if (!shelf || shelf.user_id !== locals.user!.id) {
			return fail(403, { error: 'Not authorized' });
		}

		deleteShelf(shelfId);
	}
};
