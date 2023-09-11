import {Schema, type Infer} from '../schema/schema.ts';
import {Context} from '../context/context.ts';
import {type ConfigValue} from '../types.ts';
import {DefaultMessageProps, messages} from '../messages.ts';
import {string} from '../string/string.ts';
import {number} from '../number/number.ts';

export type ObjectDsyValue = Record<string, Schema<any>>;

type PreparedTypes<TValue extends ObjectDsyValue> = {
  [K in keyof TValue]: Infer<TValue[K]>;
};

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

const strictName = 'object:strict';
const fieldsName = 'object:fields';

const testObject = (value: any, {path}: DefaultMessageProps) => {
  if (typeof value !== 'object') {
    return messages.object.object({path});
  }
  return '';
};

const createTestObjectStrict = (props: {
  exclude: string[];
  value: ObjectDsyValue;
}) => {
  return (currentValue: Object, {path}: DefaultMessageProps) => {
    const valueKeys = Object.keys(props.value);
    const currentValueKeys = Object.keys(currentValue);

    for (let i = 0; i < valueKeys.length; i++) {
      if (
        valueKeys[i] !== currentValueKeys[i] &&
        !props.exclude.includes(valueKeys[i])
      ) {
        return messages.object.no_property({path: valueKeys[i]});
      }
    }

    if (valueKeys.length - props.exclude.length !== currentValueKeys.length) {
      return messages.object.unknown({path});
    }

    return '';
  };
};

export class ObjectDesy<
  TValue extends ObjectDsyValue,
  TValueTypes = PreparedTypes<TValue>,
> extends Schema<TValueTypes> {
  static new<TValue extends ObjectDsyValue>(config: ConfigValue<TValue>) {
    return new ObjectDesy(config);
  }

  value: TValue;

  constructor(config: ConfigValue<TValue>) {
    super(config);
    this.value = config.value;
    this.context.rules.push({name: 'object:object', test: testObject});
    this.context.rules.push({
      name: 'object:strict',
      test: createTestObjectStrict({
        exclude: [],
        value: config.value,
      }),
    });
    this.context.rules.push({
      name: 'object:fields',
      test: (currentValue, {path}) => {
        for (const key in this.value) {
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
    const strictIdx = this.context.rules.findIndex(
      ({name}) => name === strictName,
    );
    if (strictIdx !== undefined) {
      this.context.rules.splice(strictIdx, 1);
    }

    const fieldsIdx = this.context.rules.findIndex(
      ({name}) => name === fieldsName,
    );
    if (fieldsIdx !== undefined) {
      this.context.rules[fieldsIdx] = {
        name: fieldsName,
        test: (currentValue, {path}) => {
          for (const key in this.value) {
            const schema = this.value[key];

            if (!(key in this.value)) {
              continue;
            }
            const error = schema.validate(currentValue[key], {
              path: path === '' ? key : `${path}.${key}`,
            });
            if (error !== '') {
              return error;
            }
          }
          return '';
        },
      };
    }

    return this as ObjectDesy<TValue, Partial<(typeof this)['types']>>;
  }

  optionalFields<TValueLocal extends keyof TValueTypes & string = any>(
    optionalFields: TValueLocal[],
  ) {
    const strictIdx = this.context.rules.findIndex(
      ({name}) => name === strictName,
    );
    if (strictIdx !== undefined) {
      this.context.rules[strictIdx] = {
        name: 'object:strict',
        test: createTestObjectStrict({
          exclude: optionalFields,
          value: this.value,
        }),
      };
    }
    const fieldsIdx = this.context.rules.findIndex(
      ({name}) => name === fieldsName,
    );
    if (fieldsIdx !== undefined) {
      this.context.rules[fieldsIdx] = {
        name: fieldsName,
        test: (currentValue, {path}) => {
          for (const key in this.value) {
            const schema = this.value[key];

            if (!(key in currentValue) && optionalFields.includes(key as any)) {
              continue;
            }
            const error = schema.validate(currentValue[key], {
              path: path === '' ? key : `${path}.${key}`,
            });
            if (error !== '') {
              return error;
            }
          }
          return '';
        },
      };
    }

    return this as ObjectDesy<
      TValue,
      PartialBy<(typeof this)['types'], TValueLocal>
    >;
  }
}
{
  type User = {
    name: string;
    age: number;
  };
  const exclude: (keyof User)[] = ['name'];

  type User2 = PartialBy<User, (typeof exclude)[number]>;

  type Name = User2['age'];
  type Age = User2['age'];

  // type AAAAA = (typeof a)[number];
}

// class PartialObjectDesy<TValue extends ObjectDsyValue> extends ObjectDesy<
//   Partial<TValue>
// > {
//   constructor(config: ConfigValue<Partial<TValue>>) {
//     super(config);
//   }
// }
// class ObjectDesyPartial<TValue> extends ObjectDesy<TValue> {}

export function object<TValue extends ObjectDsyValue>(value: TValue) {
  return ObjectDesy.new({
    value,
    context: Context.new(),
  });
}

// const user = object({
//   name: string(),
//   age: number(),
// }).notStrict();

const user = object({
  name: string(),
  age: number(),
}).optionalFields(['name']);

type User = Infer<typeof user>;

type Name = User['name'];
type Age = User['age'];

type C = {
  name: string;
  age: number;
};

// type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type C1 = PartialBy<C, 'age' | 'name'>;

type C2 = C1['name'];
type C3 = C1['age'];
