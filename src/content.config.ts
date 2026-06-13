import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const days = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/days' }),
  schema: z.object({
    day: z.number(),
    title: z.string(),
    subtitle: z.string(),
    phase: z.number(),
    concepts: z.array(z.string()),
  }),
});

const extras = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/extras' }),
  schema: z.object({
    day: z.number(),
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { days, extras };
