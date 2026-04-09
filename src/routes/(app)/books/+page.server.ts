import type { Actions, PageServerLoad } from './$types';
import { getUserBooks, getUserBookCount } from '$lib/server/db/library';
import { fetchCoversForUser } from '$lib/server/services/cover-fetcher';

const PAGE_SIZE = 24;

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = locals.user!;
	const statusCategory = url.searchParams.get('status') || undefined;
	const search = url.searchParams.get('q') || undefined;
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
	const offset = (page - 1) * PAGE_SIZE;

	const books = getUserBooks(user.id, {
		statusCategory,
		search,
		limit: PAGE_SIZE,
		offset
	});
	const counts = {
		all: getUserBookCount(user.id, undefined, search),
		planned: getUserBookCount(user.id, 'planned', search),
		active: getUserBookCount(user.id, 'active', search),
		paused: getUserBookCount(user.id, 'paused', search),
		completed: getUserBookCount(user.id, 'completed', search),
		dropped: getUserBookCount(user.id, 'dropped', search)
	};

	const totalForFilter = statusCategory
		? (counts[statusCategory as keyof typeof counts] ?? counts.all)
		: counts.all;
	const totalPages = Math.ceil(totalForFilter / PAGE_SIZE);

	return {
		books,
		counts,
		currentFilter: statusCategory || 'all',
		search: search || '',
		page,
		totalPages
	};
};

export const actions: Actions = {
	fetchCovers: async ({ locals }) => {
		const fetched = await fetchCoversForUser(locals.user!.id);
		return { coversFetched: fetched };
	}
};
