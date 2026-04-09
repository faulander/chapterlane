import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { logout } from '$lib/server/services/auth-service';

export const actions: Actions = {
	default: async ({ cookies }) => {
		const sessionId = cookies.get('chapterlane_session');
		if (sessionId) {
			logout(sessionId);
		}
		cookies.delete('chapterlane_session', { path: '/' });
		throw redirect(302, '/login');
	}
};
