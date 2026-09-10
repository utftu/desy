import {type Schema} from '../schema/schema.ts';
import {type ObjectDesyValue} from '../object/object.ts';

export type Test = (value: any, {path}: {path: string}) => string;

export type RuleMetaMap = {
  custom: undefined;

  'string:string': undefined;
  'string:required': undefined;
  'string:length': number;
  'string:min': number;
  'string:max': number;
  'string:one_of': readonly string[];
  'string:regexp': RegExp;

  'number:number': undefined;
  'number:min': number;
  'number:max': number;
  'number:int': undefined;
  'number:float': undefined;

  'boolean:boolean': undefined;
  'boolean:true': undefined;
  'boolean:false': undefined;

  'date:date': undefined;
  'date:min': string | number | Date;
  'date:max': string | number | Date;

  'null:null': undefined;

  'array:array': undefined;
  'array:items': Schema<any>;
  'array:min': number;
  'array:max': number;
  'array:length': number;

  'object:object': undefined;
  'object:strict': undefined;
  'object:fields': {fields: ObjectDesyValue; optional: string[]};

  'mixed:not_void': undefined;
  'mixed:one_of': Schema<any>[];
};

export type TestEntity = {
  [TName in keyof RuleMetaMap]: {
    name: TName;
    meta: RuleMetaMap[TName];
    test: Test;
  };
}[keyof RuleMetaMap];

export class Context {
  static new() {
    return new Context();
  }
  rules: TestEntity[] = [];
  allowNull: boolean = false;
  allowUndefined: boolean = false;
}
