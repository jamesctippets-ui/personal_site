// Projects shown on the home page. Order here is display order.

export type ProjectStatus = 'active' | 'complete' | 'paused';

export interface Project {
  name: string;
  summary: string;
  status: ProjectStatus;
  tags: string[];
  /** Live site or demo. */
  url?: string;
  /** Source code. Omit for private repositories. */
  repo?: string;
  /** Featured projects are shown first and larger. */
  featured?: boolean;
}

export const projects: Project[] = [
  {
    name: 'Cert Study Hub',
    summary:
      'An offline-installable study app for IT certification prep with 27 tracks (Azure and Microsoft, CCNA, ISC2, ITIL and more), 4,400+ spaced-repetition flashcards, practice exams, mini-courses and printable cheat sheets. Built iteratively with Claude, starting as a single artifact and growing into a Python-built PWA.',
    status: 'active',
    tags: ['Python', 'JavaScript', 'PWA', 'Claude'],
    repo: 'https://github.com/jamesctippets-ui/Study-App',
    featured: true,
  },
  {
    name: 'Personal AI Assistant',
    summary:
      'A personal assistant built on Claude and the Model Context Protocol. A custom MCP server connects Claude to Apple Notes, Reminders and Calendar through a Cloudflare relay, and runs daily briefings, a research queue, meal and chore planning, and scheduled tasks.',
    status: 'active',
    tags: ['MCP', 'Claude', 'Cloudflare', 'Automation'],
    featured: true,
  },
  {
    name: 'Cryptid Keepers',
    summary:
      'A goofy first-person co-op game where park rangers keep tourists from discovering that their national park is home to Bigfoot. The playable prototype builds its whole park from code, with tourist AI, photo-matching and an in-game economy.',
    status: 'active',
    tags: ['Unity', 'C#', 'Game design'],
  },
  {
    name: 'PawCards',
    summary:
      'A pet card-collecting app with card rarities, merging, a marketplace with bidding, achievements and coins, profiles, following and notifications.',
    status: 'active',
    tags: ['App design', 'Claude'],
  },
  {
    name: 'JamesOS (this site)',
    summary:
      'This website: a personal site styled as a retro desktop operating system, with draggable windows, a taskbar and a Start menu. Static Astro site with a hand-written window manager, deployed to GitHub Pages.',
    status: 'complete',
    tags: ['Astro', 'TypeScript', 'CSS'],
    repo: 'https://github.com/jamesctippets-ui/personal_site',
  },
];
