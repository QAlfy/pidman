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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var memory_1 = __importDefault(require("../connector/memory"));
var _1 = require("./");
var typescript_json_serializer_1 = require("typescript-json-serializer");
var utils_1 = require("../utils");
var Pidman = /** @class */ (function () {
    /**
     * @param  {PidmanOptions} privateoptions
     */
    function Pidman(options) {
        if (options === void 0) { options = {}; }
        var _a, _b;
        this.options = options;
        this.groups = [];
        if (!((_a = this.options) === null || _a === void 0 ? void 0 : _a.id)) {
            this.options.id = utils_1.PidmanStringUtils.getId();
        }
        if (!((_b = this.options) === null || _b === void 0 ? void 0 : _b.connector)) {
            this.options.connector = new memory_1.default();
        }
    }
    /**
     * @returns PidmanOptions
     */
    Pidman.prototype.getOptions = function () {
        return this.options;
    };
    /**
     * @param  {GroupOptions | PidmanGroup} options
     * @returns void
     */
    Pidman.prototype.addProcessGroup = function (group) {
        var newGroup;
        if (group instanceof _1.PidmanGroup) {
            newGroup = group;
        }
        else {
            newGroup = new _1.PidmanGroup(group);
            group.processes.forEach(function (process) { return newGroup.addProcess(process); });
        }
        this.groups.push(newGroup);
    };
    /**
     * @returns PidmanGroup
     */
    Pidman.prototype.getProcessGroups = function () {
        return this.groups;
    };
    /**
     * @returns void
     */
    Pidman.prototype.run = function () {
        this.groups.forEach(function (group) { return group.run(); });
    };
    Pidman = __decorate([
        typescript_json_serializer_1.Serializable(),
        __param(0, typescript_json_serializer_1.JsonProperty()),
        __metadata("design:paramtypes", [Object])
    ], Pidman);
    return Pidman;
}());
exports.Pidman = Pidman;
//# sourceMappingURL=pidman.js.map