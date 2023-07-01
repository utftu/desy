import {run, bench, group, baseline} from 'mitata';
import {mixed} from './src/mixed/mixed.ts';
import * as yup from 'yup';
import {z} from 'zod';
import Ajv from 'ajv';

function runSeveralTimes(cb, times = 10000) {
  for (let i = 0; i < times; i++) {
    cb();
  }
}

group('string', () => {
  bench('yup', () => {
    const schema = yup.string().required();
    const validate = (value) => schema.isValidSync(value);
    runSeveralTimes(() => {
      validate('hello');
    });
  });
  bench('ssy', () => {
    const schema = mixed().string();
    const validate = (value) => schema.test(value);
    runSeveralTimes(() => {
      validate('hello');
    });
  });
  bench('zod', () => {
    const schema = z.string();
    const validate = (value) => schema.parse(value);
    runSeveralTimes(() => {
      validate('hello');
    });
  });
  bench('ajv', () => {
    const ajv = new Ajv();
    const schema = ajv.compile({
      type: 'string',
    });
    const validate = (value) => schema(value);

    runSeveralTimes(() => {
      validate('hello');
    });
  });
});

await run({
  avg: true, // enable/disable avg column (default: true)
  json: false, // enable/disable json output (default: false)
  colors: true, // enable/disable colors (default: true)
  min_max: true, // enable/disable min/max column (default: true)
  collect: false, // enable/disable collecting returned values into an array during the benchmark (default: false)
  percentiles: false, // enable/disable percentiles column (default: true)
});
