"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
class PidmanSysUtils {
    static getUid(user) {
        if (process.platform === 'win32') {
            return 0;
        }
        const uid = child_process_1.execSync(`id -u ${user}`).toString();
        return Number(uid);
    }
    static getGid(group) {
        if (process.platform === 'win32') {
            return 0;
        }
        const uid = child_process_1.execSync(`id -g ${group}`).toString();
        return Number(uid);
    }
}
exports.PidmanSysUtils = PidmanSysUtils;
//# sourceMappingURL=sys.js.map