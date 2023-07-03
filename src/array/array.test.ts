import {describe, expect, it} from 'bun:test';
import {array} from './array.ts';
import {string} from '../string/string.ts';
describe('array', () => {
  it('array:array', () => {
    const schema = array(string());
    const error = schema.validate(undefined);
    const valid = schema.validate([]);
    expect(error).not.toBe('');
    expect(valid).toBe('');
  });

  it('array:items', () => {
    const schema = array(string());
    const valid = schema.validate(['hello']);
    // @ts-ignore
    const error = schema.validate([25]);
    expect(error).not.toBe('');
    expect(valid).toBe('');
  });

  it('array:min', () => {
    const schema = array(string()).min(1);
    const valid = schema.validate(['hello']);
    const error = schema.validate([]);
    expect(error).not.toBe('');
    expect(valid).toBe('');
  });

  it('array:max', () => {
    const schema = array(string()).max(1);
    const valid = schema.validate(['hello']);
    const error = schema.validate(['hello', 'world']);
    expect(error).not.toBe('');
    expect(valid).toBe('');
  });

  it('array:length', () => {
    const schema = array(string()).length(1);
    const valid = schema.validate(['hello']);
    const error = schema.validate(['hello', 'world']);
    expect(error).not.toBe('');
    expect(valid).toBe('');
  });
});
