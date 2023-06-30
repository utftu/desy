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
};
