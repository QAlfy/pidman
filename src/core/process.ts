import { ChildProcess, spawn } from 'child_process';

interface ProcessOptions {
	id: string;
	user?: string;
	group?: string;
	command: string;
	arguments?: string[];
	envVars?: Map<string, string>;
	cwd?: string;
	shell?: boolean | string;
}

export class PidmanProcess {
	private ps!: ChildProcess;

	/**
	 * @param  {ProcessOptions} privateoptions
	 */
	constructor(private options: ProcessOptions) {}

	/**
	 * @returns ChildProcess
	 */
	protected run(): ChildProcess {
		this.ps = spawn(this.options.command);

		return this.ps;
	}
}
