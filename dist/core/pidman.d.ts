import { PidmanProcess } from './process';
interface PidmanOptions {
    id: string;
}
interface ProcessGroup {
    id: string;
    user: string;
    processes: PidmanProcess[];
}
export declare class Pidman {
    private options;
    private groups;
    constructor(options: PidmanOptions);
    getOptions(): PidmanOptions;
    addProcessGroup(group: ProcessGroup): void;
    getProcessGroups(): ProcessGroup[];
}
export {};
