import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { register } from '$lib/server/services/auth-service';
import { validateEmail, validatePassword, validateUsername } from '$lib/server/utils/validation';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) throw redirect(302, '/dashboard');
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = (data.get('username') as string) || '';
		const email = (data.get('email') as string) || '';
		const password = (data.get('password') as string) || '';
		const confirmPassword = (data.get('confirm_password') as string) || '';

		const errors: Record<string, string> = {};

		const usernameError = validateUsername(username);
		if (usernameError) errors.username = usernameError;

		const emailError = validateEmail(email);
		if (emailError) errors.email = emailError;

		const passwordError = validatePassword(password);
		if (passwordError) errors.password = passwordError;

		if (password !== confirmPassword) {
			errors.confirm_password = 'Passwords do not match';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, username, email });
		}

		const result = await register(username, email, password);

		if (!result.success) {
			return fail(400, {
				errors: { [result.error.field || 'form']: result.error.message },
				username,
				email
			});
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
