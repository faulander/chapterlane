/** The subset of a feed row that grouping needs (kept free of server imports). */
export interface FeedEventLike {
	id: string;
	actor_user_id: string;
	actor_username: string;
	actor_display_name: string | null;
	event_type: string;
	created_at: string;
	payload_json: string | null;
	book_id: string | null;
	book_title: string | null;
	book_cover_url: string | null;
	series_name: string | null;
	series_position: number | null;
}

export type FeedStep =
	| { kind: 'added' }
	| { kind: 'started' }
	| { kind: 'status'; label: string }
	| { kind: 'progress'; page: number | null; percent: number | null }
	| { kind: 'finished' }
	| { kind: 'other'; type: string };

export interface FeedGroup {
	/** Id of the newest event in the group; stable across renders. */
	id: string;
	actorId: string;
	actorName: string;
	bookId: string | null;
	bookTitle: string | null;
	coverUrl: string | null;
	seriesName: string | null;
	seriesPosition: number | null;
	/** created_at of the newest event, used for ordering and "time ago". */
	latestAt: string;
	finished: boolean;
	/** Chronological story of the group; runs of progress updates are reduced to the latest. */
	steps: FeedStep[];
	/** Highest known percent (0–100) across the group, or null when unknown. */
	percent: number | null;
	/** Highest 25/50/75/100 milestone reached within the group. */
	milestone: number | null;
	eventCount: number;
}

/** Consecutive updates to one book by one person merge while no more than this apart. */
export const GROUP_WINDOW_MS = 24 * 60 * 60 * 1000;

function toMs(createdAt: string): number {
	return Date.parse(createdAt.replace(' ', 'T') + 'Z');
}

function readPayload(json: string | null): Record<string, unknown> {
	if (!json) return {};
	try {
		const value: unknown = JSON.parse(json);
		return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
	} catch {
		return {};
	}
}

function numberOrNull(value: unknown): number | null {
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toStep(type: string, payload: Record<string, unknown>): FeedStep {
	switch (type) {
		case 'book_added':
			return { kind: 'added' };
		case 'book_started':
			return { kind: 'started' };
		case 'status_changed':
			return {
				kind: 'status',
				label: typeof payload.status_label === 'string' ? payload.status_label : '?'
			};
		case 'book_completed':
			return { kind: 'finished' };
		case 'progress_milestone':
			return { kind: 'progress', page: null, percent: numberOrNull(payload.percent) };
		case 'progress_logged':
			return {
				kind: 'progress',
				page: numberOrNull(payload.page),
				percent: numberOrNull(payload.percent)
			};
		default:
			return { kind: 'other', type };
	}
}

interface OpenGroup {
	events: FeedEventLike[];
	oldestMs: number;
}

/**
 * Collapses a feed into one row per person and book. Events arrive newest first.
 * A finished book is never merged and also ends the run it belongs to, so a
 * re-read starts a fresh group. Groups are ordered by their newest event.
 */
export function groupFeedEvents(events: FeedEventLike[]): FeedGroup[] {
	const ordered = [...events].sort((a, b) =>
		a.created_at === b.created_at
			? b.id.localeCompare(a.id)
			: b.created_at.localeCompare(a.created_at)
	);
	const groups: OpenGroup[] = [];
	const latestByKey = new Map<string, OpenGroup>();

	for (const event of ordered) {
		const key = `${event.actor_user_id}:${event.book_id ?? event.id}`;
		const ms = toMs(event.created_at);

		if (event.event_type === 'book_completed') {
			groups.push({ events: [event], oldestMs: ms });
			latestByKey.delete(key);
			continue;
		}
		const open = latestByKey.get(key);
		if (open && open.oldestMs - ms <= GROUP_WINDOW_MS) {
			open.events.push(event);
			open.oldestMs = ms;
			continue;
		}
		const created: OpenGroup = { events: [event], oldestMs: ms };
		groups.push(created);
		latestByKey.set(key, created);
	}

	return groups.map(summarize);
}

function summarize({ events }: OpenGroup): FeedGroup {
	const newest = events[0];
	const chronological = [...events].reverse();
	const steps: FeedStep[] = [];
	let percent: number | null = null;
	let milestone: number | null = null;

	for (const event of chronological) {
		const payload = readPayload(event.payload_json);
		const step = toStep(event.event_type, payload);
		if (step.kind === 'progress') {
			if (step.percent !== null) percent = Math.max(percent ?? 0, step.percent);
			if (event.event_type === 'progress_milestone' && step.percent !== null) {
				milestone = Math.max(milestone ?? 0, step.percent);
			}
			if (steps.at(-1)?.kind === 'progress') steps.pop();
		}
		steps.push(step);
	}

	const finished = newest.event_type === 'book_completed';
	return {
		id: newest.id,
		actorId: newest.actor_user_id,
		actorName: newest.actor_display_name || newest.actor_username,
		bookId: newest.book_id,
		bookTitle: newest.book_title,
		coverUrl: newest.book_cover_url,
		seriesName: newest.series_name,
		seriesPosition: newest.series_position,
		latestAt: newest.created_at,
		finished,
		steps,
		percent: finished ? 100 : percent,
		milestone,
		eventCount: events.length
	};
}
