import {Context, Test, type Message} from '../context/context.ts';

type Config = {
  context: Context;
};

export type Infer<TType extends Schema<any>> = TType['types'];
type ConfigValidate = {path: string};
type CreateErrorConfig = {error: string; path: string};
const defaultConfigValidate = {path: 'Value'};

function createError(context: Context, {error, path}: CreateErrorConfig) {
  if (context.message === undefined) {
    return error;
  }

  if (typeof context.message === 'string') {
    return context.message;
  }

  return context.message({path});
}

export abstract class Schema<TValue> {
  types!: TValue;
  protected context: Context;

  constructor({context}: Config) {
    this.context = context;
  }
  getContext() {
    return this.context;
  }

  description(description: string) {
    this.context.description = description;
    return this;
  }

  message(message: Message) {
    this.context.message = message;
    return this;
  }

  validate(value: any, {path}: ConfigValidate = defaultConfigValidate) {
    if (this.context.allowNull && value === null) return '';
    if (this.context.allowUndefined && value === undefined) return '';
    for (const testEntity of this.context.rules) {
      const test = testEntity.test as Test<any>;
      const error = test(value, {path, meta: testEntity.meta});
      if (error !== '') {
        return createError(this.context, {error, path});
      }
    }
    return '';
  }

  nullable() {
    this.context.allowNull = true;
    return this as any as Schema<TValue | null>;
  }

  undefinable() {
    this.context.allowUndefined = true;
    return this as any as Schema<TValue | undefined>;
  }

  optional() {
    this.context.allowNull = true;
    this.context.allowUndefined = true;
    return this as any as Schema<TValue | null | undefined>;
  }

  validateObj(
    value: any,
    config: ConfigValidate = defaultConfigValidate,
  ): Infer<typeof this> | string {
    const validateError = this.validate(value, config);

    if (validateError !== '') {
      return validateError;
    }

    return value;
  }

  test<TValue extends (typeof this)['types']>(cb: Test) {
    this.context.rules.push({name: 'custom', meta: undefined, test: cb});
    return this as any as Schema<TValue>;
  }
}
