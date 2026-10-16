import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// Pages are made when they are asked for, so a post shows up the moment it is
// published. (Prefer a static site? Use `output: 'static'` and rebuild when you publish.)
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  vite: { plugins: [tailwindcss()] },
});
