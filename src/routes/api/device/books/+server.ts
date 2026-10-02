import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDeviceTokenUser } from '$lib/server/db/device-tokens';
import { getUserBooks } from '$lib/server/db/library';

export const GET: RequestHandler = ({ request }) => {
	const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(request.headers.get('authorization') ?? '');
	const credentials = match && getDeviceTokenUser(match[1]);
	if (!credentials) return json({ error: 'Unauthorized' }, { status: 401 });

	return json({
		books: getUserBooks(credentials.userId).map((book) => ({
			book_id: book.book_id,
			title: book.display_title,
			authors: book.authors,
			status: book.system_category,
			percent: book.current_percent
		}))
	});
};
