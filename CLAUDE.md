# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

James's personal/professional website: a hero + about section, project cards, skills, references, and an HTML resume page. It is a fully static Astro 7 site (no UI framework, no client-side JS beyond a print button) deployed to GitHub Pages.

## Commands

Node 22.23.4+ is required (Astro 7's `engines` field; `.nvmrc` pins major 22).

```sh
npm install
npm run dev      # dev server on http://localhost:4321
npm run check    # astro check: type checks .astro and .ts files (the only "lint"/test step)
npm run build    # astro check && astro build -> dist/
npm run preview  # serve dist/
```

There is no test suite. `npm run build` is the gate CI runs on every PR, so run it before pushing.

To reproduce the production GitHub Pages build (served under a sub-path) locally:

```sh
SITE_URL=https://jamesctippets-ui.github.io BASE_PATH=/personal_site npx astro build
```

## Architecture

**Content is data, pages are templates.** All copy lives in typed TypeScript modules in `src/data/` (`profile`, `projects`, `skills`, `references`, `resume`). Each file exports its interface alongside the data, and pages import them directly. Content edits should only touch `src/data/`; placeholder values are marked `TODO`.

Several data files feed more than one page, so check both when changing a shape:
- `skills.ts` renders as tag groups on the home page and as a `<dl>` on `/resume`.
- `profile.ts` drives the header brand, hero, footer links, resume header, and `<title>`/meta in `Base.astro`.
- `references.ts`: an empty array hides both the References section and its nav link (`Header.astro`).
- Optional fields hide their UI when empty: `profile.email`, `profile.resumePdf` (Download PDF button), `resume.certifications`, project `url`/`repo`.

**Base path handling is the main gotcha.** The site deploys to `https://jamesctippets-ui.github.io/personal_site/`, so `astro.config.mjs` reads `SITE_URL` and `BASE_PATH` from env (set in CI from `actions/configure-pages` outputs; defaults to `/` locally). Every internal link and every `/public` asset reference must go through `withBase()` from `src/utils.ts`. A hard-coded `href="/..."` works in `npm run dev` but breaks in production. Plain in-page anchors (`#projects`) are fine.

**Styling:** global design tokens (colors, radius, max width) are CSS custom properties in `src/styles/global.css`, with dark mode via `prefers-color-scheme`. Shared utility classes (`.container`, `.section`, `.section-title`, `.btn`, `.btn-secondary`, `.tag`) also live there; everything else is component-scoped `<style>`. `resume.astro` has an `@media print` block that turns the page into a clean printable resume, and the header/footer hide themselves in print, so preserve that when editing the resume layout.

The `@/*` import alias maps to `src/*` (tsconfig `paths`). `astro.config.mjs` deliberately has no `// @ts-check`, because `astro check` would then require `@types/node` for `process.env`.

## Deployment

`.github/workflows/deploy.yml` builds on every push to `main`, every PR, and manual dispatch. Only non-PR runs upload the artifact and deploy. GitHub Pages must have **Source: GitHub Actions** in repo settings. If a custom domain is added, add `public/CNAME`; `configure-pages` will then report base path `/` automatically.
