import {DefaultMessageProps, messages} from '../messages.ts';
import {Schema} from '../schema/schema.ts';
import {Context, type TestConfig} from '../context/context.ts';

type Config = {
  context: Context;
};

function testStringLength(
  value: string,
  {path, meta: {length}}: TestConfig<{length: number}>,
) {
  if (value.length !== length) {
    return messages.string.length({path, length});
  }
  return '';
}

function testStringMin(
  value: string,
  {path, meta: {min}}: TestConfig<{min: number}>,
) {
  if (value.length < min) {
    return messages.string.min({path, min});
  }
  return '';
}

function testStringMax(
  value: string,
  {path, meta: {max}}: TestConfig<{max: number}>,
) {
  if (value.length > max) {
    return messages.string.max({path, max});
  }
  return '';
}

function testStringOneOf(
  value: string,
  {path, meta: {variants}}: TestConfig<{variants: readonly string[]}>,
) {
  if (!variants.includes(value)) {
    return messages.string.one_of({path, variants: variants as any, value});
  }
  return '';
}

function testStringRegexp(
  value: string,
  {path, meta: {regexp}}: TestConfig<{regexp: RegExp}>,
) {
  if (!regexp.test(value)) {
    return messages.string.regexp({path, regexp: regexp.toString()});
  }
  return '';
}

export class StringDesy<TValue extends string> extends Schema<TValue> {
  static new<TValue extends string>(config: Config) {
    return new StringDesy<TValue>(config);
  }

  static string(value: any, {path}: DefaultMessageProps) {
    if (typeof value !== 'string') {
      return messages.string.string({path});
    }
    return '';
  }

  static required(value: string, {path}: DefaultMessageProps) {
    if (value === '') {
      return messages.string.requred({path});
    }
    return '';
  }

  constructor(config: Config) {
    super(config);
    this.context.rules.push({
      name: 'string:string',
      meta: undefined,
      test: StringDesy.string,
    });
    this.context.rules.push({
      name: 'string:required',
      meta: undefined,
      test: StringDesy.required,
    });
  }

  allowEmpty() {
    this.context.allowNull = true;
    this.context.allowUndefined = true;
    this.context.rules = this.context.rules.filter(
      ({test}) => test !== StringDesy.required,
    );
    return this as any as Schema<TValue | null | undefined>;
  }

  length(length: number) {
    this.context.rules.push({
      name: 'string:length',
      meta: {length},
      test: testStringLength,
    });
    return this;
  }

  min(minLength: number) {
    this.context.rules.push({
      name: 'string:min',
      meta: {min: minLength},
      test: testStringMin,
    });
    return this;
  }

  max(maxLength: number) {
    this.context.rules.push({
      name: 'string:max',
      meta: {max: maxLength},
      test: testStringMax,
    });
    return this;
  }

  oneOf<TValue extends readonly string[]>(variants: TValue) {
    this.context.rules.push({
      name: 'string:one_of',
      meta: {variants},
      test: testStringOneOf,
    });

    return this as StringDesy<TValue[number]>;
  }

  regexp(regexp: RegExp) {
    this.context.rules.push({
      name: 'string:regexp',
      meta: {regexp},
      test: testStringRegexp,
    });

    return this;
  }
}

export function string() {
  return StringDesy.new({context: Context.new()});
}
