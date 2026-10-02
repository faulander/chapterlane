import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	createDeviceToken,
	listDeviceTokens,
	revokeDeviceToken
} from '$lib/server/db/device-tokens';

export const load: PageServerLoad = ({ locals }) => ({ tokens: listDeviceTokens(locals.user!.id) });

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const name = String((await request.formData()).get('name') ?? '').trim();
		if (!name || name.length > 80) return fail(400, { error: 'Name must be 1–80 characters' });
		return { token: createDeviceToken(locals.user!.id, name) };
	},
	revoke: async ({ request, locals }) => {
		const id = String((await request.formData()).get('id') ?? '');
		if (!id) return fail(400, { error: 'Token ID required' });
		revokeDeviceToken(locals.user!.id, id);
		return { revoked: true };
	}
};
