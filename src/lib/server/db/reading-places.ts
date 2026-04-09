import type { ReadingPlace } from '$lib/types';
import { getDb } from './connection';
import { generateId } from '../utils/crypto';

export function createReadingPlace(userId: string, name: string): string {
	const id = generateId();
	const maxOrder = (
		getDb()
			.prepare('SELECT MAX(sort_order) as max_order FROM reading_places WHERE user_id = ?')
			.get(userId) as { max_order: number | null }
	).max_order;

	getDb()
		.prepare('INSERT INTO reading_places (id, user_id, name, sort_order) VALUES (?, ?, ?, ?)')
		.run(id, userId, name.trim(), (maxOrder ?? -1) + 1);
	return id;
}

export function getUserReadingPlaces(userId: string): ReadingPlace[] {
	return getDb()
		.prepare('SELECT * FROM reading_places WHERE user_id = ? ORDER BY sort_order')
		.all(userId) as ReadingPlace[];
}

export function getReadingPlaceById(id: string): ReadingPlace | null {
	return (
		(getDb().prepare('SELECT * FROM reading_places WHERE id = ?').get(id) as ReadingPlace) ?? null
	);
}

export function updateReadingPlace(id: string, name: string): void {
	getDb().prepare('UPDATE reading_places SET name = ? WHERE id = ?').run(name.trim(), id);
}

export function deleteReadingPlace(id: string): void {
	getDb().prepare('DELETE FROM reading_places WHERE id = ?').run(id);
}
