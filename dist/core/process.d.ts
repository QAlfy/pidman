/// <reference types="node" />
import { ChildProcess } from 'child_process';
interface ProcessOptions {
    id: string;
    user?: string;
    group?: string;
    command: string;
    arguments?: string[];
    envVars?: Map<string, string>;
    cwd?: string;
    shell?: boolean | string;
}
export declare class PidmanProcess {
    private options;
    private ps;
    /**
     * @param  {ProcessOptions} privateoptions
     */
    constructor(options: ProcessOptions);
    /**
     * @returns ChildProcess
     */
    protected run(): ChildProcess;
}
export {};
