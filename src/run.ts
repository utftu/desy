import {Mixed} from './mixed/mixed.ts';

const a = Mixed.new().object({
  name: Mixed.new().string(),
  age: Mixed.new().string(),
});
const result = a.test({
  name: 'hello',
  age: '',
});
console.log('-----', 'result', result);
