/// <reference types="node" />
import { BehaviorSubject } from 'rxjs';
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
    protected ps: ChildProcess;
    protected group: PidmanGroup;
    protected dataSubject: BehaviorSubject<{}>;
    protected errorSubject: BehaviorSubject<{}>;
    protected exitSubject: BehaviorSubject<{}>;
    protected closeSubject: BehaviorSubject<{}>;
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
    getGroup(): PidmanGroup;
    /**
     * @returns ProcessOptions
     */
    getOptions(): ProcessOptions;
    /**
     * @returns ChildProcess
     */
    getChildProcess(): ChildProcess;
    /**
     * @returns void
     */
    run(): void;
    /**
     * @param  {PidmanGroup} group
     */
    subscribe(group: PidmanGroup): void;
    /**
     * @returns boolean
     */
    stop(): boolean;
}
