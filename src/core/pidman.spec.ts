import { mocked } from 'ts-jest/utils';
import { Pidman } from './';
import { PidmanGroup } from './group';
import { PidmanStringUtils } from '../utils';

jest.mock('./group');
jest.mock('../utils');

const mockedStringUtils = mocked(PidmanStringUtils, true);
const mockedGroup = mocked(PidmanGroup, true);

describe('initializing pidman', () => {
  beforeAll(() => mockedStringUtils.getId.mockReturnValue('test'));

  test('construct without options', () => {
    const pidman = new Pidman();

    expect(pidman).toBeInstanceOf(Pidman);
    expect(pidman.getOptions().id).toBe('test');
  });

  test('construct with options', () => {
    const pidman = new Pidman({
      id: 'newid'
    });

    expect(pidman).toBeInstanceOf(Pidman);
    expect(pidman.getOptions().id).toBe('newid');
  });
});

describe('adding and running groups', () => {
  let pidman: Pidman;

  beforeAll(() => {
    pidman = new Pidman();
  });

  test('adding a group in object form', () => {
    pidman.addProcessGroup({
      id: 'newgroup'
    });

    expect(PidmanGroup).toHaveBeenCalledTimes(1);
    expect(pidman.getProcessGroups()).toHaveLength(1);
  });

  test('adding a group in instance form', () => {
    const group = new PidmanGroup({});
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
