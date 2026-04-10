import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readCover } from '$lib/server/services/cover-storage';

export const GET: RequestHandler = async ({ params }) => {
	const data = readCover(params.bookId);
	if (!data) throw error(404, 'Cover not found');

	return new Response(new Uint8Array(data), {
		headers: {
			'Content-Type': 'image/jpeg',
			'Cache-Control': 'public, max-age=86400, immutable'
		}
	});
};
