// Window manager shared by the desktop looks (/2000 and /mac). Each page
// styles the same markup its own way (see components/desk/DeskWindow.astro).
//
// DOM contract:
// - #desktop: the area windows float in. data-gutter = px to leave free on the
//   left for desktop icons; data-first = window to open on wide screens.
// - [data-window="id"] sections with a [data-drag-handle] title bar and
//   [data-action="minimize|maximize|close"] buttons.
// - Anything with [data-open="id"] opens that window on click. Elements with
//   class .desk-icon act like desktop icons instead: click selects, double-click
//   (or Enter, or one tap on touch) opens. Openers get .is-running while their
//   window is open, which the Mac dock uses for its dots.
// - Optional: #tasks (taskbar buttons are added here), #start-button +
//   #start-menu, #clock.
// - The URL hash (#projects) opens that window, so windows are linkable.
// - Phones (<= 720px): windows always open maximized and don't drag.

const desktop = document.getElementById('desktop')!;
const tasks = document.getElementById('tasks');
const startButton = document.getElementById('start-button');
const startMenu = document.getElementById('start-menu');
const clock = document.getElementById('clock');

const windows = new Map<string, HTMLElement>(
  [...document.querySelectorAll<HTMLElement>('[data-window]')].map((el) => [el.dataset.window!, el]),
);
const taskButtons = new Map<string, HTMLButtonElement>();
const placed = new Set<string>();
const mobile = window.matchMedia('(max-width: 720px)');
const EDGE = 8;
const gutter = Number(desktop.dataset.gutter) || 16;
let zTop = 10;
let cascade = 0;

const isOpen = (el: HTMLElement) => el.classList.contains('is-open');

function place(id: string, el: HTMLElement) {
  const dw = desktop.clientWidth;
  const dh = desktop.clientHeight;
  const w = Math.min(Number(el.dataset.width) || 560, dw - EDGE * 2);
  const wantH = Number(el.dataset.height) || 0;
  let x = gutter + cascade * 28;
  let y = 16 + cascade * 28;
  cascade = (cascade + 1) % 6;
  if (x + w > dw - EDGE) x = Math.max(EDGE, dw - w - EDGE);
  el.style.width = `${w}px`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  if (wantH) el.style.height = `${Math.min(wantH, dh - y - EDGE)}px`;
  el.style.maxHeight = `${dh - y - EDGE}px`;
  placed.add(id);
}

function syncRunning() {
  document.querySelectorAll<HTMLElement>('[data-open]').forEach((o) => {
    const w = windows.get(o.dataset.open!);
    o.classList.toggle('is-running', Boolean(w && (isOpen(w) || taskButtons.has(o.dataset.open!))));
  });
}

function openWindow(id: string, { updateHash = true } = {}) {
  const el = windows.get(id);
  if (!el) return;
  if (!placed.has(id)) place(id, el);
  if (mobile.matches) setMaximized(el, true);
  el.classList.add('is-open');
  ensureTaskButton(id, el);
  focusWindow(id);
  syncRunning();
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
  syncRunning();
}

function minimizeWindow(id: string) {
  const el = windows.get(id);
  if (!el) return;
  el.classList.remove('is-open', 'is-active');
  taskButtons.get(id)?.setAttribute('aria-pressed', 'false');
  focusTopmost();
  syncRunning();
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
  const title = document.getElementById('active-title');
  if (title) title.textContent = el.dataset.title ?? '';
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
  else {
    const title = document.getElementById('active-title');
    if (title) title.textContent = title.dataset.idle ?? '';
  }
}

function setMaximized(el: HTMLElement, on: boolean) {
  el.classList.toggle('is-maximized', on);
  el.querySelector('[data-action="maximize"]')?.setAttribute('aria-label', `${on ? 'Restore' : 'Maximize'} ${el.dataset.title ?? ''}`);
}

function ensureTaskButton(id: string, el: HTMLElement) {
  if (!tasks || taskButtons.has(id)) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'task';
  btn.setAttribute('aria-pressed', 'false');
  btn.title = el.dataset.title ?? id;
  const icon = el.querySelector('.titlebar svg')?.cloneNode(true);
  if (icon) btn.append(icon);
  const label = document.createElement('span');
  label.textContent = el.dataset.short ?? el.dataset.title ?? id;
  btn.append(label);
  btn.addEventListener('click', () => {
    if (isOpen(el) && el.classList.contains('is-active')) minimizeWindow(id);
    else openWindow(id);
  });
  tasks.append(btn);
  taskButtons.set(id, btn);
}

// ---------- Window chrome ----------

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
      else if (action === 'maximize' && !mobile.matches) setMaximized(el, !el.classList.contains('is-maximized'));
    });
  });

  const handle = el.querySelector<HTMLElement>('[data-drag-handle]');
  if (!handle) continue;
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
      const left = Math.min(Math.max(originLeft + ev.clientX - startX, 48 - el.offsetWidth), desktop.clientWidth - 48);
      const top = Math.min(Math.max(originTop + ev.clientY - startY, 0), desktop.clientHeight - handle.offsetHeight);
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

// ---------- Openers ----------

let lastPointer = 'mouse';
const icons = [...document.querySelectorAll<HTMLElement>('.desk-icon')];
const selectIcon = (icon: HTMLElement | null) => icons.forEach((i) => i.classList.toggle('is-selected', i === icon));

document.addEventListener('pointerdown', (e) => {
  lastPointer = e.pointerType;
  const t = e.target as HTMLElement;
  if (!t.closest('.desk-icon')) selectIcon(null);
  if (startMenu && startButton && !startMenu.hidden && !startMenu.contains(t) && !startButton.contains(t)) setStartMenu(false);
});

document.addEventListener('click', (e) => {
  const opener = (e.target as HTMLElement).closest<HTMLElement>('[data-open]');
  if (!opener) return;
  const id = opener.dataset.open!;
  if (!windows.has(id)) return;
  e.preventDefault();
  if (opener.classList.contains('desk-icon')) {
    selectIcon(opener);
    // detail 0 = keyboard. Touch has no double-click, so one tap opens.
    if (e.detail !== 0 && lastPointer === 'mouse') return;
  }
  if (startMenu && !startMenu.hidden) setStartMenu(false);
  openWindow(id);
});

document.addEventListener('dblclick', (e) => {
  const icon = (e.target as HTMLElement).closest<HTMLElement>('.desk-icon[data-open]');
  if (icon) openWindow(icon.dataset.open!);
});

// ---------- Start menu ----------

function setStartMenu(open: boolean) {
  if (!startMenu || !startButton) return;
  startMenu.hidden = !open;
  startButton.setAttribute('aria-expanded', String(open));
  if (open) startMenu.querySelector<HTMLElement>('a, button')?.focus();
}
startButton?.addEventListener('click', () => setStartMenu(Boolean(startMenu?.hidden)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && startMenu && !startMenu.hidden) {
    setStartMenu(false);
    startButton?.focus();
  }
});

// ---------- Clock ----------

function tick() {
  if (!clock) return;
  const now = new Date();
  const fmt: Intl.DateTimeFormatOptions =
    clock.dataset.format === 'long'
      ? { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
      : { hour: 'numeric', minute: '2-digit' };
  clock.textContent = now.toLocaleString([], fmt);
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

const startId = location.hash.slice(1);
if (windows.has(startId)) openWindow(startId, { updateHash: false });
else if (!mobile.matches && desktop.dataset.first) openWindow(desktop.dataset.first, { updateHash: false });
