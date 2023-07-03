import {describe, expect, it} from 'bun:test';
import {string} from './string.ts';

describe.only('string', () => {
  it('string:string', () => {
    const schema = string();

    expect(schema.validate('valid')).toBe('');
    expect(schema.validate(undefined)).not.toBe('');
  });
  it('string:required', () => {
    const schema = string();

    expect(schema.validate('hello')).toBe('');
    expect(schema.validate('')).not.toBe('');
  });
  it('optional', () => {
    const schema = string().optional();

    expect(schema.validate('')).toBe('');
  });

  it('string:min', () => {
    const schema = string().min(1);

    expect(schema.validate('')).not.toBe('');
    expect(schema.validate('h')).toBe('');
  });

  it('string:min', () => {
    const schema = string().max(1);

    expect(schema.validate('he')).not.toBe('');
    expect(schema.validate('h')).toBe('');
  });

  it('string:length', () => {
    const schema = string().length(1);

    expect(schema.validate('he')).not.toBe('');
    expect(schema.validate('h')).toBe('');
  });
});
