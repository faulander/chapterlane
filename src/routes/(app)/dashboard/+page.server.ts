import type { PageServerLoad } from './$types';
import { getFeedForUser } from '$lib/server/db/feed';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();
	const feed = getFeedForUser(user.id);
	return { user, feed };
};
