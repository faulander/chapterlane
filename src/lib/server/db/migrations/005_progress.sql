CREATE TABLE reading_places (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	name TEXT NOT NULL,
	icon TEXT,
	color TEXT,
	sort_order INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_reading_places_user ON reading_places(user_id);

CREATE TABLE progress_entries (
	id TEXT PRIMARY KEY,
	user_book_id TEXT NOT NULL REFERENCES user_books(id) ON DELETE CASCADE,
	page INTEGER,
	percent REAL,
	reading_place_id TEXT REFERENCES reading_places(id) ON DELETE SET NULL,
	note TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_progress_user_book ON progress_entries(user_book_id);
CREATE INDEX idx_progress_created ON progress_entries(created_at);
