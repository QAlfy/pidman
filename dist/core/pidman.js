"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var memory_1 = __importDefault(require("../connector/memory"));
var _1 = require("./");
var utils_1 = require("../utils");
var Pidman = /** @class */ (function () {
    /**
     * @param  {PidmanOptions} privateoptions
     */
    function Pidman(options) {
        this.options = options;
        this.groups = [];
        if (!this.options.id) {
            this.options.id = utils_1.PidmanStringUtils.getId();
        }
        if (!this.options.connector) {
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
     * @param  {GroupOptions} options
     * @returns void
     */
    Pidman.prototype.addProcessGroup = function (options) {
        var group = new _1.PidmanGroup(options, this.options.monitor);
        this.groups.push(group);
    };
    /**
     * @returns PidmanGroup
     */
    Pidman.prototype.getProcessGroups = function () {
        return this.groups;
    };
    return Pidman;
}());
exports.Pidman = Pidman;
//# sourceMappingURL=pidman.js.map