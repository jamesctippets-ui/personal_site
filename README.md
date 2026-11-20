# Personal site

My personal website: projects I'm working on, skills, references, and my resume, presented as a
retro desktop operating system with draggable windows, a taskbar and a Start menu.
Built with [Astro](https://astro.build) as a fully static site and deployed to GitHub Pages.

## Develop

Requires Node 22.23.4 or newer (see `.nvmrc`).

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # type check + static build into dist/
npm run preview  # serve the built site
```

## Editing content

All site content lives in `src/data/`. Edit those files; no page code changes are needed.

| File | What it controls |
| --- | --- |
| `profile.ts` | Name, title, tagline, about text, contact links, resume PDF |
| `projects.ts` | Project cards |
| `skills.ts` | Skill groups (home page and resume) |
| `references.ts` | Testimonials (empty array removes the References window) |
| `resume.ts` | Resume summary, experience, education, certifications |

To offer a downloadable resume, put the PDF in `public/` (e.g. `public/resume.pdf`) and set
`resumePdf: 'resume.pdf'` in `profile.ts`. The `/resume` page also prints cleanly to PDF.

## Deploying

Pushes to `main` build and deploy via `.github/workflows/deploy.yml`. One-time setup: in the
repository's **Settings → Pages**, set **Source** to **GitHub Actions**.
