import type { PageServerLoad } from './$types';
import { getUserBooks, getUserBookCount, type BookSortOption } from '$lib/server/db/library';

const PAGE_SIZE = 24;
const VALID_SORTS: BookSortOption[] = ['added_desc', 'added_asc', 'title_asc', 'title_desc', 'author_asc', 'author_desc'];

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = locals.user!;
	const statusCategory = url.searchParams.get('status') || undefined;
	const search = url.searchParams.get('q') || undefined;
	const sortParam = url.searchParams.get('sort') || 'added_desc';
	const sort = VALID_SORTS.includes(sortParam as BookSortOption) ? (sortParam as BookSortOption) : 'added_desc';
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
	const offset = (page - 1) * PAGE_SIZE;

	const books = getUserBooks(user.id, {
		statusCategory,
		search,
		sort,
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
		currentSort: sort,
		search: search || '',
		page,
		totalPages
	};
};
