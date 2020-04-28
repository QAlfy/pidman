"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Pidman = /** @class */ (function () {
    /**
     * @param  {PidmanOptions} privateoptions
     */
    function Pidman(options) {
        this.options = options;
        this.groups = [];
    }
    /**
     * @returns PidmanOptions
     */
    Pidman.prototype.getOptions = function () {
        return this.options;
    };
    /**
     * @param  {ProcessGroup} group
     */
    Pidman.prototype.addProcessGroup = function (group) {
        this.groups.push(group);
    };
    /**
     * @returns ProcessGroup
     */
    Pidman.prototype.getProcessGroups = function () {
        return this.groups;
    };
    return Pidman;
}());
exports.Pidman = Pidman;
//# sourceMappingURL=pidman.js.map