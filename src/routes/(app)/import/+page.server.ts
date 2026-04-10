import { fail, redirect } from '@sveltejs/kit';
import { existsSync } from 'fs';
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

		if (!source || !['goodreads', 'storygraph'].includes(source)) {
			return fail(400, { error: 'Invalid source' });
		}

		if (!file || file.size === 0) {
			return fail(400, { error: 'File is required' });
		}

		const text = await file.text();
		const jobId = startImport(user.id, source, text);

		throw redirect(302, `/import/${jobId}`);
	},

	calibre: async ({ request, locals }) => {
		const user = locals.user!;
		const data = await request.formData();
		const calibrePath = (data.get('calibre_path') as string)?.trim();

		if (!calibrePath) {
			return fail(400, { error: 'Library path is required' });
		}

		const dbPath = `${calibrePath}/metadata.db`;
		if (!existsSync(dbPath)) {
			return fail(400, { error: `metadata.db not found at ${calibrePath}` });
		}

		throw redirect(302, `/import/calibre?path=${encodeURIComponent(calibrePath)}`);
	}
};
