export type DefaultMessageProps = {path: string};

type Min = DefaultMessageProps & {min: number};
type Max = DefaultMessageProps & {max: number};
type Length = DefaultMessageProps & {length: number};
type RegexpMessage = DefaultMessageProps & {regexp: string};

export const messages = {
  string: {
    string: ({path}: DefaultMessageProps) => `${path} must be string`,
    requred: ({path}: DefaultMessageProps) =>
      `${path} must be non empty string`,
    min: ({path, min}: Min) => `${path} must be at least ${min} characters`,
    max: ({path, max}: Max) => `${path} must be at most ${max} characters`,
    length: ({path, length}: Length) =>
      `${path} has be exactly ${length} characters`,
    regexp: ({path, regexp}: RegexpMessage) => `${path} must match ${regexp}`,
    one_of: ({
      path,
      variants,
      value,
    }: DefaultMessageProps & {variants: string[]; value: string}) =>
      `${path} must have one of ${variants.join(', ')} but has ${value}`,
  },
  object: {
    object: ({path}: DefaultMessageProps) => `${path} must be object`,
    no_property: ({path}: DefaultMessageProps) => `${path} must be field`,
    unknown: ({path}: DefaultMessageProps) => `${path} has uknown properties`,
  },
  mixed: {
    not_void: ({path}: DefaultMessageProps) => `${path} must be not void`,
  },
  boolean: {
    boolean: ({path}: DefaultMessageProps) => `${path} must be boolean`,
    true: ({path}: DefaultMessageProps) => `${path} must be true`,
    false: ({path}: DefaultMessageProps) => `${path} must be false`,
  },
  number: {
    number: ({path}: DefaultMessageProps) => `${path} must be number`,
    min: ({path, min}: Min) =>
      `${path} must be greater than or equal to ${min}`,
    max: ({path, max}: Max) => `${path} must be less than or equal to ${max}`,
    int: ({path}: DefaultMessageProps) => `${path} must be integer`,
    float: ({path}: DefaultMessageProps) => `${path} must be float`,
  },
  array: {
    array: ({path}: DefaultMessageProps) => `${path} must be array`,
    items: ({path}: DefaultMessageProps) => `${path} must has valid items`,
    min: ({path, min}: Min) => `${path} must be at least ${min} length`,
    max: ({path, max}: Max) => `${path} must be at most ${max} length`,
    length: ({path, length}: Length) =>
      `${path} has be exactly ${length} length`,
  },
  date: {
    date: ({path}: DefaultMessageProps) => `${path} must be date`,
    min: ({path, min}: DefaultMessageProps & {min: string}) =>
      `${path} must be later than ${min}`,
    max: ({path, max}: DefaultMessageProps & {max: string}) =>
      `${path} must be at earlier than ${max}`,
  },
  null: {
    null: ({path}: DefaultMessageProps) => `${path} must be null`,
  },
};
