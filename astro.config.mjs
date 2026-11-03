// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Static site for Cloudflare Pages. Every page gets its own address, e.g. /kids-martial-arts/
export default defineConfig({
  site: 'https://www.mystarma.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
