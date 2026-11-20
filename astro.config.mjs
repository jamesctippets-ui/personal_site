import { defineConfig } from 'astro/config';

// SITE_URL and BASE_PATH are set by the GitHub Pages workflow
// (.github/workflows/deploy.yml). Locally they fall back to a root-served site.
// If you move to a custom domain, set BASE_PATH to "/" in the workflow.
export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  base: process.env.BASE_PATH ?? '/',
  trailingSlash: 'ignore',
});
