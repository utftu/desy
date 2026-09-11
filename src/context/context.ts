import {type Schema} from '../schema/schema.ts';
import {type ObjectDesyValue} from '../object/object.ts';
import {type DefaultMessageProps} from '../messages.ts';

export type Message = string | ((props: DefaultMessageProps) => string);

export type TestConfig<TMeta = undefined> = {path: string; meta: TMeta};

export type Test<TMeta = undefined> = (
  value: any,
  {path, meta}: TestConfig<TMeta>,
) => string;

export type RuleMetaMap = {
  custom: undefined;

  'string:string': undefined;
  'string:required': undefined;
  'string:length': {length: number};
  'string:min': {min: number};
  'string:max': {max: number};
  'string:one_of': {variants: readonly string[]};
  'string:regexp': {regexp: RegExp};

  'number:number': undefined;
  'number:min': {min: number};
  'number:max': {max: number};
  'number:one_of': {variants: readonly number[]};
  'number:int': undefined;
  'number:float': undefined;

  'boolean:boolean': undefined;
  'boolean:true': undefined;
  'boolean:false': undefined;

  'date:date': undefined;
  'date:min': {min: string | number | Date};
  'date:max': {max: string | number | Date};

  'null:null': undefined;

  'array:array': undefined;
  'array:items': {items: Schema<any>};
  'array:min': {min: number};
  'array:max': {max: number};
  'array:length': {length: number};

  'object:object': undefined;
  'object:strict': {fields: ObjectDesyValue};
  'object:fields': {fields: ObjectDesyValue};

  'mixed:not_void': undefined;
  'mixed:one_of': {schemas: Schema<any>[]};
};

export type TestEntity = {
  [TName in keyof RuleMetaMap]: {
    name: TName;
    meta: RuleMetaMap[TName];
    test: Test<RuleMetaMap[TName]>;
  };
}[keyof RuleMetaMap];

export class Context {
  static new() {
    return new Context();
  }
  rules: TestEntity[] = [];
  allowNull: boolean = false;
  allowUndefined: boolean = false;
  description: string | undefined;
  message: Message | undefined;
}
