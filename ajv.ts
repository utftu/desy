// or ESM/TypeScript import
import Ajv from 'ajv';
// Node.js require:
// const Ajv = require('ajv');

const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}

const schema = {
  type: 'string',
};

const data = 'hello';

const validate = ajv.compile(schema);
console.log('-----', 'validate', validate);
const valid = validate(data);
console.log('-----', 'valid', valid);
if (!valid) console.log(validate.errors);

// const result = ajv.compile(schema)()
