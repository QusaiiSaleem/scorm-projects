# games/catch: the catch game

**Purpose.** Quick recognition under pressure: tell what is safe from what is
a hazard, and act on it at once, while something chases you. Word cards appear
on a meadow and fade after a few seconds; the learner walks to a safe card to
catch it and leaves a hazard until it fades, all while keeping away from the
chasers. Catching a hazard costs a heart and its rule comes up on the field; a
chaser's touch costs a heart too. A debrief closes the game, one row per card:
what the learner did, the rule, and «المصدر: …».

**Audience.** Children and adults. It suits safety, online-safety, hygiene and
procedure lectures where the outcome is "knows it when they see it". Arabic
first (RTL), touch first: tap a card or a spot to walk there, drag on the
ground for the joystick, or use the arrow keys (WASD too). Sound is off until
the learner turns it on.

## Where it comes from

This is **dsh-game-studio's `collector` template, used whole and then edited
for learning** (MIT; notice below). Qusai, 2026-11-07: «dont simplifiy use it
then edit it to get the best value».

Kept from collector, as it was:

- its sections (rules, state, assets, audio, input, spawning, update, render);
- free movement with the keys and the press-and-drag joystick;
- enemies that come in from the edges and chase, keep apart, grow faster with
  time and are knocked back by a hit;
- hearts, the blink of invulnerability, the shield every few right acts with
  its dashed ring;
- particles, floating text, the screen shake, the sprites with their shadows
  and squish, the fallback shapes, the letterboxed 1280×720 world on a canvas;
- its four pictures in `assets/` (hero, enemy, background, and item, which was
  its pickup).

Edited for learning:

- **Collector's pickups are the content's word cards.** Every card wears the
  same picture; only its words say whether it is safe. A card stays a few
  seconds and fades: walked over is `caught`, faded untouched is `passed`. That
  gives each card one definite outcome, so one report per card.
- **Enemies carry no words.** A hit costs a heart and reports nothing; they are
  the pressure, not a decision.
- **Cards are buttons in the page over the canvas.** Arabic is shaped by the
  browser, a lecture's `deck.css` styles them, the contrast check measures
  them, and a tap or Tab and Enter on a card walks the character to it: a way
  to play without dragging (WCAG 2.5.7).
- The screens, the score bar, the debrief and colours from base.css variables
  are ours; everything collector drew from `Math.random` comes from a seeded
  generator keyed by the ids, so the same content plays the same way.

## Content

`content.schema.json` is the shape, with a description per field;
`sample.json` is neutral Arabic content in that shape. The words live only in
the slide's content block; outcome codes live only on the page's rows
(`data-measures`).

```
title
items[]     id (a data-question-id row), label, kind (safe|hazard), rule, source
slots?      hero, enemy, item, background: "../assets/<file>" pictures of the lecture
```

## What it reports

Through the core's events:

- **one `performance` answer per card**, the first outcome only: `response` is
  `caught` or `passed`, `result` is `correct` when that fits the kind (a safe
  card caught, a hazard passed) and `wrong` otherwise, and `latency` is the
  time from when the card appeared;
- every card the learner never met (a round lost, or left before the end) is
  reported `response: "none"`, `result: "wrong"` when the debrief opens;
- a chaser's hit reports nothing;
- a replay after the first round is practice and reports nothing;
- progress (`engine:save`): each card's outcome, so a returning learner on
  SCORM continues with the cards that are left; `engine:done` when they finish.

`game.json` declares four test settings: `duration` (3–120 s, the length of a
round), `lives` (1–5 hearts), `enemies` (0–8 chasers) and `sheet` (the
feedback sheet's page). It declares four picture slots: `hero`, `enemy` and
`item` (256×256, transparent) and `background` (512×512 tile, opaque). It
states a weight of 30 KB gzipped, for the game, the core and the sample
together.

The platform's moments: `start`, `after-wrong` (the meadow the instant a
hazard was caught: a heart gone, the rule shown, a chaser closing in),
`debrief`, and `feedback-sheet` (every card, its kind, what to do with it, the
rule and the source).

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
