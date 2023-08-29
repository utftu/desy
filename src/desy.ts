import {string} from './string/string.ts';
import {object} from './object/object.ts';
import {number} from './number/number.ts';
import {boolean} from './boolean/boolean.ts';
import {array} from './array/array.ts';
import {mixed} from './mixed/mixed.ts';
import {date} from './date/date.ts';
import {nullDesy} from './null/null.ts';
import {type Schema, type Infer} from './schema/schema.ts';
export {type Schema} from './schema/schema.ts';

export type InferDesy<T extends Schema<any>> = Infer<T>;

export const d = {
  string,
  object,
  number,
  boolean,
  array,
  mixed,
  date,
  null: nullDesy,
};
