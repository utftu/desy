import {describe, expect, it} from 'bun:test';
import {nullDesy} from './null.ts';

describe('null', () => {
  it('null:null', () => {
    const schema = nullDesy();

    expect(schema.validate(null)).toBe('');
    // expect(schema.validate(undefined)).not.toBe('');
  });
});
