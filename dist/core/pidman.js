"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const memory_1 = __importDefault(require("../connector/memory"));
const _1 = require("./");
const utils_1 = require("../utils");
class Pidman {
    /**
     * @param  {PidmanOptions} privateoptions
     */
    constructor(options = {}) {
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
    getOptions() {
        return this.options;
    }
    /**
     * @param  {GroupOptions | PidmanGroup} options
     * @returns void
     */
    addProcessGroup(group) {
        let newGroup;
        if (group instanceof _1.PidmanGroup) {
            newGroup = group;
        }
        else {
            newGroup = new _1.PidmanGroup(group);
        }
        this.groups.push(newGroup);
    }
    /**
     * @returns PidmanGroup
     */
    getProcessGroups() {
        return this.groups;
    }
    /**
     * @returns void
     */
    run() {
        this.groups.forEach(group => group.run());
    }
}
exports.Pidman = Pidman;
//# sourceMappingURL=pidman.js.map