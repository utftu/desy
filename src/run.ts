import {MixedDesy} from './mixed/mixed.ts';

const a = MixedDesy.new().object({
  name: MixedDesy.new().string(),
  age: MixedDesy.new().string(),
});
const result = a.validate({
  name: 'hello',
  age: '',
});
console.log('-----', 'result', result);
