import {describe, expect, it} from 'bun:test';
import {string} from './string.ts';

describe('string', () => {
  it('string:string', () => {
    const valid = string().test('valid');
    const empty = string().test('');
    const notString = string().test(undefined);

    expect(valid).toBe('');
    expect(empty).not.toBe('');
    expect(notString).not.toBe('');
  });
  it('optional', () => {
    const notEmpty = string().optional().test('valid');
    const empty = string().optional().test('');

    expect(notEmpty).toBe('');
    expect(empty).toBe('');
  });
});
