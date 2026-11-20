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
  /** Freelance consulting offer. Set `open: false` to hide it everywhere. */
  consulting: {
    open: boolean;
    blurb: string;
    focus: string[];
  };
}

export const profile: Profile = {
  name: 'James Tippets',
  title: 'Service Desk Analyst II',
  location: 'Winchester, Virginia',
  tagline:
    'Healthcare IT support specialist working across Microsoft 365, endpoint security and networking, and building software with AI on the side.',
  about: [
    "I'm a Service Desk Analyst II at Valley Health in Winchester, Virginia. Before that I resolved 2,500+ tickets for healthcare clients at Miles IT, administering Microsoft 365, Entra ID, Intune and FortiGate firewalls in HIPAA-regulated environments.",
    "I care about fixing the root cause instead of applying a band-aid, and about explaining technical problems clearly. In my free time I'm the IT consultant for the Fort Mill History Museum, and I build things with Claude: a certification study app, a personal AI assistant, and a couple of games.",
    "I'm open to IT consulting inquiries, with a focus on hardware and repair, Microsoft 365 management, and AI consulting.",
  ],
  email: 'James.C.Tippets@gmail.com',
  links: [{ label: 'GitHub', href: 'https://github.com/jamesctippets-ui' }],
  resumePdf: '',
  consulting: {
    open: true,
    blurb:
      'Available for freelance IT consulting for small businesses, nonprofits and individuals. Get in touch with a short description of what you need.',
    focus: [
      'Hardware & repair: diagnostics, upgrades, data recovery and device setup',
      'Microsoft 365 management: Exchange, Teams, SharePoint, Intune and licensing',
      'AI consulting: practical Claude/AI workflows, automation and assistants',
    ],
  },
};
