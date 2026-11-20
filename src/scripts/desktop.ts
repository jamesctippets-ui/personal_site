// Window manager for the retro desktop on the home page.
//
// Windows are server-rendered <section data-window> elements (see Window.astro).
// This script only toggles classes and inline position/size on them, and builds
// the taskbar buttons. State lives in the DOM; there is no framework.
//
// Behavior summary:
// - Desktop icons: click selects, double-click (or Enter, or a tap on touch) opens.
// - Windows: drag by the title bar, double-click it to maximize, focus on press.
// - Taskbar button: focuses, or minimizes the window if it's already active.
// - URL hash (#projects etc.) opens that window, so sections are linkable.
// - Phones (<= 720px): windows always open maximized and don't drag.

const desktop = document.getElementById('desktop')!;
const tasks = document.getElementById('tasks')!;
const startButton = document.getElementById('start-button')!;
const startMenu = document.getElementById('start-menu')!;
const shutdown = document.getElementById('shutdown')!;
const clock = document.getElementById('clock')!;

const windows = new Map<string, HTMLElement>(
  [...document.querySelectorAll<HTMLElement>('[data-window]')].map((el) => [el.dataset.window!, el]),
);
const taskButtons = new Map<string, HTMLButtonElement>();
const placed = new Set<string>();

const mobile = window.matchMedia('(max-width: 720px)');
const EDGE = 8; // keep this many px of a window inside the desktop
let zTop = 10;
let cascade = 0;

// ---------- Window lifecycle ----------

function isOpen(el: HTMLElement) {
  return el.classList.contains('is-open');
}

function place(id: string, el: HTMLElement) {
  const dw = desktop.clientWidth;
  const dh = desktop.clientHeight;
  const w = Math.min(Number(el.dataset.width) || 560, dw - EDGE * 2);
  const wantH = Number(el.dataset.height) || 0;
  const step = 28;
  let x = 112 + cascade * step;
  let y = 16 + cascade * step;
  cascade = (cascade + 1) % 6;
  if (x + w > dw - EDGE) x = Math.max(EDGE, dw - w - EDGE);
  const maxH = dh - y - EDGE;
  el.style.width = `${w}px`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  if (wantH) el.style.height = `${Math.min(wantH, maxH)}px`;
  el.style.maxHeight = `${dh - EDGE}px`;
  placed.add(id);
}

function openWindow(id: string, { updateHash = true } = {}) {
  const el = windows.get(id);
  if (!el) return;
  if (!placed.has(id)) place(id, el);
  if (mobile.matches) setMaximized(el, true);
  el.classList.add('is-open');
  ensureTaskButton(id, el);
  focusWindow(id);
  if (updateHash) history.replaceState(null, '', `#${id}`);
}

function closeWindow(id: string) {
  const el = windows.get(id);
  if (!el) return;
  el.classList.remove('is-open', 'is-active');
  taskButtons.get(id)?.remove();
  taskButtons.delete(id);
  if (location.hash === `#${id}`) history.replaceState(null, '', location.pathname + location.search);
  focusTopmost();
}

function minimizeWindow(id: string) {
  const el = windows.get(id);
  if (!el) return;
  el.classList.remove('is-open', 'is-active');
  taskButtons.get(id)?.setAttribute('aria-pressed', 'false');
  focusTopmost();
}

function focusWindow(id: string) {
  const el = windows.get(id);
  if (!el) return;
  el.style.zIndex = String(++zTop);
  for (const [wid, w] of windows) {
    const active = wid === id;
    w.classList.toggle('is-active', active);
    taskButtons.get(wid)?.setAttribute('aria-pressed', String(active && isOpen(w)));
  }
}

function focusTopmost() {
  let best: string | null = null;
  let bestZ = -1;
  for (const [id, el] of windows) {
    const z = Number(el.style.zIndex) || 0;
    if (isOpen(el) && z > bestZ) {
      best = id;
      bestZ = z;
    }
  }
  if (best) focusWindow(best);
}

function setMaximized(el: HTMLElement, on: boolean) {
  el.classList.toggle('is-maximized', on);
  const btn = el.querySelector<HTMLButtonElement>('[data-action="maximize"]');
  const title = el.dataset.title ?? '';
  btn?.setAttribute('aria-label', `${on ? 'Restore' : 'Maximize'} ${title}`);
}

function ensureTaskButton(id: string, el: HTMLElement) {
  if (taskButtons.has(id)) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn task';
  btn.setAttribute('aria-pressed', 'false');
  btn.title = el.dataset.title ?? id;
  // Reuse the title bar's icon markup so taskbar and window always match.
  const icon = el.querySelector('.titlebar svg')?.cloneNode(true);
  if (icon) btn.append(icon);
  const label = document.createElement('span');
  label.textContent = el.dataset.title ?? id;
  btn.append(label);
  btn.addEventListener('click', () => {
    if (isOpen(el) && el.classList.contains('is-active')) minimizeWindow(id);
    else openWindow(id);
  });
  tasks.append(btn);
  taskButtons.set(id, btn);
}

// ---------- Window chrome: buttons, focus, drag ----------

for (const [id, el] of windows) {
  el.addEventListener('pointerdown', () => {
    if (!el.classList.contains('is-active')) focusWindow(id);
  });
  el.addEventListener('focusin', () => {
    if (!el.classList.contains('is-active')) focusWindow(id);
  });

  el.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      if (action === 'close') closeWindow(id);
      else if (action === 'minimize') minimizeWindow(id);
      else if (action === 'maximize' && !mobile.matches)
        setMaximized(el, !el.classList.contains('is-maximized'));
    });
  });

  const handle = el.querySelector<HTMLElement>('[data-drag-handle]')!;
  handle.addEventListener('dblclick', (e) => {
    if ((e.target as HTMLElement).closest('button') || mobile.matches) return;
    setMaximized(el, !el.classList.contains('is-maximized'));
  });

  handle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return;
    if (mobile.matches || el.classList.contains('is-maximized')) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const originLeft = el.offsetLeft;
    const originTop = el.offsetTop;
    handle.setPointerCapture(e.pointerId);

    const move = (ev: PointerEvent) => {
      const maxLeft = desktop.clientWidth - 48;
      const maxTop = desktop.clientHeight - handle.offsetHeight;
      const left = Math.min(Math.max(originLeft + ev.clientX - startX, 48 - el.offsetWidth), maxLeft);
      const top = Math.min(Math.max(originTop + ev.clientY - startY, 0), maxTop);
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    };
    const up = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  });
}

// ---------- Desktop icons ----------

let lastPointer = 'mouse';
const icons = [...document.querySelectorAll<HTMLAnchorElement>('.desk-icon')];

function selectIcon(icon: HTMLAnchorElement | null) {
  icons.forEach((i) => i.classList.toggle('is-selected', i === icon));
}

function activateIcon(icon: HTMLAnchorElement) {
  const id = icon.dataset.open;
  if (id) openWindow(id);
  else if (icon.href) window.open(icon.href, '_blank', 'noopener');
}

for (const icon of icons) {
  icon.addEventListener('pointerdown', (e) => {
    lastPointer = e.pointerType;
  });
  icon.addEventListener('click', (e) => {
    e.preventDefault();
    selectIcon(icon);
    // detail 0 = keyboard activation. Touch has no double-click, so one tap opens.
    if (e.detail === 0 || lastPointer !== 'mouse') activateIcon(icon);
  });
  icon.addEventListener('dblclick', (e) => {
    e.preventDefault();
    activateIcon(icon);
  });
}

desktop.addEventListener('pointerdown', (e) => {
  if (!(e.target as HTMLElement).closest('.desk-icon')) selectIcon(null);
});

// ---------- Start menu ----------

function setStartMenu(open: boolean) {
  startMenu.hidden = !open;
  startButton.setAttribute('aria-expanded', String(open));
  if (open) startMenu.querySelector<HTMLElement>('a, button')?.focus();
}

startButton.addEventListener('click', () => setStartMenu(startMenu.hidden));

startMenu.querySelectorAll<HTMLAnchorElement>('a[data-open]').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    setStartMenu(false);
    openWindow(a.dataset.open!);
  });
});
startMenu.querySelectorAll('a:not([data-open])').forEach((a) =>
  a.addEventListener('click', () => setStartMenu(false)),
);

document.addEventListener('pointerdown', (e) => {
  const t = e.target as Node;
  if (!startMenu.hidden && !startMenu.contains(t) && !startButton.contains(t)) setStartMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !startMenu.hidden) {
    setStartMenu(false);
    startButton.focus();
  }
});

// ---------- Shut down / restart ----------

startMenu.querySelector('[data-shutdown]')?.addEventListener('click', () => {
  setStartMenu(false);
  shutdown.hidden = false;
  shutdown.querySelector<HTMLButtonElement>('[data-restart]')?.focus();
});
shutdown.querySelector('[data-restart]')?.addEventListener('click', () => {
  for (const id of windows.keys()) closeWindow(id);
  shutdown.hidden = true;
  boot();
});

// ---------- Clock ----------

function tick() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  clock.setAttribute('datetime', now.toISOString());
}
tick();
setInterval(tick, 15_000);

// ---------- Responsive + hash routing ----------

mobile.addEventListener('change', () => {
  for (const el of windows.values()) setMaximized(el, mobile.matches);
});

window.addEventListener('resize', () => {
  const dw = desktop.clientWidth;
  const dh = desktop.clientHeight;
  for (const el of windows.values()) {
    if (!isOpen(el) || el.classList.contains('is-maximized')) continue;
    el.style.maxHeight = `${dh - EDGE}px`;
    if (el.offsetWidth > dw - EDGE * 2) el.style.width = `${dw - EDGE * 2}px`;
    if (el.offsetLeft > dw - 48) el.style.left = `${Math.max(EDGE, dw - el.offsetWidth - EDGE)}px`;
    if (el.offsetTop > dh - 32) el.style.top = `${Math.max(0, dh - el.offsetHeight - EDGE)}px`;
  }
});

window.addEventListener('hashchange', () => {
  const id = location.hash.slice(1);
  if (windows.has(id)) openWindow(id, { updateHash: false });
});

function boot() {
  const id = location.hash.slice(1);
  if (windows.has(id)) openWindow(id, { updateHash: false });
  // On a wide screen, greet visitors with the About window. On phones,
  // show the icons first, since any window would cover the whole screen.
  else if (!mobile.matches) openWindow('about', { updateHash: false });
}

boot();
