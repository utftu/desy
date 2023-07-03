import {type Context} from './context/context.ts';

export type Config = {
  context: Context;
};

export type ConfigValue<TValue> = {
  value: TValue;
  context: Context;
};
