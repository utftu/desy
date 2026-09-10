import {describe, expect, it} from 'bun:test';
import {object} from './object.ts';
import {string} from '../string/string.ts';
import {messages} from '../messages.ts';
import {number} from '../number/number.ts';
import {Infer} from '../schema/schema.ts';

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
  it('notStrict: missing fields', () => {
    const schema = object({name: string(), age: number()}).notStrict();

    expect(schema.validate({})).toBe('');
    expect(schema.validate({name: 'aleksey'})).toBe('');
    expect(schema.validate({name: 42})).not.toBe('');
  });
  it('notStrict: twice keeps fields rule', () => {
    const schema = object({name: string()}).notStrict().notStrict();

    expect(schema.validate({name: 42})).not.toBe('');
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
    const schema = object({name: string()});
    const error = schema.validate({
      fullName: 'Smith',
      name: 'John',
    });
    expect(error).toBe(messages.object.unknown({path: 'Value'}));
  });
  it('number', () => {
    const schema = object({age: number()});

    type A = Infer<typeof schema>;
  });
});
