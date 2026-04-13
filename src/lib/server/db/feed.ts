import type { ActivityEvent } from '$lib/types';
import { getDb } from './connection';
import { generateId } from '../utils/crypto';

export function createActivityEvent(data: {
	actor_user_id: string;
	event_type: string;
	object_type: string;
	object_id: string;
	visibility?: string;
	payload_json?: string | null;
}): string {
	const id = generateId();
	getDb()
		.prepare(
			`INSERT INTO activity_events (id, actor_user_id, event_type, object_type, object_id, visibility, payload_json)
			VALUES (?, ?, ?, ?, ?, ?, ?)`
		)
		.run(
			id,
			data.actor_user_id,
			data.event_type,
			data.object_type,
			data.object_id,
			data.visibility || 'friends',
			data.payload_json || null
		);
	return id;
}

export interface FeedEvent extends ActivityEvent {
	actor_username: string;
	actor_display_name: string | null;
	book_id: string | null;
	book_title: string | null;
	book_cover_url: string | null;
	series_name: string | null;
	series_position: number | null;
}

const FEED_SELECT = `
	SELECT ae.*,
		u.username as actor_username,
		u.display_name as actor_display_name,
		ub.book_id as book_id,
		COALESCE(btt.translated_title, b.original_title) as book_title,
		b.cover_url as book_cover_url,
		rl.title as series_name,
		rli.position as series_position
	FROM activity_events ae
	JOIN users u ON u.id = ae.actor_user_id
	LEFT JOIN user_books ub ON ub.id = ae.object_id AND ae.object_type = 'user_book'
	LEFT JOIN books b ON b.id = ub.book_id
	LEFT JOIN book_title_translations btt ON btt.book_id = b.id
		AND btt.language_code = (SELECT preferred_language FROM users WHERE id = ae.actor_user_id)
	LEFT JOIN reading_list_items rli ON rli.book_id = ub.book_id
	LEFT JOIN reading_lists rl ON rl.id = rli.list_id AND rl.user_id = ae.actor_user_id
`;

export function getFeedForUser(
	userId: string,
	limit: number = 30,
	offset: number = 0
): FeedEvent[] {
	return getDb()
		.prepare(
			`${FEED_SELECT}
			JOIN friendships f ON f.friend_user_id = ae.actor_user_id AND f.user_id = ?
			WHERE ae.visibility IN ('friends', 'public')
			AND ae.actor_user_id NOT IN (SELECT blocked_user_id FROM blocks WHERE blocker_user_id = ?)
			ORDER BY ae.created_at DESC
			LIMIT ? OFFSET ?`
		)
		.all(userId, userId, limit, offset) as FeedEvent[];
}

export function getUserEvents(userId: string, limit: number = 20): FeedEvent[] {
	return getDb()
		.prepare(
			`${FEED_SELECT}
			WHERE ae.actor_user_id = ?
			ORDER BY ae.created_at DESC LIMIT ?`
		)
		.all(userId, limit) as FeedEvent[];
}
