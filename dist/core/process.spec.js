"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const rxjs_1 = require("rxjs");
const utils_1 = require("ts-jest/utils");
const process_1 = require("./process");
const utils_2 = require("../utils");
jest.mock('rxjs');
jest.mock('child_process');
jest.mock('../utils');
const mockedFork = utils_1.mocked(child_process_1.fork);
const mockedObservable = utils_1.mocked(rxjs_1.Observable, true);
const mockedFromEvent = utils_1.mocked(rxjs_1.fromEvent, true);
const mockedMerge = utils_1.mocked(rxjs_1.merge, true);
const mockedStringUtils = utils_1.mocked(utils_2.PidmanStringUtils, true);
mockedFork.mockReturnValue({
    send: (msg, errCbk) => errCbk(null),
    on: (msg, cbk) => cbk(msg),
    unref: () => { rxjs_1.noop(); }
});
mockedFromEvent.mockReturnValue(new rxjs_1.Observable());
mockedMerge.mockReturnValue({
    pipe: () => (new rxjs_1.Observable())
});
describe('initializing a process', () => {
    beforeAll(() => mockedStringUtils.getId.mockReturnValue('test'));
    beforeEach(() => {
        mockedFork.mockClear();
        mockedObservable.mockClear();
    });
    test('process cannot initialize without a command', () => {
        const badInit = () => (new process_1.PidmanProcess({
            command: ''
        }));
        expect(badInit).toThrowError();
    });
    test('process can initialize with required options', () => {
        const proc = new process_1.PidmanProcess({
            command: 'ls'
        });
        expect(proc.getOptions().id).toEqual('test');
        expect(proc.getOptions().killSignal).toEqual('SIGTERM');
        expect(rxjs_1.Observable).toHaveBeenCalledTimes(5);
        expect(proc.getChildProcess()).toBeUndefined();
    });
});
describe('running a process', () => {
    let proc;
    beforeAll(() => (proc = new process_1.PidmanProcess({
        command: 'ls'
    })));
    beforeEach(() => {
        mockedFork.mockClear();
    });
    test('process can fork on run', () => {
        proc.run();
        expect(mockedFork.mock.calls).toHaveLength(1);
        expect(proc.getChildProcess()).toBeDefined();
    });
    test('subscriptions to child events have been made', () => {
        expect(rxjs_1.merge).toHaveBeenCalledTimes(2);
        expect(mockedObservable.mockImplementation()
            .prototype.subscribe).toHaveBeenCalledTimes(4);
    });
});
//# sourceMappingURL=process.spec.js.map