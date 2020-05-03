/// <reference types="node" />
import { ChildProcess } from 'child_process';
import { Subscription } from 'rxjs';
import { PidmanGroup, PidmanMonitor } from './';
export declare type KillSignals = NodeJS.Signals;
export declare type ProcessEventSubscriptions = Record<string, Subscription>;
export interface ProcessOptions {
    id?: string;
    user?: string;
    group?: string;
    command: string;
    arguments?: Array<string>;
    envVars?: {};
    path?: string;
    shell?: boolean | string;
    killSignal?: NodeJS.Signals;
    monitor?: PidmanMonitor;
    timeout?: number;
}
export declare class PidmanProcess {
    #private;
    private options;
    child: ChildProcess | undefined;
    group: PidmanGroup | undefined;
    running: boolean;
    /**
     * @param  {ProcessOptions} privateoptions
     */
    constructor(options: ProcessOptions);
    /**
     * @param  {PidmanGroup} group
     * @returns void
     */
    setGroup(group: PidmanGroup): void;
    /**
     * @returns PidmanGroup
     */
    getGroup(): PidmanGroup | undefined;
    /**
     * @returns ProcessOptions
     */
    getOptions(): ProcessOptions;
    /**
     * @returns ChildProcess
     */
    getChildProcess(): ChildProcess | undefined;
    /**
     * @returns void
     */
    run(): void;
    /**
     * @returns void
     */
    startMonitoring(): void;
    /**
     * @param  {NodeJS.Signals} signal?
     * @returns Promise
     */
    kill(signal?: NodeJS.Signals): Promise<boolean>;
    unsubscribeAll(): void;
    serialize(): unknown;
    deserialize(json: any): PidmanProcess;
}
