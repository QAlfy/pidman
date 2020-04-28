"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var PidmanProcess = /** @class */ (function () {
    /**
     * @param  {ProcessOptions} privateoptions
     */
    function PidmanProcess(options) {
        this.options = options;
    }
    /**
     * @returns ChildProcess
     */
    PidmanProcess.prototype.run = function () {
        this.ps = child_process_1.spawn(this.options.command);
        return this.ps;
    };
    return PidmanProcess;
}());
exports.PidmanProcess = PidmanProcess;
//# sourceMappingURL=process.js.map