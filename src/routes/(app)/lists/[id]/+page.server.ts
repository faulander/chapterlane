import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	getListById,
	updateList,
	getListItems,
	addItemToList,
	removeItemFromList
} from '$lib/server/db/lists';

export const load: PageServerLoad = async ({ params, locals }) => {
	const list = getListById(params.id);
	if (!list || list.user_id !== locals.user!.id) throw error(404, 'List not found');
	const items = getListItems(params.id);
	return { list, items };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const list = getListById(params.id);
		if (!list || list.user_id !== locals.user!.id) return fail(403, { error: 'Not authorized' });

		const data = await request.formData();
		updateList(params.id, {
			title: (data.get('title') as string) || list.title,
			description: (data.get('description') as string) || null,
			visibility: (data.get('visibility') as string) || list.visibility
		});
	},

	addBook: async ({ request, params, locals }) => {
		const list = getListById(params.id);
		if (!list || list.user_id !== locals.user!.id) return fail(403, { error: 'Not authorized' });

		const data = await request.formData();
		const bookId = data.get('book_id') as string;
		const note = (data.get('note') as string) || undefined;
		if (bookId) addItemToList(params.id, bookId, note);
	},

	removeBook: async ({ request, params, locals }) => {
		const list = getListById(params.id);
		if (!list || list.user_id !== locals.user!.id) return fail(403, { error: 'Not authorized' });

		const data = await request.formData();
		const bookId = data.get('book_id') as string;
		if (bookId) removeItemFromList(params.id, bookId);
	}
};
