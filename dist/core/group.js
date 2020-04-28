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
        this.options.processes.push(process);
    };
    /**
     * @returns GroupOptions
     */
    PidmanGroup.prototype.getOptions = function () {
        return this.options;
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