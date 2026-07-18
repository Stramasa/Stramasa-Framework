// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://spiritual.stramasa.com',
  integrations: [sitemap()],
  output: 'static',
});
