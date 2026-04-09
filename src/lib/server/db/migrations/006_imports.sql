CREATE TABLE import_jobs (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	source TEXT NOT NULL CHECK (source IN ('goodreads', 'storygraph', 'calibre')),
	status TEXT NOT NULL DEFAULT 'pending'
		CHECK (status IN ('pending', 'parsing', 'previewing', 'importing', 'completed', 'failed')),
	total_rows INTEGER,
	matched_rows INTEGER,
	imported_rows INTEGER,
	error_message TEXT,
	started_at TEXT,
	finished_at TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_import_jobs_user ON import_jobs(user_id);

CREATE TABLE import_rows (
	id TEXT PRIMARY KEY,
	job_id TEXT NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
	row_number INTEGER NOT NULL,
	raw_data TEXT NOT NULL,
	parsed_title TEXT,
	parsed_author TEXT,
	parsed_status TEXT,
	parsed_pages TEXT,
	parsed_date_read TEXT,
	parsed_date_added TEXT,
	matched_book_id TEXT REFERENCES books(id),
	match_confidence REAL,
	user_action TEXT DEFAULT 'pending'
		CHECK (user_action IN ('pending', 'accept', 'skip', 'manual_match')),
	import_result TEXT
		CHECK (import_result IN ('imported', 'skipped', 'error')),
	error_message TEXT
);
CREATE INDEX idx_import_rows_job ON import_rows(job_id);
