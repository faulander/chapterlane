CREATE TABLE users (
	id TEXT PRIMARY KEY,
	username TEXT NOT NULL UNIQUE COLLATE NOCASE,
	email TEXT NOT NULL UNIQUE COLLATE NOCASE,
	password_hash TEXT NOT NULL,
	display_name TEXT,
	avatar_url TEXT,
	bio TEXT,
	preferred_language TEXT NOT NULL DEFAULT 'en',
	profile_visibility TEXT NOT NULL DEFAULT 'public'
		CHECK (profile_visibility IN ('private', 'friends', 'public')),
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE sessions (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	expires_at TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
