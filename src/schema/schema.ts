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
    for (const testEntity of this.context.rules) {
      const error = testEntity.test(value, {path});
      if (error !== '') {
        return error;
      }
    }
    return '';
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
