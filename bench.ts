import { run, bench, group, baseline } from 'mitata';
import {Mixed} from './src/mixed/mixed.ts';
import * as yup from 'yup'

bench('yup', () => {
  yup.string().required().isValidSync('hello')
});
bench('ssy', () => {
  Mixed.new().string().test('hello')
});

await run({
  avg: true, // enable/disable avg column (default: true)
  json: false, // enable/disable json output (default: false)
  colors: true, // enable/disable colors (default: true)
  min_max: true, // enable/disable min/max column (default: true)
  collect: false, // enable/disable collecting returned values into an array during the benchmark (default: false)
  percentiles: false, // enable/disable percentiles column (default: true)
});