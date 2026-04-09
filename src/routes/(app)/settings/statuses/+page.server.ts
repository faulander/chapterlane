import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	getStatusesForUser,
	createCustomStatus,
	updateCustomStatus,
	deleteCustomStatus
} from '$lib/server/db/statuses';
import { validateRequired } from '$lib/server/utils/validation';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user!;
	const statuses = getStatusesForUser(user.id);
	return { statuses };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const user = locals.user!;
		const data = await request.formData();
		const label = (data.get('label') as string) || '';
		const systemCategory = (data.get('system_category') as string) || '';

		const labelError = validateRequired(label, 'Label');
		if (labelError) return fail(400, { error: labelError });

		const validCategories = ['planned', 'active', 'paused', 'completed', 'dropped'];
		if (!validCategories.includes(systemCategory)) {
			return fail(400, { error: 'Invalid category' });
		}

		createCustomStatus(user.id, label.trim(), systemCategory);
	},

	update: async ({ request }) => {
		const data = await request.formData();
		const statusId = data.get('status_id') as string;
		const label = (data.get('label') as string) || '';
		const systemCategory = (data.get('system_category') as string) || '';

		if (!statusId) return fail(400, { error: 'Status ID required' });

		updateCustomStatus(statusId, { label: label.trim(), system_category: systemCategory });
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const statusId = data.get('status_id') as string;
		if (!statusId) return fail(400, { error: 'Status ID required' });

		deleteCustomStatus(statusId);
	}
};
