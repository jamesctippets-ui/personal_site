// Testimonials / references. Only publish quotes the person has agreed to share.
// Leave the array empty to hide the References section entirely.

export interface Reference {
  quote: string;
  name: string;
  role: string;
  /** Optional link to their profile. */
  url?: string;
}

export const references: Reference[] = [
  {
    quote: 'TODO: A short quote from a manager, colleague, or client.',
    name: 'Reference Name',
    role: 'Title, Company',
  },
  {
    quote: 'TODO: A second quote that highlights a different strength.',
    name: 'Reference Name',
    role: 'Title, Company',
  },
];
