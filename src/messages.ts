export const messages = {
  string: {
    string: ({path}) => `${path} must be string`,
    requred: ({path}) => `${path} must be non empty string`,
    min: ({path, min}) => `${path} must be at least ${min} characters`,
    max: ({path, max}) => `${path} must be at most ${max} characters`,
    length: ({path, length}) => `${path} has be exactly ${length} characters`,
    one_of: ({path, variants, value}) =>
      `${path} must have one of ${variants.join(', ')} but has ${value}`,
  },
  object: {
    object: ({path}) => `${path} must be object`,
    no_property: ({path}) => `${path} must be field`,
    unknown: ({path}) => `${path} has uknown properties`,
  },
  mixed: {
    not_void: ({path}) => `${path} must be not void`,
  },
  boolean: {
    boolean: ({path}) => `${path} must be boolean`,
    true: ({path}) => `${path} must be true`,
    false: ({path}) => `${path} must be false`,
  },
  number: {
    number: ({path}) => `${path} must be number`,
    min: ({path, min}) => `${path} must be greater than or equal to ${min}`,
    max: ({path, max}) => `${path} must be less than or equal to ${max}`,
    int: ({path}) => `${path} must be integer`,
    float: ({path}) => `${path} must be float`,
  },
  array: {
    array: ({path}) => `${path} must be array`,
    items: ({path}) => `${path} must has valid items`,
    min: ({path, min}) => `${path} must be at least ${min} length`,
    max: ({path, max}) => `${path} must be at most ${max} length`,
    length: ({path, length}) => `${path} has be exactly ${length} length`,
  },
  date: {
    date: ({path}) => `${path} must be date`,
    min: ({path, min}) => `${path} must be later than ${min}`,
    max: ({path, max}) => `${path} must be at earlier than ${max}`,
  },
  null: {
    null: ({path}) => `${path} must be null`,
  },
};
