import {describe, it, expect} from 'bun:test';
import {number} from './number.ts';

describe('number', () => {
  it('number:number', () => {
    expect(number().test(0)).toBe('');
  });

  it('number:min', () => {
    expect(number().min(5).test(5)).toBe('');
    expect(number().min(5).test(4)).not.toBe('');
  });

  it('number:max', () => {
    expect(number().max(5).test(5)).toBe('');
    expect(number().max(5).test(6)).not.toBe('');
  });
});
