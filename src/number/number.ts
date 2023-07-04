import {messages} from '../messages.ts';
import {Schema} from '../schema/schema.ts';
import {Context} from '../context/context.ts';
import {Config} from '../types.ts';

export class NumberDesy extends Schema<number> {
  static new(config: Config) {
    return new NumberDesy(config);
  }

  static number(value, {path}) {
    if (typeof value !== 'number') {
      return messages.number.number({path});
    }
    return '';
  }

  constructor(config: Config) {
    super(config);
    this.context.rules.push({name: 'number:number', test: NumberDesy.number});
  }

  min(min) {
    this.context.rules.push({
      name: 'string:min',
      test: (value, {path}) => {
        if (value < min) {
          return messages.number.min({path, min});
        }
        return '';
      },
    });
    return this;
  }

  max(max) {
    this.context.rules.push({
      name: 'string:max',
      test: (value, {path}) => {
        if (value > max) {
          return messages.number.max({path, max});
        }
        return '';
      },
    });
    return this;
  }

  int() {
    this.context.rules.push({
      name: 'string:int',
      test: (value, {path}) => {
        if (!Number.isInteger(value)) {
          return messages.number.int({path});
        }
        return '';
      },
    });
    return this;
  }

  float() {
    this.context.rules.push({
      name: 'string:float',
      test: (value, {path}) => {
        if (Number.isInteger(value)) {
          return messages.number.float({path});
        }
        return '';
      },
    });
    return this;
  }
}

export function number() {
  return NumberDesy.new({context: Context.new()});
}
