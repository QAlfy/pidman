import { ChildProcess, spawn } from 'child_process';
import {
	fromEvent,
	merge,
	Observable,
	of,
	Subject,
	from
} from 'rxjs';
import { get, reduce } from 'lodash';
import {
	JsonProperty,
	Serializable,
	serialize
} from 'typescript-json-serializer';
import { PidmanGroup, PidmanMonitor } from './';
import { PidmanLogger } from '../utils/logger';
import {
	PidmanStringUtils,
	PidmanSysUtils,
	PidmanProcessUtils
} from '../utils';
import {
	catchError,
	scan,
	map,
	skipUntil,
	multicast,
	refCount,
} from 'rxjs/operators';

export type KillSignals = NodeJS.Signals;
type ProcessEventSubscriptions = Record<string, Observable<unknown>>;

export interface ProcessOptions {
	id?: string;
	user?: string;
	group?: string;
	command: string;
	arguments?: Array<string>;
	envVars?: {};
	path?: string;
	shell?: boolean | string;
	killSignal?: NodeJS.Signals;
	monitor?: PidmanMonitor;
	timeout?: number;
}

@Serializable()
export class PidmanProcess {
	#subscriptionsMap: ProcessEventSubscriptions;
	#closeEvent: Observable<[]>;
	#errorEvent: Observable<unknown>;
	#stderrEvent: Observable<unknown>;
	#dataEvent: Observable<unknown>;
	child: ChildProcess | undefined;
	group: PidmanGroup | undefined;

	/**
	 * @param  {ProcessOptions} privateoptions
	 */
	constructor(@JsonProperty() private options: ProcessOptions) {
		if (!this.options.id) {
			this.options.id = PidmanStringUtils.getId();
		}

		if (!this.options.killSignal) {
			this.options.killSignal = 'SIGTERM';
		}

		this.#dataEvent = new Observable();
		this.#closeEvent = new Observable();
		this.#errorEvent = new Observable();
		this.#stderrEvent = new Observable();
		this.#subscriptionsMap = {};
	}

	/**
	 * @param  {PidmanGroup} group
	 * @returns void
	 */
	setGroup(group: PidmanGroup): void {
		this.group = group;

		if (!this.options.user) {
			this.options.user = this.group.getOptions().user;
		}

		if (!this.options.group) {
			this.options.group = this.group.getOptions().group;
		}

		if (!this.options.envVars) {
			this.options.envVars = this.group.getOptions().envVars;
		}
	}

	/**
	 * @returns PidmanGroup
	 */
	getGroup(): PidmanGroup | undefined {
		return this.group;
	}

	/**
	 * @returns ProcessOptions
	 */
	getOptions(): ProcessOptions {
		return this.options;
	}

	/**
	 * @returns ChildProcess
	 */
	getChildProcess(): ChildProcess | undefined {
		return this.child;
	}

	/**
	 * @returns void
	 */
	run(): void {
		PidmanLogger.instance().info([
			`starting process ${this.options.id} as:`,
			JSON.stringify(this.serialize())
		].join(' '));

		this.child = spawn(this.options.command, this.options.arguments || [], {
			uid:
				(!this.options.user && undefined) ||
				PidmanSysUtils.getUid(this.options.user || ''),
			cwd: this.options.path,
			env: this.options.envVars || {},
			gid: PidmanSysUtils.getGid(this.options.group || ''),
			shell: this.options.shell || false,
			detached: true,
			windowsHide: true
		});

		this.child.unref();

		// let's handle all important events; don't miss anything
		this.#dataEvent = fromEvent(this.child.stdout!, 'data');
		this.#errorEvent = fromEvent(this.child, 'error');
		this.#closeEvent = fromEvent(this.child, 'close');
		this.#stderrEvent = fromEvent(this.child.stderr!, 'data');

		this.startMonitoring();
	}

	/**
	 * @returns void
	 */
	startMonitoring(): void {
		const metadata = {
			process: this,
			pid: this.child?.pid,
			time: Date.now()
		};

		// emit when new data goes to stdout
		const processDataEvent$ = this.#dataEvent
			.pipe(
				multicast(new Subject()), refCount()
			);

		processDataEvent$.subscribe(this.group?.options.monitor?.onData);
		processDataEvent$.subscribe(this.options.monitor?.onData);

		// emit concatenated version of error/close info and exit codes
		const processCloseEvent$ = merge(
			this.#errorEvent,
			this.#stderrEvent,
			this.#closeEvent.pipe(
				map((data: Array<unknown>) => ({
					exitCode: data[0],
					signalCode: data[1]
				}))
			),
		)
			.pipe(
				scan((acc: any, data: any) => ([...acc, data]), []),
				skipUntil(this.#closeEvent),
				catchError(error => of(error))
			)
			.pipe(
				map(data => {
					/*
					handle various types of process termination
					(e.g. a program goes into daemon mode).
					*/
					let output = { message: '' };

					output = reduce(data, (acc, val) => {
						if (val instanceof Buffer) {
							acc.message += val.toString();
						} else if (val instanceof Object) {
							acc = { ...acc, ...val };
						}

						return acc;
					}, output);

					return ({
						...output,
						...metadata
					})
				}),
				multicast(new Subject()), refCount()
			);

		processCloseEvent$.subscribe(this.options.monitor?.onComplete);
		processCloseEvent$.subscribe(this.group?.options.monitor?.onComplete);
	}

	/**
	 * @param  {NodeJS.Signals} signal?
	 * @returns Promise
	 */
	kill(signal?: NodeJS.Signals, callback?: void): boolean {
		let killed = false;

		if (this.child) {
			const exitCode = get(this.child, 'exitCode');

			if (exitCode === null) {
				const childrenKilled$ = from(
					PidmanProcessUtils.killTree(this.child?.pid)
				).pipe(
					multicast(new Subject()), refCount()
				);

				childrenKilled$.subscribe(success => {
					signal = signal || this.options.killSignal;
					killed = this.child && this.child.kill(signal) || false;

					if (killed) {
						PidmanLogger.instance().info([
							`killed process ${this.options.id}`,
							`(PID: ${this.child?.pid})`,
							`with signal ${signal}`
						].join(' '));
					} else {
						PidmanLogger.instance().error([
							`unable to kill process ${this.options.id}`,
							`(PID: ${this.child?.pid})`,
							`with signal ${signal}`
						].join(' '));
					}
				});
			} else {
				PidmanLogger.instance().info([
					`process ${this.options.id}`,
					`(PID: ${this.child?.pid})`,
					`has already exited with code ${exitCode}.`,
					'PID might be not longer ours',
					'or process has been daemonized.'
				].join(' '));
			}
		}

		return killed;
	}

	serialize(): unknown {
		return serialize(this);
	}

	deserialize(json): PidmanProcess {
		return new PidmanProcess(json.options as ProcessOptions);
	}
}
