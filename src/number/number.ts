import {DefaultMessageProps, messages} from '../messages.ts';
import {Schema} from '../schema/schema.ts';
import {Context} from '../context/context.ts';
import {Config} from '../types.ts';

const testNumber = (value: any, {path}: DefaultMessageProps) => {
  if (typeof value !== 'number') {
    return messages.number.number({path});
  }
  return '';
};

export class NumberDesy extends Schema<number> {
  static new(config: Config) {
    return new NumberDesy(config);
  }

  constructor(config: Config) {
    super(config);
    this.context.rules.push({name: 'number:number', test: testNumber});
  }

  min(min: number) {
    this.context.rules.push({
      name: 'number:min',
      test: (value, {path}) => {
        if (value < min) {
          return messages.number.min({path, min});
        }
        return '';
      },
    });
    return this;
  }

  max(max: number) {
    this.context.rules.push({
      name: 'number:max',
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
      name: 'number:int',
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
      name: 'number:float',
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
