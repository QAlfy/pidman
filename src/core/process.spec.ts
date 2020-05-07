import { ChildProcess, fork } from 'child_process';
import {
  fromEvent,
  merge,
  noop,
  Observable
} from 'rxjs';
import { mocked } from 'ts-jest/utils';
import { PidmanProcess } from './process';
import { PidmanStringUtils } from '../utils';

jest.mock('rxjs');
jest.mock('child_process');
jest.mock('../utils');

const mockedFork = mocked(fork);
const mockedObservable = mocked(Observable, true);
const mockedFromEvent = mocked(fromEvent, true);
const mockedMerge = mocked(merge, true);
const mockedStringUtils = mocked(PidmanStringUtils, true);

mockedFork.mockReturnValue({
  send: (msg, errCbk): void => errCbk(null),
  on: (msg, cbk): ChildProcess => cbk(msg),
  unref: (): void => { noop() }
} as ChildProcess);

mockedFromEvent.mockReturnValue(new Observable<unknown>());
mockedMerge.mockReturnValue({
  pipe: (): Observable<unknown> => (new Observable<unknown>())
} as Observable<unknown>);

describe('initializing a process', () => {
  beforeAll(() => mockedStringUtils.getId.mockReturnValue('test'));

  beforeEach(() => {
    mockedFork.mockClear();
    mockedObservable.mockClear();
  });

  test('process cannot initialize without a command', () => {
    const badInit = (): PidmanProcess => (new PidmanProcess({
      command: ''
    }));

    expect(badInit).toThrowError();
  });

  test('process can initialize with required options', () => {
    const proc = new PidmanProcess({
      command: 'ls'
    });

    expect(proc.getOptions().id).toEqual('test');
    expect(proc.getOptions().killSignal).toEqual('SIGTERM');
    expect(Observable).toHaveBeenCalledTimes(5);
    expect(proc.getChildProcess()).toBeUndefined();
  });
});

describe('running a process', () => {
  let proc: PidmanProcess;

  beforeAll(() => (proc = new PidmanProcess({
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
    expect(merge).toHaveBeenCalledTimes(2);

    expect(mockedObservable.mockImplementation()
      .prototype.subscribe).toHaveBeenCalledTimes(4);
  });
});
