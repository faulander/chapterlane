import type { User } from '$lib/types';
import { getDb } from './connection';

export function createUser(
	id: string,
	username: string,
	email: string,
	passwordHash: string,
	displayName: string | null = null,
	preferredLanguage: string = 'en'
): void {
	getDb()
		.prepare(
			`INSERT INTO users (id, username, email, password_hash, display_name, preferred_language)
		VALUES (?, ?, ?, ?, ?, ?)`
		)
		.run(id, username, email.toLowerCase(), passwordHash, displayName, preferredLanguage);
}

export function getUserByEmail(email: string): User | null {
	return (
		(getDb().prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as User) ??
		null
	);
}

export function getUserByUsername(username: string): User | null {
	return (getDb().prepare('SELECT * FROM users WHERE username = ?').get(username) as User) ?? null;
}

export function getUserById(id: string): User | null {
	return (getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as User) ?? null;
}

export function getUserWithHash(email: string): (User & { password_hash: string }) | null {
	return (
		(getDb().prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as User & {
			password_hash: string;
		}) ?? null
	);
}

export function updateUser(
	id: string,
	data: {
		display_name?: string | null;
		avatar_url?: string | null;
		bio?: string | null;
		preferred_language?: string;
		profile_visibility?: string;
	}
): void {
	const user = getUserById(id);
	if (!user) return;

	getDb()
		.prepare(
			`UPDATE users
		SET display_name = ?, avatar_url = ?, bio = ?, preferred_language = ?,
			profile_visibility = ?, updated_at = datetime('now')
		WHERE id = ?`
		)
		.run(
			data.display_name ?? user.display_name,
			data.avatar_url ?? user.avatar_url,
			data.bio ?? user.bio,
			data.preferred_language ?? user.preferred_language,
			data.profile_visibility ?? user.profile_visibility,
			id
		);
}

/** Sets (or clears with null) the number of books the user wants to finish each year. */
export function setYearlyBookGoal(id: string, goal: number | null): void {
	getDb()
		.prepare("UPDATE users SET yearly_book_goal = ?, updated_at = datetime('now') WHERE id = ?")
		.run(goal, id);
}
