CREATE TABLE app_logs (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	created_at TEXT NOT NULL,
	level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
	module TEXT NOT NULL,
	message TEXT NOT NULL,
	data TEXT
);
CREATE INDEX idx_app_logs_module ON app_logs(module);
