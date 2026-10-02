import type { PageServerLoad } from './$types';
import { canViewLogs } from '$lib/server/db/app-logs';

export const load: PageServerLoad = ({ locals }) => ({
	canViewLogs: canViewLogs(locals.user!.id)
});
