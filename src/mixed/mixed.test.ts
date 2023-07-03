import {describe, expect, it} from 'bun:test';
import {mixed} from './mixed.ts';
import {boolean} from '../boolean/boolean.ts';
import {number} from '../number/number.ts';

describe('mixed', () => {
  it('mixed', () => {
    const result = mixed().validate(undefined);
    expect(result).toBe('');
  });
  it('mixed:not_void', () => {
    const validResult = mixed().notVoid().validate('');
    const notValidResult = mixed().notVoid().validate(undefined);
    expect(validResult).toBe('');
    expect(notValidResult).not.toBe('');
  });
  it('mixed:one_of', () => {
    const schema = mixed().oneOf([boolean(), number()]);
    expect(schema.validate('hello')).not.toBe('');
    expect(schema.validate(true)).toBe('');
    expect(schema.validate(24)).toBe('');
  });
});
