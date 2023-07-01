import {describe, expect, it, test} from 'bun:test';
import {mixed} from './mixed.ts';

describe('mixed', () => {
  it('mixed', () => {
    const result = mixed().test(undefined);
    expect(result).toBe('');
  });
  test('mixed:not_void', () => {
    const validResult = mixed().notVoid().test('');
    const notValidResult = mixed().notVoid().test(undefined);
    expect(validResult).toBe('');
    expect(notValidResult).not.toBe('');
  });
});
