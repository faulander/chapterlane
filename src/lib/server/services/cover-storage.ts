import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { createLogger } from '../utils/logger';

const log = createLogger('cover-storage');

const COVERS_DIR = 'data/covers';

function ensureCoversDir(): void {
	if (!existsSync(COVERS_DIR)) {
		mkdirSync(COVERS_DIR, { recursive: true });
		log.info('Created covers directory', { dir: COVERS_DIR });
	}
}

/**
 * Store a cover image for a book. Returns the URL path to serve it.
 */
export function storeCover(bookId: string, imageData: Buffer | Uint8Array): string {
	ensureCoversDir();
	const filePath = join(COVERS_DIR, `${bookId}.jpg`);
	writeFileSync(filePath, imageData);
	log.debug('Cover stored', { bookId, size: imageData.length });
	return `/api/covers/${bookId}`;
}

/**
 * Read a cover file from disk. Returns null if not found.
 */
export function readCover(bookId: string): Buffer | null {
	const filePath = join(COVERS_DIR, `${bookId}.jpg`);
	if (!existsSync(filePath)) return null;
	return readFileSync(filePath);
}

/**
 * Check if a local cover exists for a book.
 */
export function hasCover(bookId: string): boolean {
	return existsSync(join(COVERS_DIR, `${bookId}.jpg`));
}

/**
 * Delete a stored cover.
 */
export function deleteCover(bookId: string): void {
	const filePath = join(COVERS_DIR, `${bookId}.jpg`);
	if (existsSync(filePath)) {
		unlinkSync(filePath);
		log.debug('Cover deleted', { bookId });
	}
}

/**
 * Import a cover from a Calibre library directory.
 * Reads cover.jpg from the book's path within the library.
 */
export function importCalibreCover(
	libraryPath: string,
	bookPath: string,
	bookId: string
): string | null {
	const coverFile = join(libraryPath, bookPath, 'cover.jpg');
	if (!existsSync(coverFile)) return null;

	try {
		const data = readFileSync(coverFile);
		return storeCover(bookId, data);
	} catch (e) {
		log.warn('Failed to import Calibre cover', { coverFile, error: String(e) });
		return null;
	}
}
