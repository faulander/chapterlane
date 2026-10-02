import { describe, it, expect } from 'vitest';
import { currentStreak, daysReadThisWeek } from './reading-streak';

describe('currentStreak', () => {
	it('counts consecutive days ending today, across a month boundary', () => {
		expect(
			currentStreak(['2026-10-02', '2026-10-01', '2026-09-30', '2026-09-29'], '2026-10-02')
		).toBe(4);
	});

	it('keeps the streak alive when you read yesterday but not yet today', () => {
		expect(currentStreak(['2026-10-01', '2026-09-30'], '2026-10-02')).toBe(2);
	});

	it('breaks after a full day without reading and ignores older streaks', () => {
		expect(currentStreak(['2026-09-30', '2026-09-29'], '2026-10-02')).toBe(0);
		expect(currentStreak(['2026-10-02', '2026-09-30', '2026-09-29'], '2026-10-02')).toBe(1);
	});

	it('is zero without any reading', () => {
		expect(currentStreak([], '2026-10-02')).toBe(0);
	});
});

describe('daysReadThisWeek', () => {
	it('counts the last 7 days including today and ignores older days and duplicates', () => {
		const days = ['2026-10-02', '2026-10-02', '2026-09-30', '2026-09-26', '2026-09-25'];
		expect(daysReadThisWeek(days, '2026-10-02')).toBe(3);
	});
});
