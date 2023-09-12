import {Context} from '../context/context.ts';
import {DefaultMessageProps, messages} from '../messages.ts';
import {Schema} from '../schema/schema.ts';
import {Config} from '../types.ts';

const testNull = (value: any, {path}: DefaultMessageProps) => {
  if (value !== null) {
    return messages.null.null({path});
  }
  return '';
};

export class NullDesy extends Schema<null> {
  static new(config: Config) {
    return new NullDesy(config);
  }

  constructor(config: Config) {
    super(config);

    this.context.rules.push({
      name: 'null:null',
      test: testNull,
    });
  }
}

export function nullDesy() {
  return NullDesy.new({context: Context.new()});
}
