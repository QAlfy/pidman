import { ChildProcess, spawn } from 'child_process';
import { JsonProperty, Serializable } from 'typescript-json-serializer';
import { PidmanGroup, PidmanMonitor } from './';
import { PidmanStringUtils, PidmanSysUtils } from '../utils';
import {
	catchError,
	scan,
} from 'rxjs/operators';
import {
	fromEvent,
	merge,
	Observable,
	of,
} from 'rxjs';

export enum EventType {
	onData = 'data',
	onError = 'error',
	onExit = 'exit',
	onClose = 'close',
	onComplete = 'complete'
}

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
}

@Serializable()
export class PidmanProcess {
	protected exitEvent: Observable<unknown>;
	protected errorEvent: Observable<unknown>;
	protected closeEvent: Observable<unknown>;
	protected dataEvent: Observable<unknown>;
	protected child: ChildProcess | undefined;
	protected group: PidmanGroup | undefined;

	/**
	 * @param  {ProcessOptions} privateoptions
	 */
	constructor(@JsonProperty() private options: ProcessOptions) {
		if (!this.options.id) {
			this.options.id = PidmanStringUtils.getId();
		}

		if (!this.options.killSignal) {
			this.options.killSignal = 'SIGKILL';
		}

		this.dataEvent = new Observable();
		this.exitEvent = new Observable();
		this.errorEvent = new Observable();
		this.closeEvent = new Observable();
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
		this.child = spawn(this.options.command, this.options.arguments || [], {
			uid:
				(!this.options.user && undefined) ||
				PidmanSysUtils.getUid(this.options.user || ''),
			cwd: this.options.path,
			env: this.options.envVars || {},
			gid: PidmanSysUtils.getGid(this.options.group || ''),
			shell: this.options.shell || false,
		});

		this.dataEvent = fromEvent(this.child.stdout!, 'data');
		this.errorEvent = fromEvent(this.child, 'error');
		this.exitEvent = fromEvent(this.child, 'exit');
		this.closeEvent = fromEvent(this.child.stderr!, 'data');

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

		this.dataEvent.subscribe(
			this.options.monitor?.onData?.bind(metadata)
		);

		merge(
			this.errorEvent,
			this.exitEvent,
			this.closeEvent,
		)
			.pipe(
				scan((acc: any, data: any) => acc.concat(data), []),
				catchError(error => of(error))
			)
			.subscribe(this.options.monitor?.onComplete?.bind(metadata));
	}

	/**
	 * @returns boolean
	 */
	stop(signal?: NodeJS.Signals): boolean {
		return this.child && this.child.kill(signal
			|| this.options.killSignal) || false;
	}
}
