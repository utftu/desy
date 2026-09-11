import {describe, expect, it} from 'bun:test';
import {d, createJsonSchema, type InferDesy} from '../desy.ts';

describe('number:one_of', () => {
  it('validates', () => {
    const schema = d.number().oneOf([1, 2, 3]);

    expect(schema.validate(2)).toBe('');
    expect(schema.validate(4)).not.toBe('');
    expect(schema.validate('2')).not.toBe('');
  });

  it('narrows the type', () => {
    const schema = d.number().oneOf([1, 2, 3] as const);
    const value: InferDesy<typeof schema> = 2;

    expect(value).toBe(2);
  });

  it('becomes enum', () => {
    const schema = d.number().int().oneOf([1, 2, 3]);

    expect(createJsonSchema(schema)).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'integer',
      enum: [1, 2, 3],
    });
  });
});
