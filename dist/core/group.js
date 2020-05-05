"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PidmanGroup_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_json_serializer_1 = require("typescript-json-serializer");
const logger_1 = require("../utils/logger");
const _1 = require("./");
const utils_1 = require("../utils");
const bluebird_1 = require("bluebird");
let PidmanGroup = PidmanGroup_1 = class PidmanGroup {
    /**
     * @param  {GroupOptions} publicoptions
     * @param  {PidmanMonitor} publicmonitor
     */
    constructor(options) {
        this.options = options;
        this.processes = [];
        if (!this.options.id) {
            this.options.id = utils_1.PidmanStringUtils.getId();
        }
        if (this.options.processes) {
            this.options.processes.forEach(process => this.addProcess(process));
        }
    }
    /**
     * Join a [[PidmanProcess]] to this group.
     *
     * @param  {ProcessOptions} process
     */
    addProcess(process) {
        let newProcess;
        if (process instanceof _1.PidmanProcess) {
            newProcess = process;
        }
        else {
            newProcess = new _1.PidmanProcess(process);
        }
        newProcess.setGroup(this);
        this.processes.push(newProcess);
    }
    /**
     * @returns GroupOptions
     */
    getOptions() {
        return this.options;
    }
    /**
     * List all processes in this group.
     *
     * @returns Array<PidmanProcess>
     */
    getProcesses() {
        return this.processes;
    }
    /**
     * Starts all processes in this group.
     *
     * @returns void
     */
    run() {
        this.processes.forEach(process => process.run());
    }
    /**
     * Kills all processes in this group.
     *
     * @returns boolean
     */
    kill(signal) {
        logger_1.PidmanLogger.instance().warn([
            'Daemonized/background processes',
            'might not be killed.',
            'They will remain orphan.',
            'See https://github.com/QAlfy/pidman#daemons-and-background-processes'
        ].join(' '));
        return new bluebird_1.Promise((resolve, reject) => {
            bluebird_1.Promise.all(this.processes.map(process => process.kill(signal)))
                .then(resolve)
                .catch(reject);
        });
    }
    serialize() {
        return typescript_json_serializer_1.serialize(this);
    }
    deserialize(json) {
        return new PidmanGroup_1(json.options);
    }
};
PidmanGroup = PidmanGroup_1 = __decorate([
    typescript_json_serializer_1.Serializable(),
    __param(0, typescript_json_serializer_1.JsonProperty()),
    __metadata("design:paramtypes", [Object])
], PidmanGroup);
exports.PidmanGroup = PidmanGroup;
//# sourceMappingURL=group.js.map