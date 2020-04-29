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
        var _this = this;
        var _a;
        this.child = child_process_1.spawn(this.options.command, this.options.arguments || [], {
            uid: (!this.options.user && undefined) ||
                utils_1.PidmanSysUtils.getUid(this.options.user || ''),
            cwd: this.options.path,
            env: this.options.envVars || {},
            gid: utils_1.PidmanSysUtils.getGid(this.options.group || ''),
            shell: this.options.shell || false,
        });
        (_a = this.child.stdout) === null || _a === void 0 ? void 0 : _a.on('data', function (data) {
            var _a;
            return ((_a = _this.group) === null || _a === void 0 ? void 0 : _a.dataSubject.next({
                data: data, process: _this, time: Date.now(),
                event: EventType.onData
            })) || null;
        });
        this.child.on('error', function (error) { var _a; return (_a = _this.group) === null || _a === void 0 ? void 0 : _a.errorSubject.next({
            error: error, process: _this, time: Date.now(),
            event: EventType.onError
        }); });
        this.child.on('close', function (code, signal) { var _a; return (_a = _this.group) === null || _a === void 0 ? void 0 : _a.closeSubject.next({
            code: code, signal: signal, process: _this, time: Date.now(),
            event: EventType.onClose
        }); });
        this.child.on('exit', function (code, signal) { var _a; return (_a = _this.group) === null || _a === void 0 ? void 0 : _a.exitSubject.next({
            code: code, signal: signal, process: _this, time: Date.now(),
            event: EventType.onExit
        }); });
    };
    /**
     * @returns boolean
     */
    PidmanProcess.prototype.stop = function () {
        return this.child && this.child.kill(this.options.killSignal) || false;
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