import type { Session } from '$lib/types'
import { db } from './connection'

const insertSession = db.prepare(`
	INSERT INTO sessions (id, user_id, expires_at)
	VALUES (?, ?, ?)
`)

const selectSession = db.prepare(`
	SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')
`)

const deleteSessionStmt = db.prepare('DELETE FROM sessions WHERE id = ?')

const deleteUserSessions = db.prepare('DELETE FROM sessions WHERE user_id = ?')

const deleteExpired = db.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')")

export function createSession(id: string, userId: string, expiresAt: Date): void {
	insertSession.run(id, userId, expiresAt.toISOString())
}

export function getSession(id: string): Session | null {
	return (selectSession.get(id) as Session) ?? null
}

export function deleteSession(id: string): void {
	deleteSessionStmt.run(id)
}

export function deleteAllUserSessions(userId: string): void {
	deleteUserSessions.run(userId)
}

export function deleteExpiredSessions(): void {
	deleteExpired.run()
}
