// Runtime for the JamesOS terminal on the home page.
//
// The page is server-rendered with every screen (About, Projects, ...) as a
// <section data-screen="id"> inside #screens. Without JS those sections are the
// page. With JS, #screens is detached and used as a source: running a command
// clones the matching section into #output, like printing to a terminal.
//
// Input: typed commands at the prompt (Tab completes, Up/Down history,
// Ctrl+L clears), clicks on any [data-cmd] element (menu bar, F-key bar,
// links inside output), F-key shortcuts, and the URL hash (#projects runs
// PROJECTS, so screens are linkable).
import { profile } from '@/data/profile';
import { ALIASES, FILES, SCREEN_COMMANDS, completions } from '@/scripts/commands';

const PROMPT = 'C:\\JAMES>';
const THEMES = ['green', 'amber', 'white'] as const;
type Theme = (typeof THEMES)[number];

const output = document.getElementById('output')!;
const screensEl = document.getElementById('screens')!;
const form = document.getElementById('prompt') as HTMLFormElement;
const input = document.getElementById('cmd') as HTMLInputElement;
const halt = document.getElementById('halt')!;
const clock = document.getElementById('clock');

// Keep the pre-rendered screens as templates, then clear the visible output.
const screens = new Map<string, HTMLElement>();
screensEl.querySelectorAll<HTMLElement>('[data-screen]').forEach((s) => screens.set(s.dataset.screen!, s));
screensEl.remove();

const cmdHistory: string[] = [];
let historyIndex = 0;
let booting = false;
let skipBoot: (() => void) | null = null;

// ---------- Output helpers ----------

function line(content: string | Node, className?: string): HTMLElement {
  const el = document.createElement('div');
  if (className) el.className = className;
  if (typeof content === 'string') el.textContent = content;
  else el.append(content);
  output.append(el);
  return el;
}

function cmdLink(cmd: string, label = cmd): HTMLAnchorElement {
  const a = document.createElement('a');
  a.className = 'cmd-link';
  a.href = `#${cmd}`;
  a.dataset.cmd = cmd;
  a.textContent = label;
  return a;
}

function fragment(...parts: (string | Node)[]): DocumentFragment {
  const f = document.createDocumentFragment();
  f.append(...parts);
  return f;
}

function printScreen(id: string) {
  const src = screens.get(id);
  if (!src) return;
  const block = document.createElement('div');
  block.className = 'block';
  for (const child of src.children) {
    if (child.classList.contains('static-echo')) continue; // the no-JS "C:\JAMES> type x" line
    block.append(child.cloneNode(true));
  }
  block.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
  output.append(block);
}

// ---------- Commands ----------

function setTheme(theme: Theme) {
  if (theme === 'green') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem('jos-theme', theme);
  } catch {
    /* storage unavailable; the theme just won't persist */
  }
}

function currentTheme(): Theme {
  return (document.documentElement.dataset.theme as Theme) || 'green';
}

function openExternal(label: string, href: string | undefined) {
  if (!href) {
    line(`No ${label} link on file.`);
    return;
  }
  line(`Opening ${label}...`, 'dim');
  window.open(href, '_blank', 'noopener');
}

function resolveFile(arg: string): string | undefined {
  const a = arg.toLowerCase().replace(/\\$/, '');
  const file = FILES.find((f) => f.name.toLowerCase() === a || f.name.toLowerCase().split('.')[0] === a);
  return file?.command;
}

function exec(raw: string): void {
  const trimmed = raw.trim();
  if (!trimmed) return;
  const [head, ...rest] = trimmed.split(/\s+/);
  const arg = rest.join(' ');
  let cmd = head.toLowerCase();
  cmd = ALIASES[cmd] ?? cmd;

  // A bare file name ("about.txt", "projects\") opens that file.
  if (!SCREEN_COMMANDS.includes(cmd as never) && resolveFile(cmd)) {
    cmd = resolveFile(cmd)!;
  }

  if ((SCREEN_COMMANDS as readonly string[]).includes(cmd)) {
    printScreen(cmd);
    window.history.replaceState(null, '', `#${cmd}`);
    return;
  }

  switch (cmd) {
    case 'dir': {
      line(' Volume in drive C is JAMESOS', 'dim');
      line(' Directory of C:\\JAMES', 'dim');
      const list = document.createElement('div');
      list.className = 'dir';
      for (const f of FILES) {
        const row = document.createElement('div');
        row.append(cmdLink(f.command, f.name), ' ', Object.assign(document.createElement('span'), {
          className: 'dim',
          textContent: f.dir ? '<DIR>' : 'FILE',
        }));
        list.append(row);
      }
      output.append(list);
      line(`        ${FILES.length} file(s)`, 'dim');
      return;
    }
    case 'type': {
      if (!arg) {
        line('Usage: TYPE <file>   (try DIR to see files)');
        return;
      }
      const target = resolveFile(arg);
      if (target) exec(target);
      else line(`File not found: ${arg}`);
      return;
    }
    case 'cls':
      output.replaceChildren();
      return;
    case 'color': {
      const want = arg.toLowerCase() as Theme;
      const next = THEMES.includes(want)
        ? want
        : THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length];
      setTheme(next);
      line(fragment(`Phosphor set to ${next.toUpperCase()}. `, cmdLink('color', 'Switch again')));
      return;
    }
    case 'date':
      line(new Date().toLocaleString([], { dateStyle: 'full', timeStyle: 'short' }));
      return;
    case 'ver':
      line('JamesOS Version 1.0');
      line('Built with Astro. Hosted on GitHub Pages.', 'dim');
      return;
    case 'whoami':
      line('guest (you have read-only access to JamesOS)');
      return;
    case 'echo':
      line(arg);
      return;
    case 'github':
      openExternal('GitHub', profile.links.find((l) => l.label === 'GitHub')?.href);
      return;
    case 'linkedin':
      openExternal('LinkedIn', profile.links.find((l) => l.label === 'LinkedIn')?.href);
      return;
    case 'email':
      if (profile.email) {
        line(`Opening mail to ${profile.email}...`, 'dim');
        window.location.href = `mailto:${profile.email}`;
      } else line('No email address on file.');
      return;
    case 'print': {
      line('Loading printable resume...', 'dim');
      const base = import.meta.env.BASE_URL.replace(/\/$/, '');
      window.location.href = `${base}/resume`;
      return;
    }
    case 'exit':
      shutdown();
      return;
    default:
      line(fragment(`Unknown command: ${head}. Type `, cmdLink('help', 'HELP'), ' for a list of commands.'));
  }
}

/** Echo a command line, run it, and scroll so its output starts at the top. */
function run(raw: string, { record = true } = {}) {
  if (booting) skipBoot?.();
  const echo = line('', 'echo');
  echo.append(Object.assign(document.createElement('span'), { className: 'p', textContent: PROMPT }), raw);
  if (record && raw.trim()) {
    if (cmdHistory[cmdHistory.length - 1] !== raw) cmdHistory.push(raw);
    historyIndex = cmdHistory.length;
  }
  exec(raw);
  if (output.contains(echo)) echo.scrollIntoView({ block: 'start' });
  else output.scrollTop = 0;
}

// ---------- Shut down ----------

function shutdown() {
  halt.hidden = false;
  input.blur();
  const restart = () => {
    halt.hidden = true;
    window.removeEventListener('keydown', restart, true);
    halt.removeEventListener('click', restart);
    output.replaceChildren();
    boot(true);
  };
  // Defer so the click/Enter that ran EXIT doesn't immediately reboot.
  setTimeout(() => {
    window.addEventListener('keydown', restart, true);
    halt.addEventListener('click', restart);
  }, 300);
}

// ---------- Boot ----------

function bootLines(): string[] {
  return [
    'JamesOS BIOS v1.0',
    'Memory test: 640K OK',
    'Detecting drive C: ... OK',
    'Loading JamesOS...',
  ];
}

function banner() {
  line(fragment(Object.assign(document.createElement('span'), { className: 'inv', textContent: ' JamesOS 1.0 ' }), ` ${profile.name}, ${profile.title}`));
  line(fragment('Type a command or click one. ', cmdLink('help', 'HELP'), ' lists everything.'), 'dim');
}

function boot(force = false) {
  const startHash = location.hash.slice(1).toLowerCase();
  const first = (SCREEN_COMMANDS as readonly string[]).includes(startHash) ? startHash : 'about';
  const finish = () => {
    booting = false;
    skipBoot = null;
    output.replaceChildren();
    banner();
    run(first, { record: false });
    output.scrollTop = 0;
  };

  let seen = false;
  try {
    seen = sessionStorage.getItem('jos-booted') === '1';
    sessionStorage.setItem('jos-booted', '1');
  } catch {
    /* ignore */
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ((seen && !force) || reduced) {
    finish();
    return;
  }

  booting = true;
  const timers: number[] = [];
  skipBoot = () => {
    timers.forEach(clearTimeout);
    finish();
  };
  bootLines().forEach((text, i) => {
    timers.push(window.setTimeout(() => line(text, i === 0 ? 'bright' : undefined), 180 * i));
  });
  timers.push(window.setTimeout(finish, 180 * bootLines().length + 350));
}

// ---------- Input ----------

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = input.value;
  input.value = '';
  run(value);
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') {
    if (!cmdHistory.length) return;
    e.preventDefault();
    historyIndex = Math.max(0, historyIndex - 1);
    input.value = cmdHistory[historyIndex] ?? '';
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    historyIndex = Math.min(cmdHistory.length, historyIndex + 1);
    input.value = cmdHistory[historyIndex] ?? '';
  } else if (e.key === 'Tab') {
    const value = input.value;
    const parts = value.split(/\s+/);
    const last = (parts.pop() ?? '').toLowerCase();
    if (!last) return;
    const matches = [...new Set(completions())].filter((c) => c.startsWith(last));
    if (!matches.length) return;
    e.preventDefault();
    if (matches.length === 1) {
      input.value = [...parts, matches[0]].join(' ') + ' ';
    } else {
      line(matches.join('   '), 'dim');
      output.scrollTop = output.scrollHeight;
    }
  }
});

const FKEYS: Record<string, string> = {
  F1: 'help',
  F2: 'about',
  F3: 'projects',
  F4: 'skills',
  F6: 'resume',
  F7: 'contact',
};

document.addEventListener('keydown', (e) => {
  if (!halt.hidden) return;
  if (booting && !e.ctrlKey && !e.metaKey && !e.altKey) skipBoot?.();
  const fk = FKEYS[e.key];
  if (fk) {
    e.preventDefault();
    run(fk);
    return;
  }
  if (e.key.toLowerCase() === 'l' && e.ctrlKey) {
    e.preventDefault();
    run('cls');
    return;
  }
  // Typing anywhere goes to the prompt, like a real terminal.
  const t = e.target as HTMLElement;
  const typing = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
  if (typing && t !== input && !t.closest('input, textarea, select, [contenteditable]')) {
    input.focus();
  }
});

// Clicks on any [data-cmd] (menu, F-key bar, links in output) run the command.
document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-cmd]');
  if (el) {
    e.preventDefault();
    run(el.dataset.cmd!);
    return;
  }
});

// A mouse click on empty terminal space focuses the prompt (not on touch,
// where it would pop up the keyboard every time you scroll).
output.addEventListener('pointerup', (e) => {
  if (e.pointerType !== 'mouse') return;
  if ((e.target as HTMLElement).closest('a, button')) return;
  if (window.getSelection()?.toString()) return;
  input.focus({ preventScroll: true });
});

window.addEventListener('hashchange', () => {
  const id = location.hash.slice(1).toLowerCase();
  if ((SCREEN_COMMANDS as readonly string[]).includes(id)) run(id);
});

// ---------- Clock ----------

function tick() {
  if (!clock) return;
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
tick();
setInterval(tick, 15_000);

boot();
