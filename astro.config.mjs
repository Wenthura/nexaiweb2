import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build — static output (GitHub Pages), React islands for WebGL.
export default defineConfig({
  site: 'https://grahachara.com',
  trailingSlash: 'ignore',
  integrations: [react()],
  build: {
    // emit /features/birth-chart.html rather than /features/birth-chart/index.html
    // so existing URLs and the sitemap keep working on GitHub Pages
    format: 'file',
  },
});
