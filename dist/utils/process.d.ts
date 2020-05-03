export declare class PidmanProcessUtils {
    static getPidChildrens(pid: number): Promise<any[]>;
    static killTree(pid: number): Promise<boolean>;
}
