import {describe, expect, it} from 'bun:test';
import {date} from './date.ts';

const DAY = 1000 * 60 * 60 * 24;

describe('date', () => {
  it('date:date', () => {
    const schema = date();

    expect(schema.validate(new Date())).toBe('');
    expect(schema.validate(new Date().toISOString())).toBe('');
    expect(schema.validate(0)).toBe('');
    expect(schema.validate('hello')).not.toBe('');
    expect(schema.validate(undefined)).not.toBe('');
  });

  it('date:min', () => {
    const now = Date.now();
    const schema = date().min(now + DAY);

    expect(schema.validate(now)).not.toBe('');
    expect(schema.validate(now + DAY)).toBe('');
    expect(schema.validate(now + DAY * 2)).toBe('');
  });

  it('date:max', () => {
    const now = Date.now();
    const schema = date().max(now + DAY);

    expect(schema.validate(now)).toBe('');
    expect(schema.validate(now + DAY)).toBe('');
    expect(schema.validate(now + DAY * 2)).not.toBe('');
  });
});
