/*
 * games/sort/game.js -- the sort game, a sorting line (2026-11-07, spec §5
 * game 4, plan Task 22). From the engine's drag-drop and matching-dropdown
 * components, tap to place, made a game: a hopper throws items onto a belt two
 * at a time, they ride toward a drop, and each must reach its bin before it
 * falls -- the one nearest the drop first. The belt is the clock, hearts the
 * stakes, a streak multiplies the points, and quick right sends speed the belt
 * and fill it.
 *
 * Plays (WCAG 2.2 SC 2.5.7): the item nearest the drop is ACTIVE; a tap on a
 * bin sends it there; a tap on another item makes that one active; a drag
 * onto a bin does the same; Tab to a bin and Enter or Space, or its number.
 *
 * Reports one `performance` row per item, first outcome only: response the
 * bin's ASCII id (result correct when it is the item's bin, latency from the
 * item's coming on); a fall is `none`/`wrong` at once; an item never met is
 * `none`/`wrong` when the debrief opens; a practice round reports nothing.
 * Our own code. Colours from base.css variables; randomness seeded by ids.
 */
import {
  announce, debrief, el, finish, GameContentError, latencyFrom, onRestore, readContent, registerTest, save, setting,
} from '../core/game-core.js';

const ID = '^[A-Za-z0-9_-]{1,64}$';

/** content.schema.json without its descriptions: what readContent enforces
 *  (the core ignores `maxItems`; the bins' count is checked below). */
export const SHAPE = {
  'x-points': 'items[]',
  type: 'object',
  required: ['title', 'bins', 'items'],
  properties: {
    title: { type: 'string', minLength: 1 },
    bins: {
      type: 'array',
      minItems: 2,
      maxItems: 4,
      items: {
        type: 'object',
        required: ['id', 'label'],
        properties: {
          id: { type: 'string', pattern: ID },
          label: { type: 'string', minLength: 1 },
        },
      },
    },
    items: {
      type: 'array',
      minItems: 2,
      items: {
        type: 'object',
        required: ['id', 'label', 'bin', 'rule', 'source'],
        properties: {
          id: { type: 'string', pattern: ID },
          label: { type: 'string', minLength: 1 },
          bin: { type: 'string', pattern: ID },
          rule: { type: 'string', minLength: 1 },
          source: { type: 'string' },
        },
      },
    },
  },
};

/* Every gameplay value; render_slide may pass `duration` and `lives`.
 * ARRIVALS ARE THE HOPPER'S, NOT THE LEARNER'S (review of 2026-11-07). The
 * next item used to come the moment the belt was empty, so a learner who
 * answered in a second only ever saw ONE item: a timed question. Now the
 * hopper throws `wave` items at once, spread along the belt, so there is
 * always one to choose first; the next throw comes `beat` after the belt
 * empties, or `gap` after the last throw while items still ride.
 * THE LINE FOLLOWS THE LEARNER'S PACE, NOT THE STREAK. The hopper can drop
 * a card only once the last has moved a card's width, so at the plain speed
 * it feeds one item per ~2 s, and a learner who sorts in a second never has
 * more than one or two to choose from. A right send within `rush` seconds of
 * the item lighting up is quick; from `hotAt` quick right sends in a row the
 * line is HOT: the belt eases toward the speed at which the hopper feeds as
 * fast as the learner sorts (`match` / their pace, at most `speedMax`), and
 * the hopper throws three at once the moment there is room for three -- so
 * a quick learner meets three or four at a time and sorts the front one
 * first. Slower than `rush` the line stays plain, so a slow reader is never
 * hurried. A fall is still a `none` row and a heart, so a wrong bin, a fall
 * or a slow send cools a hot line at once. */
const RULES = {
  hearts: 3,
  cross: 8.5, // seconds an item rides the whole belt, at the start
  wave: 2, // items in one throw
  gap: 7, // the longest wait between two throws
  beat: 0.6, // the wait after the belt empties
  spacing: 0.24, // share of the belt between two thrown items: a card and a gap
  rush: 1.75,
  hotAt: 2,
  match: 2.04, // spacing x cross: a hot hopper feeds at the learner's pace
  speedMax: 2.2,
  comboEvery: 3, // every this many right in a row raises the multiplier
  comboMax: 3,
  points: 10,
  flight: 0.45, // seconds an item flies into its bin
  fall: 0.6, // seconds an item takes to fall off the end
  warnAt: 0.72, // the share of the belt after which an item flashes
};
const WORLD = { w: 1280, h: 720 };
const BELT = { left: 64, top: 150, height: 140, start: 1150, end: 112 };
const ENTER_S = 0.4; // an item is thrown from the hopper before it can be sent
const THROW_S = 0.18; // between two items of one throw
const BELT_Y = BELT.top + BELT.height / 2;
const MIN_LIFE = 1.5;
const END_PAUSE_MS = 700;
const MAX_BINS = 4;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : (v > b ? b : v));
/* Ids are the content's: `constructor` or `__proto__` is a valid one, so every
 * map keyed by them has no prototype and is read by own key only. */
const own = (map, key) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(map, key);
const blank = () => Object.create(null);

function int(name, low, high) {
  const value = setting(name);
  return value === null ? null : clamp(value, low, high);
}

/** mulberry32, seeded by text: the same content draws the same sparks. */
function seeded(text) {
  let h = 2166136261;
  for (const ch of text) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** What the core's shape cannot see, refused the core's way: box, ONE error, no hooks. */
function refuse(root, arabic, english, named) {
  root.setAttribute('data-screen', 'error');
  root.classList.add('game-root');
  root.replaceChildren(el('div', { class: 'game-error', role: 'alert' },
    el('p', { class: 'game-error-title', text: 'تعذّر تشغيل اللعبة: محتواها لا يطابق شكلها.' }),
    el('p', { text: arabic }),
    el('p', {}, el('span', { class: 'ltr-inline', dir: 'ltr', text: named }))));
  console.error(`[game] ${arabic} ${english}`);
}

function boot() {
  const root = document.getElementById('game');
  if (!root) {
    console.error('[game] لا يوجد عنصر #game في الصفحة. The page has no <div id="game">; get_template hands one out.');
    return;
  }
  let content;
  try {
    content = readContent(SHAPE);
  } catch (error) {
    if (error instanceof GameContentError) { return; }
    throw error;
  }
  const { items, bins } = content;
  if (bins.length > MAX_BINS) {
    refuse(root, `في المحتوى ${bins.length} سلال، واللعبة تتسع لأربع على الأكثر.`,
      `bins holds ${bins.length}; the line has room for at most ${MAX_BINS}.`, 'bins');
    return;
  }
  const binOf = blank();
  bins.forEach((bin, i) => { binOf[bin.id] = { ...bin, index: i }; });
  const stray = items.find((item) => !own(binOf, item.bin));
  if (stray) {
    const at = `items[${items.indexOf(stray)}].bin = "${stray.bin}"`;
    refuse(root, `العنصر «${stray.label}» يذهب إلى سلة «${stray.bin}»، ولا سلة بهذا المعرّف.`,
      `${at} names no bin; it takes one of ${bins.map((b) => b.id).join(', ')}.`, at);
    return;
  }
  root.classList.add('game-root', 'so');

  const R = { ...RULES, hearts: int('lives', 1, 5) || RULES.hearts };
  /** The bin play('wrong') takes: the first declared bin that is not the item's. */
  const wrongBin = (item) => bins.find((bin) => bin.id !== item.bin).id;
  const resultOf = (item, response) => (response === item.bin ? 'correct' : 'wrong');
  const multiplier = (streak) => Math.min(R.comboMax, 1 + Math.floor(streak / R.comboEvery));

  /* base.css colours, so deck.css reaches the canvas; literals only without a sheet. */
  const css = getComputedStyle(document.documentElement);
  const colour = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
  const C = {
    floor: colour('--color-surface', '#f8fafc'),
    belt: colour('--color-text', '#1e293b'),
    rail: colour('--color-text-secondary', '#64748b'),
    good: colour('--color-success', '#10b981'),
    bad: colour('--color-error', '#ef4444'),
    pit: colour('--color-error-bg', '#fef2f2'),
    spark: colour('--color-accent', '#f97316'),
    ink: colour('--color-text', '#1e293b'),
    paper: colour('--color-surface-elevated', '#ffffff'),
    font: colour('--font-heading', 'system-ui, sans-serif'),
  };

  const state = {
    screen: 'intro', // intro | play | won | lost | debrief | done | sheet
    outcomes: blank(), // item id -> the FIRST outcome: a bin id, or none
    preview: null, // outcomes a moment shows without anyone acting
    paused: false,
    muted: true,
  };
  let round = null;
  let raf = 0;
  let offScreen = false;
  const left = () => items.filter((item) => !own(state.outcomes, item.id));

  function persist() {
    save({ outcomes: state.outcomes, finished: state.screen === 'done' });
  }

  /** The first outcome of an item, reported once; a replay's is practice. */
  function record(item, response, ms) {
    if (own(state.outcomes, item.id)) { return false; }
    state.outcomes[item.id] = response;
    const decision = { id: item.id, type: 'performance', response, result: resultOf(item, response) };
    if (response !== 'none') { decision.latency = latencyFrom(ms); }
    announce(decision);
    persist();
    return true;
  }


  let audio = null;
  function tones(notes) {
    if (state.muted) { return; }
    try {
      if (!audio) {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) { return; }
        audio = new Context();
      }
      if (audio.state === 'suspended') { audio.resume().catch(() => {}); }
      const now = audio.currentTime;
      for (const [freq, at, length, wave, volume] of notes) {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, now + at);
        gain.gain.setValueAtTime(0.0001, now + at);
        gain.gain.linearRampToValueAtTime(volume, now + at + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + at + length);
        osc.connect(gain).connect(audio.destination);
        osc.start(now + at);
        osc.stop(now + at + length + 0.03);
      }
    } catch (error) { /* a sound never stops the game */ }
  }
  const sfx = {
    send: () => tones([[620, 0, 0.06, 'sine', 0.035]]),
    drop: () => tones([[294, 0, 0.07, 'triangle', 0.04], [392, 0.06, 0.08, 'triangle', 0.04]]),
    right: (m) => tones([[523 * (1 + 0.12 * (m - 1)), 0, 0.09, 'triangle', 0.07],
      [784 * (1 + 0.12 * (m - 1)), 0.07, 0.14, 'triangle', 0.07]]),
    wrong: () => tones([[196, 0, 0.16, 'square', 0.045], [147, 0.12, 0.22, 'square', 0.045]]),
    fall: () => tones([[440, 0, 0.1, 'sine', 0.05], [330, 0.09, 0.1, 'sine', 0.05], [220, 0.18, 0.2, 'sine', 0.05]]),
    win: () => tones([[523, 0, 0.1, 'triangle', 0.07], [659, 0.1, 0.1, 'triangle', 0.07], [784, 0.2, 0.22, 'triangle', 0.07]]),
    lose: () => tones([[330, 0, 0.2, 'sawtooth', 0.04], [247, 0.18, 0.32, 'sawtooth', 0.04]]),
  };


  /** Belt time and the longest gap between throws; `duration` squeezes the
   *  round into at most its seconds. */
  function schedule(n) {
    const asked = int('duration', 3, 120);
    let life = R.cross;
    let gap = R.gap;
    if (asked !== null) {
      const throws = Math.ceil(n / R.wave);
      life = clamp(asked * 0.45, MIN_LIFE, R.cross);
      gap = Math.min(R.gap, throws > 1 ? (asked - life) / (throws - 1) : 0);
    }
    return { life, gap };
  }

  function newRound(list, practice) {
    const { life, gap } = schedule(list.length);
    return {
      list, practice, life, gap,
      rand: seeded(list.map((item) => item.id).join(',')),
      t: 0, last: 0, next: 0, since: 0, idle: 0, belt: 0, done: 0, kick: 0, speed: 1, pace: R.rush,
      queue: [], entries: [], particles: [], floaters: [],
      hearts: R.hearts, score: 0, streak: 0, hot: 0, best: 0, right: 0, shake: 0,
      chosen: null, drag: null, dragEnded: 0, endAt: null, won: null,
    };
  }

  /** The hopper's next throw: `wave` items (one more on a hot line) onto
   *  spots `spacing` apart, the first in the content's order farthest along,
   *  behind the last item riding. Hot, it throws when the whole wave fits;
   *  plain, on its beat or its gap with as many as fit. */
  function hopper(dt) {
    const r = round;
    const riding = r.entries.filter((e) => e.state === 'belt' || e.state === 'held');
    const hot = r.hot >= R.hotAt;
    r.since += dt;
    r.idle = riding.length + r.queue.length ? 0 : r.idle + dt;
    const room = Math.floor(Math.min(...riding.map((e) => e.p)) / R.spacing);
    const want = Math.min(hot ? R.wave + 1 : R.wave, r.list.length - r.next);
    const k = Math.min(want, room);
    const due = hot ? k === want : r.next === 0 || r.idle >= Math.min(R.beat, r.gap) || r.since >= r.gap;
    if (k > 0 && !r.queue.length && due) {
      for (let j = 0; j < k; j += 1) {
        r.queue.push({ item: r.list[r.next + j], p: (k - 1 - j) * R.spacing, at: r.t + j * THROW_S });
      }
      r.next += k;
      r.since = 0;
      r.idle = 0;
      r.kick = 0.3;
      sfx.drop();
    }
    while (r.queue.length && r.queue[0].at <= r.t) {
      const { item, p } = r.queue.shift();
      spawn(item, p);
    }
  }

  function startRound() {
    const list = left().length ? left() : items; // a replay sorts every item again
    round = newRound(list, left().length === 0);
    state.paused = false;
    show('play');
    raf = requestAnimationFrame(frame);
  }

  /** The belt eases toward the learner's pace while they sort quickly and right. */
  function pace(dt) {
    const r = round;
    const target = r.hot >= R.hotAt ? clamp(R.match / r.pace, 1, R.speedMax) : 1;
    r.speed += (target - r.speed) * Math.min(1, dt * (target > r.speed ? 1.2 : 4));
  }

  function spawn(item, p = 0) {
    const node = el('button', {
      type: 'button', class: 'so-item', 'data-item': item.id, 'aria-pressed': 'false',
      'aria-label': `${item.label}. انقره لتختاره، ثم اختر سلّته.`,
    }, el('span', { class: 'so-item-label', text: item.label }));
    root.querySelector('[data-items]').append(node);
    const entry = {
      item, node, p, enter: 0, x: BELT.start, y: BELT_Y, born: round.t, state: 'belt',
      w: node.offsetWidth || 232, h: node.offsetHeight || 90, seed: round.rand() * TAU,
    };
    round.entries.push(entry);
    place(entry);
    say(`على الخط: ${item.label}`);
    return entry;
  }

  /** The item a bin tap sends: the one the learner picked, else the one
   *  nearest the drop once out of the hopper -- nobody sorts what they could
   *  not read. */
  function activeEntry() {
    if (!round) { return null; }
    const riding = round.entries.filter((e) => e.state === 'belt');
    return riding.find((e) => e.item.id === round.chosen)
      || riding.filter((e) => e.enter >= 1).reduce((best, e) => (!best || e.p > best.p ? e : best), null);
  }

  function markActive() {
    if (!round) { return; }
    const active = activeEntry();
    for (const e of round.entries) {
      const on = e === active;
      if (on !== e.node.hasAttribute('data-active')) {
        if (on) { e.lit = round.t; }
        e.node.toggleAttribute('data-active', on);
        e.node.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      const warn = e.state === 'belt' && e.p >= R.warnAt;
      if (warn !== e.node.hasAttribute('data-warn')) { e.node.toggleAttribute('data-warn', warn); }
    }
  }

  function binNode(id) { return root.querySelector(`[data-bin="${id}"]`); }

  function mouthOf(id) {
    const node = binNode(id);
    const row = node.parentElement;
    return { x: row.offsetLeft + node.offsetLeft + node.offsetWidth / 2, y: row.offsetTop + node.offsetTop + 28 };
  }

  function place(e) {
    let { x, y } = e;
    let turn = 0;
    let size = 1;
    let fade = 1;
    if (e.state === 'belt') {
      x = BELT.start - e.p * (BELT.start - BELT.end);
      y = BELT_Y + Math.sin(round.belt / 26 + e.seed) * 1.6;
      if (e.enter < 1) {
        // Thrown out of the hopper onto its spot, with a little overshoot.
        const k = e.enter - 1;
        const far = BELT.start - x;
        size = 0.55 + 0.45 * (1 + 2.7 * k * k * k + 1.7 * k * k);
        x = BELT.start - far * (1 - k * k);
        y -= 60 * k * k + Math.min(70, far * 0.3) * 4 * e.enter * -k;
      }
    } else if (e.state === 'held') {
      ({ x, y } = e.hold);
      turn = -4;
      size = 1.07;
    } else if (e.state === 'flying') {
      const k = clamp(e.fly, 0, 1);
      x = e.from.x + (e.to.x - e.from.x) * k;
      y = e.from.y + (e.to.y - e.from.y) * k - 150 * 4 * k * (1 - k);
      turn = (e.to.x < e.from.x ? -1 : 1) * 18 * k;
      size = 1 - 0.5 * k;
    } else if (e.state === 'falling') {
      const k = clamp(e.fly, 0, 1);
      x = e.from.x - 70 * k;
      y = e.from.y + 430 * k * k;
      turn = -55 * k;
      fade = 1 - k;
    }
    e.x = x;
    e.y = y;
    e.node.style.transform = `translate(${x - e.w / 2}px, ${y - e.h / 2}px) rotate(${turn}deg) scale(${size})`;
    if (fade < 1) { e.node.style.opacity = String(fade); }
  }

  /** The decision is reported at the send; its cost comes at the landing. */
  function send(entry, binId) {
    const r = round;
    if (!r || r.endAt !== null || state.paused || !entry || !own(binOf, binId)) { return false; }
    if (entry.state !== 'belt' && entry.state !== 'held') { return false; }
    const hadFocus = document.activeElement === entry.node;
    entry.state = 'flying';
    entry.fly = 0;
    entry.bin = binId;
    const took = entry.lit === undefined ? R.rush * 2 : r.t - entry.lit;
    entry.quick = took <= R.rush;
    r.pace = 0.6 * r.pace + 0.4 * took;
    entry.from = { x: entry.x, y: entry.y };
    entry.to = mouthOf(binId);
    entry.node.disabled = true;
    entry.node.dataset.outcome = binId;
    if (r.chosen === entry.item.id) { r.chosen = null; }
    r.done += 1;
    record(entry.item, binId, (r.t - entry.born) * 1000);
    if (hadFocus) { binNode(binId).focus(); }
    markActive();
    sfx.send();
    return true;
  }

  function land(entry) {
    const r = round;
    entry.state = 'gone';
    entry.node.remove();
    const right = entry.bin === entry.item.bin;
    const count = binNode(entry.bin).querySelector('[data-count]');
    count.textContent = String(Number(count.textContent) + 1);
    if (right) {
      r.streak += 1;
      r.hot = entry.quick ? r.hot + 1 : 0;
      if (r.hot === R.hotAt) { floater(WORLD.w / 2, BELT.top + BELT.height + 70, 'الخط يُسرع!', C.spark); }
      r.best = Math.max(r.best, r.streak);
      r.right += 1;
      const m = multiplier(r.streak);
      r.score += R.points * m;
      consequence(entry.item, entry.bin, m);
      return;
    }
    r.streak = 0;
    r.hot = 0;
    r.hearts -= 1;
    consequence(entry.item, entry.bin, 1);
  }

  /** An item reaches the drop: a decision never made, now, and a heart. */
  function fall(entry) {
    const r = round;
    entry.state = 'falling';
    entry.fly = 0;
    entry.from = { x: entry.x, y: entry.y };
    entry.node.disabled = true;
    entry.node.dataset.outcome = 'none';
    entry.node.dataset.result = 'wrong';
    if (r.chosen === entry.item.id) { r.chosen = null; }
    r.done += 1;
    record(entry.item, 'none', 0);
    r.streak = 0;
    r.hot = 0;
    r.hearts -= 1;
    r.shake = 0.3;
    burst(BELT.left, BELT_Y, C.bad, 12);
    floater(BELT.left + 70, BELT_Y - 90, 'سقطت!', C.bad);
    hint(entry.item.bin);
    toast(entry.item, `سقطت قبل أن تُفرَز. مكانها: «${binOf[entry.item.bin].label}».`);
    sfx.fall();
  }

  /** A landing's look and sound; no score. */
  function consequence(item, binId, m) {
    const r = round;
    const node = binNode(binId);
    const mouth = mouthOf(binId);
    const right = binId === item.bin;
    node.dataset.hit = right ? 'right' : 'wrong';
    restart(node, 'data-anim', right ? 'gulp' : 'shake');
    if (right) {
      burst(mouth.x, mouth.y, C.good, 18);
      burst(mouth.x, mouth.y, C.spark, 8);
      floater(mouth.x, mouth.y - 50, `+${R.points * m}`, C.good);
      if (r.streak > 0 && r.streak % R.comboEvery === 0) {
        const raised = r.streak / R.comboEvery <= R.comboMax - 1;
        floater(WORLD.w / 2, BELT.top - 30, raised ? ['', '', 'نقاط مضاعفة!', 'ثلاثة أضعاف!'][m] : `سلسلة ${r.streak}!`, C.spark);
        restart(root.querySelector('[data-streak]'), 'data-anim', 'pop');
      }
      sfx.right(m);
      say(`${item.label} في «${binOf[binId].label}». أحسنت.`);
      return;
    }
    r.shake = 0.35;
    burst(mouth.x, mouth.y, C.bad, 14);
    floater(mouth.x, mouth.y - 50, '−♥', C.bad);
    hint(item.bin);
    toast(item, `ليست «${binOf[binId].label}». مكانها: «${binOf[item.bin].label}».`);
    sfx.wrong();
  }

  function restart(node, attr, value) {
    if (!node) { return; }
    node.removeAttribute(attr);
    void node.offsetWidth;
    node.setAttribute(attr, value);
    clearTimeout(node.animTimer);
    node.animTimer = setTimeout(() => node.removeAttribute(attr), 800);
  }

  function hint(binId) {
    const node = binNode(binId);
    if (!node) { return; }
    node.dataset.hint = 'right';
    clearTimeout(node.hintTimer);
    node.hintTimer = setTimeout(() => { delete node.dataset.hint; }, 1600);
  }

  function burst(x, y, color, n) {
    const { rand } = round;
    const many = matchMedia('(prefers-reduced-motion: reduce)').matches ? Math.ceil(n / 3) : n;
    for (let i = 0; i < many; i += 1) {
      const a = -Math.PI * rand();
      const sp = 120 + rand() * 260;
      round.particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, age: 0, life: 0.5 + rand() * 0.4, color, r: 3 + rand() * 4,
      });
    }
  }

  function floater(x, y, text, color) {
    round.floaters.push({ x, y, text, color, age: 0, life: 1.1 });
  }


  function update(dt) {
    const r = round;
    for (const p of r.particles) {
      p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 900 * dt;
    }
    r.particles = r.particles.filter((p) => p.age < p.life);
    for (const f of r.floaters) { f.age += dt; f.y -= 46 * dt; }
    r.floaters = r.floaters.filter((f) => f.age < f.life);
    if (r.shake > 0) { r.shake -= dt; }
    if (r.kick > 0) { r.kick -= dt; }
    const running = r.endAt === null;
    if (running) { pace(dt); }
    const step = (r.speed / r.life) * dt;
    if (running) {
      r.t += dt;
      r.belt += step * (BELT.start - BELT.end);
      hopper(dt);
    }
    for (const e of r.entries) {
      if (e.state === 'belt' || e.state === 'held') {
        if (running) { e.p += step; e.enter = Math.min(1, e.enter + dt / ENTER_S); }
        if (running && e.state === 'belt' && e.p >= 1) { fall(e); } else { place(e); }
      } else if (e.state === 'flying') {
        e.fly += dt / R.flight;
        if (e.fly >= 1) { land(e); } else { place(e); }
      } else if (e.state === 'falling') {
        e.fly += dt / R.fall;
        if (e.fly >= 1) { e.state = 'gone'; e.node.remove(); } else { place(e); }
      }
    }
    r.entries = r.entries.filter((e) => e.state !== 'gone');
    markActive();
    hud();
    if (running) {
      const busy = r.entries.length > 0 || r.queue.length > 0;
      if (r.hearts <= 0 || (r.next >= r.list.length && !busy)) {
        r.endAt = performance.now();
        r.won = r.hearts > 0;
        dropDrag();
      }
    }
  }

  let floor = null;
  let fx = null;
  let dpr = 1;
  let fit = 1;
  let ox = 0;
  let oy = 0;

  function resize() {
    const play = root.querySelector('[data-play]');
    if (!play) { return; }
    const w = play.clientWidth || WORLD.w;
    const h = play.clientHeight || WORLD.h;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    fit = Math.min(w / WORLD.w, h / WORLD.h);
    ox = (w - WORLD.w * fit) / 2;
    oy = (h - WORLD.h * fit) / 2;
    for (const canvas of [floor, fx]) {
      if (canvas) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    }
    const world = root.querySelector('[data-world]');
    if (world) { world.style.transform = `translate(${ox}px, ${oy}px) scale(${fit})`; }
  }

  function shakeOffset() {
    if (!round || round.shake <= 0 || matchMedia('(prefers-reduced-motion: reduce)').matches) { return [0, 0]; }
    const s = round.shake * 14;
    return [(round.rand() * 2 - 1) * s, (round.rand() * 2 - 1) * s];
  }

  function draw() {
    if (!round || !floor) { return; }
    const [sx, sy] = shakeOffset();
    const world = root.querySelector('[data-world]');
    world.style.translate = sx || sy ? `${sx * fit}px ${sy * fit}px` : '0 0';
    drawFloor(floor.getContext('2d'), sx, sy);
    drawFx(fx.getContext('2d'), sx, sy);
  }

  function toWorldCanvas(ctx, sx, sy) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(dpr * fit, 0, 0, dpr * fit, dpr * (ox + sx * fit), dpr * (oy + sy * fit));
  }

  function drawFloor(ctx, sx, sy) {
    toWorldCanvas(ctx, sx, sy);
    ctx.fillStyle = C.floor;
    ctx.fillRect(-40, -40, WORLD.w + 80, WORLD.h + 80);
    const { left, top, height } = BELT;
    // The drop: a striped chute past the belt's end.
    ctx.fillStyle = C.pit;
    ctx.fillRect(0, top - 10, left, height + 150);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, top - 10, left, height + 150);
    ctx.clip();
    ctx.strokeStyle = C.bad;
    ctx.lineWidth = 9;
    ctx.globalAlpha = 0.55;
    for (let k = -height; k < height + 300; k += 30) {
      ctx.beginPath();
      ctx.moveTo(0, top + k);
      ctx.lineTo(left, top + k - left);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = C.belt;
    ctx.fillRect(left, top, WORLD.w - left, height);
    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top + 10, WORLD.w - left, height - 20);
    ctx.clip();
    ctx.strokeStyle = C.rail;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 4;
    const slat = 46;
    const shift = round.belt % slat;
    for (let x = left - slat + (slat - shift); x < WORLD.w + slat; x += slat) {
      ctx.beginPath();
      ctx.moveTo(x, top + 12);
      ctx.lineTo(x - 14, top + height - 12);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = C.rail;
    ctx.fillRect(left, top, WORLD.w - left, 10);
    ctx.fillRect(left, top + height - 10, WORLD.w - left, 10);
    const turn = (round.belt / 18) % TAU;
    for (let x = left + 22; x < WORLD.w; x += 64) {
      ctx.fillStyle = C.rail;
      ctx.beginPath();
      ctx.arc(x, top + height + 14, 12, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = C.floor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(-turn) * 9, top + height + 14 + Math.sin(-turn) * 9);
      ctx.lineTo(x - Math.cos(-turn) * 9, top + height + 14 - Math.sin(-turn) * 9);
      ctx.stroke();
    }
    ctx.fillStyle = C.rail;
    ctx.beginPath();
    ctx.arc(left, top + height / 2, height / 2, Math.PI / 2, Math.PI * 1.5);
    ctx.fill();
    // The hopper the items are thrown out of, over the belt's start; it jolts.
    const jolt = round.kick > 0 ? Math.sin((round.kick / 0.3) * Math.PI) * 9 : 0;
    ctx.fillStyle = C.belt;
    ctx.beginPath();
    ctx.moveTo(BELT.start - 150, top - 64 - jolt);
    ctx.lineTo(BELT.start + 150, top - 64 - jolt);
    ctx.lineTo(BELT.start + 90, top - 6 - jolt);
    ctx.lineTo(BELT.start - 90, top - 6 - jolt);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.rail;
    ctx.fillRect(BELT.start - 150, top - 72 - jolt, 300, 10);
  }

  function drawFx(ctx, sx, sy) {
    toWorldCanvas(ctx, sx, sy);
    for (const p of round.particles) {
      ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `800 34px ${C.font}`;
    ctx.lineJoin = 'round';
    ctx.lineWidth = 7;
    ctx.strokeStyle = C.paper;
    for (const f of round.floaters) {
      const k = f.age / f.life;
      ctx.globalAlpha = Math.max(0, 1 - k * k);
      const grow = 1 + 0.25 * Math.max(0, 1 - k * 6);
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(grow, grow);
      ctx.direction = /[\u0600-\u06ff]/.test(f.text) ? 'rtl' : 'ltr';
      ctx.strokeText(f.text, 0, 0);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    if (!round || state.screen !== 'play') { return; }
    const dt = round.last ? Math.min(0.05, (now - round.last) / 1000) : 0;
    round.last = now;
    if (!state.paused && !offScreen) { update(dt); }
    draw();
    if (round.endAt !== null && performance.now() - round.endAt > END_PAUSE_MS) { endRound(); return; }
    raf = requestAnimationFrame(frame);
  }

  function endRound() {
    cancelAnimationFrame(raf);
    state.screen = round.won ? 'won' : 'lost';
    if (round.won) { sfx.win(); } else { sfx.lose(); }
    render();
  }


  function toast(item, line) {
    const box = root.querySelector('[data-toast]');
    if (!box) { return; }
    box.replaceChildren(el('strong', { text: `${item.label}: ` }), line, ' ', item.rule);
    box.hidden = false;
    clearTimeout(box.timer);
    box.timer = setTimeout(() => { box.hidden = true; }, 3400);
  }

  function say(text) {
    const live = root.querySelector('[data-say]');
    if (live) { live.textContent = text; }
  }

  function hud() {
    if (!round) { return; }
    const hearts = root.querySelector('[data-hearts]');
    if (!hearts) { return; }
    const full = Math.max(0, round.hearts);
    root.dataset.hearts = String(full);
    if (hearts.dataset.count !== String(full)) {
      const lost = hearts.dataset.count !== undefined && Number(hearts.dataset.count) > full;
      hearts.dataset.count = String(full);
      hearts.replaceChildren(
        el('span', { class: 'sr-only', text: `القلوب: ${full} من ${R.hearts}` }),
        ...Array.from({ length: R.hearts }, (_, i) => el('span', {
          class: 'so-heart', 'data-full': i < full ? 'true' : 'false', 'aria-hidden': 'true', text: '♥',
          'data-anim': lost && i === full ? 'break' : null,
        })));
    }
    root.querySelector('[data-score]').textContent = `النقاط: ${round.score}`;
    const m = multiplier(round.streak);
    const streak = root.querySelector('[data-streak]');
    streak.dataset.mult = String(m);
    streak.textContent = `سلسلة ${round.streak}${['', '', ' · النقاط ضعفان', ' · ثلاثة أضعاف'][m]}`;
    root.querySelector('[data-left]').textContent = `بقي ${round.list.length - round.done} من ${round.list.length}`;
    root.querySelector('[data-cue]').hidden = round.done > 0;
  }


  function toDebrief() {
    cancelAnimationFrame(raf);
    dropDrag();
    round = null;
    // Every item the learner never met is a decision never made: `none`,
    // reported once, now -- before the debrief that names it.
    for (const item of left()) {
      state.outcomes[item.id] = 'none';
      announce({ id: item.id, type: 'performance', response: 'none', result: 'wrong' });
    }
    persist();
    show('debrief');
  }

  function end() {
    if (state.screen !== 'debrief') { return; }
    state.screen = 'done';
    persist();
    finish();
    render();
  }

  function rowsFor(outcomes) {
    return items.map((item) => {
      const sent = own(outcomes, item.id) ? outcomes[item.id] : null;
      const met = own(binOf, sent);
      return {
        id: item.id, situation: `${item.label} · مكانها: ${binOf[item.bin].label}`,
        chosen: met ? binOf[sent].label : null, rule: item.rule, source: item.source,
        result: met ? resultOf(item, sent) : 'none',
      };
    });
  }


  function header(title, line) {
    return el('header', { class: 'so-head' },
      line ? el('p', { class: 'so-line', text: line }) : null,
      el('h2', { class: 'so-title', tabindex: '-1', 'data-focus': true, text: title }));
  }

  function soundButton() {
    return el('button', {
      type: 'button', class: 'btn-ghost so-sound', 'data-act': 'sound',
      'aria-pressed': state.muted ? 'false' : 'true', text: state.muted ? 'الصوت: مغلق' : 'الصوت: يعمل',
    });
  }

  /** The line in miniature beside the start screen. */
  function scene() {
    return el('div', { class: 'so-scene', 'aria-hidden': 'true' },
      el('div', { class: 'so-scene-belt' }, el('span', { class: 'so-scene-item', text: items[0].label })),
      el('div', { class: 'so-scene-bins' }, bins.map((bin, i) => el('span', {
        class: 'so-scene-bin', 'data-tone': String(i), text: bin.label,
      }))));
  }

  function introView() {
    const remaining = left().length;
    const resuming = remaining > 0 && remaining < items.length;
    return el('div', { class: 'so-intro' },
      el('div', { class: 'so-intro-text' },
        header(content.title, resuming
          ? `تابع: بقيت ${remaining} من ${items.length} عناصر`
          : `${items.length} عناصر إلى ${bins.length} سلال`),
        el('p', { text: 'يرمي القِمع العناصر على الخط، فتسير نحو حافته. أرسل كل عنصر إلى سلّته قبل أن يسقط، وابدأ بالأقرب إلى الحافة.' }),
        el('p', { text: `لديك ${R.hearts} قلوب: تخسر قلبًا إن وضعت عنصرًا في غير سلّته أو تركته يسقط. كل ${R.comboEvery} إجابات صحيحة متتالية تضاعف نقاطك، وكلما أسرعت في الفرز الصحيح أسرع الخط وكثرت عليه العناصر.` }),
        el('p', { class: 'so-how', text: `انقر سلّة لترسل إليها العنصر المضيء، أو انقر عنصرًا آخر لتختاره أولًا، أو اسحبه إلى سلّته. من لوحة المفاتيح: الأرقام 1 إلى ${bins.length}.` }),
        el('div', { class: 'so-actions' },
          el('button', {
            type: 'button', class: 'btn-primary', 'data-act': 'start', 'data-focus': true,
            text: resuming ? 'تابع' : 'ابدأ',
          }),
          soundButton())),
      scene());
  }

  function playView() {
    return el('div', { class: 'so-play', 'data-play': true },
      el('canvas', { class: 'so-floor', 'data-floor': true, 'aria-hidden': 'true' }),
      el('div', { class: 'so-world', 'data-world': true },
        el('div', { class: 'so-hud' },
          el('p', { class: 'so-hearts', 'data-hearts': true }),
          el('p', { class: 'so-score', 'data-score': true }),
          el('p', { class: 'so-streak', 'data-streak': true }),
          el('p', { class: 'so-left', 'data-left': true }),
          el('div', { class: 'so-hud-acts' },
            soundButton(),
            el('button', { type: 'button', class: 'btn-secondary', 'data-act': 'pause', text: 'إيقاف مؤقت' }))),
        el('div', { class: 'so-items', 'data-items': true, role: 'group', 'aria-label': 'العناصر على الخط' }),
        el('div', { class: 'so-bins', 'data-bins': true, 'data-many': String(bins.length), role: 'group', 'aria-label': 'السلال' },
          bins.map((bin, i) => el('button', {
            type: 'button', class: 'so-bin', 'data-bin': bin.id, 'data-tone': String(i),
            'aria-label': `سلة ${bin.label}، المفتاح ${i + 1}. ترسل إليها العنصر المختار.`,
            'data-focus': i === 0 ? true : null,
          },
          el('span', { class: 'so-bin-key', 'aria-hidden': 'true', text: String(i + 1) }),
          el('span', { class: 'so-bin-label', text: bin.label }),
          el('span', { class: 'so-bin-count', 'aria-hidden': 'true', 'data-count': true, text: '0' }),
          el('span', { class: 'so-bin-hint', text: 'هنا مكانها' })))),
        el('p', { class: 'so-cue', 'data-cue': true, text: `انقر سلّة العنصر المضيء أو اضغط رقمها (1 إلى ${bins.length}).` }),
        el('p', { class: 'so-toast', 'data-toast': true, role: 'status', hidden: true })),
      el('canvas', { class: 'so-fx', 'data-fx': true, 'aria-hidden': 'true' }),
      el('div', { class: 'so-paused', 'data-paused': true, hidden: true },
        el('p', { class: 'so-title', text: 'اللعبة متوقّفة' }),
        el('button', { type: 'button', class: 'btn-primary', 'data-act': 'resume', text: 'تابع اللعب' })),
      el('p', { class: 'sr-only', 'aria-live': 'polite', 'data-say': true }));
  }

  function endView() {
    const won = state.screen === 'won';
    const played = round ? round.list.length : items.length;
    const right = round ? round.right : 0;
    const practice = round && round.practice;
    const stars = !won ? 0 : (right === played ? 3 : (right >= played * 0.6 ? 2 : 1));
    const tile = (value, label) => el('p', { class: 'so-tile' },
      el('strong', { text: value }), el('span', { text: label }));
    return el('div', { class: 'so-end', 'data-end': state.screen },
      header(won ? 'انتهت الجولة!' : 'نفدت قلوبك', content.title),
      el('p', { class: 'so-stars' },
        el('span', { class: 'sr-only', text: won ? `${stars} من 3 نجوم` : 'لا قلوب' }),
        [0, 1, 2].map((i) => el('span', {
          class: 'so-star', 'aria-hidden': 'true', 'data-on': i < stars ? 'true' : 'false', text: won ? '★' : '♥',
        }))),
      el('div', { class: 'so-tiles' },
        tile(`${right} من ${played}`, 'في سلّتها'),
        tile(String(round ? round.score : 0), 'النقاط'),
        tile(String(round ? round.best : 0), 'أطول سلسلة')),
      practice ? el('p', { text: 'جولة تدريب: نتيجتك الأولى هي التي حُسبت.' }) : null,
      el('div', { class: 'so-actions' },
        el('button', {
          type: 'button', class: won ? 'btn-primary' : 'btn-secondary', 'data-act': 'debrief',
          'data-focus': won ? true : null, text: 'إلى الخلاصة',
        }),
        el('button', {
          type: 'button', class: won ? 'btn-secondary' : 'btn-primary', 'data-act': 'again',
          'data-focus': won ? null : true, text: won ? 'العب مرة أخرى' : 'حاول مرة أخرى',
        })));
  }

  function debriefView() {
    const done = state.screen === 'done';
    const outcomes = state.preview || state.outcomes;
    const right = items.filter((item) => outcomes[item.id] === item.bin).length;
    return el('div', { class: 'so-debrief' },
      header('خلاصة الجولة', `${content.title} · في سلّتها: ${right} من ${items.length}`),
      debrief(rowsFor(outcomes)),
      done
        ? el('p', { class: 'so-done', role: 'status', text: 'انتهيت. يمكنك المتابعة إلى الشريحة التالية.' })
        : el('div', { class: 'so-finish' },
          el('button', { type: 'button', class: 'btn-primary', 'data-act': 'finish', text: 'إنهاء' })));
  }

  /** moment=feedback-sheet: every item, its bin, rule and source. */
  function sheetView() {
    return el('div', { class: 'so-sheet', 'data-sheet': true },
      el('header', { class: 'so-sheet-head' },
        el('h2', { class: 'so-title', text: `ورقة المراجعة: ${content.title}` }),
        el('p', { class: 'so-line', 'data-sheet-count': true })),
      el('div', { class: 'so-sheet-items' }, items.map((item) => el('section', {
        class: 'so-sheet-item', 'data-sheet-point': item.id, 'data-tone': String(binOf[item.bin].index),
      },
      el('h3', { text: item.label }),
      el('p', {}, el('strong', { text: 'مكانها: ' }), `«${binOf[item.bin].label}»`),
      el('p', {}, el('strong', { text: 'القاعدة: ' }), item.rule),
      item.source ? el('p', { class: 'so-source', text: `المصدر: ${item.source}` }) : null))));
  }

  /** Whole rows of items per page, measured; `sheet=` picks the page. */
  function pageTheSheet() {
    const sheet = root.querySelector('[data-sheet]');
    const parts = [...sheet.querySelectorAll('[data-sheet-point]')];
    const bottom = root.getBoundingClientRect().top + root.clientHeight
      - parseFloat(getComputedStyle(root).paddingBlockEnd);
    const room = bottom - parts[0].getBoundingClientRect().top;
    const list = parts[0].parentElement;
    const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
    const columns = getComputedStyle(list).gridTemplateColumns.split(' ').length || 1;
    let pages = 1;
    let used = 0;
    for (let i = 0; i < parts.length; i += columns) {
      const row = parts.slice(i, i + columns);
      const height = Math.max(...row.map((part) => part.getBoundingClientRect().height));
      if (used && used + gap + height > room) { pages += 1; used = 0; }
      used += (used ? gap : 0) + height;
      row.forEach((part) => { part.dataset.page = String(pages); });
    }
    const shown = Math.min(Math.max(setting('sheet') || 1, 1), pages);
    parts.forEach((part) => { part.hidden = Number(part.dataset.page) !== shown; });
    sheet.dataset.sheetPages = String(pages);
    sheet.dataset.sheetPage = String(shown);
    sheet.querySelector('[data-sheet-count]').replaceChildren(`الصفحة ${shown} من ${pages}`,
      shown < pages ? ' · التالية: ' : '',
      shown < pages ? el('span', { class: 'ltr-inline', dir: 'ltr', text: `sheet=${shown + 1}` }) : '');
  }

  const VIEWS = {
    intro: introView, play: playView, won: endView, lost: endView,
    debrief: debriefView, done: debriefView, sheet: sheetView,
  };

  function show(screen) {
    state.screen = screen;
    render();
    root.scrollTop = 0;
  }

  function render() {
    const hadFocus = root.contains(document.activeElement);
    root.setAttribute('data-screen', state.screen);
    root.replaceChildren(VIEWS[state.screen]());
    floor = null;
    fx = null;
    if (state.screen === 'sheet') { pageTheSheet(); }
    if (state.screen === 'play') {
      floor = root.querySelector('[data-floor]');
      fx = root.querySelector('[data-fx]');
      bindDrag();
      resize();
      hud();
      draw();
    }
    if (hadFocus) {
      const target = [...root.querySelectorAll('[data-focus]')].pop();
      if (target) { target.focus(); }
    }
  }


  function entryFor(node) {
    return round && round.entries.find((e) => e.node === node);
  }

  function binUnder(event) {
    for (const bin of root.querySelectorAll('[data-bin]')) {
      const box = bin.getBoundingClientRect();
      if (event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom) {
        return bin;
      }
    }
    return null;
  }

  function lit(bin) {
    root.querySelectorAll('[data-bin][data-over]').forEach((b) => { if (b !== bin) { b.removeAttribute('data-over'); } });
    if (bin) { bin.setAttribute('data-over', ''); }
  }

  /** Put down whatever is held, back on the belt where it now is. */
  function dropDrag() {
    const d = round && round.drag;
    if (!d) { return; }
    if (d.entry.state === 'held') { d.entry.state = 'belt'; delete d.entry.node.dataset.held; }
    round.drag = null;
    lit(null);
  }

  /** A drag onto a bin sends; a press that does not move is a tap (click). */
  function bindDrag() {
    const layer = root.querySelector('[data-items]');
    const world = root.querySelector('[data-world]');
    const toWorld = (event) => {
      const box = world.getBoundingClientRect();
      return { x: (event.clientX - box.left) / fit, y: (event.clientY - box.top) / fit };
    };
    layer.addEventListener('pointerdown', (event) => {
      const node = event.target instanceof Element ? event.target.closest('[data-item]') : null;
      const entry = node && entryFor(node);
      if (!entry || entry.state !== 'belt' || state.paused || round.endAt !== null) { return; }
      round.drag = { entry, id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
      if (node.setPointerCapture) { node.setPointerCapture(event.pointerId); }
    });
    layer.addEventListener('pointermove', (event) => {
      const d = round && round.drag;
      if (!d || event.pointerId !== d.id) { return; }
      if (!d.moved && Math.hypot(event.clientX - d.x, event.clientY - d.y) > 10) {
        if (d.entry.state !== 'belt') { dropDrag(); return; }
        d.moved = true;
        d.entry.state = 'held';
        d.entry.node.dataset.held = '';
        round.chosen = d.entry.item.id;
      }
      if (d.moved) {
        d.entry.hold = toWorld(event);
        lit(binUnder(event));
      }
    });
    const release = (event) => {
      const d = round && round.drag;
      if (!d || event.pointerId !== d.id) { return; }
      if (d.moved) {
        round.dragEnded = performance.now();
        const bin = event.type === 'pointerup' ? binUnder(event) : null;
        dropDrag();
        if (bin) { send(d.entry, bin.dataset.bin); }
        return;
      }
      round.drag = null;
    };
    layer.addEventListener('pointerup', release);
    layer.addEventListener('pointercancel', release);
  }

  function setPaused(paused) {
    if (!round || state.screen !== 'play') { return; }
    dropDrag();
    state.paused = paused;
    root.querySelector('[data-paused]').hidden = !paused;
    if (paused) { root.querySelector('[data-act=resume]').focus(); }
    round.last = 0;
  }

  root.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button') : null;
    if (!target || target.disabled || !root.contains(target)) { return; }
    if (target.dataset.item !== undefined) {
      // A tap on an item picks it; the next bin it is sent to is the answer.
      const entry = entryFor(target);
      if (entry && entry.state === 'belt' && !state.paused && performance.now() - round.dragEnded > 250) {
        round.chosen = entry.item.id;
        markActive();
        say(`اخترت ${entry.item.label}. اختر سلّته.`);
      }
      return;
    }
    if (target.dataset.bin !== undefined) {
      if (!send(activeEntry(), target.dataset.bin) && round && !activeEntry()) { say('لا عنصر على الخط الآن.'); }
      return;
    }
    const act = target.dataset.act;
    if (act === 'start' || act === 'again') { startRound(); }
    if (act === 'pause') { setPaused(true); }
    if (act === 'resume') { setPaused(false); }
    if (act === 'debrief') { toDebrief(); }
    if (act === 'finish') { end(); }
    if (act === 'sound') {
      state.muted = !state.muted;
      target.setAttribute('aria-pressed', state.muted ? 'false' : 'true');
      target.textContent = state.muted ? 'الصوت: مغلق' : 'الصوت: يعمل';
      sfx.send();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (state.screen !== 'play' || !round || event.altKey || event.ctrlKey || event.metaKey) { return; }
    const key = (event.key || '').toLowerCase();
    // The digit row by its place (any layout), else the digit typed, Western
    // or Arabic-Indic: an Arabic layout types ١٢٣ there.
    const row = /^(?:Digit|Numpad)([1-9])$/.exec(event.code || '');
    const typed = key.length === 1 ? Math.max('123456789'.indexOf(key), '١٢٣٤٥٦٧٨٩'.indexOf(key), '۱۲۳۴۵۶۷۸۹'.indexOf(key)) : -1;
    const n = row ? Number(row[1]) : typed + 1;
    if (n >= 1 && n <= bins.length && !state.paused) {
      event.preventDefault();
      send(activeEntry(), bins[n - 1].id);
      return;
    }
    if (key === 'm') { const sound = root.querySelector('[data-act=sound]'); if (sound) { sound.click(); } }
    if ((key === 'p' || key === 'escape') && !state.paused) { event.preventDefault(); setPaused(true); }
  });
  window.addEventListener('resize', resize);
  window.addEventListener('blur', () => { dropDrag(); });
  // Off screen (the deck moved on, or the tab is hidden) the belt waits.
  if (window.deckNav && typeof window.deckNav.onScreen === 'function') {
    window.deckNav.onScreen((on) => { offScreen = !on; if (round) { round.last = 0; } });
  }
  document.addEventListener('visibilitychange', () => { if (round) { round.last = 0; dropDrag(); } });


  registerTest({
    decisions: () => items.map((item) => ({ id: item.id, choices: bins.map((bin) => bin.id) })),
    play: async (path) => {
      // Through record(), never the belt; the debrief reports what skip left.
      cancelAnimationFrame(raf);
      dropDrag();
      round = null;
      state.preview = null;
      for (const item of left()) {
        if (path === 'skip') { break; }
        record(item, path === 'right' ? item.bin : wrongBin(item), 0);
      }
      if (state.screen !== 'done') { toDebrief(); end(); }
    },
    moment: async (name) => {
      // A moment is a picture: it reports nothing and saves nothing.
      cancelAnimationFrame(raf);
      dropDrag();
      state.preview = null;
      if (name === 'start') { round = null; show('intro'); return; }
      if (name === 'feedback-sheet') { round = null; show('sheet'); return; }
      if (name === 'debrief') {
        round = null;
        state.preview = blank();
        for (const item of items) {
          state.preview[item.id] = own(state.outcomes, item.id) ? state.outcomes[item.id] : wrongBin(item);
        }
        show('debrief');
        return;
      }
      // after-wrong: frozen as an item lands in the wrong bin, through the
      // landing a learner's wrong bin goes through (never record()). No loop.
      const [first, ...rest] = items;
      round = newRound(items, true);
      round.t = 4;
      round.belt = 300;
      state.paused = false;
      show('play');
      rest.slice(0, 2).forEach((item, i) => { const e = spawn(item, 0.62 - i * R.spacing); e.enter = 1; place(e); });
      const landing = spawn(first, 0.9);
      Object.assign(landing, { state: 'flying', bin: wrongBin(first) });
      round.done = 1;
      land(landing);
      round.entries = round.entries.filter((e) => e.state !== 'gone');
      round.particles.forEach((p) => { p.age = 0.1; p.x += p.vx * 0.1; p.y += p.vy * 0.1; });
      round.floaters.forEach((f) => { f.age = 0.1; });
      markActive();
      hud();
      draw();
    },
  });

  onRestore(({ done, progress }) => {
    // Only an item the host says was reported, with an outcome the game knows.
    const raw = progress.outcomes && typeof progress.outcomes === 'object' ? progress.outcomes : blank();
    state.outcomes = blank();
    for (const item of items) {
      const sent = own(raw, item.id) ? raw[item.id] : null;
      if (done.includes(item.id) && (sent === 'none' || own(binOf, sent))) { state.outcomes[item.id] = sent; }
    }
    if (progress.finished === true && left().length === 0) {
      state.screen = 'done';
      render();
      finish();
      return;
    }
    if (left().length === 0) { show('debrief'); return; }
    render();
  });

  render();
}

if (typeof document !== 'undefined') { boot(); }
