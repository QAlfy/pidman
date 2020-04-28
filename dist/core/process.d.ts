/// <reference types="node" />
import { ChildProcess } from 'child_process';
interface ProcessOptions {
    id: string;
    command: string;
    arguments: string[];
    env: Map<string, string>;
}
export declare class PidmanProcess {
    private options;
    private ps;
    constructor(options: ProcessOptions);
    run(): ChildProcess;
}
export {};
