import MemoryConnector from '../connector/memory';
import { GroupOptions, PidmanGroup } from './';
import { PidmanConnector } from '../connector';
import { PidmanStringUtils } from '../utils';

export interface PidmanMonitor {
	onData?(data: unknown): void;
	onComplete?(data: unknown): void;
}

export interface PidmanOptions {
	id?: string;
	connector?: PidmanConnector;
}

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
	 * @returns PidmanOptions
	 */
	getOptions(): PidmanOptions {
		return this.options;
	}

	/**
	 * @param  {GroupOptions | PidmanGroup} options
	 * @returns void
	 */
	addProcessGroup(group: GroupOptions | PidmanGroup): void {
		let newGroup;

		if (group instanceof PidmanGroup) {
			newGroup = group;
		} else {
			newGroup = new PidmanGroup(group);
			group.processes.forEach((process) => newGroup.addProcess(process));
		}

		this.groups.push(newGroup);
	}

	/**
	 * @returns PidmanGroup
	 */
	getProcessGroups(): Array<PidmanGroup> {
		return this.groups;
	}

	/**
	 * @returns void
	 */
	run(): void {
		this.groups.forEach(group => group.run());
	}
}
