import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getImportJob, getImportRows, updateImportRow } from '$lib/server/db/imports';
import { executeImport } from '$lib/server/services/import-service';

export const load: PageServerLoad = async ({ params, locals }) => {
	const job = getImportJob(params.jobId);
	if (!job || job.user_id !== locals.user!.id) throw error(404, 'Import not found');
	if (job.status === 'completed') throw redirect(302, `/import/${params.jobId}/summary`);

	const rows = getImportRows(params.jobId);
	return { job, rows };
};

export const actions: Actions = {
	toggleRow: async ({ request, params, locals }) => {
		const job = getImportJob(params.jobId);
		if (!job || job.user_id !== locals.user!.id) return fail(403, { error: 'Not authorized' });

		const data = await request.formData();
		const rowId = data.get('row_id') as string;
		const action = data.get('action') as string;

		if (rowId && (action === 'accept' || action === 'skip')) {
			updateImportRow(rowId, { user_action: action });
		}
	},

	confirm: async ({ params, locals }) => {
		const user = locals.user!;
		const job = getImportJob(params.jobId);
		if (!job || job.user_id !== user.id) return fail(403, { error: 'Not authorized' });

		executeImport(params.jobId, user.id);
		throw redirect(302, `/import/${params.jobId}/summary`);
	}
};
