// src/schema/schema.ts
class Schema {
  context;
  test(value, { path } = { path: "Value" }) {
    for (const testEntity of this.context.rules) {
      const error = testEntity.test(value, { path });
      if (error !== "") {
        return error;
      }
    }
    return "";
  }
}

// src/context/context.ts
class Context {
  rules = [];
}

// src/messages.ts
var messages = {
  string: {
    string: ({ path }) => `${path} must be string`,
    requred: ({ path }) => `${path} must be non empty string`,
    min: ({ path, min }) => `${path} must be at least ${min} characters`,
    max: ({ path, max }) => `${path} must be at most ${max} characters`,
    length: ({ path, length }) => `${path} has be exactly ${length} characters`
  },
  object: {
    no_property: ({ path }) => `${path} must be field`,
    unknown: ({ path }) => `${path} has uknown properties`
  }
};

// src/string/string.ts
class StringMy extends Schema {
  static new(config) {
    return new StringMy(config);
  }
  static string(value, { path }) {
    if (typeof value !== "string") {
      return messages.string.string({ path });
    }
    return "";
  }
  static required(value, { path }) {
    if (value === "") {
      return messages.string.requred({ path });
    }
    return "";
  }
  context;
  constructor({ context }) {
    super();
    this.context = context;
    context.rules.push({ name: "string:string", test: StringMy.string });
    context.rules.push({ name: "string:required", test: StringMy.required });
  }
  optional() {
    this.context.rules = this.context.rules.filter(({ test }) => test !== StringMy.required);
    return this;
  }
  length(length) {
    this.context.rules.push({
      name: "string:length",
      test: (value, { path }) => {
        if (value.length !== length) {
          return messages.string.length({ path, length });
        }
        return "";
      }
    });
    return this;
  }
  min(minLength) {
    this.context.rules.push({
      name: "string:min",
      test: (value, { path }) => {
        if (value.length < minLength) {
          return messages.string.min({ path, min: minLength });
        }
        return "";
      }
    });
    return this;
  }
  max(maxLength) {
    this.context.rules.push({
      name: "string:max",
      test: (value, { path }) => {
        if (value.length > maxLength) {
          return messages.string.max({ path, max: maxLength });
        }
        return "";
      }
    });
    return this;
  }
}

// src/object/object.ts
class ObjectMy extends Schema {
  static new(config) {
    return new ObjectMy(config);
  }
  context;
  static object(value) {
    if (typeof value !== "object") {
      return "Not object";
    }
    return "";
  }
  constructor({ value, context }) {
    super();
    this.context = context;
    context.rules.push({ name: "object:object", test: ObjectMy.object });
    context.rules.push({
      name: "object:strict",
      test: (currentValue, { path }) => {
        const valueKeys = Object.keys(value);
        const currentValueKeys = Object.keys(currentValue);
        for (let i = 0;i < valueKeys.length; i++) {
          if (valueKeys[i] !== currentValueKeys[i]) {
            return messages.object.no_property({ path: valueKeys[i] });
          }
        }
        if (valueKeys.length !== currentValueKeys.length) {
          return messages.object.unknown({ path });
        }
        return "";
      }
    });
    context.rules.push({
      name: "object:fields",
      test: (currentValue) => {
        for (const key in value) {
          const schema3 = value[key];
          const error = schema3.test(currentValue[key], { path: key });
          if (error !== "") {
            return error;
          }
        }
        return "";
      }
    });
  }
  optional() {
    this.context.rules = this.context.rules.filter(({ test }) => test !== ObjectMy.object);
    return this;
  }
}

// src/mixed/mixed.ts
class Mixed extends Schema {
  constructor() {
    super(...arguments);
  }
  static new() {
    return new Mixed;
  }
  context = new Context;
  notVoid() {
    this.context.rules.push({
      name: "mixed:not_void",
      test: (value) => {
        if (value === undefined && value === null) {
          return "";
        }
        return "";
      }
    });
  }
  object(shape) {
    const onject = ObjectMy.new({ context: this.context, value: shape });
    return onject;
  }
  string() {
    return new StringMy({ context: this.context });
  }
}

// src/run.ts
var a = Mixed.new().object({
  name: Mixed.new().string(),
  age: Mixed.new().string()
});
var result = a.test({
  name: "hello",
  age: ""
});
console.log("-----", "result", result);
