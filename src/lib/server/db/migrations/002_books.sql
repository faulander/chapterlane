CREATE TABLE books (
	id TEXT PRIMARY KEY,
	original_title TEXT NOT NULL,
	original_language TEXT NOT NULL DEFAULT 'en',
	description TEXT,
	cover_url TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE book_title_translations (
	id TEXT PRIMARY KEY,
	book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
	language_code TEXT NOT NULL,
	translated_title TEXT NOT NULL,
	UNIQUE(book_id, language_code)
);
CREATE INDEX idx_btt_book_id ON book_title_translations(book_id);

CREATE TABLE authors (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	sort_name TEXT
);

CREATE TABLE book_authors (
	book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
	author_id TEXT NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
	author_order INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY (book_id, author_id)
);
CREATE INDEX idx_book_authors_author ON book_authors(author_id);

CREATE TABLE external_book_refs (
	id TEXT PRIMARY KEY,
	book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
	source TEXT NOT NULL,
	external_id TEXT NOT NULL,
	UNIQUE(source, external_id)
);
CREATE INDEX idx_ebr_book_id ON external_book_refs(book_id);

-- Search index: stores denormalized title + author text per book
CREATE TABLE books_search (
	book_id TEXT PRIMARY KEY REFERENCES books(id) ON DELETE CASCADE,
	title_text TEXT NOT NULL DEFAULT '',
	author_text TEXT NOT NULL DEFAULT ''
);

CREATE VIRTUAL TABLE books_fts USING fts5(
	title_text,
	author_text,
	content='books_search',
	content_rowid='rowid',
	tokenize='unicode61'
);

-- Triggers to keep FTS in sync with books_search
CREATE TRIGGER books_search_ai AFTER INSERT ON books_search BEGIN
	INSERT INTO books_fts(rowid, title_text, author_text)
	VALUES (new.rowid, new.title_text, new.author_text);
END;

CREATE TRIGGER books_search_ad AFTER DELETE ON books_search BEGIN
	INSERT INTO books_fts(books_fts, rowid, title_text, author_text)
	VALUES('delete', old.rowid, old.title_text, old.author_text);
END;

CREATE TRIGGER books_search_au AFTER UPDATE ON books_search BEGIN
	INSERT INTO books_fts(books_fts, rowid, title_text, author_text)
	VALUES('delete', old.rowid, old.title_text, old.author_text);
	INSERT INTO books_fts(rowid, title_text, author_text)
	VALUES (new.rowid, new.title_text, new.author_text);
END;
