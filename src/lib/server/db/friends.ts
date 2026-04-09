import type { User } from '$lib/types';
import { getDb } from './connection';
import { generateId } from '../utils/crypto';
import { createLogger } from '../utils/logger';

const log = createLogger('friends');

export function sendFriendRequest(senderId: string, receiverId: string): string | null {
	if (senderId === receiverId) return null;
	if (isBlocked(senderId, receiverId) || isBlocked(receiverId, senderId)) return null;
	if (isFriend(senderId, receiverId)) return null;

	const existing = getDb()
		.prepare(
			"SELECT id FROM friend_requests WHERE sender_user_id = ? AND receiver_user_id = ? AND status = 'pending'"
		)
		.get(senderId, receiverId) as { id: string } | undefined;
	if (existing) return existing.id;

	const id = generateId();
	getDb()
		.prepare('INSERT INTO friend_requests (id, sender_user_id, receiver_user_id) VALUES (?, ?, ?)')
		.run(id, senderId, receiverId);
	log.info('Friend request sent', { senderId, receiverId });
	return id;
}

export function acceptFriendRequest(requestId: string, userId: string): boolean {
	const req = getDb()
		.prepare(
			"SELECT * FROM friend_requests WHERE id = ? AND receiver_user_id = ? AND status = 'pending'"
		)
		.get(requestId, userId) as { sender_user_id: string; receiver_user_id: string } | undefined;
	if (!req) return false;

	const db = getDb();
	db.transaction(() => {
		db.prepare(
			"UPDATE friend_requests SET status = 'accepted', responded_at = datetime('now') WHERE id = ?"
		).run(requestId);
		db.prepare('INSERT OR IGNORE INTO friendships (user_id, friend_user_id) VALUES (?, ?)').run(
			req.sender_user_id,
			req.receiver_user_id
		);
		db.prepare('INSERT OR IGNORE INTO friendships (user_id, friend_user_id) VALUES (?, ?)').run(
			req.receiver_user_id,
			req.sender_user_id
		);
	})();

	log.info('Friend request accepted', { requestId });
	return true;
}

export function rejectFriendRequest(requestId: string, userId: string): boolean {
	const result = getDb()
		.prepare(
			"UPDATE friend_requests SET status = 'rejected', responded_at = datetime('now') WHERE id = ? AND receiver_user_id = ? AND status = 'pending'"
		)
		.run(requestId, userId);
	return result.changes > 0;
}

export function removeFriend(userId: string, friendId: string): void {
	const db = getDb();
	db.transaction(() => {
		db.prepare('DELETE FROM friendships WHERE user_id = ? AND friend_user_id = ?').run(
			userId,
			friendId
		);
		db.prepare('DELETE FROM friendships WHERE user_id = ? AND friend_user_id = ?').run(
			friendId,
			userId
		);
	})();
	log.info('Friend removed', { userId, friendId });
}

export function blockUser(blockerId: string, blockedId: string): void {
	removeFriend(blockerId, blockedId);
	getDb()
		.prepare('INSERT OR IGNORE INTO blocks (blocker_user_id, blocked_user_id) VALUES (?, ?)')
		.run(blockerId, blockedId);
	log.info('User blocked', { blockerId, blockedId });
}

export function unblockUser(blockerId: string, blockedId: string): void {
	getDb()
		.prepare('DELETE FROM blocks WHERE blocker_user_id = ? AND blocked_user_id = ?')
		.run(blockerId, blockedId);
}

export function isFriend(userId: string, otherUserId: string): boolean {
	return !!getDb()
		.prepare('SELECT 1 FROM friendships WHERE user_id = ? AND friend_user_id = ?')
		.get(userId, otherUserId);
}

export function isBlocked(blockerId: string, blockedId: string): boolean {
	return !!getDb()
		.prepare('SELECT 1 FROM blocks WHERE blocker_user_id = ? AND blocked_user_id = ?')
		.get(blockerId, blockedId);
}

export function getFriends(userId: string): (User & { friendship_created_at: string })[] {
	return getDb()
		.prepare(
			`SELECT u.*, f.created_at as friendship_created_at
			FROM friendships f JOIN users u ON u.id = f.friend_user_id
			WHERE f.user_id = ? ORDER BY u.display_name`
		)
		.all(userId) as (User & { friendship_created_at: string })[];
}

interface PendingRequestRow {
	id: string;
	created_at: string;
	user_id: string;
	username: string;
	display_name: string | null;
	avatar_url: string | null;
}

export function getPendingRequests(
	userId: string
): { id: string; sender: User; created_at: string }[] {
	const rows = getDb()
		.prepare(
			`SELECT fr.id, fr.created_at, u.id as user_id, u.username, u.display_name, u.avatar_url
			FROM friend_requests fr JOIN users u ON u.id = fr.sender_user_id
			WHERE fr.receiver_user_id = ? AND fr.status = 'pending'
			ORDER BY fr.created_at DESC`
		)
		.all(userId) as PendingRequestRow[];

	return rows.map((row) => ({
		id: row.id,
		created_at: row.created_at,
		sender: {
			id: row.user_id,
			username: row.username,
			display_name: row.display_name,
			avatar_url: row.avatar_url
		} as User
	}));
}

export function searchUsers(query: string, excludeUserId: string, limit: number = 10): User[] {
	if (!query.trim()) return [];
	return getDb()
		.prepare(
			`SELECT * FROM users WHERE id != ? AND (username LIKE ? OR display_name LIKE ?)
			ORDER BY username LIMIT ?`
		)
		.all(excludeUserId, `%${query}%`, `%${query}%`, limit) as User[];
}
