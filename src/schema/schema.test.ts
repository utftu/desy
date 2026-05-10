import {describe, expect, it} from 'bun:test';
import {Schema} from './schema';
import {Context} from '../context/context';
import {string} from '../string/string';
import {number} from '../number/number';

describe('schema', () => {
  it('test()', () => {
    // @ts-ignore
    let schema = new Schema({context: Context.new()});
    schema = schema.test((value: any) => {
      if (value !== 'hello') {
        return 'error';
      }
      return '';
    });
    expect(schema.validate('hello')).toBe('');
    expect(schema.validate('world')).not.toBe('');
  });

  describe('optional()', () => {
    it('null passes', () => {
      expect(string().optional().validate(null)).toBe('');
    });

    it('undefined passes', () => {
      expect(string().optional().validate(undefined)).toBe('');
    });

    it('valid value still validated', () => {
      expect(string().optional().validate('hello')).toBe('');
      expect(string().optional().validate(123)).not.toBe('');
    });
  });

  describe('nullable()', () => {
    it('null passes', () => {
      expect(string().nullable().validate(null)).toBe('');
    });

    it('undefined does not pass', () => {
      expect(string().nullable().validate(undefined)).not.toBe('');
    });

    it('valid value still validated', () => {
      expect(string().nullable().validate('hello')).toBe('');
      expect(string().nullable().validate(123)).not.toBe('');
    });

    it('null passes for number', () => {
      expect(number().nullable().validate(null)).toBe('');
      expect(number().nullable().validate(undefined)).not.toBe('');
    });

    it('without nullable — null fails', () => {
      expect(string().validate(null)).not.toBe('');
    });
  });
});
