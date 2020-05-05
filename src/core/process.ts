import { ChildProcess, fork } from 'child_process';
import { ForkedMessage, ForkedMessageType } from './forked';
import {
	fromEvent,
	merge,
	Observable,
	of,
	Subject,
	Subscription
} from 'rxjs';
import { get } from 'lodash';
import {
	JsonProperty,
	Serializable,
	serialize
} from 'typescript-json-serializer';
import { PidmanEventUtils } from '../utils/event';
import { PidmanGroup, PidmanMonitor } from './';
import { PidmanLogger } from '../utils/logger';
import { PidmanStringUtils, PidmanSysUtils } from '../utils';
import { Promise as promise } from 'bluebird';
import {
	catchError,
	filter,
	map,
	multicast,
	refCount,
	scan,
	tap,
} from 'rxjs/operators';

export type KillSignals = NodeJS.Signals;
export type ProcessEventSubscriptions = Record<string, Subscription>;

/**
 * Similar to [[GroupOptions]], it defines how a specific
 * [[PidmanProcess]] behaves.
 */
export interface ProcessOptions {
	/**
	 * (optional) The ID for this [[PidmanProcess]].
	 * It's auto generated if none is given.
	 */
	id?: string;
	/**
	 * (optional) The user identity for the processes that
	 * run in the [[PidmanProcess]].
	 */
	user?: string;
	/**
	 * (optional) The group identity for the processes that
	 * run in the [[PidmanProcess]].
	 */
	group?: string;
	/** (optional) Environment variables. */
	envVars?: {};
	/** The command to run without arguments. */
	command: string;
	/** The arguments to provide to the command. */
	arguments?: Array<string>;
	/** (optional) Run the command in this location. */
	path?: string;
	/** (optional) Signal to send on kill. Default is SIGTERM. */
	killSignal?: NodeJS.Signals;
	/** (optional) The callbacks that monitor the processes. */
	monitor?: PidmanMonitor;
	/** Not yet implemented */
	timeout?: number;
}

@Serializable()
export class PidmanProcess {
	#subscriptionsMap: ProcessEventSubscriptions;
	#closeEvent: Observable<[]>;
	#errorEvent: Observable<unknown>;
	#stderrEvent: Observable<unknown>;
	#dataEvent: Observable<unknown>;
	#forkedCloseEvent: Observable<unknown>;
	#child: ChildProcess | undefined;
	#forkedPID = 0;
	group: PidmanGroup | undefined;
	output: string | null;
	running = false;

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
		this.#forkedCloseEvent = new Observable();
		this.#subscriptionsMap = {};
		this.output = null;
	}

	/**
	 * Sets the [[PidmanGroup]] to which this process belongs.
	 *
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
	 * Returns the [[PidmanGroup]] to which this process belongs.
	 *
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
	 * Returns the Node's [[ChildProcess]].
	 * You may not need to use this one.
	 *
	 * @returns ChildProcess
	 */
	getChildProcess(): ChildProcess | undefined {
		return this.#child;
	}

	/**
	 * Starts this process.
	 *
	 * @returns void
	 */
	run(): void {
		PidmanLogger.instance().info([
			`Starting process ${this.options.id} as:`,
			JSON.stringify(this.serialize())
		].join(' '));

		this.#child = fork(`${__dirname}/forked.js`, undefined, {
			uid:
				(!this.options.user && undefined) ||
				PidmanSysUtils.getUid(this.options.user || ''),
			cwd: this.options.path,
			env: this.options.envVars || {},
			gid: PidmanSysUtils.getGid(this.options.group || ''),
			detached: true,
			silent: true
		});

		// initialize IPC channel (first handshake)
		this.#child.send(
			new ForkedMessage(ForkedMessageType.options, this.options),
			(err) => {
				if (err) {
					PidmanLogger.instance().error(err.toString());
				}
			});

		this.#child.on('message', (msg: ForkedMessage) => {
			if (msg.type === ForkedMessageType.started) {
				this.running = true;
				this.#forkedPID = msg.body as number;
			} else if (msg.type === ForkedMessageType.errored) {
				this.#child?.emit('error', msg.body);
			}
		});

		this.#child.unref();

		this.startMonitoring();
	}

	/**
	 * For internal use only. Do not call directly.
	 *
	 * @returns void
	 */
	startMonitoring(): void {
		const metadata = {
			process: this,
			pid: this.#forkedPID !== 0 && this.#forkedPID || this.#child?.pid,
		};

		// let's handle all important events; don't miss anything
		this.#errorEvent = fromEvent(this.#child!, 'error');
		this.#closeEvent = fromEvent(this.#child!, 'close');
		this.#dataEvent = fromEvent(this.#child?.stdout!, 'data');
		this.#stderrEvent = fromEvent(this.#child?.stderr!, 'data');
		this.#forkedCloseEvent = fromEvent(this.#child!, 'message').pipe(
			map((msg: any) => msg[0]),
			filter((msg: any) => msg.type === ForkedMessageType.closed),
			map(msg => ({ ...msg.body })),
		);

		// emit when new data goes to stdout
		const processDataEvent$ = merge(
			this.#dataEvent,
			this.#errorEvent,
			this.#stderrEvent
		)
			.pipe(
				map((ev: any) => {
					const output = ev instanceof Buffer && ev.toString() || ev;

					return { output, ...metadata, time: Date.now() };
				}),
				tap((ev: any) => (this.output = ev.output)),
				multicast(new Subject()), refCount()
			);

		this.#subscriptionsMap.dataToSelf = processDataEvent$.subscribe(
			this.group?.options.monitor?.onData
		);
		this.#subscriptionsMap.dataToGroup = processDataEvent$.subscribe(
			this.options.monitor?.onData
		);

		// emit concatenated version of error/close info and exit codes
		const processChildEvent$ = merge(
			this.#closeEvent.pipe(
				map((data: Array<unknown>) => ({
					exitCode: data[0],
					signalCode: data[1]
				})),
			),
			this.#forkedCloseEvent,
		)
			.pipe(
				scan((acc: any, data: any) => ([...acc, data]), []),
				map(PidmanEventUtils.parseMessage),
				map((msg: any) => ({ ...msg, ...metadata })),
				tap((ev) => (this.running = false)),
				catchError(error => of(error)),
				multicast(new Subject()), refCount(),
			);

		this.#subscriptionsMap.closeToSelf = processChildEvent$.subscribe(
			this.options.monitor?.onClose
		);
		this.#subscriptionsMap.closeToGroup = processChildEvent$.subscribe(
			this.group?.options.monitor?.onClose
		);
	}

	/**
	 * Kills this process.
	 *
	 * @param  {NodeJS.Signals} signal?
	 * @returns Promise
	 */
	kill(signal?: NodeJS.Signals): Promise<boolean> {
		return new promise((resolve, reject) => {
			if (this.#child) {
				let killed = false;
				const exitCode = get(this.#child, 'exitCode');

				if (exitCode === null) {
					// inform the child about the kill
					this.#child?.send(
						new ForkedMessage(
							ForkedMessageType.kill,
							null
						),
						(err) => {
							if (err) {
								reject(err);
							}
						}
					);

					// wait for child's confirmation
					this.#child?.on('message',
						(msg: ForkedMessage) => {
							if (msg.type
								=== ForkedMessageType.killed) {
								signal = signal || this.options.killSignal;
								killed = this.#child && this.#child.kill(signal)
									|| false;

								if (killed) {
									PidmanLogger.instance().info([
										`Killed process ${this.options.id}`,
										`(PID: ${this.#child?.pid})`,
										// eslint-disable-next-line max-len
										`and its childrens with signal ${signal}.`,
									].join(' '));
									if (!this.group) {
										PidmanLogger.instance().warn([
											'Daemonized/background processes',
											'might not be killed.',
											'They will remain orphan.',
											'See https://github.com/QAlfy/pidman#daemons-and-background-processes'
										].join(' '));
									}

									this.running = false;
									this.unsubscribeAll();

									resolve(true);
								} else {
									PidmanLogger.instance().error([
										// eslint-disable-next-line max-len
										`Unable to kill process ${this.options.id}`,
										`(PID: ${this.#child?.pid})`,
										`with signal ${signal}`
									].join(' '));

									reject('Unable to kill forked process');
								}
							} else if (
								msg.type === ForkedMessageType.killfail
							) {
								reject(msg.body);
							}
						});
				} else {
					PidmanLogger.instance().info([
						`Process ${this.options.id}`,
						`(PID: ${this.#child?.pid})`,
						`has already exited with code ${exitCode}.`,
						'PID might be not longer ours',
						'or process has been daemonized.'
					].join(' '));

					this.running = false;
					this.unsubscribeAll();

					resolve(false);
				}
			} else {
				this.running = false;
				this.unsubscribeAll();

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
