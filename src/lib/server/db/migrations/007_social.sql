CREATE TABLE friend_requests (
	id TEXT PRIMARY KEY,
	sender_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	receiver_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	status TEXT NOT NULL DEFAULT 'pending'
		CHECK (status IN ('pending', 'accepted', 'rejected')),
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	responded_at TEXT,
	UNIQUE(sender_user_id, receiver_user_id)
);
CREATE INDEX idx_fr_receiver ON friend_requests(receiver_user_id);
CREATE INDEX idx_fr_sender ON friend_requests(sender_user_id);

CREATE TABLE friendships (
	user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	friend_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	PRIMARY KEY (user_id, friend_user_id)
);

CREATE TABLE blocks (
	blocker_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	blocked_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	PRIMARY KEY (blocker_user_id, blocked_user_id)
);

CREATE TABLE activity_events (
	id TEXT PRIMARY KEY,
	actor_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	event_type TEXT NOT NULL,
	object_type TEXT NOT NULL,
	object_id TEXT NOT NULL,
	visibility TEXT NOT NULL DEFAULT 'friends'
		CHECK (visibility IN ('private', 'friends', 'public')),
	payload_json TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_events_actor ON activity_events(actor_user_id);
CREATE INDEX idx_events_created ON activity_events(created_at);
