import {DefaultMessageProps, messages} from '../messages.ts';
import {Schema} from '../schema/schema.ts';
import {Context, type TestConfig} from '../context/context.ts';
import {Config} from '../types.ts';

const testNumber = (value: any, {path}: DefaultMessageProps) => {
  if (typeof value !== 'number' || isFinite(value) === false) {
    return messages.number.number({path});
  }
  return '';
};

function testNumberMin(
  value: number,
  {path, meta: {min}}: TestConfig<{min: number}>,
) {
  if (value < min) {
    return messages.number.min({path, min});
  }
  return '';
}

function testNumberMax(
  value: number,
  {path, meta: {max}}: TestConfig<{max: number}>,
) {
  if (value > max) {
    return messages.number.max({path, max});
  }
  return '';
}

function testNumberOneOf(
  value: number,
  {path, meta: {variants}}: TestConfig<{variants: readonly number[]}>,
) {
  if (!variants.includes(value)) {
    return messages.number.one_of({path, variants: variants as any, value});
  }
  return '';
}

function testNumberInt(value: number, {path}: DefaultMessageProps) {
  if (!Number.isInteger(value)) {
    return messages.number.int({path});
  }
  return '';
}

function testNumberFloat(value: number, {path}: DefaultMessageProps) {
  if (Number.isInteger(value)) {
    return messages.number.float({path});
  }
  return '';
}

export class NumberDesy<TValue extends number = number> extends Schema<TValue> {
  static new<TValue extends number>(config: Config) {
    return new NumberDesy<TValue>(config);
  }

  constructor(config: Config) {
    super(config);
    this.context.rules.push({
      name: 'number:number',
      meta: undefined,
      test: testNumber,
    });
  }

  min(min: number) {
    this.context.rules.push({
      name: 'number:min',
      meta: {min},
      test: testNumberMin,
    });
    return this;
  }

  max(max: number) {
    this.context.rules.push({
      name: 'number:max',
      meta: {max},
      test: testNumberMax,
    });
    return this;
  }

  oneOf<TVariants extends readonly number[]>(variants: TVariants) {
    this.context.rules.push({
      name: 'number:one_of',
      meta: {variants},
      test: testNumberOneOf,
    });

    return this as NumberDesy<TVariants[number]>;
  }

  int() {
    this.context.rules.push({
      name: 'number:int',
      meta: undefined,
      test: testNumberInt,
    });
    return this;
  }

  float() {
    this.context.rules.push({
      name: 'number:float',
      meta: undefined,
      test: testNumberFloat,
    });
    return this;
  }
}

export function number() {
  return NumberDesy.new({context: Context.new()});
}
