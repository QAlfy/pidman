/// <reference types="node" />
import { PidmanMonitor } from './pidman';
import { PidmanProcess, ProcessOptions } from './';
/**
 * The options that define how a [[PidmanGroup]] behaves.
 */
export interface GroupOptions {
    /**
     * (optional) The ID for this [[PidmanGroup]].
     * It's auto generated if none is given.
     */
    id?: string;
    /**
     * (optional) The user identity for the processes that
     * run in the [[PidmanGroup]].
     */
    user?: string;
    /**
     * (optional) The group identity for the processes that
     * run in the [[PidmanGroup]].
     */
    group?: string;
    /** (optional) Environment variables. */
    envVars?: {};
    /**
     * (optional) Initialize some [[PidmanProcess]] entities.
     * You can later use [[PidmanGroup]]'s addProcess method.
     */
    processes?: Array<ProcessOptions>;
    /** (optional) The callbacks that monitor the processes. */
    monitor?: PidmanMonitor;
    /** Not yet implemented */
    timeout?: number;
}
export declare class PidmanGroup {
    options: GroupOptions;
    protected processes: Array<PidmanProcess>;
    /**
     * @param  {GroupOptions} publicoptions
     * @param  {PidmanMonitor} publicmonitor
     */
    constructor(options: GroupOptions);
    /**
     * Join a [[PidmanProcess]] to this group.
     *
     * @param  {ProcessOptions} process
     */
    addProcess(process: ProcessOptions | PidmanProcess): void;
    /**
     * @returns GroupOptions
     */
    getOptions(): GroupOptions;
    /**
     * List all processes in this group.
     *
     * @returns Array<PidmanProcess>
     */
    getProcesses(): Array<PidmanProcess>;
    /**
     * Starts all processes in this group.
     *
     * @returns void
     */
    run(): void;
    /**
     * Kills all processes in this group.
     *
     * @returns boolean
     */
    kill(signal?: NodeJS.Signals): Promise<boolean[]>;
    serialize(): unknown;
    deserialize(json: any): PidmanGroup;
}
