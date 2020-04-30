/// <reference types="node" />
import { ChildProcess } from 'child_process';
import { PidmanGroup, PidmanMonitor } from './';
import { Observable } from 'rxjs';
export declare enum EventType {
    onData = "data",
    onError = "error",
    onExit = "exit",
    onClose = "close",
    onComplete = "complete"
}
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
}
export declare class PidmanProcess {
    private options;
    protected exitEvent: Observable<unknown>;
    protected errorEvent: Observable<unknown>;
    protected closeEvent: Observable<unknown>;
    protected dataEvent: Observable<unknown>;
    protected child: ChildProcess | undefined;
    protected group: PidmanGroup | undefined;
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
     * @returns boolean
     */
    stop(signal?: NodeJS.Signals): boolean;
}
