import {Schema} from '../schema/schema.ts';
import {Config} from '../types';

type DateValue = string | number | Date;

export class DateDesy extends Schema<DateValue> {
  static date(value, {path}) {
    const valueType = typeof value;
    if (
      valueType !== 'number' &&
      valueType !== 'string' &&
      !(value instanceof Date)
    ) {
      return 'error';
    }

    const date = new Date(value);

    const valid = !isNaN(date.getTime());

    if (!valid) {
      return `${path} must be valid date`;
    }

    return '';
  }

  constructor({context}: Config) {
    super({context});

    this.context.rules.push({
      name: 'date:date',
      test: DateDesy.date,
    });
  }

  min(min: DateValue) {
    this.context.rules.push({
      name: 'date:min',
      test: (value, {path}) => {
        if (new Date(value) > new Date(min)) {
          return 'too late';
        }
        return '';
      },
    });
  }
}
