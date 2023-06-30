import {Schema} from '../schema/schema.ts';
import {Context} from '../context/context.ts';
import {StringMy} from '../string/string.ts';
import {type ObjectMyValue, ObjectMy} from '../object/object.ts';

export class Mixed extends Schema {
  static new() {
    return new Mixed();
  }

  context = new Context();

  notVoid() {
    this.context.rules.push({
      name: 'mixed:not_void',
      test: (value) => {
        if (value === undefined && value === null) {
          return '';
        }
        return '';
      },
    });
  }

  object(shape: ObjectMyValue) {
    const onject = ObjectMy.new({context: this.context, value: shape});
    return onject;
  }

  string() {
    return new StringMy({context: this.context});
  }
}
