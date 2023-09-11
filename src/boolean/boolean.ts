import {DefaultMessageProps, messages} from '../messages.ts';
import {Schema} from '../schema/schema.ts';
import {Context} from '../context/context.ts';
import {type Config} from '../types.ts';

export class BooleanDesy<
  TValue extends boolean = boolean,
> extends Schema<TValue> {
  static new<TValue extends boolean>(config: Config) {
    return new BooleanDesy<TValue>(config);
  }

  static boolean(value: any, {path}: DefaultMessageProps) {
    if (typeof value !== 'boolean') {
      return messages.boolean.boolean({path});
    }
    return '';
  }

  constructor(config: Config) {
    super(config);
    this.context.rules.push({
      name: 'boolean:boolean',
      test: BooleanDesy.boolean,
    });
  }

  true() {
    this.context.rules.push({
      name: 'boolean:true',
      test: (value, {path}) => {
        if (value !== true) {
          return messages.boolean.true({path});
        }
        return '';
      },
    });

    return this as BooleanDesy<true>;
  }

  false() {
    this.context.rules.push({
      name: 'boolean:false',
      test: (value, {path}) => {
        if (value !== false) {
          return messages.boolean.false({path});
        }
        return '';
      },
    });
    return this as BooleanDesy<false>;
  }
}

export function boolean() {
  return BooleanDesy.new({context: Context.new()});
}
