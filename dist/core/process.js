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
var _subscriptionsMap, _closeEvent, _errorEvent, _stderrEvent, _dataEvent;
var PidmanProcess_1;
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const rxjs_1 = require("rxjs");
const lodash_1 = require("lodash");
const typescript_json_serializer_1 = require("typescript-json-serializer");
const logger_1 = require("../utils/logger");
const utils_1 = require("../utils");
const operators_1 = require("rxjs/operators");
const bluebird_1 = require("bluebird");
let PidmanProcess = PidmanProcess_1 = class PidmanProcess {
    /**
     * @param  {ProcessOptions} privateoptions
     */
    constructor(options) {
        this.options = options;
        _subscriptionsMap.set(this, void 0);
        _closeEvent.set(this, void 0);
        _errorEvent.set(this, void 0);
        _stderrEvent.set(this, void 0);
        _dataEvent.set(this, void 0);
        if (!this.options.id) {
            this.options.id = utils_1.PidmanStringUtils.getId();
        }
        if (!this.options.killSignal) {
            this.options.killSignal = 'SIGTERM';
        }
        __classPrivateFieldSet(this, _dataEvent, new rxjs_1.Observable());
        __classPrivateFieldSet(this, _closeEvent, new rxjs_1.Observable());
        __classPrivateFieldSet(this, _errorEvent, new rxjs_1.Observable());
        __classPrivateFieldSet(this, _stderrEvent, new rxjs_1.Observable());
        __classPrivateFieldSet(this, _subscriptionsMap, {});
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
        logger_1.PidmanLogger.instance().info([
            `starting process ${this.options.id} as:`,
            JSON.stringify(this.serialize())
        ].join(' '));
        this.child = child_process_1.spawn(this.options.command, this.options.arguments || [], {
            uid: (!this.options.user && undefined) ||
                utils_1.PidmanSysUtils.getUid(this.options.user || ''),
            cwd: this.options.path,
            env: this.options.envVars || {},
            gid: utils_1.PidmanSysUtils.getGid(this.options.group || ''),
            shell: this.options.shell || false,
            detached: true,
            windowsHide: true
        });
        this.child.unref();
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
        var _a, _b, _c, _d, _e, _f, _g;
        const metadata = {
            process: this,
            pid: (_a = this.child) === null || _a === void 0 ? void 0 : _a.pid,
            time: Date.now()
        };
        // emit when new data goes to stdout
        const processDataEvent$ = __classPrivateFieldGet(this, _dataEvent).pipe(operators_1.multicast(new rxjs_1.Subject()), operators_1.refCount());
        __classPrivateFieldGet(this, _subscriptionsMap).dataToSelf = processDataEvent$.subscribe((_c = (_b = this.group) === null || _b === void 0 ? void 0 : _b.options.monitor) === null || _c === void 0 ? void 0 : _c.onData);
        __classPrivateFieldGet(this, _subscriptionsMap).dataToGroup = processDataEvent$.subscribe((_d = this.options.monitor) === null || _d === void 0 ? void 0 : _d.onData);
        // emit concatenated version of error/close info and exit codes
        const processCloseEvent$ = rxjs_1.merge(__classPrivateFieldGet(this, _errorEvent), __classPrivateFieldGet(this, _stderrEvent), __classPrivateFieldGet(this, _closeEvent).pipe(operators_1.map((data) => ({
            exitCode: data[0],
            signalCode: data[1]
        }))))
            .pipe(operators_1.scan((acc, data) => ([...acc, data]), []), operators_1.skipUntil(__classPrivateFieldGet(this, _closeEvent)), operators_1.catchError(error => rxjs_1.of(error)))
            .pipe(operators_1.map(data => {
            /*
            handle various types of process termination
            (e.g. a program goes into daemon mode).
            */
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
        }), operators_1.multicast(new rxjs_1.Subject()), operators_1.refCount());
        __classPrivateFieldGet(this, _subscriptionsMap).closeToSelf = processCloseEvent$.subscribe((_e = this.options.monitor) === null || _e === void 0 ? void 0 : _e.onComplete);
        __classPrivateFieldGet(this, _subscriptionsMap).closeToGroup = processCloseEvent$.subscribe((_g = (_f = this.group) === null || _f === void 0 ? void 0 : _f.options.monitor) === null || _g === void 0 ? void 0 : _g.onComplete);
    }
    /**
     * @param  {NodeJS.Signals} signal?
     * @returns Promise
     */
    kill(signal) {
        return new bluebird_1.Promise((resolve, reject) => {
            var _a, _b;
            if (this.child) {
                let killed = false;
                const exitCode = lodash_1.get(this.child, 'exitCode');
                if (exitCode === null) {
                    const childrenKilled$ = rxjs_1.from(utils_1.PidmanProcessUtils.killTree((_a = this.child) === null || _a === void 0 ? void 0 : _a.pid)).pipe(
                    // @todo generate new channel to inform user
                    operators_1.multicast(new rxjs_1.Subject()), operators_1.refCount(), operators_1.catchError(error => rxjs_1.of(error)));
                    const childrenKilledSub = childrenKilled$
                        .subscribe(success => {
                        var _a, _b;
                        signal = signal || this.options.killSignal;
                        killed = this.child && this.child.kill(signal)
                            || false;
                        if (killed) {
                            logger_1.PidmanLogger.instance().info([
                                `killed process ${this.options.id}`,
                                `(PID: ${(_a = this.child) === null || _a === void 0 ? void 0 : _a.pid})`,
                                `with signal ${signal}`
                            ].join(' '));
                        }
                        else {
                            logger_1.PidmanLogger.instance().error([
                                `unable to kill process ${this.options.id}`,
                                `(PID: ${(_b = this.child) === null || _b === void 0 ? void 0 : _b.pid})`,
                                `with signal ${signal}`
                            ].join(' '));
                        }
                        childrenKilledSub.unsubscribe();
                        this.unsubscribeAll();
                        if (typeof success === 'boolean') {
                            resolve(killed && success);
                        }
                        else {
                            reject(success);
                        }
                    });
                }
                else {
                    logger_1.PidmanLogger.instance().info([
                        `process ${this.options.id}`,
                        `(PID: ${(_b = this.child) === null || _b === void 0 ? void 0 : _b.pid})`,
                        `has already exited with code ${exitCode}.`,
                        'PID might be not longer ours',
                        'or process has been daemonized.'
                    ].join(' '));
                    resolve(false);
                }
            }
            else {
                resolve(false);
            }
        });
    }
    unsubscribeAll() {
        Object.keys(__classPrivateFieldGet(this, _subscriptionsMap)).forEach(subKey => {
            __classPrivateFieldGet(this, _subscriptionsMap)[subKey].unsubscribe();
        });
    }
    serialize() {
        return typescript_json_serializer_1.serialize(this);
    }
    deserialize(json) {
        return new PidmanProcess_1(json.options);
    }
};
_subscriptionsMap = new WeakMap(), _closeEvent = new WeakMap(), _errorEvent = new WeakMap(), _stderrEvent = new WeakMap(), _dataEvent = new WeakMap();
PidmanProcess = PidmanProcess_1 = __decorate([
    typescript_json_serializer_1.Serializable(),
    __param(0, typescript_json_serializer_1.JsonProperty()),
    __metadata("design:paramtypes", [Object])
], PidmanProcess);
exports.PidmanProcess = PidmanProcess;
//# sourceMappingURL=process.js.map