"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const terminate_1 = __importDefault(require("terminate"));
const bluebird_1 = require("bluebird");
class PidmanProcessUtils {
    /**
     * @param  {number} pid
     * @param  {NodeJS.Signals} signal?
     * @returns Promise
     */
    static killTree(pid, signal) {
        return __awaiter(this, void 0, void 0, function* () {
            return new bluebird_1.Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    try {
                        terminate_1.default(pid, signal, (err) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(true);
                            }
                        });
                    }
                    catch (err) {
                        reject(err);
                    }
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
}
exports.PidmanProcessUtils = PidmanProcessUtils;
//# sourceMappingURL=process.js.map