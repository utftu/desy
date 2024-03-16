# desy - Dead Extraordinary Simple Yup

- [Install](#install)
- [Basic usage](#basic-usage)
- [Key ideas](#key-ideas)
- [Key features](#key-features)
- [Examples](#examples)
- [API](#api)
- [Benchmark](#benchmark)

## Install

```sh
npm install desy
```

## Basic usage

Creating a simple string schema

```ts
import {d} from 'desy';

// creating a schema for strings
const mySchema = d.string();

// validating
mySchema.validate('tuna'); // => ""
mySchema.validate(12); // => "Value must be string"
```

## Key ideas

- be `simple`
- be as `fast` as point 1 allows

## Key features

- Stop validating on the first error. Desy stops validating on the first error and returns it.
- A string is an indicator. Desy returns an empty string in a valid case. In case of an error, Desy returns a string with a description of the error.
- No throwing errors. Desy only returns an empty or non-empty string.

## Examples

Deep schema

```ts
const schema = d.array(
  d.object({
    type: d.string().oneOf(['person']),
    hair: d.string().oneOf(['blue', 'brown']),
    active: d.boolean(),
    name: d.string(),
    age: d.number().int(),
    hobbies: d.array(d.string()),
    address: d.object({
      street: d.string(),
      zip: d.string(),
      country: d.string(),
    }),
  }),
);
schema.validate(people);
```

Get schema's types

```ts
import {d, InferDesy} from 'desy';

const userSchema = d.object({
  username: d.string(),
});

const error = userSchema.validate({username: 'Ludwig'}); // error is ""

// extract the inferred type
type User = InferDesy<typeof user>; // { username: string }
```

## API

- [Commin](#common)
- [mixed()](#mixed)
- [string()](#string)
- [number()](#number)
- [number()](#number)
- [boolean()](#boolean)
- [date()](#date)
- [null()](#null)
- [object()](#object)
- [array()](#array)

### Common

- `validate(value: any)`

```ts
const schema = d.mixed();

schema.validate('a'); // valid
schema.validate(''); // valid
schema.validate(null); // valid
```

- `.test(func: (value: sting) => string)`

```ts
const schema = d.mixed().test((value) => {
  if (value === 'world') {
    return ''; // valid case
  }

  return 'MUST BE WORLD'; // error message
});

schema.validate('hello'); // error
schema.validate('world'); // valid
```

### mixed

- `mixed()`

```ts
const schema = d.mixed();

schema.validate('a'); // valid
schema.validate(''); // valid
schema.validate(null); // valid
```

### string

- `.string()`

```ts
const schema = d.string();

schema.validate('a'); // valid
schema.validate(''); // error
schema.validate(null); // error
```

- `.length(chars)`

```ts
const schema = d.string().length(1);

schema.validate('aa'); // error
schema.validate('a'); // valid
```

- `.optional()`

```ts
const schema = d.string().optional();

schema.validate(''); // valid
schema.validate('a'); // valid
```

- `.oneOf(variants: string[])`

```ts
const schema = d.string().oneOf(['hello', 'world']);

schema.validate('hello'); // valid
schema.validate('world'); // valid
schema.validate('foo'); // error
```

- `.regexp(regexp: Regexp)`

```ts
const schema = d.string().regexp(/hello/i);

schema.validate('123hello'); // valid
schema.validate('hell'); // error
```

- `.min(min_chars: number)`

```ts
const schema = d.string().min(1);

schema.validate(''); // error
schema.validate('a'); // valid
```

- `.max(max_chars: number)`

```ts
const schema = d.string().max(1);

schema.validate('aa'); // error
schema.validate('a'); // valid
```

### number

- `.number()`

```ts
const schema = d.number();

schema.validate(42); // valid
schema.validate('42'); // error
```

- `.int()`

```ts
const schema = d.number().int();

schema.validate(42); // valid
schema.validate(42.2); // error
```

- `.float()`

```ts
const schema = d.number().float();

schema.validate(42); // error
schema.validate(42.2); // valid
```

- `.min(num: number)`

```ts
const schema = d.number().min(1);

schema.validate(0); // error
schema.validate(1); // valid
```

- `.max(num: number)`

```ts
const schema = d.number().max(1);

schema.validate(1); // valid
schema.validate(2); // error
```

### boolean

- `.boolean()`

```ts
const schema = d.boolean();

schema.validate(true); // valid
schema.validate(false); // valid
schema.validate(1); // error
```

- `.true()`

```ts
const schema = d.boolean().true();

schema.validate(true); // valid
schema.validate(false); // error
```

- `.false()`

```ts
const schema = d.boolean().false();

schema.validate(true); // error
schema.validate(false); // valid
```

### date

- `.date()`

```ts
const schema = d.date();

schema.validate(0); // valid
schema.validate('2024-03-15T23:21:48.605Z'); // valid
schema.validate(new Date()); // valid
schema.validate(undefined); // error
```

- `.min(date: DateValue)`

```ts
const now = Date.now();
const schema = d.date().min(now);

schema.validate(now); // valid
schema.validate(now - 1); // error
```

- `.max(date: DateValue)`

```ts
const now = Date.now();
const schema = d.date().max(now);

schema.validate(now); // valid
schema.validate(now + 1); // error
```

### null

- `.null()`

```ts
const schema = d.null();

schema.validate(null); // valid
schema.validate(undefined); // error
```

### object

- `.object(objschema: Record<string, Schema>)`

```ts
const schema = d.object({
  name: d.sting(),
});

schema.validate({name: 'alex'}); // valid
schema.validate({name: 'alex', age: 42}); // error
schema.validate({name: 42}); // error
```

- `.notStrict()`

```ts
const schema = d
  .object({
    name: d.sting(),
  })
  .notStrict();

schema.validate({name: 'alex'}); // valid
schema.validate({name: 'alex', age: 42}); // valid
schema.validate({name: 42}); // error
```

- `.optionalFields(fileds: string[])`

```ts
const schema = d
  .object({
    name: d.sting(),
  })
  .optionalFields(['name']);

schema.validate({name: 'alex'}); // valid
schema.validate({}); // valid
schema.validate({name: 42}); // error
```

### array

- `.array(schemas: Schema[])`

```ts
const schema = d.arrar(d.sting());

schema.validate(['hello', 'world']); // valid
schema.validate(['hello', 42]); // error
```

- `.length(length: number)`

```ts
const schema = d.arrar(d.sting()).length(2);

schema.validate(['hello', 'world']); // valid
schema.validate(['world']); // error
```

- `.min(min_length: number)`

```ts
const schema = d.arrar(d.sting()).min(2);

schema.validate(['hello', 'world']); // valid
schema.validate(['world']); // error
```

- `.max(max_length: number)`

```ts
const schema = d.arrar(d.sting()).max(2);

schema.validate(['hello', 'world']); // valid
schema.validate(['hello', 'world', 'foo']); // error
```

## benchmark

|      | Simple string [result](./static/bench/string.png) | Complex object [result](./static/bench/complex.png) |
| ---- | ------------------------------------------------- | --------------------------------------------------- |
| desy | x                                                 | x                                                   |
| zod  | 10x                                               | 8x                                                  |
| yup  | 43x                                               | 31x                                                 |

smaller is better
