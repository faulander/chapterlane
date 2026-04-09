type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'debug';

function shouldLog(level: LogLevel): boolean {
	return LEVELS[level] >= LEVELS[currentLevel];
}

function timestamp(): string {
	return new Date().toISOString();
}

function formatMessage(level: LogLevel, module: string, message: string, data?: unknown): string {
	const base = `[${timestamp()}] [${level.toUpperCase()}] [${module}] ${message}`;
	if (data !== undefined) {
		return `${base} ${JSON.stringify(data)}`;
	}
	return base;
}

export function createLogger(module: string) {
	return {
		debug(message: string, data?: unknown) {
			if (shouldLog('debug')) console.debug(formatMessage('debug', module, message, data));
		},
		info(message: string, data?: unknown) {
			if (shouldLog('info')) console.info(formatMessage('info', module, message, data));
		},
		warn(message: string, data?: unknown) {
			if (shouldLog('warn')) console.warn(formatMessage('warn', module, message, data));
		},
		error(message: string, data?: unknown) {
			if (shouldLog('error')) console.error(formatMessage('error', module, message, data));
		}
	};
}
