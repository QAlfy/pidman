import { ChildProcess, spawn } from 'child_process';

interface ProcessOptions {
	id: string;
	command: string;
	arguments: string[];
	env: Map<string, string>;
}

export class PidmanProcess {
	private ps!: ChildProcess;

	constructor(private options: ProcessOptions) {}

	run(): ChildProcess {
		this.ps = spawn(this.options.command);

		return this.ps;
	}
}
