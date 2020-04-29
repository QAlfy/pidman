import { GroupOptions, PidmanGroup } from './';
import { PidmanConnector } from '../connector';
export interface PidmanMonitor {
    onData?(data: {}): void;
    onError?(error: {}): void;
    onExit?(exit: {}): void;
    onClose?(close: {}): void;
    onComplete?(data: {}): void;
}
export interface PidmanOptions {
    id?: string;
    connector?: PidmanConnector;
    monitor: PidmanMonitor;
}
export declare class Pidman {
    options: PidmanOptions;
    protected groups: Array<PidmanGroup>;
    /**
     * @param  {PidmanOptions} privateoptions
     */
    constructor(options: PidmanOptions);
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
