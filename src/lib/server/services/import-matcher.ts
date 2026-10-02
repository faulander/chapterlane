import { searchFTS } from '../db/search';
import { getBookById, findBooksByExactTitle } from '../db/books';
import { getAuthorsForBook } from '../db/authors';
import { createLogger } from '../utils/logger';

const log = createLogger('import-matcher');

export interface MatchResult {
	bookId: string | null;
	confidence: number;
}

export function matchBook(title: string, author: string): MatchResult {
	if (!title) return { bookId: null, confidence: 0 };

	// Exact-title fast path: FTS tokenization can miss identical title+author
	// pairs (punctuation-heavy titles, long queries where every token must
	// match). Check for a literal (case/whitespace-insensitive) title match
	// directly before falling back to fuzzy search.
	const exactCandidates = findBooksByExactTitle(title);
	if (exactCandidates.length > 0) {
		if (!author) {
			return { bookId: exactCandidates[0].id, confidence: 1 };
		}
		for (const candidate of exactCandidates) {
			const authorNames = getAuthorsForBook(candidate.id).map((a) => a.name.toLowerCase());
			if (authorNames.some((an) => fuzzyMatch(author.toLowerCase(), an) > 0.5)) {
				return { bookId: candidate.id, confidence: 1 };
			}
		}
	}

	const query = `${title} ${author}`.trim();
	const results = searchFTS(query, 5);

	// Score the best match
	for (const result of results) {
		const book = getBookById(result.book_id);
		if (!book) continue;

		const authors = getAuthorsForBook(result.book_id);
		const authorNames = authors.map((a) => a.name.toLowerCase());

		const titleMatch = fuzzyMatch(title.toLowerCase(), book.original_title.toLowerCase());
		const authorMatch = author
			? authorNames.some((an) => fuzzyMatch(author.toLowerCase(), an) > 0.5)
				? 0.3
				: 0
			: 0.1;

		const confidence = Math.min(titleMatch + authorMatch, 1);

		if (confidence > 0.3) {
			log.debug('Match found', { title, bookId: result.book_id, confidence });
			return { bookId: result.book_id, confidence };
		}
	}

	return { bookId: null, confidence: 0 };
}

function fuzzyMatch(a: string, b: string): number {
	if (a === b) return 1;
	if (a.includes(b) || b.includes(a)) return 0.8;

	// Simple word overlap score
	const wordsA = new Set(a.split(/\s+/).filter((w) => w.length > 2));
	const wordsB = new Set(b.split(/\s+/).filter((w) => w.length > 2));
	if (wordsA.size === 0 || wordsB.size === 0) return 0;

	let overlap = 0;
	for (const word of wordsA) {
		if (wordsB.has(word)) overlap++;
	}

	return overlap / Math.max(wordsA.size, wordsB.size);
}
