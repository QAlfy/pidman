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
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var typescript_json_serializer_1 = require("typescript-json-serializer");
var utils_1 = require("../utils");
var operators_1 = require("rxjs/operators");
var rxjs_1 = require("rxjs");
var EventType;
(function (EventType) {
    EventType["onData"] = "data";
    EventType["onError"] = "error";
    EventType["onExit"] = "exit";
    EventType["onClose"] = "close";
    EventType["onComplete"] = "complete";
})(EventType = exports.EventType || (exports.EventType = {}));
var PidmanProcess = /** @class */ (function () {
    /**
     * @param  {ProcessOptions} privateoptions
     */
    function PidmanProcess(options) {
        this.options = options;
        if (!this.options.id) {
            this.options.id = utils_1.PidmanStringUtils.getId();
        }
        if (!this.options.killSignal) {
            this.options.killSignal = 'SIGKILL';
        }
        this.dataEvent = new rxjs_1.Observable();
        this.exitEvent = new rxjs_1.Observable();
        this.errorEvent = new rxjs_1.Observable();
        this.closeEvent = new rxjs_1.Observable();
    }
    /**
     * @param  {PidmanGroup} group
     * @returns void
     */
    PidmanProcess.prototype.setGroup = function (group) {
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
    };
    /**
     * @returns PidmanGroup
     */
    PidmanProcess.prototype.getGroup = function () {
        return this.group;
    };
    /**
     * @returns ProcessOptions
     */
    PidmanProcess.prototype.getOptions = function () {
        return this.options;
    };
    /**
     * @returns ChildProcess
     */
    PidmanProcess.prototype.getChildProcess = function () {
        return this.child;
    };
    /**
     * @returns void
     */
    PidmanProcess.prototype.run = function () {
        this.child = child_process_1.spawn(this.options.command, this.options.arguments || [], {
            uid: (!this.options.user && undefined) ||
                utils_1.PidmanSysUtils.getUid(this.options.user || ''),
            cwd: this.options.path,
            env: this.options.envVars || {},
            gid: utils_1.PidmanSysUtils.getGid(this.options.group || ''),
            shell: this.options.shell || false,
        });
        this.dataEvent = rxjs_1.fromEvent(this.child.stdout, 'data');
        this.errorEvent = rxjs_1.fromEvent(this.child, 'error');
        this.exitEvent = rxjs_1.fromEvent(this.child, 'exit');
        this.closeEvent = rxjs_1.fromEvent(this.child.stderr, 'data');
        this.startMonitoring();
    };
    /**
     * @returns void
     */
    PidmanProcess.prototype.startMonitoring = function () {
        var _a, _b, _c, _d, _e;
        var metadata = {
            process: this,
            pid: (_a = this.child) === null || _a === void 0 ? void 0 : _a.pid,
            time: Date.now()
        };
        this.dataEvent.subscribe((_c = (_b = this.options.monitor) === null || _b === void 0 ? void 0 : _b.onData) === null || _c === void 0 ? void 0 : _c.bind(metadata));
        rxjs_1.merge(this.errorEvent, this.exitEvent, this.closeEvent)
            .pipe(operators_1.scan(function (acc, data) { return acc.concat(data); }, []), operators_1.catchError(function (error) { return rxjs_1.of(error); }))
            .subscribe((_e = (_d = this.options.monitor) === null || _d === void 0 ? void 0 : _d.onComplete) === null || _e === void 0 ? void 0 : _e.bind(metadata));
    };
    /**
     * @returns boolean
     */
    PidmanProcess.prototype.stop = function (signal) {
        return this.child && this.child.kill(signal
            || this.options.killSignal) || false;
    };
    PidmanProcess = __decorate([
        typescript_json_serializer_1.Serializable(),
        __param(0, typescript_json_serializer_1.JsonProperty()),
        __metadata("design:paramtypes", [Object])
    ], PidmanProcess);
    return PidmanProcess;
}());
exports.PidmanProcess = PidmanProcess;
//# sourceMappingURL=process.js.map