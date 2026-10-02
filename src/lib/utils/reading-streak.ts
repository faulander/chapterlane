const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(day: string, delta: number): string {
	return new Date(Date.parse(`${day}T00:00:00Z`) + delta * DAY_MS).toISOString().slice(0, 10);
}

/**
 * Consecutive days with reading activity. The streak is still alive if you read
 * yesterday but not yet today, so it only breaks after a full day without reading.
 * Days are UTC calendar dates (YYYY-MM-DD).
 */
export function currentStreak(readingDays: Iterable<string>, today: string): number {
	const days = new Set(readingDays);
	let cursor = days.has(today) ? today : addDays(today, -1);
	let streak = 0;
	while (days.has(cursor)) {
		streak += 1;
		cursor = addDays(cursor, -1);
	}
	return streak;
}

/** How many of the last 7 days (including today) have reading activity. */
export function daysReadThisWeek(readingDays: Iterable<string>, today: string): number {
	const days = new Set(readingDays);
	let count = 0;
	for (let offset = 0; offset < 7; offset++) {
		if (days.has(addDays(today, -offset))) count += 1;
	}
	return count;
}
