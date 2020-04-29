import { BehaviorSubject } from 'rxjs';
import { PidmanMonitor } from './pidman';
import { PidmanProcess, ProcessOptions } from './';
export interface GroupOptions {
    id?: string;
    user?: string;
    group?: string;
    envVars?: {};
    processes: Array<ProcessOptions>;
    monitor: PidmanMonitor;
}
export declare class PidmanGroup {
    private options;
    dataSubject: BehaviorSubject<{}>;
    errorSubject: BehaviorSubject<{}>;
    exitSubject: BehaviorSubject<{}>;
    closeSubject: BehaviorSubject<{}>;
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
    /**
     * @returns void
     */
    startMonitoring(): void;
    run(): void;
    /**
     * @returns boolean
     */
    stop(): boolean;
}
