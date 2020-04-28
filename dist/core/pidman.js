"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Pidman = /** @class */ (function () {
    function Pidman(options) {
        this.options = options;
        this.groups = [];
    }
    Pidman.prototype.getOptions = function () {
        return this.options;
    };
    Pidman.prototype.addProcessGroup = function (group) {
        this.groups.push(group);
    };
    Pidman.prototype.getProcessGroups = function () {
        return this.groups;
    };
    return Pidman;
}());
exports.Pidman = Pidman;
//# sourceMappingURL=pidman.js.map