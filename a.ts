import {z} from 'zod';
import {d, InferDesy} from './src/desy.ts';

const zSchema = z.object({
  name: z.string(),
  age: z.number(),
  chuldren: z.array(z.string()),
});

const dSchema = d.object({
  name: d.string(),
  age: d.number(),
  chuldren: d.array(d.string()),
});

type Z = z.infer<typeof zSchema>;

type D = InferDesy<typeof dSchema>;

const zValue = zSchema.parse(null as any);
const dValue = dSchema.validateObj(null as any);
