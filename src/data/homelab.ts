// Home lab / hands-on experience outside work. Shown by the HOMELAB command.

export interface LabItem {
  name: string;
  summary: string;
  details: string[];
  tags: string[];
}

export const homelab: LabItem[] = [
  {
    name: 'MCP server for a personal AI assistant',
    summary:
      'Self-built Model Context Protocol server that gives Claude secure access to my notes, reminders, calendar and scheduled tasks.',
    details: [
      'Exposes custom tools to Claude over MCP and relays requests through Cloudflare.',
      'Runs daily briefings, a research queue and scheduled automations on top of it.',
    ],
    tags: ['MCP', 'Claude', 'Cloudflare', 'Automation'],
  },
  {
    name: 'UniFi network: Security Gateway + Cloud Key',
    summary:
      'Home network built on a UniFi Security Gateway for routing and firewalling, managed from a UniFi Cloud Key controller.',
    details: [
      'Gateway handles routing, firewall rules and WAN for the house.',
      'Cloud Key runs the UniFi controller for adopting devices, monitoring and updates.',
    ],
    tags: ['UniFi', 'Security Gateway', 'Cloud Key', 'Networking'],
  },
  {
    name: 'Cell phone repair bench',
    summary:
      'Two years leading a mobile repair shop, and I still repair phones and small electronics at home.',
    details: [
      'Screen, battery and charging-port replacements.',
      'Hardware diagnostics, data transfer and device setup.',
    ],
    tags: ['Hardware', 'Mobile repair', 'Diagnostics'],
  },
];
