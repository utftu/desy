import {messages} from '../messages.ts';
import {Schema} from '../schema/schema.ts';
import {Context} from '../context/context.ts';

type Config = {
  context: Context;
};

export class BooleanMy extends Schema {
  static new(config: Config) {
    return new BooleanMy(config);
  }

  static boolean(value, {path}) {
    if (typeof value !== 'boolean') {
      return messages.boolean.boolean({path});
    }
    return '';
  }

  constructor({context}: {context: Context}) {
    super({context});
    this.context.rules.push({name: 'boolean:boolean', test: BooleanMy.boolean});
  }
}

export function boolean() {
  return BooleanMy.new({context: Context.new()});
}
