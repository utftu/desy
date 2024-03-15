# desy - Dead Extraordinary Simple Yup

## key ideas

- be `simple`
- be as `fast` as point 1 allows

## key features

- Stop validating on the first error. Desy stops validating on the first error and returns it.
- A string is an indicator. Desy returns an empty string in a valid case. In case of an error, Desy returns a string with a description of the error.
- No throwing errors. Desy only returns an empty or non-empty string.

## install

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

Creating an object schema

```ts
import {d, InferDesy} from 'desy';

const userSchema = d.object({
  username: d.string(),
});

const error = userSchema.validate({username: 'Ludwig'}); // error is ""

// extract the inferred type
type User = InferDesy<typeof user>;
// { username: string }
```

## Realworld Example

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

## API

mixed

- `array()` - create schema for array

```ts
const schema = d.mixed().array(); // = d.array()
```

### string

- `.string()`

```ts
const schema = d.string();

schema('a'); // valid
schema(''); // error
schema(null); // error
```

- `.length(chars)`

```ts
const schema = d.string().length(1);

schema('aa'); // error
schema('a'); // valid
```

- `.optional()`

```ts
const schema = d.string().optional();

schema(''); // valid
schema('a'); // valid
```

- `.oneOf(variants: string[])`

```ts
const schema = d.string().oneOf(['hello', 'world']);

schema('hello'); // valid
schema('world'); // valid
schema('foo'); // error
```

- `.min(min_chars: number)`

```ts
const schema = d.string().min(1);

schema(''); // error
schema('a'); // valid
```

- `.max(max_chars: number)`

```ts
const schema = d.string().max(1);

schema('aa'); // error
schema('a'); // valid
```

### number

- `.number()`

```ts
const schema = d.number();

schema(42); // valid
schema('42'); // error
```

- `.int()`

```ts
const schema = d.number().int();

schema(42); // valid
schema(42.2); // error
```

- `.float()`

```ts
const schema = d.number().float();

schema(42); // error
schema(42.2); // valid
```

- `.min(num: number)`

```ts
const schema = d.number().min(1);

schema(0); // error
schema(1); // valid
```

- `.max(num: number)`

```ts
const schema = d.number().max(1);

schema(1); // valid
schema(2); // error
```

### boolean

- `.boolean()`

```ts
const schema = d.boolean();

schema(true); // valid
schema(false); // valid
schema(1); // error
```

- `.true()`

```ts
const schema = d.boolean().true();

schema(true); // valid
schema(false); // error
```

- `.false()`

```ts
const schema = d.boolean().false();

schema(true); // error
schema(false); // valid
```

### null

- `.max(num: number)`

```ts
const schema = d.null();

schema(null); // valid
schema(undefined); // error
```

## benchmark

[Object benchmark](./bench/object.ts)
![object bench](./static/bench/object.png)

[Complex benchmark](./bench/complex.ts)
![object bench](./static/bench/complex.png)
