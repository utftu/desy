export const messages = {
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
  mixed: {
    not_void: ({path}) => `${path} must be not void`,
  },
  boolean: {
    boolean: ({path}) => `${path} must be boolean`,
  },
  number: {
    number: ({path}) => `${path} must be number`,
    min: ({path, min}) => `${path} must be greater than or equal to ${min}`,
    max: ({path, max}) => `${path} must be less than or equal to ${max}`,
  },
};
