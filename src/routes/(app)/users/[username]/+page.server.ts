import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserByUsername } from '$lib/server/db/users';
import { isFriend, isBlocked } from '$lib/server/db/friends';
import { getUserEvents } from '$lib/server/db/feed';
import { getUserBookCount } from '$lib/server/db/library';

export const load: PageServerLoad = async ({ params, locals }) => {
	const viewer = locals.user!;
	const profile = getUserByUsername(params.username);

	if (!profile) throw error(404, 'User not found');
	if (isBlocked(profile.id, viewer.id)) throw error(404, 'User not found');

	const isOwner = viewer.id === profile.id;
	const areFriends = isFriend(viewer.id, profile.id);

	const canSeeActivity =
		isOwner ||
		profile.profile_visibility === 'public' ||
		(profile.profile_visibility === 'friends' && areFriends);

	const activity = canSeeActivity ? getUserEvents(profile.id, 10) : [];
	const bookCount = getUserBookCount(profile.id);

	return {
		profile: {
			id: profile.id,
			username: profile.username,
			display_name: profile.display_name,
			avatar_url: profile.avatar_url,
			bio: profile.bio,
			created_at: profile.created_at
		},
		isOwner,
		areFriends,
		activity,
		bookCount
	};
};
