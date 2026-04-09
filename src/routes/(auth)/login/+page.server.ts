import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { login } from '$lib/server/services/auth-service';
import { validateEmail, validatePassword } from '$lib/server/utils/validation';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) throw redirect(302, '/dashboard');
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = (data.get('email') as string) || '';
		const password = (data.get('password') as string) || '';

		const errors: Record<string, string> = {};

		const emailError = validateEmail(email);
		if (emailError) errors.email = emailError;

		const passwordError = validatePassword(password);
		if (passwordError) errors.password = passwordError;

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, email });
		}

		const result = await login(email, password);

		if (!result.success) {
			return fail(400, { errors: { form: result.error.message } as Record<string, string>, email });
		}

		cookies.set('chapterlane_session', result.data.sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			expires: result.data.expiresAt
		});

		throw redirect(302, '/dashboard');
	}
};
