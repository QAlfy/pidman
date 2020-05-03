import { ConsoleTransportInstance } from 'winston/lib/winston/transports';
export declare enum LoggerLevel {
    error = "error",
    warning = "warning",
    notice = "notice",
    info = "info"
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
    warn(msg: string): void;
}
