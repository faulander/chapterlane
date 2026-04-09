import type { Actions, PageServerLoad } from './$types';
import { updateUser } from '$lib/server/db/users';

export const load: PageServerLoad = async ({ locals }) => {
	return { user: locals.user! };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = locals.user!;
		const data = await request.formData();

		updateUser(user.id, {
			display_name: (data.get('display_name') as string) || null,
			bio: (data.get('bio') as string) || null,
			avatar_url: (data.get('avatar_url') as string) || null
		});

		return { success: true };
	}
};
