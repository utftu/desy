import {Context, type TestConfig} from '../context/context.ts';
import {DefaultMessageProps, messages} from '../messages.ts';
import {Infer, Schema} from '../schema/schema.ts';
import {ConfigValue} from '../types.ts';

const testArray = (currentValue: any, {path}: DefaultMessageProps) => {
  if (!Array.isArray(currentValue)) {
    return messages.array.array({path});
  }
  return '';
};

function testArrayItems(
  items: any[],
  {path, meta}: TestConfig<{items: Schema<any>}>,
) {
  for (let i = 0; i < items.length; i++) {
    const error = meta.items.validate(items[i], {
      path: path === '' ? i.toString() : `${path}[].${i}`,
    });
    if (error !== '') {
      return error;
    }
  }

  return '';
}

function testArrayMin(
  value: any[],
  {path, meta: {min}}: TestConfig<{min: number}>,
) {
  if (value.length < min) {
    return messages.array.min({path, min});
  }
  return '';
}

function testArrayMax(
  value: any[],
  {path, meta: {max}}: TestConfig<{max: number}>,
) {
  if (value.length > max) {
    return messages.array.max({path, max});
  }
  return '';
}

function testArrayLength(
  value: any[],
  {path, meta: {length}}: TestConfig<{length: number}>,
) {
  if (value.length !== length) {
    return messages.array.length({path, length});
  }
  return '';
}

export class ArrayDesy<TSchema extends Schema<any>> extends Schema<
  Infer<TSchema>[]
> {
  static new<TSchema extends Schema<any>>(config: ConfigValue<TSchema>) {
    return new ArrayDesy(config);
  }

  constructor(config: ConfigValue<TSchema>) {
    super(config);

    this.context.rules.push({
      name: 'array:array',
      meta: undefined,
      test: testArray,
    });

    this.context.rules.push({
      name: 'array:items',
      meta: {items: config.value},
      test: testArrayItems,
    });
  }

  min(minLength: number) {
    this.context.rules.push({
      name: 'array:min',
      meta: {min: minLength},
      test: testArrayMin,
    });
    return this;
  }

  max(maxLength: number) {
    this.context.rules.push({
      name: 'array:max',
      meta: {max: maxLength},
      test: testArrayMax,
    });
    return this;
  }

  length(length: number) {
    this.context.rules.push({
      name: 'array:length',
      meta: {length},
      test: testArrayLength,
    });
    return this;
  }
}

export function array<TValue extends Schema<any>>(schema: TValue) {
  return new ArrayDesy({value: schema, context: Context.new()});
}
