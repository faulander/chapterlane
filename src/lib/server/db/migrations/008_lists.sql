CREATE TABLE reading_lists (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	title TEXT NOT NULL,
	description TEXT,
	visibility TEXT NOT NULL DEFAULT 'private'
		CHECK (visibility IN ('private', 'friends', 'public')),
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_reading_lists_user ON reading_lists(user_id);

CREATE TABLE reading_list_items (
	id TEXT PRIMARY KEY,
	list_id TEXT NOT NULL REFERENCES reading_lists(id) ON DELETE CASCADE,
	book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
	note TEXT,
	position INTEGER NOT NULL DEFAULT 0,
	added_at TEXT NOT NULL DEFAULT (datetime('now')),
	UNIQUE(list_id, book_id)
);
CREATE INDEX idx_rli_list ON reading_list_items(list_id);
