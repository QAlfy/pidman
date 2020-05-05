import MemoryConnector from '../connector/memory';
import { GroupOptions, PidmanGroup } from './';
import { LoggerOptions } from '../utils/logger';
import { PidmanConnector } from '../connector';
import { PidmanStringUtils } from '../utils';

/**
 * The [[PidmanMonitor]] implements the callbacks methods
 * that are triggered on every process's event.
 */
export interface PidmanMonitor {

	/**
	 * The process' stdout and stderr is forwarded here
	 * along with the [[PidmanProcess]]' metadata.
	 *
	 * @param  {unknown} data
	 * @returns void
	 */
	onData?(data: unknown): void;

	/**
	 * Once the process closes or exits, the resulting exit
	 * code and signal is returned here along with the [[PidmanProcess]]'
	 * metadata.
	 *
	 * @param  {unknown} data
	 * @returns void
	 */
	onClose?(data: unknown): void;
}

/** The options that [[Pidman]]'s constructor receives. */
export interface PidmanOptions {
	id?: string;
	connector?: PidmanConnector;
	logger?: LoggerOptions;
}

/** The Pidman's entry class. */
export class Pidman {
	protected groups: Array<PidmanGroup> = [];

	/**
	 * @param  {PidmanOptions} privateoptions
	 */
	constructor(public options: PidmanOptions = {}) {
		if (!this.options?.id) {
			this.options.id = PidmanStringUtils.getId();
		}

		if (!this.options?.connector) {
			this.options.connector = new MemoryConnector();
		}
	}

	/**
	 * @returns [[PidmanOptions]]
	 */
	getOptions(): PidmanOptions {
		return this.options;
	}

	/**
	 * Add a new group of processes.
	 *
	 * @param  {GroupOptions | PidmanGroup} options
	 * @returns void
	 */
	addProcessGroup(group: GroupOptions | PidmanGroup): void {
		let newGroup;

		if (group instanceof PidmanGroup) {
			newGroup = group;
		} else {
			newGroup = new PidmanGroup(group);
		}

		this.groups.push(newGroup);
	}

	/**
	 * List the groups of processes.
	 *
	 * @returns PidmanGroup
	 */
	getProcessGroups(): Array<PidmanGroup> {
		return this.groups;
	}

	/**
	 * Start all groups' processes.
	 *
	 * @returns void
	 */
	run(): void {
		this.groups.forEach(group => group.run());
	}
}
