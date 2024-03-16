import $ from 'mol_data_all';
import {run, bench, group} from 'mitata';
import {d} from '../../src/desy.ts';
import {z} from 'zod';

const {
  $mol_data_number: Numb,
  $mol_data_string: Str,
  $mol_data_boolean: Bool,
  $mol_data_record: Rec,
  $mol_data_array: List,
} = $;

function runSeveralTimes(cb: () => void, times = 300) {
  for (let i = 0; i < times; i++) {
    cb();
  }
}

const validShape = {
  number: 42,
  negNumber: -1,
  maxNumber: 999999,
  string: 'hello',
  longString: new Array(999).fill('long').join(''),
  boolean: true,
  deeplyNested: [{foo: 'hello', num: 42, bool: false}],
};

const errorShape = {
  number: 42,
  negNumber: -1,
  maxNumber: 999999,
  string: 42, // !error
  longString: new Array(999).fill('long').join(''),
  boolean: true,
  deeplyNested: [{foo: 'hello', num: 42, bool: false}],
};

const createMolSchema = () =>
  Rec({
    number: Numb,
    negNumber: Numb,
    maxNumber: Numb,
    string: Str,
    longString: Str,
    boolean: Bool,
    deeplyNested: List(
      Rec({
        foo: Str,
        num: Numb,
        bool: Bool,
      }),
    ),
  });

const createDesySchema = () =>
  d.object({
    number: d.number(),
    negNumber: d.number(),
    maxNumber: d.number(),
    string: d.string(),
    longString: d.string(),
    boolean: d.boolean(),
    deeplyNested: d.array(
      d.object({
        foo: d.string(),
        num: d.number(),
        bool: d.boolean(),
      }),
    ),
  });

const createZodSchema = () =>
  z.object({
    number: z.number(),
    negNumber: z.number(),
    maxNumber: z.number(),
    string: z.string(),
    longString: z.string(),
    boolean: z.boolean(),
    deeplyNested: z.array(
      z.object({
        foo: z.string(),
        num: z.number(),
        bool: z.boolean(),
      }),
    ),
  });

group('valid', () => {
  bench('zod', () => {
    runSeveralTimes(() => {
      const schemaZod = createZodSchema();
      try {
        schemaZod.parse(validShape);
      } catch {}
    });
  });
  bench('desy', () => {
    runSeveralTimes(() => {
      const schemaDesy = createDesySchema();
      schemaDesy.validate(validShape);
    });
  });
  bench('mol', () => {
    runSeveralTimes(() => {
      const schemaMol = createMolSchema();
      try {
        schemaMol(validShape);
      } catch {}
    });
  });
});

group('error', () => {
  bench('mol', () => {
    runSeveralTimes(() => {
      const schemaMol = createMolSchema();

      try {
        schemaMol(errorShape as any);
      } catch {}
    });
  });
  bench('desy', () => {
    runSeveralTimes(() => {
      const schemaDesy = createDesySchema();
      schemaDesy.validate(errorShape);
    });
  });
  bench('zod', () => {
    runSeveralTimes(() => {
      const schemaZod = createZodSchema();
      try {
        schemaZod.parse(errorShape);
      } catch {}
    });
  });
});

// group('valid with try for mol', () => {
//   bench('mol', () => {
//     runSeveralTimes(() => {
//       const schemaMol = createMolSchema();

//       try {
//         schemaMol(validShape);
//       } catch {}
//     });
//   });
//   bench('desy', () => {
//     runSeveralTimes(() => {
//       const schemaDesy = createDesySchema();
//       schemaDesy.validate(validShape);
//     });
//   });
// });

await run({
  avg: true, // enable/disable avg column (default: true)
  json: false, // enable/disable json output (default: false)
  colors: true, // enable/disable colors (default: true)
  min_max: true, // enable/disable min/max column (default: true)
  collect: false, // enable/disable collecting returned values into an array during the benchmark (default: false)
  percentiles: false, // enable/disable percentiles column (default: true)
});
