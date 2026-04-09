import { parseCSV } from './csv';

export interface GoodreadsRow {
	title: string;
	author: string;
	isbn: string;
	isbn13: string;
	myRating: string;
	numberOfPages: string;
	dateRead: string;
	dateAdded: string;
	exclusiveShelf: string;
	bookshelves: string;
}

const STATUS_MAP: Record<string, string> = {
	'to-read': 'planned',
	'currently-reading': 'active',
	read: 'completed'
};

export function parseGoodreadsCSV(text: string): GoodreadsRow[] {
	const rows = parseCSV(text);
	return rows.map((row) => ({
		title: row['Title'] || '',
		author: row['Author'] || row['Author l-f'] || '',
		isbn: (row['ISBN'] || '').replace(/[="]/g, ''),
		isbn13: (row['ISBN13'] || '').replace(/[="]/g, ''),
		myRating: row['My Rating'] || '',
		numberOfPages: row['Number of Pages'] || '',
		dateRead: row['Date Read'] || '',
		dateAdded: row['Date Added'] || '',
		exclusiveShelf: row['Exclusive Shelf'] || '',
		bookshelves: row['Bookshelves'] || ''
	}));
}

export function mapGoodreadsStatus(exclusiveShelf: string): string {
	return STATUS_MAP[exclusiveShelf] || 'planned';
}
