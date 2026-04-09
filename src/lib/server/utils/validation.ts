export function validateEmail(email: string): string | null {
	if (!email || typeof email !== 'string') return 'Email is required'
	const trimmed = email.trim()
	if (trimmed.length === 0) return 'Email is required'
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Invalid email address'
	if (trimmed.length > 254) return 'Email is too long'
	return null
}

export function validatePassword(password: string): string | null {
	if (!password || typeof password !== 'string') return 'Password is required'
	if (password.length < 8) return 'Password must be at least 8 characters'
	if (password.length > 128) return 'Password is too long'
	return null
}

export function validateUsername(username: string): string | null {
	if (!username || typeof username !== 'string') return 'Username is required'
	const trimmed = username.trim()
	if (trimmed.length < 3) return 'Username must be at least 3 characters'
	if (trimmed.length > 30) return 'Username must be at most 30 characters'
	if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) return 'Username can only contain letters, numbers, hyphens, and underscores'
	return null
}

export function validateRequired(value: string | null | undefined, fieldName: string): string | null {
	if (!value || (typeof value === 'string' && value.trim().length === 0)) {
		return `${fieldName} is required`
	}
	return null
}
