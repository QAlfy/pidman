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
var rxjs_1 = require("rxjs");
var typescript_json_serializer_1 = require("typescript-json-serializer");
var _1 = require("./");
var utils_1 = require("../utils");
var PidmanGroup = /** @class */ (function () {
    /**
     * @param  {GroupOptions} privateoptions
     * @param  {PidmanMonitor} publicmonitor
     */
    function PidmanGroup(options, monitor) {
        this.options = options;
        this.monitor = monitor;
        this.dataSubjects = [];
        this.errorSubjects = [];
        this.exitSubjects = [];
        this.closeSubjects = [];
        this.processes = [];
        if (!this.options.id) {
            this.options.id = utils_1.PidmanStringUtils.getId();
        }
        if (!this.options.monitor) {
            this.options.monitor = monitor;
        }
    }
    /**
     * @param  {ProcessOptions} process
     */
    PidmanGroup.prototype.addProcess = function (options) {
        var process = new _1.PidmanProcess(options);
        process.setGroup(this);
        process.subscribe(this);
        this.processes.push(process);
    };
    /**
     * @returns GroupOptions
     */
    PidmanGroup.prototype.getOptions = function () {
        return this.options;
    };
    /**
     * @returns Array<PidmanProcess>
     */
    PidmanGroup.prototype.getProcesses = function () {
        return this.processes;
    };
    PidmanGroup.prototype.startMonitoring = function () {
        var _a, _b, _c, _d;
        rxjs_1.combineLatest.apply(void 0, this.dataSubjects).subscribe((_a = this.options.monitor) === null || _a === void 0 ? void 0 : _a.onData);
        rxjs_1.combineLatest.apply(void 0, this.errorSubjects).subscribe((_b = this.options.monitor) === null || _b === void 0 ? void 0 : _b.onError);
        rxjs_1.combineLatest.apply(void 0, this.exitSubjects).subscribe((_c = this.options.monitor) === null || _c === void 0 ? void 0 : _c.onExit);
        rxjs_1.combineLatest.apply(void 0, this.closeSubjects).subscribe((_d = this.options.monitor) === null || _d === void 0 ? void 0 : _d.onClose);
    };
    PidmanGroup.prototype.run = function () {
        this.processes.forEach(function (process) { return process.run(); });
    };
    PidmanGroup.prototype.stop = function () {
        return true;
    };
    PidmanGroup = __decorate([
        typescript_json_serializer_1.Serializable(),
        __param(0, typescript_json_serializer_1.JsonProperty()),
        __metadata("design:paramtypes", [Object, Object])
    ], PidmanGroup);
    return PidmanGroup;
}());
exports.PidmanGroup = PidmanGroup;
//# sourceMappingURL=group.js.map