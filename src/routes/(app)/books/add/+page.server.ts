import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { addBook } from '$lib/server/services/book-service';
import { addBookToLibrary } from '$lib/server/db/library';
import { validateRequired } from '$lib/server/utils/validation';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = locals.user!;
		const data = await request.formData();
		const title = (data.get('title') as string) || '';
		const language = (data.get('language') as string) || 'en';
		const authorsRaw = (data.get('authors') as string) || '';
		const description = (data.get('description') as string) || '';
		const coverUrl = (data.get('cover_url') as string) || '';

		const errors: Record<string, string> = {};

		const titleError = validateRequired(title, 'Title');
		if (titleError) errors.title = titleError;

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, title, language, authors: authorsRaw, description, coverUrl });
		}

		const authors = authorsRaw
			.split(',')
			.map((a) => a.trim())
			.filter((a) => a.length > 0);

		const bookId = addBook({
			original_title: title.trim(),
			original_language: language.trim(),
			authors,
			description: description.trim() || null,
			cover_url: coverUrl.trim() || null
		});

		addBookToLibrary(user.id, bookId);

		throw redirect(302, `/books/${bookId}`);
	}
};
