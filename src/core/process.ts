import { BehaviorSubject } from 'rxjs';
import { ChildProcess, spawn } from 'child_process';
import { JsonProperty, Serializable } from 'typescript-json-serializer';
import { PidmanGroup } from './';
import { PidmanStringUtils, PidmanSysUtils } from '../utils';

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
	protected ps!: ChildProcess;
	protected group!: PidmanGroup;
	protected dataSubject: BehaviorSubject<{}>;
	protected errorSubject: BehaviorSubject<{}>;
	protected exitSubject: BehaviorSubject<{}>;
	protected closeSubject: BehaviorSubject<{}>;

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

	run(): void {
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
			this.errorSubject.next({ error, group: this })
		);
		this.ps.on('close', (code: number, signal: string) =>
			this.closeSubject.next({ code, signal, group: this })
		);
		this.ps.on('exit', (code: number, signal: string) =>
			this.exitSubject.next({ code, signal, group: this })
		);
	}

	subscribe(group: PidmanGroup): void {
		group.dataSubjects.push(this.dataSubject);
		group.errorSubjects.push(this.errorSubject);
		group.exitSubjects.push(this.exitSubject);
		group.closeSubjects.push(this.closeSubject);
	}

	protected stop(): boolean {
		return this.ps.kill(this.options.killSignal);
	}
}
