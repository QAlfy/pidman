"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var PidmanSysUtils = /** @class */ (function () {
    function PidmanSysUtils() {
    }
    PidmanSysUtils.getUid = function (user) {
        if (process.platform === 'win32') {
            return 0;
        }
        var uid = child_process_1.execSync("id -u " + user).toString();
        return Number(uid);
    };
    PidmanSysUtils.getGid = function (group) {
        if (process.platform === 'win32') {
            return 0;
        }
        var uid = child_process_1.execSync("id -g " + group).toString();
        return Number(uid);
    };
    return PidmanSysUtils;
}());
exports.PidmanSysUtils = PidmanSysUtils;
//# sourceMappingURL=sys.js.map