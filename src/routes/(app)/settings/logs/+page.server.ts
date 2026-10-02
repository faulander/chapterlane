import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { LOG_LEVELS, canViewLogs, listLogs, type LogLevel } from '$lib/server/db/app-logs';

export const load: PageServerLoad = ({ locals, url }) => {
	if (!canViewLogs(locals.user!.id)) throw error(403, 'Forbidden');

	const requestedLevel = url.searchParams.get('level') as LogLevel;
	const level = LOG_LEVELS.includes(requestedLevel) ? requestedLevel : 'info';
	const before = Number.parseInt(url.searchParams.get('before') ?? '', 10);
	const filters = {
		level,
		module: url.searchParams.get('module') ?? '',
		search: (url.searchParams.get('q') ?? '').trim().slice(0, 200)
	};

	return {
		filters,
		levels: LOG_LEVELS,
		...listLogs({ ...filters, before: Number.isSafeInteger(before) && before > 0 ? before : null })
	};
};
