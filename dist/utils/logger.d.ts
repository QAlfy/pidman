import { ConsoleTransportInstance } from 'winston/lib/winston/transports';
export declare enum LoggerLevel {
    emerg = "emerg",
    alert = "alert",
    crit = "crit",
    error = "error",
    warning = "warning",
    notice = "notice",
    info = "info",
    debug = "debug"
}
export interface LoggerOptions {
    transport?: ConsoleTransportInstance;
    level?: LoggerLevel;
}
export declare class PidmanLogger {
    #private;
    private options?;
    static _instance: PidmanLogger;
    constructor(options?: LoggerOptions | undefined);
    static instance(options?: LoggerOptions): PidmanLogger;
    info(msg: string): void;
    error(msg: string): void;
}
