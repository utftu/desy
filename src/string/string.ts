import {messages} from '../messages.ts';
import {Schema} from '../schema/schema.ts';
import {Context} from '../context/context.ts';

type Config = {
  context: Context;
};

export class StringDesy<TValue extends string> extends Schema<TValue> {
  static new<TValue extends string>(config: Config) {
    return new StringDesy<TValue>(config);
  }

  static string(value, {path}) {
    if (typeof value !== 'string') {
      return messages.string.string({path});
    }
    return '';
  }

  static required(value, {path}) {
    if (value === '') {
      return messages.string.requred({path});
    }
    return '';
  }

  constructor(config: Config) {
    super(config);
    this.context.rules.push({name: 'string:string', test: StringDesy.string});
    this.context.rules.push({
      name: 'string:required',
      test: StringDesy.required,
    });
  }

  optional() {
    this.context.rules = this.context.rules.filter(
      ({test}) => test !== StringDesy.required
    );
    return this;
  }

  length(length: number) {
    this.context.rules.push({
      name: 'string:length',
      test: (value, {path}) => {
        if (value.length !== length) {
          return messages.string.length({path, length});
        }
        return '';
      },
    });
    return this;
  }

  min(minLength: number) {
    this.context.rules.push({
      name: 'string:min',
      test: (value, {path}) => {
        if (value.length < minLength) {
          return messages.string.min({path, min: minLength});
        }
        return '';
      },
    });
    return this;
  }

  max(maxLength: number) {
    this.context.rules.push({
      name: 'string:max',
      test: (value, {path}) => {
        if (value.length > maxLength) {
          return messages.string.max({path, max: maxLength});
        }
        return '';
      },
    });
    return this;
  }

  oneOf<TValue extends readonly string[]>(variants: TValue) {
    this.context.rules.push({
      name: 'string:one_of',
      test: (value: string, {path}) => {
        if (!variants.includes(value)) {
          return messages.string.one_of({path, variants, value});
        }
        return '';
      },
    });

    return this as StringDesy<TValue[number]>;
  }
}

export function string() {
  return StringDesy.new({context: Context.new()});
}
