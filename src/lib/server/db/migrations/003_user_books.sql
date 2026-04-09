CREATE TABLE status_definitions (
	id TEXT PRIMARY KEY,
	user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
	label TEXT NOT NULL,
	system_category TEXT NOT NULL
		CHECK (system_category IN ('planned', 'active', 'paused', 'completed', 'dropped')),
	sort_order INTEGER NOT NULL DEFAULT 0,
	is_default INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_status_defs_user ON status_definitions(user_id);

INSERT INTO status_definitions (id, user_id, label, system_category, sort_order, is_default)
VALUES
	('sys_want_to_read', NULL, 'Want to Read', 'planned', 1, 1),
	('sys_reading', NULL, 'Currently Reading', 'active', 2, 1),
	('sys_paused', NULL, 'On Hold', 'paused', 3, 1),
	('sys_completed', NULL, 'Completed', 'completed', 4, 1),
	('sys_dropped', NULL, 'Did Not Finish', 'dropped', 5, 1);

CREATE TABLE user_books (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
	current_status_id TEXT REFERENCES status_definitions(id),
	started_at TEXT,
	finished_at TEXT,
	user_total_pages INTEGER,
	current_page INTEGER,
	current_percent REAL,
	reread_count INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at TEXT NOT NULL DEFAULT (datetime('now')),
	UNIQUE(user_id, book_id)
);
CREATE INDEX idx_user_books_user ON user_books(user_id);
CREATE INDEX idx_user_books_book ON user_books(book_id);
CREATE INDEX idx_user_books_status ON user_books(current_status_id);

CREATE TABLE user_book_status_history (
	id TEXT PRIMARY KEY,
	user_book_id TEXT NOT NULL REFERENCES user_books(id) ON DELETE CASCADE,
	status_id TEXT NOT NULL REFERENCES status_definitions(id),
	changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_ubsh_user_book ON user_book_status_history(user_book_id);
