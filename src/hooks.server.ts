import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { validateSession } from '$lib/server/services/auth-service';
import { createLogger } from '$lib/server/utils/logger';

const log = createLogger('hooks');

const COOKIE_NAME = 'chapterlane_session';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(COOKIE_NAME);

	if (sessionId) {
		const result = validateSession(sessionId);
		if (result) {
			event.locals.user = result.user;
			event.locals.session = result.session;
		} else {
			event.cookies.delete(COOKIE_NAME, { path: '/' });
			event.locals.user = null;
			event.locals.session = null;
			log.debug('Invalid session cookie cleared');
		}
	} else {
		event.locals.user = null;
		event.locals.session = null;
	}

	return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

export const handle: Handle = sequence(handleAuth, handleParaglide);
