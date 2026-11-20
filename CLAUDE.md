# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

James's personal/professional website, styled as an original early-PC command-line OS ("JamesOS"). The home page is a text-mode terminal. Visitors can type commands at a `C:\JAMES>` prompt (HELP, ABOUT, PROJECTS, SKILLS, RESUME, CONSULTING, CONTACT, DIR, TYPE, COLOR, EXIT…). They can also click everything: the menu bar, the F-key bar, and command links inside the output. `/resume` is a standalone printable resume. The whole thing is a fully static Astro 7 site with no UI framework, deployed to GitHub Pages.

Keep it *original*: a generic text-mode/phosphor-terminal aesthetic with our own wording. Don't copy real OS boot screens, error strings, logos or product names.

## Commands

Node 22.23.4+ is required (Astro 7's `engines` field; `.nvmrc` pins major 22).

```sh
npm install
npm run dev      # dev server on http://localhost:4321
npm run check    # astro check: type checks .astro and .ts files (the only "lint"/test step)
npm run build    # astro check && astro build -> dist/
npm run preview  # serve dist/
```

There is no test suite. `npm run build` is the gate CI runs on every PR. Terminal behavior (typed commands, Tab completion, history, F-keys, click-to-run, hash links, boot/halt) can only be verified in a browser. After touching `src/scripts/*` or `src/pages/index.astro`, drive it with Playwright against `npm run preview`, and check three cases: desktop width, a phone viewport, and `javaScriptEnabled: false`. The boot animation runs once per tab (sessionStorage), so wait ~1.5 s on a fresh page before asserting output.

To reproduce the production GitHub Pages build (served under a sub-path) locally:

```sh
SITE_URL=https://jamesctippets-ui.github.io BASE_PATH=/personal_site npx astro build
```

## Architecture

**Content is data; screens are components; the terminal clones screens.**
- `src/data/*.ts`: all copy, as typed modules. They are `profile` (including the `consulting` offer), `projects`, `skills`, `homelab`, `spotlight` (museum), `references`, `resume` and `inquiry` (the contact form's services and email template). Content edits should only touch this folder.
- `src/components/screens/*.astro`: the output of each screen command (About, Projects, Skills, ResumeText, Consulting, Contact, References, Help).
- `src/pages/index.astro`: renders every screen once as `<section data-screen="id">` inside `#screens`, plus the menu bar, prompt form, F-key bar and halt overlay.
- `src/scripts/terminal.ts`: the runtime. On load it detaches `#screens` and keeps the sections as templates. Running a command echoes `C:\JAMES>cmd` and appends a clone of that screen (ids stripped) to `#output`, or runs a builtin. Any element with `data-cmd="..."` anywhere on the page runs that command on click. That is how the menu, the F-keys and the in-text links work, so new clickable things just need `data-cmd` (and an `href="#cmd"` for no-JS).
- `src/scripts/commands.ts`: the DOM-free command table (screen commands, builtins, aliases, the fake `DIR` file list, HELP rows, Tab completions). It is imported both at build time (Help screen) and at runtime. **To add a screen:** create the component, add its id to `SCREEN_COMMANDS`, render it in the `screens` list in `index.astro`, and optionally add a menu entry, a `FILES` entry and a help row.

**Contact form:** `screens/Consulting.astro` holds the inquiry form, and `src/scripts/inquiry.ts` handles submit (delegated on `document`, because the form is cloned). The form fills `inquiry.subjectTemplate`/`bodyTemplate` and POSTs to Web3Forms when `inquiry.web3formsKey` is set. Web3Forms keys are public by design. While the key is empty, the form opens a prefilled `mailto:` instead. Cloned markup must not rely on `id`s, so labels wrap their inputs.

**Alternate looks** share the same `src/data` content. They are `/modern` (a clean, conventional site, reachable from the MODERN command and the "Modern site" link in the menu bar), `/2000` (an early-2000s desktop called "JamesOS Horizon", opened by the `2000` easter egg) and `/mac` (a Mac-style desktop called "JamesOS Orchard", opened by the `apple` easter egg). They use `layouts/Plain.astro`, which has no terminal CSS. `components/plain/sections.ts` lists the sections in order, plus the `looks` used by `LookSwitcher`, and `components/plain/Content.astro` renders each section body with `pc-` class names that each page styles in its own `<style is:global>` (scoped under `body.modern`, `body.y2k` or `body.orchard`). The two desktops use `components/desk/DeskWindow.astro` and the window manager in `src/scripts/desk.ts`, which drives `[data-window]`, `[data-open]` openers, `.desk-icon`, `#tasks`, `#start-menu` and `#clock`. All art is original: no real OS logos, wallpapers, icons or sounds. A new section needs an entry in `sections.ts` and a branch in `Content.astro`. The inquiry form there also uses `data-inquiry`, so `inquiry.ts` handles it.

**PLAY** opens BUG SWAT (`src/scripts/game.ts`, loaded on demand), an original canvas arcade game drawn in the current phosphor colors. It captures keys on `window` in the capture phase, so the terminal's listeners don't see them while it is open. The high score is saved in `localStorage` key `jos-bugswat-best`.

**Easter eggs** live in `easterEgg()` in `terminal.ts`, plus a Konami-code listener. They are deliberately left out of HELP. The `secrets` command reports how many of `EGGS` the visitor has found, so add new ones to that list too.

**Progressive enhancement is load-bearing.** `Base.astro` adds `html.js` in an inline head script, and restores the saved phosphor theme from the same script to avoid a flash. Without JS, `#screens` *is* the page. It is a scrolling sequence of `C:\JAMES>type x` blocks, menu links are `#id` anchors, and the prompt and F-key bar are hidden. Terminal-mode layout (fixed-height flex column with a scrolling `#output`) is scoped under `html.js`. Keep it that way so crawlers and no-JS visitors see all content.

Data files feed several places, so check all of them when changing a shape:
- `skills.ts`: the SKILLS screen, the terminal resume (`ResumeText`) and the paper resume (`ResumeDoc`).
- `resume.ts` is rendered twice. It appears as `screens/ResumeText.astro` (terminal) and as `components/ResumeDoc.astro` (paper, `/resume`, print).
- `profile.ts`: About, Contact, the resume headers, `<title>`/meta, and the GITHUB/LINKEDIN/EMAIL commands, which look links up by `label`.
- `profile.consulting.open: false` removes the CONSULTING screen, its menu item, its file and its help row. An empty `references` array does the same for REFERENCES.
- Optional fields hide their UI when empty. They are `profile.email`, `profile.resumePdf`, `resume.education`, `resume.certifications`, cert `issuer`/`year`, role `start` (shown as just "Present"), and project `url`/`repo`.

**Theme:** tokens are in `src/styles/global.css` and are limited to `--bg`, `--fg`, `--dim`, `--bright` and `--glow`. They are overridden by `html[data-theme="amber"|"white"]` (the COLOR command; saved to `localStorage` key `jos-theme`). Use those tokens plus the shared `.frame` / `.frame-title` (double-line box with a title), `.inv` (inverse video), `.rule`, `.dim` and `.bright` instead of new colors. The font is VT323 from Google Fonts, with a monospace fallback. `ResumeDoc` deliberately ignores the terminal look (serif, dark-on-paper), and the `@media print` blocks strip all chrome, so keep print output plain.

**Base path is the main deploy gotcha.** The site is served from `/personal_site/`, so `astro.config.mjs` reads `SITE_URL`/`BASE_PATH` from env (set in CI from `actions/configure-pages`; defaults to `/` locally). Every internal page link and `/public` asset must go through `withBase()` from `src/utils.ts`. In client code use `import.meta.env.BASE_URL` (see the PRINT command). Hash-only links (`#projects`) are fine.

The `@/*` import alias maps to `src/*`. `astro.config.mjs` deliberately has no `// @ts-check`, because `astro check` would then require `@types/node` for `process.env`.

## Deployment

`.github/workflows/deploy.yml` builds on every push to `main`, every PR, and manual dispatch. Only non-PR runs upload and deploy. GitHub Pages must have **Source: GitHub Actions**. If it's left on "Deploy from a branch", a legacy `pages build and deployment` run also fires on each push and fails, which is noise but not ours. If a custom domain is added, add `public/CNAME`; `configure-pages` will then report base path `/`.
