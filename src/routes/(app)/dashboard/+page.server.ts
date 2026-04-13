import type { PageServerLoad } from './$types';
import { getFeedForUser, getUserEvents } from '$lib/server/db/feed';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();
	let feed = getFeedForUser(user.id);
	let ownFeed = false;
	if (feed.length === 0) {
		feed = getUserEvents(user.id);
		ownFeed = true;
	}
	return { user, feed, ownFeed };
};
