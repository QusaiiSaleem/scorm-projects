/*
 * games/sequence/game.js -- the sequence game (2026-11-07, learning-games
 * spec §5 game 3; Scitter plan Task 21).
 *
 * A PROCEDURE PUT IN ORDER, MADE A GAME (components/sequence-sort.html was a
 * list dragged into order and checked: a quiz). The steps ride a belt,
 * shuffled among decoys, and the learner catches the one that comes now, against
 * hearts, a clock and a belt that speeds up. How it plays, and the tuning as
 * measured, are in this folder's README.md.
 *
 * WHAT IS ADAPTED. The sound -- tone() and the hurt, win and lose effects --
 * is dsh-game-studio's collector template's (template/collector/game.js),
 * by way of the catch game, under the MIT licence:
 * Copyright (c) 2026 ZSeven—W. The licence text is in this folder's README.md.
 * The belt, the chain and the juice are written for this game; the seeded
 * generator is mulberry32 (public domain).
 *
 * WHAT IT REPORTS (README.md says why). One `performance` row per step: at
 * turn k the FIRST card picked answers step k -- `response` that card's ASCII
 * id, `result` correct only for step k's own, `latency` from the turn's
 * opening; later picks are practice. Not SCORM 1.2's `sequencing` `a,b,c`: the
 * core announces ASCII ids, a comma is not one, and a row per step says where
 * the order broke. Decoys give every turn, the last too, a wrong card to pick.
 * A step never reached is none/wrong when the debrief opens; a replay is
 * practice; progress keeps each first pick and how far the chain got.
 */
import {
  announce, debrief, el, finish, GameContentError, latencyFrom, onRestore, readContent, registerTest, save, setting,
} from '../core/game-core.js';

/** content.schema.json without its descriptions: what readContent enforces. */
export const SHAPE = {
  'x-points': 'steps[]',
  type: 'object',
  required: ['title', 'rule', 'source', 'steps', 'decoys'],
  properties: {
    title: { type: 'string', minLength: 1 },
    rule: { type: 'string', minLength: 1 },
    source: { type: 'string' },
    steps: {
      type: 'array',
      minItems: 3,
      items: {
        type: 'object',
        required: ['id', 'label'],
        properties: {
          id: { type: 'string', pattern: '^[A-Za-z0-9_-]{1,64}$' },
          label: { type: 'string', minLength: 1 },
        },
      },
    },
    decoys: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['id', 'label', 'rule'],
        properties: {
          id: { type: 'string', pattern: '^[A-Za-z0-9_-]{1,64}$' },
          label: { type: 'string', minLength: 1 },
          rule: { type: 'string', minLength: 1 },
        },
      },
    },
  },
};

/* RULES: every gameplay value in one place. A learner's slide has no
   settings; render_slide may pass `duration` and `lives` (game.json declares
   their ranges, the platform checks them). */
const DEFAULTS = {
  hearts: 3,
  clockBase: 10, // seconds a round has, plus...
  clockPerStep: 6, // ...this many per step still to place (README, "Tuning, measured")
  speed: 190, // px a second the belt runs at the start...
  maxSpeed: 360, // ...and never faster
  speedUp: 0.12, // the belt gains this share per step placed
  passCost: 3, // seconds the clock loses when the card that comes now rides off...
  passSeen: 2, // ...after it was on screen this many seconds of its turn
  slowEvery: 3, // first-try rights in a row that slow the belt...
  slowSeconds: 4, // ...for this long
  slowFactor: 0.45,
  focusFactor: 0.4, // a card holding the keyboard's focus slows the belt
  hintAfter: 2, // wrong cards on one turn before the right one lights up
  comboCap: 4,
};
const MAX_STEPS = 10;
const MAX_DECOYS = 4;
const WORLD = { w: 1280, h: 720 };
const CARD = { w: 200, h: 112, gap: 24 };
const PITCH = CARD.w + CARD.gap;
const SPACING = 330; // a card's share of the belt: about four on screen at once...
const LAP_MAX = 2640; // ...unless a lap would grow past this, then closer, never under PITCH
const EXIT = WORLD.w + PITCH / 2 + CARD.w / 2; // the lap distance at which a card leaves on the far side
/* A FINGER WOBBLES (bindCard). A press becomes a drag past DRAG_PX of the
   slide: the deck draws it at 0.3 to 0.9 of its size, so the 10 this was read
   a 3 px wobble as a drag that picked nothing; a real drag to the slot runs
   250 px. A tap picks on the browser's click, or CLICK_WAIT_MS after the lift
   when none comes (past the browser's own tap slop); a pointer's click within
   SWALLOW_MS of a press already handled is that press's. */
const DRAG_PX = 36;
const CLICK_WAIT_MS = 120;
const SWALLOW_MS = 600;
const BELT_Y = 222; // the line the card centres ride on (game.css's .sq-belt)
const STRIPE = 48; // the belt's stripe period, so its motion reads
const ROLLER = 36; // the end rollers' radius
const END_PAUSE_MS = 800;
const FLIGHT_MS = 420;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : (v > b ? b : v));
const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
/** What progress keeps for a step answered in an earlier session whose card
 *  the content no longer has: never an id, so it never reads as a card. */
const EARLIER = '*';
/** A number with its sign or its ×, kept left to right inside Arabic text:
 *  bare, «+20» reads «20+» and «×2» reads «2×» (measured 2026-11-07). */
const iso = (text) => `⁦${text}⁩`;

function int(name, low, high) {
  const value = setting(name);
  return value === null ? null : clamp(value, low, high);
}

/** mulberry32 (public domain), seeded from the ids: the belt's order, the
 *  sparks and the shake are the same on every play of the same content. */
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

/** What the core's shape cannot say, refused the core's way: an Arabic box on
 *  the stage, one console error naming it, no test hooks. */
function refuse(root, arabic, english, named) {
  root.setAttribute('data-screen', 'error');
  root.classList.add('game-root');
  root.replaceChildren(el('div', { class: 'game-error', role: 'alert' },
    el('p', { class: 'game-error-title', text: 'تعذّر تشغيل اللعبة: محتواها لا يطابق شكلها.' }),
    el('p', { text: arabic }),
    el('p', {}, el('span', { class: 'ltr-inline', dir: 'ltr', text: named }))));
  console.error(`[game] ${arabic} ${english}`);
}

function checked(root, content) {
  const seen = new Set();
  for (const card of [...content.steps, ...content.decoys]) {
    if (seen.has(card.id)) {
      refuse(root, `المعرّف «${card.id}» لخطوة ولبطاقة أخرى معًا، فلا يُعرف أيّهما اختار المتعلّم.`,
        `the id "${card.id}" names a step and another card at once (steps and decoys share one set of ids), so an answer would not say which card was picked; give each its own id.`,
        `id = "${card.id}"`);
      return false;
    }
    seen.add(card.id);
  }
  if (content.steps.length > MAX_STEPS || content.decoys.length > MAX_DECOYS) {
    refuse(root, `الإجراء أطول مما يتّسع له الشريط: حتى ${MAX_STEPS} خطوات و${MAX_DECOYS} بطاقات دخيلة.`,
      `the belt and the chain hold at most ${MAX_STEPS} steps and ${MAX_DECOYS} decoys (this content has ${content.steps.length} and ${content.decoys.length}); split the procedure into two games.`,
      `steps: ${content.steps.length}, decoys: ${content.decoys.length}`);
    return false;
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
  if (!checked(root, content)) { return; }
  root.classList.add('game-root', 'sq');

  const { steps, decoys } = content;
  const n = steps.length;
  const byId = Object.fromEntries([...steps, ...decoys].map((card) => [card.id, card]));
  const isDecoy = (id) => decoys.some((d) => d.id === id);
  const R = { ...DEFAULTS };
  R.hearts = int('lives', 1, 5) || R.hearts;

  const state = {
    screen: 'intro', // intro | play | won | lost | debrief | done | sheet
    picks: {}, // step id -> the FIRST card picked in its turn, or `none`
    placed: 0, // how far the reporting chain got, for a returning learner
    preview: null, // picks a moment shows without anyone acting
    paused: false,
    muted: true,
  };
  let round = null;
  let raf = 0;
  let offScreen = false;
  let audio = null;
  const left = () => steps.filter((step) => !has(state.picks, step.id));
  /** The wrong card a learner can pick at turn k: the next step, or a decoy
   *  on the last turn. Both ride the belt then. */
  const wrongFor = (k) => (k + 1 < n ? steps[k + 1].id : decoys[0].id);

  function persist() {
    save({ picks: state.picks, placed: state.placed, finished: state.screen === 'done' });
  }

  /** The first pick of a step's turn, reported once; a later pick, and a
   *  replay's, is practice. */
  function record(step, picked, ms) {
    if (has(state.picks, step.id)) { return false; }
    // The debrief shows only what the LMS holds: a pick the core refused (the
    // id was reported in an earlier session) is not written down as one.
    if (!announce({
      id: step.id, type: 'performance', response: picked,
      result: picked === step.id ? 'correct' : 'wrong', latency: latencyFrom(ms),
    })) { return false; }
    state.picks[step.id] = picked;
    persist();
    return true;
  }

  /* SOUND: a few WebAudio tones, off until the learner turns them on. */
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
    place: (combo) => tone(520 + 90 * combo, 0.12, 'sine', 0.07, 980 + 120 * combo),
    hurt: () => tone(190, 0.24, 'sawtooth', 0.08, 70),
    slow: () => tone(660, 0.3, 'triangle', 0.05, 330),
    win: () => { tone(660, 0.1, 'sine', 0.07); setTimeout(() => tone(880, 0.12, 'sine', 0.07), 90); setTimeout(() => tone(1320, 0.2, 'sine', 0.06), 200); },
    lose: () => tone(300, 0.34, 'sawtooth', 0.08, 90),
    pass: () => tone(420, 0.2, 'triangle', 0.06, 160),
    tick: () => tone(1200, 0.03, 'square', 0.02),
  };

  // ---- a round ------------------------------------------------------------

  function newRound(practice, at) {
    const rand = seeded([...steps, ...decoys].map((card) => card.id).join(','));
    const ids = [...steps.slice(at).map((step) => step.id), ...decoys.map((d) => d.id)];
    for (let i = ids.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    const spacing = clamp(LAP_MAX / ids.length, PITCH, SPACING);
    const lap = Math.max(WORLD.w + PITCH, ids.length * spacing);
    const asked = int('duration', 3, 300);
    return {
      practice, at, rand, lap, ids, spacing,
      cards: [], // built by the play view
      t: 0, last: 0, offset: 0, lost: 0, passes: 0,
      length: asked !== null ? asked : R.clockBase + R.clockPerStep * (n - at),
      hearts: R.hearts, score: 0, streak: 0, best: 0, mistakes: 0, wrongs: 0, placedNow: 0,
      turnAt: 0, slow: 0, shake: 0, bonus: 0, tickAt: null,
      endAt: null, won: null, reason: null,
    };
  }

  function startRound() {
    const practice = left().length === 0;
    round = newRound(practice, practice ? 0 : Math.min(state.placed, n - 1));
    state.paused = false;
    show('play');
    arm();
    say(`الخطوة ${round.at + 1} من ${n}. أيّ بطاقة تأتي الآن؟`);
    raf = requestAnimationFrame(frame);
  }

  /** Seconds the round still has: its clock, less time played and passes. */
  const remainingOf = (r) => r.length - r.t - r.lost;
  /** How many times a card has left on the far side: it only grows. */
  const lapsOf = (card) => Math.floor((card.u0 + round.offset - EXIT) / round.lap);
  const dueCard = () => (round.at < n ? round.cards.find((c) => c.id === steps[round.at].id) : null);

  /** A turn opens: the card that comes now has not been seen yet. */
  function arm() {
    const due = round && dueCard();
    if (due) { due.laps = lapsOf(due); due.seen = 0; }
  }

  /** The card that comes now rode off the far end after the learner saw it:
   *  the clock pays and the combo breaks. A pass is not a pick: no row. */
  function passed(card) {
    const r = round;
    r.lost += R.passCost;
    r.streak = 0;
    r.passes += 1;
    floater(CARD.w / 2 + 30, BELT_Y - 10, `فاتتك! ${iso(`−${R.passCost}`)} ث`, 'bad');
    const time = root.querySelector('[data-time]');
    if (time) {
      delete time.dataset.hit;
      void time.offsetWidth;
      time.dataset.hit = '';
      later(() => { delete time.dataset.hit; }, 700);
    }
    sfx.pass();
    say(`فاتتك «${card.label}»: خسرت ${R.passCost} ثوانٍ.`);
  }

  /** Where a card is on the belt: it enters at the reading start (the
   *  right) and rides towards the left, and comes round again. */
  function beltX(card) {
    const u = (((card.u0 + round.offset) % round.lap) + round.lap) % round.lap;
    return WORLD.w + PITCH / 2 - u;
  }

  function onBelt(card) {
    return !card.placed && !card.held;
  }

  function pick(card) {
    const r = round;
    if (!r || state.screen !== 'play' || state.paused || r.endAt !== null || card.placed || card.node.hidden) { return; }
    const step = steps[r.at];
    record(step, card.id, (r.t - r.turnAt) * 1000);
    if (card.id === step.id) { place(card); } else { miss(card, step); }
  }

  function place(card) {
    const r = round;
    const k = r.at;
    const firstTry = r.wrongs === 0;
    r.streak = firstTry ? r.streak + 1 : 0;
    r.best = Math.max(r.best, r.streak);
    const combo = Math.min(R.comboCap, Math.max(1, r.streak));
    const points = firstTry ? 10 * combo : 5;
    r.score += points;
    card.placed = true;
    card.node.disabled = true;
    card.node.dataset.result = 'correct';
    delete card.node.dataset.hint;
    r.cards.forEach((c) => { delete c.node.dataset.hint; });
    fly(card, k);
    fill(k, card.id, 'correct');
    r.at += 1;
    r.wrongs = 0;
    r.turnAt = r.t;
    r.placedNow += 1;
    arm();
    if (!r.practice) { state.placed = Math.max(state.placed, r.at); persist(); }
    const slot = slotCentre(k);
    later(() => {
      burst(slot.x, slot.y, 'good', 16);
      floater(slot.x, slot.y - 30, iso(`+${points}`), 'good');
      if (combo > 1) { floater(slot.x, slot.y - 90, `سلسلة ${iso(`×${combo}`)}`, 'combo'); }
    }, FLIGHT_MS - 60);
    if (firstTry && r.streak % R.slowEvery === 0) {
      r.slow = R.slowSeconds;
      floater(WORLD.w / 2, BELT_Y + 92, 'الشريط أبطأ!', 'slow');
      sfx.slow();
    } else if (r.placedNow % 2 === 0 && r.at < n) {
      floater(WORLD.w - 150, BELT_Y - 60, 'أسرع!', 'combo');
    }
    sfx.place(combo);
    if (r.at >= n) {
      r.bonus = r.practice ? 0 : Math.max(0, Math.ceil(remainingOf(r))) * 2;
      r.score += r.bonus;
      r.endAt = performance.now();
      r.won = true;
      say(`اكتملت السلسلة. ${card.label} في مكانها.`);
    } else {
      say(`${card.label}: في مكانها. الخطوة ${r.at + 1} من ${n}.`);
    }
    hud();
  }

  function miss(card, step) {
    const r = round;
    r.wrongs += 1;
    r.mistakes += 1;
    r.streak = 0;
    r.hearts -= 1;
    r.shake = 0.35;
    const node = card.node;
    delete node.dataset.result;
    void node.offsetWidth; // restart the wiggle on a second miss of the same card
    node.dataset.result = 'wrong';
    clearTimeout(card.timer);
    card.timer = setTimeout(() => { if (!card.placed) { delete node.dataset.result; } }, 700);
    const x = clamp(beltX(card), 80, WORLD.w - 80);
    burst(x, BELT_Y, 'bad', 10);
    floater(x, BELT_Y - 10, iso('−♥'), 'bad');
    sfx.hurt();
    const decoy = isDecoy(card.id);
    toast(decoy
      ? [el('strong', { text: `«${card.label}» ليست من الخطوات. ` }), byId[card.id].rule]
      : [el('strong', { text: `«${card.label}» ليست الآن: ` }), 'تأتي لاحقًا في الإجراء.']);
    if (r.wrongs >= R.hintAfter) {
      const right = r.cards.find((c) => c.id === step.id);
      if (right) { right.node.dataset.hint = ''; }
    }
    if (r.hearts <= 0) {
      r.endAt = performance.now();
      r.won = false;
      r.reason = 'hearts';
    }
    say(decoy ? `خطأ: ${card.label} ليست من الخطوات. ${byId[card.id].rule}` : `خطأ: ${card.label} تأتي لاحقًا.`);
    hud();
  }

  function update(dt) {
    const r = round;
    if (r.shake > 0) { r.shake -= dt; }
    if (r.endAt !== null) { return; }
    r.t += dt;
    if (r.slow > 0) { r.slow = Math.max(0, r.slow - dt); }
    const focused = r.cards.some((c) => onBelt(c) && c.node === document.activeElement && c.node.matches(':focus-visible'));
    const speed = Math.min(R.maxSpeed, R.speed * (1 + R.speedUp * r.placedNow))
      * (r.slow > 0 ? R.slowFactor : 1) * (focused ? R.focusFactor : 1);
    r.offset += speed * dt;
    const due = dueCard();
    if (due && !onBelt(due)) {
      due.laps = lapsOf(due); // held in a finger: it is not riding past
    } else if (due) {
      const x = beltX(due);
      if (x + CARD.w / 2 > 0 && x - CARD.w / 2 < WORLD.w) { due.seen += dt; }
      const laps = lapsOf(due);
      if (laps > due.laps) {
        due.laps = laps;
        if (due.seen >= R.passSeen) { passed(due); }
        due.seen = 0;
      }
    }
    const remaining = remainingOf(r);
    if (remaining <= 5 && remaining > 0 && Math.ceil(remaining) !== r.tickAt) { r.tickAt = Math.ceil(remaining); sfx.tick(); }
    if (remaining <= 0) {
      r.endAt = performance.now();
      r.won = false;
      r.reason = 'time';
      say('انتهى الوقت.');
    }
    hud();
  }

  // ---- drawing: the belt, the cards, the shake ---------------------------

  let fitScale = 1;
  function resize() {
    const world = root.querySelector('[data-world]');
    if (!world) { return; }
    const w = root.clientWidth || WORLD.w;
    const h = root.clientHeight || WORLD.h;
    fitScale = Math.min(w / WORLD.w, h / WORLD.h);
    world.style.left = `${(w - WORLD.w * fitScale) / 2}px`;
    world.style.top = `${(h - WORLD.h * fitScale) / 2}px`;
    world.style.scale = String(fitScale);
  }

  function draw() {
    const r = round;
    const world = root.querySelector('[data-world]');
    if (!r || !world) { return; }
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shake = r.shake > 0 && !calm ? r.shake * 14 : 0;
    world.style.translate = shake ? `${(r.rand() * 2 - 1) * shake}px ${(r.rand() * 2 - 1) * shake}px` : '0 0';
    const track = world.querySelector('[data-track]');
    if (track) { track.style.backgroundPositionX = `${-(r.offset % STRIPE)}px`; }
    world.querySelectorAll('[data-roller]').forEach((roller) => {
      roller.style.rotate = `${(-r.offset / ROLLER) % TAU}rad`;
    });
    let lostFocus = false;
    for (const card of r.cards) {
      if (card.placed) { continue; }
      if (card.held) {
        card.node.style.transform = `translate(${card.hx - CARD.w / 2}px, ${card.hy - CARD.h / 2}px)`;
        continue;
      }
      const x = beltX(card);
      const away = x + CARD.w / 2 <= 0 || x - CARD.w / 2 >= WORLD.w;
      if (away !== card.node.hidden) {
        if (away && card.node === document.activeElement) { lostFocus = true; }
        card.node.hidden = away;
      }
      if (!away) { card.node.style.transform = `translate(${x - CARD.w / 2}px, ${BELT_Y - CARD.h / 2}px)`; }
    }
    if (lostFocus) {
      // The focused card rode off: hand the focus to the card leaving next.
      const next = r.cards.filter((c) => onBelt(c) && !c.node.hidden).sort((a, b) => beltX(a) - beltX(b))[0];
      if (next) { next.node.focus(); }
    }
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

  // ---- the juice: sparks, floating words, the card's flight --------------

  const timers = new Set();
  function later(fn, ms) {
    const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
  }
  function stopTimers() { timers.forEach((id) => clearTimeout(id)); timers.clear(); }

  function fx() { return root.querySelector('[data-fx]'); }

  function burst(x, y, tone, count) {
    const layer = fx();
    if (!layer || !round) { return; }
    const many = matchMedia('(prefers-reduced-motion: reduce)').matches ? Math.ceil(count / 4) : count;
    for (let i = 0; i < many; i += 1) {
      const a = round.rand() * TAU;
      const d = 50 + round.rand() * 110;
      const spark = el('span', { class: 'sq-spark', 'data-tone': tone, 'aria-hidden': 'true' });
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.setProperty('--dx', `${Math.cos(a) * d}px`);
      spark.style.setProperty('--dy', `${Math.sin(a) * d}px`);
      layer.append(spark);
      setTimeout(() => spark.remove(), 750);
    }
  }

  function floater(x, y, text, tone) {
    const layer = fx();
    if (!layer) { return; }
    const node = el('span', { class: 'sq-float', 'data-tone': tone, 'aria-hidden': 'true', text });
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    layer.append(node);
    setTimeout(() => node.remove(), 1000);
  }

  function slotCentre(k) {
    const world = root.querySelector('[data-world]');
    const slot = root.querySelector(`[data-slot="${k}"]`);
    if (!world || !slot) { return { x: WORLD.w / 2, y: WORLD.h - 120 }; }
    const a = world.getBoundingClientRect();
    const b = slot.getBoundingClientRect();
    const s = fitScale || 1;
    return { x: (b.left - a.left + b.width / 2) / s, y: (b.top - a.top + b.height / 2) / s };
  }

  /** The right card flies from where it is into its slot, and is gone. */
  function fly(card, k) {
    const node = card.node;
    const from = card.held ? { x: card.hx, y: card.hy } : { x: beltX(card), y: BELT_Y };
    card.held = false;
    const to = slotCentre(k);
    const at = (p, s) => `translate(${p.x - CARD.w / 2}px, ${p.y - CARD.h / 2}px) scale(${s})`;
    node.style.transform = at(from, 1);
    if (node.animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const mid = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 60 };
      node.animate([
        { transform: at(from, 1), opacity: 1 },
        { transform: at(mid, 1.08), opacity: 1, offset: 0.45 },
        { transform: at(to, 0.55), opacity: 0 },
      ], { duration: FLIGHT_MS, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'forwards' });
      setTimeout(() => node.remove(), FLIGHT_MS + 40);
    } else {
      node.remove();
    }
  }

  /** Slot k holds the card `id`: its words, and a pop as the card lands. */
  function fill(k, id, result) {
    const slot = root.querySelector(`[data-slot="${k}"]`);
    if (!slot) { return; }
    slot.dataset.filled = '';
    slot.dataset.fresh = ''; // lands with a pop; a slot drawn already filled does not
    slot.dataset.result = result;
    slot.querySelector('[data-slot-label]').textContent = byId[id].label;
    root.querySelectorAll('[data-open]').forEach((s) => s.removeAttribute('data-open'));
    const next = root.querySelector(`[data-slot="${k + 1}"]`);
    if (next) { next.dataset.open = ''; }
  }

  // ---- what the learner reads and hears ----------------------------------

  function toast(children) {
    const box = root.querySelector('[data-toast]');
    if (!box) { return; }
    box.replaceChildren(...children);
    box.hidden = false;
    clearTimeout(box.timer);
    box.timer = setTimeout(() => { box.hidden = true; }, 3200);
  }

  function say(text) {
    const live = root.querySelector('[data-say]');
    if (live) { live.textContent = text; }
  }

  function hud() {
    const r = round;
    if (!r) { return; }
    const hearts = root.querySelector('[data-hearts]');
    if (!hearts) { return; }
    const full = Math.max(0, r.hearts);
    if (hearts.dataset.count !== String(full)) {
      hearts.dataset.count = String(full);
      hearts.replaceChildren(
        el('span', { class: 'sr-only', text: `القلوب: ${full} من ${R.hearts}` }),
        ...Array.from({ length: R.hearts }, (_, i) => el('span', {
          class: 'sq-heart', 'data-full': i < full ? 'true' : 'false', 'aria-hidden': 'true', text: '♥',
        })));
    }
    root.querySelector('[data-score]').textContent = `النقاط: ${r.score}`;
    const combo = root.querySelector('[data-combo]');
    const shown = Math.min(R.comboCap, r.streak);
    combo.hidden = shown < 2;
    combo.textContent = `سلسلة ${iso(`×${shown}`)}`;
    // Less a microsecond: a squeezed clock can land on 3.0000000000000004.
    const remaining = Math.max(0, Math.ceil(remainingOf(r) - 1e-6));
    const time = root.querySelector('[data-time]');
    time.textContent = `الوقت: ${remaining} ث`;
    time.toggleAttribute('data-low', remaining <= 5);
    time.dataset.passes = String(r.passes);
    const bar = root.querySelector('[data-timebar]');
    bar.style.scale = `${clamp(remainingOf(r) / r.length, 0, 1)} 1`;
    bar.toggleAttribute('data-low', remaining <= 5);
    const slow = root.querySelector('[data-slow]');
    slow.hidden = !(r.slow > 0);
    slow.textContent = `أبطأ: ${Math.ceil(r.slow)} ث`;
    const turn = root.querySelector('[data-turn]');
    turn.dataset.turn = String(r.at);
    turn.textContent = r.at < n ? `الخطوة ${r.at + 1} من ${n}: أيّ بطاقة تأتي الآن؟` : 'اكتملت السلسلة!';
  }

  // ---- the debrief, and the end -----------------------------------------

  function stopRound() {
    cancelAnimationFrame(raf);
    stopTimers();
    round = null;
  }

  function toDebrief() {
    stopRound();
    // Every step never reached is a decision never made: `none`, reported
    // once, now -- before the debrief that names it.
    for (const step of left()) {
      state.picks[step.id] = 'none';
      announce({ id: step.id, type: 'performance', response: 'none', result: 'wrong' });
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

  /** Where step k stands, told from its neighbours: true of any content. */
  function placeOf(k) {
    if (k === 0) { return `هي الخطوة الأولى، وتليها «${steps[1].label}».`; }
    if (k === n - 1) { return `هي الخطوة الأخيرة، بعد «${steps[k - 1].label}».`; }
    return `تأتي بعد «${steps[k - 1].label}» وقبل «${steps[k + 1].label}».`;
  }

  function rowsFor(picks) {
    return steps.map((step, k) => {
      const picked = picks[step.id];
      const met = typeof picked === 'string' && picked !== 'none' && has(byId, picked);
      const decoy = met && isDecoy(picked) ? byId[picked] : null;
      // Answered in an earlier session with a card this content no longer
      // has: the LMS holds that answer, and the debrief does not invent one.
      const earlier = picked === EARLIER;
      const right = met && picked === step.id;
      return {
        // A right row's «اختيارك» already names the step: the number is enough.
        id: step.id, situation: right ? `الخطوة ${k + 1}` : `الخطوة ${k + 1}: ${step.label}`,
        chosen: met ? byId[picked].label : (earlier ? 'إجابة من جلسة سابقة' : null),
        rule: decoy ? `${placeOf(k)} و«${decoy.label}» ليست من الخطوات: ${decoy.rule}` : placeOf(k),
        result: met ? (picked === step.id ? 'correct' : 'wrong') : (earlier ? 'neutral' : 'none'),
      };
    });
  }

  // ---- the views ----------------------------------------------------------

  function header(title, line) {
    return el('header', { class: 'sq-head' },
      line ? el('p', { class: 'sq-line', text: line }) : null,
      el('h2', { class: 'sq-title', tabindex: '-1', 'data-focus': true, text: title }));
  }

  function soundButton() {
    return el('button', {
      type: 'button', class: 'btn-ghost sq-sound', 'data-act': 'sound',
      'aria-pressed': state.muted ? 'false' : 'true', text: state.muted ? 'الصوت: مغلق' : 'الصوت: يعمل',
    });
  }

  /** The game in miniature beside the start and end screens: a belt with
   *  cards on it, and the chain they go into. Words, not pictures. */
  function scene() {
    const mini = (text, cls) => el('span', { class: cls, text });
    return el('div', { class: 'sq-scene', 'aria-hidden': 'true' },
      el('div', { class: 'sq-scene-belt' },
        mini('؟', 'sq-mini'), mini('؟', 'sq-mini'), mini('؟', 'sq-mini')),
      el('div', { class: 'sq-scene-arrow', text: '↓' }),
      el('div', { class: 'sq-scene-chain' },
        mini('1', 'sq-mini-slot'), mini('2', 'sq-mini-slot'), mini('3', 'sq-mini-slot')));
  }

  function introView() {
    const done = state.placed;
    const resuming = left().length > 0 && done > 0;
    return el('div', { class: 'sq-intro' },
      el('div', { class: 'sq-intro-text' },
        header(content.title, resuming ? `تابع: رتّبت ${done} من ${n} خطوات` : `${n} خطوات`),
        el('p', { text: 'تمرّ على الشريط بطاقات خطوات الإجراء مخلوطة، وبينها بطاقات دخيلة ليست منه. ابنِ السلسلة خطوة بعد خطوة: اختر البطاقة التي تأتي الآن.' }),
        el('p', { text: `لديك ${R.hearts} قلوب: تخسر قلبًا مع كل بطاقة في غير وقتها. والوقت يمضي، ويسرع الشريط مع كل خطوة: إن رأيت البطاقة الصحيحة وتركتها تفوتك خسرت ${R.passCost} ثوانٍ. كل ${R.slowEvery} اختيارات صحيحة متتالية تبطئ الشريط قليلًا.` }),
        el('p', { class: 'sq-how' }, 'انقر البطاقة، أو اسحبها إلى مكانها في السلسلة، أو انتقل إليها بالمفتاح ',
          el('span', { class: 'ltr-inline', dir: 'ltr', text: 'Tab' }), ' واضغط ',
          el('span', { class: 'ltr-inline', dir: 'ltr', text: 'Enter' }), '.'),
        el('div', { class: 'sq-actions' },
          el('button', {
            type: 'button', class: 'btn-primary', 'data-act': 'start', 'data-focus': true,
            text: resuming ? 'تابع' : 'ابدأ',
          }),
          soundButton())),
      scene());
  }

  function playView() {
    const r = round;
    const cards = r.ids.map((id, i) => {
      const node = el('button', {
        type: 'button', class: 'sq-card', 'data-card': id, hidden: true,
        'aria-label': `بطاقة: ${byId[id].label}`,
      }, el('span', { class: 'sq-card-grip', 'aria-hidden': 'true' }),
      el('span', { class: 'sq-card-label', text: byId[id].label }));
      return {
        id, label: byId[id].label, node, u0: (i + 1) * r.spacing, placed: false, held: false, hx: 0, hy: 0, laps: 0, seen: 0,
      };
    });
    r.cards = cards;
    cards.forEach(bindCard);
    const slots = steps.map((step, k) => el('li', {
      class: 'sq-slot', 'data-slot': k, 'data-open': k === r.at ? true : null,
      'data-filled': k < r.at ? true : null, 'data-result': k < r.at ? 'correct' : null,
    },
    el('span', { class: 'sq-slot-n', 'aria-hidden': 'true', text: String(k + 1) }),
    el('span', { class: 'sq-slot-ask', 'aria-hidden': 'true', text: '؟' }),
    el('span', { class: 'sq-slot-label', 'data-slot-label': true, text: k < r.at ? step.label : '' })));
    // The chain's columns through the CSSOM, never a style attribute: a
    // strict CSP drops the attribute and keeps what a script sets.
    const world = el('div', { class: 'sq-world', 'data-world': true },
      el('div', { class: 'sq-hud' },
        el('p', { class: 'sq-hearts', 'data-hearts': true }),
        el('p', { class: 'sq-score', 'data-score': true }),
        el('p', { class: 'sq-combo', 'data-combo': true, hidden: true }),
        el('p', { class: 'sq-time', 'data-time': true }),
        el('p', { class: 'sq-slow', 'data-slow': true, hidden: true }),
        el('div', { class: 'sq-hud-acts' },
          soundButton(),
          el('button', { type: 'button', class: 'btn-secondary', 'data-act': 'pause', text: 'إيقاف مؤقت' }))),
      el('div', { class: 'sq-timebar-track', 'aria-hidden': 'true' }, el('div', { class: 'sq-timebar', 'data-timebar': true })),
      el('p', { class: 'sq-prompt', 'data-turn': String(r.at) }),
      el('div', { class: 'sq-belt', 'aria-hidden': 'true' },
        el('div', { class: 'sq-track', 'data-track': true }),
        el('span', { class: 'sq-roller', 'data-roller': 'start' }),
        el('span', { class: 'sq-roller', 'data-roller': 'end' })),
      el('div', { class: 'sq-cards', role: 'group', 'aria-label': 'البطاقات على الشريط' }, cards.map((c) => c.node)),
      el('p', { class: 'sq-toast', 'data-toast': true, role: 'status', hidden: true }),
      el('div', { class: 'sq-chain' },
        el('p', { class: 'sq-chain-head', text: `السلسلة: ${content.title}` }),
        el('ol', { class: 'sq-slots', 'aria-label': 'السلسلة' }, slots)),
      el('div', { class: 'sq-fx', 'data-fx': true, 'aria-hidden': 'true' }));
    world.style.setProperty('--sq-cols', String(n <= 6 ? n : Math.ceil(n / 2)));
    world.style.setProperty('--sq-row', n <= 6 ? '172px' : '116px');
    return el('div', { class: 'sq-play', 'data-play': true },
      world,
      el('div', { class: 'sq-paused', 'data-paused': true, hidden: true },
        el('p', { class: 'sq-title', text: 'اللعبة متوقّفة' }),
        el('button', { type: 'button', class: 'btn-primary', 'data-act': 'resume', text: 'تابع اللعب' })),
      el('p', { class: 'sr-only', 'aria-live': 'polite', 'data-say': true }));
  }

  function stars(r) {
    if (!r || !r.won) { return 0; }
    return r.mistakes === 0 ? 3 : (r.mistakes <= 2 ? 2 : 1);
  }

  function endView() {
    const r = round;
    const won = state.screen === 'won';
    const placed = r ? r.at : state.placed;
    const got = stars(r);
    const why = !won && r && r.reason === 'time' ? 'انتهى الوقت' : 'نفدت قلوبك';
    return el('div', { class: 'sq-end', 'data-end': state.screen },
      el('div', { class: 'sq-end-text' },
        header(won ? 'اكتملت السلسلة!' : why, content.title),
        won ? el('p', { class: 'sq-stars', role: 'img', 'aria-label': `${got} من 3 نجوم` },
          ...[0, 1, 2].map((i) => el('span', { 'data-full': i < got ? 'true' : 'false', 'aria-hidden': 'true', text: '★' })))
          : null,
        el('p', { class: 'sq-big', text: `رتّبت ${placed} من ${n}` }),
        r ? el('p', { class: 'sq-stats', text: `النقاط: ${r.score} · أخطاء: ${r.mistakes} · أطول سلسلة: ${r.best}${r.bonus ? ` · مكافأة الوقت: ${iso(`+${r.bonus}`)}` : ''}` }) : null,
        r && r.practice ? el('p', { text: 'جولة تدريب: نتيجتك الأولى هي التي حُسبت.' }) : null,
        el('div', { class: 'sq-actions' },
          el('button', {
            type: 'button', class: won ? 'btn-primary' : 'btn-secondary', 'data-act': 'debrief',
            'data-focus': won ? true : null, text: 'إلى الخلاصة',
          }),
          el('button', {
            type: 'button', class: won ? 'btn-secondary' : 'btn-primary', 'data-act': 'again',
            'data-focus': won ? null : true, text: won ? 'العب مرة أخرى' : 'حاول مرة أخرى',
          }))),
      scene());
  }

  /** «إنهاء» in the head, so it is on screen however long the rows: under
   *  them it sat past 720 once a decoy was picked. */
  function debriefView() {
    const done = state.screen === 'done';
    return el('div', { class: 'sq-debrief' },
      el('div', { class: 'sq-debrief-head' },
        header('خلاصة الترتيب', content.title),
        done
          ? el('p', { class: 'sq-done', role: 'status', text: 'انتهيت. يمكنك المتابعة إلى الشريحة التالية.' })
          : el('button', { type: 'button', class: 'btn-primary', 'data-act': 'finish', text: 'إنهاء' })),
      el('div', { class: 'sq-procedure' },
        el('p', {}, el('strong', { text: 'القاعدة: ' }), content.rule),
        content.source ? el('p', { class: 'sq-source', text: `المصدر: ${content.source}` }) : null),
      debrief(rowsFor(state.preview || state.picks)));
  }

  /** Every step in its place, every decoy and why it is not one, the rule
   *  and the source, for a reviewer: moment=feedback-sheet. */
  function sheetView() {
    return el('div', { class: 'sq-sheet', 'data-sheet': true },
      el('header', { class: 'sq-sheet-head' },
        el('h2', { class: 'sq-title', text: `ورقة المراجعة: ${content.title}` }),
        el('p', {}, el('strong', { text: 'القاعدة: ' }), content.rule),
        content.source ? el('p', { class: 'sq-source', text: `المصدر: ${content.source}` }) : null,
        el('p', { class: 'sq-line', 'data-sheet-count': true })),
      el('div', { class: 'sq-sheet-items' },
        steps.map((step, k) => el('section', { class: 'sq-sheet-item', 'data-sheet-point': step.id, 'data-kind': 'step' },
          el('h3', {}, el('span', { class: 'sq-sheet-n', text: `${k + 1}` }), ` ${step.label}`),
          el('p', { text: placeOf(k) }))),
        decoys.map((decoy) => el('section', { class: 'sq-sheet-item', 'data-sheet-point': decoy.id, 'data-kind': 'decoy' },
          el('h3', { text: decoy.label }),
          el('p', {}, el('strong', { text: 'ليست من الخطوات: ' }), decoy.rule)))));
  }

  /** Whole items, in order, as many as the stage holds under the head,
   *  measured; `sheet=` picks the page (the decision game's paging). */
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
    root.setAttribute('data-screen', state.screen);
    root.replaceChildren(VIEWS[state.screen]());
    if (state.screen === 'sheet') { pageTheSheet(); }
    if (state.screen === 'play') {
      resize();
      hud();
      draw();
    }
    if (hadFocus) {
      const target = [...root.querySelectorAll('[data-focus]')].pop();
      if (target) { target.focus(); }
    }
  }

  // ---- input: a tap, a drag onto the open slot, the keyboard -------------

  function toWorld(event) {
    const world = root.querySelector('[data-world]').getBoundingClientRect();
    const s = fitScale || 1;
    return { x: (event.clientX - world.left) / s, y: (event.clientY - world.top) / s };
  }

  function overOpenSlot(event) {
    const slot = round && root.querySelector(`[data-slot="${round.at}"]`);
    if (!slot) { return false; }
    const b = slot.getBoundingClientRect();
    const pad = 24 * (fitScale || 1);
    return event.clientX >= b.left - pad && event.clientX <= b.right + pad
      && event.clientY >= b.top - pad && event.clientY <= b.bottom + pad;
  }

  /** A drag follows the finger and picks only dropped on the open slot; any
   *  other press is a tap (DRAG_PX, above). */
  function tapped(card) {
    card.tapTimer = 0;
    card.swallow = performance.now() + SWALLOW_MS;
    if (round && round.cards.includes(card)) { pick(card); }
  }

  function bindCard(card) {
    const node = card.node;
    node.addEventListener('pointerdown', (event) => {
      if (event.button > 0 || !round || state.paused || card.placed || round.endAt !== null) { return; }
      card.press = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
      try { node.setPointerCapture(event.pointerId); } catch (error) { /* a synthetic pointer has no capture */ }
    });
    node.addEventListener('pointermove', (event) => {
      const press = card.press;
      if (!press || event.pointerId !== press.id || !round) { return; }
      if (!press.moved && Math.hypot(event.clientX - press.x, event.clientY - press.y) > DRAG_PX) {
        press.moved = true;
        card.held = true;
        node.dataset.held = '';
      }
      if (press.moved) {
        const at = toWorld(event);
        card.hx = at.x;
        card.hy = at.y;
      }
    });
    const release = (event) => {
      const press = card.press;
      if (!press || event.pointerId !== press.id) { return; }
      card.press = null;
      if (!press.moved) {
        clearTimeout(card.tapTimer);
        card.tapTimer = event.type === 'pointerup' ? setTimeout(() => tapped(card), CLICK_WAIT_MS) : 0;
        return;
      }
      card.swallow = performance.now() + SWALLOW_MS;
      delete node.dataset.held;
      if (event.type === 'pointerup' && round && overOpenSlot(event)) {
        pick(card);
      }
      card.held = false;
    };
    node.addEventListener('pointerup', release);
    node.addEventListener('pointercancel', release);
  }

  function setPaused(paused) {
    if (!round || state.screen !== 'play') { return; }
    state.paused = paused;
    root.querySelector('[data-paused]').hidden = !paused;
    if (paused) { root.querySelector('[data-act=resume]').focus(); }
    round.last = 0;
  }

  root.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button') : null;
    if (!target || target.disabled || !root.contains(target)) { return; }
    if (target.dataset.card !== undefined) {
      const card = round && round.cards.find((c) => c.id === target.dataset.card);
      if (!card) { return; }
      // The tap's own click: it picks now, and the lift's fallback is off.
      if (card.tapTimer) { clearTimeout(card.tapTimer); tapped(card); return; }
      // A pointer's click after a press already handled; never Enter's (detail 0).
      if (event.detail > 0 && card.swallow && performance.now() < card.swallow) { card.swallow = 0; return; }
      pick(card);
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
      sfx.tick();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (state.screen !== 'play' || !round) { return; }
    const lower = (event.key || '').toLowerCase();
    if (lower === 'm') { const sound = root.querySelector('[data-act=sound]'); if (sound) { sound.click(); } }
    if ((lower === 'p' || lower === 'escape') && !state.paused) { event.preventDefault(); setPaused(true); }
  });
  window.addEventListener('resize', () => { if (state.screen === 'play') { resize(); } });
  // Off screen (the deck moved on, or the tab is hidden) the round waits.
  if (window.deckNav && typeof window.deckNav.onScreen === 'function') {
    window.deckNav.onScreen((on) => { offScreen = !on; if (round) { round.last = 0; } });
  }
  document.addEventListener('visibilitychange', () => { if (round) { round.last = 0; } });

  // ---- the platform's hooks, and a returning learner ----------------------

  registerTest({
    decisions: () => steps.map((step) => ({ id: step.id, choices: [...steps, ...decoys].map((card) => card.id) })),
    play: async (path) => {
      // Through the game's own record(), never the belt: each step not yet
      // answered gets its turn's first pick as `path` says -- itself, or a
      // card that rides the belt on that turn -- and the chain is complete;
      // then the debrief, which reports `none` for what `skip` left, and the
      // end.
      stopRound();
      state.preview = null;
      if (path !== 'skip') {
        steps.forEach((step, k) => { record(step, path === 'right' ? step.id : wrongFor(k), 0); });
        state.placed = n;
      }
      if (state.screen !== 'done') { toDebrief(); end(); }
    },
    moment: async (name) => {
      // A moment is a picture: it reports nothing and saves nothing.
      stopRound();
      state.preview = null;
      if (name === 'start') { show('intro'); return; }
      if (name === 'feedback-sheet') { show('sheet'); return; }
      if (name === 'debrief') {
        state.preview = Object.fromEntries(steps.map((step, k) => [step.id, state.picks[step.id] || wrongFor(k)]));
        show('debrief');
        return;
      }
      // after-wrong: the belt frozen the instant a decoy was picked on the
      // third turn -- a heart gone, the stage shaken, its rule up.
      const at = Math.min(2, n - 1);
      round = newRound(true, at);
      round.t = 6;
      round.score = 10 * at;
      round.hearts = R.hearts - 1;
      round.mistakes = 1;
      state.paused = false;
      show('play');
      const decoy = round.cards.find((c) => c.id === decoys[0].id);
      round.offset = ((PITCH / 2 + WORLD.w / 2 - decoy.u0) % round.lap + round.lap) % round.lap;
      round.shake = 0;
      draw();
      decoy.node.dataset.result = 'wrong';
      burst(WORLD.w / 2, BELT_Y, 'bad', 10);
      floater(WORLD.w / 2, BELT_Y - 10, iso('−♥'), 'bad');
      toast([el('strong', { text: `«${decoy.label}» ليست من الخطوات. ` }), byId[decoy.id].rule]);
      hud();
    },
  });

  onRestore(({ done, progress }) => {
    // Only a pick the host says was reported, of a card the content still has.
    const raw = progress.picks && typeof progress.picks === 'object' ? progress.picks : {};
    state.picks = {};
    for (const step of steps) {
      if (!done.includes(step.id)) { continue; }
      // Every step the host says was reported is answered here too, so it is
      // never picked again; one whose card is gone shows as answered earlier.
      const picked = has(raw, step.id) ? raw[step.id] : null;
      state.picks[step.id] = picked === 'none' || (typeof picked === 'string' && has(byId, picked)) ? picked : EARLIER;
    }
    // The chain can only have reached steps that were answered, in order.
    let reached = 0;
    while (reached < n && state.picks[steps[reached].id] && state.picks[steps[reached].id] !== 'none') { reached += 1; }
    const saved = Number.isInteger(progress.placed) ? progress.placed : 0;
    state.placed = clamp(saved, 0, reached);
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
