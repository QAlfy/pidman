import { GroupOptions, PidmanGroup } from './';
import { LoggerOptions } from '../utils/logger';
import { PidmanConnector } from '../connector';
/**
 * The [[PidmanMonitor]] implements the callbacks methods
 * that are triggered on every process's event.
 */
export interface PidmanMonitor {
    /**
     * The process' stdout and stderr is forwarded here
     * along with the [[PidmanProcess]]' metadata.
     *
     * @param  {unknown} data
     * @returns void
     */
    onData?(data: unknown): void;
    /**
     * Once the process closes or exits, the resulting exit
     * code and signal is returned here along with the [[PidmanProcess]]'
     * metadata.
     *
     * @param  {unknown} data
     * @returns void
     */
    onClose?(data: unknown): void;
}
/** The options that [[Pidman]]'s constructor receives. */
export interface PidmanOptions {
    id?: string;
    connector?: PidmanConnector;
    logger?: LoggerOptions;
}
/** The Pidman's entry class. */
export declare class Pidman {
    options: PidmanOptions;
    protected groups: Array<PidmanGroup>;
    /**
     * @param  {PidmanOptions} privateoptions
     */
    constructor(options?: PidmanOptions);
    /**
     * @returns [[PidmanOptions]]
     */
    getOptions(): PidmanOptions;
    /**
     * Add a new group of processes.
     *
     * @param  {GroupOptions | PidmanGroup} options
     * @returns void
     */
    addProcessGroup(group: GroupOptions | PidmanGroup): void;
    /**
     * List the groups of processes.
     *
     * @returns PidmanGroup
     */
    getProcessGroups(): Array<PidmanGroup>;
    /**
     * Start all groups' processes.
     *
     * @returns void
     */
    run(): void;
}
