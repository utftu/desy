import {Mixed} from './src/mixed/mixed.ts';
import * as yup from 'npm:yup'

Deno.bench("yup", () => {
  // 'hello + world'
  yup.string().required().isValidSync('hello')
});

Deno.bench("ssy", () => {
  // 2 + 10
  Mixed.new().string().test('hello')
});