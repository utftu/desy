type Test = (value: any, {path}: {path: string}) => string;
type TestEntity = {
  name: string;
  test: Test;
};
type Config<TValue> = {
  value: TValue;
  context: Context;
};
type ObjectMyValue = Record<string, Schema>;

const messages = {
  string: {
    string: ({path}) => `${path} must be string`,
    requred: ({path}) => `${path} must be non empty string`,
    min: ({path, min}) => `${path} must be at least ${min} characters`,
    max: ({path, max}) => `${path} must be at most ${max} characters`,
    length: ({path, length}) => `${path} has be exactly ${length} characters`,
  },
  object: {
    no_property: ({path}) => `${path} must be field`,
    unknown: ({path}) => `${path} has uknown properties`,
  },
};

class Context {
  rules: TestEntity[] = [];
}

class Schema {
  context = new Context();
  test(value: any, {path}: {path: string} = {path: 'Value'}) {
    for (const testEntity of this.context.rules) {
      const error = testEntity.test(value, {path});
      if (error !== '') {
        return error;
      }
    }
    return '';
  }
}

class Mixed extends Schema {
  static new() {
    return new Mixed();
  }

  context = new Context();

  notVoid() {
    this.context.rules.push({
      name: 'mixed:not_void',
      test: (value) => {
        if (value === undefined && value === null) {
          return '';
        }
        return '';
      },
    });
  }

  object(shape: ObjectMyValue) {
    const onject = ObjectMy.new({context: this.context, value: shape});
    return onject;
  }

  string() {
    return new StringMy({context: this.context});
  }
}

class ObjectMy extends Schema {
  static new(config: Config<ObjectMyValue>) {
    return new ObjectMy(config);
  }

  context: Context;

  static object(value) {
    if (typeof value !== 'object') {
      return 'Not object';
    }
    return '';
  }

  constructor({value, context}: Config<ObjectMyValue>) {
    super();
    this.context = context;
    context.rules.push({name: 'object:object', test: ObjectMy.object});
    context.rules.push({
      name: 'object:strict',
      test: (currentValue) => {
        const valueKeys = Object.keys(value);
        const currentValueKeys = Object.keys(currentValue);

        for (let i = 0; i < valueKeys.length; i++) {
          if (valueKeys[i] !== currentValueKeys[i]) {
            return `No property ${valueKeys[i]}`;
          }
        }

        if (valueKeys.length !== currentValueKeys.length) {
          return 'Different length';
        }
        return '';
      },
    });
    context.rules.push({
      name: 'object:fields',
      test: (currentValue) => {
        for (const key in value) {
          const schema = value[key];
          const error = schema.test(currentValue[key], {path: key});
          if (error !== '') {
            return error;
          }
        }
        return '';
      },
    });
  }

  optional() {
    this.context.rules = this.context.rules.filter(({test}) => test !== ObjectMy.object);
    return this;
  }
}

class StringMy extends Schema {
  static string(value, {path}) {
    if (typeof value !== 'string') {
      return messages.string.string({path});
    }
    return '';
  }

  static required(value, {path}) {
    if (value === '') {
      return messages.string.requred({path});
    }
    return '';
  }

  context: Context;

  constructor({context}: {context: Context}) {
    super();
    this.context = context;
    context.rules.push({name: 'string:string', test: StringMy.string});
    context.rules.push({name: 'string:required', test: StringMy.required});
  }

  optional() {
    this.context.rules = this.context.rules.filter(({test}) => test !== StringMy.required);
    return this;
  }

  length(length: number) {
    this.context.rules.push({
      name: 'string:length',
      test: (value, {path}) => {
        if (value.length !== length) {
          return messages.string.length({path, length});
        }
        return '';
      },
    });
  }

  min(minLength: number) {
    this.context.rules.push({
      name: 'string:min',
      test: (value, {path}) => {
        if (value.length < minLength) {
          return messages.string.min({path, min: minLength});
        }
        return '';
      },
    });
  }

  max(maxLength: number) {
    this.context.rules.push({
      name: 'string:max',
      test: (value, {path}) => {
        if (value.length > maxLength) {
          return messages.string.max({path, max: maxLength});
        }
        return '';
      },
    });
  }
}

const a = Mixed.new().object({
  name: Mixed.new().string(),
  age: Mixed.new().string(),
});
const result = a.test({
  name: 'hello',
  // age: 23,
});
console.log('-----', 'result', result);
