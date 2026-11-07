# games/sequence: the sequence game

**Purpose.** Recall a procedure in its order, under pressure. The steps ride a
conveyor belt across the stage, shuffled, with decoys among them (cards worded
like steps that are not), and the learner builds the chain one step at a time:
the card that comes now, then the next. The belt never stops and grows faster
with every step placed; the clock runs; a wrong card costs a heart. A debrief
closes the game, one row per step: what the learner picked first for it, where
the step stands, the procedure's rule and «المصدر: …».

**Audience.** Children and adults. It suits any lecture whose outcome is "does
the steps in the right order": hygiene, first aid, safety drills, a form, a
lab routine. Arabic first (RTL: the chain fills from the right, the belt brings
cards from the right), touch first.

## How it plays

- **Start screen**, then the round. A score bar with hearts, points, the combo
  and the clock; a bar that drains; «الخطوة 3 من 6: أيّ بطاقة تأتي الآن؟»
  over the belt; the chain under it, the open slot breathing.
- **Three ways to pick a card**, none of them a drag only (WCAG 2.2 SC 2.5.7):
  tap it; drag it onto the open slot; or Tab to it and press Enter (a card
  holding the keyboard's focus slows the belt for the learner who uses it). A
  tap may wobble: a press becomes a drag only past 36 px of the slide, since
  the deck draws the slide at 0.3 to 0.9 of its size on a phone or a tablet.
  A tap picks on the click the browser sends; a wobble past the browser's own
  tap slop sends none, and then the lift picks, 120 ms later. One answer per
  tap, never two (`tests/sequence_touch_probe.mjs` sends real touches).
- **Catch it as it passes.** About four cards ride the belt at a time, so the
  right one is not always in view. Let it ride off the far end after it was
  on screen for two seconds of its turn and the clock loses three seconds and
  the combo breaks («فاتتك! −3 ث»). A pass is not a pick and reports nothing.
- **Right**: the card flies into its slot, sparks, `+10`. First-try rights in a
  row are a combo (`سلسلة ×2` … `×4`, more points each), and every third of
  them slows the belt for four seconds. The belt speeds up a little with each
  step placed («أسرع!»).
- **Wrong**: a heart, the stage shakes, the card wiggles red and goes back on
  the belt, and the learner is told what they did: a decoy shows its rule
  («… ليست من الخطوات»), a later step says it comes later -- never which card
  is right. Two wrong cards on one turn and the right card lights up: with
  three hearts that is one mistake before the end, a mercy and not slack.
- **Win** when the chain is complete (stars, points, mistakes, the longest
  combo, a time bonus); **lose** out of hearts («نفدت قلوبك») or out of time
  («انتهى الوقت»). Then the debrief, and «إنهاء» opens Next.
- Sound is off until the learner turns it on; P or Escape pauses; the round
  waits while the slide is off screen (`deckNav.onScreen`) or the tab hidden.

## Tuning, measured

The clock is 10 s plus 6 s per step (46 s for the sample's six); the belt
starts at 190 px a second and gains 12% per step placed. Measured on
2026-11-07 in Chromium with scripted learners who know the whole order and tap
the right card a set time after it is fully on screen (the sample, 1280x720):

| a card after | seconds left of 46 | passes |
|---|---|---|
| 0.6 s | 18 | 0 |
| 1.5 s | 16 | 0 |
| 2.5 s | 15 | 0 |
| 3.5 s | 2 | 1 |

So knowing the order wins, and reading slowly costs most of the clock. Waiting
for the right card to come round is part of every turn: about four of the
eight cards are in view at once. The first build gave 8 s per step on a belt
showing six cards, and a learner who made two mistakes still finished with
41 of 58 s left. Tried and dropped: 5 s per step, which lost the 3.5 s reader
on time with no mistake, and 150 px/s, which spent the clock waiting for the
card to come round.

## Content

`content.schema.json` is the shape, with a description per field;
`sample.json` is neutral Arabic content in that shape (washing hands). The
words live only in the slide's content block; outcome codes live only on the
page's rows (`data-measures`).

```
title
rule        the procedure as one rule: shown after play, never before
source      one citation for the procedure («المصدر: …»)
steps[]     id (a data-question-id row), label -- IN THE RIGHT ORDER, 3 to 10
decoys[]    id, label, rule -- cards that are not steps, 1 to 4
```

**Why the shape has `decoys`, beyond the plan's `steps`, `rule`, `source`.**
The reporting needs them. Each step is answered at its turn by the first card
picked, and with steps alone the last turn would offer one card: a step that
can never be answered wrong, and a platform play (`play=wrong`) that would have
to post an answer the belt never offered. A decoy rides the belt on every turn,
so every step has a wrong card a learner can really pick, and the platform's
wrong play is a path the game has. They also teach: a decoy is a mistake people
make, and picking it shows why not. Ids are one set across steps and decoys
(the game refuses a decoy sharing a step's id, loudly, as the core refuses bad
content), because an answer names the card that was picked.

## What it reports

Through the core's events:

- **one `performance` answer per step**, at its turn, the first pick only:
  `response` is the ASCII id of the card picked first -- the step itself, a
  later step, or a decoy -- `result` is `correct` only for the step itself,
  and `latency` runs from the moment the turn opened. A wrong card goes back on
  the belt and the turn stays open: what follows is practice, never a second
  row;
- **why an id per step and not SCORM 1.2's `sequencing` (`a,b,c`)**: the core
  announces ASCII ids only, `^[A-Za-z0-9_-]{1,64}$`, and a comma is not one --
  so every wire (SCORM 1.2, SCORM 2004, cmi5) carries the same bytes. A row per
  step also says WHERE the order broke («for step 3 they picked step 5 first»),
  which one whole-list answer cannot;
- every step never reached (a round lost, or left before the end) is reported
  `response: "none"`, `result: "wrong"` when the debrief opens;
- a replay after the first full round is practice and reports nothing;
- progress (`engine:save`): each step's first pick and how far the chain got,
  so a returning learner on SCORM finds the chain as they left it and goes on
  from the open slot; `engine:done` when they finish.

`game.json` declares three test settings: `duration` (3–300 s, the round's
clock), `lives` (1–5 hearts) and `sheet` (the feedback sheet's page). It
declares no picture slots: the belt, the cards and the chain are drawn from
base.css variables. It states a weight of 29 KB gzipped, for the game, the core
and the sample together. That figure moved twice, which is the opposite of
"stated before building". 24 KB was stated before building. It became 28 after
building, at 26.8 KB measured. It became 29 after the review's fixes (a tap
path for a real finger, the pass, a guarded restore, «إنهاء» in the debrief's
head) measured 29.0 KB. Most of that is code; the duplicated prose was cut
first.

The platform's moments: `start`, `after-wrong` (the belt frozen the instant a
decoy was picked on the third turn: a heart gone, its rule up, two steps in
the chain), `debrief`, and `feedback-sheet` (every step in its place, every
decoy and why it is not a step, the rule and the source).

## Where it comes from

`components/sequence-sort.html` (a list dragged into order and checked) gave
the learning: a procedure's order. The belt, the chain, hearts, the clock, the
passes, the combo and the juice are written for this game. The sound is not:
`tone()` and the hurt, win and lose effects are dsh-game-studio's collector
template's (`template/collector/game.js`), reached by way of the catch game,
and carry its MIT licence below. The seeded generator that shuffles the belt
is mulberry32 (public domain), keyed by the ids, so the same content plays the
same way in every render.

## Licence of the adapted parts

```text
MIT License

Copyright (c) 2026 ZSeven—W

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## The contract an agent follows

Written once, as `GAME_CONTRACT` in Scitter's `app/mcp_tools.py`, and handed out
with every game kind. It is not repeated here.
