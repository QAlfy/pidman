"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
class PidmanEventUtils {
    /**
     * @param  {any} data
     * @returns any
     */
    static parseCloseEvent(data) {
        let output = { output: '' };
        output = lodash_1.reduce(data, (acc, val) => {
            if (val instanceof Buffer) {
                acc.output += val.toString();
            }
            else if (val instanceof Object) {
                acc = Object.assign(Object.assign({}, acc), val);
            }
            return acc;
        }, output);
        if (output.output === '') {
            delete output.output;
        }
        return (Object.assign(Object.assign({}, output), { time: Date.now() }));
    }
}
exports.PidmanEventUtils = PidmanEventUtils;
//# sourceMappingURL=event.js.map