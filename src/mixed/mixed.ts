import {Schema} from '../schema/schema.ts';
import {Context} from '../context/context.ts';
import {StringMy} from '../string/string.ts';
import {type ObjectDsyValue, ObjectDsy} from '../object/object.ts';
import {messages} from '../messages.ts';
import {BooleanDsy} from '../boolean/boolean.ts';
import {type Config} from '../types.ts';
import {NumberDesy} from '../number/number.ts';
import {ArrayDesy} from '../array/array.ts';

export class MixedDesy extends Schema<any> {
  static new(config: Config) {
    return new MixedDesy(config);
  }

  constructor({context}: Config) {
    super({context});
  }

  array<TValue extends Schema<any>>(schema: TValue) {
    return ArrayDesy.new({context: this.context, value: schema});
  }

  number() {
    return NumberDesy.new({context: this.context});
  }

  object<TValue extends ObjectDsyValue>(shape: TValue) {
    return ObjectDsy.new({context: this.context, value: shape});
  }

  boolean() {
    return BooleanDsy.new({context: this.context});
  }

  string() {
    return StringMy.new({context: this.context});
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

  oneOf(schemas: Schema<any>[]) {
    this.context.rules.push({
      name: 'mixed:one_of',
      test: (value, {path}) => {
        let lastError = '';
        for (const schema of schemas) {
          const error = schema.validate(value, {path});
          if (error === '') {
            return '';
          }
          lastError = error;
        }
        return lastError;
      },
    });
    return this;
  }
}

export function mixed() {
  return MixedDesy.new({context: Context.new()});
}
