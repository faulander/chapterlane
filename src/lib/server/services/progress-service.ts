import { createLogger } from '../utils/logger';
import { createProgressEntry } from '../db/progress';
import { getUserBookById, updateUserBook } from '../db/library';
import { getBookById } from '../db/books';
import { getStatusById } from '../db/statuses';
import { emitProgressLogged, emitProgressMilestone } from './feed-service';

const log = createLogger('progress');

export interface LogProgressInput {
	userBookId: string;
	page?: number | null;
	percent?: number | null;
	readingPlaceId?: string | null;
	note?: string | null;
}

export function logProgress(
	input: LogProgressInput
): { success: true } | { success: false; error: string } {
	const userBook = getUserBookById(input.userBookId);
	if (!userBook) return { success: false, error: 'Book not found in library' };

	// Check that book is in an Active status
	if (userBook.current_status_id) {
		const status = getStatusById(userBook.current_status_id);
		if (status && status.system_category !== 'active') {
			return {
				success: false,
				error: 'Progress can only be logged for books with an Active status'
			};
		}
	}

	// Calculate percent from page if possible
	let percent = input.percent ?? null;
	const page = input.page ?? null;

	if (page !== null && userBook.user_total_pages && !percent) {
		percent = Math.round((page / userBook.user_total_pages) * 10000) / 100;
	}

	createProgressEntry({
		user_book_id: input.userBookId,
		page,
		percent,
		reading_place_id: input.readingPlaceId,
		note: input.note
	});

	// Update current progress on user_books
	updateUserBook(input.userBookId, {
		current_page: page ?? userBook.current_page,
		current_percent: percent ?? userBook.current_percent
	});

	// Emit activity events
	const book = getBookById(userBook.book_id);
	if (book) {
		emitProgressLogged(userBook.user_id, input.userBookId, book.original_title, page, percent);
		if (percent !== null) {
			emitProgressMilestone(userBook.user_id, input.userBookId, book.original_title, percent);
		}
	}

	log.info('Progress logged', {
		userBookId: input.userBookId,
		page,
		percent
	});

	return { success: true };
}
