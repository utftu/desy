import {type Context} from './context/context.ts';

export type Config = {
  context: Context;
};

export type ConfigValue<TValue> = {
  value: TValue;
  context: Context;
};

export type DeepCopy<T> = {
  [K in keyof T]: T[K] extends Record<string, any> ? DeepCopy<T[K]> : T[K];
};
