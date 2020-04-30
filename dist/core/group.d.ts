/// <reference types="node" />
import { PidmanMonitor } from './pidman';
import { PidmanProcess, ProcessOptions } from './';
export interface GroupOptions {
    id?: string;
    user?: string;
    group?: string;
    envVars?: {};
    processes: Array<ProcessOptions>;
    monitor?: PidmanMonitor;
}
export declare class PidmanGroup {
    private options;
    private dataSubject;
    private errorSubject;
    private exitSubject;
    private closeSubject;
    protected processes: Array<PidmanProcess>;
    /**
     * @param  {GroupOptions} privateoptions
     * @param  {PidmanMonitor} publicmonitor
     */
    constructor(options: GroupOptions);
    /**
     * @param  {ProcessOptions} process
     */
    addProcess(options: ProcessOptions): void;
    /**
     * @returns GroupOptions
     */
    getOptions(): GroupOptions;
    /**
     * @returns Array<PidmanProcess>
     */
    getProcesses(): Array<PidmanProcess>;
    run(): void;
    /**
     * @returns boolean
     */
    stop(signal?: NodeJS.Signals): boolean;
}
