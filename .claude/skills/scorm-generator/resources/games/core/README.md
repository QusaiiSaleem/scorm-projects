# games/core: the runtime every game shares

Every game in `games/` imports `../core/game-core.js` and `@import`s
`../core/game-core.css`. The core holds what no game should have to remember:
how content is read and refused, how a decision is announced once, how
progress is saved without browser storage, how the platform plays the game,
and the debrief. It is our own code (no third-party licence).

## How a game talks to its host

A game knows no host. It dispatches DOM events on `document`, and the host maps
them in one place (in Scitter that is the deck's `deck-nav.js`, which also adds
each answer's outcome codes from the page's `data-measures`):

| Event | Detail | Sent when |
|---|---|---|
| `engine:answer` | `{id, type, response, result, latency, severity?}` | a final decision, once per id per load |
| `engine:save` | `{text}`, text = `{"v":1,"done":[ids],"progress":{...}}` | after each decision, and at the end |
| `engine:restore` | `{text}` | dispatched BY the host when a returning learner's text comes back |
| `engine:done` | none | once, after the debrief and the commitment |

## The rules, kept by the core

- **Content is refused loudly.** `readContent(shape)` parses the page's
  `<script type="application/json" class="game-content">`, checks it against the
  game's shape (its `content.schema.json` without the descriptions: type,
  required, properties, items, enum, pattern, minLength, minItems, `x-points`),
  and checks that every point has a `[data-question-id]` row and every row a
  point. On the first failure it draws an Arabic box in `#game`, logs ONE
  console error naming the field or the id, and throws `GameContentError`; the
  game stops there and registers no test hooks.
- **Every id is ASCII**, `^[A-Za-z0-9_-]{1,64}$`, so SCORM 1.2, SCORM 2004 and
  cmi5 all carry the same bytes. `none` and `commitment` are reserved.
- **The first answer is the one reported.** `announce()` sends an id once per
  load; a retry is practice. A decision never made is response `none`, result
  `wrong`; its words «لم يُتَّخذ قرار» belong to the debrief only. No
  `weighting`, ever.
- **No localStorage, no sessionStorage.** `save(progress)` asks the host to
  keep it; `onRestore(fn)` hands it back with only the ids the current content
  still has, each counted as already announced. Register it while the module
  first runs: the host hands the text back at DOMContentLoaded.
- **Latency is `HHHH:MM:SS.SS`** (`latencyFrom(ms)`), SCORM 1.2's CMITimespan.
  The wrapper writes a 1.2 latency as given and converts this spelling itself
  for SCORM 2004 and cmi5 (`SCORMWrapper.toTimeinterval`), so it is the one
  spelling every wire takes. An ISO 8601 duration would be a type mismatch on
  1.2.
- **`finish()`** sends `engine:done` once.

## The platform's hooks

`registerTest({decisions, play, moment})` sets `window.engineGame.test`:

- `decisions()`: the points and their choices;
- `play(path)`: `right`, `wrong` or `skip`, through the game's own functions;
- `moment(name)`: `start`, `after-wrong`, `debrief` or `feedback-sheet`, a
  picture that chooses, reports and saves nothing.

There is no `state()`: the host watches `engine:done` and its own Next button.
Scitter's shot worker calls these hooks for `render_slide(query="play=…")` and
`query="moment=…"`, and the release plays every game slide right, wrong and
after a reload.

## Other exports

`debrief(rows)` draws one row per point (`اختيارك: …`, the rule, `المصدر: …`).
`el(tag, attrs, ...children)` builds elements from text only, never HTML.

## The contract an agent follows

The game contract an agent building a game must follow is written once, as
`GAME_CONTRACT` in Scitter's `app/mcp_tools.py`, and handed out with every game
kind by `get_template`. It is not repeated here.
