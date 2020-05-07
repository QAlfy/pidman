"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("ts-jest/utils");
const group_1 = require("./group");
const process_1 = require("./process");
jest.mock('./process');
const mockedProcess = utils_1.mocked(process_1.PidmanProcess, true);
describe('initializing group', () => {
    beforeEach(() => mockedProcess.mockClear());
    test('create a group with processes via constructor', () => {
        new group_1.PidmanGroup({
            processes: [
                {
                    command: 'ls'
                }
            ]
        });
        expect(process_1.PidmanProcess).toHaveBeenCalledTimes(1);
        expect(mockedProcess.mock.instances[0].setGroup).toHaveBeenCalled();
    });
    test('create a group and add process via method', () => {
        const group = new group_1.PidmanGroup({});
        group.addProcess({
            command: 'ls'
        });
        expect(process_1.PidmanProcess).toHaveBeenCalledTimes(1);
        expect(mockedProcess.mock.instances[0].setGroup).toHaveBeenCalled();
    });
});
describe('run and kill processes in group', () => {
    let group;
    let proc;
    beforeAll(() => {
        mockedProcess.mockClear();
        group = new group_1.PidmanGroup({
            processes: [{
                    command: 'ls'
                }]
        });
        expect(process_1.PidmanProcess).toHaveBeenCalledTimes(1);
        proc = mockedProcess.mock.instances[0];
        expect(proc.setGroup).toHaveBeenCalled();
    });
    test('run processes in group', () => {
        group.run();
        expect(proc.run).toHaveBeenCalled();
    });
    test('kill processes in group', () => {
        group.kill();
        expect(proc.kill).toHaveBeenCalled();
    });
});
describe('group serialization', () => {
    let group;
    beforeAll(() => {
        group = new group_1.PidmanGroup({
            processes: [{
                    command: 'ls'
                }]
        });
    });
    test('group can serialize itself', () => {
        expect(group.serialize()).toHaveProperty('options.id');
    });
    test('group can deserialize itself', () => {
        const serialized = group.serialize();
        expect(group.deserialize(serialized)).toBeInstanceOf(group_1.PidmanGroup);
    });
});
//# sourceMappingURL=group.spec.js.map