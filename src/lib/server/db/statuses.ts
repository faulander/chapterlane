import type { StatusDefinition } from '$lib/types';
import { getDb } from './connection';
import { generateId } from '../utils/crypto';
import { createLogger } from '../utils/logger';

const log = createLogger('statuses');

export function getStatusesForUser(userId: string): StatusDefinition[] {
	return getDb()
		.prepare(
			`SELECT * FROM status_definitions
			WHERE user_id IS NULL OR user_id = ?
			ORDER BY sort_order`
		)
		.all(userId) as StatusDefinition[];
}

export function getStatusById(id: string): StatusDefinition | null {
	return (
		(getDb()
			.prepare('SELECT * FROM status_definitions WHERE id = ?')
			.get(id) as StatusDefinition) ?? null
	);
}

export function createCustomStatus(
	userId: string,
	label: string,
	systemCategory: string,
	sortOrder: number = 10
): string {
	const id = generateId();
	getDb()
		.prepare(
			`INSERT INTO status_definitions (id, user_id, label, system_category, sort_order)
			VALUES (?, ?, ?, ?, ?)`
		)
		.run(id, userId, label, systemCategory, sortOrder);
	log.info('Custom status created', { id, userId, label, systemCategory });
	return id;
}

export function updateCustomStatus(
	id: string,
	data: { label?: string; system_category?: string; sort_order?: number }
): void {
	const status = getStatusById(id);
	if (!status || !status.user_id) return; // Can't edit system statuses

	getDb()
		.prepare(
			'UPDATE status_definitions SET label = ?, system_category = ?, sort_order = ? WHERE id = ?'
		)
		.run(
			data.label ?? status.label,
			data.system_category ?? status.system_category,
			data.sort_order ?? status.sort_order,
			id
		);
}

export function deleteCustomStatus(id: string): void {
	const status = getStatusById(id);
	if (!status || !status.user_id) return; // Can't delete system statuses
	getDb().prepare('DELETE FROM status_definitions WHERE id = ?').run(id);
	log.info('Custom status deleted', { id });
}

export function setBookStatus(userBookId: string, statusId: string): void {
	const db = getDb();
	db.prepare(
		"UPDATE user_books SET current_status_id = ?, updated_at = datetime('now') WHERE id = ?"
	).run(statusId, userBookId);

	const historyId = generateId();
	db.prepare(
		'INSERT INTO user_book_status_history (id, user_book_id, status_id) VALUES (?, ?, ?)'
	).run(historyId, userBookId, statusId);

	log.debug('Book status updated', { userBookId, statusId });
}

export function getStatusHistory(
	userBookId: string
): (StatusDefinition & { changed_at: string })[] {
	return getDb()
		.prepare(
			`SELECT sd.*, ubsh.changed_at
			FROM user_book_status_history ubsh
			JOIN status_definitions sd ON sd.id = ubsh.status_id
			WHERE ubsh.user_book_id = ?
			ORDER BY ubsh.changed_at DESC`
		)
		.all(userBookId) as (StatusDefinition & { changed_at: string })[];
}
