import { ChildProcess, fork } from 'child_process';
import { ForkedMessage, ForkedMessageType } from './forked';
import {
	from,
	fromEvent,
	merge,
	Observable,
	of,
	Subject,
	Subscription
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
	PidmanProcessUtils,
	PidmanStringUtils,
	PidmanSysUtils
} from '../utils';
import { Promise as promise } from 'bluebird';
import {
	catchError,
	scan,
	map,
	skipUntil,
	multicast,
	refCount,
} from 'rxjs/operators';

export type KillSignals = NodeJS.Signals;
export type ProcessEventSubscriptions = Record<string, Subscription>;

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

		this.child = fork(`${__dirname}/forked.js`, undefined, {
			uid:
				(!this.options.user && undefined) ||
				PidmanSysUtils.getUid(this.options.user || ''),
			cwd: this.options.path,
			env: this.options.envVars || {},
			gid: PidmanSysUtils.getGid(this.options.group || ''),
			detached: true,
			stdio: [null, 'pipe', 'pipe', 'ipc'],
			silent: true
		});

		// initialize IPC channel (first handshake)
		this.child.send(
			new ForkedMessage(ForkedMessageType.options, this.options),
			(err) => {
				if (err) {
					PidmanLogger.instance().error(err.toString());
				}
			});

		this.child.on('message', (msg: ForkedMessage) => {
			if (msg.type === ForkedMessageType.started) {
				const pid = msg.body as number;

				console.log(pid);
			}

			if (msg.type === ForkedMessageType.complete) {
				console.log(msg.body);
			}

			if (msg.type === ForkedMessageType.data) {
				console.log(msg.body);
			}
		});

		this.child.unref();

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

		// let's handle all important events; don't miss anything
		this.#dataEvent = fromEvent(this.child?.stdout!, 'data');
		this.#errorEvent = fromEvent(this.child!, 'error');
		this.#closeEvent = fromEvent(this.child!, 'close');
		this.#stderrEvent = fromEvent(this.child!.stderr!, 'data');

		// emit when new data goes to stdout
		const processDataEvent$ = this.#dataEvent
			.pipe(
				multicast(new Subject()), refCount()
			);

		this.#subscriptionsMap.dataToSelf = processDataEvent$.subscribe(
			this.group?.options.monitor?.onData
		);
		this.#subscriptionsMap.dataToGroup = processDataEvent$.subscribe(
			this.options.monitor?.onData
		);

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

		this.#subscriptionsMap.closeToSelf = processCloseEvent$.subscribe(
			this.options.monitor?.onComplete
		);
		this.#subscriptionsMap.closeToGroup = processCloseEvent$.subscribe(
			this.group?.options.monitor?.onComplete
		);
	}

	/**
	 * @param  {NodeJS.Signals} signal?
	 * @returns Promise
	 */
	kill(signal?: NodeJS.Signals): Promise<boolean> {
		return new promise((resolve, reject) => {
			if (this.child) {
				let killed = false;
				const exitCode = get(this.child, 'exitCode');

				if (exitCode === null) {
					const childrenKilled$ = from(
						PidmanProcessUtils.killTree(this.child?.pid)
					).pipe(
						// @todo generate new channel to inform user
						multicast(new Subject()), refCount(),
						catchError(error => of(error))
					);

					const childrenKilledSub = childrenKilled$
						.subscribe(success => {
							signal = signal || this.options.killSignal;
							killed = this.child && this.child.kill(signal)
								|| false;

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

							childrenKilledSub.unsubscribe();
							this.unsubscribeAll();

							if (typeof success === 'boolean') {
								resolve(killed && success);
							} else {
								reject(success);
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

					resolve(false);
				}
			} else {
				resolve(false);
			}
		});
	}

	unsubscribeAll(): void {
		Object.keys(this.#subscriptionsMap).forEach(subKey => {
			this.#subscriptionsMap[subKey].unsubscribe();
		});
	}

	serialize(): unknown {
		return serialize(this);
	}

	deserialize(json): PidmanProcess {
		return new PidmanProcess(json.options as ProcessOptions);
	}
}
