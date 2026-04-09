import { createLogger } from '../utils/logger'
import { generateId } from '../utils/crypto'
import {
	createUser,
	getUserByEmail,
	getUserById,
	getUserByUsername,
	getUserWithHash
} from '../db/users'
import {
	createSession,
	getSession,
	deleteSession as removeSession,
	deleteExpiredSessions
} from '../db/sessions'
import type { User, Session } from '$lib/types'

const log = createLogger('auth')

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export interface AuthResult {
	user: User
	session: Session
	sessionId: string
	expiresAt: Date
}

export interface AuthError {
	field?: string
	message: string
}

export async function register(
	username: string,
	email: string,
	password: string,
	preferredLanguage: string = 'en'
): Promise<{ success: true; data: AuthResult } | { success: false; error: AuthError }> {
	const existingEmail = getUserByEmail(email)
	if (existingEmail) {
		log.warn('Registration failed: email already taken', { email })
		return { success: false, error: { field: 'email', message: 'Email is already registered' } }
	}

	const existingUsername = getUserByUsername(username)
	if (existingUsername) {
		log.warn('Registration failed: username already taken', { username })
		return {
			success: false,
			error: { field: 'username', message: 'Username is already taken' }
		}
	}

	const passwordHash = await Bun.password.hash(password, 'argon2id')
	const userId = generateId()

	createUser(userId, username, email, passwordHash, username, preferredLanguage)
	log.info('User registered', { userId, username })

	const sessionData = createNewSession(userId)
	const user = getUserByEmail(email)!

	return { success: true, data: { user, ...sessionData } }
}

export async function login(
	email: string,
	password: string
): Promise<{ success: true; data: AuthResult } | { success: false; error: AuthError }> {
	const user = getUserWithHash(email)
	if (!user) {
		log.warn('Login failed: user not found', { email })
		return { success: false, error: { message: 'Invalid email or password' } }
	}

	const valid = await Bun.password.verify(password, user.password_hash)
	if (!valid) {
		log.warn('Login failed: invalid password', { email })
		return { success: false, error: { message: 'Invalid email or password' } }
	}

	const sessionData = createNewSession(user.id)
	log.info('User logged in', { userId: user.id })

	return {
		success: true,
		data: { user: stripHash(user), ...sessionData }
	}
}

export function logout(sessionId: string): void {
	removeSession(sessionId)
	log.info('Session deleted', { sessionId })
}

export function validateSession(
	sessionId: string
): { user: User; session: Session } | null {
	const session = getSession(sessionId)
	if (!session) return null

	const user = getUserById(session.user_id)
	if (!user) {
		removeSession(sessionId)
		return null
	}

	return { user, session }
}

export function cleanupExpiredSessions(): void {
	deleteExpiredSessions()
	log.debug('Expired sessions cleaned up')
}

function createNewSession(userId: string): {
	session: Session
	sessionId: string
	expiresAt: Date
} {
	const sessionId = generateId()
	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

	createSession(sessionId, userId, expiresAt)

	const session: Session = {
		id: sessionId,
		user_id: userId,
		expires_at: expiresAt.toISOString(),
		created_at: new Date().toISOString()
	}

	return { session, sessionId, expiresAt }
}

function stripHash(user: User & { password_hash: string }): User {
	const { password_hash: _, ...rest } = user
	return rest
}
