import {describe, it} from 'bun:test';
import {object} from '../object/object.ts';
import {string} from '../string/string.ts';
import {number} from '../number/number.ts';
import {boolean} from '../boolean/boolean.ts';
import {Infer} from './schema.ts';

describe('infer', () => {
  it('object', () => {
    const schema = object({
      name: string(),
      age: number(),
      valid: boolean(),
    });

    type User = Infer<typeof schema>;
  });
});
