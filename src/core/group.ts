import {
	JsonProperty,
	Serializable,
	serialize
} from 'typescript-json-serializer';
import { PidmanLogger } from '../utils/logger';
import { PidmanMonitor } from './pidman';
import { PidmanProcess, ProcessOptions } from './';
import { PidmanStringUtils } from '../utils';
import { Promise as promise } from 'bluebird';

/**
 * The options that define how a [[PidmanGroup]] behaves.
 */
export interface GroupOptions {
	/**
	 * (optional) The ID for this [[PidmanGroup]].
	 * It's auto generated if none is given.
	 */
	id?: string;
	/**
	 * (optional) The user identity for the processes that
	 * run in the [[PidmanGroup]].
	 */
	user?: string;
	/**
	 * (optional) The group identity for the processes that
	 * run in the [[PidmanGroup]].
	 */
	group?: string;
	/** (optional) Environment variables. */
	envVars?: {};
	/**
	 * (optional) Initialize some [[PidmanProcess]] entities.
	 * You can later use [[PidmanGroup]]'s addProcess method.
	 */
	processes?: Array<ProcessOptions>;
	/** (optional) The callbacks that monitor the processes. */
	monitor?: PidmanMonitor;
	/** Not yet implemented */
	timeout?: number;
}

@Serializable()
export class PidmanGroup {
	protected processes: Array<PidmanProcess> = [];

	/**
	 * @param  {GroupOptions} publicoptions
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
	 * Join a [[PidmanProcess]] to this group.
	 *
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
	 * List all processes in this group.
	 *
	 * @returns Array<PidmanProcess>
	 */
	getProcesses(): Array<PidmanProcess> {
		return this.processes;
	}

	/**
	 * Starts all processes in this group.
	 *
	 * @returns void
	 */
	run(): void {
		this.processes.forEach(process => process.run());
	}

	/**
	 * Kills all processes in this group.
	 *
	 * @returns boolean
	 */
	kill(signal?: NodeJS.Signals): Promise<boolean[]> {
		PidmanLogger.instance().warn([
			'Daemonized/background processes',
			'might not be killed.',
			'They will remain orphan.',
			'See https://github.com/QAlfy/pidman#daemons-and-background-processes'
		].join(' '));

		return new promise((resolve, reject) => {
			promise.all(this.processes.map(
				process => process.kill(signal)
			))
				.then(resolve)
				.catch(reject);
		});
	}

	serialize(): unknown {
		return serialize(this);
	}

	deserialize(json): PidmanGroup {
		return new PidmanGroup(json.options as GroupOptions);
	}
}
