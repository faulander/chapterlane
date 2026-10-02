import type { PageServerLoad } from './$types';
import { getFeedForUser, getUserEvents } from '$lib/server/db/feed';
import { getUserBooks } from '$lib/server/db/library';
import { getStatusesForUser } from '$lib/server/db/statuses';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();
	let feed = getFeedForUser(user.id);
	let ownFeed = false;
	if (feed.length === 0) {
		feed = getUserEvents(user.id);
		ownFeed = true;
	}

	const activeBooks = getUserBooks(user.id, { statusCategory: 'active' });
	const statuses = getStatusesForUser(user.id);

	return { user, feed, ownFeed, activeBooks, statuses };
};
