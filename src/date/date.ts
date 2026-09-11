import {Context, type TestConfig} from '../context/context.ts';
import {DefaultMessageProps, messages} from '../messages.ts';
import {Schema} from '../schema/schema.ts';
import {Config} from '../types';

type DateValue = string | number | Date;

const testDate = (value: any, {path}: DefaultMessageProps) => {
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
};

function testDateMin(
  value: any,
  {path, meta: {min}}: TestConfig<{min: DateValue}>,
) {
  const minDate = new Date(min);
  if (new Date(value).getTime() < minDate.getTime()) {
    return messages.date.min({path, min: minDate.toISOString()});
  }
  return '';
}

function testDateMax(
  value: any,
  {path, meta: {max}}: TestConfig<{max: DateValue}>,
) {
  const maxDate = new Date(max);
  if (new Date(value).getTime() > maxDate.getTime()) {
    return messages.date.max({path, max: maxDate.toISOString()});
  }
  return '';
}

export class DateDesy<TValue extends DateValue> extends Schema<TValue> {
  static new(config: Config) {
    return new DateDesy(config);
  }

  constructor(config: Config) {
    super(config);

    this.context.rules.push({
      name: 'date:date',
      meta: undefined,
      test: testDate,
    });
  }

  min(min: DateValue) {
    this.context.rules.push({
      name: 'date:min',
      meta: {min},
      test: testDateMin,
    });
    return this;
  }

  max(max: DateValue) {
    this.context.rules.push({
      name: 'date:max',
      meta: {max},
      test: testDateMax,
    });
    return this;
  }
}

export function date() {
  return DateDesy.new({context: Context.new()});
}
