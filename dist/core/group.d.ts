import { BehaviorSubject } from 'rxjs';
import { PidmanMonitor } from './pidman';
import { PidmanProcess, ProcessOptions } from './';
export interface GroupOptions {
    id?: string;
    user?: string;
    group?: string;
    envVars?: {};
    processes?: Array<ProcessOptions> | undefined;
    async?: boolean;
    monitor?: PidmanMonitor;
}
export declare class PidmanGroup {
    private options;
    monitor?: PidmanMonitor | undefined;
    protected subjects: Array<BehaviorSubject<{}>>;
    protected processes: Array<PidmanProcess>;
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
