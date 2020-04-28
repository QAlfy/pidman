import MemoryConnector from '../connector/memory';
import { GroupOptions, PidmanGroup } from './';
import { PidmanConnector } from '../connector';
import { PidmanStringUtils } from '../utils';

export interface PidmanMonitor {
	onData(data: {}[]): void;
	onError(error: {}[]): void;
	onExit(code: number, signal: string): void;
	onClose(code: number, signal: string): void;
}

export interface PidmanOptions {
	id?: string;
	connector?: PidmanConnector;
	monitor?: PidmanMonitor;
}

export class Pidman {
	protected groups: PidmanGroup[] = [];

	/**
	 * @param  {PidmanOptions} privateoptions
	 */
	constructor(private options: PidmanOptions) {
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
	 * @param  {GroupOptions} options
	 * @returns void
	 */
	addProcessGroup(options: GroupOptions): void {
		const group = new PidmanGroup(options, this.options.monitor);

		this.groups.push(group);
	}

	/**
	 * @returns PidmanGroup
	 */
	getProcessGroups(): PidmanGroup[] {
		return this.groups;
	}
}
