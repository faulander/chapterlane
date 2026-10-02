import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db/connection';
import { getDeviceTokenUser } from '$lib/server/db/device-tokens';
import { getUserBook, updateUserBook } from '$lib/server/db/library';
import { getStatusById, getStatusesForUser, setBookStatus } from '$lib/server/db/statuses';
import { getBookById } from '$lib/server/db/books';
import { emitBookCompleted, emitEvent } from '$lib/server/services/feed-service';
import { logProgress } from '$lib/server/services/progress-service';

export const POST: RequestHandler = async ({ request }) => {
	const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(request.headers.get('authorization') ?? '');
	const credentials = match && getDeviceTokenUser(match[1]);
	if (!credentials) return json({ error: 'Unauthorized' }, { status: 401 });

	let input: unknown;
	try {
		input = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}
	if (!input || typeof input !== 'object' || Array.isArray(input)) {
		return json({ error: 'Invalid event' }, { status: 400 });
	}
	const event = input as Record<string, unknown>;
	if (
		typeof event.event_id !== 'string' ||
		event.event_id.length < 1 ||
		event.event_id.length > 128 ||
		typeof event.book_id !== 'string' ||
		!event.book_id ||
		(event.status !== undefined && event.status !== 'active' && event.status !== 'completed') ||
		(event.percent !== undefined &&
			(typeof event.percent !== 'number' ||
				!Number.isFinite(event.percent) ||
				event.percent < 0 ||
				event.percent > 100)) ||
		(event.status === undefined && event.percent === undefined)
	) {
		return json({ error: 'Invalid event' }, { status: 400 });
	}

	const userBook = getUserBook(credentials.userId, event.book_id);
	if (!userBook) return json({ error: 'Book not in library' }, { status: 404 });
	const db = getDb();
	const previous = db
		.prepare('SELECT 1 FROM device_sync_events WHERE token_id = ? AND event_id = ?')
		.get(credentials.tokenId, event.event_id);
	if (previous) return json({ result: 'duplicate' });
	const status = userBook.current_status_id ? getStatusById(userBook.current_status_id) : null;
	const category = status?.system_category;
	if (category === 'paused' || category === 'dropped' || category === 'completed') {
		return json(
			{ error: 'Book is not active; change its status in ChapterLane first' },
			{ status: 409 }
		);
	}
	if (event.status === 'completed' && category !== 'active') {
		return json({ error: 'Book must be active before completion' }, { status: 409 });
	}
	if (event.status === undefined && category !== 'active') {
		return json({ error: 'Book must be active before logging progress' }, { status: 409 });
	}

	const result = db.transaction(() => {
		const inserted = db
			.prepare('INSERT OR IGNORE INTO device_sync_events (token_id, event_id) VALUES (?, ?)')
			.run(credentials.tokenId, event.event_id as string);
		if (!inserted.changes) return 'duplicate';

		if (event.status === 'active' && category !== 'active') {
			const active =
				getStatusesForUser(credentials.userId).find(
					(s) => s.system_category === 'active' && s.is_default
				) ?? getStatusesForUser(credentials.userId).find((s) => s.system_category === 'active');
			if (!active) throw new Error('No active status available');
			setBookStatus(userBook.id, active.id);
			if (!userBook.started_at)
				updateUserBook(userBook.id, { started_at: new Date().toISOString().slice(0, 10) });
			const book = getBookById(userBook.book_id);
			if (book)
				emitEvent(credentials.userId, 'book_started', 'user_book', userBook.id, 'public', {
					book_id: userBook.book_id,
					book_title: book.original_title
				});
		}
		if (event.percent !== undefined) {
			const progress = logProgress({ userBookId: userBook.id, percent: event.percent as number });
			if (!progress.success) throw new Error(progress.error);
		}
		if (event.status === 'completed') {
			const completed =
				getStatusesForUser(credentials.userId).find(
					(s) => s.system_category === 'completed' && s.is_default
				) ?? getStatusesForUser(credentials.userId).find((s) => s.system_category === 'completed');
			if (!completed) throw new Error('No completed status available');
			setBookStatus(userBook.id, completed.id);
			if (!userBook.finished_at)
				updateUserBook(userBook.id, { finished_at: new Date().toISOString().slice(0, 10) });
			const book = getBookById(userBook.book_id);
			if (book)
				emitBookCompleted(credentials.userId, userBook.id, userBook.book_id, book.original_title);
		}
		return 'applied';
	})();
	return json({ result });
};
