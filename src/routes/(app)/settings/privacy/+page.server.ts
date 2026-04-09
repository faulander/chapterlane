import type { Actions, PageServerLoad } from './$types';
import { updateUser } from '$lib/server/db/users';

export const load: PageServerLoad = async ({ locals }) => {
	return { user: locals.user! };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = locals.user!;
		const data = await request.formData();
		const visibility = (data.get('profile_visibility') as string) || 'public';

		updateUser(user.id, { profile_visibility: visibility });
		return { success: true };
	}
};
