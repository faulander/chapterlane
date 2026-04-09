import { resolve } from '$app/paths';
import { localizeHref } from '$lib/paraglide/runtime';

/**
 * Localize and resolve a path for navigation.
 * Wraps localizeHref with resolve() and handles dynamic paths
 * that don't match Paraglide's strict route type signature.
 */
export function href(path: string, options?: { locale?: string }): string {
	// @ts-expect-error -- localizeHref expects typed route literals, but we need dynamic paths
	return resolve(localizeHref(path, options));
}
