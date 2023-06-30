import {type Context} from './context/context.ts';

export type Config<TValue> = {
  value: TValue;
  context: Context;
};
