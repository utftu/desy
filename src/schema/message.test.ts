import {describe, expect, it} from 'bun:test';
import {d} from '../desy.ts';

describe('message', () => {
  it('replaces the error of any rule in the chain', () => {
    const schema = d.string().min(3).message('bad name');

    expect(schema.validate('hello')).toBe('');
    expect(schema.validate('a')).toBe('bad name');
    expect(schema.validate(42)).toBe('bad name');
  });

  it('takes a function with the path', () => {
    const schema = d.object({
      name: d.string().message(({path}) => `${path} is wrong`),
    });

    expect(schema.validate({name: ''})).toBe('Value.name is wrong');
  });

  it('belongs to the schema it is written on', () => {
    const schema = d.object({name: d.string().message('bad name')});

    expect(schema.validate({name: 42})).toBe('bad name');
  });

  it('on a parent replaces what came from below', () => {
    const schema = d
      .object({name: d.string().message('bad name')})
      .message('bad person');

    expect(schema.validate({name: 42})).toBe('bad person');
  });

  it('keeps the original error when not set', () => {
    expect(d.string().validate(42)).toBe('Value must be string');
  });
});
