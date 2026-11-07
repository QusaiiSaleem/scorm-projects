/*
 * games/decision/game.js -- the decision game (2026-11-06, learning-games spec
 * §4.3 and §5, game 1; Scitter plan Task 19).
 *
 * The learner meets a situation, chooses what to do, and SEES WHAT THE CHOICE
 * DID before being told why: the consequence first, the rule and its source
 * after one more press («لماذا؟»). The feedback names the behaviour -- what
 * the learner did, in the choice's own words -- never the learner. A retry is
 * allowed and is practice: only the first answer per point is reported. A
 * debrief closes the game, one row per point, with an optional commitment
 * line in the learner's own words; finishing says engine:done.
 *
 * Its words live in the page's content block (content.schema.json is their
 * shape; SHAPE below is the same document without its words, pinned equal by
 * Scitter's tests/test_game_decision.py). Its outcome codes live once, on the
 * page's rows (`data-measures`), and the host adds them to every answer. It
 * reports one `performance` row per point -- response the choice's ASCII id,
 * result, severity, latency -- `none`/`wrong` for a point skipped, and the
 * commitment as a `fill-in` with id `commitment`, only when one was written.
 *
 * Laid out for the 1280x720 stage: the situation and the choices on the
 * inline-start side (the right, in Arabic), what happened on the other.
 * Touch first, every control a native button, so the keyboard path is the
 * browser's own.
 */
import {
  announce, debrief, el, finish, GameContentError, latencyFrom, onRestore, readContent, registerTest, save,
} from '../core/game-core.js';

/** content.schema.json without its descriptions: what readContent enforces. */
export const SHAPE = {
  'x-points': 'stages[].points[]',
  type: 'object',
  required: ['title', 'stages'],
  properties: {
    title: { type: 'string', minLength: 1 },
    stages: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['id', 'scene', 'points'],
        properties: {
          id: { type: 'string', pattern: '^[A-Za-z0-9_-]{1,64}$' },
          scene: { type: 'string', minLength: 1 },
          points: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['id', 'situation', 'choices'],
              properties: {
                id: { type: 'string', pattern: '^[A-Za-z0-9_-]{1,64}$' },
                situation: { type: 'string', minLength: 1 },
                choices: {
                  type: 'array',
                  minItems: 2,
                  items: {
                    type: 'object',
                    required: ['id', 'label', 'result', 'consequence', 'rule', 'source'],
                    properties: {
                      id: { type: 'string', pattern: '^[A-Za-z0-9_-]{1,64}$' },
                      label: { type: 'string', minLength: 1 },
                      result: { type: 'string', enum: ['correct', 'wrong', 'neutral'] },
                      severity: { type: 'string', enum: ['high', 'medium', 'low'] },
                      consequence: { type: 'string', minLength: 1 },
                      rule: { type: 'string', minLength: 1 },
                      source: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    commitment: {
      type: 'object',
      required: ['prompt'],
      properties: { prompt: { type: 'string', minLength: 1 } },
    },
  },
};

/** Said beside the colour, never by colour alone (WCAG 1.4.1). */
const RESULT_WORDS = { correct: 'تصرّف صحيح', wrong: 'تصرّف غير صحيح', neutral: 'تصرّف غير حاسم' };
const COMMITMENT_ID = 'commitment';
/** SCORM 1.2's student_response keeps 255 characters (RTE 3.4, SPM). */
const COMMITMENT_MAX = 250;

function boot() {
  const root = document.getElementById('game');
  if (!root) {
    console.error('[game] لا يوجد عنصر #game في الصفحة. The page has no <div id="game">; get_template hands one out.');
    return;
  }
  let content;
  try {
    content = readContent(SHAPE, { alsoReports: [COMMITMENT_ID] });
  } catch (error) {
    if (error instanceof GameContentError) { return; }
    throw error;
  }
  root.classList.add('game-root', 'dg');

  const points = [];
  content.stages.forEach((stage) => stage.points.forEach((point) => points.push({ stage, point })));
  const state = {
    screen: 'intro', // intro | point | debrief | done | sheet
    at: 0, // the point on screen
    picks: {}, // point id -> the FIRST choice id, or 'none'
    chosen: null, // the choice whose feedback is on screen (a retry changes it)
    revealed: false, // the rule shown, after the consequence
    shownAt: 0, // when the point (or the debrief) came on screen, for latency
    committed: false,
    preview: null, // picks a moment shows without anyone choosing them
  };

  const pointAt = () => points[state.at].point;
  const choiceOf = (point, id) => point.choices.find((c) => c.id === id) || null;
  const firstOf = (point, result) => point.choices.find((c) => c.result === result) || null;
  const pickFor = (point, path) => (path === 'right'
    ? firstOf(point, 'correct') || firstOf(point, 'neutral') || point.choices[0]
    : firstOf(point, 'wrong'));

  function persist() {
    save({ picks: state.picks, finished: state.screen === 'done' });
  }

  function show(screen) {
    state.screen = screen;
    state.shownAt = performance.now();
    render();
  }

  function start() {
    state.at = points.findIndex(({ point }) => !(point.id in state.picks));
    if (state.at < 0) { state.at = points.length - 1; show('debrief'); return; }
    state.chosen = null;
    state.revealed = false;
    show('point');
  }

  function choose(choiceId) {
    if (state.screen !== 'point' || state.chosen) { return; }
    const point = pointAt();
    const choice = choiceOf(point, choiceId);
    if (!choice) { return; }
    state.chosen = choice.id;
    state.revealed = false;
    if (!(point.id in state.picks)) {
      state.picks[point.id] = choice.id;
      announce({
        id: point.id, type: 'performance', response: choice.id, result: choice.result,
        latency: latencyFrom(performance.now() - state.shownAt), severity: choice.severity,
      });
      persist();
    }
    render();
  }

  function skip() {
    if (state.screen !== 'point' || state.chosen) { return; }
    const point = pointAt();
    if (!(point.id in state.picks)) {
      state.picks[point.id] = 'none';
      announce({
        id: point.id, type: 'performance', response: 'none', result: 'wrong',
        latency: latencyFrom(performance.now() - state.shownAt),
      });
      persist();
    }
    next();
  }

  function why() {
    if (!state.chosen) { return; }
    state.revealed = true;
    render();
  }

  function retry() {
    state.chosen = null;
    state.revealed = false;
    render();
  }

  function next() {
    state.chosen = null;
    state.revealed = false;
    const after = points.findIndex(({ point }, i) => i > state.at && !(point.id in state.picks));
    const left = after >= 0 ? after : points.findIndex(({ point }) => !(point.id in state.picks));
    if (left < 0) { show('debrief'); return; }
    state.at = left;
    show('point');
  }

  function end() {
    if (state.screen !== 'debrief') { return; }
    const box = root.querySelector('[data-commitment]');
    const words = box ? box.value.trim().slice(0, COMMITMENT_MAX) : '';
    if (words && !state.committed) {
      state.committed = announce({
        id: COMMITMENT_ID, type: 'fill-in', response: words, result: 'neutral',
        latency: latencyFrom(performance.now() - state.shownAt),
      });
    }
    state.screen = 'done';
    persist();
    finish();
    render();
  }

  // ---- the views ---------------------------------------------------------

  function header(title, line) {
    return el('header', { class: 'dg-head' },
      el('p', { class: 'dg-scene', text: line }),
      el('h2', { class: 'dg-title', tabindex: '-1', 'data-focus': true, text: title }));
  }

  function feedback(point) {
    const choice = choiceOf(point, state.chosen);
    if (!choice) { return el('div', { class: 'dg-side', 'aria-live': 'polite' }); }
    const last = points.every(({ point: p }) => p.id === point.id || p.id in state.picks);
    return el('div', { class: 'dg-side', 'aria-live': 'polite' },
      el('section', { class: 'dg-feedback', 'data-feedback': true, 'data-result': choice.result },
        el('p', { class: 'dg-result', text: RESULT_WORDS[choice.result] }),
        el('p', { class: 'dg-did' }, el('strong', { text: 'ما فعلته: ' }), choice.label),
        el('p', { class: 'dg-consequence', 'data-consequence': true },
          el('strong', { text: 'ما حدث: ' }), choice.consequence),
        state.revealed
          ? el('div', { class: 'dg-rule', 'data-rule': true },
            el('p', {}, el('strong', { text: 'القاعدة: ' }), choice.rule),
            choice.source ? el('p', { class: 'dg-source', text: `المصدر: ${choice.source}` }) : null)
          : null,
        el('div', { class: 'dg-actions' },
          state.revealed
            ? [
              el('button', { type: 'button', class: 'btn-secondary', 'data-act': 'retry', text: 'جرّب مرة أخرى' }),
              el('button', {
                type: 'button', class: 'btn-primary', 'data-act': 'next', 'data-focus': true,
                text: last ? 'إلى الخلاصة' : 'الموقف التالي',
              }),
            ]
            : el('button', { type: 'button', class: 'btn-primary', 'data-act': 'why', 'data-focus': true, text: 'لماذا؟' }))));
  }

  function pointView() {
    const { stage, point } = points[state.at];
    return el('div', { class: 'dg-point', 'data-point': point.id },
      el('div', { class: 'dg-main' },
        header(point.situation, `${stage.scene} · الموقف ${state.at + 1} من ${points.length}`),
        el('div', { class: 'dg-choices', role: 'group', 'aria-label': 'ماذا ستفعل؟' },
          point.choices.map((choice) => el('button', {
            type: 'button', class: 'dg-choice', 'data-choice': choice.id,
            disabled: Boolean(state.chosen), 'aria-pressed': state.chosen === choice.id ? 'true' : 'false',
            text: choice.label,
          }))),
        state.chosen ? null
          : el('button', { type: 'button', class: 'btn-ghost dg-skip', 'data-act': 'skip', text: 'تخطَّ هذا الموقف' })),
      feedback(point));
  }

  function rowsFor(picks) {
    return points.map(({ point }) => {
      const pick = picks[point.id];
      const choice = pick && pick !== 'none' ? choiceOf(point, pick) : null;
      const shown = choice || firstOf(point, 'correct') || point.choices[0];
      return {
        id: point.id, situation: point.situation, chosen: choice ? choice.label : null,
        rule: shown.rule, source: shown.source, result: choice ? choice.result : 'none',
      };
    });
  }

  function debriefView() {
    const done = state.screen === 'done';
    const commitment = content.commitment;
    return el('div', { class: 'dg-debrief' },
      header('خلاصة قراراتك', content.title),
      debrief(rowsFor(state.preview || state.picks)),
      commitment && !done
        ? el('label', { class: 'dg-commitment' },
          el('span', { text: commitment.prompt }),
          el('textarea', { 'data-commitment': true, rows: '2', maxlength: String(COMMITMENT_MAX) }))
        : null,
      done
        ? el('p', { class: 'dg-done', role: 'status', text: 'انتهيت. يمكنك المتابعة إلى الشريحة التالية.' })
        : el('button', { type: 'button', class: 'btn-primary', 'data-act': 'finish', text: 'إنهاء' }));
  }

  function introView() {
    return el('div', { class: 'dg-intro' },
      header(content.title, content.stages[0].scene),
      el('p', { text: `ستواجه ${points.length} من المواقف. في كل موقف، اختر ما ستفعله، ثم انظر ماذا حدث.` }),
      el('button', { type: 'button', class: 'btn-primary', 'data-act': 'start', 'data-focus': true, text: 'ابدأ' }));
  }

  /** Every choice's feedback in one grid, for a reviewer: moment=feedback-sheet. */
  function sheetView() {
    return el('div', { class: 'dg-sheet' },
      points.map(({ point }) => el('section', { class: 'dg-sheet-point' },
        el('h3', { text: point.situation }),
        point.choices.map((choice) => el('div', {
          class: 'dg-sheet-choice', 'data-sheet-choice': `${point.id}.${choice.id}`, 'data-result': choice.result,
        },
        el('p', { class: 'dg-did' }, el('strong', { text: `${RESULT_WORDS[choice.result]}: ` }), choice.label),
        el('p', {}, el('strong', { text: 'ما حدث: ' }), choice.consequence),
        el('p', {}, el('strong', { text: 'القاعدة: ' }), choice.rule),
        choice.source ? el('p', { class: 'dg-source', text: `المصدر: ${choice.source}` }) : null)))));
  }

  const VIEWS = { intro: introView, point: pointView, debrief: debriefView, done: debriefView, sheet: sheetView };

  function render() {
    const hadFocus = root.contains(document.activeElement);
    root.setAttribute('data-screen', state.screen);
    root.replaceChildren(VIEWS[state.screen]());
    // Focus follows the screen for a keyboard or screen-reader learner, and
    // only when it was already inside the game: a render must not pull the
    // page's focus from somewhere else.
    if (hadFocus) {
      const target = [...root.querySelectorAll('[data-focus]')].pop();
      if (target) { target.focus(); }
    }
  }

  // ---- what a press does -------------------------------------------------

  root.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button') : null;
    if (!target || target.disabled || !root.contains(target)) { return; }
    if (target.dataset.choice) { choose(target.dataset.choice); return; }
    const act = target.dataset.act;
    if (act === 'start') { start(); }
    if (act === 'skip') { skip(); }
    if (act === 'why') { why(); }
    if (act === 'retry') { retry(); }
    if (act === 'next') { next(); }
    if (act === 'finish') { end(); }
  });

  // ---- the platform's hooks, and a returning learner ---------------------

  registerTest({
    decisions: () => points.map(({ point }) => ({ id: point.id, choices: point.choices.map((c) => c.id) })),
    play: async (path) => {
      state.preview = null;
      if (state.screen === 'intro' || state.screen === 'sheet') { start(); }
      while (state.screen === 'point') {
        const point = pointAt();
        if (!state.chosen) {
          const choice = path === 'skip' ? null : pickFor(point, path);
          if (!choice) { skip(); continue; }
          choose(choice.id);
        }
        why();
        next();
      }
      // The commitment is the learner's own words: a play never invents them.
      if (state.screen === 'debrief') { end(); }
    },
    moment: async (name) => {
      // A moment is a picture: it chooses nothing, reports nothing, saves nothing.
      state.preview = null;
      if (name === 'start') { show('intro'); return; }
      if (name === 'feedback-sheet') { show('sheet'); return; }
      if (name === 'debrief') {
        state.preview = Object.fromEntries(points.map(({ point }) => [point.id,
          state.picks[point.id] || (pickFor(point, 'wrong') || { id: 'none' }).id]));
        show('debrief');
        return;
      }
      const at = points.findIndex(({ point }) => firstOf(point, 'wrong'));
      state.at = at < 0 ? 0 : at;
      state.screen = 'point';
      state.chosen = (firstOf(pointAt(), 'wrong') || pointAt().choices[0]).id;
      state.revealed = false;
      show('point');
    },
  });

  onRestore(({ done, progress }) => {
    // Only a point the host says was reported, with a choice the content still
    // has: an edited choice is played again and, already reported, not re-sent.
    const raw = progress.picks && typeof progress.picks === 'object' ? progress.picks : {};
    state.picks = {};
    for (const { point } of points) {
      const pick = raw[point.id];
      if (done.includes(point.id) && (pick === 'none' || (typeof pick === 'string' && choiceOf(point, pick)))) {
        state.picks[point.id] = pick;
      }
    }
    state.committed = done.includes(COMMITMENT_ID);
    const allPicked = points.every(({ point }) => point.id in state.picks);
    if (progress.finished === true && allPicked) {
      state.screen = 'done';
      render();
      finish();
      return;
    }
    if (Object.keys(state.picks).length) { start(); }
  });

  render();
}

if (typeof document !== 'undefined') { boot(); }
