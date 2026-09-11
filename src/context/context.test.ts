import {describe, expect, it} from 'bun:test';
import {type Schema} from '../schema/schema.ts';
import {type TestEntity} from './context.ts';
import {d} from '../desy.ts';

function getRules(schema: Schema<any>): TestEntity[] {
  return (schema as any).context.rules;
}

function getRule(schema: Schema<any>, name: TestEntity['name']) {
  const rule = getRules(schema).find((rule) => rule.name === name);
  if (rule === undefined) {
    throw new Error(`no rule ${name}`);
  }

  return rule;
}

describe('rules meta', () => {
  it('string', () => {
    const variants = ['a', 'b'] as const;
    const regexp = /^a+$/;
    const schema = d
      .string()
      .length(5)
      .min(1)
      .max(10)
      .oneOf(variants)
      .regexp(regexp);

    expect(getRules(schema).map(({name}) => name)).toEqual([
      'string:string',
      'string:required',
      'string:length',
      'string:min',
      'string:max',
      'string:one_of',
      'string:regexp',
    ]);
    expect(getRule(schema, 'string:length').meta).toEqual({length: 5});
    expect(getRule(schema, 'string:min').meta).toEqual({min: 1});
    expect(getRule(schema, 'string:max').meta).toEqual({max: 10});
    expect(getRule(schema, 'string:one_of').meta).toEqual({variants});
    expect(getRule(schema, 'string:regexp').meta).toEqual({regexp});
  });

  it('number', () => {
    const schema = d.number().min(1).max(10).int().float();

    expect(getRules(schema).map(({name}) => name)).toEqual([
      'number:number',
      'number:min',
      'number:max',
      'number:int',
      'number:float',
    ]);
    expect(getRule(schema, 'number:min').meta).toEqual({min: 1});
    expect(getRule(schema, 'number:max').meta).toEqual({max: 10});
  });

  it('boolean', () => {
    const schema = d.boolean().true();

    expect(getRules(schema).map(({name}) => name)).toEqual([
      'boolean:boolean',
      'boolean:true',
    ]);
  });

  it('date', () => {
    const min = '2020-01-01';
    const max = new Date('2021-01-01');
    const schema = d.date().min(min).max(max);

    expect(getRules(schema).map(({name}) => name)).toEqual([
      'date:date',
      'date:min',
      'date:max',
    ]);
    expect(getRule(schema, 'date:min').meta).toEqual({min});
    expect(getRule(schema, 'date:max').meta).toEqual({max});
  });

  it('null', () => {
    expect(getRules(d.null()).map(({name}) => name)).toEqual(['null:null']);
  });

  it('array', () => {
    const items = d.string();
    const schema = d.array(items).min(1).max(10).length(5);

    expect(getRules(schema).map(({name}) => name)).toEqual([
      'array:array',
      'array:items',
      'array:min',
      'array:max',
      'array:length',
    ]);
    expect(getRule(schema, 'array:items').meta).toEqual({items});
    expect(getRule(schema, 'array:min').meta).toEqual({min: 1});
    expect(getRule(schema, 'array:max').meta).toEqual({max: 10});
    expect(getRule(schema, 'array:length').meta).toEqual({length: 5});
  });

  it('object', () => {
    const fields = {name: d.string(), age: d.number()};
    const schema = d.object(fields);

    expect(getRules(schema).map(({name}) => name)).toEqual([
      'object:object',
      'object:fields',
    ]);
    expect(getRule(schema, 'object:fields').meta).toEqual({fields});
  });

  it('object:strict appears after strictObject', () => {
    const fields = {name: d.string(), age: d.number()};
    const schema = d.object(fields).strictObject();

    expect(getRules(schema).map(({name}) => name)).toEqual([
      'object:object',
      'object:strict',
      'object:fields',
    ]);
  });

  it('object:fields keeps meta after notStrict', () => {
    const fields = {name: d.string(), age: d.number()};
    const schema = d.object(fields).strictObject().notStrict();

    expect(getRules(schema).map(({name}) => name)).toEqual([
      'object:object',
      'object:fields',
    ]);
    expect(getRule(schema, 'object:fields').meta).toEqual({fields});
  });

  it('mixed', () => {
    const schemas = [d.string(), d.number()];
    const schema = d.mixed().notVoid().oneOf(schemas);

    expect(getRules(schema).map(({name}) => name)).toEqual([
      'mixed:not_void',
      'mixed:one_of',
    ]);
    expect(getRule(schema, 'mixed:one_of').meta).toEqual({schemas});
  });

  it('custom', () => {
    const schema = d.string().test(() => '');

    expect(getRule(schema, 'custom').meta).toBeUndefined();
  });
});
