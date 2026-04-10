import { Database } from 'bun:sqlite';
import { createLogger } from '../../utils/logger';

const log = createLogger('calibre-parser');

export interface CalibreBook {
	calibreId: number;
	title: string;
	author: string;
	language: string;
	isbn: string;
	pages: string;
	hasCover: boolean;
	path: string;
	status: string;
	tags: string[];
	series: string | null;
	seriesIndex: number | null;
}

export interface CalibreCustomColumn {
	id: number;
	label: string;
	name: string;
	datatype: string;
	display: string;
	sampleValues: string[];
}

/** ISO 639-3 to ISO 639-1 mapping for common languages */
const LANG_MAP: Record<string, string> = {
	eng: 'en',
	deu: 'de',
	ger: 'de',
	fra: 'fr',
	fre: 'fr',
	spa: 'es',
	ita: 'it',
	por: 'pt',
	nld: 'nl',
	dut: 'nl',
	jpn: 'ja',
	zho: 'zh',
	chi: 'zh',
	rus: 'ru',
	pol: 'pl',
	swe: 'sv',
	nor: 'no',
	dan: 'da',
	fin: 'fi',
	hun: 'hu',
	ces: 'cs',
	cze: 'cs',
	tur: 'tr',
	ara: 'ar',
	kor: 'ko',
	hin: 'hi',
	tha: 'th',
	vie: 'vi',
	ron: 'ro',
	rum: 'ro',
	ukr: 'uk',
	bul: 'bg',
	hrv: 'hr',
	slk: 'sk',
	slo: 'sk',
	slv: 'sl',
	lit: 'lt',
	lav: 'lv',
	est: 'et',
	ell: 'el',
	gre: 'el',
	heb: 'he',
	cat: 'ca',
	glg: 'gl',
	eus: 'eu',
	baq: 'eu',
	ind: 'id',
	msa: 'ms',
	may: 'ms'
};

function mapLanguage(lang3: string): string {
	if (!lang3) return '';
	const lower = lang3.toLowerCase().trim();
	// Already a 2-letter code
	if (lower.length === 2) return lower;
	return LANG_MAP[lower] || lower;
}

/**
 * Discover custom columns in a Calibre database that have non-numeric values
 * (likely candidates for reading status). Returns columns with sample values
 * so the user can pick which one represents reading state.
 */
export function getCalibreCustomColumns(dbPath: string): CalibreCustomColumn[] {
	const db = new Database(dbPath, { readonly: true });
	const columns: CalibreCustomColumn[] = [];

	try {
		const customCols = db
			.prepare(
				`SELECT id, label, name, datatype, display
				 FROM custom_columns
				 WHERE datatype IN ('text', 'enumeration', 'bool', 'int', 'composite')
				 ORDER BY label`
			)
			.all() as { id: number; label: string; name: string; datatype: string; display: string }[];

		for (const col of customCols) {
			const tableName = `custom_column_${col.id}`;

			// Check if the table exists
			const tableExists = db
				.prepare(
					`SELECT name FROM sqlite_master WHERE type='table' AND name=?`
				)
				.get(tableName) as { name: string } | undefined;

			if (!tableExists) continue;

			// Get sample values
			let sampleValues: string[] = [];
			try {
				const samples = db
					.prepare(`SELECT DISTINCT value FROM ${tableName} WHERE value IS NOT NULL LIMIT 10`)
					.all() as { value: string | number | null }[];
				sampleValues = samples.map((s) => String(s.value)).filter((v) => v);
			} catch {
				// Some custom column tables might have different schemas
				continue;
			}

			if (sampleValues.length > 0) {
				columns.push({
					id: col.id,
					label: col.label,
					name: col.name,
					datatype: col.datatype,
					display: col.display,
					sampleValues
				});
			}
		}
	} catch (e) {
		log.warn('Failed to read custom columns', { error: String(e) });
	} finally {
		db.close();
	}

	return columns;
}

/**
 * Map a Calibre custom column value to our status system.
 * Tries common patterns in English and German.
 */
function mapCalibreStatus(value: string | null): string {
	if (!value) return 'planned';
	const lower = value.toLowerCase().trim();

	// Boolean: true = completed
	if (lower === 'true' || lower === '1' || lower === 'yes' || lower === 'ja') return 'completed';
	if (lower === 'false' || lower === '0' || lower === 'no' || lower === 'nein') return 'planned';

	// English patterns
	if (/\b(read|finished|done|completed)\b/.test(lower)) return 'completed';
	if (/\b(reading|currently|in.?progress|started|active)\b/.test(lower)) return 'active';
	if (/\b(to.?read|want|wishlist|planned|tbr|backlog)\b/.test(lower)) return 'planned';
	if (/\b(paused|on.?hold|shelved)\b/.test(lower)) return 'paused';
	if (/\b(dropped|abandoned|dnf|did.?not.?finish)\b/.test(lower)) return 'dropped';

	// German patterns
	if (/\b(gelesen|fertig|abgeschlossen|beendet)\b/.test(lower)) return 'completed';
	if (/\b(lese|liest|angefangen|aktiv)\b/.test(lower)) return 'active';
	if (/\b(geplant|wunsch|möchte|will)\b/.test(lower)) return 'planned';
	if (/\b(pausiert|unterbrochen)\b/.test(lower)) return 'paused';
	if (/\b(abgebrochen|aufgegeben)\b/.test(lower)) return 'dropped';

	return 'planned';
}

/**
 * Parse all books from a Calibre metadata.db file.
 * If statusColumnId is provided, reads the custom column for reading status.
 */
export function parseCalibreDb(
	dbPath: string,
	statusColumnId: number | null = null
): CalibreBook[] {
	const db = new Database(dbPath, { readonly: true });

	try {
		const books = db
			.prepare(
				`SELECT
					b.id AS calibre_id,
					b.title,
					b.series_index,
					GROUP_CONCAT(DISTINCT a.name) AS author,
					(SELECT l.lang_code FROM books_languages_link bll
					 JOIN languages l ON l.id = bll.lang_code
					 WHERE bll.book = b.id LIMIT 1) AS language,
					(SELECT i.val FROM identifiers i
					 WHERE i.book = b.id AND i.type = 'isbn' LIMIT 1) AS isbn,
					b.has_cover,
					b.path,
					(SELECT s.name FROM books_series_link bsl
					 JOIN series s ON s.id = bsl.series
					 WHERE bsl.book = b.id LIMIT 1) AS series_name
				FROM books b
				LEFT JOIN books_authors_link bal ON bal.book = b.id
				LEFT JOIN authors a ON a.id = bal.author
				GROUP BY b.id
				ORDER BY b.sort`
			)
			.all() as {
			calibre_id: number;
			title: string;
			series_index: number | null;
			author: string | null;
			language: string | null;
			isbn: string | null;
			has_cover: number;
			path: string;
			series_name: string | null;
		}[];

		// Read tags for all books
		const tagsMap = new Map<number, string[]>();
		try {
			const tagRows = db
				.prepare(
					`SELECT btl.book, t.name
					 FROM books_tags_link btl
					 JOIN tags t ON t.id = btl.tag
					 ORDER BY t.name`
				)
				.all() as { book: number; name: string }[];
			for (const row of tagRows) {
				const existing = tagsMap.get(row.book) || [];
				existing.push(row.name);
				tagsMap.set(row.book, existing);
			}
		} catch {
			// tags table might not exist
		}

		// Try to get page count from a common custom column or the comments table
		// Calibre doesn't have a built-in pages field - it's typically a custom column
		const pagesColumnId = findPagesColumn(db);

		// Read status values if a column was selected
		const statusMap = new Map<number, string>();
		if (statusColumnId) {
			try {
				const statusRows = db
					.prepare(`SELECT book, value FROM custom_column_${statusColumnId}`)
					.all() as { book: number; value: string | number | null }[];
				for (const row of statusRows) {
					statusMap.set(row.book, String(row.value));
				}
			} catch (e) {
				log.warn('Failed to read status column', { columnId: statusColumnId, error: String(e) });
			}
		}

		// Read pages if available
		const pagesMap = new Map<number, string>();
		if (pagesColumnId) {
			try {
				const pageRows = db
					.prepare(`SELECT book, value FROM custom_column_${pagesColumnId}`)
					.all() as { book: number; value: number | null }[];
				for (const row of pageRows) {
					if (row.value) pagesMap.set(row.book, String(row.value));
				}
			} catch {
				// ignore
			}
		}

		return books.map((b) => ({
			calibreId: b.calibre_id,
			title: b.title || '',
			author: b.author || '',
			language: mapLanguage(b.language || ''),
			isbn: b.isbn || '',
			pages: pagesMap.get(b.calibre_id) || '',
			hasCover: b.has_cover === 1,
			path: b.path || '',
			status: mapCalibreStatus(statusMap.get(b.calibre_id) || null),
			tags: tagsMap.get(b.calibre_id) || [],
			series: b.series_name || null,
			seriesIndex: b.series_name ? (b.series_index ?? null) : null
		}));
	} finally {
		db.close();
	}
}

/**
 * Look for a custom column that likely contains page counts.
 */
function findPagesColumn(db: Database): number | null {
	try {
		const cols = db
			.prepare(
				`SELECT id, label, name FROM custom_columns
				 WHERE datatype IN ('int', 'float')
				 AND (lower(label) LIKE '%page%' OR lower(name) LIKE '%page%'
					OR lower(label) LIKE '%seit%' OR lower(name) LIKE '%seit%')`
			)
			.all() as { id: number; label: string; name: string }[];
		return cols.length > 0 ? cols[0].id : null;
	} catch {
		return null;
	}
}
