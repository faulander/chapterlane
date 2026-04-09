import { createLogger } from '../utils/logger';

const log = createLogger('google-books');

const API_BASE = 'https://www.googleapis.com/books/v1/volumes';

export interface GoogleBookResult {
	googleBooksId: string;
	title: string;
	authors: string[];
	language: string;
	description: string | null;
	coverUrl: string | null;
	pageCount: number | null;
	publishedDate: string | null;
}

export async function searchGoogleBooks(
	query: string,
	maxResults: number = 10
): Promise<GoogleBookResult[]> {
	if (!query.trim()) return [];

	const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
	const params = new URLSearchParams({
		q: query,
		maxResults: String(maxResults),
		printType: 'books'
	});
	if (apiKey) params.set('key', apiKey);

	const url = `${API_BASE}?${params}`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			log.warn('Google Books API error', { status: response.status });
			if (response.status === 429) {
				throw new Error('RATE_LIMITED');
			}
			return [];
		}

		const data = (await response.json()) as {
			totalItems: number;
			items?: Array<{
				id: string;
				volumeInfo: {
					title?: string;
					authors?: string[];
					language?: string;
					description?: string;
					imageLinks?: { thumbnail?: string; smallThumbnail?: string };
					pageCount?: number;
					publishedDate?: string;
				};
			}>;
		};

		if (!data.items) return [];

		return data.items.map((item) => ({
			googleBooksId: item.id,
			title: item.volumeInfo.title || 'Unknown',
			authors: item.volumeInfo.authors || [],
			language: item.volumeInfo.language || 'en',
			description: item.volumeInfo.description || null,
			coverUrl: item.volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
			pageCount: item.volumeInfo.pageCount || null,
			publishedDate: item.volumeInfo.publishedDate || null
		}));
	} catch (e) {
		if (e instanceof Error && e.message === 'RATE_LIMITED') throw e;
		log.error('Google Books search failed', { error: String(e) });
		return [];
	}
}
