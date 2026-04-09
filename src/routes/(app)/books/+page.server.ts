import type { PageServerLoad } from './$types';
import { getUserBooks, getUserBookCount } from '$lib/server/db/library';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = locals.user!;
	const statusCategory = url.searchParams.get('status') || undefined;

	const books = getUserBooks(user.id, { statusCategory, limit: 50 });
	const counts = {
		all: getUserBookCount(user.id),
		planned: getUserBookCount(user.id, 'planned'),
		active: getUserBookCount(user.id, 'active'),
		paused: getUserBookCount(user.id, 'paused'),
		completed: getUserBookCount(user.id, 'completed'),
		dropped: getUserBookCount(user.id, 'dropped')
	};

	return { books, counts, currentFilter: statusCategory || 'all' };
};
