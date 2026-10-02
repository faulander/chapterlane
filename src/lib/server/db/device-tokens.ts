import { createHash, randomBytes } from 'node:crypto';
import { getDb } from './connection';
import { generateId } from '../utils/crypto';

export interface DeviceToken {
	id: string;
	name: string;
	created_at: string;
}

export function createDeviceToken(userId: string, name: string): string {
	const secret = randomBytes(32).toString('base64url');
	getDb()
		.prepare('INSERT INTO device_tokens (id, user_id, name, token_hash) VALUES (?, ?, ?, ?)')
		.run(generateId(), userId, name, createHash('sha256').update(secret).digest('hex'));
	return secret;
}

export function getDeviceTokenUser(token: string): { tokenId: string; userId: string } | null {
	if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
	const row = getDb()
		.prepare('SELECT id, user_id FROM device_tokens WHERE token_hash = ?')
		.get(createHash('sha256').update(token).digest('hex')) as {
		id: string;
		user_id: string;
	} | null;
	return row ? { tokenId: row.id, userId: row.user_id } : null;
}

export function listDeviceTokens(userId: string): DeviceToken[] {
	return getDb()
		.prepare(
			'SELECT id, name, created_at FROM device_tokens WHERE user_id = ? ORDER BY created_at DESC'
		)
		.all(userId) as DeviceToken[];
}

export function revokeDeviceToken(userId: string, tokenId: string): void {
	getDb().prepare('DELETE FROM device_tokens WHERE id = ? AND user_id = ?').run(tokenId, userId);
}
