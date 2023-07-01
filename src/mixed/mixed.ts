import {Schema} from '../schema/schema.ts';
import {Context} from '../context/context.ts';
import {StringMy} from '../string/string.ts';
import {type ObjectMyValue, ObjectMy} from '../object/object.ts';
import {messages} from '../messages.ts';
import {BooleanMy} from '../boolean/boolean.ts';

type Config = {
  context: Context;
};

export class Mixed extends Schema {
  static new(config: Config) {
    return new Mixed(config);
  }

  constructor({context}: Config) {
    super({context});
  }

  notVoid() {
    this.context.rules.push({
      name: 'mixed:not_void',
      test: (value, {path}) => {
        if (value === undefined || value === null) {
          return messages.mixed.not_void({path});
        }
        return '';
      },
    });
    return this;
  }

  object(shape: ObjectMyValue) {
    const onject = ObjectMy.new({context: this.context, value: shape});
    return onject;
  }

  boolean() {
    return BooleanMy.new({context: this.context});
  }

  string() {
    return new StringMy({context: this.context});
  }
}

export function mixed() {
  return Mixed.new({context: Context.new()});
}
