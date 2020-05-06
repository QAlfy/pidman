import { Pidman } from './pidman';
import { PidmanStringUtils } from '../utils';
import { mocked } from 'ts-jest/utils';

jest.mock('../utils');

const mockedStringUtils = mocked(PidmanStringUtils, true);

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
