-- Add calibre_path to import_jobs for filesystem-based Calibre imports
ALTER TABLE import_jobs ADD COLUMN calibre_path TEXT;

-- Add calibre_status_column to store the user-selected custom column for reading status
ALTER TABLE import_jobs ADD COLUMN calibre_status_column TEXT;
