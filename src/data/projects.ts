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
    name: 'Project One', // TODO
    summary:
      'TODO: What the project does, who it is for, and what you built. Two sentences is plenty.',
    status: 'active',
    tags: ['TypeScript', 'Web'],
    repo: 'https://github.com/jamesctippets-ui',
    featured: true,
  },
  {
    name: 'Project Two', // TODO
    summary: 'TODO: Describe the problem and your role in solving it.',
    status: 'active',
    tags: ['Python'],
  },
  {
    name: 'Project Three', // TODO
    summary: 'TODO: A finished project worth showing off.',
    status: 'complete',
    tags: ['Cloud'],
  },
];
