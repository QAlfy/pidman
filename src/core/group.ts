import { JsonProperty, Serializable } from 'typescript-json-serializer';
import { PidmanProcess, ProcessOptions } from './';
import { PidmanStringUtils } from '../utils';
import { PidmanMonitor } from './pidman';

export interface GroupOptions {
	id?: string;
	user?: string;
	group?: string;
	envVars?: {};
	processes: PidmanProcess[];
	async?: boolean;
	monitor?: PidmanMonitor;
}

@Serializable()
export class PidmanGroup {
	/**
	 * @param  {GroupOptions} privateoptions
	 * @param  {PidmanMonitor} publicmonitor
	 */
	constructor(
		@JsonProperty() private options: GroupOptions,
		protected monitor?: PidmanMonitor
	) {
		if (!this.options.id) {
			this.options.id = PidmanStringUtils.getId();
		}

		if (!this.options.monitor) {
			this.options.monitor = monitor;
		}
	}

	/**
	 * @param  {ProcessOptions} process
	 */
	addProcess(options: ProcessOptions): void {
		const process = new PidmanProcess(options);
		process.setGroup(this);

		this.options.processes.push(process);
	}

	/**
	 * @returns GroupOptions
	 */
	getOptions(): GroupOptions {
		return this.options;
	}

	stop(): boolean {
		return true;
	}
}
