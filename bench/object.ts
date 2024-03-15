import {run, bench, group} from 'mitata';
import {runSeveralTimes} from './common.ts';
import * as yup from 'yup';
import {z} from 'zod';
import {d} from '../src/desy.ts';

function createData(valid: boolean) {
  return {
    name: 'aleksey',
    age: 24,
    valid: valid ? true : 'ERROR',
    address: {
      city: 'london',
      street: 'lenina',
    },
    skills: ['code', 'films'],
  };
}
function createObjectBench() {
  return {
    data: {
      valid: createData(true),
      error: createData(false),
    },
    validators: {
      yup: () =>
        yup
          .object()
          .shape({
            name: yup.string().required(),
            age: yup.number().integer().required(),
            valid: yup.boolean().required(),
            address: yup
              .object()
              .shape({
                city: yup.string().required(),
                street: yup.string().required(),
              })
              .required(),
            skills: yup.array().of(yup.string()).required(),
          })
          .required(),
      zod: () =>
        z.object({
          name: z.string(),
          age: z.number().int(),
          valid: z.boolean(),
          address: z.object({
            city: z.string(),
            street: z.string(),
          }),
          skills: z.array(z.string()),
        }),
      desy: () =>
        d.object({
          name: d.string(),
          age: d.number().int(),
          valid: d.boolean(),
          address: d.object({
            city: d.string(),
            street: d.string(),
          }),
          skills: d.array(d.string()),
        }),
    },
  };
}

const objectBench = createObjectBench();
group('object with error', () => {
  bench('yup', () => {
    runSeveralTimes(() => {
      const schema = objectBench.validators.yup();

      schema.isValidSync(objectBench.data.error, {  : true});
    });
  });

  bench('zod', () => {
    runSeveralTimes(() => {
      const schema = objectBench.validators.zod();

      schema.safeParse(objectBench.data.error);
    });
  });

  bench('desy', () => {
    runSeveralTimes(() => {
      const schema = objectBench.validators.desy();

      schema.validate(objectBench.data.error);
    });
  });
});

group('object without error', () => {
  bench('yup', () => {
    runSeveralTimes(() => {
      const schema = objectBench.validators.yup();

      schema.isValidSync(objectBench.data.valid);
    });
  });

  bench('zod', () => {
    runSeveralTimes(() => {
      const schema = objectBench.validators.zod();

      schema.safeParse(objectBench.data.valid);
    });
  });

  bench('desy', () => {
    runSeveralTimes(() => {
      const schema = objectBench.validators.desy();

      schema.validate(objectBench.data.valid);
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
