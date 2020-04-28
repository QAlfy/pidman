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
var rxjs_1 = require("rxjs");
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
        this.dataSubject = new rxjs_1.BehaviorSubject({});
        this.errorSubject = new rxjs_1.BehaviorSubject({});
        this.exitSubject = new rxjs_1.BehaviorSubject({});
        this.closeSubject = new rxjs_1.BehaviorSubject({});
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
     * @returns ChildProcess
     */
    PidmanProcess.prototype.getChildProcess = function () {
        return this.ps;
    };
    /**
     * @returns ChildProcess
     */
    PidmanProcess.prototype.run = function () {
        var _this = this;
        var _a;
        this.ps = child_process_1.spawn(this.options.command, this.options.arguments || [], {
            uid: (!this.options.user && undefined) ||
                utils_1.PidmanSysUtils.getUid(this.options.user || ''),
            cwd: this.options.path,
            env: this.options.envVars || {},
            gid: utils_1.PidmanSysUtils.getGid(this.options.group || ''),
            shell: this.options.shell || false,
        });
        (_a = this.ps.stdout) === null || _a === void 0 ? void 0 : _a.on('data', function (data) {
            return _this.dataSubject.next({ data: data, group: _this });
        });
        this.ps.on('error', function (error) {
            return _this.dataSubject.next({ error: error, group: _this });
        });
        this.ps.on('close', function (code, signal) {
            return _this.dataSubject.next({ code: code, signal: signal, group: _this });
        });
        this.ps.on('exit', function (code, signal) {
            return _this.dataSubject.next({ code: code, signal: signal, group: _this });
        });
        return this.ps;
    };
    PidmanProcess.prototype.stop = function () {
        return this.ps.kill(this.options.killSignal);
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