// Identity and contact details shown in the header, hero, footer and resume.
// Everything marked TODO is placeholder text to replace with real details.

export interface SocialLink {
  label: string;
  href: string;
}

export interface Profile {
  name: string;
  title: string;
  location: string;
  /** One or two sentences for the hero section. */
  tagline: string;
  /** Longer "About" copy; each string is a paragraph. */
  about: string[];
  /** Leave empty to hide the email link. */
  email: string;
  links: SocialLink[];
  /**
   * Path (relative to /public) of a downloadable resume PDF, e.g. "resume.pdf".
   * Leave empty until the file exists; the download button is hidden while empty.
   */
  resumePdf: string;
}

export const profile: Profile = {
  name: 'James Tippets', // TODO: confirm how you want your name shown
  title: 'Your Professional Title', // TODO
  location: 'City, State', // TODO
  tagline:
    'TODO: A one-line summary of what you do and the kind of work you are looking for.',
  about: [
    'TODO: A short paragraph about your background and what you focus on.',
    'TODO: A second paragraph about what you are working on now, or what you enjoy outside of work.',
  ],
  email: '', // TODO: add a public contact email if you want one shown
  links: [
    { label: 'GitHub', href: 'https://github.com/jamesctippets-ui' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' }, // TODO: your profile URL
  ],
  resumePdf: '',
};
