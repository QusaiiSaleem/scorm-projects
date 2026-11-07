/*
 * games/branching/game.js: components/branching-scenario.html's story graph
 * made a game (learning-games spec §5 game 5). README.md gives each rule's
 * reason; the few comments below mark what a reader would otherwise undo.
 * Our own code, no licence.
 */
import {
  announce, debrief, el, finish, GameContentError, latencyFrom, onRestore, readContent, registerTest, save, setting,
} from '../core/game-core.js';

const ID = '^[A-Za-z0-9_-]{1,64}$';

/** content.schema.json without its words: what readContent enforces. */
export const SHAPE = {
  'x-points': 'nodes[]',
  type: 'object',
  required: ['title', 'meter', 'start', 'nodes', 'endings'],
  properties: {
    title: { type: 'string', minLength: 1 },
    meter: {
      type: 'object',
      required: ['label'],
      properties: { label: { type: 'string', minLength: 1 } },
    },
    start: { type: 'string', pattern: ID },
    nodes: {
      type: 'array',
      minItems: 2,
      items: {
        type: 'object',
        required: ['id', 'title', 'text', 'rule', 'source', 'choices'],
        properties: {
          id: { type: 'string', pattern: ID },
          title: { type: 'string', minLength: 1 },
          speaker: { type: 'string' },
          text: { type: 'string', minLength: 1 },
          leave: { type: 'string', pattern: ID },
          rule: { type: 'string', minLength: 1 },
          source: { type: 'string' },
          choices: {
            type: 'array',
            minItems: 2,
            items: {
              type: 'object',
              required: ['id', 'label', 'result', 'consequence', 'next'],
              properties: {
                id: { type: 'string', pattern: ID },
                label: { type: 'string', minLength: 1 },
                result: { type: 'string', enum: ['correct', 'wrong', 'neutral'] },
                consequence: { type: 'string', minLength: 1 },
                next: { type: 'string', pattern: ID },
              },
            },
          },
        },
      },
    },
    endings: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['id', 'title', 'text', 'tone'],
        properties: {
          id: { type: 'string', pattern: ID },
          title: { type: 'string', minLength: 1 },
          text: { type: 'string', minLength: 1 },
          tone: { type: 'string', enum: ['good', 'mixed', 'bad'] },
        },
      },
    },
    slots: {
      type: 'object',
      properties: {
        character: { type: 'string' },
        scene: { type: 'string' },
      },
    },
  },
};

/* THE RULES (README): the meter starts at 50 of 100, so two wrong acts empty it; a turn's clock gives
 * `think` seconds, or READ a word of its text and choices if more, then drains `drain` a second; a node
 * with `leave` is never entered under LOW, the meter's «منخفض». render_slide may pass clock, meter. */
const DEFAULTS = {
  meter: 50,
  think: 20,
  drain: 5,
  effect: { correct: 10, neutral: -10, wrong: -25 },
};
const METER_MAX = 100;
const LOW = 35;
const READ = 0.8;
const STEPS_CHARS = 900;
const STARS = [[75, 3], [45, 2], [1, 1]];
const LEVELS = [[70, 'high', 'مرتفع'], [LOW, 'mid', 'متوسّط'], [0, 'low', 'منخفض']];
const RESULT_WORDS = { correct: 'تصرّف صحيح', neutral: 'تصرّف متردّد', wrong: 'تصرّف غير صحيح' };
const RESULT_MARKS = { correct: '✓', neutral: '~', wrong: '✗' };
const TONE_WORDS = { good: 'نهاية موفّقة', mixed: 'نهاية ناقصة', bad: 'نهاية صعبة' };
const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ARABIC_DIGITS = ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const SLOT_PATH = /^\.\.\/assets\/[A-Za-z0-9_.\-/]+\.(png|webp|jpe?g|gif|svg)$/;
const PICTURES = ['character', 'scene'];
const STEP_RE = /^([A-Za-z0-9_-]{1,64})\.([A-Za-z0-9_-]{1,64})$/;
const SPARKS = 16;
const SVG_NS = 'http://www.w3.org/2000/svg';
const clamp = (v, a, b) => (v < a ? a : (v > b ? b : v));
/** Isolated left to right, so Arabic text never reads «10+». */
const signed = (n) => `⁦${n > 0 ? '+' : (n < 0 ? '−' : '±')}${Math.abs(n)}⁩`;

function seeded(text) {
  let s = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) { s ^= text.charCodeAt(i); s = Math.imul(s, 0x01000193) >>> 0; }
  s = s || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

function shuffled(list, rand) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function svg(tag, attrs, ...children) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs || {})) { node.setAttribute(name, String(value)); }
  children.forEach((child) => node.append(child));
  return node;
}

function storyFault(content) {
  const nodes = new Map(content.nodes.map((node) => [node.id, node]));
  const ends = new Set(content.endings.map((ending) => ending.id));
  for (const [i, ending] of content.endings.entries()) {
    if (nodes.has(ending.id)) {
      return {
        ar: `النهاية «${ending.id}» تحمل معرّف موقف، فلا يُعرف إلى أيهما يقود الاختيار.`,
        en: `endings[${i}].id "${ending.id}" is also a node's id, so a choice's next could not say which it means; give the ending an id of its own.`,
        named: `endings[${i}].id = "${ending.id}"`,
      };
    }
  }
  if (!nodes.has(content.start)) {
    return {
      ar: `البداية «${content.start}» ليست موقفًا في القصة.`,
      en: `start "${content.start}" names no node; it takes the id of one of nodes[].`,
      named: `start = "${content.start}"`,
    };
  }
  for (const [i, node] of content.nodes.entries()) {
    if (node.leave !== undefined && !ends.has(node.leave)) {
      return {
        ar: `الموقف «${node.id}» يغادر إلى «${node.leave}»، ولا نهاية بهذا المعرّف.`,
        en: `nodes[${i}].leave "${node.leave}" names no ending; point it at one of endings[].`,
        named: `nodes[${i}].leave = "${node.leave}"`,
      };
    }
    for (const [j, choice] of node.choices.entries()) {
      if (!nodes.has(choice.next) && !ends.has(choice.next)) {
        return {
          ar: `الاختيار ${node.id}.${choice.id} يقود إلى «${choice.next}»، ولا موقف ولا نهاية بهذا المعرّف.`,
          en: `nodes[${i}].choices[${j}].next "${choice.next}" names no node and no ending; point it at one of them.`,
          named: `nodes[${i}].choices[${j}].next = "${choice.next}"`,
        };
      }
    }
  }
  const reached = new Set();
  const todo = [content.start];
  while (todo.length) {
    const id = todo.pop();
    if (reached.has(id) || !nodes.has(id)) { continue; }
    reached.add(id);
    nodes.get(id).choices.forEach((choice) => todo.push(choice.next));
  }
  const finishes = new Set();
  for (let grew = true; grew;) {
    grew = false;
    for (const node of content.nodes) {
      if (!finishes.has(node.id) && node.choices.some((c) => ends.has(c.next) || finishes.has(c.next))) {
        finishes.add(node.id);
        grew = true;
      }
    }
  }
  const stuck = content.nodes.find((node) => reached.has(node.id) && !finishes.has(node.id));
  if (stuck) {
    return {
      ar: `من الموقف «${stuck.id}» لا طريق إلى أي نهاية، فمن يصل إليه لا يستطيع أن ينهي القصة.`,
      en: `no choice from node "${stuck.id}" ever reaches an ending, so a learner who gets there could never finish and Next would never open; lead one of its paths to an ending.`,
      named: stuck.id,
    };
  }
  return { unreached: content.nodes.filter((node) => !reached.has(node.id)).map((node) => node.id) };
}

function refuseStory(root, fault) {
  root.setAttribute('data-screen', 'error');
  root.classList.add('game-root');
  root.replaceChildren(el('div', { class: 'game-error', role: 'alert' },
    el('p', { class: 'game-error-title', text: 'تعذّر تشغيل اللعبة: قصتها لا تُروى كما كُتبت.' }),
    el('p', { text: fault.ar }),
    el('p', {}, el('span', { class: 'ltr-inline', dir: 'ltr', text: fault.named }))));
  console.error(`[game] ${fault.ar} ${fault.en}`);
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
  const fault = storyFault(content);
  if (fault.ar) { refuseStory(root, fault); return; }
  if (fault.unreached.length) {
    console.warn(`[game] no path from start reaches ${fault.unreached.join(', ')}; `
      + 'those nodes will always be reported as no decision (none, wrong).');
  }
  root.classList.add('game-root', 'br');

  const { nodes } = content;
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const endById = new Map(content.endings.map((ending) => [ending.id, ending]));
  const R = { ...DEFAULTS, effect: { ...DEFAULTS.effect } };
  if (setting('meter') !== null) { R.meter = clamp(setting('meter'), 1, METER_MAX); }
  const fixed = setting('clock') !== null;
  if (fixed) { R.think = clamp(setting('clock'), 3, 120); }
  const shown = new Map(nodes.map((node) => [node.id,
    shuffled(node.choices, seeded(`${node.id}:${node.choices.map((c) => c.id).join(',')}`))]));
  const picture = Object.fromEntries(PICTURES.map((name) => {
    const fill = content.slots && content.slots[name];
    if (typeof fill === 'string' && SLOT_PATH.test(fill)) { return [name, fill]; }
    if (fill !== undefined) {
      console.warn(`[game] slots.${name} is not a picture under ../assets/ (${JSON.stringify(fill)}); the placeholder is shown.`);
    }
    return [name, new URL(`assets/${name}.svg`, import.meta.url).href];
  }));
  const sparkle = seeded(content.title);
  const gated = nodes.some((node) => node.leave);

  /* picks: node -> its FIRST choice or 'none'; path/end: the first walk's steps (`node.choice`) and how it
   * ended ('' the meter ran out); trail: this walk's; at/chosen/delta/practice: the turn on screen; via: the
   * node a low meter kept the story from; lost: the node the meter ran out on, met and not chosen in. */
  const state = {
    screen: 'intro',
    picks: {},
    path: [],
    end: null,
    trail: [],
    at: null,
    meter: R.meter,
    run: 1,
    found: [],
    chosen: null,
    delta: 0,
    practice: false,
    ending: null,
    via: null,
    lost: null,
    preview: null,
    previewPath: null,
    paused: false,
    muted: true,
    clockOn: true,
    still: false,
  };
  let turn = null;
  let raf = 0;
  let offScreen = false;
  let audio = null;
  const answered = () => nodes.filter((node) => node.id in state.picks && state.picks[node.id] !== 'none').length;
  const choiceOf = (node, id) => node.choices.find((c) => c.id === id) || null;
  const firstOf = (node, result) => node.choices.find((c) => c.result === result) || null;
  const pickFor = (node, path) => (path === 'right'
    ? firstOf(node, 'correct') || firstOf(node, 'neutral') || node.choices[0]
    : firstOf(node, 'wrong'));
  const level = (value) => LEVELS.find(([low]) => value >= low);
  const starsFor = (value) => (STARS.find(([low]) => value >= low) || [0, 0])[1];

  function grow(list, stepText) {
    if (JSON.stringify(list).length + stepText.length + 3 <= STEPS_CHARS) { list.push(stepText); }
  }

  /** `chosen` too: a learner who leaves on an outcome comes back to it, not to its node. */
  function persist() {
    save({
      picks: state.picks, path: state.path, end: state.end, trail: state.trail, at: state.at,
      chosen: state.chosen, delta: state.delta, practice: state.practice, clockOn: state.clockOn,
      meter: Math.round(state.meter), run: state.run, found: state.found, ending: state.ending,
      lost: state.lost, via: state.via,
      finished: state.screen === 'done',
    });
  }

  /** `performance`, not `choice`: SCORM 1.2 spells a choice in single characters and `none` is four. */
  function record(node, choice, ms) {
    if (node.id in state.picks) { return false; }
    state.picks[node.id] = choice.id;
    announce({
      id: node.id, type: 'performance', response: choice.id, result: choice.result, latency: latencyFrom(ms),
    });
    return true;
  }

  function tones(notes) {
    if (state.muted || state.still) { return; }
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) { return; }
      audio = audio || new Context();
      if (audio.state === 'suspended') { audio.resume().catch(() => {}); }
      const now = audio.currentTime;
      for (const [freq, at, length, wave] of notes) {
        const osc = audio.createOscillator();
        const amp = audio.createGain();
        osc.type = wave || 'triangle';
        osc.frequency.value = freq;
        amp.gain.setValueAtTime(0, now + at);
        amp.gain.linearRampToValueAtTime(0.08, now + at + 0.015);
        amp.gain.linearRampToValueAtTime(0, now + at + length);
        osc.connect(amp);
        amp.connect(audio.destination);
        osc.start(now + at);
        osc.stop(now + at + length + 0.03);
      }
    } catch (error) { /* a sound never stops the story */ }
  }
  const sfx = {
    right: () => tones([[523, 0, 0.12], [784, 0.1, 0.2]]),
    unsure: () => tones([[392, 0, 0.16], [370, 0.14, 0.16]]),
    wrong: () => tones([[233, 0, 0.28, 'sawtooth'], [175, 0.18, 0.3, 'sawtooth']]),
    tick: () => tones([[988, 0, 0.05, 'square']]),
    good: () => tones([[523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.3]]),
    bad: () => tones([[330, 0, 0.22, 'sawtooth'], [220, 0.22, 0.4, 'sawtooth']]),
  };


  function tick(now) {
    raf = 0;
    if (state.screen !== 'node' || !turn) { return; }
    const dt = turn.last ? Math.min(0.1, (now - turn.last) / 1000) : 0;
    turn.last = now;
    if (!state.paused && !offScreen && state.clockOn) {
      turn.used += dt;
      if (turn.used > turn.think) {
        state.meter = Math.max(0, state.meter - R.drain * dt);
        const drained = Math.floor(turn.used - turn.think);
        if (drained !== turn.tick) { turn.tick = drained; sfx.tick(); persist(); }
        meter();
        if (state.meter <= 0) { runOut(); return; }
      }
      clock();
    }
    raf = requestAnimationFrame(tick);
  }

  function startClock() {
    stopClock();
    if (state.still || !turn) { return; }
    turn.last = 0;
    raf = requestAnimationFrame(tick);
  }

  function stopClock() {
    if (raf) { cancelAnimationFrame(raf); }
    raf = 0;
  }


  const words = (node) => [node.text, ...node.choices.map((c) => c.label)].join(' ').split(/\s+/).length;

  function enterNode(id) {
    const node = nodeById.get(id);
    state.at = id;
    state.chosen = null;
    state.delta = 0;
    state.ending = null;
    state.practice = id in state.picks;
    const think = fixed ? R.think : Math.max(R.think, Math.ceil(words(node) * READ));
    turn = { shown: performance.now(), used: 0, last: 0, tick: -1, think };
    persist();
    show('node');
    startClock();
  }

  function begin() {
    if (state.at && state.chosen) { show('outcome'); return; }
    if (state.at && nodeById.has(state.at)) { enterNode(state.at); return; }
    if (state.trail.length || state.end !== null) { replay(); return; }
    state.meter = R.meter;
    enterNode(content.start);
  }

  function replay() {
    state.run += 1;
    state.lost = null;
    state.trail = [];
    state.meter = R.meter;
    enterNode(content.start);
  }

  function choose(choiceId) {
    if (state.screen !== 'node' || !turn || state.paused) { return; }
    const node = nodeById.get(state.at);
    const choice = choiceOf(node, choiceId);
    if (!choice) { return; }
    stopClock();
    record(node, choice, performance.now() - turn.shown);
    const before = Math.round(state.meter);
    state.meter = clamp(before + R.effect[choice.result], 0, METER_MAX);
    state.delta = state.meter - before;
    state.chosen = choice.id;
    const stepText = `${node.id}.${choice.id}`;
    grow(state.trail, stepText);
    if (state.end === null) { grow(state.path, stepText); }
    persist();
    show('outcome');
    juice(choice);
  }

  /** Where a choice leads now: '' the meter ran out, a node's `leave` when it arrives low, else `next`. */
  function ahead(choice) {
    if (state.meter <= 0) { return { to: '' }; }
    const node = nodeById.get(choice.next);
    if (node && node.leave && state.meter < LOW) { return { to: node.leave, via: node.id }; }
    return { to: choice.next };
  }

  function proceed() {
    if (state.screen !== 'outcome') { return; }
    const { to, via } = ahead(choiceOf(nodeById.get(state.at), state.chosen));
    if (nodeById.has(to)) { enterNode(to); return; }
    reach(to, via);
  }

  function runOut() {
    stopClock();
    state.meter = 0;
    state.lost = state.at;
    reach('');
  }

  function reach(id, via) {
    stopClock();
    turn = null;
    state.ending = id;
    state.via = via || null;
    state.at = null;
    state.chosen = null;
    if (state.end === null) { state.end = id; }
    if (id && !state.found.includes(id)) { state.found.push(id); }
    persist();
    show('ending');
    endingJuice();
  }

  function toDebrief() {
    stopClock();
    turn = null;
    // Every node never reached is a decision never made: `none`, now.
    for (const node of nodes) {
      if (node.id in state.picks) { continue; }
      state.picks[node.id] = 'none';
      announce({ id: node.id, type: 'performance', response: 'none', result: 'wrong' });
    }
    state.at = null;
    state.ending = null;
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

  function setPaused(paused) {
    if (state.screen !== 'node' && state.screen !== 'outcome') { return; }
    state.paused = paused;
    if (turn) { turn.last = 0; }
    const box = root.querySelector('[data-paused]');
    if (box) { box.hidden = !paused; }
    if (paused) { root.querySelector('[data-act=resume]').focus(); }
  }


  function replayCss(node, key, value) {
    if (!node || state.still) { return; }
    delete node.dataset[key];
    void node.offsetWidth;
    node.dataset[key] = value;
  }

  function say(text) {
    const live = root.querySelector('[data-say]');
    if (live) { live.textContent = text; }
  }

  function burst(from, many) {
    const stage = root.querySelector('[data-burst]');
    if (!stage || !from || state.still || matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }
    const box = stage.getBoundingClientRect();
    const at = from.getBoundingClientRect();
    const x = at.left + at.width / 2 - box.left;
    const y = at.top + Math.min(at.height, 48) / 2 - box.top;
    for (let i = 0; i < many; i += 1) {
      const angle = sparkle() * Math.PI * 2;
      const far = 60 + sparkle() * 120;
      const spark = el('span', { class: 'br-spark', 'data-hue': String(i % 3), 'aria-hidden': 'true' });
      spark.style.setProperty('--x', `${x}px`);
      spark.style.setProperty('--y', `${y}px`);
      spark.style.setProperty('--dx', `${Math.cos(angle) * far}px`);
      spark.style.setProperty('--dy', `${Math.sin(angle) * far}px`);
      stage.append(spark);
      setTimeout(() => spark.remove(), 900);
    }
  }

  function juice(choice) {
    const gauge = root.querySelector('[data-meter]');
    replayCss(gauge, 'bump', state.delta >= 0 ? 'up' : 'down');
    if (gauge && state.delta !== 0 && !state.still) {
      const float = el('span', { class: 'br-float', 'data-sign': state.delta > 0 ? 'up' : 'down', 'aria-hidden': 'true',
        text: signed(state.delta) });
      gauge.append(float);
      setTimeout(() => float.remove(), 1200);
    }
    replayCss(root.querySelector('[data-cast]'), 'react', choice.result === 'correct' ? 'up' : 'down');
    const verdict = root.querySelector('[data-verdict]');
    if (choice.result === 'correct') {
      burst(verdict, SPARKS);
      sfx.right();
    } else {
      replayCss(root.querySelector('[data-stage]'), 'shake', choice.result);
      if (choice.result === 'wrong') { sfx.wrong(); } else { sfx.unsure(); }
    }
    say(`${RESULT_WORDS[choice.result]}. ${content.meter.label}: ${Math.round(state.meter)} من ${METER_MAX}.`);
  }

  function endingJuice() {
    const ending = endById.get(state.ending);
    const tone = ending ? ending.tone : 'bad';
    if (tone === 'good') {
      burst(root.querySelector('[data-stars]'), SPARKS * 2);
      sfx.good();
    } else {
      replayCss(root.querySelector('.br-end'), 'shake', 'wrong');
      sfx.bad();
    }
  }


  function header(title, line) {
    return el('header', { class: 'br-head' },
      line ? el('p', { class: 'br-line', text: line }) : null,
      el('h2', { class: 'br-title', tabindex: '-1', 'data-focus': true, text: title }));
  }

  function soundButton() {
    return el('button', {
      type: 'button', class: 'btn-ghost br-toggle', 'data-act': 'sound',
      'aria-pressed': state.muted ? 'false' : 'true', text: state.muted ? 'الصوت: مغلق' : 'الصوت: يعمل',
    });
  }

  function clockButton() {
    return el('button', {
      type: 'button', class: 'btn-ghost br-toggle', 'data-act': 'clock',
      'aria-pressed': state.clockOn ? 'true' : 'false', text: state.clockOn ? 'المؤقّت: يعمل' : 'المؤقّت: متوقّف',
    });
  }

  function cast(big) {
    const node = state.at ? nodeById.get(state.at) : null;
    const [, mood] = level(Math.round(state.meter));
    return el('figure', { class: big ? 'br-cast br-cast-big' : 'br-cast', 'data-cast': true, 'data-mood': mood },
      el('img', {
        class: 'br-face', src: picture.character,
        alt: node && node.speaker ? `${node.speaker}، من تتعامل معه في القصة` : 'من تتعامل معه في القصة',
      }),
      node && node.speaker ? el('figcaption', { class: 'br-speaker', text: node.speaker }) : null);
  }

  function meterView() {
    return el('div', {
      class: 'br-meter', 'data-meter': true, role: 'meter', 'aria-valuemin': '0', 'aria-valuemax': String(METER_MAX),
      'aria-label': content.meter.label,
    },
    el('span', { class: 'br-meter-label', text: content.meter.label }),
    el('span', { class: 'br-meter-bar', 'aria-hidden': 'true', 'data-line': gated ? '' : null },
      el('span', { class: 'br-meter-fill' })),
    el('span', { class: 'br-meter-value', 'data-meter-value': true }));
  }

  function meter() {
    const gauge = root.querySelector('[data-meter]');
    if (!gauge) { return; }
    const value = Math.round(state.meter);
    const [, mood, words] = level(value);
    gauge.dataset.value = String(value);
    gauge.dataset.level = mood;
    gauge.setAttribute('aria-valuenow', String(value));
    gauge.setAttribute('aria-valuetext', `${value} من ${METER_MAX}، ${words}`);
    gauge.style.setProperty('--br-fill', String(value / METER_MAX));
    gauge.querySelector('[data-meter-value]').textContent = `${value} · ${words}`;
    const face = root.querySelector('[data-cast]');
    if (face) { face.dataset.mood = mood; }
  }

  function clockView() {
    return el('div', { class: 'br-clock', 'data-clock': true, role: 'timer', 'aria-live': 'off' },
      svg('svg', { viewBox: '0 0 48 48', class: 'br-clock-ring', 'aria-hidden': 'true', focusable: 'false' },
        svg('circle', { class: 'br-clock-track', cx: 24, cy: 24, r: 20 }),
        svg('circle', { class: 'br-clock-hand', cx: 24, cy: 24, r: 20, pathLength: 100 })),
      el('span', { class: 'br-clock-text', 'data-clock-text': true }));
  }

  function clock() {
    const face = root.querySelector('[data-clock]');
    if (!face) { return; }
    const text = face.querySelector('[data-clock-text]');
    if (!state.clockOn) {
      face.dataset.off = '';
      face.dataset.left = '';
      face.style.setProperty('--br-left', '1');
      text.textContent = 'بلا مؤقّت';
      return;
    }
    delete face.dataset.off;
    const think = turn ? turn.think : R.think;
    const left = Math.max(0, think - (turn ? turn.used : 0));
    face.dataset.left = String(Math.ceil(left - 1e-6));
    face.style.setProperty('--br-left', String(left / think));
    if (left <= 0 && state.screen === 'node') {
      if (face.dataset.hurry === undefined) { face.dataset.hurry = ''; say(`انتهى الوقت: ${content.meter.label} ينخفض حتى تختار.`); }
      text.textContent = 'أسرِع!';
    } else {
      delete face.dataset.hurry;
      text.textContent = `${Math.ceil(left - 1e-6)} ث`;
    }
  }

  function hud() {
    meter();
    clock();
    const count = root.querySelector('[data-count]');
    if (count) { count.textContent = `المواقف: ${answered()} من ${nodes.length}`; }
  }

  function trailView() {
    const steps = state.trail.map((text) => text.match(STEP_RE)).filter(Boolean);
    return el('ol', { class: 'br-trail', 'data-trail': true, 'aria-label': 'طريقك في هذه الجولة' },
      steps.map(([, nodeId, choiceId]) => {
        const node = nodeById.get(nodeId);
        const choice = node ? choiceOf(node, choiceId) : null;
        if (!node || !choice) { return null; }
        return el('li', { class: 'br-step', 'data-result': choice.result },
          el('span', { class: 'br-step-mark', 'aria-hidden': 'true', text: RESULT_MARKS[choice.result] }),
          el('span', { class: 'sr-only', text: `${RESULT_WORDS[choice.result]}: ` }),
          node.title);
      }),
      state.at && state.screen === 'node'
        ? el('li', { class: 'br-step', 'data-now': true, 'aria-current': 'step', text: nodeById.get(state.at).title })
        : null);
  }

  function told(text) {
    const box = el('p', { class: 'br-text' });
    if (state.still || state.screen !== 'node') { box.textContent = text; return box; }
    text.split(' ').forEach((word, i) => {
      const span = el('span', { class: 'br-word', text: word });
      span.style.setProperty('--i', String(i));
      box.append(span, ' ');
    });
    return box;
  }

  function choicesView(node) {
    return el('div', { class: 'br-choices', role: 'group', 'aria-label': 'ماذا تفعل؟' },
      shown.get(node.id).map((choice, i) => el('button', {
        type: 'button', class: 'br-choice', 'data-choice': choice.id, 'aria-keyshortcuts': DIGITS[i] || null,
      },
      el('span', { class: 'br-key', 'aria-hidden': 'true', text: DIGITS[i] || '' }),
      el('span', { class: 'br-choice-label', text: choice.label }))));
  }

  function outcomeView(node) {
    const choice = choiceOf(node, state.chosen);
    const { to } = ahead(choice);
    const after = to === '' ? null : (nodeById.has(to) ? 'node' : 'ending');
    return el('div', { class: 'br-outcome', 'data-outcome': choice.result, 'aria-live': 'polite' },
      el('p', { class: 'br-picked' }, el('strong', { text: 'اخترت: ' }), choice.label),
      el('p', { class: 'br-verdict', 'data-verdict': true },
        el('span', { class: 'br-verdict-word', text: `${RESULT_MARKS[choice.result]} ${RESULT_WORDS[choice.result]}` }),
        el('span', { class: 'br-verdict-delta', text: `${content.meter.label} ${signed(state.delta)}` })),
      el('p', { class: 'br-consequence', 'data-consequence': true },
        el('strong', { text: 'ما حدث: ' }), choice.consequence),
      el('div', { class: 'br-rule', 'data-rule': true },
        el('p', {}, el('strong', { text: 'القاعدة: ' }), node.rule),
        node.source ? el('p', { class: 'br-source', text: `المصدر: ${node.source}` }) : null),
      after === null
        ? el('p', { class: 'br-out', role: 'status', text: `نفد مقياس «${content.meter.label}»: تنتهي القصة هنا.` })
        : null,
      el('div', { class: 'br-actions' },
        el('button', {
          type: 'button', class: 'btn-primary', 'data-act': 'next', 'data-focus': true,
          text: after === 'node' ? 'تابع' : 'إلى النهاية',
        })));
  }

  function storyView() {
    const node = nodeById.get(state.at);
    const steps = state.trail.length + (state.screen === 'node' ? 1 : 0);
    const kicker = [`الموقف ${steps}`, `الجولة ${state.run}`,
      state.practice ? 'تدريب: أجبت عنه من قبل، فلا يُحسب' : null].filter(Boolean).join(' · ');
    return el('article', { class: 'br-story', 'data-node': node.id, 'data-practice': state.practice ? 'true' : null },
      el('p', { class: 'br-kicker', text: kicker }),
      el('h2', { class: 'br-title', tabindex: '-1', 'data-focus': state.screen === 'node' ? true : null, text: node.title }),
      told(node.text),
      state.screen === 'outcome' ? outcomeView(node) : choicesView(node));
  }

  function playView() {
    const play = el('div', { class: 'br-play', 'data-play': true },
      el('div', { class: 'br-hud' },
        meterView(),
        el('p', { class: 'br-count', 'data-count': true }),
        clockView(),
        el('div', { class: 'br-hud-acts' },
          soundButton(),
          el('button', { type: 'button', class: 'btn-secondary', 'data-act': 'pause', text: 'إيقاف مؤقت' }))),
      trailView(),
      el('div', { class: 'br-stage', 'data-stage': true, 'data-burst': true }, cast(false), storyView()),
      el('div', { class: 'br-paused', 'data-paused': true, hidden: true },
        el('p', { class: 'br-title', text: 'القصة متوقّفة' }),
        el('p', { text: 'المؤقّت متوقّف أيضًا.' }),
        el('button', { type: 'button', class: 'btn-primary', 'data-act': 'resume', text: 'تابع القصة' })),
      el('p', { class: 'sr-only', 'aria-live': 'polite', 'data-say': true }));
    play.querySelector('[data-stage]').style.setProperty('--br-scene', `url("${picture.scene}")`);
    return play;
  }

  function introView() {
    const resuming = Boolean(state.at && nodeById.has(state.at));
    const line = resuming
      ? `تابع من حيث توقفت · أجبت عن ${answered()} من ${nodes.length} مواقف`
      : `${nodes.length} مواقف · ${content.endings.length} نهايات`;
    return el('div', { class: 'br-intro' },
      el('div', { class: 'br-intro-text' },
        header(content.title, line),
        meterView(),
        el('p', { text: `قصة تتفرّع: كل اختيار يغيّر ما يحدث بعده، ويحرّك مقياس «${content.meter.label}».` }),
        el('p', { text: `يبدأ المقياس من ${R.meter} من ${METER_MAX}. التصرّف الصحيح يرفعه، والخطأ يخفضه${gated ? `، وتحت ${LOW} تتغيّر القصة` : ''}، وإن وصل إلى الصفر انتهت.` }),
        el('p', { text: `لكل موقف وقت للتفكير: ${R.think} ثانية${fixed ? '' : ' على الأقل، وأكثر للموقف الطويل'}، وبعدها يبدأ المقياس بالنزول حتى تختار.` }),
        el('p', { class: 'br-how', text: 'اختر بالنقر، أو بالأرقام 1 و2 و3 على لوحة المفاتيح.' }),
        el('div', { class: 'br-actions' },
          el('button', {
            type: 'button', class: 'btn-primary', 'data-act': 'start', 'data-focus': true, text: resuming ? 'تابع' : 'ابدأ',
          }),
          clockButton(),
          soundButton())),
      cast(true));
  }

  function endingView() {
    const id = state.ending;
    const ending = id ? endById.get(id) : null;
    const value = Math.round(state.meter);
    const stars = ending ? starsFor(value) : 0;
    const lost = state.lost ? nodeById.get(state.lost) : null;
    const via = state.via ? nodeById.get(state.via) : null;
    const unseen = nodes.filter((node) => !(node.id in state.picks) && node !== lost).length;
    const tone = ending ? ending.tone : 'bad';
    const last = state.trail[state.trail.length - 1];
    const lastNode = lost || (last ? nodeById.get(last.split('.')[0]) : null);
    const primary = tone === 'good' && !unseen ? 'debrief' : 'again';
    return el('div', { class: 'br-end', 'data-ending': id, 'data-tone': tone },
      el('div', { class: 'br-end-text' },
        el('p', { class: 'br-tone', text: ending ? TONE_WORDS[tone] : `نفد مقياس «${content.meter.label}»` }),
        header(ending ? ending.title : 'انتهت القصة مبكرًا',
          `${content.title}${!ending && lastNode ? ` · ${lastNode.title}` : ''}`),
        el('div', { class: 'br-stars', 'data-stars': true, role: 'img', 'aria-label': `${stars} من 3 نجوم` },
          [1, 2, 3].map((n) => {
            const star = svg('svg', {
              class: 'br-star', viewBox: '0 0 24 24', 'data-on': n <= stars ? 'true' : 'false',
              'aria-hidden': 'true', focusable: 'false',
            }, svg('path', { d: 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z' }));
            star.style.setProperty('--i', String(n));
            return star;
          })),
        via ? el('p', { class: 'br-via', role: 'status', text: `نزل مقياس «${content.meter.label}» تحت ${LOW} قبل «${via.title}»، فتغيّرت القصة.` }) : null,
        el('p', { class: 'br-end-story', text: ending ? ending.text : `وصل مقياس «${content.meter.label}» إلى الصفر قبل أن تنتهي القصة.` }),
        lost && !(lost.id in state.picks) ? el('p', { text: `نفد المقياس وأنت في «${lost.title}» قبل أن تختار.` }) : null,
        el('p', { class: 'br-end-meter', text: `${content.meter.label} في النهاية: ${value} من ${METER_MAX}` }),
        el('p', { class: 'br-found', text: `اكتشفت ${state.found.length} من ${content.endings.length} نهايات.` }),
        unseen
          ? el('p', { class: 'br-unseen', text: `بقي ${unseen} من ${nodes.length} مواقف لم تمرّ بها: جرّب طريقًا آخر لتلقاها، فهي لا تُحسب لك حتى تختار فيها.` })
          : null,
        state.run > 1 || Object.keys(state.picks).length
          ? el('p', { class: 'br-practice-note', text: 'في كل جولة جديدة لا يُحسب إلا موقف تلقاه أول مرة.' })
          : null,
        el('div', { class: 'br-actions' },
          el('button', {
            type: 'button', class: primary === 'debrief' ? 'btn-primary' : 'btn-secondary', 'data-act': 'debrief',
            'data-focus': primary === 'debrief' ? true : null, text: 'إلى الخلاصة',
          }),
          el('button', {
            type: 'button', class: primary === 'again' ? 'btn-primary' : 'btn-secondary', 'data-act': 'again',
            'data-focus': primary === 'again' ? true : null, text: ending ? 'جرّب طريقًا آخر' : 'حاول مرة أخرى',
          }))),
      cast(true));
  }

  function rowsFor(picks) {
    return nodes.map((node) => {
      const pick = picks[node.id];
      const choice = pick && pick !== 'none' ? choiceOf(node, pick) : null;
      return {
        id: node.id, situation: node.title, chosen: choice ? choice.label : null,
        rule: node.rule, source: node.source, result: choice ? choice.result : 'none',
      };
    });
  }

  function pathView() {
    const walked = state.previewPath || { steps: state.path, end: state.end };
    const steps = walked.steps.map((text) => text.match(STEP_RE)).filter(Boolean)
      .map(([text, nodeId, choiceId]) => ({ text, node: nodeById.get(nodeId), choice: null, choiceId }))
      .filter((s) => s.node)
      .map((s) => ({ ...s, choice: choiceOf(s.node, s.choiceId) }))
      .filter((s) => s.choice);
    if (!steps.length) { return null; }
    const ending = walked.end ? endById.get(walked.end) : null;
    return el('section', { class: 'br-path', 'aria-label': 'طريقك الأول' },
      el('h3', { class: 'br-path-title', text: 'طريقك الأول' }),
      el('ol', { class: 'br-path-steps' },
        steps.map((s) => el('li', { class: 'br-path-step', 'data-path-step': s.text, 'data-result': s.choice.result },
          el('span', { class: 'br-path-node', text: `${RESULT_MARKS[s.choice.result]} ${s.node.title}` }),
          el('span', { class: 'br-path-choice', text: s.choice.label }))),
        walked.end !== null && walked.end !== undefined
          ? el('li', { class: 'br-path-step br-path-end', 'data-path-end': walked.end },
            el('span', { class: 'br-path-node', text: 'النهاية' }),
            el('span', { class: 'br-path-choice', text: ending ? ending.title : `نفد مقياس «${content.meter.label}»` }))
          : null));
  }

  function debriefView() {
    const done = state.screen === 'done';
    const found = state.previewPath ? [state.previewPath.end].filter((id) => endById.has(id)) : state.found;
    return el('div', { class: 'br-debrief' },
      header('خلاصة القصة', content.title),
      pathView(),
      el('p', { class: 'br-found', text: `اكتشفت ${found.length} من ${content.endings.length} نهايات.` }),
      debrief(rowsFor(state.preview || state.picks)),
      done
        ? el('p', { class: 'br-done', role: 'status', text: 'انتهيت. يمكنك المتابعة إلى الشريحة التالية.' })
        : el('button', { type: 'button', class: 'btn-primary', 'data-act': 'finish', text: 'إنهاء' }));
  }

  function sheetView() {
    const where = (next) => (nodeById.has(next) ? `الموقف: ${nodeById.get(next).title}`
      : `النهاية: ${endById.get(next).title}`);
    return el('div', { class: 'br-sheet', 'data-sheet': true },
      el('header', { class: 'br-sheet-head', 'data-sheet-head': true },
        el('h2', { class: 'br-title', text: `ورقة المراجعة: ${content.title}` }),
        el('p', { class: 'br-line', 'data-sheet-count': true })),
      nodes.map((node) => el('section', { class: 'br-sheet-point', 'data-sheet-point': node.id },
        el('h3', { text: node.title }),
        el('p', { class: 'br-sheet-text', text: node.text }),
        el('div', { class: 'br-sheet-choices' }, node.choices.map((choice) => el('div', {
          class: 'br-sheet-choice', 'data-sheet-choice': `${node.id}.${choice.id}`, 'data-result': choice.result,
        },
        el('p', { class: 'br-sheet-did' }, el('strong', { text: `${RESULT_WORDS[choice.result]} (${signed(R.effect[choice.result])}): ` }), choice.label),
        el('p', {}, el('strong', { text: 'ما حدث: ' }), choice.consequence),
        el('p', { class: 'br-sheet-next', text: `يقود إلى ${where(choice.next)}` })))),
        node.leave ? el('p', { class: 'br-sheet-next', text: `من يصل إليه و«${content.meter.label}» تحت ${LOW}: ${where(node.leave)}` }) : null,
        el('p', { class: 'br-sheet-rule' }, el('strong', { text: 'القاعدة: ' }), node.rule),
        node.source ? el('p', { class: 'br-source', text: `المصدر: ${node.source}` }) : null)));
  }

  function pageTheSheet() {
    const sheet = root.querySelector('[data-sheet]');
    const parts = [...sheet.querySelectorAll('[data-sheet-point]')];
    const bottom = root.getBoundingClientRect().top + root.clientHeight
      - parseFloat(getComputedStyle(root).paddingBlockEnd);
    const room = bottom - parts[0].getBoundingClientRect().top;
    const gap = parseFloat(getComputedStyle(sheet).rowGap) || 0;
    let pages = 1;
    let used = 0;
    for (const part of parts) {
      const height = part.getBoundingClientRect().height;
      if (used && used + gap + height > room) { pages += 1; used = 0; }
      used += (used ? gap : 0) + height;
      part.dataset.page = String(pages);
    }
    const page = Math.min(Math.max(setting('sheet') || 1, 1), pages);
    parts.forEach((part) => { part.hidden = Number(part.dataset.page) !== page; });
    sheet.dataset.sheetPages = String(pages);
    sheet.dataset.sheetPage = String(page);
    sheet.querySelector('[data-sheet-count]').replaceChildren(`الصفحة ${page} من ${pages}`,
      page < pages ? ' · التالية: ' : '',
      page < pages ? el('span', { class: 'ltr-inline', dir: 'ltr', text: `sheet=${page + 1}` }) : '');
  }

  const VIEWS = {
    intro: introView, node: playView, outcome: playView, ending: endingView,
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
    root.toggleAttribute('data-still', state.still);
    const inPlay = state.screen === 'node' || state.screen === 'outcome';
    const play = inPlay ? root.querySelector('[data-play]') : null;
    if (play) {
      play.querySelector('[data-trail]').replaceWith(trailView());
      play.querySelector('[data-stage]').replaceChildren(cast(false), storyView());
      play.querySelector('[data-paused]').hidden = !state.paused;
    } else {
      root.replaceChildren(VIEWS[state.screen]());
    }
    if (inPlay) { hud(); }
    if (state.screen === 'intro') { meter(); }
    if (state.screen === 'sheet') { pageTheSheet(); }
    if (hadFocus) {
      const target = [...root.querySelectorAll('[data-focus]')].pop();
      if (target) { target.focus(); }
    }
  }


  root.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button') : null;
    if (!target || target.disabled || !root.contains(target)) { return; }
    if (target.dataset.choice !== undefined) { choose(target.dataset.choice); return; }
    const act = target.dataset.act;
    if (act === 'start') { begin(); }
    if (act === 'next') { proceed(); }
    if (act === 'again') { replay(); }
    if (act === 'debrief') { toDebrief(); }
    if (act === 'finish') { end(); }
    if (act === 'pause') { setPaused(true); }
    if (act === 'resume') { setPaused(false); }
    if (act === 'sound') {
      state.muted = !state.muted;
      target.setAttribute('aria-pressed', state.muted ? 'false' : 'true');
      target.textContent = state.muted ? 'الصوت: مغلق' : 'الصوت: يعمل';
      sfx.right();
    }
    if (act === 'clock') {
      state.clockOn = !state.clockOn;
      target.setAttribute('aria-pressed', state.clockOn ? 'true' : 'false');
      target.textContent = state.clockOn ? 'المؤقّت: يعمل' : 'المؤقّت: متوقّف';
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) { return; }
    if (state.screen === 'node' && !state.paused) {
      const at = Math.max(DIGITS.indexOf(event.key), ARABIC_DIGITS.indexOf(event.key));
      const choices = state.at ? shown.get(state.at) : [];
      if (at >= 0 && at < choices.length) { event.preventDefault(); choose(choices[at].id); return; }
    }
    const lower = (event.key || '').toLowerCase();
    if ((state.screen === 'node' || state.screen === 'outcome') && (lower === 'p' || lower === 'escape')) {
      event.preventDefault();
      setPaused(!state.paused);
    }
  });
  if (window.deckNav && typeof window.deckNav.onScreen === 'function') {
    window.deckNav.onScreen((on) => { offScreen = !on; if (turn) { turn.last = 0; } });
  }
  document.addEventListener('visibilitychange', () => { if (turn) { turn.last = 0; } });


  function walkFor(path) {
    const steps = [];
    let at = content.start;
    let value = R.meter;
    for (let guard = nodes.length * 3; guard > 0; guard -= 1) {
      const node = nodeById.get(at);
      const choice = pickFor(node, path) || node.choices[0];
      steps.push(`${node.id}.${choice.id}`);
      value = clamp(value + R.effect[choice.result], 0, METER_MAX);
      const next = nodeById.get(choice.next);
      if (!value) { return { steps, end: '' }; }
      if (!next) { return { steps, end: choice.next }; }
      if (next.leave && value < LOW) { return { steps, end: next.leave }; }
      at = next.id;
    }
    return { steps, end: null };
  }

  // One node the all-right walk never meets caps a flawless learner below full marks.
  const met = new Set(walkFor('right').steps.map((step) => step.split('.')[0]));
  const missed = nodes.filter((node) => !met.has(node.id) && !fault.unreached.includes(node.id)).map((node) => node.id);
  if (missed.length) {
    console.warn(`[game] the all-right walk never meets ${missed.join(', ')}, so a flawless learner who walks the story once `
      + 'is scored wrong there; put every node on the right path, or accept it.');
  }

  registerTest({
    decisions: () => nodes.map((node) => ({ id: node.id, choices: node.choices.map((c) => c.id) })),
    // Through record(), never the links, every node in the page's order; then the debrief.
    play: async (path) => {
      stopClock();
      turn = null;
      state.preview = null;
      state.previewPath = null;
      for (const node of nodes) {
        if (path === 'skip') { break; }
        if (node.id in state.picks) { continue; }
        const choice = pickFor(node, path);
        if (choice) { record(node, choice, 0); }
      }
      if (state.screen !== 'done') { toDebrief(); end(); }
    },
    // A moment is a picture: it chooses, reports and saves nothing.
    moment: async (name) => {
      stopClock();
      turn = null;
      state.still = true;
      state.preview = null;
      state.previewPath = null;
      state.paused = false;
      if (name === 'start') { show('intro'); return; }
      if (name === 'feedback-sheet') { show('sheet'); return; }
      if (name === 'debrief') {
        state.preview = Object.fromEntries(nodes.map((node) => [node.id,
          state.picks[node.id] || (pickFor(node, 'wrong') || { id: 'none' }).id]));
        state.previewPath = state.path.length ? null : walkFor('wrong');
        show('debrief');
        return;
      }
      const node = nodes.find((n) => firstOf(n, 'wrong')) || nodes[0];
      const choice = firstOf(node, 'wrong') || node.choices[0];
      state.at = node.id;
      state.trail = [];
      state.practice = false;
      state.meter = clamp(R.meter + R.effect[choice.result], 0, METER_MAX);
      state.delta = state.meter - R.meter;
      state.chosen = choice.id;
      grow(state.trail, `${node.id}.${choice.id}`);
      root.replaceChildren();
      show('outcome');
      const gauge = root.querySelector('[data-meter]');
      if (gauge) { gauge.dataset.bump = 'down'; }
    },
  });

  onRestore(({ done, progress }) => {
    const raw = progress.picks && typeof progress.picks === 'object' ? progress.picks : {};
    state.picks = {};
    for (const node of nodes) {
      const pick = raw[node.id];
      if (done.includes(node.id) && (pick === 'none' || (typeof pick === 'string' && choiceOf(node, pick)))) {
        state.picks[node.id] = pick;
      }
    }
    const steps = (list) => (Array.isArray(list) ? list : []).filter((text) => {
      const m = typeof text === 'string' && text.match(STEP_RE);
      return Boolean(m && nodeById.has(m[1]) && choiceOf(nodeById.get(m[1]), m[2]));
    }).slice(0, 64);
    const endingOf = (value) => (value === '' || (typeof value === 'string' && endById.has(value)) ? value : null);
    state.path = steps(progress.path);
    state.trail = steps(progress.trail);
    state.end = endingOf(progress.end);
    state.found = [...new Set((Array.isArray(progress.found) ? progress.found : []).filter((id) => endById.has(id)))];
    state.run = Number.isInteger(progress.run) && progress.run > 0 ? progress.run : 1;
    const known = (id) => (typeof id === 'string' && nodeById.has(id) ? id : null);
    state.at = known(progress.at);
    state.lost = known(progress.lost);
    state.via = known(progress.via);
    const node = state.at && nodeById.get(state.at);
    state.chosen = node && node.id in state.picks && choiceOf(node, progress.chosen)
      && (state.picks[node.id] === progress.chosen || progress.practice === true) ? progress.chosen : null;
    if (state.chosen) {
      state.delta = Number.isInteger(progress.delta) ? progress.delta : 0;
      state.practice = progress.practice === true;
    }
    state.clockOn = progress.clockOn !== false;
    const kept = Number(progress.meter);
    state.meter = Number.isFinite(kept) ? clamp(Math.round(kept), state.at && !state.chosen ? 1 : 0, METER_MAX) : R.meter;
    const ending = state.at ? null : endingOf(progress.ending);
    const all = nodes.every((node) => node.id in state.picks);
    if (progress.finished === true && all) {
      state.screen = 'done';
      render();
      finish();
      return;
    }
    if (all) { show('debrief'); return; }
    if (ending !== null) { state.ending = ending; show('ending'); return; }
    render();
  });

  render();
}

if (typeof document !== 'undefined') { boot(); }
