import { JsonProperty, Serializable } from 'typescript-json-serializer';
import { PidmanMonitor } from './pidman';
import { PidmanProcess, ProcessOptions } from './';
import { PidmanStringUtils } from '../utils';

export interface GroupOptions {
	id?: string;
	user?: string;
	group?: string;
	envVars?: {};
	processes: Array<ProcessOptions>;
	monitor?: PidmanMonitor;
}

@Serializable()
export class PidmanGroup {
	protected processes: Array<PidmanProcess> = [];

	/**
	 * @param  {GroupOptions} privateoptions
	 * @param  {PidmanMonitor} publicmonitor
	 */
	constructor(@JsonProperty() private options: GroupOptions) {
		if (!this.options.id) {
			this.options.id = PidmanStringUtils.getId();
		}
	}

	/**
	 * @param  {ProcessOptions} process
	 */
	addProcess(options: ProcessOptions): void {
		const process = new PidmanProcess(options);
		process.setGroup(this);

		this.processes.push(process);
	}

	/**
	 * @returns GroupOptions
	 */
	getOptions(): GroupOptions {
		return this.options;
	}

	/**
	 * @returns Array<PidmanProcess>
	 */
	getProcesses(): Array<PidmanProcess> {
		return this.processes;
	}

	run(): void {
		this.processes.forEach(process => process.run());
	}

	/**
	 * @returns boolean
	 */
	stop(signal?: NodeJS.Signals): boolean {
		let ret = true;

		this.processes.forEach(process => {
			ret = ret && process.stop(signal);
		});

		return ret;
	}
}
