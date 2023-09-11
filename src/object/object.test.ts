import {describe, expect, it} from 'bun:test';
import {object} from './object.ts';
import {string} from '../string/string.ts';

describe('object', () => {
  it('object:object', () => {
    const schema = object({});
    const error = schema.validate(undefined);
    expect(error).not.toBe('');
  });
  it('object:strict', () => {
    const schema = object({name: string()});
    const error = schema.validate({
      name: 'aleksey',
      age: 23,
    });
    expect(error).not.toBe('');
  });
  it('object:fields', () => {
    const schema = object({name: string()});
    const error = schema.validate({
      name: 23,
    });
    expect(error).not.toBe('');
  });
  it('notStrict', () => {
    const schema = object({name: string()}).notStrict();
    const valid = schema.validate({
      name: 'aleksey',
      age: 25,
    });
    expect(valid).toBe('');
  });
  it('optionalFields', () => {
    const schema = object({name: string()}).optionalFields(['name']);
    const valid = schema.validate({});
    expect(valid).toBe('');
  });
});
