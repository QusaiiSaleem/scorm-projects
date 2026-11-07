/*
 * games/core/game-core.js -- the runtime every game in games/ imports
 * (2026-11-06, learning-games spec §4.1, Scitter plan Task 18).
 *
 * A game knows no host. It reads its words from one block in its own page,
 * announces what the learner did as DOM events on `document`, and asks for its
 * progress to be saved and handed back the same way:
 *
 *   engine:answer  {id, type, response, result, latency, severity?}
 *   engine:save    {text}        text = JSON {v: 1, done: [ids], progress}
 *   engine:restore {text}        dispatched BY the host, heard here
 *   engine:done                  the game is finished
 *
 * The host maps them in one place. In Scitter that is deck-nav.js, which turns
 * them into the deck's messages and adds each row's outcome codes; any other
 * player maps the same four events and the games stay unchanged. Events and
 * not postMessage, so a game never names its host.
 *
 * WHAT THE CORE PROMISES, so no game has to remember it:
 * - content that is not what the game's shape says is refused LOUDLY: an
 *   Arabic box on the stage the team sees, and exactly one console error
 *   naming the field or the id. Never a blank stage, never a half-drawn game;
 * - every id is ASCII (ID_RE), so every wire -- SCORM 1.2, SCORM 2004 (Moodle's
 *   2004 validator refuses an Arabic answer) and cmi5 -- carries the same bytes;
 * - a decision is announced once per id per load. The first answer is the
 *   one reported; a retry is practice. A decision never made is the id `none`
 *   with result `wrong`, and its Arabic words belong to the debrief only;
 * - no `weighting`, ever, and nothing in localStorage or sessionStorage: the
 *   learner's progress travels only through engine:save;
 * - engine:done fires once.
 *
 * LATENCY IS SPELLED THE SCORM 1.2 WAY, HHHH:MM:SS.SS (2026-11-06). The plan
 * named ISO 8601, and that is what SCORM 2004 and cmi5 carry -- but the
 * wrapper writes a 1.2 latency AS GIVEN (scorm-api.js recordInteraction, RTE
 * 3.4 CMITimespan), and an ISO string there is a type mismatch Moodle's
 * validator refuses. The other two wires convert this spelling themselves
 * (SCORMWrapper.toTimeinterval), so it is the one spelling every wire takes.
 *
 * Nothing here touches the DOM until a function is called, so a game module
 * can be imported outside a browser to read its shape.
 */

/** What an id may be: what SCORM 1.2's CMIIdentifier, 2004's identifier and
 *  an IRI segment all accept, at the length every one of them keeps. */
export const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
/** Ids no content may use: `none` is the response of a decision never made,
 *  `commitment` the learner's own sentence. */
const RESERVED_IDS = ['none', 'commitment'];
/** The answer types whose response is the learner's own words. */
const FREE_TEXT = ['fill-in', 'long-fill-in'];

const announced = new Set();
let known = new Set();
let finished = false;

/** A refusal already shown and logged; the game stops on it quietly. */
export class GameContentError extends Error {}

/** `el('p', {class: 'x', 'data-act': 'next'}, 'text', child)`: an element,
 *  its attributes, and its children as nodes or text -- never HTML, so no
 *  word of the content is ever parsed as markup. `null` children are skipped. */
export function el(tag, attrs, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs || {})) {
    if (value === false || value === null || value === undefined) { continue; }
    if (name === 'text') { node.textContent = String(value); continue; }
    node.setAttribute(name, value === true ? '' : String(value));
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) { continue; }
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function stage() {
  return document.getElementById('game') || document.querySelector('main') || document.documentElement;
}

/** Show the refusal on the stage, log it once, and stop the caller. */
function refuse(arabic, english, named) {
  const root = stage();
  root.setAttribute('data-screen', 'error');
  root.classList.add('game-root');
  root.replaceChildren(el('div', { class: 'game-error', role: 'alert' },
    el('p', { class: 'game-error-title', text: 'تعذّر تشغيل اللعبة: محتواها لا يطابق شكلها.' }),
    el('p', { text: arabic }),
    named ? el('p', {}, el('span', { class: 'ltr-inline', dir: 'ltr', text: named })) : null));
  console.error(`[game] ${arabic} ${english}`);
  throw new GameContentError(english);
}

function typeOf(value) {
  if (Array.isArray(value)) { return 'array'; }
  if (value === null) { return 'null'; }
  return typeof value;
}

/** The first way `value` breaks `shape` (a JSON Schema subset: type,
 *  required, properties, items, enum, pattern, minLength, minItems), refused
 *  by path; reserved ids and repeated sibling ids are refused here too. */
function check(value, shape, path) {
  const where = path || 'game-content';
  const wanted = shape.type;
  if (wanted && typeOf(value) !== wanted) {
    refuse(`الحقل ${where} يجب أن يكون من النوع ${wanted}.`,
      `${where} must be of type ${wanted}, not ${typeOf(value)}.`, where);
  }
  if (wanted === 'string') {
    if (shape.pattern && !new RegExp(shape.pattern).test(value)) {
      refuse(`المعرّف «${value}» في ${where} ليس من حروف لاتينية وأرقام فقط (A-Za-z0-9 _ - حتى 64 حرفًا).`,
        `the id "${value}" at ${where} is not A-Za-z0-9, _ or - (1 to 64 characters), so a wire would carry something else; use an ASCII id and keep the words in the label.`,
        `${where} = "${value}"`);
    }
    if (typeof shape.minLength === 'number' && value.length < shape.minLength) {
      refuse(`الحقل ${where} فارغ.`, `${where} is empty.`, where);
    }
    if (Array.isArray(shape.enum) && !shape.enum.includes(value)) {
      refuse(`القيمة «${value}» في ${where} ليست من: ${shape.enum.join('، ')}.`,
        `${where} is "${value}"; it takes one of ${shape.enum.join(', ')}.`, where);
    }
  }
  if (wanted === 'object') {
    for (const key of shape.required || []) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) {
        const missing = path ? `${path}.${key}` : key;
        refuse(`الحقل ${missing} ناقص.`, `${missing} is missing.`, missing);
      }
    }
    for (const [key, sub] of Object.entries(shape.properties || {})) {
      if (Object.prototype.hasOwnProperty.call(value, key)) { check(value[key], sub, path ? `${path}.${key}` : key); }
    }
    if (typeof value.id === 'string' && RESERVED_IDS.includes(value.id)) {
      refuse(`المعرّف «${value.id}» في ${where}.id محجوز للعبة.`,
        `the id "${value.id}" at ${where}.id is reserved (${RESERVED_IDS.join(', ')}); choose another.`,
        `${where}.id = "${value.id}"`);
    }
  }
  if (wanted === 'array') {
    if (typeof shape.minItems === 'number' && value.length < shape.minItems) {
      refuse(`القائمة ${where} أقصر من ${shape.minItems}.`, `${where} needs at least ${shape.minItems} item(s).`, where);
    }
    const seen = new Set();
    value.forEach((item, i) => {
      if (shape.items) { check(item, shape.items, `${path}[${i}]`); }
      if (item && typeof item.id === 'string') {
        if (seen.has(item.id)) {
          refuse(`المعرّف «${item.id}» مكرر في ${where}.`, `the id "${item.id}" appears twice in ${where}.`,
            `${path}[${i}].id = "${item.id}"`);
        }
        seen.add(item.id);
      }
    });
  }
}

/** The objects `path` reaches (`stages[].points[]`), in order: the reader
 *  Scitter's `package.game_point_ids` is, so the rows it writes and the
 *  check below agree on which objects are points. */
function reach(content, path) {
  let nodes = [content];
  for (const step of String(path || '').split('.').filter(Boolean)) {
    const each = step.endsWith('[]');
    const field = each ? step.slice(0, -2) : step;
    const next = [];
    for (const node of nodes) {
      const value = node && typeof node === 'object' ? node[field] : undefined;
      if (each && Array.isArray(value)) { next.push(...value); } else if (!each && value !== undefined) { next.push(value); }
    }
    nodes = next;
  }
  return nodes;
}

/**
 * The game's content, read from `<script type="application/json"
 * class="game-content">` and checked against `shape` -- the game's
 * content.schema.json without its words, `x-points` included -- or a loud
 * refusal and a throw of GameContentError.
 *
 * Every point (`x-points`) must have a row in the page (`[data-question-id]`)
 * and every row a point, because the rows carry the outcome codes the host
 * adds to each answer, and the release joins on them. `options.alsoReports`
 * names the ids the game reports beyond its points (a decision game's
 * `commitment`), so a saved text keeps them across a reload.
 */
export function readContent(shape, options = {}) {
  const block = document.querySelector('script.game-content[type="application/json"]');
  if (!block) {
    refuse('لا توجد في الصفحة كتلة محتوى اللعبة.',
      'the page has no <script type="application/json" class="game-content"> block; get_template hands one out.',
      'game-content');
  }
  let content;
  try {
    content = JSON.parse(block.textContent);
  } catch (error) {
    refuse(`كتلة المحتوى ليست JSON صالحًا: ${error.message}`,
      `the game-content block is not valid JSON (${error.message}).`, 'game-content');
  }
  check(content, shape, '');
  const points = reach(content, shape['x-points']).map((point) => point.id);
  const seen = new Set();
  for (const id of points) {
    if (seen.has(id)) { refuse(`النقطة «${id}» مكررة.`, `the point id "${id}" appears twice.`, id); }
    seen.add(id);
  }
  const rows = [...document.querySelectorAll('[data-question-id]')].map((row) => row.getAttribute('data-question-id'));
  for (const id of points) {
    if (!rows.includes(id)) {
      refuse(`النقطة «${id}» بلا صفّ data-question-id في الصفحة.`,
        `the point "${id}" has no data-question-id row on the page; add <li data-question-id="${id}" data-measures="…"> beside the others.`,
        id);
    }
  }
  for (const id of rows) {
    if (!points.includes(id)) {
      refuse(`الصفّ «${id}» لا تقابله نقطة في المحتوى.`,
        `the row data-question-id="${id}" has no point in the content; remove the row or add the point.`, id);
    }
  }
  known = new Set([...points, ...(options.alsoReports || [])]);
  return content;
}

/** Announce one final decision, at most once per id per load. Answers true
 *  when it was announced, false when the id had been already (a retry, or a
 *  restored id) or the decision could not travel. */
export function announce(decision) {
  const id = String((decision && decision.id) || '');
  if (announced.has(id)) { return false; }
  const type = String(decision.type || '');
  const response = decision.response === undefined || decision.response === null ? '' : String(decision.response);
  if (!ID_RE.test(id) || (!FREE_TEXT.includes(type) && !ID_RE.test(response))) {
    console.error(`[game] لم يُرسَل القرار ${id}: معرّفه أو إجابته ليست ASCII. `
      + `decision ${JSON.stringify(id)} was not announced: its id or its response ${JSON.stringify(response)} is not A-Za-z0-9, _ or -.`);
    return false;
  }
  announced.add(id);
  const detail = { id, type, response, result: String(decision.result || '') };
  if (decision.latency) { detail.latency = String(decision.latency); }
  if (decision.severity) { detail.severity = String(decision.severity); }
  document.dispatchEvent(new CustomEvent('engine:answer', { detail }));
  return true;
}

/** Ask the host to keep the game's progress: every id announced so far, and
 *  the game's own `progress` (keep it to ids and short flags -- SCORM 1.2
 *  leaves a slide about 3,000 characters). */
export function save(progress) {
  const text = JSON.stringify({ v: 1, done: [...announced], progress: progress || {} });
  document.dispatchEvent(new CustomEvent('engine:save', { detail: { text } }));
}

/**
 * Hear the host hand the saved text back: `fn({done, progress})` once, with
 * `done` holding only ids the CURRENT content still has -- an edited lecture
 * drops a point, and its id is ignored -- and each of them counted as already
 * announced, so a returning learner's answers are never reported twice. A
 * text that is not ours (not JSON, another version) is no saved text: the
 * game starts afresh. Register it while the module first runs, before any
 * await: the host hands the text back at DOMContentLoaded.
 */
export function onRestore(fn) {
  document.addEventListener('engine:restore', (event) => {
    let saved = null;
    try { saved = JSON.parse(String((event.detail && event.detail.text) || '')); } catch (error) { saved = null; }
    if (!saved || typeof saved !== 'object' || Array.isArray(saved) || saved.v !== 1) { return; }
    const done = (Array.isArray(saved.done) ? saved.done : []).filter((id) => typeof id === 'string' && known.has(id));
    const progress = saved.progress && typeof saved.progress === 'object' && !Array.isArray(saved.progress) ? saved.progress : {};
    done.forEach((id) => announced.add(id));
    try {
      fn({ done, progress });
    } catch (error) {
      console.warn(`[game] the saved progress could not be restored (${error}); the game goes on from where it is.`);
    }
  });
}

/** The game is finished: engine:done, once. The host opens Next on it. */
export function finish() {
  if (finished) { return false; }
  finished = true;
  document.dispatchEvent(new CustomEvent('engine:done'));
  return true;
}

/** A setting game.json declares, off the query render_slide passes: a whole
 *  number, or null (a learner's slide has none). The platform checks range. */
export function setting(name) {
  const raw = new URLSearchParams(location.search).get(name);
  return raw !== null && /^-?[0-9]{1,9}$/.test(raw) ? Number(raw) : null;
}

const PLAYS = ['right', 'wrong', 'skip'];
const MOMENTS = ['start', 'after-wrong', 'debrief', 'feedback-sheet'];

function parsed() {
  if (document.readyState !== 'loading') { return Promise.resolve(); }
  return new Promise((resolve) => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
}

/**
 * The game's test hooks, written by us and never by a builder: the platform
 * plays the game through them, never by clicking (spec §4.5).
 *   decisions()   the points and their choices, [{id, choices: [ids]}]
 *   play(path)    right | wrong | skip, through the game's own functions
 *   moment(name)  start | after-wrong | debrief | feedback-sheet
 * Both wait until the page is parsed, so a saved text the host hands back at
 * DOMContentLoaded is restored before anything is played. There is no
 * state(): the host watches engine:done and its own Next for itself.
 */
export function registerTest({ decisions, play, moment }) {
  window.engineGame = {
    test: {
      decisions: () => decisions(),
      play: async (path) => {
        if (!PLAYS.includes(path)) { throw new Error(`play() takes ${PLAYS.join(', ')}, not ${JSON.stringify(path)}`); }
        await parsed();
        return play(path);
      },
      moment: async (name) => {
        if (!MOMENTS.includes(name)) { throw new Error(`moment() takes ${MOMENTS.join(', ')}, not ${JSON.stringify(name)}`); }
        await parsed();
        return moment(name);
      },
    },
  };
}

/**
 * The debrief: one row per point, in the game's order -- what the learner
 * chose (or «لم يُتَّخذ قرار»), the rule, and «المصدر: …» when the content
 * names one. `rows` is [{id, situation, chosen, rule, source, result}], with
 * `chosen` the label of the choice or null for a decision never made.
 */
export function debrief(rows) {
  return el('ol', { class: 'game-debrief' }, rows.map((row) => el('li', {
    class: 'game-debrief-row', 'data-debrief-row': row.id, 'data-result': row.chosen ? row.result : 'none',
  },
  row.situation ? el('p', { class: 'game-debrief-situation', text: row.situation }) : null,
  el('p', { class: 'game-debrief-chosen', text: row.chosen ? `اختيارك: ${row.chosen}` : 'لم يُتَّخذ قرار' }),
  el('p', { class: 'game-debrief-rule', text: row.rule }),
  row.source ? el('p', { class: 'game-debrief-source', text: `المصدر: ${row.source}` }) : null)));
}

/** A latency in SCORM 1.2's CMITimespan, HHHH:MM:SS.SS (see the header). */
export function latencyFrom(ms) {
  const centis = Math.min(Math.max(0, Math.round(Number(ms) / 10) || 0), 9999 * 360000 - 1);
  const hours = Math.floor(centis / 360000);
  const minutes = Math.floor(centis / 6000) % 60;
  const seconds = (centis % 6000) / 100;
  return `${String(hours).padStart(4, '0')}:${String(minutes).padStart(2, '0')}:${seconds.toFixed(2).padStart(5, '0')}`;
}
