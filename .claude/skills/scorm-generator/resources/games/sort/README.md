# games/sort: the sort game

**Purpose.** Tell concepts apart under a little pressure: which group does
each thing belong to? It is a sorting line. A hopper throws items onto a belt,
they ride toward a drop at its far end, and the learner sends each one into
the bin it belongs in before it falls, the one nearest the drop first. A right
bin gulps the item, the points float up and a streak builds: every three right
in a row multiplies the points. Sorting right AND quickly heats the line: the
belt speeds up to the learner's own pace and the hopper throws three at once.
A wrong bin shakes, costs a heart, lights the right bin and shows the rule; an
item that falls costs a heart too. Three stars for a clean round, then a
debrief, one row per item: where the learner put it, the rule, and
«المصدر: …».

**Audience.** Children and adults. It suits any lecture where the outcome is
"can classify": materials, risks, types, categories, examples and non-examples,
fact and opinion. Two to four bins. Arabic first (RTL), touch first, sound off
until the learner turns it on.

## Where it comes from

The engine's `drag-drop` and `matching-dropdown` components, **tap to place,
made a game**. Those put every item on the page at once and wait. Here:

- the **belt is the clock**: an item rides it for about eight seconds. The
  hopper, not the learner, decides when items come: two at a time, thrown
  onto spots a card apart, so there is always one to sort first; the next
  throw comes a moment after the belt empties, or seven seconds after the last
  while items still ride;
- **the line follows the learner's pace**: a send into the right bin within
  1.75 s of the item lighting up is quick, and two quick right sends in a row
  make the line hot («الخط يُسرع!»). A hot belt eases toward the speed at
  which the hopper feeds as fast as the learner sorts (at most 2.2 times the
  plain speed), and the hopper throws three at once whenever three fit. A
  learner who sorts in a second meets three on the belt and averages 1.7; one
  who needs three seconds an item keeps the plain line, never more than two
  on it, and still sorts everything (both measured in a real browser by the
  game's tests). A wrong bin, a fall or a slow send cools the line at once;
- **hearts are the stakes**: three, lost to a wrong bin or a fall;
- **a streak is the reward**: ×2 after three right in a row, ×3 after six;
- **juice**: the hopper jolts and throws, items bob on the belt and flash near
  the drop; a bin gulps or shakes; sparks, floating points and a lost heart, a
  shaken screen, a breaking heart, and stars at the end.

Our own code; no third-party licence.

## How a learner plays

Every way reaches the same act (WCAG 2.2 SC 2.5.7: a drag is never the only
way):

- the item nearest the drop is the **active** one, ringed and with an arrow
  over it; a tap on another item on the belt makes that one active;
- «إنهاء» at the end of the debrief stays on screen while a long debrief
  scrolls under it;
- a **tap on a bin** sends the active item there;
- a **drag** of an item onto a bin does the same;
- from the **keyboard**: Tab to a bin and Enter or Space, or press the bin's
  number (1 to 4, written on the bin) wherever the focus is -- the digit row's
  key on any layout, and an Arabic-Indic digit (١ to ٤) too. P or Escape
  pauses, M toggles the sound.

An id is the content's, so `constructor` or `__proto__` is as good as any:
every map the game keys by id has no prototype and is read by own key.

## Content

`content.schema.json` is the shape, with a description per field;
`sample.json` is neutral Arabic content in that shape (sorting household
waste). The words live only in the slide's content block; outcome codes live
only on the page's rows (`data-measures`).

```
title
bins[]      id (the answer the LMS receives), label            2 to 4
items[]     id (a data-question-id row), label, bin (a bins[].id), rule, source
```

An item whose `bin` names no bin, or more than four bins, is refused at start
the core's way: an Arabic box on the stage and one console error naming it.

## What it reports

Through the core's events:

- **one `performance` answer per item**, the first outcome only: `response` is
  the ASCII id of the bin it was sent to, `result` is `correct` when that is
  the item's own bin and `wrong` otherwise, and `latency` is the time from when
  the item came onto the belt to when it was sent;
- an item that **falls** off the end is a decision never made: `response:
  "none"`, `result: "wrong"`, the moment it falls;
- every item the learner **never met** (a round lost, or left before the end)
  is reported `none`/`wrong` when the debrief opens;
- a replay after every item has an outcome is **practice** and reports
  nothing;
- progress (`engine:save`): each item's outcome, so a returning learner on
  SCORM continues with the items that are left; `engine:done` when they
  finish.

`game.json` declares three test settings: `duration` (3–120 s, the longest a
round lasts: the belt and the gaps between throws are squeezed into it), `lives`
(1–5 hearts) and `sheet` (the feedback sheet's page). It declares no picture
slots: the line and its bins are drawn from base.css variables. It states a
weight of 29 KB gzipped, for the game, the core and the sample together.

The platform's moments: `start`, `after-wrong` (the line frozen the instant an
item landed in the wrong bin, through the same landing a learner's wrong bin
goes through: the bin shaking and counting it, the right one lit, a heart
gone, the rule shown, the next items riding on), `debrief`, and `feedback-sheet`
(every item, the bin it belongs in, the rule and the source).

## The contract an agent follows

Written once, as `GAME_CONTRACT` in Scitter's `app/mcp_tools.py`, and handed out
with every game kind. It is not repeated here.
