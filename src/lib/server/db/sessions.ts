import type { Session } from '$lib/types';
import { getDb } from './connection';

export function createSession(id: string, userId: string, expiresAt: Date): void {
	getDb()
		.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
		.run(id, userId, expiresAt.toISOString());
}

export function getSession(id: string): Session | null {
	return (
		(getDb()
			.prepare("SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')")
			.get(id) as Session) ?? null
	);
}

export function deleteSession(id: string): void {
	getDb().prepare('DELETE FROM sessions WHERE id = ?').run(id);
}

export function deleteAllUserSessions(userId: string): void {
	getDb().prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}

export function deleteExpiredSessions(): void {
	getDb().prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')").run();
}
