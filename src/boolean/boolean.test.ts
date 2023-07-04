import {describe, it, expect} from 'bun:test';
import {boolean} from './boolean.ts';

describe.only('boolean', () => {
  it('boolean:boolean', () => {
    expect(boolean().validate(true)).toBe('');
    expect(boolean().validate(false)).toBe('');
    expect(boolean().validate(undefined)).not.toBe('');
  });

  it('boolean:false', () => {
    expect(boolean().false().validate(true)).not.toBe('');
    expect(boolean().false().validate(false)).toBe('');
  });

  it('boolean:true', () => {
    expect(boolean().true().validate(true)).toBe('');
    expect(boolean().true().validate(false)).not.toBe('');
  });
});
