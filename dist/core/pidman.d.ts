import { GroupOptions, PidmanGroup } from './';
import { LoggerOptions } from '../utils/logger';
import { PidmanConnector } from '../connector';
export interface PidmanMonitor {
    onData?(data: unknown): void;
    onComplete?(data: unknown): void;
}
export interface PidmanOptions {
    id?: string;
    connector?: PidmanConnector;
    logger?: LoggerOptions;
}
export declare class Pidman {
    options: PidmanOptions;
    protected groups: Array<PidmanGroup>;
    /**
     * @param  {PidmanOptions} privateoptions
     */
    constructor(options?: PidmanOptions);
    /**
     * @returns PidmanOptions
     */
    getOptions(): PidmanOptions;
    /**
     * @param  {GroupOptions | PidmanGroup} options
     * @returns void
     */
    addProcessGroup(group: GroupOptions | PidmanGroup): void;
    /**
     * @returns PidmanGroup
     */
    getProcessGroups(): Array<PidmanGroup>;
    /**
     * @returns void
     */
    run(): void;
}
