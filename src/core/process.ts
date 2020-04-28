import { ChildProcess, spawn } from 'child_process';
import { JsonProperty, Serializable } from 'typescript-json-serializer';
import { PidmanGroup } from './';
import { PidmanStringUtils, PidmanSysUtils } from '../utils';
import { BehaviorSubject } from 'rxjs';

export interface ProcessOptions {
	id?: string;
	user?: string;
	group?: string;
	command: string;
	arguments?: string[];
	envVars?: {};
	path?: string;
	shell?: boolean | string;
	killSignal?: NodeJS.Signals;
}

@Serializable()
export class PidmanProcess {
	protected ps!: ChildProcess;
	protected group!: PidmanGroup;
	private dataSubject: BehaviorSubject<{}>;
	private errorSubject: BehaviorSubject<{}>;
	private exitSubject: BehaviorSubject<{}>;
	private closeSubject: BehaviorSubject<{}>;

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

		this.dataSubject = new BehaviorSubject({});
		this.errorSubject = new BehaviorSubject({});
		this.exitSubject = new BehaviorSubject({});
		this.closeSubject = new BehaviorSubject({});
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
	getGroup(): PidmanGroup {
		return this.group;
	}

	/**
	 * @returns ChildProcess
	 */
	getChildProcess(): ChildProcess {
		return this.ps;
	}

	/**
	 * @returns ChildProcess
	 */
	protected run(): ChildProcess {
		this.ps = spawn(this.options.command, this.options.arguments || [], {
			uid:
				(!this.options.user && undefined) ||
				PidmanSysUtils.getUid(this.options.user || ''),
			cwd: this.options.path,
			env: this.options.envVars || {},
			gid: PidmanSysUtils.getGid(this.options.group || ''),
			shell: this.options.shell || false,
		});

		this.ps.stdout?.on('data', (data) =>
			this.dataSubject.next({ data, group: this })
		);
		this.ps.on('error', (error) =>
			this.dataSubject.next({ error, group: this })
		);
		this.ps.on('close', (code: number, signal: string) =>
			this.dataSubject.next({ code, signal, group: this })
		);
		this.ps.on('exit', (code: number, signal: string) =>
			this.dataSubject.next({ code, signal, group: this })
		);

		return this.ps;
	}

	protected stop(): boolean {
		return this.ps.kill(this.options.killSignal);
	}
}
