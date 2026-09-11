import {type Schema} from '../schema/schema.ts';
import {type Context} from '../context/context.ts';
import {type TestEntity} from '../context/context.ts';

export type JsonSchema = {
  $schema?: string;
  type?: string | string[];
  description?: string;
  const?: boolean;
  enum?: readonly (string | number)[];
  pattern?: string;
  format?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  minItems?: number;
  maxItems?: number;
  items?: JsonSchema;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean;
  anyOf?: JsonSchema[];
};

const draft = 'https://json-schema.org/draft/2020-12/schema';

function narrowMin(current: number | undefined, value: number) {
  if (current === undefined) {
    return value;
  }

  return Math.max(current, value);
}

function narrowMax(current: number | undefined, value: number) {
  if (current === undefined) {
    return value;
  }

  return Math.min(current, value);
}

function narrowEnum(
  current: readonly (string | number)[] | undefined,
  variants: readonly (string | number)[],
) {
  if (current === undefined) {
    return variants;
  }

  return variants.filter((variant) => current.includes(variant));
}

function applyConst(jsonSchema: JsonSchema, value: boolean) {
  if (jsonSchema.const !== undefined) {
    throw new Error('only one of boolean:true and boolean:false converts');
  }

  jsonSchema.const = value;
}

function applyRule(rule: TestEntity, jsonSchema: JsonSchema) {
  switch (rule.name) {
    case 'string:string':
      jsonSchema.type = 'string';
      return;
    case 'string:required':
      jsonSchema.minLength = narrowMin(jsonSchema.minLength, 1);
      return;
    case 'string:length':
      jsonSchema.minLength = narrowMin(jsonSchema.minLength, rule.meta.length);
      jsonSchema.maxLength = narrowMax(jsonSchema.maxLength, rule.meta.length);
      return;
    case 'string:min':
      jsonSchema.minLength = narrowMin(jsonSchema.minLength, rule.meta.min);
      return;
    case 'string:max':
      jsonSchema.maxLength = narrowMax(jsonSchema.maxLength, rule.meta.max);
      return;
    case 'string:one_of':
      jsonSchema.enum = narrowEnum(jsonSchema.enum, rule.meta.variants);
      return;
    case 'string:regexp':
      if (jsonSchema.pattern !== undefined) {
        throw new Error('only one string:regexp converts');
      }
      jsonSchema.pattern = rule.meta.regexp.source;
      return;
    case 'number:number':
      jsonSchema.type = 'number';
      return;
    case 'number:one_of':
      jsonSchema.enum = narrowEnum(jsonSchema.enum, rule.meta.variants);
      return;
    case 'number:int':
      jsonSchema.type = 'integer';
      return;
    case 'number:min':
      jsonSchema.minimum = narrowMin(jsonSchema.minimum, rule.meta.min);
      return;
    case 'number:max':
      jsonSchema.maximum = narrowMax(jsonSchema.maximum, rule.meta.max);
      return;
    case 'boolean:boolean':
      jsonSchema.type = 'boolean';
      return;
    case 'boolean:true':
      applyConst(jsonSchema, true);
      return;
    case 'boolean:false':
      applyConst(jsonSchema, false);
      return;
    case 'date:date':
      jsonSchema.type = 'string';
      jsonSchema.format = 'date-time';
      return;
    case 'null:null':
      jsonSchema.type = 'null';
      return;
    case 'array:array':
      jsonSchema.type = 'array';
      return;
    case 'array:items':
      jsonSchema.items = buildJsonSchema(rule.meta.items);
      return;
    case 'array:length':
      jsonSchema.minItems = narrowMin(jsonSchema.minItems, rule.meta.length);
      jsonSchema.maxItems = narrowMax(jsonSchema.maxItems, rule.meta.length);
      return;
    case 'array:min':
      jsonSchema.minItems = narrowMin(jsonSchema.minItems, rule.meta.min);
      return;
    case 'array:max':
      jsonSchema.maxItems = narrowMax(jsonSchema.maxItems, rule.meta.max);
      return;
    case 'object:object':
      jsonSchema.type = 'object';
      jsonSchema.additionalProperties = false;
      return;
    case 'object:strict':
      return;
    case 'object:fields':
      applyFields(rule.meta.fields, jsonSchema);
      return;
    case 'mixed:one_of':
      jsonSchema.anyOf = rule.meta.schemas.map((schema) =>
        buildJsonSchema(schema),
      );
      return;
    case 'custom':
    case 'number:float':
    case 'date:min':
    case 'date:max':
    case 'mixed:not_void':
      throw new Error(`${rule.name} has no JSON Schema mapping`);
    default: {
      const unknownRule: never = rule;
      throw new Error(`unknown rule ${(unknownRule as TestEntity).name}`);
    }
  }
}

function applyFields(
  fields: Record<string, Schema<any>>,
  jsonSchema: JsonSchema,
) {
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  for (const key in fields) {
    const field = fields[key]!;
    properties[key] = buildJsonSchema(field);

    if (field.getContext().allowUndefined) {
      continue;
    }
    required.push(key);
  }

  jsonSchema.properties = properties;
  jsonSchema.required = required;
}

function applyNull(context: Context, jsonSchema: JsonSchema): JsonSchema {
  if (context.allowNull === false) {
    return jsonSchema;
  }

  if (typeof jsonSchema.type === 'string') {
    jsonSchema.type = [jsonSchema.type, 'null'];
    return jsonSchema;
  }

  return {anyOf: [jsonSchema, {type: 'null'}]};
}

function buildJsonSchema(schema: Schema<any>): JsonSchema {
  const context = schema.getContext();
  const jsonSchema: JsonSchema = {};

  for (const rule of context.rules) {
    applyRule(rule, jsonSchema);
  }

  const result = applyNull(context, jsonSchema);

  if (context.description !== undefined) {
    result.description = context.description;
  }

  return result;
}

export function createJsonSchema(schema: Schema<any>): JsonSchema {
  return {$schema: draft, ...buildJsonSchema(schema)};
}
