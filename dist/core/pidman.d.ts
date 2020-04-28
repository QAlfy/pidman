import { GroupOptions, PidmanGroup } from './';
import { PidmanConnector } from '../connector';
export interface PidmanMonitor {
    onData(data: {}[]): void;
    onError(error: {}[]): void;
    onExit(code: number, signal: string): void;
    onClose(code: number, signal: string): void;
}
export interface PidmanOptions {
    id?: string;
    connector?: PidmanConnector;
    monitor?: PidmanMonitor;
}
export declare class Pidman {
    private options;
    protected groups: PidmanGroup[];
    /**
     * @param  {PidmanOptions} privateoptions
     */
    constructor(options: PidmanOptions);
    /**
     * @returns PidmanOptions
     */
    getOptions(): PidmanOptions;
    /**
     * @param  {GroupOptions} options
     * @returns void
     */
    addProcessGroup(options: GroupOptions): void;
    /**
     * @returns PidmanGroup
     */
    getProcessGroups(): PidmanGroup[];
}
