import { PidmanGroup, PidmanProcess } from '../core';
export interface PidmanConnector {
    init(): void;
    add(item: PidmanGroup | PidmanProcess): void;
    remove(id: string): void;
    get(id: string): PidmanGroup | PidmanProcess;
}
export default class MemoryConnector implements PidmanConnector {
    init(): void;
    add(item: PidmanGroup | PidmanProcess): void;
    remove(id: string): void;
    get(id: string): PidmanGroup | PidmanProcess;
}
