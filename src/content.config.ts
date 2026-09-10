import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
	schema: ({ image }) =>
		z.object({
			// Must match the GitHub repository name.
			repo: z.string(),
			title: z.string().optional(),
			summary: z.string().optional(),
			// Longer, keyword-tuned copy for <meta name="description"> and JSON-LD.
			// Falls back to `summary` when omitted.
			description: z.string().optional(),
			tags: z.array(z.string()).optional(),
			// Live demo URL, used as the JSON-LD `url`.
			homepage: z.string().url().optional(),
			// Emoji/text glyph or a path to an image, drawn inside the file icon.
			icon: z.union([image(), z.string()]).optional(),
			preview: image().optional(),
		}),
});

export const collections = { projects };
