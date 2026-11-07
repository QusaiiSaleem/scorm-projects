# games/catch3d: the catch game, on a 3D island

**Purpose.** The same practice as `games/catch` -- tell what is safe from what
is a hazard and act on it at once, while something chases you -- on a small
voxel island seen from above. Word cards rise over lanterns and, after a few
seconds, the lantern goes out: the learner walks to a safe card to catch it
and leaves a hazard until it goes out, keeping away from the chasers.
Catching a hazard costs a heart and its rule comes up; a chaser's touch costs
a heart too. A debrief closes the game, one row per card: what the learner
did, the rule, and «المصدر: …».

**Same words, same reports as catch.** The content block, the page's rows,
the settings and the picture slots are catch's, field for field, so a lecture
switches between the flat meadow and the island by changing the game's two
links and nothing else (Scitter's `test_catch3d_shares_catchs_content_unchanged`
plays catch's own page this way).

**Audience.** Children and adults; safety, online-safety, hygiene and
procedure lectures where the outcome is "knows it when they see it". Arabic
first (RTL), touch first: tap a card or a spot on the island to walk there
(the character finds its way round trees and rocks), drag on the island for
the joystick, or use the arrow keys (WASD too). Sound is off until the
learner turns it on.

## Where it comes from

This is **dsh-game-studio's `voxel` template ("Lantern Isle"), used whole and
then edited for learning** (MIT; notice below), on **three.js**, which lives
once in `../three/` (MIT; its own README). Qusai, 2026-11-07: «dont simplifiy
use it then edit it to get the best value».

Kept from voxel, as it was:

- its sections (rules, renderer, helpers, island, characters, audio, input,
  update, camera, loop) and its palette;
- the seeded island: stacked blocks inside a noisy circle, sand at the shore,
  trees and rocks that block the way, water and a sea floor, a warm low sun
  with shadows, stars, a moon, fireflies;
- the characters built from boxes and merged into one mesh each (the hero,
  the chaser, the lantern), with blob shadows;
- the follow camera at its fixed angle, pulling back on a portrait screen;
- movement with the keys and the press-and-drag joystick, sliding along what
  blocks it;
- chasers that come in from the shore, keep apart and speed up with time;
  hearts and the blink of invulnerability; the shield bubble every few right
  acts, which sends the chasers away; the burst of sparks;
- a slot filled with the lecture's own picture: a character becomes a sprite
  facing the camera, the background tiles the ground;
- its four pictures in `assets/` (hero, enemy, item -- its pickup -- and
  background -- its ground), shown on the start and end screens and on the
  flat board.

Edited for learning (the same layer as `games/catch`):

- **Voxel's lanterns carry the content's word cards.** Every lantern looks the
  same; only the words say whether it is safe. A card stays a few seconds and
  its lantern goes out: walked over is `caught`, gone out untouched is
  `passed`, one definite outcome per card, so one report per card.
- **Chasers carry no words.** A hit costs a heart and reports nothing.
- **Cards are buttons in the page, projected over the 3D world every frame.**
  Arabic is shaped by the browser, a lecture's `deck.css` styles them, the
  contrast check measures them, and a tap or Tab and Enter on a card walks
  the character to it by a path the game finds over the island's cells: a way
  to play without dragging (WCAG 2.5.7). Cards and chasers stand only where
  the character can walk.
- **No card rises under the rule.** The rule after a mistake is opaque, and
  the follow camera carries cards up toward it; while it shows, a card's top
  is held under the rule's bottom edge, and new lanterns are placed below it.
  Held only at the score bar, a safe card sat under the rule for up to 3 s of
  its 6 s life and could fade there unread, as `passed`.
- **Keyboard focus follows the cards.** Start pressed from the keyboard leaves
  focus on the card group, the first card that rises takes it, and a decided
  card hands it to the next live card (or back to the group). Before, focus
  fell to the page and the first Tabs went to sound, pause and out of the
  document before reaching a card.
- The screens, the score bar, the debrief and every word on base.css
  variables (the sparks and the shield read them too); everything voxel drew
  from `Math.random` comes from a seeded generator keyed by the ids. The
  game's clock is the wall's (steps of at most 1/30 s), so a slow phone draws
  fewer frames and does not play a slower game.
- **Gone, because a lecture must not:** posting to the studio, its
  `__gameState` and `__renderSlots` hooks (and the second WebGL renderer),
  its best score in `localStorage`, sound on by default, "any key starts",
  and its HUD of white text on dark glass. One fix: voxel pushed the hero
  toward the chaser that hit it; it is pushed away.

**The island is built when a round starts** (or when the platform asks for
the `after-wrong` moment), never when the slide loads. The start screen, the
debrief, the feedback sheet and the platform's play are page elements, so a
slide that is only looked at -- a render, a release's plain pass, a deck
loading it two slides ahead -- draws no WebGL. three.js is fetched while the
learner reads the start screen.

**Without WebGL** (an old phone, a locked-down browser), Start shows voxel's
"this needs WebGL" screen in Arabic, and its button plays the same cards on a
flat board: a tap catches a card, a card left fades, the same hearts, clock
and reports. Every card still reaches the LMS once.

**A context lost mid-round** (iPad Safari takes WebGL back under memory
pressure) does not leave a blank island where unseen chasers still take
hearts. The round stops and reports nothing for itself: the cards met keep
their outcomes, and the same screen, worded for a loss, plays the rest on the
flat board for the rest of the page.

**«إنهاء» stays on screen.** Ten cards make the debrief taller than the
720 px stage, Next is held until «إنهاء» is pressed, and the stage's
scrollbar is an overlay a child may never see; the button is sticky at the
stage's foot while the rows pass under it.

## Content

`content.schema.json` is the shape (catch's, with a description per field);
`sample.json` is neutral Arabic content in that shape. The words live only in
the slide's content block; outcome codes live only on the page's rows
(`data-measures`).

```
title
items[]     id (a data-question-id row), label, kind (safe|hazard), rule, source
slots?      hero, enemy, item, background: "../assets/<file>" pictures of the lecture
```

## What it reports

Through the core's events, exactly as catch:

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

`game.json` declares catch's four test settings: `duration` (3–120 s, the
length of a round), `lives` (1–5 hearts), `enemies` (0–8 chasers) and
`sheet` (the feedback sheet's page). It declares catch's four picture slots:
`hero`, `enemy` and `item` (256×256, transparent) and `background` (512×512
tile, opaque). It states a weight of **240 KB gzipped** for the game, the
core, three.js and the sample together; three.js alone is about 185 KB of it.

The platform's moments: `start`, `after-wrong` (the island the instant a
hazard was caught: a heart gone, the rule shown, red sparks, a chaser closing
in -- the one moment that draws WebGL), `debrief`, and `feedback-sheet`
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

three.js's notice travels with it in `../three/README.md`.

## The contract an agent follows

Written once, as `GAME_CONTRACT` in Scitter's `app/mcp_tools.py`, and handed out
with every game kind. It is not repeated here.
