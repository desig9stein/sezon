// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const NOT_FOUND_PATH = '/404';
const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://sezon.example';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  integrations: [sitemap({ filter: (page) => !page.endsWith(NOT_FOUND_PATH) })],
});
