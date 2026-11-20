// Command table for the JamesOS terminal. Shared by the HELP screen (rendered at
// build time) and the runtime in terminal.ts, so keep this module DOM-free.
import { profile } from '@/data/profile';
import { references } from '@/data/references';

/** Commands whose output is a pre-rendered screen (<section data-screen="...">). */
export const SCREEN_COMMANDS = [
  'help',
  'about',
  'projects',
  'skills',
  'resume',
  'contact',
  ...(profile.consulting.open ? ['consulting'] : []),
  ...(references.length ? ['references'] : []),
] as const;

/** Commands handled in code by terminal.ts. */
export const BUILTIN_COMMANDS = [
  'dir',
  'type',
  'cls',
  'color',
  'date',
  'ver',
  'whoami',
  'echo',
  'github',
  'linkedin',
  'email',
  'print',
  'exit',
] as const;

/** Alternate spellings people will try. Values are canonical command names. */
export const ALIASES: Record<string, string> = {
  '?': 'help',
  man: 'help',
  commands: 'help',
  ls: 'dir',
  clear: 'cls',
  cat: 'type',
  open: 'type',
  cd: 'type',
  run: 'type',
  shutdown: 'exit',
  quit: 'exit',
  logout: 'exit',
  halt: 'exit',
  work: 'projects',
  cv: 'resume',
  me: 'about',
  whois: 'about',
  hire: 'consulting',
  consult: 'consulting',
  freelance: 'consulting',
  services: 'consulting',
  mail: 'email',
  theme: 'color',
  refs: 'references',
};

/** Fake files shown by DIR. Opening one runs its command. */
export interface FileEntry {
  name: string;
  dir?: boolean;
  command: string;
}

export const FILES: FileEntry[] = [
  { name: 'ABOUT.TXT', command: 'about' },
  { name: 'PROJECTS', dir: true, command: 'projects' },
  { name: 'SKILLS.TXT', command: 'skills' },
  { name: 'RESUME.DOC', command: 'resume' },
  ...(references.length ? [{ name: 'REFS.TXT', command: 'references' }] : []),
  ...(profile.consulting.open ? [{ name: 'HIRE_ME.TXT', command: 'consulting' }] : []),
  { name: 'CONTACT.TXT', command: 'contact' },
  { name: 'HELP.TXT', command: 'help' },
];

export interface HelpRow {
  name: string;
  description: string;
  /** Command line to run when the row is clicked; omitted for ones that need arguments. */
  run?: string;
}

export function helpRows(): HelpRow[] {
  return [
    { name: 'ABOUT', description: 'Who I am and what I do', run: 'about' },
    { name: 'PROJECTS', description: "Things I've built", run: 'projects' },
    { name: 'SKILLS', description: 'Tools and technologies', run: 'skills' },
    { name: 'RESUME', description: 'Work history (printable version too)', run: 'resume' },
    ...(references.length
      ? [{ name: 'REFERENCES', description: 'What people say', run: 'references' }]
      : []),
    ...(profile.consulting.open
      ? [{ name: 'CONSULTING', description: 'Hire me for IT consulting', run: 'consulting' }]
      : []),
    { name: 'CONTACT', description: 'Email and links', run: 'contact' },
    { name: 'DIR', description: 'List files', run: 'dir' },
    { name: 'TYPE <file>', description: 'Open a file, e.g. TYPE ABOUT.TXT' },
    { name: 'COLOR', description: 'Switch phosphor: green, amber, white', run: 'color' },
    { name: 'DATE', description: 'Show the date and time', run: 'date' },
    { name: 'VER', description: 'Show the system version', run: 'ver' },
    { name: 'CLS', description: 'Clear the screen', run: 'cls' },
    { name: 'EXIT', description: 'Shut down JamesOS', run: 'exit' },
  ];
}

/** Everything Tab-completion can offer. */
export function completions(): string[] {
  return [
    ...SCREEN_COMMANDS,
    ...BUILTIN_COMMANDS,
    ...Object.keys(ALIASES).filter((a) => /^[a-z]+$/.test(a)),
    ...FILES.map((f) => f.name.toLowerCase()),
  ];
}
