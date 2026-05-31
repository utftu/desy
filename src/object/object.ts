import {Schema, type Infer} from '../schema/schema.ts';
import {Context} from '../context/context.ts';
import {type ConfigValue} from '../types.ts';
import {DefaultMessageProps, messages} from '../messages.ts';
export type ObjectDesyValue = Record<string, Schema<any>>;

type Expand<T> = T extends object ? {[K in keyof T]: T[K]} : T;

type PreparedTypes<TValue extends ObjectDesyValue> = Expand<
  {
    [K in keyof TValue as undefined extends Infer<TValue[K]>
      ? never
      : K]: Infer<TValue[K]>;
  } & {
    [K in keyof TValue as undefined extends Infer<TValue[K]>
      ? K
      : never]?: Infer<TValue[K]>;
  }
>;

const strictName = 'object:strict';

const testObject = (value: any, {path}: DefaultMessageProps) => {
  if (!value || typeof value !== 'object') {
    return messages.object.object({path});
  }
  return '';
};

const createTestObjectStrict = ({
  value: schemaValue,
}: {
  value: ObjectDesyValue;
}) => {
  return (currentValue: Object, {path}: DefaultMessageProps) => {
    const valueKeys = Object.keys(schemaValue);
    const currentValueKeys = Object.keys(currentValue);

    if (currentValueKeys.length > valueKeys.length) {
      return messages.object.unknown({path});
    }

    for (const key in currentValue) {
      if (!(key in schemaValue)) {
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

  strictObject() {
    const strictIdx = this.context.rules.findIndex(
      ({name}) => name === strictName,
    );
    if (strictIdx === -1) {
      this.context.rules.splice(1, 0, {
        name: strictName,
        test: createTestObjectStrict({value: this.value}),
      });
    }
    return this;
  }

  notStrict() {
    const strictIdx = this.context.rules.findIndex(
      ({name}) => name === strictName,
    );
    if (strictIdx !== -1) {
      this.context.rules.splice(strictIdx, 1);
    }
    return this;
  }
}

export function object<TValue extends ObjectDesyValue>(value: TValue) {
  return ObjectDesy.new({value, context: Context.new()});
}
