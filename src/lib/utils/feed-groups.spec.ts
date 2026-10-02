import { describe, it, expect } from 'vitest';
import { groupFeedEvents, type FeedEventLike } from './feed-groups';

let counter = 0;
function event(
	overrides: Partial<FeedEventLike> & { created_at: string; event_type: string }
): FeedEventLike {
	counter += 1;
	return {
		id: `e${counter}`,
		actor_user_id: 'anna',
		actor_username: 'anna',
		actor_display_name: null,
		payload_json: null,
		book_id: 'dune',
		book_title: 'Dune',
		book_cover_url: null,
		series_name: null,
		series_position: null,
		...overrides
	};
}

const progress = (created_at: string, percent: number, extra: Partial<FeedEventLike> = {}) =>
	event({
		created_at,
		event_type: 'progress_logged',
		payload_json: JSON.stringify({ page: null, percent }),
		...extra
	});

describe('groupFeedEvents', () => {
	it('merges one reader’s updates to one book into a single group with the latest progress', () => {
		const groups = groupFeedEvents([
			progress('2026-10-01 18:00:00', 45),
			progress('2026-10-01 12:00:00', 31),
			event({ created_at: '2026-10-01 09:00:00', event_type: 'book_started' })
		]);

		expect(groups).toHaveLength(1);
		expect(groups[0].eventCount).toBe(3);
		expect(groups[0].steps).toEqual([
			{ kind: 'started' },
			{ kind: 'progress', page: null, percent: 45 }
		]);
		expect(groups[0].percent).toBe(45);
		expect(groups[0].latestAt).toBe('2026-10-01 18:00:00');
	});

	it('keeps different books and different readers apart', () => {
		const groups = groupFeedEvents([
			progress('2026-10-01 18:00:00', 10, { actor_user_id: 'ben', actor_username: 'ben' }),
			progress('2026-10-01 17:00:00', 20, { book_id: 'emma' }),
			progress('2026-10-01 16:00:00', 30)
		]);

		expect(groups.map((g) => [g.actorId, g.bookId])).toEqual([
			['ben', 'dune'],
			['anna', 'emma'],
			['anna', 'dune']
		]);
	});

	it('starts a new group when updates are more than a day apart', () => {
		const groups = groupFeedEvents([
			progress('2026-10-03 12:00:00', 60),
			progress('2026-10-02 13:00:00', 50),
			progress('2026-10-01 10:00:00', 40)
		]);

		// 03 12:00 and 02 13:00 are 23 h apart (merge); 02 13:00 and 01 10:00 are 27 h apart (split).
		expect(groups.map((g) => g.eventCount)).toEqual([2, 1]);
	});

	it('never merges a finished book and treats it as a boundary for a re-read', () => {
		const groups = groupFeedEvents([
			progress('2026-10-05 10:00:00', 5),
			event({ created_at: '2026-10-04 20:00:00', event_type: 'book_completed' }),
			progress('2026-10-04 19:00:00', 98)
		]);

		expect(groups.map((g) => [g.finished, g.eventCount])).toEqual([
			[false, 1],
			[true, 1],
			[false, 1]
		]);
		expect(groups[1].percent).toBe(100);
	});

	it('orders groups by their newest event even when an older run is merged around other activity', () => {
		const groups = groupFeedEvents([
			progress('2026-10-01 20:00:00', 12, { book_id: 'emma' }),
			progress('2026-10-01 19:00:00', 70),
			progress('2026-10-01 18:00:00', 60)
		]);

		expect(groups.map((g) => g.bookId)).toEqual(['emma', 'dune']);
		expect(groups[1].eventCount).toBe(2);
	});

	it('records the highest milestone and keeps the status label', () => {
		const [group] = groupFeedEvents([
			event({
				created_at: '2026-10-01 12:00:00',
				event_type: 'progress_milestone',
				payload_json: JSON.stringify({ percent: 50 })
			}),
			progress('2026-10-01 11:00:00', 27),
			event({
				created_at: '2026-10-01 10:00:00',
				event_type: 'status_changed',
				payload_json: JSON.stringify({ status_label: 'Currently Reading' })
			})
		]);

		expect(group.milestone).toBe(50);
		expect(group.steps).toEqual([
			{ kind: 'status', label: 'Currently Reading' },
			{ kind: 'progress', page: null, percent: 50 }
		]);
	});

	it('tolerates malformed payloads and uses the display name when present', () => {
		const [group] = groupFeedEvents([
			event({
				created_at: '2026-10-01 12:00:00',
				event_type: 'progress_logged',
				payload_json: '{not json',
				actor_display_name: 'Anna B.'
			})
		]);

		expect(group.actorName).toBe('Anna B.');
		expect(group.steps).toEqual([{ kind: 'progress', page: null, percent: null }]);
		expect(group.percent).toBeNull();
	});
});
