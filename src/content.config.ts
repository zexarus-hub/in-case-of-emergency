import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const kapitoly = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/kapitoly' }),
  schema: z.object({
    title: z.string(),
    // Pořadí v seznamu návodů.
    order: z.number().optional(),
    // Každá kapitola musí uvádět aspoň jeden zdroj.
    sources: z.array(z.object({ name: z.string(), url: z.string().optional() })).min(1),
  }),
});

export const collections = { kapitoly };
