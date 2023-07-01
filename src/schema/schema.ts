import {type} from 'os';
import {Context} from '../context/context.ts';

type Config = {
  context: Context;
};

export class Schema {
  protected context: Context;

  constructor({context}: Config) {
    this.context = context;
  }
  test(value: any, {path}: {path: string} = {path: 'Value'}) {
    for (const testEntity of this.context.rules) {
      const error = testEntity.test(value, {path});
      if (error !== '') {
        return error;
      }
    }
    return '';
  }
}
