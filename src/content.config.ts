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

const checklisty = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/checklisty' }),
  schema: z.object({
    groups: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        items: z.array(
          z.object({
            id: z.string(),
            text: z.string(),
            // Množství na jednu osobu. Aplikace ho přepočítá podle počtu osob.
            perPerson: z.number().positive().optional(),
            unit: z.string().optional(),
          }),
        ),
      }),
    ),
  }),
});

export const collections = { kapitoly, checklisty };
