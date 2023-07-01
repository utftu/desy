import {describe, it, expect} from 'bun:test';
import {boolean} from './boolean.ts';

describe('boolean', () => {
  it('boolean:boolean', () => {
    expect(boolean().test(true)).toBe('');
    expect(boolean().test(false)).toBe('');
    expect(boolean().test(undefined)).not.toBe('');
  });
});
