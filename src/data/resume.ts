// Content for the /resume page. Skills come from skills.ts and contact
// details from profile.ts, so they are not repeated here.

export interface Role {
  title: string;
  organization: string;
  location?: string;
  /** Free text, e.g. "Jan 2024". */
  start: string;
  /** Free text; use "Present" for a current role. */
  end: string;
  highlights: string[];
}

export interface Education {
  credential: string;
  institution: string;
  year: string;
  details?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
  url?: string;
}

export interface Resume {
  summary: string;
  experience: Role[];
  education: Education[];
  certifications: Certification[];
}

export const resume: Resume = {
  summary: 'TODO: Three or four lines summarizing your experience and strengths.',
  experience: [
    {
      title: 'Job Title', // TODO
      organization: 'Company',
      location: 'City, State',
      start: 'Month Year',
      end: 'Present',
      highlights: [
        'TODO: An accomplishment with a measurable result.',
        'TODO: Another accomplishment.',
      ],
    },
    {
      title: 'Previous Job Title', // TODO
      organization: 'Company',
      start: 'Month Year',
      end: 'Month Year',
      highlights: ['TODO: What you delivered.'],
    },
  ],
  education: [
    {
      credential: 'Degree or Program', // TODO
      institution: 'School',
      year: 'Year',
    },
  ],
  certifications: [
    // { name: 'Certification', issuer: 'Issuer', year: '2026', url: 'https://...' },
  ],
};
