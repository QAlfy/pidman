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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _child;
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const utils_1 = require("../utils");
let forkedProcess;
var ForkedMessageType;
(function (ForkedMessageType) {
    ForkedMessageType[ForkedMessageType["started"] = 0] = "started";
    ForkedMessageType[ForkedMessageType["options"] = 1] = "options";
    ForkedMessageType[ForkedMessageType["kill"] = 2] = "kill";
    ForkedMessageType[ForkedMessageType["killed"] = 3] = "killed";
    ForkedMessageType[ForkedMessageType["fail"] = 4] = "fail";
})(ForkedMessageType = exports.ForkedMessageType || (exports.ForkedMessageType = {}));
class ForkedMessage {
    constructor(type, body) {
        this.type = type;
        this.body = body;
    }
}
exports.ForkedMessage = ForkedMessage;
class ForkedProcess {
    /**
     * @param  {ProcessOptions} privateoptions
     */
    constructor(options) {
        this.options = options;
        _child.set(this, void 0);
    }
    /**
     * @returns number
     */
    run() {
        __classPrivateFieldSet(this, _child, child_process_1.spawn(this.options.command, this.options.arguments || [], {
            uid: (!this.options.user && undefined) ||
                utils_1.PidmanSysUtils.getUid(this.options.user || ''),
            cwd: this.options.path,
            env: this.options.envVars || {},
            gid: utils_1.PidmanSysUtils.getGid(this.options.group || ''),
            shell: this.options.shell || false,
            // detached: true,
            stdio: 'inherit',
            windowsHide: true
        }));
        // this.#child.unref();
        return __classPrivateFieldGet(this, _child).pid;
    }
    getPid() {
        return __classPrivateFieldGet(this, _child).pid;
    }
}
_child = new WeakMap();
process.on('message', (msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (process.send) {
        // first handshake
        if (msg.type === ForkedMessageType.options) {
            const options = msg.body;
            // run process
            forkedProcess = new ForkedProcess(options);
            const pid = forkedProcess.run();
            // ACK
            process.send(new ForkedMessage(ForkedMessageType.started, pid));
        }
        // kill request
        if (msg.type === ForkedMessageType.kill) {
            try {
                const childrens = yield utils_1.PidmanProcessUtils.getPidChildrens(forkedProcess.getPid());
                const killed = yield utils_1.PidmanProcessUtils.killTree(forkedProcess.getPid());
                process.send(new ForkedMessage(ForkedMessageType.killed, childrens));
            }
            catch (err) {
                process.send(new ForkedMessage(ForkedMessageType.fail, err));
            }
        }
    }
}));
//# sourceMappingURL=forked.js.map