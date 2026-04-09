import type { User } from '$lib/types'
import { db } from './connection'

const insertUser = db.prepare(`
	INSERT INTO users (id, username, email, password_hash, display_name, preferred_language)
	VALUES (?, ?, ?, ?, ?, ?)
`)

const selectByEmail = db.prepare('SELECT * FROM users WHERE email = ?')
const selectByUsername = db.prepare('SELECT * FROM users WHERE username = ?')
const selectById = db.prepare('SELECT * FROM users WHERE id = ?')

const updateUserStmt = db.prepare(`
	UPDATE users
	SET display_name = ?, avatar_url = ?, bio = ?, preferred_language = ?,
		profile_visibility = ?, updated_at = datetime('now')
	WHERE id = ?
`)

export function createUser(
	id: string,
	username: string,
	email: string,
	passwordHash: string,
	displayName: string | null = null,
	preferredLanguage: string = 'en'
): void {
	insertUser.run(id, username, email.toLowerCase(), passwordHash, displayName, preferredLanguage)
}

export function getUserByEmail(email: string): User | null {
	return (selectByEmail.get(email.toLowerCase()) as User) ?? null
}

export function getUserByUsername(username: string): User | null {
	return (selectByUsername.get(username) as User) ?? null
}

export function getUserById(id: string): User | null {
	return (selectById.get(id) as User) ?? null
}

export function getUserWithHash(email: string): (User & { password_hash: string }) | null {
	return (selectByEmail.get(email.toLowerCase()) as (User & { password_hash: string })) ?? null
}

export function updateUser(
	id: string,
	data: {
		display_name?: string | null
		avatar_url?: string | null
		bio?: string | null
		preferred_language?: string
		profile_visibility?: string
	}
): void {
	const user = getUserById(id)
	if (!user) return

	updateUserStmt.run(
		data.display_name ?? user.display_name,
		data.avatar_url ?? user.avatar_url,
		data.bio ?? user.bio,
		data.preferred_language ?? user.preferred_language,
		data.profile_visibility ?? user.profile_visibility,
		id
	)
}
