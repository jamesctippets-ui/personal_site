// Volunteer/side-work spotlight. Shown by the MUSEUM command.

export interface Spotlight {
  organization: string;
  role: string;
  summary: string;
  work: { title: string; detail: string }[];
}

export const spotlight: Spotlight = {
  organization: 'Fort Mill History Museum',
  role: 'IT Consultant (in my free time)',
  summary:
    "I'm the museum's go-to IT person, keeping a small nonprofit's technology running so the staff can focus on the museum.",
  work: [
    {
      title: 'Device provisioning',
      detail: "Set up and configured devices for the Executive Director so they're secure and ready to work on day one.",
    },
    {
      title: 'Anytime text help',
      detail: 'On call by text for questions and quick fixes whenever something comes up.',
    },
    {
      title: 'Printer setup & management',
      detail: 'Installed, connected and maintain the museum’s printers.',
    },
    {
      title: 'Data transfer',
      detail: 'Moved files and accounts safely between old and new devices.',
    },
  ],
};
