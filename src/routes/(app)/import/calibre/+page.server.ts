import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { existsSync } from 'fs';
import { getCalibreCustomColumns } from '$lib/server/services/parsers/calibre-parser';
import { startCalibreImport } from '$lib/server/services/import-service';

export const load: PageServerLoad = async ({ url }) => {
	const libraryPath = url.searchParams.get('path');
	if (!libraryPath) throw redirect(302, '/import');

	const dbPath = `${libraryPath}/metadata.db`;
	if (!existsSync(dbPath)) throw redirect(302, '/import');

	const columns = getCalibreCustomColumns(dbPath);
	return { libraryPath, columns };
};

export const actions: Actions = {
	confirm: async ({ request, locals }) => {
		const user = locals.user!;
		const data = await request.formData();
		const libraryPath = data.get('library_path') as string;
		const statusColumn = data.get('status_column') as string;

		if (!libraryPath) {
			return fail(400, { error: 'Library path is required' });
		}

		const dbPath = `${libraryPath}/metadata.db`;
		if (!existsSync(dbPath)) {
			return fail(400, { error: 'metadata.db not found at the specified path' });
		}

		const statusColumnId = statusColumn && statusColumn !== 'none' ? parseInt(statusColumn, 10) : null;
		const jobId = startCalibreImport(user.id, libraryPath, statusColumnId);

		throw redirect(302, `/import/${jobId}`);
	}
};
