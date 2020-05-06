import { mocked } from 'ts-jest/utils';
import { PidmanGroup } from './group';
import { PidmanProcess } from './process';
import { fork, ChildProcess } from 'child_process';

jest.mock('child_process');
jest.mock('./process');

const mockedFork = mocked(fork);
const mockedProcess = mocked(PidmanProcess, true);

describe('initializing group', () => {
  beforeEach(() => mockedProcess.mockClear());

  test('create a group with processes via constructor', () => {
    new PidmanGroup({
      processes: [
        {
          command: 'ls'
        }
      ]
    });

    expect(PidmanProcess).toHaveBeenCalledTimes(1);
    expect(mockedProcess.mock.instances[0].setGroup).toHaveBeenCalled();
  });

  test('create a group and add process via method', () => {
    const group = new PidmanGroup({});

    group.addProcess({
      command: 'ls'
    });

    expect(PidmanProcess).toHaveBeenCalledTimes(1);
    expect(mockedProcess.mock.instances[0].setGroup).toHaveBeenCalled();
  })
});

describe('run and kill processes in group', () => {
  let group: PidmanGroup;
  let proc: PidmanProcess;

  beforeAll(() => {
    mockedProcess.mockClear();
    mockedFork.mockReturnValue({} as ChildProcess);

    group = new PidmanGroup({
      processes: [{
        command: 'ls'
      }]
    });

    expect(PidmanProcess).toHaveBeenCalledTimes(1);

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
  let group: PidmanGroup;

  beforeAll(() => {
    group = new PidmanGroup({
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

    expect(group.deserialize(serialized)).toBeInstanceOf(PidmanGroup);
  });
});
