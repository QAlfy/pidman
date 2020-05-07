import { ConsoleTransportInstance } from 'winston/lib/winston/transports';
/** The different log levels. */
export declare enum LoggerLevel {
    error = "error",
    warning = "warning",
    notice = "notice",
    info = "info"
}
/** The [[PidmanLogger]]'s options. */
export declare type LoggerOptions = {
    /** See https://github.com/winstonjs/winston/blob/master/docs/transports.md */
    transport?: ConsoleTransportInstance;
    /** (optional) The default minimum log level. */
    level?: LoggerLevel;
};
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
