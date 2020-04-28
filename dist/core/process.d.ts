/// <reference types="node" />
import { ChildProcess } from 'child_process';
import { PidmanGroup } from './';
export interface ProcessOptions {
    id?: string;
    user?: string;
    group?: string;
    command: string;
    arguments?: string[];
    envVars?: {};
    path?: string;
    shell?: boolean | string;
    killSignal?: NodeJS.Signals;
}
export declare class PidmanProcess {
    private options;
    protected ps: ChildProcess;
    protected group: PidmanGroup;
    private dataSubject;
    private errorSubject;
    private exitSubject;
    private closeSubject;
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
     * @returns ChildProcess
     */
    getChildProcess(): ChildProcess;
    /**
     * @returns ChildProcess
     */
    protected run(): ChildProcess;
    protected stop(): boolean;
}
