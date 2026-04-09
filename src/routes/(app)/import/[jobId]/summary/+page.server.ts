import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getImportJob, getImportRows } from '$lib/server/db/imports';

export const load: PageServerLoad = async ({ params, locals }) => {
	const job = getImportJob(params.jobId);
	if (!job || job.user_id !== locals.user!.id) throw error(404, 'Import not found');

	const rows = getImportRows(params.jobId);
	const imported = rows.filter((r) => r.import_result === 'imported').length;
	const skipped = rows.filter((r) => r.import_result === 'skipped').length;
	const errors = rows.filter((r) => r.import_result === 'error').length;

	return { job, imported, skipped, errors };
};
