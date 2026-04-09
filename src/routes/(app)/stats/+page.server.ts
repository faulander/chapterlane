import type { PageServerLoad } from './$types';
import {
	getBooksCompletedByMonth,
	getPagesReadByMonth,
	getBooksByLanguage,
	getBooksByStatus,
	getTopAuthors,
	getAveragePages,
	getActiveReadsCount,
	getBooksByReadingPlace
} from '$lib/server/db/stats';
import { getUserBookCount } from '$lib/server/db/library';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = locals.user!;
	const year = parseInt(url.searchParams.get('year') || String(new Date().getFullYear()), 10);

	return {
		year,
		totalBooks: getUserBookCount(user.id),
		activeReads: getActiveReadsCount(user.id),
		avgPages: getAveragePages(user.id),
		completedByMonth: getBooksCompletedByMonth(user.id, year),
		pagesReadByMonth: getPagesReadByMonth(user.id, year),
		byLanguage: getBooksByLanguage(user.id),
		byStatus: getBooksByStatus(user.id),
		topAuthors: getTopAuthors(user.id),
		byReadingPlace: getBooksByReadingPlace(user.id)
	};
};
