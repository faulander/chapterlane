import type { Actions, PageServerLoad } from './$types';
import { updateUser } from '$lib/server/db/users';

export const load: PageServerLoad = async ({ locals }) => {
	return { user: locals.user! };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = locals.user!;
		const data = await request.formData();
		const language = (data.get('preferred_language') as string) || 'en';

		updateUser(user.id, { preferred_language: language });
		return { success: true };
	}
};
