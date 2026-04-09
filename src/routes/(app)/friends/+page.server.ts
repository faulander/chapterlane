import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	getFriends,
	getPendingRequests,
	sendFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	removeFriend,
	searchUsers
} from '$lib/server/db/friends';
import { getUserByUsername } from '$lib/server/db/users';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = locals.user!;
	const friends = getFriends(user.id);
	const pending = getPendingRequests(user.id);
	const searchQuery = url.searchParams.get('q') || '';
	const searchResults = searchQuery ? searchUsers(searchQuery, user.id) : [];

	return { friends, pending, searchQuery, searchResults };
};

export const actions: Actions = {
	sendRequest: async ({ request, locals }) => {
		const user = locals.user!;
		const data = await request.formData();
		const username = data.get('username') as string;
		if (!username) return fail(400, { error: 'Username required' });

		const target = getUserByUsername(username);
		if (!target) return fail(400, { error: 'User not found' });

		const result = sendFriendRequest(user.id, target.id);
		if (!result) return fail(400, { error: 'Cannot send request' });
	},

	accept: async ({ request, locals }) => {
		const data = await request.formData();
		const requestId = data.get('request_id') as string;
		acceptFriendRequest(requestId, locals.user!.id);
	},

	reject: async ({ request, locals }) => {
		const data = await request.formData();
		const requestId = data.get('request_id') as string;
		rejectFriendRequest(requestId, locals.user!.id);
	},

	remove: async ({ request, locals }) => {
		const data = await request.formData();
		const friendId = data.get('friend_id') as string;
		if (friendId) removeFriend(locals.user!.id, friendId);
	}
};
