import {Schema} from '../schema/schema.ts';
import {type Context} from '../context/context.ts';
import {type Config} from '../types.ts';
import {messages} from '../messages.ts';

export type ObjectMyValue = Record<string, Schema>;

export class ObjectMy extends Schema {
  static new(config: Config<ObjectMyValue>) {
    return new ObjectMy(config);
  }

  declare context: Context;

  static object(value) {
    if (typeof value !== 'object') {
      return 'Not object';
    }
    return '';
  }

  constructor({value, context}: Config<ObjectMyValue>) {
    super({context});
    context.rules.push({name: 'object:object', test: ObjectMy.object});
    context.rules.push({
      name: 'object:strict',
      test: (currentValue, {path}) => {
        const valueKeys = Object.keys(value);
        const currentValueKeys = Object.keys(currentValue);

        for (let i = 0; i < valueKeys.length; i++) {
          if (valueKeys[i] !== currentValueKeys[i]) {
            return messages.object.no_property({path: valueKeys[i]});
          }
        }

        if (valueKeys.length !== currentValueKeys.length) {
          return messages.object.unknown({path});
        }
        return '';
      },
    });
    context.rules.push({
      name: 'object:fields',
      test: (currentValue) => {
        for (const key in value) {
          const schema = value[key];
          const error = schema.test(currentValue[key], {path: key});
          if (error !== '') {
            return error;
          }
        }
        return '';
      },
    });
  }

  optional() {
    this.context.rules = this.context.rules.filter(
      ({test}) => test !== ObjectMy.object
    );
    return this;
  }
}
