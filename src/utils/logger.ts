import { ConsoleTransportInstance } from 'winston/lib/winston/transports';
import { createLogger, Logger, transports } from 'winston';

export enum LoggerLevel {
	emerg = 'emerg',
	alert = 'alert',
	crit = 'crit',
	error = 'error',
	warning = 'warning',
	notice = 'notice',
	info = 'info',
	debug = 'debug'
}

export interface LoggerOptions {
	// See https://github.com/winstonjs/winston/blob/master/docs/transports.md
	transport?: ConsoleTransportInstance;
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
			transports: [this.options?.transport! || new transports.Console()],
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
}
