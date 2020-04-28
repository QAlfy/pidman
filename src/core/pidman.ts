import { PidmanProcess } from './process';

interface PidmanOptions {
	id: string;
}

interface ProcessGroup {
	id: string;
	user?: string;
	group?: string;
	processes: PidmanProcess[];
	async?: boolean;
}

export class Pidman {
	private groups: ProcessGroup[] = [];

	/**
	 * @param  {PidmanOptions} privateoptions
	 */
	constructor(private options: PidmanOptions) {}

	/**
	 * @returns PidmanOptions
	 */
	getOptions(): PidmanOptions {
		return this.options;
	}

	/**
	 * @param  {ProcessGroup} group
	 */
	addProcessGroup(group: ProcessGroup): void {
		this.groups.push(group);
	}

	/**
	 * @returns ProcessGroup
	 */
	getProcessGroups(): ProcessGroup[] {
		return this.groups;
	}
}
