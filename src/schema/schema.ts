import {Context} from '../context/context.ts';

export class Schema {
  context: Context;
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
