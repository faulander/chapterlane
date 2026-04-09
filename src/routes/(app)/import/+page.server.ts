import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { startImport } from '$lib/server/services/import-service';
import { getUserImportJobs } from '$lib/server/db/imports';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user!;
	const jobs = getUserImportJobs(user.id);
	return { jobs };
};

export const actions: Actions = {
	upload: async ({ request, locals }) => {
		const user = locals.user!;
		const data = await request.formData();
		const source = data.get('source') as string;
		const file = data.get('file') as File;

		if (!source || !['goodreads', 'storygraph', 'calibre'].includes(source)) {
			return fail(400, { error: 'Invalid source' });
		}

		if (!file || file.size === 0) {
			return fail(400, { error: 'File is required' });
		}

		const text = await file.text();
		const jobId = startImport(user.id, source, text);

		throw redirect(302, `/import/${jobId}`);
	}
};
