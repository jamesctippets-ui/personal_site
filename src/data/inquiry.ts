// Consulting inquiry form: services offered and the email template the form sends.
//
// Delivery: the static site can't send mail itself, so the form posts to
// Web3Forms (https://web3forms.com, free). Put the access key from Web3Forms in
// `web3formsKey`. Web3Forms keys are designed to be public, so it is safe in
// the repo. While the key is empty, the form falls back to opening the
// visitor's mail app with the same template filled in.

export const inquiry = {
  web3formsKey: '',
  services: [
    'Hardware & repair',
    'Microsoft 365 management',
    'AI consulting',
    'Something else',
  ],
  /** {placeholders} are replaced with the form fields. */
  subjectTemplate: 'IT consulting inquiry: {service} ({name})',
  bodyTemplate: `New consulting inquiry from jamesctippets-ui.github.io

Name:         {name}
Email:        {email}
Organization: {organization}
Service:      {service}
Timeline:     {timeline}

Message:
{message}
`,
};

export function fillTemplate(template: string, fields: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => fields[key]?.trim() || '(not given)');
}
