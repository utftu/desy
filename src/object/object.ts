import {Schema, type Infer} from '../schema/schema.ts';
import {Context} from '../context/context.ts';
import {type ConfigValue} from '../types.ts';
import {messages} from '../messages.ts';
import {string} from '../string/string.ts';
import {number} from '../number/number.ts';

export type ObjectDsyValue = Record<string, Schema<any>>;

type PreparedTypes<TValue extends ObjectDsyValue> = {
  [K in keyof TValue]: Infer<TValue[K]>;
};

export class ObjectDesy<TValue extends ObjectDsyValue> extends Schema<
  PreparedTypes<TValue>
> {
  static new<TValue extends ObjectDsyValue>(config: ConfigValue<TValue>) {
    return new ObjectDesy(config);
  }

  static object(value, {path}) {
    if (typeof value !== 'object') {
      return messages.object.object({path});
    }
    return '';
  }

  constructor(config: ConfigValue<TValue>) {
    super(config);
    this.context.rules.push({name: 'object:object', test: ObjectDesy.object});
    this.context.rules.push({
      name: 'object:strict',
      test: (currentValue, {path}) => {
        const valueKeys = Object.keys(config.value);
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
    this.context.rules.push({
      name: 'object:fields',
      test: (currentValue, {path}) => {
        for (const key in config.value) {
          const schema = config.value[key];
          const error = schema.validate(currentValue[key], {
            path: path === '' ? key : `${path}.${key}`,
          });
          if (error !== '') {
            return error;
          }
        }
        return '';
      },
    });
  }

  notStrict() {
    this.context.rules = this.context.rules.filter(
      ({name}) => name !== 'object:strict'
    );
    return this;
  }
}

export function object<TValue extends ObjectDsyValue>(value: TValue) {
  return ObjectDesy.new({
    value,
    context: Context.new(),
  });
}

// const user = object({
//   name: string(),
//   age: number(),
// });

// type User = Infer<typeof user>;
