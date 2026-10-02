export function shouldUseSecureCookies(): boolean {
	const value = process.env.COOKIE_SECURE?.toLowerCase();

	if (value === 'true' || value === '1' || value === 'yes') return true;
	if (value === 'false' || value === '0' || value === 'no') return false;

	return process.env.NODE_ENV === 'production';
}
