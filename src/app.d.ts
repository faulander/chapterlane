import type { User, Session } from '$lib/types';
import type { Appearance } from '$lib/themes';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User | null;
			session: Session | null;
			appearance: Appearance;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
