import { ChildProcess, spawn } from 'child_process';
import { JsonProperty, Serializable } from 'typescript-json-serializer';
import { PidmanGroup } from './';
import { PidmanStringUtils, PidmanSysUtils } from '../utils';

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
}

@Serializable()
export class PidmanProcess {
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

		this.child.stdout?.on('data', (data) =>
			this.group?.dataSubject.next({
				data, process: this, time: Date.now(),
				event: EventType.onData
			})
		);
		this.child.on('error', (error) =>
			this.group?.errorSubject.next({
				error, process: this, time: Date.now(),
				event: EventType.onError
			})
		);
		this.child.on('close', (code: number, signal: string) =>
			this.group?.closeSubject.next({
				code, signal, process: this, time: Date.now(),
				event: EventType.onClose
			})
		);
		this.child.on('exit', (code: number, signal: string) =>
			this.group?.exitSubject.next({
				code, signal, process: this, time: Date.now(),
				event: EventType.onExit
			})
		);
		this.child.stderr?.on('data', (error) =>
			this.group?.errorSubject.next({
				error, process: this, time: Date.now(),
				event: EventType.onError
			})
		);
	}

	/**
	 * @returns boolean
	 */
	stop(): boolean {
		return this.child && this.child.kill(this.options.killSignal) || false;
	}
}
