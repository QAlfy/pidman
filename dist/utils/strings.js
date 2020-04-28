"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var PidmanStringUtils = /** @class */ (function () {
    function PidmanStringUtils() {
    }
    PidmanStringUtils.getId = function () {
        return crypto_1.createHash('sha1')
            .update(crypto_1.randomBytes(32))
            .digest('hex');
    };
    return PidmanStringUtils;
}());
exports.PidmanStringUtils = PidmanStringUtils;
//# sourceMappingURL=strings.js.map