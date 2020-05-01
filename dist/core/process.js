"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
var _closeEvent, _errorEvent, _stderrEvent, _dataEvent;
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const typescript_json_serializer_1 = require("typescript-json-serializer");
const utils_1 = require("../utils");
const lodash_1 = require("lodash");
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
var EventType;
(function (EventType) {
    EventType["onData"] = "data";
    EventType["onError"] = "error";
    EventType["onExit"] = "exit";
    EventType["onClose"] = "close";
    EventType["onComplete"] = "complete";
})(EventType = exports.EventType || (exports.EventType = {}));
let PidmanProcess = class PidmanProcess {
    /**
     * @param  {ProcessOptions} privateoptions
     */
    constructor(options) {
        this.options = options;
        _closeEvent.set(this, void 0);
        _errorEvent.set(this, void 0);
        _stderrEvent.set(this, void 0);
        _dataEvent.set(this, void 0);
        if (!this.options.id) {
            this.options.id = utils_1.PidmanStringUtils.getId();
        }
        if (!this.options.killSignal) {
            this.options.killSignal = 'SIGKILL';
        }
        __classPrivateFieldSet(this, _dataEvent, new rxjs_1.Observable());
        __classPrivateFieldSet(this, _closeEvent, new rxjs_1.Observable());
        __classPrivateFieldSet(this, _errorEvent, new rxjs_1.Observable());
        __classPrivateFieldSet(this, _stderrEvent, new rxjs_1.Observable());
    }
    /**
     * @param  {PidmanGroup} group
     * @returns void
     */
    setGroup(group) {
        this.group = group;
        if (!this.options.user) {
            this.options.user = this.group.getOptions().user;
        }
        if (!this.options.group) {
            this.options.group = this.group.getOptions().group;
        }
        if (!this.options.envVars) {
            this.options.envVars = this.group.getOptions().envVars;
        }
    }
    /**
     * @returns PidmanGroup
     */
    getGroup() {
        return this.group;
    }
    /**
     * @returns ProcessOptions
     */
    getOptions() {
        return this.options;
    }
    /**
     * @returns ChildProcess
     */
    getChildProcess() {
        return this.child;
    }
    /**
     * @returns void
     */
    run() {
        this.child = child_process_1.spawn(this.options.command, this.options.arguments || [], {
            uid: (!this.options.user && undefined) ||
                utils_1.PidmanSysUtils.getUid(this.options.user || ''),
            cwd: this.options.path,
            env: this.options.envVars || {},
            gid: utils_1.PidmanSysUtils.getGid(this.options.group || ''),
            shell: this.options.shell || false,
        });
        // let's handle all important events; don't miss anything
        __classPrivateFieldSet(this, _dataEvent, rxjs_1.fromEvent(this.child.stdout, 'data'));
        __classPrivateFieldSet(this, _errorEvent, rxjs_1.fromEvent(this.child, 'error'));
        __classPrivateFieldSet(this, _closeEvent, rxjs_1.fromEvent(this.child, 'close'));
        __classPrivateFieldSet(this, _stderrEvent, rxjs_1.fromEvent(this.child.stderr, 'data'));
        this.startMonitoring();
    }
    /**
     * @returns void
     */
    startMonitoring() {
        var _a, _b, _c, _d;
        const metadata = {
            process: this,
            pid: (_a = this.child) === null || _a === void 0 ? void 0 : _a.pid,
            time: Date.now()
        };
        // emit when new data goes to stdout
        __classPrivateFieldGet(this, _dataEvent).subscribe((_c = (_b = this.options.monitor) === null || _b === void 0 ? void 0 : _b.onData) === null || _c === void 0 ? void 0 : _c.bind(metadata));
        // emit concatenated version of error/close info and exit codes
        rxjs_1.merge(__classPrivateFieldGet(this, _errorEvent), __classPrivateFieldGet(this, _stderrEvent), __classPrivateFieldGet(this, _closeEvent).pipe(operators_1.map((data) => ({
            exitCode: data[0],
            signalCode: data[1]
        }))))
            .pipe(operators_1.scan((acc, data) => ([...acc, data]), []), operators_1.skipUntil(__classPrivateFieldGet(this, _closeEvent)), operators_1.catchError(error => rxjs_1.of(error)))
            .pipe(operators_1.map(data => {
            /* handle various types of process termination
            (e.g. a program goes into daemon mode) */
            let output = { message: '' };
            output = lodash_1.reduce(data, (acc, val) => {
                if (val instanceof Buffer) {
                    acc.message += val.toString();
                }
                else if (val instanceof Object) {
                    acc = Object.assign(Object.assign({}, acc), val);
                }
                return acc;
            }, output);
            return (Object.assign(Object.assign({}, output), metadata));
        }))
            .subscribe((_d = this.options.monitor) === null || _d === void 0 ? void 0 : _d.onComplete);
    }
    /**
     * @returns boolean
     */
    stop(signal) {
        return this.child && this.child.kill(signal
            || this.options.killSignal) || false;
    }
};
_closeEvent = new WeakMap(), _errorEvent = new WeakMap(), _stderrEvent = new WeakMap(), _dataEvent = new WeakMap();
PidmanProcess = __decorate([
    typescript_json_serializer_1.Serializable(),
    __param(0, typescript_json_serializer_1.JsonProperty()),
    __metadata("design:paramtypes", [Object])
], PidmanProcess);
exports.PidmanProcess = PidmanProcess;
//# sourceMappingURL=process.js.map