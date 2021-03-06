import { ConsoleTransportInstance } from 'winston/lib/winston/transports';
import { createLogger, Logger, transports, format } from 'winston';

const { combine, timestamp, label, printf } = format;
const pidmanLogFormat = printf(({ level, message, label, timestamp }) => {
	return `${timestamp} [${label}] ${level}: ${message}`;
});

/** The different log levels. */
export enum LoggerLevel {
	error = 'error',
	warning = 'warning',
	notice = 'notice',
	info = 'info'
}

/** The [[PidmanLogger]]'s options. */
export type LoggerOptions = {
	/** See https://github.com/winstonjs/winston/blob/master/docs/transports.md */
	transport?: ConsoleTransportInstance;
	/** (optional) The default minimum log level. */
	level?: LoggerLevel;
}

export class PidmanLogger {
	static _instance: PidmanLogger;
	#logger: Logger;

	constructor(private options?: LoggerOptions) {
		if (!options) {
			this.options = {};
		}

		if (!this.options?.transport) {
			this.options!.transport = new transports.Console();
		}

		if (!this.options?.level) {
			this.options!.level = LoggerLevel.info;
		}

		this.#logger = createLogger({
			format: combine(
				label({ label: 'Pidman' }),
				timestamp(),
				pidmanLogFormat
			),
			transports: [this.options?.transport! || new transports.Console()],
			exceptionHandlers: [this.options?.transport!
				|| new transports.Console()],
			exitOnError: false,
			level: this.options?.level
		});

		PidmanLogger._instance = this;
	}

	static instance(options?: LoggerOptions): PidmanLogger {
		if (!PidmanLogger._instance) {
			PidmanLogger._instance = new PidmanLogger(options);
		}

		return PidmanLogger._instance;
	}

	info(msg: string): void {
		this.#logger.log('info', msg);

	}

	error(msg: string): void {
		this.#logger.log('error', msg);

	}

	warn(msg: string): void {
		this.#logger.log('warn', msg);

	}
}
