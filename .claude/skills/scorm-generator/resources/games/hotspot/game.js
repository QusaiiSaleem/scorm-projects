/*
 * games/hotspot/game.js -- the hotspot game (2026-11-07, learning-games spec
 * §5, game 6; Scitter plan Task 24): notice what matters, by flashlight.
 *
 * GROWN OUT OF the engine's `hotspot` and `hidden-object` components (a
 * picture with regions to find, found/total, a wrong press that shakes), and
 * made a game: the scene is dark, the learner searches it with a flashlight,
 * the flashlight's battery is the clock and the light narrows as it runs
 * down, a decoy pressed costs a heart, finds in a row build a streak, and a
 * find bursts, floats its points and leaves its spot glowing.
 *
 * THE JUICE IS dsh-game-studio's `collector`, as the catch game carries it:
 * its WebAudio bleeps, its particles, its floating text, its screen shake,
 * and the seeded generator (mulberry32, as dsh's `voxel` seeds its island).
 * MIT, Copyright (c) 2026 ZSeven—W; the licence text is in this folder's
 * README.md.
 *
 * WHAT IS REPORTED. One `performance` row per HAZARD, the first outcome only:
 * `found` (correct; latency the time it took) when the learner presses it,
 * `missed` (wrong; latency the time searched) for every hazard still unfound
 * when the round ends -- every hazard found, the battery out, or the hearts
 * out. A hazard no round ever held (`play('skip')`, a learner who opened the
 * debrief before playing) is `none`/`wrong` when the debrief opens. DECOYS
 * are never reported: they are the stake, not a decision, and the page has
 * no row for them (`x-points` is `hazards[]`). A replay is practice and
 * reports nothing.
 *
 * WHERE A SPOT IS: fractions of the scene picture -- x from its LEFT edge (a
 * picture is not mirrored for Arabic), y from its top, r its radius as a
 * fraction of its width -- so any picture of any size takes the same content.
 * The core reads no number's range and compares ids only inside one list, so
 * a spot off its picture and a decoy wearing a hazard's id are refused here,
 * the core's way: an Arabic box on the stage and one console error.
 *
 * THE PICTURE DECIDES, NEVER THE WORDS. A spot's words name the thing only
 * («قدر على الموقد»), never its state, and each hazard has a safe twin in the
 * scene that may wear the same words: the learner must look at what the light
 * shows to tell them apart. (A visual-search exercise is WCAG 2.2 SC 1.1.1's
 * "test" case: the words identify the thing, they do not answer for it.)
 *
 * THE LIGHT DECIDES WHAT IS SEEN. A spot's words show only where the light
 * falls (the pointer or a finger moves it, the arrows move it, Tab to a spot
 * brings it there). A mouse press or Enter on a spot counts at once. A finger
 * has no hover, so its first tap on a spot in the dark brings the light there
 * and shows it, and the next tap presses: a tap in the dark is a look, never a
 * guess that costs a heart. A press that began on one spot and ended off it
 * moved the light and pressed nothing; a wobble that stays on the spot counts.
 * Every spot is a button: Tab reaches each one in reading order, the hazards
 * and the decoys interleaved by place, and Enter presses it (WCAG 2.2 SC
 * 2.1.1 and 2.5.7: dragging the light is never needed). Enter on the open
 * scene presses the spot under the light.
 */
import {
  announce, debrief, el, finish, GameContentError, latencyFrom, onRestore, readContent, registerTest, save, setting,
} from '../core/game-core.js';

const SPOT = {
  id: { type: 'string', pattern: '^[A-Za-z0-9_-]{1,64}$' },
  label: { type: 'string', minLength: 1 },
  x: { type: 'number', minimum: 0, maximum: 1 },
  y: { type: 'number', minimum: 0, maximum: 1 },
  r: { type: 'number', minimum: 0.02, maximum: 0.25 },
};

/** content.schema.json without its descriptions: what readContent enforces
 *  (minimum and maximum are this file's to check: the core reads no range). */
export const SHAPE = {
  'x-points': 'hazards[]',
  type: 'object',
  required: ['title', 'brief', 'hazards', 'decoys'],
  properties: {
    title: { type: 'string', minLength: 1 },
    brief: { type: 'string', minLength: 1 },
    hazards: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['id', 'label', 'x', 'y', 'r', 'rule', 'source'],
        properties: { ...SPOT, rule: { type: 'string', minLength: 1 }, source: { type: 'string' } },
      },
    },
    decoys: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object', required: ['id', 'label', 'x', 'y', 'r'], properties: { ...SPOT, why: { type: 'string' } },
      },
    },
    slots: { type: 'object', properties: { scene: { type: 'string' } } },
  },
};

/* RULES: every gameplay value in one place. A learner's slide has no
 * settings; render_slide may pass `duration` and `lives` (game.json declares
 * their ranges; the platform checks them). */
const R = {
  hearts: 3,
  seconds: 60, // the battery
  light: 0.13, // the light's radius, a fraction of the scene's width
  low: 0.25, // under this share of the battery the light narrows...
  narrowest: 0.6, // ...down to this share of its radius
  flicker: 0.12, // and under this share it flickers
  ease: 9, // how fast the light follows its target
  points: 10, // a find, times the streak
  bonus: 2, // points per second of battery left when every hazard is found
};
// Dark enough that an outline gives nothing away: the light has to look.
const DARKNESS = 0.97;
const END_PAUSE_MS = 900;
// The core's debrief reads «اختيارك: …», so these say what the learner did.
const ACT_WORDS = { found: 'نقرته', missed: 'لم تنقره' };
/* A counted noun, as Arabic counts: one and two by the noun alone, three to
   ten its plural, eleven and over its singular. */
const HAZARD_WORDS = ['خطر واحد', 'خطران', 'مخاطر', 'خطرًا'];
const HEART_WORDS = ['قلب واحد', 'قلبان', 'قلوب', 'قلبًا'];
const SECOND_WORDS = ['ثانية واحدة', 'ثانيتان', 'ثوانٍ', 'ثانية'];
function counted(n, [one, two, few, many]) {
  if (n === 1) { return one; }
  if (n === 2) { return two; }
  return `${n} ${n % 100 >= 3 && n % 100 <= 10 ? few : many}`;
}
const heartsLeft = (n) => (n > 0 ? `خسرت قلبًا، وبقي ${counted(n, HEART_WORDS)}.` : 'خسرت آخر قلب.');
const KEYS = { arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, -1], arrowdown: [0, 1] };
/** A slot fill is a picture in the lecture's own assets, never an address. */
const SLOT_PATH = /^\.\.\/assets\/[A-Za-z0-9_.\-/]+\.(png|webp|jpe?g|gif|svg)$/;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : (v > b ? b : v));

function int(name, low, high) {
  const value = setting(name);
  return value === null ? null : clamp(value, low, high);
}

/** A seeded generator (mulberry32, as dsh's voxel template seeds its
 *  island): the particles and the flicker, the same on every play. */
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

/** The core's refusal, for what the core cannot check: shown, logged once. */
function refuse(root, arabic, english, named) {
  root.setAttribute('data-screen', 'error');
  root.classList.add('game-root');
  root.replaceChildren(el('div', { class: 'game-error', role: 'alert' },
    el('p', { class: 'game-error-title', text: 'تعذّر تشغيل اللعبة: محتواها لا يطابق شكلها.' }),
    el('p', { text: arabic }),
    el('p', {}, el('span', { class: 'ltr-inline', dir: 'ltr', text: named }))));
  console.error(`[game] ${arabic} ${english}`);
  return false;
}

/** Every spot on its picture, and one id per spot across both lists. */
function spotsHold(root, content) {
  const seen = new Map();
  for (const key of ['hazards', 'decoys']) {
    const shape = SHAPE.properties[key].items.properties;
    for (const [i, spot] of content[key].entries()) {
      for (const field of ['x', 'y', 'r']) {
        const { minimum, maximum } = shape[field];
        if (!(spot[field] >= minimum && spot[field] <= maximum)) {
          const where = `${key}[${i}].${field}`;
          return refuse(root, `الحقل ${where} = ${spot[field]} خارج الصورة: يأخذ كسرًا من ${minimum} إلى ${maximum}.`,
            `${where} is ${spot[field]}; it takes a fraction of the scene picture from ${minimum} to ${maximum} `
            + '(x from its left edge, y from its top, r of its width).', `${where} = ${spot[field]}`);
        }
      }
      if (seen.has(spot.id)) {
        return refuse(root, `المعرّف «${spot.id}» في ${key}[${i}].id مستعمل في ${seen.get(spot.id)}.`,
          `the id "${spot.id}" at ${key}[${i}].id is already ${seen.get(spot.id)}'s; a hazard and a decoy never share one.`,
          `${key}[${i}].id = "${spot.id}"`);
      }
      seen.set(spot.id, `${key}[${i}]`);
    }
  }
  return true;
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
  if (!spotsHold(root, content)) { return; }
  root.classList.add('game-root', 'hs');

  const hazards = content.hazards;
  const decoys = content.decoys;
  // Reading order -- top to bottom in bands, right to left in a band -- with
  // the hazards and the decoys interleaved, so Tab's order tells nothing.
  const spots = [...hazards.map((s) => ({ ...s, kind: 'hazard' })), ...decoys.map((s) => ({ ...s, kind: 'decoy' }))]
    .sort((a, b) => (Math.floor(a.y * 4) - Math.floor(b.y * 4)) || (b.x - a.x));
  const fill = content.slots && content.slots.scene;
  if (fill !== undefined && !(typeof fill === 'string' && SLOT_PATH.test(fill))) {
    console.warn(`[game] slots.scene is not a picture under ../assets/ (${JSON.stringify(fill)}); the placeholder is shown.`);
  }
  const picture = typeof fill === 'string' && SLOT_PATH.test(fill)
    ? fill : new URL('assets/scene.svg', import.meta.url).href;
  let aspect = 16 / 9;
  const probe = new Image();
  probe.onload = () => {
    if (probe.naturalWidth && probe.naturalHeight) { aspect = probe.naturalWidth / probe.naturalHeight; resize(); draw(); }
  };
  probe.src = picture;

  R.hearts = int('lives', 1, 5) || R.hearts;

  /* Colours: base.css variables, read once, so deck.css reaches the canvas
     too. The literals are only for a page whose stylesheet failed. */
  const css = getComputedStyle(document.documentElement);
  const colour = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
  const C = {
    dark: colour('--color-text', '#1e293b'),
    glow: colour('--color-surface-elevated', '#ffffff'),
    good: colour('--color-success', '#10b981'),
    spark: colour('--color-accent', '#f97316'),
    bad: colour('--color-error', '#ef4444'),
    font: colour('--font-body', 'system-ui, sans-serif'),
  };
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Where the light starts: of a few places, the one farthest from every
   *  spot, so the first look gives nothing away. */
  const START = [[0.5, 0.5], [0.5, 0.95], [0.5, 0.05], [0.05, 0.5], [0.95, 0.5],
    [0.2, 0.2], [0.8, 0.8], [0.2, 0.8], [0.8, 0.2]]
    .map(([x, y]) => ({ x, y, d: Math.min(...spots.map((s) => Math.hypot((s.x - x) * aspect, s.y - y))) }))
    .sort((a, b) => b.d - a.d)[0];

  const state = {
    screen: 'intro', // intro | play | won | lost | debrief | done | sheet
    outcomes: {}, // hazard id -> the FIRST outcome: found | missed | none
    preview: null, // outcomes a moment shows without anyone acting
    paused: false,
    muted: true,
  };
  let round = null;
  let raf = 0;
  let offScreen = false;
  let audio = null;
  let focused = null; // the spot the keyboard is on
  let peeked = null; // the spot a finger's first tap lit
  let down = null; // the press under way: where it began, and what it saw
  const left = () => hazards.filter((h) => !(h.id in state.outcomes));
  const resultOf = (act) => (act === 'found' ? 'correct' : 'wrong');

  function persist() {
    save({ outcomes: state.outcomes, finished: state.screen === 'done' });
  }

  /** The first outcome of a hazard, reported once; a replay's is practice. */
  function record(hazard, act, ms) {
    if (hazard.id in state.outcomes) { return false; }
    state.outcomes[hazard.id] = act;
    announce({
      id: hazard.id, type: 'performance', response: act, result: resultOf(act), latency: latencyFrom(ms),
    });
    persist();
    return true;
  }

  /* AUDIO -- collector's WebAudio bleeps, off until the learner asks. */
  function tone(freq, dur, type, vol, slide) {
    if (state.muted) { return; }
    try {
      if (!audio) {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) { return; }
        audio = new Context();
      }
      if (audio.state === 'suspended') { audio.resume().catch(() => {}); }
      const t0 = audio.currentTime;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slide) { osc.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t0 + dur); }
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch (error) { /* a sound never stops the game */ }
  }
  const sfx = {
    find: (streak) => tone(660 * 1.12 ** Math.min(streak, 6), 0.1, 'sine', 0.07, 1320 * 1.12 ** Math.min(streak, 6)),
    hurt: () => tone(180, 0.22, 'sawtooth', 0.09, 70),
    tick: () => tone(1200, 0.04, 'square', 0.03),
    win: () => { tone(660, 0.1, 'sine', 0.07); setTimeout(() => tone(880, 0.16, 'sine', 0.07), 90); },
    lose: () => tone(300, 0.3, 'sawtooth', 0.08, 90),
  };

  // ---- a round ------------------------------------------------------------

  function newRound(practice) {
    const targets = practice ? hazards : left();
    const marks = {};
    // A returning learner's finds stay found, glowing, and are not played again.
    if (!practice) { hazards.forEach((h) => { if (state.outcomes[h.id] === 'found') { marks[h.id] = 'found'; } }); }
    const seconds = int('duration', 5, 180) || R.seconds;
    return {
      practice, targets, marks, length: seconds,
      t: 0, last: 0, hearts: R.hearts, score: 0, streak: 0, best: 0,
      light: { x: START.x, y: START.y, tx: START.x, ty: START.y }, radius: R.light,
      particles: [], floaters: [], ripples: [], shake: 0, flash: 0, tick: Math.ceil(seconds),
      rand: seeded(hazards.map((h) => h.id).join(',')),
      endAt: null, reason: null, won: null,
    };
  }

  function startRound() {
    round = newRound(left().length === 0); // a replay plays every hazard again
    state.paused = false;
    show('play');
    raf = requestAnimationFrame(frame);
  }

  // Field geometry, in CSS px of the scene box. Two canvases: the darkness
  // under the spots, the juice (bursts, ripples, floating points) over them,
  // so a find's points are never hidden under a spot's words.
  let canvas = null;
  let ctx = null;
  let fxCanvas = null;
  let fx = null;
  let dpr = 1;
  let fieldW = 1;
  let fieldH = 1;
  const nodes = {}; // spot id -> its button, in the current play view

  function resize() {
    const box = root.querySelector('[data-stage]');
    const field = root.querySelector('[data-field]');
    if (!box || !field) { return; }
    const w = Math.min(box.clientWidth, box.clientHeight * aspect) || 1;
    fieldW = w;
    fieldH = w / aspect;
    field.style.width = `${fieldW}px`;
    field.style.height = `${fieldH}px`;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    for (const surface of [canvas, fxCanvas]) {
      if (surface) {
        surface.width = Math.round(fieldW * dpr);
        surface.height = Math.round(fieldH * dpr);
      }
    }
    // A spot near the picture's side keeps its words inside it: slid along,
    // never cut by the stage's edge.
    for (const spot of spots) {
      const tag = nodes[spot.id] && nodes[spot.id].querySelector('.hs-tag');
      if (!tag) { continue; }
      const half = tag.offsetWidth / 2 + 6;
      const x = spot.x * fieldW;
      const kept = half * 2 > fieldW ? fieldW / 2 : clamp(x, half, fieldW - half);
      nodes[spot.id].style.setProperty('--nudge', `${Math.round(kept - x)}px`);
    }
  }

  const at = (spot) => ({ x: spot.x * fieldW, y: spot.y * fieldH });

  /* JUICE (collector's particles, floating text and shake; ripples ours). */
  function burst(x, y, color, n) {
    const { rand } = round;
    const many = reduced() ? Math.ceil(n / 3) : n;
    for (let i = 0; i < many; i += 1) {
      const a = rand() * TAU;
      const sp = 90 + rand() * 230;
      round.particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.4 + rand() * 0.5, age: 0, color, r: 2.5 + rand() * 4,
      });
    }
  }
  function floater(x, y, text, color) { round.floaters.push({ x, y, text, color, age: 0, life: 1.1 }); }
  function ripple(x, y, color, size) { round.ripples.push({ x, y, color, size, age: 0, life: 0.7 }); }

  /** A press on a spot: a hazard is found, a decoy costs a heart. */
  function press(spot) {
    if (!round || state.paused || round.endAt !== null || round.marks[spot.id]) { return; }
    const node = nodes[spot.id];
    const p = at(spot);
    round.light.tx = spot.x;
    round.light.ty = spot.y;
    if (spot.kind === 'hazard') {
      round.marks[spot.id] = 'found';
      if (node) { node.dataset.outcome = 'found'; node.setAttribute('aria-disabled', 'true'); }
      round.streak += 1;
      round.best = Math.max(round.best, round.streak);
      const gain = R.points * round.streak;
      round.score += gain;
      if (!round.practice) { record(spot, 'found', round.t * 1000); }
      round.flash = 1; // the light flares on a find
      burst(p.x, p.y, C.spark, 22);
      burst(p.x, p.y, C.good, 14);
      ripple(p.x, p.y, C.good, spot.r * fieldW * 2.2);
      // Points rise from the spot's centre, where no spot's words lie.
      floater(p.x, p.y, round.streak > 1 ? `+${gain} ×${round.streak}` : `+${gain}`, C.spark);
      sfx.find(round.streak);
      toast('found', `وجدته: ${spot.label}.`, spot.rule, spot.y);
      say(`وجدته: ${spot.label}. ${spot.rule}`);
    } else {
      round.marks[spot.id] = 'decoy';
      if (node) { node.dataset.outcome = 'decoy'; node.setAttribute('aria-disabled', 'true'); }
      round.hearts -= 1;
      round.streak = 0;
      round.shake = 0.35;
      burst(p.x, p.y, C.bad, 12);
      ripple(p.x, p.y, C.bad, spot.r * fieldW * 1.8);
      floater(p.x, p.y, '−♥', C.bad);
      sfx.hurt();
      decoyToast(spot, round.hearts);
      say([`${spot.label}: ليس خطرًا.`, spot.why, heartsLeft(round.hearts)].filter(Boolean).join(' '));
    }
    peeked = null;
    hud();
  }

  /** A finger's first tap on a spot in the dark: the light goes there and the
   *  spot's words show; the next tap presses it. */
  function look(spot) {
    if (!round || state.paused || round.endAt !== null || round.marks[spot.id]) { return; }
    peeked = spot.id;
    round.light.tx = spot.x;
    round.light.ty = spot.y;
    const p = at(spot);
    ripple(p.x, p.y, C.glow, spot.r * fieldW * 1.6);
    lightUp();
    say(`${spot.label}. انقره مرة أخرى إن كان خطرًا.`);
  }

  /** The round is over: every target not found is missed, reported now. */
  function over(reason) {
    const r = round;
    r.endAt = performance.now();
    r.reason = reason;
    r.won = reason === 'found';
    if (r.won) { r.score += Math.ceil(Math.max(0, r.length - r.t)) * R.bonus; }
    for (const hazard of r.targets) {
      if (r.marks[hazard.id] === 'found') { continue; }
      r.marks[hazard.id] = 'missed';
      const node = nodes[hazard.id];
      if (node) { node.dataset.outcome = 'missed'; node.setAttribute('aria-disabled', 'true'); }
      if (!r.practice) { record(hazard, 'missed', r.t * 1000); }
      ripple(hazard.x * fieldW, hazard.y * fieldH, C.bad, hazard.r * fieldW * 2);
    }
    for (const spot of spots) {
      if (!r.marks[spot.id] && nodes[spot.id]) { nodes[spot.id].setAttribute('aria-disabled', 'true'); }
    }
    if (r.won) { sfx.win(); } else { sfx.lose(); }
    say(r.won ? 'وجدت كل المخاطر.' : 'انتهت الجولة.');
    hud();
  }

  /* UPDATE */
  function update(dt) {
    const r = round;
    for (const p of r.particles) {
      p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.exp(-dt * 3); p.vy *= Math.exp(-dt * 3);
    }
    r.particles = r.particles.filter((p) => p.age < p.life);
    for (const f of r.floaters) { f.age += dt; f.y -= 46 * dt; }
    r.floaters = r.floaters.filter((f) => f.age < f.life);
    for (const w of r.ripples) { w.age += dt; }
    r.ripples = r.ripples.filter((w) => w.age < w.life);
    if (r.shake > 0) { r.shake -= dt; }
    if (r.flash > 0) { r.flash = Math.max(0, r.flash - dt * 3); }
    const k = 1 - Math.exp(-dt * R.ease);
    r.light.x += (r.light.tx - r.light.x) * k;
    r.light.y += (r.light.ty - r.light.y) * k;
    if (r.endAt !== null) { return; }
    r.t += dt;
    const share = Math.max(0, r.length - r.t) / r.length;
    let radius = R.light * (share < R.low ? R.narrowest + (1 - R.narrowest) * (share / R.low) : 1);
    if (share < R.flicker && !reduced()) { radius *= 0.9 + 0.1 * r.rand(); }
    r.radius = radius;
    const whole = Math.ceil(r.length - r.t);
    if (whole < r.tick) { r.tick = whole; if (whole <= 10) { sfx.tick(); } }
    lightUp();
    hud();
    if (r.targets.every((h) => r.marks[h.id] === 'found')) { over('found'); } else if (r.hearts <= 0) { over('hearts'); } else if (r.t >= r.length) { over('battery'); }
  }

  /** Which spots the light falls on: their words show. */
  function lightUp() {
    if (!round) { return; }
    const lx = round.light.x * fieldW;
    const ly = round.light.y * fieldH;
    const reach = round.radius * fieldW;
    for (const spot of spots) {
      const node = nodes[spot.id];
      if (!node) { continue; }
      const p = at(spot);
      node.toggleAttribute('data-lit', focused === spot.id || peeked === spot.id || Math.hypot(p.x - lx, p.y - ly) < reach);
    }
  }

  /* RENDER: the darkness and the light under the spots; the juice over them. */
  function hole(x, y, radius, strength) {
    const g = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius);
    g.addColorStop(0, C.dark);
    g.addColorStop(1, 'transparent');
    ctx.globalAlpha = strength;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    ctx.fill();
  }

  function draw() {
    if (!ctx || !round) { return; }
    const r = round;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, fieldW, fieldH);
    ctx.globalAlpha = DARKNESS;
    ctx.fillStyle = C.dark;
    ctx.fillRect(0, 0, fieldW, fieldH);
    ctx.globalCompositeOperation = 'destination-out';
    const lx = r.light.x * fieldW;
    const ly = r.light.y * fieldH;
    const reach = r.radius * fieldW * (1 + 0.35 * r.flash);
    hole(lx, ly, reach, 1);
    for (const spot of spots) {
      // A find keeps a glow of its own; at the end, so does every miss.
      const mark = r.marks[spot.id];
      if (mark === 'found' || mark === 'missed') { const p = at(spot); hole(p.x, p.y, spot.r * fieldW * 1.7, 0.9); }
    }
    ctx.globalCompositeOperation = 'source-over';
    // The beam's rim.
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = C.glow;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(lx, ly, reach * 0.97, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;
    if (fx) {
      fx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fx.globalAlpha = 1;
      fx.clearRect(0, 0, fieldW, fieldH);
      for (const w of r.ripples) {
        const k = w.age / w.life;
        fx.globalAlpha = Math.max(0, 1 - k);
        fx.strokeStyle = w.color;
        fx.lineWidth = 6 * (1 - k) + 1;
        fx.beginPath();
        fx.arc(w.x, w.y, w.size * (0.4 + 0.6 * k), 0, TAU);
        fx.stroke();
      }
      for (const p of r.particles) {
        fx.globalAlpha = Math.max(0, 1 - p.age / p.life);
        fx.fillStyle = p.color;
        fx.beginPath();
        fx.arc(p.x, p.y, p.r, 0, TAU);
        fx.fill();
      }
      fx.textAlign = 'center';
      fx.textBaseline = 'middle';
      fx.direction = 'ltr'; // "+20 ×2" is digits and signs; RTL would turn it round
      fx.font = `bold 34px ${C.font}`;
      fx.lineWidth = 7;
      fx.strokeStyle = C.dark;
      for (const f of r.floaters) {
        const k = f.age / f.life;
        fx.globalAlpha = Math.max(0, 1 - k * k);
        fx.strokeText(f.text, f.x, f.y);
        fx.fillStyle = f.color;
        fx.fillText(f.text, f.x, f.y);
      }
      fx.globalAlpha = 1;
    }
    const field = root.querySelector('[data-field]');
    const shake = r.shake > 0 && !reduced() ? r.shake * 14 : 0;
    if (field) { field.style.translate = shake ? `${(r.rand() * 2 - 1) * shake}px ${(r.rand() * 2 - 1) * shake}px` : '0 0'; }
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
    render();
  }

  // ---- what the learner reads and hears ---------------------------------

  /** What a press did, in the band of the scene away from the spot pressed
   *  (`y` its place), so it never covers the place the learner is looking. */
  function toast(kind, strong, text, y) {
    const box = root.querySelector('[data-toast]');
    if (!box) { return; }
    box.dataset.kind = kind;
    box.dataset.at = y < 0.5 ? 'bottom' : 'top';
    box.replaceChildren(el('strong', { text: strong }), ' ', text);
    box.hidden = false;
    clearTimeout(box.timer);
    box.timer = setTimeout(() => { box.hidden = true; }, 3600);
  }

  function decoyToast(spot, hearts) {
    toast('decoy', `${spot.label}: ليس خطرًا.`, [spot.why, heartsLeft(hearts)].filter(Boolean).join(' '), spot.y);
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
    if (hearts.dataset.count !== String(full)) {
      hearts.dataset.count = String(full);
      hearts.replaceChildren(
        el('span', { class: 'sr-only', text: `القلوب: ${full} من ${R.hearts}` }),
        ...Array.from({ length: R.hearts }, (_, i) => el('span', {
          class: 'hs-heart', 'data-full': i < full ? 'true' : 'false', 'aria-hidden': 'true', text: '♥',
        })));
    }
    const found = round.targets.filter((h) => round.marks[h.id] === 'found').length;
    root.querySelector('[data-found]').textContent = `وجدت ${found} من ${round.targets.length}`;
    root.querySelector('[data-score]').textContent = `النقاط: ${round.score}`;
    const streak = root.querySelector('[data-streak]');
    streak.hidden = round.streak < 2;
    streak.textContent = `سلسلة ×${round.streak}`;
    // Less a microsecond: a squeezed length can be 5.000000000000001.
    const remaining = Math.max(0, Math.ceil(round.length - round.t - 1e-6));
    root.querySelector('[data-battery]').textContent = `البطارية: ${remaining} ث`;
    const share = Math.max(0, round.length - round.t) / round.length;
    const meter = root.querySelector('[data-meter]');
    meter.style.setProperty('--hs-left', String(share));
    meter.dataset.level = share < R.flicker ? 'empty' : (share < R.low ? 'low' : 'ok');
  }

  // ---- the debrief, and the end -----------------------------------------

  function toDebrief() {
    cancelAnimationFrame(raf);
    round = null;
    // A hazard no round held is a decision never made: `none`, reported
    // once, now -- before the debrief that names it.
    for (const hazard of left()) {
      state.outcomes[hazard.id] = 'none';
      announce({ id: hazard.id, type: 'performance', response: 'none', result: 'wrong' });
    }
    persist();
    show('debrief');
  }

  function end() {
    // A moment's debrief is a picture: its «إنهاء» finishes nothing.
    if (state.screen !== 'debrief' || state.preview) { return; }
    state.screen = 'done';
    persist();
    finish();
    render();
  }

  function rowsFor(outcomes) {
    return hazards.map((hazard, i) => {
      const act = outcomes[hazard.id];
      const met = act === 'found' || act === 'missed';
      return {
        id: hazard.id, situation: `${i + 1}. ${hazard.label}`,
        chosen: met ? ACT_WORDS[act] : null, rule: hazard.rule, source: hazard.source,
        result: met ? resultOf(act) : 'none',
      };
    });
  }

  // ---- the views ----------------------------------------------------------

  function header(title, line) {
    return el('header', { class: 'hs-head' },
      line ? el('p', { class: 'hs-line', text: line }) : null,
      el('h2', { class: 'hs-title', tabindex: '-1', 'data-focus': true, text: title }));
  }

  function soundButton() {
    return el('button', {
      type: 'button', class: 'btn-ghost hs-sound', 'data-act': 'sound',
      'aria-pressed': state.muted ? 'false' : 'true', text: state.muted ? 'الصوت: مغلق' : 'الصوت: يعمل',
    });
  }

  function place(node, spot) {
    node.style.setProperty('--x', String(spot.x));
    node.style.setProperty('--y', String(spot.y));
    node.style.setProperty('--r', String(spot.r));
    return node;
  }

  /** The scene, small, with numbered rings: `marks` [{spot, n, result}]. */
  function figure(marks, extra) {
    return el('div', { class: `hs-figure ${extra || ''}` },
      el('img', { class: 'hs-figure-art', src: picture, alt: content.brief }),
      marks.map((m) => place(el('span', { class: 'hs-mark', 'data-result': m.result, 'aria-hidden': 'true' },
        m.n ? el('span', { class: 'hs-mark-n', text: String(m.n) }) : null), m.spot)));
  }

  /** The start screen's look at the scene: dark, one patch in the light. */
  function peek() {
    // The lit patch is the same picture again, so it is a painted box and
    // not a second image a screen reader would meet.
    const lit = el('span', { class: 'hs-peek-lit', 'aria-hidden': 'true' });
    const spot = decoys[0];
    lit.style.backgroundImage = `url("${picture}")`;
    lit.style.clipPath = `circle(${(R.light * 100).toFixed(1)}% at ${(spot.x * 100).toFixed(1)}% ${(spot.y * 100).toFixed(1)}%)`;
    return el('div', { class: 'hs-figure hs-peek' },
      el('img', { class: 'hs-figure-art hs-peek-dark', src: picture, alt: content.brief }), lit);
  }

  function introView() {
    const remaining = left().length;
    const resuming = remaining > 0 && remaining < hazards.length;
    const seconds = int('duration', 5, 180) || R.seconds;
    return el('div', { class: 'hs-intro' },
      el('div', { class: 'hs-intro-text' },
        header(content.title, resuming
          ? `تابع: بقي ${counted(remaining, HAZARD_WORDS)} من ${hazards.length}` : counted(hazards.length, HAZARD_WORDS)),
        el('p', { text: content.brief }),
        el('p', { text: 'المكان مظلم، ومعك مصباح. حرّكه في المكان وانظر جيدًا: أسماء الأشياء لا تقول أيّها الخطِر، والصورة تقول. انقر كل شيء خطِر تجده.' }),
        el('p', {
          text: `بطارية المصباح ${counted(seconds, SECOND_WORDS)}، ويضيق ضوؤه حين تضعف. لديك ${counted(R.hearts, HEART_WORDS)}: تخسر قلبًا إن نقرت شيئًا ليس خطرًا.`,
        }),
        el('p', { class: 'hs-how' }, 'حرّك المؤشر أو إصبعك (لمسة تضيء الشيء، والثانية تنقره)، أو استعمل الأسهم، أو انتقل بين الأشياء بمفتاح ',
          el('span', { class: 'ltr-inline', dir: 'ltr', text: 'Tab' }), ' واضغط ',
          el('span', { class: 'ltr-inline', dir: 'ltr', text: 'Enter' }), '.'),
        el('div', { class: 'hs-actions' },
          el('button', {
            type: 'button', class: 'btn-primary', 'data-act': 'start', 'data-focus': true, text: resuming ? 'تابع' : 'ابدأ',
          }),
          soundButton())),
      peek());
  }

  function spotButton(spot) {
    const node = place(el('button', {
      type: 'button', class: 'hs-spot', 'data-spot': spot.id, 'data-low': spot.y < 0.2 ? true : null,
      'aria-label': `${spot.label}. انقره إن كان خطرًا.`,
    }, el('span', { class: 'hs-tag', text: spot.label })), spot);
    const mark = round && round.marks[spot.id];
    if (mark) { node.dataset.outcome = mark; node.setAttribute('aria-disabled', 'true'); }
    nodes[spot.id] = node;
    return node;
  }

  function playView() {
    Object.keys(nodes).forEach((id) => { delete nodes[id]; });
    return el('div', { class: 'hs-play', 'data-play': true },
      el('div', { class: 'hs-hud' },
        el('p', { class: 'hs-hearts', 'data-hearts': true }),
        el('p', { class: 'hs-found', 'data-found': true }),
        el('p', { class: 'hs-score', 'data-score': true }),
        el('p', { class: 'hs-streak', 'data-streak': true, hidden: true }),
        el('div', { class: 'hs-battery' },
          el('span', { class: 'hs-meter', 'data-meter': true, 'aria-hidden': 'true' }, el('span', { class: 'hs-meter-fill' })),
          el('p', { 'data-battery': true })),
        el('div', { class: 'hs-hud-acts' },
          soundButton(),
          el('button', { type: 'button', class: 'btn-secondary', 'data-act': 'pause', text: 'إيقاف مؤقت' }))),
      el('div', { class: 'hs-stage', 'data-stage': true },
        el('div', {
          class: 'hs-field', 'data-field': true, tabindex: '-1', 'data-focus': true, role: 'group',
          'aria-label': 'المكان',
        },
        el('img', { class: 'hs-scene', src: picture, alt: content.brief, draggable: 'false' }),
        el('canvas', { class: 'hs-canvas', 'data-canvas': true, 'aria-hidden': 'true' }),
        el('div', { class: 'hs-spots' }, spots.map(spotButton)),
        el('canvas', { class: 'hs-canvas', 'data-fx': true, 'aria-hidden': 'true' }))),
      el('p', { class: 'hs-toast', 'data-toast': true, role: 'status', hidden: true }),
      el('div', { class: 'hs-paused', 'data-paused': true, hidden: true },
        el('p', { class: 'hs-title', text: 'اللعبة متوقّفة' }),
        el('button', { type: 'button', class: 'btn-primary', 'data-act': 'resume', text: 'تابع اللعب' })),
      el('p', { class: 'sr-only', 'aria-live': 'polite', 'data-say': true }));
  }

  function endView() {
    const won = state.screen === 'won';
    const r = round;
    const targets = r ? r.targets : hazards;
    const found = r ? targets.filter((h) => r.marks[h.id] === 'found').length : 0;
    let title = 'وجدت كل المخاطر!';
    if (!won) { title = r && r.reason === 'hearts' ? 'نفدت قلوبك' : 'انطفأ المصباح'; }
    return el('div', { class: 'hs-end', 'data-end': state.screen },
      el('div', { class: 'hs-end-text' },
        header(title, content.title),
        el('p', { class: 'hs-big', text: `وجدت ${found} من ${targets.length}` }),
        el('p', { text: `النقاط: ${r ? r.score : 0} · أطول سلسلة: ${r ? r.best : 0}` }),
        r && r.practice ? el('p', { text: 'جولة تدريب: نتيجتك الأولى هي التي حُسبت.' }) : null,
        el('div', { class: 'hs-actions' },
          el('button', {
            type: 'button', class: won ? 'btn-primary' : 'btn-secondary', 'data-act': 'debrief',
            'data-focus': won ? true : null, text: 'إلى الخلاصة',
          }),
          el('button', {
            type: 'button', class: won ? 'btn-secondary' : 'btn-primary', 'data-act': 'again',
            'data-focus': won ? null : true, text: won ? 'العب مرة أخرى' : 'حاول مرة أخرى',
          }))),
      // What was found, and where each hazard missed was.
      figure(r ? hazards.filter((h) => r.marks[h.id] === 'found' || r.marks[h.id] === 'missed')
        .map((spot) => ({ spot, result: r.marks[spot.id] === 'found' ? 'correct' : 'wrong' })) : []));
  }

  function debriefView() {
    const done = state.screen === 'done';
    const outcomes = state.preview || state.outcomes;
    const rows = rowsFor(outcomes);
    return el('div', { class: 'hs-debrief' },
      header('خلاصة الجولة', content.title),
      el('div', { class: 'hs-debrief-body' },
        figure(hazards.map((spot, i) => ({ spot, n: i + 1, result: rows[i].chosen ? rows[i].result : 'none' })), 'hs-debrief-figure'),
        debrief(rows)),
      done
        ? el('p', { class: 'hs-done', role: 'status', text: 'انتهيت. يمكنك المتابعة إلى الشريحة التالية.' })
        : el('button', { type: 'button', class: 'btn-primary', 'data-act': 'finish', text: 'إنهاء' }));
  }

  /** Every spot -- a hazard's words, what to do, its rule and source; a
   *  decoy's words and that it is left alone -- numbered on the scene, for a
   *  reviewer: moment=feedback-sheet. */
  function sheetView() {
    const all = [...hazards.map((s) => ({ ...s, kind: 'hazard' })), ...decoys.map((s) => ({ ...s, kind: 'decoy' }))];
    return el('div', { class: 'hs-sheet', 'data-sheet': true },
      el('header', { class: 'hs-sheet-head' },
        el('h2', { class: 'hs-title', text: `ورقة المراجعة: ${content.title}` }),
        el('p', { class: 'hs-line', 'data-sheet-count': true })),
      el('div', { class: 'hs-sheet-body' },
        el('div', { class: 'hs-sheet-items' }, all.map((spot, i) => el('section', {
          class: 'hs-sheet-item', 'data-sheet-point': spot.id, 'data-kind': spot.kind,
        },
        el('h3', {}, el('span', { class: 'hs-sheet-n', text: String(i + 1) }), spot.label),
        el('p', {}, el('strong', {
          text: spot.kind === 'hazard' ? 'خطر: يُنقر ليُعثر عليه.' : 'ليس خطرًا: يُترك، ونقره يكلّف قلبًا.',
        })),
        spot.kind === 'hazard' ? el('p', {}, el('strong', { text: 'القاعدة: ' }), spot.rule) : null,
        spot.kind === 'decoy' && spot.why ? el('p', { text: spot.why }) : null,
        spot.kind === 'hazard' && spot.source ? el('p', { class: 'hs-source', text: `المصدر: ${spot.source}` }) : null))),
        figure(all.map((spot, i) => ({ spot, n: i + 1, result: spot.kind })), 'hs-sheet-figure')));
  }

  /** Whole items, in order, as many as the stage holds under the head,
   *  measured (the decision game's paging); `sheet=` picks the page. */
  function pageTheSheet() {
    const sheet = root.querySelector('[data-sheet]');
    const parts = [...sheet.querySelectorAll('[data-sheet-point]')];
    const bottom = root.getBoundingClientRect().top + root.clientHeight
      - parseFloat(getComputedStyle(root).paddingBlockEnd);
    const room = bottom - parts[0].getBoundingClientRect().top;
    const gap = parseFloat(getComputedStyle(parts[0].parentElement).rowGap) || 0;
    let pages = 1;
    let used = 0;
    for (const part of parts) {
      const height = part.getBoundingClientRect().height;
      if (used && used + gap + height > room) { pages += 1; used = 0; }
      used += (used ? gap : 0) + height;
      part.dataset.page = String(pages);
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
    focused = null;
    root.setAttribute('data-screen', state.screen);
    root.replaceChildren(VIEWS[state.screen]());
    canvas = null;
    ctx = null;
    fxCanvas = null;
    fx = null;
    if (state.screen === 'sheet') { pageTheSheet(); }
    if (state.screen === 'play') {
      canvas = root.querySelector('[data-canvas]');
      ctx = canvas.getContext('2d');
      fxCanvas = root.querySelector('[data-fx]');
      fx = fxCanvas.getContext('2d');
      bindField();
      resize();
      lightUp();
      hud();
      draw();
    }
    if (hadFocus) {
      const target = [...root.querySelectorAll('[data-focus]')].pop();
      if (target) { target.focus({ preventScroll: true }); }
    }
  }

  // ---- INPUT: the light follows the pointer, a finger, the arrows or Tab ---

  function bindField() {
    const field = root.querySelector('[data-field]');
    const aim = (event) => {
      if (!round || state.paused || round.endAt !== null) { return; }
      const box = field.getBoundingClientRect();
      round.light.tx = clamp((event.clientX - box.left) / box.width, 0, 1);
      round.light.ty = clamp((event.clientY - box.top) / box.height, 0, 1);
    };
    // The spot under a point (a finger's pointerup is captured by where it
    // began, so its target cannot say where it ended).
    const spotAt = (event) => {
      const hit = document.elementFromPoint(event.clientX, event.clientY);
      const node = hit && hit.closest ? hit.closest('[data-spot]') : null;
      return node && field.contains(node) ? node.dataset.spot : null;
    };
    field.addEventListener('pointerdown', (event) => {
      const node = event.target instanceof Element ? event.target.closest('[data-spot]') : null;
      const id = node ? node.dataset.spot : null;
      if (id !== peeked) { peeked = null; }
      // What the press saw before it moved the light or the focus.
      down = { spot: id, lit: Boolean(node && node.hasAttribute('data-lit')), type: event.pointerType, slid: false };
      aim(event);
    });
    field.addEventListener('pointermove', aim);
    field.addEventListener('pointerup', (event) => { if (down) { down.slid = spotAt(event) !== down.spot; } });
    field.addEventListener('pointercancel', () => { down = null; });
    field.addEventListener('focusin', (event) => {
      const node = event.target instanceof Element ? event.target.closest('[data-spot]') : null;
      const spot = node && spots.find((s) => s.id === node.dataset.spot);
      focused = spot ? spot.id : null;
      if (spot && round && round.endAt === null) { round.light.tx = spot.x; round.light.ty = spot.y; }
      lightUp();
    });
    field.addEventListener('focusout', () => { focused = null; lightUp(); });
  }

  function setPaused(paused) {
    if (!round || state.screen !== 'play' || round.endAt !== null) { return; }
    state.paused = paused;
    root.querySelector('[data-paused]').hidden = !paused;
    if (paused) { root.querySelector('[data-act=resume]').focus(); }
    round.last = 0;
  }

  root.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button') : null;
    if (!target || target.disabled || !root.contains(target)) { return; }
    if (target.dataset.spot !== undefined) {
      const began = down;
      down = null;
      const spot = spots.find((s) => s.id === target.dataset.spot);
      if (!spot) { return; }
      // Enter or Space (detail 0) presses, whatever a pointer did before it.
      if (began && event.detail !== 0) {
        // Began on another spot or ended off this one: it moved the light.
        if (began.slid || began.spot !== spot.id) { return; }
        if ((began.type === 'touch' || began.type === 'pen') && !began.lit) { look(spot); return; }
      }
      press(spot);
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
      sfx.find(1);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (state.screen !== 'play' || !round) { return; }
    const lower = (event.key || '').toLowerCase();
    if (lower === 'm') { const sound = root.querySelector('[data-act=sound]'); if (sound) { sound.click(); } return; }
    if ((lower === 'p' || lower === 'escape') && !state.paused) { event.preventDefault(); setPaused(true); return; }
    if (state.paused || round.endAt !== null) { return; }
    if (KEYS[lower]) {
      // The arrows move the light (RTL changes nothing: a picture's left is its left).
      event.preventDefault();
      const [dx, dy] = KEYS[lower];
      round.light.tx = clamp(round.light.tx + dx * 0.05, 0, 1);
      round.light.ty = clamp(round.light.ty + dy * 0.05 * aspect, 0, 1);
      return;
    }
    // Enter or Space on the open scene presses the spot under the light.
    if ((lower === 'enter' || lower === ' ') && document.activeElement === root.querySelector('[data-field]')) {
      event.preventDefault();
      const lx = round.light.x * fieldW;
      const ly = round.light.y * fieldH;
      const under = spots.find((s) => Math.hypot(s.x * fieldW - lx, s.y * fieldH - ly) < s.r * fieldW);
      if (under) { press(under); }
    }
  });
  window.addEventListener('resize', () => { resize(); lightUp(); draw(); });
  // The words' widths change when the lecture's font arrives.
  if (document.fonts) { document.fonts.ready.then(() => { resize(); draw(); }).catch(() => {}); }
  // Off screen (the deck moved on, or the tab is hidden) the round waits.
  if (window.deckNav && typeof window.deckNav.onScreen === 'function') {
    window.deckNav.onScreen((on) => { offScreen = !on; if (round) { round.last = 0; } });
  }
  document.addEventListener('visibilitychange', () => { if (round) { round.last = 0; } });

  // ---- the platform's hooks, and a returning learner ----------------------

  registerTest({
    decisions: () => hazards.map((hazard) => ({ id: hazard.id, choices: ['found', 'missed'] })),
    play: async (path) => {
      // Through the game's own record(), never its light: every hazard the
      // learner has not met is resolved as `path` says, in order; then the
      // debrief, which reports `none` for what `skip` left, and the end.
      cancelAnimationFrame(raf);
      round = null;
      state.preview = null;
      for (const hazard of left()) {
        if (path === 'skip') { break; }
        record(hazard, path === 'right' ? 'found' : 'missed', 0);
      }
      if (state.screen !== 'done') { toDebrief(); end(); }
    },
    moment: async (name) => {
      // A moment is a picture: it reports nothing and saves nothing.
      cancelAnimationFrame(raf);
      state.preview = null;
      if (name === 'start') { round = null; show('intro'); return; }
      if (name === 'feedback-sheet') { round = null; show('sheet'); return; }
      if (name === 'debrief') {
        round = null;
        state.preview = Object.fromEntries(hazards.map((h) => [h.id, state.outcomes[h.id] || 'missed']));
        show('debrief');
        return;
      }
      // after-wrong: the scene the instant a decoy was pressed -- a hazard
      // found a moment before, a heart gone, the light on the decoy, its
      // words up, the burst still in the air. Drawn once, no loop.
      const decoy = spots.find((s) => s.kind === 'decoy');
      const hazard = spots.find((s) => s.kind === 'hazard');
      round = newRound(true);
      round.t = round.length * 0.4;
      round.light = { x: decoy.x, y: decoy.y, tx: decoy.x, ty: decoy.y };
      state.paused = false;
      show('play');
      round.marks[hazard.id] = 'found';
      nodes[hazard.id].dataset.outcome = 'found';
      round.score = R.points;
      round.marks[decoy.id] = 'decoy';
      nodes[decoy.id].dataset.outcome = 'decoy';
      round.hearts = R.hearts - 1;
      const p = at(decoy);
      burst(p.x, p.y, C.bad, 12);
      ripple(p.x, p.y, C.bad, decoy.r * fieldW * 1.8);
      floater(p.x, p.y, '−♥', C.bad);
      round.particles.forEach((q) => { q.age = 0.08; q.x += q.vx * 0.08; q.y += q.vy * 0.08; });
      round.ripples.forEach((w) => { w.age = 0.15; });
      decoyToast(decoy, round.hearts);
      lightUp();
      hud();
      draw();
    },
  });

  onRestore(({ done, progress }) => {
    // Only a hazard the host says was reported, with an outcome the game knows.
    const raw = progress.outcomes && typeof progress.outcomes === 'object' ? progress.outcomes : {};
    state.outcomes = {};
    for (const hazard of hazards) {
      const act = raw[hazard.id];
      if (done.includes(hazard.id) && ['found', 'missed', 'none'].includes(act)) { state.outcomes[hazard.id] = act; }
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
