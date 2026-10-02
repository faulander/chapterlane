import { getDb } from './connection';
import { setLogSink, type LogRecord } from '../utils/logger';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];
export const LOG_PAGE_SIZE = 100;
const MAX_STORED_LOGS = 5000;
const PRUNE_EVERY = 100;
const MAX_DATA_LENGTH = 4000;

export interface LogEntry {
	id: number;
	created_at: string;
	level: LogLevel;
	module: string;
	message: string;
	data: string | null;
}

export interface LogQuery {
	level: LogLevel;
	module: string;
	search: string;
	before: number | null;
}

export interface LogPage {
	entries: LogEntry[];
	modules: string[];
	nextBefore: number | null;
}

function serializeData(data: unknown): string | null {
	if (data === undefined) return null;
	let text: string;
	try {
		text = JSON.stringify(data, null, 2) ?? String(data);
	} catch {
		text = String(data);
	}
	return text.length > MAX_DATA_LENGTH ? `${text.slice(0, MAX_DATA_LENGTH)}…` : text;
}

/**
 * Persists every record that passes LOG_LEVEL into app_logs, keeping the newest
 * MAX_STORED_LOGS rows. Persistence failures are reported once on the console and
 * never propagate into the code that logged.
 */
export function installLogPersistence(): void {
	const db = getDb();
	const insert = db.prepare(
		'INSERT INTO app_logs (created_at, level, module, message, data) VALUES (?, ?, ?, ?, ?)'
	);
	const prune = db.prepare('DELETE FROM app_logs WHERE id <= (SELECT MAX(id) FROM app_logs) - ?');
	let sinceLastPrune = 0;
	let reportedFailure = false;

	setLogSink((record: LogRecord) => {
		try {
			insert.run(
				record.timestamp,
				record.level,
				record.module,
				record.message,
				serializeData(record.data)
			);
			if (++sinceLastPrune >= PRUNE_EVERY) {
				sinceLastPrune = 0;
				prune.run(MAX_STORED_LOGS);
			}
		} catch (error) {
			if (!reportedFailure) {
				reportedFailure = true;
				console.error('[logger] Failed to persist log records', error);
			}
		}
	});
}

/** The log viewer is limited to the first registered account (the instance owner). */
export function canViewLogs(userId: string): boolean {
	const owner = getDb()
		.prepare('SELECT id FROM users ORDER BY created_at, rowid LIMIT 1')
		.get() as {
		id: string;
	} | null;
	return owner?.id === userId;
}

export function listLogs(query: LogQuery): LogPage {
	const db = getDb();
	const levels = LOG_LEVELS.slice(LOG_LEVELS.indexOf(query.level));
	const clauses = [`level IN (${levels.map(() => '?').join(',')})`];
	const params: (string | number)[] = [...levels];

	if (query.module) {
		clauses.push('module = ?');
		params.push(query.module);
	}
	if (query.search) {
		const pattern = `%${query.search.replace(/[\\%_]/g, '\\$&')}%`;
		clauses.push("(message LIKE ? ESCAPE '\\' OR COALESCE(data, '') LIKE ? ESCAPE '\\')");
		params.push(pattern, pattern);
	}
	if (query.before !== null) {
		clauses.push('id < ?');
		params.push(query.before);
	}

	const rows = db
		.prepare(
			`SELECT id, created_at, level, module, message, data FROM app_logs
			 WHERE ${clauses.join(' AND ')} ORDER BY id DESC LIMIT ?`
		)
		.all(...params, LOG_PAGE_SIZE + 1) as LogEntry[];
	const hasMore = rows.length > LOG_PAGE_SIZE;
	const entries = hasMore ? rows.slice(0, LOG_PAGE_SIZE) : rows;
	const modules = (
		db.prepare('SELECT DISTINCT module FROM app_logs ORDER BY module').all() as { module: string }[]
	).map((row) => row.module);

	return { entries, modules, nextBefore: hasMore ? entries[entries.length - 1].id : null };
}
