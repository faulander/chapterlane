type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogRecord {
	timestamp: string;
	level: LogLevel;
	module: string;
	message: string;
	data?: unknown;
}

const LEVELS: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'debug';

let sink: ((record: LogRecord) => void) | null = null;

/** Registers a persistence target for every record that passes LOG_LEVEL. */
export function setLogSink(next: ((record: LogRecord) => void) | null): void {
	sink = next;
}

function shouldLog(level: LogLevel): boolean {
	return LEVELS[level] >= LEVELS[currentLevel];
}

function emit(level: LogLevel, module: string, message: string, data?: unknown): string {
	const record: LogRecord = { timestamp: new Date().toISOString(), level, module, message, data };
	sink?.(record);
	const base = `[${record.timestamp}] [${level.toUpperCase()}] [${module}] ${message}`;
	return data !== undefined ? `${base} ${JSON.stringify(data)}` : base;
}

export function createLogger(module: string) {
	return {
		debug(message: string, data?: unknown) {
			if (shouldLog('debug')) console.debug(emit('debug', module, message, data));
		},
		info(message: string, data?: unknown) {
			if (shouldLog('info')) console.info(emit('info', module, message, data));
		},
		warn(message: string, data?: unknown) {
			if (shouldLog('warn')) console.warn(emit('warn', module, message, data));
		},
		error(message: string, data?: unknown) {
			if (shouldLog('error')) console.error(emit('error', module, message, data));
		}
	};
}
