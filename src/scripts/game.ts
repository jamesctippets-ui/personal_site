// BUG SWAT: a tiny original arcade shooter launched by the PLAY command.
//
// You are the patch cannon at the bottom of the screen. Rows of software bugs
// march side to side and creep down; swat them before they reach you. Bugs
// drop error packets, and a squashed bug sometimes drops a coffee that gives
// rapid fire for a few seconds. Drawn on a canvas in the current phosphor color.
//
// Keyboard: Left/Right or A/D move, Space/Up/W fire, P pauses, Esc or Q quits,
// Enter starts again after game over. Touch: the on-screen buttons.

interface Bug {
  x: number;
  y: number;
  kind: 0 | 1;
  alive: boolean;
}
interface Shot {
  x: number;
  y: number;
  vy: number;
}
interface Drop {
  x: number;
  y: number;
}

// Logical play field; the canvas scales this up with crisp pixels.
const W = 240;
const H = 200;
const PLAYER_Y = H - 14;

// Original 8x8 pixel sprites, two animation frames each.
const BUGS = [
  [
    ['..#..#..', '...##...', '.######.', '##.##.##', '.######.', '#.####.#', '..#..#..', '.#....#.'],
    ['..#..#..', '...##...', '.######.', '##.##.##', '.######.', '.#.##.#.', '#..##..#', '..#..#..'],
  ],
  [
    ['#......#', '.#.##.#.', '..####..', '.##..##.', '########', '..####..', '.#.##.#.', '#......#'],
    ['........', '##.##.##', '..####..', '.##..##.', '########', '..####..', '#..##..#', '.#....#.'],
  ],
];
const CANNON = ['.....#.....', '....###....', '..#######..', '.#########.', '###.###.###', '###########'];
const COFFEE = ['.#.#.', '#####', '#####', '####.', '.###.'];

function sprite(ctx: CanvasRenderingContext2D, rows: string[], x: number, y: number) {
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      if (rows[r][c] === '#') ctx.fillRect(Math.round(x) + c, Math.round(y) + r, 1, 1);
    }
  }
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = className;
  if (text) e.textContent = text;
  return e;
}

export interface GameResult {
  score: number;
  best: number;
  wave: number;
}

let running = false;

/** Opens BUG SWAT over the page. Resolves when the player quits. */
export function playBugSwat(): Promise<GameResult> {
  if (running) return Promise.resolve({ score: 0, best: 0, wave: 0 });
  running = true;

  const css = getComputedStyle(document.documentElement);
  const color = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  const FG = color('--fg', '#3dff6e');
  const DIM = color('--dim', '#1f9c43');
  const BRIGHT = color('--bright', '#c8ffd6');
  const BG = color('--bg', '#050a05');

  let best = 0;
  try {
    best = Number(localStorage.getItem('jos-bugswat-best')) || 0;
  } catch {
    /* storage unavailable */
  }

  // ---------- DOM ----------
  const root = el('div', 'game');
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', 'BUG SWAT game');
  const hud = el('div', 'game-hud');
  const title = el('span', 'inv', ' BUG SWAT ');
  const scoreEl = el('span', '');
  const livesEl = el('span', '');
  const bestEl = el('span', 'dim');
  const quit = el('button', 'game-quit', '[ Esc: Quit ]');
  quit.type = 'button';
  hud.append(title, scoreEl, livesEl, bestEl, quit);
  const stage = el('div', 'game-stage');
  const canvas = el('canvas', 'game-canvas');
  canvas.width = W;
  canvas.height = H;
  canvas.setAttribute('aria-label', 'Play field');
  stage.append(canvas);
  const help = el('p', 'game-help dim', 'Left/Right move · Space fire · P pause · Esc quit');
  const pad = el('div', 'game-pad');
  const left = el('button', '', '◀');
  const fire = el('button', 'fire', 'FIRE');
  const right = el('button', '', '▶');
  left.setAttribute('aria-label', 'Move left');
  right.setAttribute('aria-label', 'Move right');
  for (const b of [left, fire, right]) b.type = 'button';
  pad.append(left, fire, right);
  root.append(hud, stage, help, pad);
  document.body.append(root);

  const ctx = canvas.getContext('2d')!;

  // Scale the canvas to the largest whole-number multiple that fits.
  const fit = () => {
    const box = stage.getBoundingClientRect();
    const fitScale = Math.min(box.width / W, box.height / H);
    // Whole-number steps stay crisp on big screens; small screens just fill the space.
    const scale = fitScale >= 2 ? Math.floor(fitScale) : Math.max(0.5, fitScale);
    canvas.style.width = `${W * scale}px`;
    canvas.style.height = `${H * scale}px`;
  };
  fit();
  window.addEventListener('resize', fit);

  // ---------- State ----------
  const keys = { left: false, right: false, fire: false };
  let px = W / 2 - 5;
  let lives = 3;
  let score = 0;
  let wave = 0;
  let bugs: Bug[] = [];
  let dir = 1;
  let marchTimer = 0;
  let frame = 0;
  let shots: Shot[] = [];
  let bombs: Shot[] = [];
  let drops: Drop[] = [];
  let cooldown = 0;
  // A tap of the fire key can start and end between two frames; remember it.
  let fireQueued = false;
  let rapid = 0;
  let invuln = 0;
  let paused = false;
  let over = false;
  let banner = '';
  let bannerTime = 0;
  let raf = 0;
  let last = performance.now();

  function newWave() {
    wave++;
    bugs = [];
    const rows = Math.min(3 + Math.floor(wave / 2), 5);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 8; c++) {
        bugs.push({ x: 28 + c * 22, y: 24 + r * 16 + Math.min(wave - 1, 4) * 4, kind: (r % 2) as 0 | 1, alive: true });
      }
    }
    dir = 1;
    shots = [];
    bombs = [];
    banner = `WAVE ${wave}`;
    bannerTime = 1.4;
  }

  function reset() {
    lives = 3;
    score = 0;
    wave = 0;
    px = W / 2 - 5;
    rapid = 0;
    invuln = 0;
    drops = [];
    over = false;
    newWave();
  }

  function hud_() {
    scoreEl.textContent = `SCORE ${String(score).padStart(5, '0')}`;
    livesEl.textContent = `LIVES ${'♥'.repeat(Math.max(lives, 0)) || '-'}`;
    bestEl.textContent = `HI ${String(Math.max(best, score)).padStart(5, '0')}`;
  }

  function hit(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function loseLife() {
    if (invuln > 0) return;
    lives--;
    invuln = 1.5;
    bombs = [];
    if (lives <= 0) gameOver();
  }

  function gameOver() {
    over = true;
    if (score > best) {
      best = score;
      try {
        localStorage.setItem('jos-bugswat-best', String(best));
      } catch {
        /* ignore */
      }
    }
  }

  // ---------- Update ----------
  function update(dt: number) {
    if (bannerTime > 0) bannerTime -= dt;
    if (paused || over) return;
    const alive = bugs.filter((b) => b.alive);

    // Player
    const speed = 110;
    if (keys.left) px -= speed * dt;
    if (keys.right) px += speed * dt;
    px = Math.max(2, Math.min(W - 13, px));
    cooldown -= dt;
    rapid = Math.max(0, rapid - dt);
    invuln = Math.max(0, invuln - dt);
    if ((keys.fire || fireQueued) && cooldown <= 0 && shots.length < (rapid ? 4 : 1)) {
      fireQueued = false;
      shots.push({ x: px + 5, y: PLAYER_Y - 3, vy: -190 });
      cooldown = rapid ? 0.12 : 0.3;
    }

    // Bugs march: faster as they thin out and as waves go up.
    const interval = Math.max(0.06, (0.55 - wave * 0.04) * (alive.length / bugs.length) + 0.04);
    marchTimer += dt;
    if (marchTimer >= interval) {
      marchTimer = 0;
      frame ^= 1;
      const minX = Math.min(...alive.map((b) => b.x));
      const maxX = Math.max(...alive.map((b) => b.x + 8));
      if ((dir > 0 && maxX + 3 > W - 2) || (dir < 0 && minX - 3 < 2)) {
        dir = -dir;
        for (const b of alive) b.y += 6;
      } else {
        for (const b of alive) b.x += 3 * dir;
      }
    }

    // Bugs drop error packets from the lowest bug in a random column.
    if (alive.length && Math.random() < dt * (0.9 + wave * 0.25)) {
      const shooter = alive[Math.floor(Math.random() * alive.length)];
      const lowest = alive
        .filter((b) => Math.abs(b.x - shooter.x) < 4)
        .reduce((a, b) => (b.y > a.y ? b : a), shooter);
      bombs.push({ x: lowest.x + 3, y: lowest.y + 8, vy: 70 + wave * 6 });
    }

    // Shots
    for (const s of shots) s.y += s.vy * dt;
    shots = shots.filter((s) => {
      if (s.y < -4) return false;
      for (const b of alive) {
        if (b.alive && hit(s.x, s.y, 1, 4, b.x, b.y, 8, 8)) {
          b.alive = false;
          score += b.kind ? 20 : 10;
          if (Math.random() < 0.07 && !drops.length) drops.push({ x: b.x + 1, y: b.y });
          return false;
        }
      }
      return true;
    });

    for (const s of bombs) s.y += s.vy * dt;
    bombs = bombs.filter((s) => {
      if (s.y > H) return false;
      if (hit(s.x, s.y, 2, 4, px, PLAYER_Y, 11, 6)) {
        loseLife();
        return false;
      }
      return true;
    });

    for (const d of drops) d.y += 40 * dt;
    drops = drops.filter((d) => {
      if (d.y > H) return false;
      if (hit(d.x, d.y, 5, 5, px, PLAYER_Y, 11, 6)) {
        rapid = 6;
        score += 50;
        banner = 'COFFEE! RAPID FIRE';
        bannerTime = 1.2;
        return false;
      }
      return true;
    });

    if (alive.some((b) => b.alive && b.y + 8 >= PLAYER_Y)) {
      lives = 0;
      gameOver();
    } else if (!bugs.some((b) => b.alive)) {
      score += 100 * wave;
      newWave();
    }
  }

  // ---------- Draw ----------
  function draw(now: number) {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = DIM;
    ctx.fillRect(0, H - 4, W, 1);

    for (const b of bugs) {
      if (!b.alive) continue;
      ctx.fillStyle = b.kind ? BRIGHT : FG;
      sprite(ctx, BUGS[b.kind][frame], b.x, b.y);
    }
    ctx.fillStyle = BRIGHT;
    for (const s of shots) ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 4);
    ctx.fillStyle = FG;
    for (const s of bombs) {
      // A little zigzag "error packet".
      const zig = Math.floor(s.y / 3) % 2;
      ctx.fillRect(Math.round(s.x) + zig, Math.round(s.y), 1, 2);
      ctx.fillRect(Math.round(s.x) + 1 - zig, Math.round(s.y) + 2, 1, 2);
    }
    ctx.fillStyle = BRIGHT;
    for (const d of drops) sprite(ctx, COFFEE, d.x, d.y);

    const blink = invuln > 0 && Math.floor(now / 100) % 2 === 0;
    if (!over && !blink) {
      ctx.fillStyle = rapid ? BRIGHT : FG;
      sprite(ctx, CANNON, px, PLAYER_Y);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '12px VT323, monospace';
    if (over) {
      ctx.fillStyle = BRIGHT;
      ctx.fillText('SYSTEM COMPROMISED', W / 2, H / 2 - 16);
      ctx.fillStyle = FG;
      ctx.fillText(`SCORE ${score}   HI ${best}`, W / 2, H / 2);
      ctx.fillStyle = DIM;
      ctx.fillText('ENTER / FIRE: PLAY AGAIN    ESC: QUIT', W / 2, H / 2 + 16);
    } else if (paused) {
      ctx.fillStyle = BRIGHT;
      ctx.fillText('PAUSED  (P TO RESUME)', W / 2, H / 2);
    } else if (bannerTime > 0) {
      ctx.fillStyle = BRIGHT;
      ctx.fillText(banner, W / 2, H / 2 + 10);
    }
    hud_();
  }

  function loop(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    draw(now);
    raf = requestAnimationFrame(loop);
  }

  // ---------- Input ----------
  const KEYMAP: Record<string, keyof typeof keys> = {
    ArrowLeft: 'left',
    a: 'left',
    A: 'left',
    ArrowRight: 'right',
    d: 'right',
    D: 'right',
    ' ': 'fire',
    ArrowUp: 'fire',
    w: 'fire',
    W: 'fire',
  };

  let resolveDone: (r: GameResult) => void;
  const done = new Promise<GameResult>((r) => (resolveDone = r));

  function close() {
    cancelAnimationFrame(raf);
    window.removeEventListener('keydown', onKeyDown, true);
    window.removeEventListener('keyup', onKeyUp, true);
    window.removeEventListener('resize', fit);
    document.removeEventListener('visibilitychange', onVisibility);
    root.remove();
    running = false;
    if (score > best) best = score;
    resolveDone({ score, best, wave });
  }

  // Capture phase on window runs before the terminal's document listeners, so
  // stopping propagation keeps keystrokes out of the prompt while playing.
  function onKeyDown(e: KeyboardEvent) {
    e.stopImmediatePropagation();
    const k = KEYMAP[e.key];
    if (k) {
      e.preventDefault();
      if (k === 'fire' && over) {
        reset();
        return;
      }
      keys[k] = true;
      if (k === 'fire') fireQueued = true;
    } else if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q') {
      e.preventDefault();
      close();
    } else if (e.key === 'p' || e.key === 'P') {
      paused = !paused;
    } else if (e.key === 'Enter' && over) {
      e.preventDefault();
      reset();
    }
  }
  function onKeyUp(e: KeyboardEvent) {
    e.stopImmediatePropagation();
    const k = KEYMAP[e.key];
    if (k) keys[k] = false;
  }
  function onVisibility() {
    if (document.hidden && !over) paused = true;
  }

  // Touch / mouse buttons: hold to move or fire.
  const hold = (btn: HTMLElement, k: keyof typeof keys) => {
    const on = (e: PointerEvent) => {
      e.preventDefault();
      if (k === 'fire' && over) {
        reset();
        return;
      }
      keys[k] = true;
      if (k === 'fire') fireQueued = true;
      btn.setPointerCapture?.(e.pointerId);
    };
    const off = () => (keys[k] = false);
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointercancel', off);
    btn.addEventListener('lostpointercapture', off);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  };
  hold(left, 'left');
  hold(right, 'right');
  hold(fire, 'fire');
  quit.addEventListener('click', close);

  window.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('keyup', onKeyUp, true);
  document.addEventListener('visibilitychange', onVisibility);
  (document.activeElement as HTMLElement | null)?.blur?.();

  reset();
  raf = requestAnimationFrame(loop);
  return done;
}
