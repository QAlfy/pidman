/// <reference types="node" />
import { ChildProcess } from 'child_process';
import { PidmanGroup } from './';
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
}
export declare class PidmanProcess {
    private options;
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
     * @returns boolean
     */
    stop(): boolean;
}
