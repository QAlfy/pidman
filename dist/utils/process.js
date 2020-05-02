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
const ps_tree_1 = __importDefault(require("ps-tree"));
const bluebird_1 = require("bluebird");
const child_process_1 = require("child_process");
class PidmanProcessUtils {
    static killTree(pid) {
        return __awaiter(this, void 0, void 0, function* () {
            return new bluebird_1.Promise((resolve, reject) => {
                ps_tree_1.default(pid, (err, childrens) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        if (process.platform !== 'win32') {
                            try {
                                child_process_1.spawnSync('kill', ['-9'].concat(childrens.map(p => p.PID)));
                                resolve(true);
                            }
                            catch (err) {
                                reject(err);
                            }
                        }
                        else {
                            resolve(true);
                        }
                    }
                });
            });
        });
    }
}
exports.PidmanProcessUtils = PidmanProcessUtils;
//# sourceMappingURL=process.js.map