import { BehaviorSubject } from 'rxjs';
import { PidmanMonitor } from './pidman';
import { PidmanProcess, ProcessOptions } from './';
export interface GroupOptions {
    id?: string;
    user?: string;
    group?: string;
    envVars?: {};
    processes: Array<ProcessOptions>;
    waitForCompletion?: boolean;
    monitor?: PidmanMonitor;
}
export declare class PidmanGroup {
    private options;
    monitor?: PidmanMonitor | undefined;
    dataSubjects: Array<BehaviorSubject<{}>>;
    errorSubjects: Array<BehaviorSubject<{}>>;
    exitSubjects: Array<BehaviorSubject<{}>>;
    closeSubjects: Array<BehaviorSubject<{}>>;
    protected processes: Array<PidmanProcess>;
    /**
     * @param  {GroupOptions} privateoptions
     * @param  {PidmanMonitor} publicmonitor
     */
    constructor(options: GroupOptions, monitor?: PidmanMonitor | undefined);
    /**
     * @param  {PidmanMonitor|undefined} monitor
     * @returns void
     */
    setMonitor(monitor: PidmanMonitor | undefined): void;
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
