import { PidmanProcess, ProcessOptions } from './';
import { PidmanMonitor } from './pidman';
export interface GroupOptions {
    id?: string;
    user?: string;
    group?: string;
    envVars?: {};
    processes: PidmanProcess[];
    async?: boolean;
    monitor?: PidmanMonitor;
}
export declare class PidmanGroup {
    private options;
    protected monitor?: PidmanMonitor | undefined;
    /**
     * @param  {GroupOptions} privateoptions
     * @param  {PidmanMonitor} publicmonitor
     */
    constructor(options: GroupOptions, monitor?: PidmanMonitor | undefined);
    /**
     * @param  {ProcessOptions} process
     */
    addProcess(options: ProcessOptions): void;
    /**
     * @returns GroupOptions
     */
    getOptions(): GroupOptions;
    stop(): boolean;
}
