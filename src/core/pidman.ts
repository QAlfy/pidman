import { PidmanProcess } from './process';

interface PidmanOptions {
	id: string;
}

interface ProcessGroup {
	id: string;
	user: string;
	processes: PidmanProcess[];
}

export class Pidman {
	private groups: ProcessGroup[] = [];

	constructor(private options: PidmanOptions) {}

	getOptions(): PidmanOptions {
		return this.options;
	}

	addProcessGroup(group: ProcessGroup): void {
		this.groups.push(group);
	}

	getProcessGroups(): ProcessGroup[] {
		return this.groups;
	}
}
