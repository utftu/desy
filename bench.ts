import {run, bench, group} from 'mitata';
import * as yup from 'yup';
import {z} from 'zod';
import {d} from './src/desy.ts';

function runSeveralTimes(cb: () => void, times = 1) {
  for (let i = 0; i < times; i++) {
    cb();
  }
}

function createPeople(valid = true) {
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

  const people = Array.from({length: 1}, () => {
    return {
      type: 'person',
      hair: i % 2 ? 'blue' : 'brown',
      active: !!(i % 2),
      name: str(),
      age: num(),
      address: {
        street: str(),
        zip: str(),
        country: str(),
      },
      hobbies: array(str),
    };
  });

  return people;
}

group('complex', () => {
  const people = createPeople();
  bench('yup', () => {
    runSeveralTimes(() => {
      const schema = yup.object().shape({
        type: yup.string().oneOf(['person']).required(),
        hair: yup.string().oneOf(['blue', 'brown']).required(),
        active: yup.boolean().required(),
        name: yup.string().required(),
        age: yup.number().integer().required(),
        hobbies: yup.array().of(yup.string()).required(),
        address: yup
          .object()
          .shape({
            street: yup.string().required(),
            zip: yup.string().required(),
            country: yup.string().required(),
          })
          .required(),
      });
      schema.isValidSync(people, {abortEarly: true});
    });
  });
  bench('zod', () => {
    runSeveralTimes(() => {
      const schema = z.array(
        z.object({
          type: z.literal('person'),
          hair: z.enum(['blue', 'brown']),
          active: z.boolean(),
          name: z.string(),
          age: z.number().int(),
          hobbies: z.array(z.string()),
          address: z.object({
            street: z.string(),
            zip: z.string(),
            country: z.string(),
          }),
        }),
      );

      schema.parse(people);
    });
  });
  bench('desy', () => {
    runSeveralTimes(() => {
      const schema = d.array(
        d.object({
          type: d.string().oneOf(['person']),
          hair: d.string().oneOf(['blue', 'brown']),
          active: d.boolean(),
          name: d.string(),
          age: d.number().int(),
          hobbies: d.array(d.string()),
          address: d.object({
            street: d.string(),
            zip: d.string(),
            country: d.string(),
          }),
        }),
      );
      schema.validate(people);
    });
  });
});

group('string', () => {
  bench('yup', () => {
    runSeveralTimes(() => {
      const schema = yup.string().required();
      schema.isValidSync('hello', {abortEarly: true});
    });
  });
  bench('desy', () => {
    runSeveralTimes(() => {
      const schema = d.string();
      schema.validate('hello');
    });
  });
  bench('zod', () => {
    runSeveralTimes(() => {
      const schema = z.string();
      schema.parse('hello');
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
