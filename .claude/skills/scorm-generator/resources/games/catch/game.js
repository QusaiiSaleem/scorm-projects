/*
 * games/catch/game.js -- the catch game (2026-11-07, learning-games spec §5,
 * game 2; Scitter plan Task 20 and Revision 3).
 *
 * ADAPTED FROM dsh-game-studio's `collector` template (template/collector/
 * game.js and its artwork), MIT, Copyright (c) 2026 ZSeven—W. The licence
 * text is in this folder's README.md and travels with the code.
 *
 * What it keeps of collector: a character the learner moves, things that
 * arrive, hearts, a timer, a score, and the feel -- a burst on a catch, a
 * shake and a flash on a hit, a floating «+1», start, win and lose screens.
 * What learning changed: collector's enemies chase forever, so "let it pass"
 * has no moment. Here every item is a CARD that falls once, in one of three
 * lanes, and has exactly one outcome -- caught, or passed below the
 * character -- which is what makes one report per item, first outcome only,
 * and a deterministic play by the platform possible. Every card wears the
 * same picture, so the picture never gives the answer away.
 *
 * Words in the page's content block (content.schema.json; SHAPE below is the
 * same document without its words, pinned equal by Scitter's tests).
 * Outcome codes on the page's rows. It reports one `performance` row per
 * item -- response `caught` or `passed`, result `correct` when that fits the
 * item's kind, latency from when the card appeared -- and `none`/`wrong` for
 * every item the learner never met (a round lost, or left), sent when the
 * debrief opens. A replay is practice and reports nothing.
 *
 * Built from the page's own elements, not a canvas, so a lecture's deck.css
 * restyles it like every slide (only base.css variables), Arabic is shaped by
 * the browser, and every control is a native button: a tap on a lane, the
 * arrow keys, or Tab and Enter. Sound is off until the learner turns it on.
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
        item: { type: 'string' },
        background: { type: 'string' },
      },
    },
  },
};

/* 1. RULES -- every gameplay value lives here (collector's section 2). A
 *    learner's slide has no settings; render_slide may pass `duration` and
 *    `lives` (game.json declares their ranges, the platform checks them). */
const LANES = 3;
const LANE_NAMES = ['الممر الأيسر', 'الممر الأوسط', 'الممر الأيمن'];
const FALL_S = 5; // seconds a card takes from the top to below the character
const EVERY_S = 2.6; // seconds between two cards
const MIN_FALL_S = 1.2;
const HIT_MS = 900; // no second heart lost inside this
const END_PAUSE_MS = 650; // the last burst plays before the end screen
const RIGHT_ACT = { safe: 'caught', hazard: 'passed' };
const WRONG_ACT = { safe: 'passed', hazard: 'caught' };
const ACT_WORDS = { caught: 'أمسكتها', passed: 'تركتها تمرّ' };
const KIND_WORDS = { safe: 'آمنة: تُمسَك', hazard: 'خطِرة: تُترَك' };
const PICTURES = ['hero', 'item', 'background'];
/** A slot fill is a picture in the lecture's own assets, never an address. */
const SLOT_PATH = /^\.\.\/assets\/[A-Za-z0-9_.\-/]+\.(png|webp|jpe?g|gif|svg)$/;

function int(name, low, high) {
  const value = setting(name);
  return value === null ? null : Math.min(Math.max(value, low), high);
}

/** A seeded generator (mulberry32, as dsh's voxel template seeds its island),
 *  keyed by the items' ids: the lanes are the same on every play of the same
 *  content, so a render, a pixel diff and a test all see one game. */
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
  const lives = int('lives', 1, 5) || 3;
  const picture = Object.fromEntries(PICTURES.map((name) => {
    const fill = content.slots && content.slots[name];
    if (typeof fill === 'string' && SLOT_PATH.test(fill)) { return [name, fill]; }
    if (fill !== undefined) {
      console.warn(`[game] slots.${name} is not a picture under ../assets/ (${JSON.stringify(fill)}); the placeholder is shown.`);
    }
    return [name, new URL(`assets/${name}.svg`, import.meta.url).href];
  }));

  const state = {
    screen: 'intro', // intro | play | won | lost | debrief | done | sheet
    outcomes: {}, // item id -> the FIRST outcome: caught | passed | none
    preview: null, // outcomes a moment shows without anyone acting
    paused: false,
    muted: true,
  };
  let round = null; // the round being played, or null
  let raf = 0;
  let offScreen = false;
  let audio = null;

  const left = () => items.filter((item) => !(item.id in state.outcomes));
  const resultOf = (item, act) => (act === RIGHT_ACT[item.kind] ? 'correct' : 'wrong');

  function persist() {
    save({ outcomes: state.outcomes, finished: state.screen === 'done' });
  }

  /** The first outcome of an item, reported once; a replay's is practice. */
  function record(item, act, ms) {
    if (item.id in state.outcomes) { return false; }
    state.outcomes[item.id] = act;
    announce({
      id: item.id, type: 'performance', response: act, result: resultOf(item, act), latency: latencyFrom(ms),
    });
    persist();
    return true;
  }

  // ---- sound: collector's WebAudio bleeps, off until the learner asks ------

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
    good: () => tone(880, 0.09, 'sine', 0.06, 1320),
    hurt: () => tone(180, 0.22, 'sawtooth', 0.08, 70),
    miss: () => tone(320, 0.14, 'triangle', 0.05, 220),
    win: () => { tone(660, 0.1, 'sine', 0.07); setTimeout(() => tone(880, 0.16, 'sine', 0.07), 90); },
    lose: () => tone(300, 0.3, 'sawtooth', 0.07, 90),
  };

  // ---- a round: the schedule, the loop, the outcome of each card ----------

  /** Which cards fall, when, in which lane, and how long a round lasts:
   *  `duration` (a test setting) squeezes the same schedule into its seconds. */
  function plan(list) {
    const n = list.length;
    const asked = int('duration', 3, 120);
    let fall = FALL_S;
    let every = EVERY_S;
    if (asked !== null) {
      fall = Math.min(FALL_S, Math.max(MIN_FALL_S, asked * 0.45));
      every = n > 1 ? Math.max(0, (asked - fall) / (n - 1)) : 0;
    }
    const rand = seeded(list.map((item) => item.id).join(','));
    let previous = -1;
    const cards = list.map((item, k) => {
      const open = [0, 1, 2].filter((lane) => lane !== previous);
      const lane = previous < 0 ? Math.floor(rand() * LANES) : open[Math.floor(rand() * open.length)];
      previous = lane;
      return { item, lane, at: k * every, el: null, outcome: null, gone: false };
    });
    return { cards, fall, length: (n - 1) * every + fall };
  }

  function startRound() {
    const list = left().length ? left() : items; // a replay plays every card again
    const { cards, fall, length } = plan(list);
    round = {
      cards, fall, length, practice: left().length === 0, t: 0, last: 0,
      hearts: lives, score: 0, streak: 0, hitAt: -Infinity, endAt: null, won: null,
      heroLane: 1, heroX: null,
    };
    state.paused = false;
    show('play');
    raf = requestAnimationFrame(frame);
  }

  function field() { return root.querySelector('[data-field]'); }
  function heroEl() { return root.querySelector('[data-hero]'); }

  function laneX(lane, width) { return ((lane + 0.5) / LANES) * width; }

  function placeHero() {
    const hero = heroEl();
    if (hero && round && round.heroX !== null) { hero.style.transform = `translateX(${round.heroX - hero.offsetWidth / 2}px)`; }
  }

  function moveTo(lane) {
    if (!round || state.screen !== 'play' || state.paused) { return; }
    round.heroLane = Math.min(LANES - 1, Math.max(0, lane));
    const hero = heroEl();
    if (hero) { hero.dataset.lane = String(round.heroLane); }
    say(`أنت في ${LANE_NAMES[round.heroLane]}.`);
  }

  function spawn(card) {
    card.el = el('div', { class: 'ct-card', 'data-card': card.item.id, 'data-lane': String(card.lane) },
      el('img', { class: 'ct-card-art', src: picture.item, alt: '' }),
      el('span', { class: 'ct-card-label', text: card.item.label }));
    root.querySelector('[data-cards]').append(card.el);
    say(`بطاقة في ${LANE_NAMES[card.lane]}: ${card.item.label}`);
  }

  function frame(now) {
    if (!round || state.screen !== 'play') { return; }
    const dt = round.last ? Math.min(0.05, (now - round.last) / 1000) : 0;
    round.last = now;
    if (!state.paused && !offScreen) { advance(dt); }
    if (round && state.screen === 'play') { raf = requestAnimationFrame(frame); }
  }

  function advance(dt) {
    const box = field();
    if (!box) { return; }
    round.t += dt;
    const width = box.clientWidth;
    const height = box.clientHeight;
    const hero = heroEl();
    const heroHeight = hero ? hero.offsetHeight : 140;
    // The character glides to its lane (collector's eased movement).
    const target = laneX(round.heroLane, width);
    round.heroX = round.heroX === null ? target : round.heroX + (target - round.heroX) * (1 - Math.exp(-dt * 16));
    placeHero();
    const catchLine = height - heroHeight * 0.8;
    const underHero = Math.min(LANES - 1, Math.max(0, Math.round((round.heroX / width) * LANES - 0.5)));
    for (const card of round.cards) {
      if (card.gone || round.t < card.at) { continue; }
      if (!card.el) { spawn(card); }
      const cardHeight = card.el.offsetHeight || 120;
      const y = ((round.t - card.at) / round.fall) * (height + cardHeight) - cardHeight;
      card.el.style.transform = `translate(${laneX(card.lane, width) - card.el.offsetWidth / 2}px, ${y}px)`;
      if (!card.outcome && round.endAt === null && y + cardHeight >= catchLine) {
        outcome(card, underHero === card.lane ? 'caught' : 'passed', box, width, catchLine);
      }
      if (card.outcome && (card.outcome === 'caught' ? round.t - card.doneAt > 0.35 : y > height)) {
        card.el.remove();
        card.gone = true;
      }
    }
    hud();
    const over = round.cards.every((card) => card.gone) || round.hearts <= 0;
    if (over && round.endAt === null) { round.endAt = performance.now(); round.won = round.hearts > 0; }
    if (round.endAt !== null && performance.now() - round.endAt > END_PAUSE_MS) { endRound(); }
  }

  /** One card's one outcome: reported (unless a replay, or already), and
   *  felt -- a burst, a «+1», a shake and a heart, the rule after a mistake. */
  function outcome(card, act, box, width, catchLine) {
    const { item } = card;
    card.outcome = act;
    card.doneAt = round.t;
    card.el.dataset.outcome = act;
    const right = act === RIGHT_ACT[item.kind];
    card.el.dataset.result = right ? 'correct' : 'wrong';
    record(item, act, (round.t - card.at) * 1000);
    const x = laneX(card.lane, width);
    if (right) {
      round.score += 1;
      round.streak += 1;
      floater(x, catchLine - 30, round.streak >= 3 ? `+1 · سلسلة ${round.streak}` : '+1', 'good');
      if (act === 'caught') { burst(x, catchLine, 'good'); }
      sfx.good();
      say(`${ACT_WORDS[act]}: ${item.label}. أحسنت.`);
      return;
    }
    round.streak = 0;
    if (act === 'caught') {
      // A hazard caught: collector's hit -- a heart, a shake, a flash.
      if (round.t * 1000 - round.hitAt > HIT_MS) { round.hearts -= 1; round.hitAt = round.t * 1000; }
      burst(x, catchLine, 'bad');
      box.classList.remove('is-hit');
      void box.offsetWidth; // restart the shake
      box.classList.add('is-hit');
      sfx.hurt();
    } else {
      floater(x, box.clientHeight - 40, 'فاتتك', 'bad');
      sfx.miss();
    }
    toast(item);
    say(`${ACT_WORDS[act]}: ${item.label}. ${item.rule}`);
  }

  function endRound() {
    cancelAnimationFrame(raf);
    const won = round.won;
    state.screen = won ? 'won' : 'lost';
    if (won) { sfx.win(); } else { sfx.lose(); }
    render();
  }

  // ---- juice (collector's particles and floaters, as elements) ------------

  function burst(x, y, tone_) {
    const fx = root.querySelector('[data-fx]');
    if (!fx) { return; }
    const sparks = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 12;
    for (let i = 0; i < sparks; i += 1) {
      const angle = (i / sparks) * Math.PI * 2;
      const reach = 50 + (i % 3) * 22;
      const spark = el('span', { class: 'ct-spark', 'data-tone': tone_ });
      spark.style.setProperty('--ct-x', `${x}px`);
      spark.style.setProperty('--ct-y', `${y}px`);
      spark.style.setProperty('--ct-dx', `${Math.cos(angle) * reach}px`);
      spark.style.setProperty('--ct-dy', `${Math.sin(angle) * reach}px`);
      fx.append(spark);
      setTimeout(() => spark.remove(), 700);
    }
  }

  function floater(x, y, text, tone_) {
    const fx = root.querySelector('[data-fx]');
    if (!fx) { return; }
    const float = el('span', { class: 'ct-float', 'data-tone': tone_, text });
    float.style.left = `${x}px`;
    float.style.top = `${y}px`;
    fx.append(float);
    setTimeout(() => float.remove(), 900);
  }

  function toast(item) {
    const box = root.querySelector('[data-toast]');
    if (!box) { return; }
    box.replaceChildren(el('strong', { text: `${item.label}: ` }), item.rule);
    box.hidden = false;
    clearTimeout(box.timer);
    box.timer = setTimeout(() => { box.hidden = true; }, 2800);
  }

  function say(text) {
    const live = root.querySelector('[data-say]');
    if (live) { live.textContent = text; }
  }

  function hud() {
    const hearts = root.querySelector('[data-hearts]');
    if (!hearts || !round) { return; }
    const full = Math.max(0, round.hearts);
    if (hearts.dataset.count !== String(full)) {
      hearts.dataset.count = String(full);
      hearts.replaceChildren(
        el('span', { class: 'sr-only', text: `القلوب: ${full} من ${lives}` }),
        ...Array.from({ length: lives }, (_, i) => el('span', {
          class: 'ct-heart', 'data-full': i < full ? 'true' : 'false', 'aria-hidden': 'true', text: '♥',
        })));
    }
    root.querySelector('[data-score]').textContent = `النقاط: ${round.score}`;
    // Less a microsecond: (3 - 1.35) / 9 * 9 + 1.35 is 3.0000000000000004.
    const remaining = Math.max(0, Math.ceil(round.length - round.t - 1e-6));
    root.querySelector('[data-time]').textContent = `الوقت: ${remaining} ث`;
  }

  // ---- the debrief, and the end -------------------------------------------

  function toDebrief() {
    cancelAnimationFrame(raf);
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

  /** The cast beside the start and end screens. Described, not decorative:
   *  the character is who the learner moves, the picture what falls. */
  function scene() {
    return el('div', { class: 'ct-scene' },
      el('img', { class: 'ct-scene-item', src: picture.item, alt: 'البطاقة التي تسقط' }),
      el('img', { class: 'ct-scene-hero', src: picture.hero, alt: 'الشخصية التي تحرّكها' }));
  }

  function introView() {
    const remaining = left().length;
    const resuming = remaining > 0 && remaining < items.length;
    return el('div', { class: 'ct-intro' },
      el('div', { class: 'ct-intro-text' },
        header(content.title, resuming ? `تابع: بقيت ${remaining} من ${items.length} بطاقات` : `${items.length} بطاقات`),
        el('p', { text: 'تسقط بطاقات في ثلاثة ممرات. أمسك الآمنة بأن تقف تحتها، واترك الخطِرة تمرّ.' }),
        el('p', { text: `انقر الممر الذي تريده، أو استعمل السهمين. لديك ${lives} قلوب، وكل بطاقة خطِرة تمسكها تأخذ قلبًا.` }),
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
      el('div', { class: 'ct-hud' },
        el('p', { class: 'ct-hearts', 'data-hearts': true }),
        el('p', { class: 'ct-score', 'data-score': true }),
        el('p', { class: 'ct-time', 'data-time': true }),
        el('div', { class: 'ct-hud-acts' },
          soundButton(),
          el('button', { type: 'button', class: 'btn-secondary', 'data-act': 'pause', text: 'إيقاف مؤقت' }))),
      el('div', { class: 'ct-field', 'data-field': true },
        el('div', { class: 'ct-lanes', role: 'group', 'aria-label': 'الممرات' },
          [0, 1, 2].map((lane) => el('button', {
            type: 'button', class: 'ct-lane', 'data-lane-go': String(lane),
            'aria-label': `انتقل إلى ${LANE_NAMES[lane]}`,
          }))),
        el('div', { class: 'ct-cards', 'data-cards': true }),
        el('div', { class: 'ct-hero', 'data-hero': true, 'data-lane': String(round ? round.heroLane : 1) },
          el('img', { src: picture.hero, alt: 'الشخصية التي تحرّكها' })),
        el('div', { class: 'ct-fx', 'data-fx': true, 'aria-hidden': 'true' }),
        el('p', { class: 'ct-toast', 'data-toast': true, role: 'status', hidden: true }),
        state.paused
          ? el('div', { class: 'ct-paused', 'data-paused': true },
            el('p', { class: 'ct-title', text: 'اللعبة متوقّفة' }),
            el('button', { type: 'button', class: 'btn-primary', 'data-act': 'resume', 'data-focus': true, text: 'تابع اللعب' }))
          : null),
      el('p', { class: 'sr-only', 'aria-live': 'polite', 'data-say': true }));
  }

  function endView() {
    const won = state.screen === 'won';
    const played = round ? round.cards.length : items.length;
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

  /** Every card, what it is, what to do with it, the rule and its source, for
   *  a reviewer: moment=feedback-sheet. pageTheSheet keeps one page. */
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

  /** One 1280x720 picture holds about seven items, so: whole items, in
   *  order, as many as the stage holds under the head, measured (the decision
   *  game's paging); `sheet=` picks the page, and the head names the next. */
  function pageTheSheet() {
    const sheet = root.querySelector('[data-sheet]');
    const parts = [...sheet.querySelectorAll('[data-sheet-point]')];
    const end = root.getBoundingClientRect().top + root.clientHeight
      - parseFloat(getComputedStyle(root).paddingBlockEnd);
    const room = end - parts[0].getBoundingClientRect().top;
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
      const box = field();
      if (box) { box.style.backgroundImage = `url("${picture.background}")`; }
      if (round) { for (const card of round.cards) { if (card.el && !card.gone) { root.querySelector('[data-cards]').append(card.el); } } }
      placeHero();
      hud();
    }
    if (hadFocus) {
      const target = [...root.querySelectorAll('[data-focus]')].pop();
      if (target) { target.focus(); }
    }
  }

  // ---- what a press does --------------------------------------------------

  function setPaused(paused) {
    if (!round || state.screen !== 'play') { return; }
    state.paused = paused;
    render();
    if (!paused) { round.last = 0; }
  }

  root.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button') : null;
    if (!target || target.disabled || !root.contains(target)) { return; }
    if (target.dataset.laneGo !== undefined) { moveTo(Number(target.dataset.laneGo)); return; }
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
      sfx.good();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (state.screen !== 'play' || !round) { return; }
    const key = event.key;
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') { event.preventDefault(); moveTo(round.heroLane - 1); }
    if (key === 'ArrowRight' || key === 'd' || key === 'D') { event.preventDefault(); moveTo(round.heroLane + 1); }
    if ((key === 'p' || key === 'P' || key === 'Escape') && !state.paused) { event.preventDefault(); setPaused(true); }
  });

  // Off screen (the deck moved on, or the tab is hidden) the round waits.
  if (window.deckNav && typeof window.deckNav.onScreen === 'function') {
    window.deckNav.onScreen((on) => { offScreen = !on; if (round) { round.last = 0; } });
  }
  document.addEventListener('visibilitychange', () => { if (round) { round.last = 0; } });

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
      // after-wrong: the round frozen the moment a hazard was caught.
      const { cards, fall, length } = plan(items);
      const hazard = cards.find((card) => card.item.kind === 'hazard') || cards[0];
      round = {
        cards: [], fall, length, practice: true, t: hazard.at + fall * 0.8, last: 0,
        hearts: lives - 1, score: 0, streak: 0, hitAt: 0, endAt: null, won: null, heroLane: hazard.lane, heroX: null,
      };
      state.paused = false;
      show('play');
      const box = field();
      const width = box.clientWidth;
      const hero = heroEl();
      const catchLine = box.clientHeight - hero.offsetHeight * 0.8;
      round.heroX = laneX(hazard.lane, width);
      placeHero();
      spawn(hazard);
      // The card is held where it was caught, outlined as a mistake: its
      // catch animation (data-outcome) would fade it before the picture.
      hazard.el.dataset.result = 'wrong';
      hazard.el.style.transform = `translate(${round.heroX - hazard.el.offsetWidth / 2}px, ${catchLine - hazard.el.offsetHeight}px)`;
      const following = cards.find((card) => card !== hazard && card.lane !== hazard.lane);
      if (following) {
        spawn(following);
        following.el.style.transform = `translate(${laneX(following.lane, width) - following.el.offsetWidth / 2}px, ${box.clientHeight * 0.18}px)`;
      }
      box.classList.add('is-hit');
      toast(hazard.item);
      hud();
    },
  });

  onRestore(({ done, progress }) => {
    // Only an item the host says was reported, with an outcome the game knows.
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
