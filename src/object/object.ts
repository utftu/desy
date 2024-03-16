import {Schema, type Infer} from '../schema/schema.ts';
import {Context} from '../context/context.ts';
import {type ConfigValue} from '../types.ts';
import {DefaultMessageProps, messages} from '../messages.ts';
export type ObjectDesyValue = Record<string, Schema<any>>;

type PreparedTypes<TValue extends ObjectDesyValue> = {
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
  value: ObjectDesyValue;
}) => {
  return (currentValue: Object, {path}: DefaultMessageProps) => {
    const valueKeys = Object.keys(props.value);
    const currentValueKeys = Object.keys(currentValue);

    if (valueKeys.length - props.exclude.length !== currentValueKeys.length) {
      return messages.object.unknown({path});
    }

    for (const key in currentValue) {
      if (!(key in props.value) && !props.exclude.includes(key)) {
        return messages.object.no_property({path: key});
      }
    }

    return '';
  };
};

export class ObjectDesy<
  TValue extends ObjectDesyValue,
  TValueTypes = PreparedTypes<TValue>,
> extends Schema<TValueTypes> {
  static new<TValue extends ObjectDesyValue>(config: ConfigValue<TValue>) {
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

export function object<TValue extends ObjectDesyValue>(value: TValue) {
  return ObjectDesy.new({
    value,
    context: Context.new(),
  });
}
