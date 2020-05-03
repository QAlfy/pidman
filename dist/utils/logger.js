"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _logger;
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const { combine, timestamp, label, printf } = winston_1.format;
const pidmanLogFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});
var LoggerLevel;
(function (LoggerLevel) {
    LoggerLevel["error"] = "error";
    LoggerLevel["warning"] = "warning";
    LoggerLevel["notice"] = "notice";
    LoggerLevel["info"] = "info";
})(LoggerLevel = exports.LoggerLevel || (exports.LoggerLevel = {}));
class PidmanLogger {
    constructor(options) {
        var _a, _b, _c, _d, _e;
        this.options = options;
        _logger.set(this, void 0);
        if (!options) {
            this.options = {};
        }
        if (!((_a = this.options) === null || _a === void 0 ? void 0 : _a.transport)) {
            this.options.transport = new winston_1.transports.Console();
        }
        if (!((_b = this.options) === null || _b === void 0 ? void 0 : _b.level)) {
            this.options.level = LoggerLevel.info;
        }
        __classPrivateFieldSet(this, _logger, winston_1.createLogger({
            format: combine(label({ label: 'Pidman' }), timestamp(), pidmanLogFormat),
            transports: [((_c = this.options) === null || _c === void 0 ? void 0 : _c.transport) || new winston_1.transports.Console()],
            exceptionHandlers: [((_d = this.options) === null || _d === void 0 ? void 0 : _d.transport)
                    || new winston_1.transports.Console()],
            exitOnError: false,
            level: (_e = this.options) === null || _e === void 0 ? void 0 : _e.level
        }));
        PidmanLogger._instance = this;
    }
    static instance(options) {
        if (!PidmanLogger._instance) {
            PidmanLogger._instance = new PidmanLogger(options);
        }
        return PidmanLogger._instance;
    }
    info(msg) {
        __classPrivateFieldGet(this, _logger).log('info', msg);
    }
    error(msg) {
        __classPrivateFieldGet(this, _logger).log('error', msg);
    }
    warn(msg) {
        __classPrivateFieldGet(this, _logger).log('warn', msg);
    }
}
exports.PidmanLogger = PidmanLogger;
_logger = new WeakMap();
//# sourceMappingURL=logger.js.map