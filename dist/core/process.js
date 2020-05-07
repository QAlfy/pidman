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
var _subscriptionsMap, _closeEvent, _errorEvent, _stderrEvent, _dataEvent, _forkedCloseEvent, _child, _forkedPID;
var PidmanProcess_1;
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const forked_1 = require("./forked");
const rxjs_1 = require("rxjs");
const lodash_1 = require("lodash");
const typescript_json_serializer_1 = require("typescript-json-serializer");
const event_1 = require("../utils/event");
const logger_1 = require("../utils/logger");
const utils_1 = require("../utils");
const bluebird_1 = require("bluebird");
const operators_1 = require("rxjs/operators");
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
        _forkedCloseEvent.set(this, void 0);
        _child.set(this, void 0);
        _forkedPID.set(this, 0);
        this.running = false;
        if (!this.options.command || this.options.command.trim().length === 0) {
            throw new Error('A process cannot run without a command.');
        }
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
        __classPrivateFieldSet(this, _forkedCloseEvent, new rxjs_1.Observable());
        __classPrivateFieldSet(this, _subscriptionsMap, {});
        this.output = null;
    }
    /**
     * Sets the [[PidmanGroup]] to which this process belongs.
     *
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
     * Returns the [[PidmanGroup]] to which this process belongs.
     *
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
     * Returns the Node's [[ChildProcess]].
     * You may not need to use this one.
     *
     * @returns ChildProcess
     */
    getChildProcess() {
        return __classPrivateFieldGet(this, _child);
    }
    /**
     * Starts this process.
     *
     * @returns void
     */
    run() {
        logger_1.PidmanLogger.instance().info([
            `Starting process ${this.options.id} as:`,
            JSON.stringify(this.serialize())
        ].join(' '));
        __classPrivateFieldSet(this, _child, child_process_1.fork(`${__dirname}/forked.js`, undefined, {
            uid: (!this.options.user && undefined) ||
                utils_1.PidmanSysUtils.getUid(this.options.user || ''),
            cwd: this.options.path,
            env: this.options.envVars || {},
            gid: utils_1.PidmanSysUtils.getGid(this.options.group || ''),
            detached: true,
            silent: true
        }));
        // initialize IPC channel (first handshake)
        __classPrivateFieldGet(this, _child).send(new forked_1.ForkedMessage(forked_1.ForkedMessageType.options, this.options), (err) => {
            if (err) {
                logger_1.PidmanLogger.instance().error(err.toString());
            }
        });
        __classPrivateFieldGet(this, _child).on('message', (msg) => {
            var _a;
            if (msg.type === forked_1.ForkedMessageType.started) {
                this.running = true;
                __classPrivateFieldSet(this, _forkedPID, msg.body);
            }
            else if (msg.type === forked_1.ForkedMessageType.errored) {
                (_a = __classPrivateFieldGet(this, _child)) === null || _a === void 0 ? void 0 : _a.emit('error', msg.body);
            }
        });
        __classPrivateFieldGet(this, _child).unref();
        this.startMonitoring();
    }
    /**
     * For internal use only. Do not call directly.
     *
     * @returns void
     */
    startMonitoring() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const metadata = {
            process: this,
            pid: __classPrivateFieldGet(this, _forkedPID) !== 0 && __classPrivateFieldGet(this, _forkedPID) || ((_a = __classPrivateFieldGet(this, _child)) === null || _a === void 0 ? void 0 : _a.pid),
        };
        // let's handle all important events; don't miss anything
        __classPrivateFieldSet(this, _errorEvent, rxjs_1.fromEvent(__classPrivateFieldGet(this, _child), 'error'));
        __classPrivateFieldSet(this, _closeEvent, rxjs_1.fromEvent(__classPrivateFieldGet(this, _child), 'close'));
        __classPrivateFieldSet(this, _dataEvent, rxjs_1.fromEvent((_b = __classPrivateFieldGet(this, _child)) === null || _b === void 0 ? void 0 : _b.stdout, 'data'));
        __classPrivateFieldSet(this, _stderrEvent, rxjs_1.fromEvent((_c = __classPrivateFieldGet(this, _child)) === null || _c === void 0 ? void 0 : _c.stderr, 'data'));
        __classPrivateFieldSet(this, _forkedCloseEvent, rxjs_1.fromEvent(__classPrivateFieldGet(this, _child), 'message').pipe(operators_1.map((msg) => msg[0]), operators_1.filter((msg) => msg.type === forked_1.ForkedMessageType.closed), operators_1.map(msg => (Object.assign({}, msg.body)))));
        // emit when new data goes to stdout
        const processDataEvent$ = rxjs_1.merge(__classPrivateFieldGet(this, _dataEvent), __classPrivateFieldGet(this, _errorEvent), __classPrivateFieldGet(this, _stderrEvent))
            .pipe(operators_1.map((ev) => {
            const output = ev instanceof Buffer && ev.toString() || ev;
            return Object.assign(Object.assign({ output }, metadata), { time: Date.now() });
        }), operators_1.tap((ev) => (this.output = ev.output)), operators_1.multicast(new rxjs_1.Subject()), operators_1.refCount());
        __classPrivateFieldGet(this, _subscriptionsMap).dataToSelf = processDataEvent$.subscribe((_e = (_d = this.group) === null || _d === void 0 ? void 0 : _d.options.monitor) === null || _e === void 0 ? void 0 : _e.onData);
        __classPrivateFieldGet(this, _subscriptionsMap).dataToGroup = processDataEvent$.subscribe((_f = this.options.monitor) === null || _f === void 0 ? void 0 : _f.onData);
        // emit concatenated version of error/close info and exit codes
        const processChildEvent$ = rxjs_1.merge(__classPrivateFieldGet(this, _closeEvent).pipe(operators_1.map((data) => ({
            exitCode: data[0],
            signalCode: data[1]
        }))), __classPrivateFieldGet(this, _forkedCloseEvent))
            .pipe(operators_1.scan((acc, data) => ([...acc, data]), []), operators_1.map(event_1.PidmanEventUtils.parseCloseEvent), operators_1.map((msg) => (Object.assign(Object.assign({}, msg), metadata))), operators_1.tap((ev) => (this.running = false)), operators_1.catchError(error => rxjs_1.of(error)), operators_1.multicast(new rxjs_1.Subject()), operators_1.refCount());
        __classPrivateFieldGet(this, _subscriptionsMap).closeToSelf = processChildEvent$.subscribe((_g = this.options.monitor) === null || _g === void 0 ? void 0 : _g.onClose);
        __classPrivateFieldGet(this, _subscriptionsMap).closeToGroup = processChildEvent$.subscribe((_j = (_h = this.group) === null || _h === void 0 ? void 0 : _h.options.monitor) === null || _j === void 0 ? void 0 : _j.onClose);
    }
    /**
     * Kills this process.
     *
     * @param  {NodeJS.Signals} signal?
     * @returns Promise
     */
    kill(signal) {
        return new bluebird_1.Promise((resolve, reject) => {
            var _a, _b, _c;
            if (__classPrivateFieldGet(this, _child)) {
                let killed = false;
                const exitCode = lodash_1.get(__classPrivateFieldGet(this, _child), 'exitCode');
                if (exitCode === null) {
                    // inform the child about the kill
                    (_a = __classPrivateFieldGet(this, _child)) === null || _a === void 0 ? void 0 : _a.send(new forked_1.ForkedMessage(forked_1.ForkedMessageType.kill, null), (err) => {
                        if (err) {
                            reject(err);
                        }
                    });
                    // wait for child's confirmation
                    (_b = __classPrivateFieldGet(this, _child)) === null || _b === void 0 ? void 0 : _b.on('message', (msg) => {
                        var _a, _b;
                        if (msg.type
                            === forked_1.ForkedMessageType.killed) {
                            signal = signal || this.options.killSignal;
                            killed = __classPrivateFieldGet(this, _child) && __classPrivateFieldGet(this, _child).kill(signal)
                                || false;
                            if (killed) {
                                logger_1.PidmanLogger.instance().info([
                                    `Killed process ${this.options.id}`,
                                    `(PID: ${(_a = __classPrivateFieldGet(this, _child)) === null || _a === void 0 ? void 0 : _a.pid})`,
                                    // eslint-disable-next-line max-len
                                    `and its childrens with signal ${signal}.`,
                                ].join(' '));
                                if (!this.group) {
                                    logger_1.PidmanLogger.instance().warn([
                                        'Daemonized/background processes',
                                        'might not be killed.',
                                        'They will remain orphan.',
                                        'See https://github.com/QAlfy/pidman#daemons-and-background-processes'
                                    ].join(' '));
                                }
                                this.running = false;
                                this.unsubscribeAll();
                                resolve(true);
                            }
                            else {
                                logger_1.PidmanLogger.instance().error([
                                    // eslint-disable-next-line max-len
                                    `Unable to kill process ${this.options.id}`,
                                    `(PID: ${(_b = __classPrivateFieldGet(this, _child)) === null || _b === void 0 ? void 0 : _b.pid})`,
                                    `with signal ${signal}`
                                ].join(' '));
                                reject('Unable to kill forked process');
                            }
                        }
                        else if (msg.type === forked_1.ForkedMessageType.killfail) {
                            reject(msg.body);
                        }
                    });
                }
                else {
                    logger_1.PidmanLogger.instance().info([
                        `Process ${this.options.id}`,
                        `(PID: ${(_c = __classPrivateFieldGet(this, _child)) === null || _c === void 0 ? void 0 : _c.pid})`,
                        `has already exited with code ${exitCode}.`,
                        'PID might be not longer ours',
                        'or process has been daemonized.'
                    ].join(' '));
                    this.running = false;
                    this.unsubscribeAll();
                    resolve(false);
                }
            }
            else {
                this.running = false;
                this.unsubscribeAll();
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
_subscriptionsMap = new WeakMap(), _closeEvent = new WeakMap(), _errorEvent = new WeakMap(), _stderrEvent = new WeakMap(), _dataEvent = new WeakMap(), _forkedCloseEvent = new WeakMap(), _child = new WeakMap(), _forkedPID = new WeakMap();
PidmanProcess = PidmanProcess_1 = __decorate([
    typescript_json_serializer_1.Serializable(),
    __param(0, typescript_json_serializer_1.JsonProperty()),
    __metadata("design:paramtypes", [Object])
], PidmanProcess);
exports.PidmanProcess = PidmanProcess;
//# sourceMappingURL=process.js.map