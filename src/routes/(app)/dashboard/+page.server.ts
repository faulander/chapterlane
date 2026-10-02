import type { PageServerLoad } from './$types';
import { getFeedForUser, getUserEvents } from '$lib/server/db/feed';
import { groupFeedEvents } from '$lib/utils/feed-groups';
import { getUserBooks } from '$lib/server/db/library';
import { getStatusesForUser } from '$lib/server/db/statuses';

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
		statuses
	};
};
