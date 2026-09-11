import {Schema, type Infer} from '../schema/schema.ts';
import {Context, type TestConfig} from '../context/context.ts';
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

function testObjectStrict(
  currentValue: Object,
  {path, meta: {fields}}: TestConfig<{fields: ObjectDesyValue}>,
) {
  const valueKeys = Object.keys(fields);
  const currentValueKeys = Object.keys(currentValue);

  if (currentValueKeys.length > valueKeys.length) {
    return messages.object.unknown({path});
  }

  for (const key in currentValue) {
    if (!(key in fields)) {
      return messages.object.no_property({path: key});
    }
  }

  return '';
}

function testObjectFields(
  currentValue: any,
  {path, meta: {fields}}: TestConfig<{fields: ObjectDesyValue}>,
) {
  for (const key in fields) {
    const error = fields[key]!.validate(currentValue[key], {
      path: path === '' ? key : `${path}.${key}`,
    });
    if (error !== '') {
      return error;
    }
  }

  return '';
}

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
    this.context.rules.push({
      name: 'object:object',
      test: testObject,
      meta: undefined,
    });
    this.context.rules.push({
      name: 'object:fields',
      meta: {fields: config.value},
      test: testObjectFields,
    });
  }

  strictObject() {
    const strictIdx = this.context.rules.findIndex(
      ({name}) => name === strictName,
    );
    if (strictIdx === -1) {
      this.context.rules.splice(1, 0, {
        name: strictName,
        meta: {fields: this.value},
        test: testObjectStrict,
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
