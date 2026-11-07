# games/catch: the catch game

**Purpose.** Quick recognition under a little pressure: tell what is safe from
what is a hazard, and act on it at once. Cards fall in three lanes; the learner
moves a character to stand under a card to catch it, or out of its way to let it
pass. Catch the safe ones, let the hazards pass. A hazard caught costs a heart,
and its rule comes up on the field. A debrief closes the game, one row per card:
what the learner did, the rule, and «المصدر: …».

**Audience.** Children and adults. It suits safety, online-safety, hygiene and
procedure lectures where the outcome is "knows it when they see it". Arabic
first (RTL), touch first. A tap on a lane, the arrow keys, or Tab and Enter all
play it. Sound is off until the learner turns it on.

## Where it comes from

Adapted from **dsh-game-studio's `collector` template** (MIT; notice below). It
keeps collector's feel:

- a character the learner moves;
- hearts, a timer, a score;
- a burst on a catch, a shake and a flash on a hit, a floating «+1»;
- start, win and lose screens.

The three pictures in `assets/` (hero, item, background) are collector's own
artwork; `item.svg` was its `pickup.svg`.

**What learning changed.** Collector's enemies chase the hero forever, so "let it
pass" has no moment. Here every item is a **card that falls once** and has
exactly one outcome: caught, or passed below the character. That gives one
report per item, the first outcome only, and lets the platform play the game the
same way every time. Every card wears **the same picture**, because a picture
per kind would give the answer away; collector's enemy art is not used. The
game is drawn as elements, not on a canvas, so a lecture's `deck.css` restyles
it and Arabic is shaped by the browser. Lanes are placed by a seeded generator
keyed by the items' ids, so the same content always falls the same way.

## Content

`content.schema.json` is the shape, with a description per field;
`sample.json` is neutral Arabic content in that shape. The words live only in
the slide's content block; outcome codes live only on the page's rows
(`data-measures`).

```
title
items[]     id (a data-question-id row), label, kind (safe|hazard), rule, source
slots?      hero, item, background: "../assets/<file>" pictures of the lecture
```

## What it reports

Through the core's events:

- **one `performance` answer per item**, the first outcome only: `response` is
  `caught` or `passed`, `result` is `correct` when that fits the kind (a safe
  card caught, a hazard passed) and `wrong` otherwise, and `latency` is the
  time from when the card appeared;
- every item the learner never met (a round lost, or left before the end) is
  reported `response: "none"`, `result: "wrong"` when the debrief opens;
- a replay after the first round is practice and reports nothing;
- progress (`engine:save`): each item's outcome, so a returning learner on
  SCORM continues with the cards that are left; `engine:done` when they finish.

`game.json` declares three test settings: `duration` (3–120 s, the length of a
round), `lives` (1–5 hearts) and `sheet` (the feedback sheet's page). It also
declares three picture slots: `hero` and `item` (256×256, transparent) and
`background` (512×512 tile, opaque). It states a weight of 30 KB gzipped, for
the game, the core and the sample together.

The platform's moments: `start`, `after-wrong` (the field the instant a hazard
was caught: a heart gone, the rule shown), `debrief`, and `feedback-sheet`
(every card, its kind, what to do with it, the rule and the source).

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
