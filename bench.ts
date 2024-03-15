import {run, bench, group} from 'mitata';
import * as yup from 'yup';
import {z} from 'zod';
import {d} from './src/desy.ts';

function runSeveralTimes(cb, times = 100) {
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

  const people = Array.from({length: 100}, () => {
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

// function createCompex() {
//   return {
//     data: {
//       valid: createPeople(true),
//       error: createPeople(false),
//     },
//     validators: {
//       zod: () =>
//         z.array(
//           z.object({
//             type: z.literal('person'),
//             hair: z.enum(['blue', 'brown']),
//             active: z.boolean(),
//             name: z.string(),
//             age: z.number().int(),
//             hobbies: z.array(z.string()),
//             address: z.object({
//               street: z.string(),
//               zip: z.string(),
//               country: z.string(),
//             }),
//           })
//         ),
//       desy: () =>
//         d.array(
//           d.object({
//             type: d.string().oneOf(['person']),
//             hair: d.string().oneOf(['blue', 'brown']),
//             active: d.boolean(),
//             name: d.string(),
//             age: d.number().int(),
//             hobbies: d.array(d.string()),
//             address: d.object({
//               street: d.string(),
//               zip: d.string(),
//               country: d.string(),
//             }),
//           })
//         ),
//     },
//   };
// }

// const complex = createCompex();
// group('complex with error', () => {
//   bench('zod', () => {
//     runSeveralTimes(() => {
//       const schema = complex.validators.zod();

//       schema.safeParse(complex.data.error);
//     });
//   });
//   bench('desy', () => {
//     runSeveralTimes(() => {
//       const schema = complex.validators.desy();

//       schema.validate(complex.data.error);
//     });
//   });
// });

// group('complex without error', () => {
//   bench('zod', () => {
//     runSeveralTimes(() => {
//       const schema = complex.validators.zod();

//       schema.safeParse(complex.data.valid);
//     });
//   });
//   bench('desy', () => {
//     runSeveralTimes(() => {
//       const schema = complex.validators.desy();

//       schema.validate(complex.data.valid);
//     });
//   });
// });

// group('object with error', () => {
//   const user = {
//     name: 'aleksey',
//     age: 24,
//     valid: 'ERROR',
//     address: {
//       city: 'london',
//       street: 'lenina',
//     },
//     skills: ['code', 'films'],
//   };

//   bench('zod', () => {
//     runSeveralTimes(() => {
//       const schema = z.object({
//         name: z.string(),
//         age: z.number().int(),
//         valid: z.boolean(),
//         address: z.object({
//           city: z.string(),
//           street: z.string(),
//         }),
//         skills: z.array(z.string()),
//       });

//       schema.safeParse(user);
//     });
//   });

//   bench('desy', () => {
//     runSeveralTimes(() => {
//       const schema = d.object({
//         name: d.string(),
//         age: d.number().int(),
//         valid: d.boolean(),
//         address: d.object({
//           city: d.string(),
//           street: d.string(),
//         }),
//         skills: d.array(d.string()),
//       });

//       // @ts-ignore
//       schema.validate(user);
//     });
//   });
// });

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
      schema.isValidSync('hello');
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
