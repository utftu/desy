import {describe, expect, it} from 'bun:test';
import {object} from './object.ts';
import {string} from '../string/string.ts';
import {messages} from '../messages.ts';
import {number} from '../number/number.ts';
import {array} from '../array/array.ts';

describe('object', () => {
  it('object:object', () => {
    const schema = object({});
    const error = schema.validate(undefined);
    expect(error).not.toBe('');
  });
  it('object:strict', () => {
    const schema = object({name: string()}).strictObject();
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
  it('optionalFields exist', () => {
    const schema = object({name: string()}).optionalFields(['name']);
    const valid = schema.validate({name: 'hello'});
    expect(valid).toBe('');
  });
  it('unknown', () => {
    const schema = object({name: string()}).strictObject();
    const error = schema.validate({
      fullName: 'Smith',
      name: 'John',
    });
    expect(error).toBe(messages.object.unknown({path: 'Value'}));
  });

  it('object:optional — missing key passes', () => {
    const obj = object({
      name: string().optional(),
      age: number(),
    });
    expect(obj.validate({age: 18})).toBe('');
  });

  it('object:optional — null passes', () => {
    const obj = object({
      name: string().optional(),
      age: number(),
    });
    expect(obj.validate({name: null, age: 18})).toBe('');
  });

  it('object:optional — required field still required', () => {
    const obj = object({
      name: string().optional(),
      age: number(),
    });
    expect(obj.validate({name: 'hello'})).not.toBe('');
  });

  describe('nullable field', () => {
    it('null is valid', () => {
      const schema = object({name: string().nullable()});
      expect(schema.validate({name: null})).toBe('');
    });

    it('undefined is not valid', () => {
      const schema = object({name: string().nullable()});
      expect(schema.validate({name: undefined})).not.toBe('');
    });

    it('missing key is not valid', () => {
      const schema = object({name: string().nullable()});
      expect(schema.validate({})).not.toBe('');
    });

    it('valid string still passes', () => {
      const schema = object({name: string().nullable()});
      expect(schema.validate({name: 'alice'})).toBe('');
    });

    it('null fails without nullable', () => {
      const schema = object({name: string()});
      expect(schema.validate({name: null})).not.toBe('');
    });

    it('multiple fields — only nullable accepts null', () => {
      const schema = object({
        name: string().nullable(),
        age: number(),
      });
      expect(schema.validate({name: null, age: 25})).toBe('');
      expect(schema.validate({name: 'alice', age: null})).not.toBe('');
    });

    it('nested object with nullable field', () => {
      const schema = object({
        user: object({name: string().nullable()}),
      });
      expect(schema.validate({user: {name: null}})).toBe('');
      expect(schema.validate({user: {name: undefined}})).not.toBe('');
    });

    it('null passes for array field', () => {
      const obj = object({
        tags: array(string()).optional(),
        age: number(),
      });
      expect(obj.validate({tags: null, age: 18})).toBe('');
    });
  });
});
