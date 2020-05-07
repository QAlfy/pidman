"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("ts-jest/utils");
const _1 = require("./");
const group_1 = require("./group");
const utils_2 = require("../utils");
jest.mock('./group');
jest.mock('../utils');
const mockedStringUtils = utils_1.mocked(utils_2.PidmanStringUtils, true);
const mockedGroup = utils_1.mocked(group_1.PidmanGroup, true);
describe('initializing pidman', () => {
    beforeAll(() => mockedStringUtils.getId.mockReturnValue('test'));
    test('construct without options', () => {
        const pidman = new _1.Pidman();
        expect(pidman).toBeInstanceOf(_1.Pidman);
        expect(pidman.getOptions().id).toBe('test');
    });
    test('construct with options', () => {
        const pidman = new _1.Pidman({
            id: 'newid'
        });
        expect(pidman).toBeInstanceOf(_1.Pidman);
        expect(pidman.getOptions().id).toBe('newid');
    });
});
describe('adding and running groups', () => {
    let pidman;
    beforeAll(() => {
        pidman = new _1.Pidman();
    });
    test('adding a group in object form', () => {
        pidman.addProcessGroup({
            id: 'newgroup'
        });
        expect(group_1.PidmanGroup).toHaveBeenCalledTimes(1);
        expect(pidman.getProcessGroups()).toHaveLength(1);
    });
    test('adding a group in instance form', () => {
        const group = new group_1.PidmanGroup({});
        pidman.addProcessGroup(group);
        expect(pidman.getProcessGroups()).toHaveLength(2);
    });
    test('running all groups', () => {
        const group1 = mockedGroup.mock.instances[0];
        const group2 = mockedGroup.mock.instances[1];
        pidman.run();
        expect(group1.run).toHaveBeenCalledTimes(1);
        expect(group2.run).toHaveBeenCalledTimes(1);
    });
});
//# sourceMappingURL=pidman.spec.js.map