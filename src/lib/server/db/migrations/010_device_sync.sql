CREATE TABLE device_tokens (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	name TEXT NOT NULL,
	token_hash TEXT NOT NULL UNIQUE,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_device_tokens_user ON device_tokens(user_id);

CREATE TABLE device_sync_events (
	token_id TEXT NOT NULL REFERENCES device_tokens(id) ON DELETE CASCADE,
	event_id TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	PRIMARY KEY (token_id, event_id)
);
