import {describe, expect, it} from 'bun:test';
import {d} from '../desy.ts';
import {createJsonSchema} from './json-schema.ts';

const draft = 'https://json-schema.org/draft/2020-12/schema';

describe('createJsonSchema', () => {
  it('string', () => {
    expect(createJsonSchema(d.string())).toEqual({
      $schema: draft,
      type: 'string',
      minLength: 1,
    });
  });

  it('string constraints', () => {
    const schema = d.string().min(2).max(10).regexp(/^a+$/);

    expect(createJsonSchema(schema)).toEqual({
      $schema: draft,
      type: 'string',
      minLength: 2,
      maxLength: 10,
      pattern: '^a+$',
    });
  });

  it('string oneOf', () => {
    expect(createJsonSchema(d.string().oneOf(['a', 'b']))).toEqual({
      $schema: draft,
      type: 'string',
      minLength: 1,
      enum: ['a', 'b'],
    });
  });

  it('number', () => {
    expect(createJsonSchema(d.number().int().min(1).max(5))).toEqual({
      $schema: draft,
      type: 'integer',
      minimum: 1,
      maximum: 5,
    });
  });

  it('boolean', () => {
    expect(createJsonSchema(d.boolean().true())).toEqual({
      $schema: draft,
      type: 'boolean',
      const: true,
    });
  });

  it('null', () => {
    expect(createJsonSchema(d.null())).toEqual({
      $schema: draft,
      type: 'null',
    });
  });

  it('date', () => {
    expect(createJsonSchema(d.date())).toEqual({
      $schema: draft,
      type: 'string',
      format: 'date-time',
    });
  });

  it('array', () => {
    const schema = d.array(d.number()).min(1).max(3);

    expect(createJsonSchema(schema)).toEqual({
      $schema: draft,
      type: 'array',
      items: {type: 'number'},
      minItems: 1,
      maxItems: 3,
    });
  });

  it('object', () => {
    const schema = d.object({name: d.string(), age: d.number()});

    expect(createJsonSchema(schema)).toEqual({
      $schema: draft,
      type: 'object',
      additionalProperties: false,
      properties: {
        name: {type: 'string', minLength: 1},
        age: {type: 'number'},
      },
      required: ['name', 'age'],
    });
  });

  it('additionalProperties stays false without strictObject', () => {
    expect(
      createJsonSchema(d.object({name: d.string()})).additionalProperties,
    ).toBe(false);
    expect(
      createJsonSchema(d.object({name: d.string()}).strictObject())
        .additionalProperties,
    ).toBe(false);
    expect(
      createJsonSchema(d.object({name: d.string()}).notStrict())
        .additionalProperties,
    ).toBe(false);
  });

  it('undefinable field leaves required', () => {
    const schema = d.object({name: d.string(), age: d.number().undefinable()});

    expect(createJsonSchema(schema).required).toEqual(['name']);
  });

  it('nullable', () => {
    expect(createJsonSchema(d.string().nullable())).toEqual({
      $schema: draft,
      type: ['string', 'null'],
      minLength: 1,
    });
  });

  it('nested', () => {
    const schema = d.object({
      tags: d.array(d.string()),
      address: d.object({city: d.string()}),
    });

    expect(createJsonSchema(schema)).toEqual({
      $schema: draft,
      type: 'object',
      additionalProperties: false,
      properties: {
        tags: {type: 'array', items: {type: 'string', minLength: 1}},
        address: {
          type: 'object',
          additionalProperties: false,
          properties: {city: {type: 'string', minLength: 1}},
          required: ['city'],
        },
      },
      required: ['tags', 'address'],
    });
  });

  it('mixed oneOf', () => {
    const schema = d.mixed().oneOf([d.string(), d.number()]);

    expect(createJsonSchema(schema)).toEqual({
      $schema: draft,
      anyOf: [{type: 'string', minLength: 1}, {type: 'number'}],
    });
  });

  it('narrows repeated bounds', () => {
    expect(createJsonSchema(d.string().min(0)).minLength).toBe(1);
    expect(createJsonSchema(d.string().min(2).min(5)).minLength).toBe(5);
    expect(createJsonSchema(d.string().max(5).max(2)).maxLength).toBe(2);
    expect(createJsonSchema(d.number().min(1).min(3)).minimum).toBe(3);
    expect(createJsonSchema(d.number().max(1).max(3)).maximum).toBe(1);

    const items = d.array(d.string()).max(3).max(1).min(2).min(1);
    expect(createJsonSchema(items).maxItems).toBe(1);
    expect(createJsonSchema(items).minItems).toBe(2);
  });

  it('intersects repeated oneOf', () => {
    const schema = d.string().oneOf(['a', 'b']).oneOf(['b', 'c']);

    expect(createJsonSchema(schema).enum).toEqual(['b']);
  });

  it('throws on a second regexp', () => {
    expect(() =>
      createJsonSchema(d.string().regexp(/^a/).regexp(/b$/)),
    ).toThrow('only one string:regexp converts');
    expect(createJsonSchema(d.string().regexp(/^a/)).pattern).toBe('^a');
  });

  it('throws on contradicting const', () => {
    expect(() => createJsonSchema(d.boolean().true().false())).toThrow(
      'only one of boolean:true and boolean:false converts',
    );
    expect(createJsonSchema(d.boolean().true()).const).toBe(true);
  });

  it('throws on rules without mapping', () => {
    expect(() => createJsonSchema(d.string().test(() => ''))).toThrow(
      'custom has no JSON Schema mapping',
    );
    expect(() => createJsonSchema(d.number().float())).toThrow(
      'number:float has no JSON Schema mapping',
    );
    expect(() => createJsonSchema(d.date().min('2020-01-01'))).toThrow(
      'date:min has no JSON Schema mapping',
    );
    expect(() => createJsonSchema(d.date().max('2020-01-01'))).toThrow(
      'date:max has no JSON Schema mapping',
    );
  });

  it('description', () => {
    const schema = d
      .object({name: d.string().description('Полное имя')})
      .description('Человек');
    const jsonSchema = createJsonSchema(schema);

    expect(jsonSchema.description).toBe('Человек');
    expect(jsonSchema.properties!.name!.description).toBe('Полное имя');
  });

  it('throws on notVoid', () => {
    expect(() => createJsonSchema(d.mixed().notVoid())).toThrow(
      'mixed:not_void has no JSON Schema mapping',
    );
  });
});
