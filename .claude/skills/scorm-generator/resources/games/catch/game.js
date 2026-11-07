/*
 * games/catch/game.js -- the catch game (2026-11-07, learning-games spec §5,
 * game 2; Scitter plan Task 20, Revision 3 R3.6 / D15).
 *
 * THIS IS dsh-game-studio's `collector` TEMPLATE, USED WHOLE AND THEN EDITED
 * FOR LEARNING (template/collector/game.js and its artwork), MIT,
 * Copyright (c) 2026 ZSeven—W. The licence text is in this folder's README.md.
 * Qusai, 2026-11-07: «dont simplifiy use it then edit it to get the best
 * value» -- a first version had swapped collector's loop for three lanes.
 *
 * KEPT FROM COLLECTOR, as it was: its sections (rules, state, assets, audio,
 * input, spawning, update, render); free movement with WASD or the arrows and
 * the press-and-drag joystick; enemies that come in from the edges and chase,
 * keep apart from each other, grow faster with time and are knocked back by a
 * hit; hearts, the blink of invulnerability, the shield every N right acts and
 * its dashed ring; particles, floating text, the screen shake; its sprites,
 * their shadows and squish; its fallback shapes when a picture fails; the
 * letterboxed 1280x720 world on a canvas.
 *
 * EDITED FOR LEARNING:
 * - collector's pickups become the content's WORD CARDS. Every card looks the
 *   same; only its words say whether it is safe. A card stays for a while and
 *   then fades: walked over is `caught`, faded untouched is `passed`. That is
 *   the one definite outcome each card needs, so one report per card, first
 *   outcome only, and a platform play through record() that never touches
 *   the physics. Catching a hazard costs a heart and shows its rule.
 * - enemies carry no words. A hit costs a heart and reports nothing: they are
 *   the arcade pressure, not a decision.
 * - cards are buttons in the page over the canvas, not canvas text: Arabic is
 *   shaped by the browser, a lecture's deck.css styles them, the contrast
 *   check can measure them, and a tap or Tab and Enter on a card walks the
 *   character to it -- the way to play without dragging (WCAG 2.5.7). A tap
 *   on empty ground walks there too.
 * - screens, the score bar, the debrief, sound off until asked, colours from
 *   base.css variables, a seeded generator for everything collector left to
 *   Math.random, so the same content plays the same way in every render.
 *
 * Reports one `performance` row per card (response caught | passed, result
 * correct when it fits the kind, latency from the card's appearance), and
 * `none`/`wrong` for every card never met (a round lost, or left), sent when
 * the debrief opens. A replay is practice and reports nothing.
 */
import {
  announce, debrief, el, finish, GameContentError, latencyFrom, onRestore, readContent, registerTest, save, setting,
} from '../core/game-core.js';

/** content.schema.json without its descriptions: what readContent enforces. */
export const SHAPE = {
  'x-points': 'items[]',
  type: 'object',
  required: ['title', 'items'],
  properties: {
    title: { type: 'string', minLength: 1 },
    items: {
      type: 'array',
      minItems: 2,
      items: {
        type: 'object',
        required: ['id', 'label', 'kind', 'rule', 'source'],
        properties: {
          id: { type: 'string', pattern: '^[A-Za-z0-9_-]{1,64}$' },
          label: { type: 'string', minLength: 1 },
          kind: { type: 'string', enum: ['safe', 'hazard'] },
          rule: { type: 'string', minLength: 1 },
          source: { type: 'string' },
        },
      },
    },
    slots: {
      type: 'object',
      properties: {
        hero: { type: 'string' },
        enemy: { type: 'string' },
        item: { type: 'string' },
        background: { type: 'string' },
      },
    },
  },
};

/* 1. RULES -- collector's DEFAULTS, every gameplay value in one place, and
 *    the learning layer's beside them. A learner's slide has no settings;
 *    render_slide may pass `duration`, `lives` and `enemies` (game.json
 *    declares their ranges; the platform checks them). */
const DEFAULTS = {
  hearts: 3,
  heroSpeed: 320,
  enemySpeed: 120,
  enemySpeedGrowth: 3,
  enemySpawnEvery: 4,
  maxEnemies: 8,
  heroSize: 76,
  enemySize: 68,
  shield: { enabled: true, every: 3, seconds: 4 },
  // The learning layer.
  cardLife: 6, // seconds a card stays before it fades, passed
  cardEvery: 2.4, // seconds between two cards
  maxCards: 3, // cards on the meadow at once
};
const WORLD = { w: 1280, h: 720 };
const HUD_ROOM = 96; // the score bar's height over the top of the world
const MIN_LIFE = 1.5;
const END_PAUSE_MS = 650;
const RIGHT_ACT = { safe: 'caught', hazard: 'passed' };
const WRONG_ACT = { safe: 'passed', hazard: 'caught' };
const ACT_WORDS = { caught: 'أمسكتها', passed: 'تركتها' };
const KIND_WORDS = { safe: 'آمنة: تُمسَك', hazard: 'خطِرة: تُترَك' };
const PICTURES = ['hero', 'enemy', 'item', 'background'];
const MOVE_KEYS = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'];
/** A slot fill is a picture in the lecture's own assets, never an address. */
const SLOT_PATH = /^\.\.\/assets\/[A-Za-z0-9_.\-/]+\.(png|webp|jpe?g|gif|svg)$/;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : (v > b ? b : v));
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

function int(name, low, high) {
  const value = setting(name);
  return value === null ? null : clamp(value, low, high);
}

/** A seeded generator (mulberry32, as dsh's voxel template seeds its
 *  island): what collector drew from Math.random, the same on every play. */
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
  root.classList.add('game-root', 'ct');

  const items = content.items;
  const R = { ...DEFAULTS, shield: { ...DEFAULTS.shield } };
  R.hearts = int('lives', 1, 5) || R.hearts;
  const askedEnemies = int('enemies', 0, 8);
  const picture = Object.fromEntries(PICTURES.map((name) => {
    const fill = content.slots && content.slots[name];
    if (typeof fill === 'string' && SLOT_PATH.test(fill)) { return [name, fill]; }
    if (fill !== undefined) {
      console.warn(`[game] slots.${name} is not a picture under ../assets/ (${JSON.stringify(fill)}); the placeholder is shown.`);
    }
    return [name, new URL(`assets/${name}.svg`, import.meta.url).href];
  }));

  /* Colours: base.css variables, read once, so deck.css reaches the canvas
     too. Collector's own literals stay only as the fallback for a page with
     no stylesheet. */
  const css = getComputedStyle(document.documentElement);
  const colour = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
  const C = {
    good: colour('--color-accent', '#ffd66b'),
    bad: colour('--color-error', '#ff8a6e'),
    shield: colour('--color-info', '#9fe8ff'),
    surface: colour('--color-surface', '#ffffff'),
    font: colour('--font-body', 'system-ui, sans-serif'),
  };

  const state = {
    screen: 'intro', // intro | play | won | lost | debrief | done | sheet
    outcomes: {}, // item id -> the FIRST outcome: caught | passed | none
    preview: null, // outcomes a moment shows without anyone acting
    paused: false,
    muted: true,
  };
  let round = null;
  let raf = 0;
  let offScreen = false;
  let audio = null;
  const left = () => items.filter((item) => !(item.id in state.outcomes));
  const resultOf = (item, act) => (act === RIGHT_ACT[item.kind] ? 'correct' : 'wrong');

  function persist() {
    save({ outcomes: state.outcomes, finished: state.screen === 'done' });
  }

  /** The first outcome of a card, reported once; a replay's is practice. */
  function record(item, act, ms) {
    if (item.id in state.outcomes) { return false; }
    state.outcomes[item.id] = act;
    announce({
      id: item.id, type: 'performance', response: act, result: resultOf(item, act), latency: latencyFrom(ms),
    });
    persist();
    return true;
  }

  /* 4. ASSET LOADING + FALLBACKS (collector's section 4). The card's picture
     is the page's own <img>; the canvas draws hero, enemy and ground. */
  const images = { hero: null, enemy: null, background: null };
  let bgPattern = null;
  function loadImage(key) {
    const img = new Image();
    img.onload = () => { images[key] = img; if (key === 'background') { bgPattern = null; } };
    img.onerror = () => { /* never break: the fallback shape is drawn */ };
    img.src = picture[key];
  }
  ['hero', 'enemy', 'background'].forEach(loadImage);

  /* 5. AUDIO -- collector's WebAudio bleeps, off until the learner asks. */
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
    blip: () => tone(880, 0.08, 'sine', 0.06, 1320),
    hurt: () => tone(180, 0.22, 'sawtooth', 0.09, 70),
    miss: () => tone(320, 0.14, 'triangle', 0.05, 220),
    win: () => { tone(660, 0.1, 'sine', 0.07); setTimeout(() => tone(880, 0.16, 'sine', 0.07), 90); },
    lose: () => tone(300, 0.3, 'sawtooth', 0.08, 90),
  };

  // ---- a round ------------------------------------------------------------

  /** When each card appears and how long a round lasts. `duration` (a test
   *  setting) squeezes the same schedule into its seconds. */
  function schedule(n) {
    const asked = int('duration', 3, 120);
    let life = R.cardLife;
    let every = R.cardEvery;
    if (asked !== null) {
      life = clamp(asked * 0.45, MIN_LIFE, R.cardLife);
      every = n > 1 ? Math.max(0, (asked - life) / (n - 1)) : 0;
    }
    return { life, every, length: (n - 1) * every + life };
  }

  function newRound(list, practice) {
    const { life, every, length } = schedule(list.length);
    const rand = seeded(list.map((item) => item.id).join(','));
    return {
      list, practice, life, every, length, rand,
      t: 0, last: 0, next: 0, // the next card of `list` to appear
      cards: [], enemies: [], particles: [], floaters: [],
      hero: { x: WORLD.w / 2, y: WORLD.h / 2 + 60, dir: 1, target: null },
      hearts: R.hearts, score: 0, rightActs: 0, shield: 0, invuln: 0, shake: 0,
      // As many cards at once as the schedule needs: three by default, more
      // when `duration` squeezes the round, so the clock is the round's.
      maxCards: every > 0 ? Math.max(R.maxCards, Math.ceil(life / every) + 1) : list.length,
      // Collector's pressure, scaled to the round so a short one is no trap.
      maxEnemies: askedEnemies !== null ? askedEnemies : clamp(Math.ceil(list.length / 3), 1, R.maxEnemies),
      spawnTimer: clamp(length / 4, 2, 8),
      keys: Object.create(null), joystick: null,
      endAt: null, won: null,
    };
  }

  function startRound() {
    const list = left().length ? left() : items; // a replay plays every card again
    round = newRound(list, left().length === 0);
    state.paused = false;
    show('play');
    raf = requestAnimationFrame(frame);
  }

  /* 7. SPAWNING (collector's spawnPickup and spawnEnemy, seeded). */
  function spawnCard(item) {
    const node = el('button', {
      type: 'button', class: 'ct-card', 'data-card': item.id, 'aria-label': `بطاقة: ${item.label}. انقر لتمشي إليها.`,
    },
    el('img', { class: 'ct-card-art', src: picture.item, alt: '' }),
    el('span', { class: 'ct-card-label', text: item.label }),
    el('span', { class: 'ct-card-life', 'aria-hidden': 'true' }));
    root.querySelector('[data-cards]').append(node);
    const w = node.offsetWidth || 230;
    const h = node.offsetHeight || 110;
    const { rand, hero } = round;
    let x;
    let y;
    let tries = 0;
    do {
      x = w / 2 + 24 + rand() * (WORLD.w - w - 48);
      y = HUD_ROOM + h / 2 + rand() * (WORLD.h - HUD_ROOM - h - 24);
      tries += 1;
    } while (tries < 40 && (dist(x, y, hero.x, hero.y) < 280
      || round.cards.some((c) => !c.gone && Math.abs(c.x - x) < (c.w + w) / 2 + 16 && Math.abs(c.y - y) < (c.h + h) / 2 + 16)));
    const card = { item, node, x, y, w, h, born: round.t, outcome: null, gone: false };
    node.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px)`;
    round.cards.push(card);
    say(`بطاقة جديدة: ${item.label}`);
    return card;
  }

  function spawnEnemy() {
    if (round.enemies.length >= round.maxEnemies) { return; }
    const { rand } = round;
    const side = Math.floor(rand() * 4);
    let x;
    let y;
    if (side === 0) { x = -R.enemySize; y = rand() * WORLD.h; } else if (side === 1) { x = WORLD.w + R.enemySize; y = rand() * WORLD.h; } else if (side === 2) { x = rand() * WORLD.w; y = -R.enemySize; } else { x = rand() * WORLD.w; y = WORLD.h + R.enemySize; }
    round.enemies.push({ x, y, vx: 0, vy: 0, wob: rand() * TAU, hurt: 0 });
  }

  function addParticles(x, y, color, n) {
    const { rand } = round;
    const many = matchMedia('(prefers-reduced-motion: reduce)').matches ? Math.ceil(n / 3) : n;
    for (let i = 0; i < many; i += 1) {
      const a = rand() * TAU;
      const sp = 40 + rand() * 120;
      round.particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.3 + rand() * 0.4, age: 0, color, r: 2 + rand() * 3,
      });
    }
  }

  function addFloater(x, y, text, color) {
    round.floaters.push({ x, y, text, color, age: 0, life: 0.9 });
  }

  /* The learning layer's two outcomes. */
  function resolveCard(card, act) {
    const { item } = card;
    card.outcome = act;
    card.doneAt = round.t;
    card.node.dataset.outcome = act;
    const right = act === RIGHT_ACT[item.kind];
    card.node.dataset.result = right ? 'correct' : 'wrong';
    card.node.disabled = true;
    record(item, act, (round.t - card.born) * 1000);
    if (right) {
      round.score += 1;
      round.rightActs += 1;
      if (R.shield.enabled && round.rightActs % R.shield.every === 0) {
        round.shield = R.shield.seconds;
        addFloater(round.hero.x, round.hero.y - R.heroSize, `درع ${R.shield.seconds} ث`, C.shield);
      }
      addFloater(card.x, card.y - card.h / 2 - 10, '+1', C.good);
      if (act === 'caught') { addParticles(card.x, card.y, C.good, 14); }
      sfx.blip();
      say(`${ACT_WORDS[act]}: ${item.label}. أحسنت.`);
      return;
    }
    if (act === 'caught') {
      // A hazard caught is collector's hit: a heart, a shake, a burst.
      round.hearts -= 1;
      round.invuln = Math.max(round.invuln, 1.2);
      round.shake = 0.35;
      addParticles(card.x, card.y, C.bad, 12);
      sfx.hurt();
    } else {
      addFloater(card.x, card.y, 'فاتتك', C.bad);
      sfx.miss();
    }
    toast(item);
    say(`${ACT_WORDS[act]}: ${item.label}. ${item.rule}`);
  }

  /* An enemy's touch: collector's hurtHero, which reports nothing. */
  function hurtHero() {
    if (round.invuln > 0 || round.shield > 0) { knockEnemies(); return; }
    round.hearts -= 1;
    round.invuln = 1.2;
    round.shake = 0.35;
    sfx.hurt();
    knockEnemies();
    addParticles(round.hero.x, round.hero.y, C.bad, 10);
    say(`أصابك مطارد. بقي ${Math.max(0, round.hearts)} من القلوب.`);
  }

  function knockEnemies() {
    const { hero } = round;
    for (const e of round.enemies) {
      if (dist(e.x, e.y, hero.x, hero.y) < R.enemySize + R.heroSize + 8) {
        const dx = e.x - hero.x;
        const dy = e.y - hero.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        e.x += (dx / d) * 90;
        e.y += (dy / d) * 90;
        e.hurt = 0.3;
        e.vx = (dx / d) * 420;
        e.vy = (dy / d) * 420;
      }
    }
  }

  function bounceEnemy(e) {
    const { hero } = round;
    const dx = e.x - hero.x;
    const dy = e.y - hero.y;
    const d = Math.max(1, Math.hypot(dx, dy));
    const nx = dx / d;
    const ny = dy / d;
    const pushOut = (R.enemySize + R.heroSize) * 0.44 + 8 - d;
    e.x += nx * pushOut;
    e.y += ny * pushOut;
    e.vx = nx * 520;
    e.vy = ny * 520;
    addParticles(e.x, e.y, C.shield, 6);
  }

  /* 8. UPDATE (collector's section 8, the learning layer in it). */
  function update(dt) {
    const r = round;
    const { hero } = r;
    for (const p of r.particles) {
      p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.exp(-dt * 3); p.vy *= Math.exp(-dt * 3);
    }
    r.particles = r.particles.filter((p) => p.age < p.life);
    for (const f of r.floaters) { f.age += dt; f.y -= 40 * dt; }
    r.floaters = r.floaters.filter((f) => f.age < f.life);
    if (r.shake > 0) { r.shake -= dt; }
    if (r.endAt !== null) { return; }
    r.t += dt;

    // Movement: keys and the joystick, as collector; else walk to a target.
    let mx = 0;
    let my = 0;
    if (r.keys.arrowleft || r.keys.a) { mx -= 1; }
    if (r.keys.arrowright || r.keys.d) { mx += 1; }
    if (r.keys.arrowup || r.keys.w) { my -= 1; }
    if (r.keys.arrowdown || r.keys.s) { my += 1; }
    if (r.joystick && r.joystick.dragging) {
      const jd = Math.hypot(r.joystick.dx, r.joystick.dy);
      if (jd > 10) {
        const jp = clamp((jd - 10) / 60, 0, 1);
        mx += (r.joystick.dx / jd) * jp;
        my += (r.joystick.dy / jd) * jp;
      }
    }
    if (mx || my) {
      hero.target = null;
    } else if (hero.target) {
      const dx = hero.target.x - hero.x;
      const dy = hero.target.y - hero.y;
      const d = Math.hypot(dx, dy);
      if (d < 6) { hero.target = null; } else { mx = dx / d; my = dy / d; }
    }
    const ml = Math.hypot(mx, my);
    if (ml > 1) { mx /= ml; my /= ml; }
    if (mx !== 0) { hero.dir = mx > 0 ? 1 : -1; }
    hero.x = clamp(hero.x + mx * R.heroSpeed * dt, R.heroSize * 0.5, WORLD.w - R.heroSize * 0.5);
    hero.y = clamp(hero.y + my * R.heroSpeed * dt, HUD_ROOM * 0.6, WORLD.h - R.heroSize * 0.5);
    if (r.invuln > 0) { r.invuln -= dt; }
    if (r.shield > 0) { r.shield = Math.max(0, r.shield - dt); }

    // Cards: one appears on its time while the meadow has room; a card under
    // the character is caught; a card past its life fades, passed.
    const live = r.cards.filter((c) => !c.outcome).length;
    if (r.next < r.list.length && r.t >= r.next * r.every && live < r.maxCards) {
      spawnCard(r.list[r.next]);
      r.next += 1;
    }
    for (const card of r.cards) {
      if (card.gone) { continue; }
      if (!card.outcome) {
        const reach = R.heroSize * 0.3;
        if (Math.abs(card.x - hero.x) < card.w / 2 + reach && Math.abs(card.y - hero.y) < card.h / 2 + reach) {
          resolveCard(card, 'caught');
        } else if (r.t - card.born >= r.life) {
          resolveCard(card, 'passed');
        } else {
          card.node.style.setProperty('--ct-left', String(1 - (r.t - card.born) / r.life));
        }
      } else if (r.t - card.doneAt > 0.4) {
        card.node.remove();
        card.gone = true;
      }
    }

    // Enemies: collector's chase, separation, knockback and contact.
    r.spawnTimer -= dt;
    if (r.spawnTimer <= 0) { spawnEnemy(); r.spawnTimer = R.enemySpawnEvery; }
    const speed = R.enemySpeed + R.enemySpeedGrowth * r.t;
    const sepR = R.enemySize * 1.5;
    const k = 1 - Math.exp(-dt * 4);
    for (const e of r.enemies) {
      e.wob += dt;
      if (e.hurt > 0) { e.hurt -= dt; }
      const dx = hero.x - e.x;
      const dy = hero.y - e.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      let sx = 0;
      let sy = 0;
      for (const o of r.enemies) {
        if (o === e) { continue; }
        const sdx = e.x - o.x;
        const sdy = e.y - o.y;
        const sd = Math.max(1, Math.hypot(sdx, sdy));
        if (sd < sepR) { const push = (sepR - sd) * 90; sx += (sdx / sd) * push; sy += (sdy / sd) * push; }
      }
      if (e.hurt > 0) {
        e.vx *= Math.exp(-dt * 7);
        e.vy *= Math.exp(-dt * 7);
      } else {
        e.vx += (((dx / d) * speed + sx) - e.vx) * k;
        e.vy += (((dy / d) * speed + sy) - e.vy) * k;
      }
      e.x = clamp(e.x + e.vx * dt, -R.enemySize, WORLD.w + R.enemySize);
      e.y = clamp(e.y + e.vy * dt, -R.enemySize, WORLD.h + R.enemySize);
      if (dist(e.x, e.y, hero.x, hero.y) < (R.enemySize + R.heroSize) * 0.44) {
        if (r.shield > 0) { bounceEnemy(e); } else if (r.invuln <= 0) { hurtHero(); }
      }
    }

    hud();
    const over = r.hearts <= 0 || (r.next >= r.list.length && r.cards.every((c) => c.gone));
    if (over) { r.endAt = performance.now(); r.won = r.hearts > 0; }
  }

  /* 9. RENDER (collector's section 9, onto the field's canvas). */
  let canvas = null;
  let ctx = null;
  let dpr = 1;
  let fitScale = 1;
  let ox = 0;
  let oy = 0;

  function resize() {
    if (!canvas) { return; }
    const cssW = canvas.clientWidth || WORLD.w;
    const cssH = canvas.clientHeight || WORLD.h;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    fitScale = Math.min(cssW / WORLD.w, cssH / WORLD.h);
    ox = (cssW - WORLD.w * fitScale) / 2;
    oy = (cssH - WORLD.h * fitScale) / 2;
    const layer = root.querySelector('[data-world]');
    if (layer) { layer.style.transform = `translate(${ox}px, ${oy}px) scale(${fitScale})`; }
  }

  function draw() {
    if (!ctx || !round) { return; }
    const r = round;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const shake = r.shake > 0 && !matchMedia('(prefers-reduced-motion: reduce)').matches ? r.shake * 12 * dpr : 0;
    const shX = shake ? (r.rand() * 2 - 1) * shake : 0;
    const shY = shake ? (r.rand() * 2 - 1) * shake : 0;
    ctx.setTransform(dpr * fitScale, 0, 0, dpr * fitScale, dpr * ox + shX, dpr * oy + shY);
    drawBackground();
    drawHero();
    for (const e of r.enemies) { drawEnemy(e); }
    drawParticles();
    drawFloaters();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawJoystick();
    // The cards move with the shake, as collector's pickups did.
    const layer = root.querySelector('[data-world]');
    if (layer) { layer.style.translate = shake ? `${shX / dpr}px ${shY / dpr}px` : '0 0'; }
  }

  function drawBackground() {
    if (images.background) {
      if (!bgPattern) {
        const tile = document.createElement('canvas');
        tile.width = images.background.naturalWidth || 512;
        tile.height = images.background.naturalHeight || 512;
        tile.getContext('2d').drawImage(images.background, 0, 0, tile.width, tile.height);
        bgPattern = ctx.createPattern(tile, 'repeat');
      }
      ctx.fillStyle = bgPattern;
      ctx.fillRect(0, 0, WORLD.w, WORLD.h);
    } else {
      // Collector's fallback meadow, only when the picture failed.
      ctx.fillStyle = '#7fbf5a';
      ctx.fillRect(0, 0, WORLD.w, WORLD.h);
      ctx.fillStyle = '#76b352';
      ctx.beginPath();
      ctx.arc(WORLD.w * 0.3, WORLD.h * 0.3, 140, 0, TAU);
      ctx.arc(WORLD.w * 0.7, WORLD.h * 0.7, 170, 0, TAU);
      ctx.fill();
    }
  }

  function drawSprite(key, x, y, size, flip, alpha) {
    ctx.save();
    if (alpha) { ctx.globalAlpha = alpha; }
    ctx.fillStyle = 'rgba(16,42,20,0.28)';
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.34, size * 0.34, size * 0.10, 0, 0, TAU);
    ctx.fill();
    ctx.translate(x, y);
    if (flip) { ctx.scale(-1, 1); }
    const img = images[key];
    if (img) {
      const ar = (img.naturalWidth || size) / (img.naturalHeight || size);
      const dw = ar >= 1 ? size : size * ar;
      const dh = ar >= 1 ? size / ar : size;
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    } else {
      // Collector's fallback shape, only when the picture failed.
      ctx.fillStyle = { hero: '#e85d3d', enemy: '#8a74d6' }[key] || '#cccccc';
      ctx.strokeStyle = '#2b1b12';
      ctx.lineWidth = Math.max(3, size * 0.05);
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.42, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHero() {
    const r = round;
    const blink = r.invuln > 0 && Math.floor(r.invuln * 10) % 2 === 0;
    drawSprite('hero', r.hero.x, r.hero.y, R.heroSize, r.hero.dir === -1, blink ? 0.4 : 1);
    if (r.shield > 0) {
      ctx.save();
      ctx.strokeStyle = C.shield;
      ctx.lineWidth = 5;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.arc(r.hero.x, r.hero.y, R.heroSize * 0.72, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawEnemy(e) {
    const squish = 1 + Math.sin(e.wob * 5) * 0.04;
    drawSprite('enemy', e.x, e.y, R.enemySize * squish, false, 1);
  }

  function drawParticles() {
    for (const p of round.particles) {
      ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawFloaters() {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'rtl';
    ctx.font = `bold 28px ${C.font}`;
    ctx.lineWidth = 5;
    ctx.strokeStyle = C.surface;
    for (const f of round.floaters) {
      ctx.globalAlpha = Math.max(0, 1 - f.age / f.life);
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawJoystick() {
    const j = round.joystick;
    if (!j || !j.dragging) { return; }
    const rad = 46;
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = C.surface;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(j.ox, j.oy, rad, 0, TAU);
    ctx.stroke();
    let { dx, dy } = j;
    const d = Math.hypot(dx, dy);
    if (d > rad) { dx = (dx / d) * rad; dy = (dy / d) * rad; }
    ctx.fillStyle = C.surface;
    ctx.beginPath();
    ctx.arc(j.ox + dx, j.oy + dy, 20, 0, TAU);
    ctx.fill();
    ctx.restore();
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

  // ---- what the learner reads and hears ---------------------------------

  function toast(item) {
    const box = root.querySelector('[data-toast]');
    if (!box) { return; }
    box.replaceChildren(el('strong', { text: `${item.label}: ` }), item.rule);
    box.hidden = false;
    clearTimeout(box.timer);
    box.timer = setTimeout(() => { box.hidden = true; }, 3000);
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
          class: 'ct-heart', 'data-full': i < full ? 'true' : 'false', 'aria-hidden': 'true', text: '♥',
        })));
    }
    root.querySelector('[data-score]').textContent = `النقاط: ${round.score}`;
    // Less a microsecond: (3 - 1.5) / 9 * 9 + 1.5 can be 3.0000000000000004.
    const remaining = Math.max(0, Math.ceil(round.length - round.t - 1e-6));
    root.querySelector('[data-time]').textContent = `الوقت: ${remaining} ث`;
    const shield = root.querySelector('[data-shield]');
    shield.hidden = !(round.shield > 0);
    shield.textContent = `الدرع: ${Math.ceil(round.shield)} ث`;
  }

  // ---- the debrief, and the end -----------------------------------------

  function toDebrief() {
    cancelAnimationFrame(raf);
    round = null;
    // Every card the learner never met is a decision never made: `none`,
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
      const act = outcomes[item.id];
      const met = act === 'caught' || act === 'passed';
      return {
        id: item.id, situation: `${item.label} · ${KIND_WORDS[item.kind]}`,
        chosen: met ? ACT_WORDS[act] : null, rule: item.rule, source: item.source,
        result: met ? resultOf(item, act) : 'none',
      };
    });
  }

  // ---- the views ----------------------------------------------------------

  function header(title, line) {
    return el('header', { class: 'ct-head' },
      line ? el('p', { class: 'ct-line', text: line }) : null,
      el('h2', { class: 'ct-title', tabindex: '-1', 'data-focus': true, text: title }));
  }

  function soundButton() {
    return el('button', {
      type: 'button', class: 'btn-ghost ct-sound', 'data-act': 'sound',
      'aria-pressed': state.muted ? 'false' : 'true', text: state.muted ? 'الصوت: مغلق' : 'الصوت: يعمل',
    });
  }

  /** The cast beside the start and end screens, described: the character is
   *  who the learner moves, the blob what chases, the card what appears. */
  function scene() {
    return el('div', { class: 'ct-scene' },
      el('div', { class: 'ct-scene-row' },
        el('img', { class: 'ct-scene-item', src: picture.item, alt: 'البطاقة التي تظهر' }),
        el('img', { class: 'ct-scene-enemy', src: picture.enemy, alt: 'المطارد الذي يلحق بك' })),
      el('img', { class: 'ct-scene-hero', src: picture.hero, alt: 'الشخصية التي تحرّكها' }));
  }

  function introView() {
    const remaining = left().length;
    const resuming = remaining > 0 && remaining < items.length;
    return el('div', { class: 'ct-intro' },
      el('div', { class: 'ct-intro-text' },
        header(content.title, resuming ? `تابع: بقيت ${remaining} من ${items.length} بطاقات` : `${items.length} بطاقات`),
        el('p', { text: 'تظهر بطاقات على الأرض، وتبقى قليلًا ثم تختفي. امشِ إلى البطاقة الآمنة لتمسكها، واترك الخطِرة حتى تختفي.' }),
        el('p', { text: `وابتعد عمّن يطاردك. لديك ${R.hearts} قلوب: تخسر قلبًا إن أمسكت بطاقة خطِرة أو لحق بك مطارد. كل ${R.shield.every} اختيارات صحيحة تمنحك درعًا.` }),
        el('p', { class: 'ct-how', text: 'انقر بطاقة أو مكانًا لتمشي إليه، أو اسحب على الأرض، أو استعمل الأسهم.' }),
        el('div', { class: 'ct-actions' },
          el('button', {
            type: 'button', class: 'btn-primary', 'data-act': 'start', 'data-focus': true,
            text: resuming ? 'تابع' : 'ابدأ',
          }),
          soundButton())),
      scene());
  }

  function playView() {
    return el('div', { class: 'ct-play', 'data-play': true },
      el('canvas', { class: 'ct-canvas', 'data-canvas': true, 'aria-hidden': 'true' }),
      el('div', { class: 'ct-world', 'data-world': true },
        el('div', { class: 'ct-cards', 'data-cards': true, role: 'group', 'aria-label': 'البطاقات' })),
      el('div', { class: 'ct-hud' },
        el('p', { class: 'ct-hearts', 'data-hearts': true }),
        el('p', { class: 'ct-score', 'data-score': true }),
        el('p', { class: 'ct-time', 'data-time': true }),
        el('p', { class: 'ct-shield', 'data-shield': true, hidden: true }),
        el('div', { class: 'ct-hud-acts' },
          soundButton(),
          el('button', { type: 'button', class: 'btn-secondary', 'data-act': 'pause', text: 'إيقاف مؤقت' }))),
      el('p', { class: 'ct-toast', 'data-toast': true, role: 'status', hidden: true }),
      el('div', { class: 'ct-paused', 'data-paused': true, hidden: true },
        el('p', { class: 'ct-title', text: 'اللعبة متوقّفة' }),
        el('button', { type: 'button', class: 'btn-primary', 'data-act': 'resume', text: 'تابع اللعب' })),
      el('p', { class: 'sr-only', 'aria-live': 'polite', 'data-say': true }));
  }

  function endView() {
    const won = state.screen === 'won';
    const played = round ? round.list.length : items.length;
    const score = round ? round.score : 0;
    const practice = round && round.practice;
    return el('div', { class: 'ct-end', 'data-end': state.screen },
      el('div', { class: 'ct-end-text' },
        header(won ? 'انتهت الجولة!' : 'نفدت قلوبك', content.title),
        el('p', { class: 'ct-big', text: `أصبت ${score} من ${played}` }),
        practice ? el('p', { text: 'جولة تدريب: نتيجتك الأولى هي التي حُسبت.' }) : null,
        el('div', { class: 'ct-actions' },
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

  function debriefView() {
    const done = state.screen === 'done';
    return el('div', { class: 'ct-debrief' },
      header('خلاصة الجولة', content.title),
      debrief(rowsFor(state.preview || state.outcomes)),
      done
        ? el('p', { class: 'ct-done', role: 'status', text: 'انتهيت. يمكنك المتابعة إلى الشريحة التالية.' })
        : el('button', { type: 'button', class: 'btn-primary', 'data-act': 'finish', text: 'إنهاء' }));
  }

  /** Every card, what it is, what to do with it, the rule and its source,
   *  for a reviewer: moment=feedback-sheet. */
  function sheetView() {
    return el('div', { class: 'ct-sheet', 'data-sheet': true },
      el('header', { class: 'ct-sheet-head', 'data-sheet-head': true },
        el('h2', { class: 'ct-title', text: `ورقة المراجعة: ${content.title}` }),
        el('p', { class: 'ct-line', 'data-sheet-count': true })),
      el('div', { class: 'ct-sheet-items' }, items.map((item) => el('section', {
        class: 'ct-sheet-item', 'data-sheet-point': item.id, 'data-kind': item.kind,
      },
      el('h3', { text: item.label }),
      el('p', { class: 'ct-sheet-kind' }, el('strong', { text: `${KIND_WORDS[item.kind]}. ` }),
        `الصحيح: ${ACT_WORDS[RIGHT_ACT[item.kind]]}.`),
      el('p', {}, el('strong', { text: 'القاعدة: ' }), item.rule),
      item.source ? el('p', { class: 'ct-source', text: `المصدر: ${item.source}` }) : null))));
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
    root.setAttribute('data-screen', state.screen);
    root.replaceChildren(VIEWS[state.screen]());
    canvas = null;
    ctx = null;
    if (state.screen === 'sheet') { pageTheSheet(); }
    if (state.screen === 'play') {
      canvas = root.querySelector('[data-canvas]');
      ctx = canvas.getContext('2d');
      bindField();
      resize();
      hud();
      draw();
    }
    if (hadFocus) {
      const target = [...root.querySelectorAll('[data-focus]')].pop();
      if (target) { target.focus(); }
    }
  }

  // ---- 6. INPUT: collector's keys and joystick, a tap or a card to walk ---

  /** Collector's press-and-drag joystick on the field, and a short tap on
   *  empty ground walks there (the way to move without dragging). */
  function bindField() {
    const toWorld = (event) => {
      const box = canvas.getBoundingClientRect();
      return { x: (event.clientX - box.left - ox) / fitScale, y: (event.clientY - box.top - oy) / fitScale };
    };
    canvas.addEventListener('pointerdown', (event) => {
      if (!round || state.paused) { return; }
      if (canvas.setPointerCapture) { canvas.setPointerCapture(event.pointerId); }
      const box = canvas.getBoundingClientRect();
      round.joystick = {
        id: event.pointerId, ox: event.clientX - box.left, oy: event.clientY - box.top, dx: 0, dy: 0,
        dragging: false, start: toWorld(event),
      };
    });
    canvas.addEventListener('pointermove', (event) => {
      const j = round && round.joystick;
      if (!j || event.pointerId !== j.id) { return; }
      const box = canvas.getBoundingClientRect();
      j.dx = event.clientX - box.left - j.ox;
      j.dy = event.clientY - box.top - j.oy;
      if (Math.hypot(j.dx, j.dy) > 10) { j.dragging = true; }
    });
    const release = (event) => {
      const j = round && round.joystick;
      if (!j || event.pointerId !== j.id) { return; }
      if (!j.dragging && event.type === 'pointerup') { round.hero.target = j.start; }
      round.joystick = null;
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
  }

  function setPaused(paused) {
    if (!round || state.screen !== 'play') { return; }
    state.paused = paused;
    round.keys = Object.create(null);
    round.joystick = null;
    root.querySelector('[data-paused]').hidden = !paused;
    if (paused) { root.querySelector('[data-act=resume]').focus(); }
    round.last = 0;
  }

  root.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button') : null;
    if (!target || target.disabled || !root.contains(target)) { return; }
    if (target.dataset.card !== undefined) {
      // A card walks the character to it: catching is still walking there.
      const card = round && round.cards.find((c) => c.item.id === target.dataset.card && !c.outcome);
      if (card && !state.paused) { round.hero.target = { x: card.x, y: card.y }; }
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
      sfx.blip();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (state.screen !== 'play' || !round) { return; }
    const lower = (event.key || '').toLowerCase();
    if (MOVE_KEYS.includes(lower)) {
      if (lower.startsWith('arrow')) { event.preventDefault(); }
      if (!state.paused) { round.keys[lower] = true; }
    }
    if (lower === 'm') { const sound = root.querySelector('[data-act=sound]'); if (sound) { sound.click(); } }
    if ((lower === 'p' || lower === 'escape') && !state.paused) { event.preventDefault(); setPaused(true); }
  });
  document.addEventListener('keyup', (event) => {
    const lower = (event.key || '').toLowerCase();
    if (round && MOVE_KEYS.includes(lower)) { round.keys[lower] = false; }
  });
  window.addEventListener('resize', resize);
  window.addEventListener('blur', () => { if (round) { round.keys = Object.create(null); round.joystick = null; } });
  // Off screen (the deck moved on, or the tab is hidden) the round waits.
  if (window.deckNav && typeof window.deckNav.onScreen === 'function') {
    window.deckNav.onScreen((on) => { offScreen = !on; if (round) { round.last = 0; } });
  }
  document.addEventListener('visibilitychange', () => { if (round) { round.last = 0; round.joystick = null; } });

  // ---- the platform's hooks, and a returning learner ----------------------

  registerTest({
    decisions: () => items.map((item) => ({ id: item.id, choices: ['caught', 'passed'] })),
    play: async (path) => {
      // Through the game's own record(), never its physics: every card the
      // learner has not met is resolved as `path` says, in order; then the
      // debrief, which reports `none` for what `skip` left, and the end.
      cancelAnimationFrame(raf);
      round = null;
      state.preview = null;
      for (const item of left()) {
        if (path === 'skip') { break; }
        record(item, path === 'right' ? RIGHT_ACT[item.kind] : WRONG_ACT[item.kind], 0);
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
        state.preview = Object.fromEntries(items.map((item) => [item.id,
          state.outcomes[item.id] || WRONG_ACT[item.kind]]));
        show('debrief');
        return;
      }
      // after-wrong: the meadow frozen the instant a hazard was caught -- a
      // heart gone, the rule up, a chaser closing in. Drawn once, no loop.
      const hazard = items.find((item) => item.kind === 'hazard') || items[0];
      const other = items.find((item) => item !== hazard) || hazard;
      round = newRound(items, true);
      round.t = 4;
      round.hearts = R.hearts - 1;
      state.paused = false;
      show('play');
      const caught = spawnCard(hazard);
      round.hero.x = caught.x;
      round.hero.y = Math.min(WORLD.h - R.heroSize * 0.5, caught.y + caught.h / 2 + R.heroSize * 0.3);
      caught.node.dataset.result = 'wrong';
      spawnCard(other);
      round.enemies.push({ x: round.hero.x + (round.hero.x > WORLD.w / 2 ? -220 : 220), y: round.hero.y - 40, vx: 0, vy: 0, wob: 0, hurt: 0 });
      addParticles(caught.x, caught.y, C.bad, 12);
      round.particles.forEach((p) => { p.age = 0.08; p.x += p.vx * 0.08; p.y += p.vy * 0.08; });
      toast(hazard);
      hud();
      draw();
    },
  });

  onRestore(({ done, progress }) => {
    // Only a card the host says was reported, with an outcome the game knows.
    const raw = progress.outcomes && typeof progress.outcomes === 'object' ? progress.outcomes : {};
    state.outcomes = {};
    for (const item of items) {
      const act = raw[item.id];
      if (done.includes(item.id) && ['caught', 'passed', 'none'].includes(act)) { state.outcomes[item.id] = act; }
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
