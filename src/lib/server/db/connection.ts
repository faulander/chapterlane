import { Database } from 'bun:sqlite'
import { existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { createLogger } from '../utils/logger'
import { runMigrations } from './migrate'

const log = createLogger('db')

const DB_PATH = process.env.DATABASE_PATH || 'data/chapterlane.db'

function ensureDirectory(filePath: string): void {
	const dir = dirname(filePath)
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true })
		log.info('Created database directory', { dir })
	}
}

function createDatabase(): Database {
	ensureDirectory(DB_PATH)

	const db = new Database(DB_PATH)

	db.exec('PRAGMA journal_mode=WAL')
	db.exec('PRAGMA foreign_keys=ON')
	db.exec('PRAGMA busy_timeout=5000')

	log.info('Database connection established', { path: DB_PATH })

	runMigrations(db)

	return db
}

export const db = createDatabase()
