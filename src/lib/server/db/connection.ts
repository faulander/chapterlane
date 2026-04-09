import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { createLogger } from '../utils/logger';
import { runMigrations } from './migrate';

const log = createLogger('db');

const DB_PATH = process.env.DATABASE_PATH || 'data/chapterlane.db';

let _db: Database | null = null;

function ensureDirectory(filePath: string): void {
	const dir = dirname(filePath);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
		log.info('Created database directory', { dir });
	}
}

export function getDb(): Database {
	if (!_db) {
		ensureDirectory(DB_PATH);
		_db = new Database(DB_PATH);
		_db.exec('PRAGMA journal_mode=WAL');
		_db.exec('PRAGMA foreign_keys=ON');
		_db.exec('PRAGMA busy_timeout=5000');
		log.info('Database connection established', { path: DB_PATH });
		runMigrations(_db);
	}
	return _db;
}
