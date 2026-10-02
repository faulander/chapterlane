import type { PageServerLoad } from './$types';
import { getFeedForUser, getUserEvents } from '$lib/server/db/feed';
import { groupFeedEvents } from '$lib/utils/feed-groups';
import { getUserBooks } from '$lib/server/db/library';
import { getStatusesForUser } from '$lib/server/db/statuses';

// Raw events fetched before grouping; many progress updates collapse into few rows.
const FEED_EVENT_LIMIT = 150;

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();
	let events = getFeedForUser(user.id, FEED_EVENT_LIMIT);
	let ownFeed = false;
	if (events.length === 0) {
		events = getUserEvents(user.id, FEED_EVENT_LIMIT);
		ownFeed = true;
	}

	const feed = groupFeedEvents(events);
	const activeBooks = getUserBooks(user.id, { statusCategory: 'active' });
	const statuses = getStatusesForUser(user.id);

	return { user, feed, ownFeed, activeBooks, statuses };
};
