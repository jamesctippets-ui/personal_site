// Consulting inquiry form handler (see src/data/inquiry.ts for the template).
// Delegated on document because the terminal clones the form into its output.
import { profile } from '@/data/profile';
import { fillTemplate, inquiry } from '@/data/inquiry';

document.addEventListener('submit', async (e) => {
  const form = (e.target as HTMLElement).closest<HTMLFormElement>('form[data-inquiry]');
  if (!form) return;
  e.preventDefault();

  const data = new FormData(form);
  if (data.get('botcheck')) return; // spam trap ticked: drop silently
  const fields: Record<string, string> = {};
  for (const key of ['name', 'email', 'organization', 'service', 'timeline', 'message']) {
    fields[key] = String(data.get(key) ?? '');
  }
  const subject = fillTemplate(inquiry.subjectTemplate, fields);
  const body = fillTemplate(inquiry.bodyTemplate, fields);
  const status = form.querySelector<HTMLElement>('.status');
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const say = (msg: string) => {
    if (status) status.textContent = msg;
  };

  // No Web3Forms key yet: hand the filled-in template to the visitor's mail app.
  if (!inquiry.web3formsKey) {
    const href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    say('Opening your email app with the inquiry filled in...');
    window.location.href = href;
    return;
  }

  button && (button.disabled = true);
  say('Sending...');
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: inquiry.web3formsKey,
        subject,
        from_name: 'JamesOS contact form',
        replyto: fields.email,
        name: fields.name,
        email: fields.email,
        message: body,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
    if (res.ok && json.success) {
      form.reset();
      say('Sent. Thanks, I will get back to you soon.');
    } else {
      throw new Error(json.message || `HTTP ${res.status}`);
    }
  } catch (err) {
    say(`Could not send (${(err as Error).message}). Email ${profile.email} instead.`);
  } finally {
    button && (button.disabled = false);
  }
});
