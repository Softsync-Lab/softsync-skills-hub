import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // While you work: `npm run api` in one terminal, `npm run dev` in another.
  // The browser app asks /cms and the small server (which holds the key) answers.
  server: { proxy: { '/cms': 'http://localhost:8787', '/sitemap.xml': 'http://localhost:8787', '/robots.txt': 'http://localhost:8787', '/llms.txt': 'http://localhost:8787' } },
});
