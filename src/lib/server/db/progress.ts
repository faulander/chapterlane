import type { ProgressEntry } from '$lib/types';
import { getDb } from './connection';
import { generateId } from '../utils/crypto';

export function createProgressEntry(data: {
	user_book_id: string;
	page?: number | null;
	percent?: number | null;
	reading_place_id?: string | null;
	note?: string | null;
}): string {
	const id = generateId();
	getDb()
		.prepare(
			`INSERT INTO progress_entries (id, user_book_id, page, percent, reading_place_id, note)
			VALUES (?, ?, ?, ?, ?, ?)`
		)
		.run(
			id,
			data.user_book_id,
			data.page ?? null,
			data.percent ?? null,
			data.reading_place_id ?? null,
			data.note ?? null
		);
	return id;
}

export function getProgressHistory(userBookId: string): ProgressEntry[] {
	return getDb()
		.prepare('SELECT * FROM progress_entries WHERE user_book_id = ? ORDER BY created_at DESC')
		.all(userBookId) as ProgressEntry[];
}

export function getLatestProgress(userBookId: string): ProgressEntry | null {
	return (
		(getDb()
			.prepare(
				'SELECT * FROM progress_entries WHERE user_book_id = ? ORDER BY created_at DESC LIMIT 1'
			)
			.get(userBookId) as ProgressEntry) ?? null
	);
}
