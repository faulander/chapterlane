import { createActivityEvent } from '../db/feed';
import { createLogger } from '../utils/logger';

const log = createLogger('feed');

export function emitEvent(
	actorId: string,
	eventType: string,
	objectType: string,
	objectId: string,
	visibility: string = 'friends',
	payload?: Record<string, unknown>
): void {
	createActivityEvent({
		actor_user_id: actorId,
		event_type: eventType,
		object_type: objectType,
		object_id: objectId,
		visibility,
		payload_json: payload ? JSON.stringify(payload) : null
	});
	log.debug('Event emitted', { actorId, eventType, objectType });
}

export function emitStatusChanged(
	actorId: string,
	userBookId: string,
	bookId: string,
	bookTitle: string,
	statusLabel: string
): void {
	emitEvent(actorId, 'status_changed', 'user_book', userBookId, 'friends', {
		book_id: bookId,
		book_title: bookTitle,
		status_label: statusLabel
	});
}

export function emitBookCompleted(
	actorId: string,
	userBookId: string,
	bookId: string,
	bookTitle: string
): void {
	emitEvent(actorId, 'book_completed', 'user_book', userBookId, 'friends', {
		book_id: bookId,
		book_title: bookTitle
	});
}

export function emitProgressLogged(
	actorId: string,
	userBookId: string,
	bookId: string,
	bookTitle: string,
	page: number | null,
	percent: number | null
): void {
	emitEvent(actorId, 'progress_logged', 'user_book', userBookId, 'public', {
		book_id: bookId,
		book_title: bookTitle,
		page,
		percent
	});
}

export function emitProgressMilestone(
	actorId: string,
	userBookId: string,
	bookId: string,
	bookTitle: string,
	percent: number
): boolean {
	// Only emit at 25%, 50%, 75%, 100%
	const milestones = [25, 50, 75, 100];
	const milestone = milestones.find((m) => percent >= m && percent < m + 5);
	if (!milestone) return false;

	emitEvent(actorId, 'progress_milestone', 'user_book', userBookId, 'friends', {
		book_id: bookId,
		book_title: bookTitle,
		percent: milestone
	});
	return true;
}
