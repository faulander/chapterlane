import type { Database } from 'bun:sqlite';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { createLogger } from '../utils/logger';

const log = createLogger('migrate');

const MIGRATIONS_DIR = join(import.meta.dirname, 'migrations');

export function runMigrations(db: Database): void {
	db.exec(`
		CREATE TABLE IF NOT EXISTS _migrations (
			version INTEGER PRIMARY KEY,
			name TEXT NOT NULL,
			applied_at TEXT NOT NULL DEFAULT (datetime('now'))
		)
	`);

	const applied = new Set(
		db
			.query('SELECT version FROM _migrations')
			.all()
			.map((row) => (row as { version: number }).version)
	);

	let files: string[];
	try {
		files = readdirSync(MIGRATIONS_DIR)
			.filter((f) => f.endsWith('.sql'))
			.sort();
	} catch {
		log.warn('No migrations directory found, skipping migrations');
		return;
	}

	for (const file of files) {
		const match = file.match(/^(\d+)_/);
		if (!match) {
			log.warn('Skipping migration file with invalid name', { file });
			continue;
		}

		const version = parseInt(match[1], 10);
		if (applied.has(version)) continue;

		const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');
		log.info('Applying migration', { version, file });

		db.transaction(() => {
			db.exec(sql);
			db.prepare('INSERT INTO _migrations (version, name) VALUES (?, ?)').run(version, file);
		})();

		log.info('Migration applied successfully', { version, file });
	}
}
