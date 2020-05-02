import {
	JsonProperty,
	Serializable,
	serialize
} from 'typescript-json-serializer';
import { PidmanMonitor } from './pidman';
import { PidmanProcess, ProcessOptions } from './';
import { PidmanStringUtils } from '../utils';
import { Promise as promise } from 'bluebird';

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
	constructor(@JsonProperty() public options: GroupOptions) {
		if (!this.options.id) {
			this.options.id = PidmanStringUtils.getId();
		}

		if (this.options.processes) {
			this.options.processes.forEach(process => this.addProcess(process));
		}
	}

	/**
	 * @param  {ProcessOptions} process
	 */
	addProcess(process: ProcessOptions | PidmanProcess): void {
		let newProcess;

		if (process instanceof PidmanProcess) {
			newProcess = process;
		} else {
			newProcess = new PidmanProcess(process);
		}

		newProcess.setGroup(this);
		this.processes.push(newProcess);
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
	kill(signal?: NodeJS.Signals, callback?: void): Promise<boolean> {
		let ret = true;

		this.processes.forEach((process) => {
			ret = ret && (process.kill(signal, callback));
		});

		return promise.resolve(ret);
	}

	serialize(): unknown {
		return serialize(this);
	}

	deserialize(json): PidmanGroup {
		return new PidmanGroup(json.options as GroupOptions);
	}
}
