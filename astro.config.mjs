// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';

import deno from '@deno/astro-adapter';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://ssimo.dev',
  trailingSlash: 'never',
  output: 'server',
  adapter: deno(),
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  },
  // Deno Deploy can't load Sharp (native module) at runtime, so the on-demand
  // /_image endpoint 500s for any <Image> Astro hasn't already resolved.
  // Every image we render is pre-shrunk at build time (see
  // scripts/generate-assets.mjs and src/lib/preview-variants.ts) and served
  // as a plain <img> from /_astro. This is kept only as a safety net so a
  // stray future <Image> degrades to passthrough instead of crashing.
  image: {
    service: passthroughImageService(),
  },
  vite: {
    plugins: [tailwindcss()]
  }
});