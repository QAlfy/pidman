"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
class PidmanStringUtils {
    static getId() {
        return crypto_1.createHash('sha1')
            .update(crypto_1.randomBytes(32))
            .digest('hex');
    }
}
exports.PidmanStringUtils = PidmanStringUtils;
//# sourceMappingURL=strings.js.map