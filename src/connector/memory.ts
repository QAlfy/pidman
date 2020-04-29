import * as loki from 'lokijs';
import { PidmanGroup, PidmanProcess } from '../core';

export interface PidmanConnector {
	init(): void;
	add(item: PidmanGroup | PidmanProcess): void;
	remove(id: string): void;
	get(id: string): PidmanGroup | PidmanProcess;
}

export default class MemoryConnector implements PidmanConnector {
	init(): void {
		throw new Error('Method not implemented.');
	}

	add(item: PidmanGroup | PidmanProcess): void {
		throw new Error('Method not implemented.');
	}

	remove(id: string): void {
		throw new Error('Method not implemented.');
	}

	get(id: string): PidmanGroup | PidmanProcess {
		throw new Error('Method not implemented.');
	}
}
