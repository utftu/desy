import {Context, Test} from '../context/context.ts';

type Config = {
  context: Context;
};

export type Infer<TType extends Schema<any>> = TType['types'];
type ConfigValidate = {path: string};
const defaultConfigValidate = {path: 'Value'};

export abstract class Schema<TValue> {
  types!: TValue;
  protected context: Context;

  constructor({context}: Config) {
    this.context = context;
  }
  validate(value: any, {path}: ConfigValidate = defaultConfigValidate) {
    if (this.context.allowNull && value === null) return '';
    if (this.context.allowUndefined && value === undefined) return '';
    for (const testEntity of this.context.rules) {
      const error = testEntity.test(value, {path});
      if (error !== '') {
        return error;
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
    this.context.rules.push({name: 'custom', test: cb});
    return this as any as Schema<TValue>;
  }
}
