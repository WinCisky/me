// @ts-check
import { defineConfig, envField } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://ssimo.dev',
  trailingSlash: 'never',
  output: 'server',
  adapter: cloudflare({
    // Cloudflare Workers can't load Sharp (native module) at runtime, and the
    // default `cloudflare-binding` service would route images through the
    // Cloudflare Images binding. Every image we render is pre-shrunk at build
    // time (see scripts/generate-assets.mjs and src/lib/preview-variants.ts)
    // and served as a plain <img> from /_astro. Passthrough is kept only as a
    // safety net so a stray future <Image> degrades instead of crashing.
    imageService: 'passthrough',
  }),
  // No sessions are used; skips the auto-provisioned SESSION KV namespace.
  session: false,
  env: {
    schema: {
      // Optional: raises the GitHub API rate limit from 60 to 5000 requests/hour.
      GITHUB_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
