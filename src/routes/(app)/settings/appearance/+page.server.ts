import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { setUserAppearance } from '$lib/server/db/users';
import { shouldUseSecureCookies } from '$lib/server/utils/cookies';
import {
	APPEARANCE_COOKIE,
	isColorMode,
	isThemeId,
	serializeAppearanceCookie,
	type Appearance
} from '$lib/themes';

export const actions: Actions = {
	/** Saves the theme and/or colour mode; a missing field keeps its current value. */
	default: async ({ request, locals, cookies }) => {
		const form = await request.formData();
		const theme = form.get('theme');
		const mode = form.get('mode');

		if ((theme !== null && !isThemeId(theme)) || (mode !== null && !isColorMode(mode))) {
			return fail(400, { error: true });
		}

		const next: Appearance = {
			theme: theme ?? locals.appearance.theme,
			mode: mode ?? locals.appearance.mode
		} as Appearance;

		setUserAppearance(locals.user!.id, next.theme, next.mode);
		cookies.set(APPEARANCE_COOKIE, serializeAppearanceCookie(next), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: shouldUseSecureCookies(),
			maxAge: 60 * 60 * 24 * 365
		});

		return { success: true };
	}
};
