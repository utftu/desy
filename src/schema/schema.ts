import {Context, Test} from '../context/context.ts';

type Config = {
  context: Context;
};

export type Infer<TType extends Schema<any>> = TType['types'];

export abstract class Schema<TValue> {
  types: TValue;
  protected context: Context;

  constructor({context}: Config) {
    this.context = context;
  }
  validate(value: any, {path}: {path: string} = {path: 'Value'}) {
    for (const testEntity of this.context.rules) {
      const error = testEntity.test(value, {path});
      if (error !== '') {
        return error;
      }
    }
    return '';
  }

  // async validateAsync(value: any, {path}: {path: string} = {path: 'Value'}) {
  //   for (const testEntity of this.context.rules) {
  //     const error = await testEntity.test(value, {path});
  //     if (error !== '') {
  //       return error;
  //     }
  //   }
  //   return '';
  // }

  test(cb: Test) {
    this.context.rules.push({name: 'custom', test: cb});
    return this;
  }
}
