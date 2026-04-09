import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getUserLists, createList, deleteList, getListById } from '$lib/server/db/lists';
import { validateRequired } from '$lib/server/utils/validation';

export const load: PageServerLoad = async ({ locals }) => {
	const lists = getUserLists(locals.user!.id);
	return { lists };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const data = await request.formData();
		const title = (data.get('title') as string) || '';
		const description = (data.get('description') as string) || '';
		const visibility = (data.get('visibility') as string) || 'private';

		const titleError = validateRequired(title, 'Title');
		if (titleError) return fail(400, { error: titleError });

		createList(locals.user!.id, title.trim(), description.trim() || null, visibility);
	},

	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const listId = data.get('list_id') as string;
		const list = getListById(listId);
		if (!list || list.user_id !== locals.user!.id) return fail(403, { error: 'Not authorized' });
		deleteList(listId);
	}
};
