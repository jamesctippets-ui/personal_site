# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

James's personal/professional website, styled as an original late-90s desktop operating system ("JamesOS"). The home page is a desktop with icons, draggable windows (About Me, Projects, Skills, References, Resume.doc), a taskbar, a Start menu, and a joke "Shut Down" screen. `/resume` is a standalone printable resume. The whole thing is a fully static Astro 7 site with no UI framework, deployed to GitHub Pages.

The look must stay *original*. Use the generic retro genre (bevels, teal desktop, navy title bars, pixel icons), but no real OS logos, icon art, sounds, fonts shipped as assets, or product names. Icons are hand-drawn SVG in `src/components/Icon.astro`.

## Commands

Node 22.23.4+ is required (Astro 7's `engines` field; `.nvmrc` pins major 22).

```sh
npm install
npm run dev      # dev server on http://localhost:4321
npm run check    # astro check: type checks .astro and .ts files (the only "lint"/test step)
npm run build    # astro check && astro build -> dist/
npm run preview  # serve dist/
```

There is no test suite. `npm run build` is the gate CI runs on every PR. Window behavior (open/drag/minimize/taskbar/start menu/hash links) can only be verified in a browser, so check it with Playwright against `npm run preview` after touching `src/scripts/desktop.ts` or `Window.astro`. Check desktop width, a phone viewport, and `javaScriptEnabled: false`.

To reproduce the production GitHub Pages build (served under a sub-path) locally:

```sh
SITE_URL=https://jamesctippets-ui.github.io BASE_PATH=/personal_site npx astro build
```

## Architecture

**Content is data; window contents are components; the desktop is one page.**
- `src/data/*.ts`: all copy, as typed modules (`profile`, `projects`, `skills`, `references`, `resume`). Placeholder values are marked `TODO`. Content edits should only touch this folder.
- `src/components/content/*.astro`: what goes *inside* each window. `ResumeDoc.astro` is shared by the Resume window and `/resume`.
- `src/components/Window.astro`: window chrome (title bar, min/max/close, optional toolbar slot, status bar, `surface="face"` for grey dialog-style bodies).
- `src/pages/index.astro`: the desktop. It declares the `shortcuts` list (icons and Start menu entries), renders every window, the taskbar, the Start menu and the shutdown overlay. To add a window, add a `<Window id="...">` here and a shortcut whose `open` matches the id.
- `src/scripts/desktop.ts`: the window manager. It is vanilla TS. State lives in DOM classes (`is-open`, `is-active`, `is-maximized`) and inline `left/top/width/height/z-index`, and taskbar buttons are created on demand. The header comment documents the interaction rules (icons: click selects, double-click/Enter/tap opens; URL hash `#id` opens that window; at ≤720px windows are always maximized and don't drag).

**Progressive enhancement is load-bearing.** `Base.astro` adds `html.js` in an inline head script. All floating-window/taskbar CSS is scoped under `html.js`. Without JS, windows render as a normal stacked page, icons are plain `#id` anchor links, and the taskbar/Start menu are hidden. Keep new desktop styling under `:global(html.js)` and keep icons/menu items as real links so the no-JS and crawler view still works.

Data files feed several places, so check all of them when changing a shape:
- `skills.ts`: the Skills window and the resume's skills list.
- `profile.ts`: About window, Start menu links, the GitHub desktop icon (found by `label === 'GitHub'`), resume header, `<title>`/meta, and the Start menu banner name (first name + "OS").
- `references.ts`: an empty array removes the References window, icon and menu entry.
- Optional fields hide their UI when empty: `profile.email`, `profile.resumePdf` (Download PDF buttons), `resume.certifications`, project `url`/`repo`.

**Base path handling is the main deploy gotcha.** The site is served from `/personal_site/`, so `astro.config.mjs` reads `SITE_URL`/`BASE_PATH` from env (set in CI from `actions/configure-pages`; defaults to `/` locally). Every internal page link and `/public` asset must go through `withBase()` from `src/utils.ts`. Hash-only links (`#projects`) on the home page are fine as-is.

**Styling:** theme tokens and the bevel recipes (`--raised`, `--pressed`, `--sunken` box-shadows) live in `src/styles/global.css`, along with shared classes (`.btn`, `.groupbox`, `.chip`, `.raised`, `.sunken`). Build new chrome from those rather than borders. The resume deliberately switches to a serif "paper" style, and `@media print` blocks in `ResumeDoc.astro` and `resume.astro` strip all OS chrome, so keep print output plain.

The `@/*` import alias maps to `src/*`. `astro.config.mjs` deliberately has no `// @ts-check`, because `astro check` would then require `@types/node` for `process.env`.

## Deployment

`.github/workflows/deploy.yml` builds on every push to `main`, every PR, and manual dispatch. Only non-PR runs upload and deploy. GitHub Pages must have **Source: GitHub Actions** in repo settings. If a custom domain is added, add `public/CNAME`; `configure-pages` will then report base path `/`.
