import { defineConfig } from 'astro/config';

// SITE_URL and BASE_PATH are set by the GitHub Pages workflow
// (.github/workflows/deploy.yml). Locally they fall back to a root-served site.
// If you move to a custom domain, set BASE_PATH to "/" in the workflow.
export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  base: process.env.BASE_PATH ?? '/',
  trailingSlash: 'ignore',
  // Content Security Policy, emitted by Astro as a <meta> tag on every page with
  // hashes for its own inline scripts and styles. GitHub Pages can't send custom
  // headers, so this meta tag is the site's CSP. If you add a third-party script,
  // font, image host or form endpoint, allow it here or it will be blocked.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://api.web3forms.com",
        "form-action 'self' https://api.web3forms.com",
        "base-uri 'self'",
        "object-src 'none'",
      ],
      scriptDirective: { resources: ["'self'"] },
      styleDirective: { resources: ["'self'", 'https://fonts.googleapis.com'] },
    },
  },
});
