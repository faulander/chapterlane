import type { ImportJob, ImportRow } from '$lib/types';
import { getDb } from './connection';
import { generateId } from '../utils/crypto';

export function createImportJob(userId: string, source: string): string {
	const id = generateId();
	getDb()
		.prepare(
			"INSERT INTO import_jobs (id, user_id, source, started_at) VALUES (?, ?, ?, datetime('now'))"
		)
		.run(id, userId, source);
	return id;
}

export function getImportJob(id: string): ImportJob | null {
	return (getDb().prepare('SELECT * FROM import_jobs WHERE id = ?').get(id) as ImportJob) ?? null;
}

export function getUserImportJobs(userId: string): ImportJob[] {
	return getDb()
		.prepare('SELECT * FROM import_jobs WHERE user_id = ? ORDER BY created_at DESC')
		.all(userId) as ImportJob[];
}

export function updateImportJob(
	id: string,
	data: Partial<
		Pick<
			ImportJob,
			| 'status'
			| 'total_rows'
			| 'matched_rows'
			| 'imported_rows'
			| 'error_message'
			| 'finished_at'
			| 'calibre_path'
			| 'calibre_status_column'
		>
	>
): void {
	const fields: string[] = [];
	const values: (string | number | null)[] = [];

	for (const [key, value] of Object.entries(data)) {
		if (value !== undefined) {
			fields.push(`${key} = ?`);
			values.push(value as string | number | null);
		}
	}

	if (fields.length === 0) return;
	values.push(id);

	getDb()
		.prepare(`UPDATE import_jobs SET ${fields.join(', ')} WHERE id = ?`)
		.run(...values);
}

export function createImportRow(data: {
	job_id: string;
	row_number: number;
	raw_data: string;
	parsed_title?: string | null;
	parsed_author?: string | null;
	parsed_status?: string | null;
	parsed_pages?: string | null;
	parsed_date_read?: string | null;
	parsed_date_added?: string | null;
	matched_book_id?: string | null;
	match_confidence?: number | null;
}): string {
	const id = generateId();
	getDb()
		.prepare(
			`INSERT INTO import_rows (id, job_id, row_number, raw_data, parsed_title, parsed_author,
			parsed_status, parsed_pages, parsed_date_read, parsed_date_added, matched_book_id, match_confidence)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		)
		.run(
			id,
			data.job_id,
			data.row_number,
			data.raw_data,
			data.parsed_title ?? null,
			data.parsed_author ?? null,
			data.parsed_status ?? null,
			data.parsed_pages ?? null,
			data.parsed_date_read ?? null,
			data.parsed_date_added ?? null,
			data.matched_book_id ?? null,
			data.match_confidence ?? null
		);
	return id;
}

export function getImportRows(jobId: string): ImportRow[] {
	return getDb()
		.prepare('SELECT * FROM import_rows WHERE job_id = ? ORDER BY row_number')
		.all(jobId) as ImportRow[];
}

export function updateImportRow(
	id: string,
	data: Partial<
		Pick<ImportRow, 'user_action' | 'import_result' | 'error_message' | 'matched_book_id'>
	>
): void {
	const fields: string[] = [];
	const values: (string | number | null)[] = [];

	for (const [key, value] of Object.entries(data)) {
		if (value !== undefined) {
			fields.push(`${key} = ?`);
			values.push(value as string | number | null);
		}
	}

	if (fields.length === 0) return;
	values.push(id);

	getDb()
		.prepare(`UPDATE import_rows SET ${fields.join(', ')} WHERE id = ?`)
		.run(...values);
}
