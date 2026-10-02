import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getFeedForUser, getUserEvents } from '$lib/server/db/feed';
import { groupFeedEvents } from '$lib/utils/feed-groups';
import { getUserBooks } from '$lib/server/db/library';
import { getStatusesForUser } from '$lib/server/db/statuses';
import { getFriends } from '$lib/server/db/friends';
import { getSoloStats } from '$lib/server/db/dashboard-stats';
import { setYearlyBookGoal } from '$lib/server/db/users';

// Raw events fetched before grouping; many progress updates collapse into few rows.
const FEED_EVENT_LIMIT = 150;
// Rows shown initially and added by each "Show more".
const FEED_PAGE_SIZE = 10;

export const load: PageServerLoad = async ({ parent, url }) => {
	const { user } = await parent();
	let events = getFeedForUser(user.id, FEED_EVENT_LIMIT);
	let ownFeed = false;
	if (events.length === 0) {
		events = getUserEvents(user.id, FEED_EVENT_LIMIT);
		ownFeed = true;
	}

	const groups = groupFeedEvents(events);
	const requested = Number.parseInt(url.searchParams.get('feed') ?? '', 10);
	const feedLimit = Number.isSafeInteger(requested)
		? Math.max(FEED_PAGE_SIZE, Math.min(requested, FEED_EVENT_LIMIT))
		: FEED_PAGE_SIZE;
	const activeBooks = getUserBooks(user.id, { statusCategory: 'active' });
	const statuses = getStatusesForUser(user.id);

	return {
		user,
		feed: groups.slice(0, feedLimit),
		ownFeed,
		showMore:
			groups.length > feedLimit
				? {
						nextLimit: feedLimit + FEED_PAGE_SIZE,
						count: Math.min(FEED_PAGE_SIZE, groups.length - feedLimit)
					}
				: null,
		activeBooks,
		statuses,
		// Friends get a social feed; everyone else gets a personal summary.
		solo: getFriends(user.id).length === 0 ? getSoloStats(user.id, user.yearly_book_goal) : null
	};
};

export const actions: Actions = {
	setGoal: async ({ request, locals }) => {
		const raw = String((await request.formData()).get('goal') ?? '').trim();
		if (raw === '') {
			setYearlyBookGoal(locals.user!.id, null);
			return { goalSaved: true };
		}
		const goal = Number(raw);
		if (!Number.isInteger(goal) || goal < 1 || goal > 1000) {
			return fail(400, { goalError: true });
		}
		setYearlyBookGoal(locals.user!.id, goal);
		return { goalSaved: true };
	}
};
