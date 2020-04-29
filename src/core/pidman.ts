import MemoryConnector from '../connector/memory';
import { GroupOptions, PidmanGroup } from './';
import { JsonProperty, Serializable } from 'typescript-json-serializer';
import { PidmanConnector } from '../connector';
import { PidmanStringUtils } from '../utils';

export interface PidmanMonitor {
	onData?(data: {}): void;
	onError?(error: {}): void;
	onExit?(exit: {}): void;
	onClose?(close: {}): void;
	onComplete?(data: {}): void;
}

export interface PidmanOptions {
	id?: string;
	connector?: PidmanConnector;
	monitor?: PidmanMonitor;
}

@Serializable()
export class Pidman {
	protected groups: Array<PidmanGroup> = [];

	/**
	 * @param  {PidmanOptions} privateoptions
	 */
	constructor(@JsonProperty() public options: PidmanOptions) {
		if (!this.options.id) {
			this.options.id = PidmanStringUtils.getId();
		}

		if (!this.options.connector) {
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
			newGroup.setMonitor(this.options.monitor);
		} else {
			newGroup = new PidmanGroup(group, this.options.monitor);
			group.processes.forEach((process) => newGroup.addProcess(process));
		}

		newGroup.startMonitoring();

		this.groups.push(newGroup);
	}

	/**
	 * @returns PidmanGroup
	 */
	getProcessGroups(): Array<PidmanGroup> {
		return this.groups;
	}

	run(): void {
		this.groups.forEach(group => group.run());
	}
}
