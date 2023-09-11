import {run, bench, group} from 'mitata';
import * as yup from 'yup';
import {z} from 'zod';
import {d} from '../src/desy.ts';
import {runSeveralTimes} from './common.ts';

function createData(valid: boolean) {
  let i = 0;

  function num() {
    return ++i;
  }

  function str() {
    return (++i % 100).toString(16);
  }

  function array<T>(fn: () => T): T[] {
    return Array.from({length: ++i % 10}, () => fn());
  }

  const people = Array.from({length: 100}, () => {
    return {
      type: 'person',
      hair: i % 2 ? 'blue' : 'brown',
      active: !!(i % 2),
      hobbies: valid ? array(str) : str(),
      name: str(),
      age: num(),
      address: {
        street: str(),
        zip: str(),
        country: str(),
      },
    };
  });

  return people;
}

function createCompexBench() {
  return {
    data: {
      valid: createData(true),
      error: createData(false),
    },
    validators: {
      yup: () =>
        yup.object().shape({
          type: yup.string().oneOf(['person']).required(),
          hair: yup.string().oneOf(['blue', 'brown']).required(),
          active: yup.boolean().required(),
          hobbies: yup.array().of(yup.string()).required(),
          name: yup.string().required(),
          age: yup.number().integer().required(),
          address: yup
            .object()
            .shape({
              street: yup.string().required(),
              zip: yup.string().required(),
              country: yup.string().required(),
            })
            .required(),
        }),
      zod: () =>
        z.array(
          z.object({
            type: z.literal('person'),
            hair: z.enum(['blue', 'brown']),
            active: z.boolean(),
            hobbies: z.array(z.string()),
            name: z.string(),
            age: z.number().int(),
            address: z.object({
              street: z.string(),
              zip: z.string(),
              country: z.string(),
            }),
          }),
        ),
      desy: () =>
        d.array(
          d.object({
            type: d.string().oneOf(['person']),
            hair: d.string().oneOf(['blue', 'brown']),
            active: d.boolean(),
            hobbies: d.array(d.string()),
            name: d.string(),
            age: d.number().int(),
            address: d.object({
              street: d.string(),
              zip: d.string(),
              country: d.string(),
            }),
          }),
        ),
    },
  };
}

const complexBench = createCompexBench();
group('complex with error', () => {
  bench('desy', () => {
    runSeveralTimes(() => {
      const schema = complexBench.validators.yup();

      schema.isValidSync(complexBench.data.error);
    });
  });
  bench('zod', () => {
    runSeveralTimes(() => {
      const schema = complexBench.validators.zod();

      schema.safeParse(complexBench.data.error);
    });
  });
  bench('desy', () => {
    runSeveralTimes(() => {
      const schema = complexBench.validators.desy();

      schema.validate(complexBench.data.error);
    });
  });
});

group('complex without error', () => {
  bench('yup', () => {
    runSeveralTimes(() => {
      const schema = complexBench.validators.yup();

      schema.isValidSync(complexBench.data.valid);
    });
  });
  bench('zod', () => {
    runSeveralTimes(() => {
      const schema = complexBench.validators.zod();

      schema.safeParse(complexBench.data.valid);
    });
  });
  bench('desy', () => {
    runSeveralTimes(() => {
      const schema = complexBench.validators.desy();

      schema.validate(complexBench.data.valid);
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
