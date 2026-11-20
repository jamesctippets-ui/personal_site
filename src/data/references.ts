// Testimonials / references. Only publish quotes the person has agreed to share.
// Leave the array empty to hide the References section entirely.

export interface Reference {
  quote: string;
  name: string;
  role: string;
  /** Optional link to their profile. */
  url?: string;
}

// Empty for now: no references yet, so the References window is hidden.
export const references: Reference[] = [];
