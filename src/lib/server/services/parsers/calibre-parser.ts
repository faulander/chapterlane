import { parseCSV } from './csv';

export interface CalibreRow {
	title: string;
	author: string;
	language: string;
	isbn: string;
	pages: string;
	tags: string;
}

export function parseCalibreCSV(text: string): CalibreRow[] {
	const rows = parseCSV(text);
	return rows.map((row) => ({
		title: row['title'] || row['Title'] || '',
		author: row['authors'] || row['Authors'] || row['author_sort'] || '',
		language: row['languages'] || row['language'] || '',
		isbn: (row['isbn'] || row['ISBN'] || '').replace(/[="]/g, ''),
		pages: row['pages'] || row['Pages'] || '',
		tags: row['tags'] || row['Tags'] || ''
	}));
}
