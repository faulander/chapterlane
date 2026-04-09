CREATE TABLE shelves (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	name TEXT NOT NULL,
	description TEXT,
	visibility TEXT NOT NULL DEFAULT 'private'
		CHECK (visibility IN ('private', 'friends', 'public')),
	sort_order INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_shelves_user ON shelves(user_id);

CREATE TABLE shelf_books (
	shelf_id TEXT NOT NULL REFERENCES shelves(id) ON DELETE CASCADE,
	user_book_id TEXT NOT NULL REFERENCES user_books(id) ON DELETE CASCADE,
	added_at TEXT NOT NULL DEFAULT (datetime('now')),
	PRIMARY KEY (shelf_id, user_book_id)
);
