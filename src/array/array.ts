import {Context} from '../context/context.ts';
import {messages} from '../messages.ts';
import {Infer, Schema} from '../schema/schema.ts';
import {ConfigValue} from '../types.ts';

export class ArrayDesy<TSchema extends Schema<any>> extends Schema<
  Infer<TSchema>[]
> {
  static new<TSchema extends Schema<any>>(config: ConfigValue<TSchema>) {
    return new ArrayDesy(config);
  }

  constructor(config: ConfigValue<TSchema>) {
    super(config);

    this.context.rules.push({
      name: 'array:array',
      test: (currentValue, {path}) => {
        if (!Array.isArray(currentValue)) {
          return messages.array.array({path});
        }
        return '';
      },
    });

    this.context.rules.push({
      name: 'array:items',
      test: (items, {path}) => {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];

          const error = config.value.validate(item, {
            path: path === '' ? i.toString() : `${path}[].${i}`,
          });
          if (error !== '') {
            return error;
          }
        }

        return '';
      },
    });
  }

  min(minLength: number) {
    this.context.rules.push({
      name: 'array:min',
      test: (value, {path}) => {
        if (value.length < minLength) {
          return messages.array.min({path, min: minLength});
        }
        return '';
      },
    });
    return this;
  }

  max(maxLength: number) {
    this.context.rules.push({
      name: 'array:max',
      test: (value, {path}) => {
        if (value.length > maxLength) {
          return messages.array.max({path, max: maxLength});
        }
        return '';
      },
    });
    return this;
  }

  length(length: number) {
    this.context.rules.push({
      name: 'array:length',
      test: (value, {path}) => {
        if (value.length !== length) {
          return messages.array.length({path, length});
        }
        return '';
      },
    });
    return this;
  }
}

export function array<TValue extends Schema<any>>(schema: TValue) {
  return new ArrayDesy({value: schema, context: Context.new()});
}
