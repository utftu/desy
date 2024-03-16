import {describe, it, expect} from 'bun:test';
import {number} from './number.ts';

describe('number', () => {
  it('number:number', () => {
    expect(number().validate(0)).toBe('');
    expect(number().validate(Infinity)).not.toBe('');
    expect(number().validate(NaN)).not.toBe('');
  });

  it('number:min', () => {
    expect(number().min(5).validate(5)).toBe('');
    expect(number().min(5).validate(4)).not.toBe('');
  });

  it('number:max', () => {
    expect(number().max(5).validate(5)).toBe('');
    expect(number().max(5).validate(6)).not.toBe('');
  });

  it('number:int', () => {
    expect(number().int().validate(5)).toBe('');
    expect(number().int().validate(6.5)).not.toBe('');
  });

  it('number:float', () => {
    expect(number().float().validate(6.5)).toBe('');
    expect(number().float().validate(5)).not.toBe('');
  });
});
