import {Context} from '../context/context.ts';
import {messages} from '../messages.ts';
import {Schema} from '../schema/schema.ts';
import {Config} from '../types';

type DateValue = string | number | Date;

export class DateDesy<TValue extends DateValue> extends Schema<TValue> {
  static new(config: Config) {
    return new DateDesy(config);
  }

  static date(value, {path}) {
    const valueType = typeof value;
    if (
      valueType !== 'number' &&
      valueType !== 'string' &&
      !(value instanceof Date)
    ) {
      return messages.date.date({path});
    }

    const date = new Date(value);

    const valid = !isNaN(date.getTime());

    if (!valid) {
      return messages.date.date({path});
    }

    return '';
  }

  constructor(config: Config) {
    super(config);

    this.context.rules.push({
      name: 'date:date',
      test: DateDesy.date,
    });
  }

  min(min: DateValue) {
    this.context.rules.push({
      name: 'date:min',
      test: (value, {path}) => {
        const minDate = new Date(min);
        if (new Date(value).getTime() < minDate.getTime()) {
          return messages.date.min({path, min: minDate.toISOString()});
        }
        return '';
      },
    });
    return this;
  }

  max(max: DateValue) {
    this.context.rules.push({
      name: 'date:min',
      test: (value, {path}) => {
        const maxDate = new Date(max);
        if (new Date(value).getTime() > maxDate.getTime()) {
          return messages.date.max({path, max: maxDate.toISOString()});
        }
        return '';
      },
    });
    return this;
  }
}

export function date() {
  return DateDesy.new({context: Context.new()});
}
