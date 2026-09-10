// @ts-check
import { defineConfig } from 'astro/config';

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
  vite: {
    plugins: [tailwindcss()]
  }
});