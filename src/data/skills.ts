// Skills grouped by category. Shown on the home page and the resume.

export interface SkillGroup {
  category: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  {
    category: 'Cloud & Identity',
    items: ['Microsoft 365', 'Exchange Online', 'Entra ID (Azure AD)', 'Intune MDM', 'SharePoint', 'Teams', 'Defender'],
  },
  {
    category: 'Security & Network',
    items: ['FortiGate Firewalls', 'VPN', 'CrowdStrike EDR', 'BitLocker', 'UniFi', 'Cisco Meraki', 'TCP/IP'],
  },
  { category: 'Remote & ITSM', items: ['Datto RMM', 'ScreenConnect', 'ServiceNow'] },
  {
    category: 'Sysadmin',
    items: ['Active Directory', 'Group Policy', 'Patch Management', 'Windows Server/Desktop', 'Linux', 'macOS'],
  },
  {
    category: 'Scripting & Dev',
    items: ['PowerShell', 'Python', 'SQL', 'HTML/CSS', 'JavaScript', 'React', 'REST APIs', 'Supabase', 'Firebase'],
  },
  { category: 'Healthcare Apps', items: ['Epic', 'Athena', 'Citrix'] },
  {
    category: 'Hardware',
    items: ['PC/Mobile Repair', 'Diagnostics', 'Data Center Components', 'Device Imaging & Decommission'],
  },
];
