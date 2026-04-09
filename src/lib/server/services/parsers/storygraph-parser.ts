import { parseCSV } from './csv';

export interface StorygraphRow {
	title: string;
	author: string;
	isbn: string;
	pages: string;
	dateRead: string;
	dateAdded: string;
	status: string;
}

const STATUS_MAP: Record<string, string> = {
	'to-read': 'planned',
	'currently-reading': 'active',
	read: 'completed',
	dnf: 'dropped'
};

export function parseStorygraphCSV(text: string): StorygraphRow[] {
	const rows = parseCSV(text);
	return rows.map((row) => ({
		title: row['Title'] || '',
		author: row['Authors'] || row['Author'] || '',
		isbn: (row['ISBN/UID'] || row['ISBN'] || '').replace(/[="]/g, ''),
		pages: row['Number of Pages'] || row['Pages'] || '',
		dateRead: row['Last Date Read'] || row['Date Read'] || '',
		dateAdded: row['Date Added'] || '',
		status: row['Read Status'] || row['Exclusive Shelf'] || ''
	}));
}

export function mapStorygraphStatus(status: string): string {
	return STATUS_MAP[status.toLowerCase()] || 'planned';
}
