// The sections every alternate look (/modern, /2000, /mac) shows, in order.
// Content comes from src/data; plain/Content.astro renders each section body.
import { profile } from '@/data/profile';

export type GlyphName =
  | 'about'
  | 'experience'
  | 'resume'
  | 'projects'
  | 'skills'
  | 'lab'
  | 'museum'
  | 'consulting'
  | 'contact'
  | 'terminal'
  | 'globe';

export type SectionId =
  | 'about'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'lab'
  | 'museum'
  | 'consulting'
  | 'contact';

export interface SectionInfo {
  id: SectionId;
  /** Heading on /modern and window title on the desktops. */
  title: string;
  /** Short label for nav bars, icons and the dock. */
  label: string;
  glyph: GlyphName;
  /** Preferred desktop window size in px. */
  width: number;
  height?: number;
}

export const sections: SectionInfo[] = [
  { id: 'about', title: 'About me', label: 'About', glyph: 'about', width: 560 },
  { id: 'experience', title: 'Experience', label: 'Experience', glyph: 'experience', width: 680, height: 560 },
  { id: 'projects', title: 'Projects', label: 'Projects', glyph: 'projects', width: 680, height: 560 },
  { id: 'skills', title: 'Skills & certifications', label: 'Skills', glyph: 'skills', width: 600, height: 520 },
  { id: 'lab', title: 'Home lab', label: 'Home lab', glyph: 'lab', width: 600, height: 520 },
  { id: 'museum', title: 'Spotlight: Fort Mill History Museum', label: 'Museum', glyph: 'museum', width: 580 },
  ...(profile.consulting.open
    ? [{ id: 'consulting', title: 'IT consulting', label: 'Hire me', glyph: 'consulting', width: 600, height: 600 } as SectionInfo]
    : []),
  { id: 'contact', title: 'Contact', label: 'Contact', glyph: 'contact', width: 460 },
];

/** The other looks of the site, for the switchers on each page. */
export const looks = [
  { id: 'terminal', label: 'Terminal', path: '' },
  { id: 'modern', label: 'Modern', path: 'modern/' },
  { id: '2000', label: '2000', path: '2000/' },
  { id: 'mac', label: 'Mac', path: 'mac/' },
] as const;
