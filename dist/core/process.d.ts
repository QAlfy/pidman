/// <reference types="node" />
import { ChildProcess } from 'child_process';
import { Subscription } from 'rxjs';
import { PidmanGroup, PidmanMonitor } from './';
export declare type KillSignals = NodeJS.Signals;
export declare type ProcessEventSubscriptions = Record<string, Subscription>;
/**
 * Similar to [[GroupOptions]], it defines how a specific
 * [[PidmanProcess]] behaves.
 */
export interface ProcessOptions {
    /**
     * (optional) The ID for this [[PidmanProcess]].
     * It's auto generated if none is given.
     */
    id?: string;
    /**
     * (optional) The user identity for the processes that
     * run in the [[PidmanProcess]].
     */
    user?: string;
    /**
     * (optional) The group identity for the processes that
     * run in the [[PidmanProcess]].
     */
    group?: string;
    /** (optional) Environment variables. */
    envVars?: {};
    /** The command to run without arguments. */
    command: string;
    /** The arguments to provide to the command. */
    arguments?: Array<string>;
    /** (optional) Run the command in this location. */
    path?: string;
    /** (optional) Signal to send on kill. Default is SIGTERM. */
    killSignal?: NodeJS.Signals;
    /** (optional) The callbacks that monitor the processes. */
    monitor?: PidmanMonitor;
    /** Not yet implemented */
    timeout?: number;
}
export declare class PidmanProcess {
    #private;
    private options;
    group: PidmanGroup | undefined;
    output: string | null;
    running: boolean;
    /**
     * @param  {ProcessOptions} privateoptions
     */
    constructor(options: ProcessOptions);
    /**
     * Sets the [[PidmanGroup]] to which this process belongs.
     *
     * @param  {PidmanGroup} group
     * @returns void
     */
    setGroup(group: PidmanGroup): void;
    /**
     * Returns the [[PidmanGroup]] to which this process belongs.
     *
     * @returns PidmanGroup
     */
    getGroup(): PidmanGroup | undefined;
    /**
     * @returns ProcessOptions
     */
    getOptions(): ProcessOptions;
    /**
     * Returns the Node's [[ChildProcess]].
     * You may not need to use this one.
     *
     * @returns ChildProcess
     */
    getChildProcess(): ChildProcess | undefined;
    /**
     * Starts this process.
     *
     * @returns void
     */
    run(): void;
    /**
     * For internal use only. Do not call directly.
     *
     * @returns void
     */
    startMonitoring(): void;
    /**
     * Kills this process.
     *
     * @param  {NodeJS.Signals} signal?
     * @returns Promise
     */
    kill(signal?: NodeJS.Signals): Promise<boolean>;
    unsubscribeAll(): void;
    serialize(): unknown;
    deserialize(json: any): PidmanProcess;
}
