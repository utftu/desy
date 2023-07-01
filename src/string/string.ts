import {messages} from '../messages.ts';
import {Schema} from '../schema/schema.ts';
import {Context} from '../context/context.ts';

type infer<TSchema extends StringMy> = TSchema['types'];

function infer(cls) {
  return;
}

type Config = {
  context: Context;
};

export class StringMy extends Schema {
  types: string;

  static new(config: Config) {
    return new StringMy(config);
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

  declare context: Context;

  constructor({context}: {context: Context}) {
    super({context});
    context.rules.push({name: 'string:string', test: StringMy.string});
    context.rules.push({name: 'string:required', test: StringMy.required});
  }

  optional() {
    this.context.rules = this.context.rules.filter(
      ({test}) => test !== StringMy.required
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
}

export function string() {
  return StringMy.new({context: Context.new()});
}
