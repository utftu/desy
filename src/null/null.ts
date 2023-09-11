import {Context} from '../context/context.ts';
import {DefaultMessageProps, messages} from '../messages.ts';
import {Schema} from '../schema/schema.ts';
import {Config} from '../types.ts';

export class NullDesy extends Schema<null> {
  static new(config: Config) {
    return new NullDesy(config);
  }

  private static null(value: any, {path}: DefaultMessageProps) {
    if (value !== null) {
      return messages.null.null({path});
    }
    return '';
  }

  constructor(config: Config) {
    super(config);

    this.context.rules.push({
      name: 'null:null',
      test: NullDesy.null,
    });
  }
}

export function nullDesy() {
  return NullDesy.new({context: Context.new()});
}
