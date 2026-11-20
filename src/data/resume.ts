// Content for the /resume page. Skills come from skills.ts and contact
// details from profile.ts, so they are not repeated here.

export interface Role {
  title: string;
  organization: string;
  location?: string;
  /** Free text, e.g. "Jan 2024". Omit for an ongoing side role. */
  start?: string;
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
  issuer?: string;
  year?: string;
  url?: string;
}

export interface Resume {
  summary: string;
  experience: Role[];
  education: Education[];
  certifications: Certification[];
}

export const resume: Resume = {
  summary:
    'IT professional with hands-on expertise in Microsoft 365 administration, endpoint security and enterprise firewall management. Experienced supporting healthcare organizations in HIPAA-compliant environments, with a focus on permanent solutions over temporary fixes. Recognized for service quality with 250+ positive feedback ratings across 2,500+ resolved tickets, and comfortable contributing to infrastructure migrations and explaining technical issues clearly to end users and stakeholders.',
  experience: [
    {
      title: 'Service Desk Analyst II',
      organization: 'Valley Health',
      location: 'Winchester, VA',
      start: 'Sep 2026',
      end: 'Present',
      highlights: [
        'Triage incoming tickets and calls for the hospital\'s Information Services department, resolving issues at first contact where possible.',
        'Route escalations to the right IS teams with clear documentation so clinical and business staff get back to work quickly.',
      ],
    },
    {
      title: 'IT Consultant (part-time)',
      organization: 'Fort Mill History Museum',
      end: 'Present',
      highlights: [
        "Serve as the museum's IT consultant in my free time, supporting its computers, accounts and day-to-day technology needs.",
      ],
    },
    {
      title: 'IT Support Consultant',
      organization: 'Miles IT',
      location: 'Remote',
      start: 'Jan 2025',
      end: 'Sep 2026',
      highlights: [
        'Resolved 2,500+ tickets for enterprise healthcare clients (500+ users) at a 10–15 ticket daily pace, earning 250+ positive feedback ratings for service quality.',
        'Administered Microsoft 365 (Exchange Online, Entra ID, Intune, SharePoint, Teams, Defender) across multiple medical organizations under strict HIPAA compliance.',
        'Used PowerShell to manage mailbox permissions, calendar access and bulk M365 configuration changes, reducing manual admin work on recurring tasks.',
        'Configured and troubleshot FortiGate firewalls, including VPN tunnels, client- and firewall-level policies, and secure provisioning for remote healthcare staff.',
        'Managed the endpoint security stack (CrowdStrike EDR, BitLocker, Intune MDM), resolving authentication failures, policy conflicts and compliance gaps.',
        'Supported an AD-to-Entra ID user migration and a SharePoint data migration, verifying identity and file integrity and resolving post-migration access issues.',
        'Led device decommissioning for a client shutdown: secure data transfers, full wipes and documented asset disposition per compliance requirements.',
        'Deployed Group Policy for browser defaults, security baselines and software enforcement; used Datto RMM and ScreenConnect for monitoring and patching.',
        'Wrote SOPs and troubleshooting guides, and onboarded and mentored new technicians and interns.',
      ],
    },
    {
      title: 'Project Technical Support',
      organization: 'Maverik',
      start: 'Dec 2023',
      end: 'Dec 2024',
      highlights: [
        'Delivered remote support for 400+ retail locations via ServiceNow and led technical execution of the Kum & Go rebranding rollout across distributed sites.',
        'Administered MySQL databases across all locations and managed back-office systems, POS terminals and fuel dispensing equipment.',
      ],
    },
    {
      title: 'Desktop Support Technician',
      organization: 'Intermountain Healthcare',
      start: 'Aug 2023',
      end: 'Dec 2023',
      highlights: [
        'Provided on-site support for hospital staff and assisted with data center hardware maintenance, including PSU blade installation and preventive upkeep.',
        'Conducted inventory audits and enforced HIPAA compliance standards across critical healthcare IT infrastructure.',
      ],
    },
    {
      title: 'Lead Electronics / IT Technician',
      organization: 'Fixit Mobile Bad Apple',
      start: 'Aug 2021',
      end: 'Aug 2023',
      highlights: [
        'Supervised hardware diagnostics, mobile device repair and software troubleshooting, managing team workflow and client communication in a high-volume repair shop.',
      ],
    },
  ],
  education: [
    {
      credential: 'Coursework toward A.S., University Studies',
      institution: 'Utah Valley University',
      year: '2019',
    },
  ],
  certifications: [
    { name: 'CompTIA A+' },
    { name: 'Microsoft Azure Fundamentals (AZ-900)' },
  ],
};
