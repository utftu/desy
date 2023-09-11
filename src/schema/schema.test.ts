import {describe, expect, it} from 'bun:test';
import {Schema} from './schema';
import {Context} from '../context/context';

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
});
