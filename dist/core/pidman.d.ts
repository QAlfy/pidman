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
export declare class Pidman {
    private options;
    private groups;
    /**
     * @param  {PidmanOptions} privateoptions
     */
    constructor(options: PidmanOptions);
    /**
     * @returns PidmanOptions
     */
    getOptions(): PidmanOptions;
    /**
     * @param  {ProcessGroup} group
     */
    addProcessGroup(group: ProcessGroup): void;
    /**
     * @returns ProcessGroup
     */
    getProcessGroups(): ProcessGroup[];
}
export {};
