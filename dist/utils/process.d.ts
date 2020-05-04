/// <reference types="node" />
export declare class PidmanProcessUtils {
    /**
     * @param  {number} pid
     * @param  {NodeJS.Signals} signal?
     * @returns Promise
     */
    static killTree(pid: number, signal?: NodeJS.Signals): Promise<boolean>;
}
