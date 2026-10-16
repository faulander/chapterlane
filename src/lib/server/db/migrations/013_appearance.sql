ALTER TABLE users ADD COLUMN theme TEXT NOT NULL DEFAULT 'default';
ALTER TABLE users ADD COLUMN color_mode TEXT NOT NULL DEFAULT 'system'
	CHECK (color_mode IN ('system', 'light', 'dark'));
