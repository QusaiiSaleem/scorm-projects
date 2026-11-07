# games/hotspot: the hotspot game

**Purpose.** Notice what matters. A scene picture (a kitchen, a workshop, a
street, a screen) is dark, and the learner searches it with a flashlight. The
words of each thing in the scene show only where the light falls; the learner
presses every HAZARD they find. Ordinary things in the same scene, the DECOYS,
cost a heart when pressed. **The picture decides, never the words:** a label
names the thing only («علبة دواء»), never its state («مفتوحة»), and each
hazard has a SAFE TWIN among the decoys -- the same thing done right,
elsewhere in the scene, which may wear the same words -- so the learner has
to look at what the light shows to tell them apart. Labels that state the
risk turn the game into reading one sentence at a time. The flashlight's battery is the clock, and its
light narrows and flickers as the battery runs down. Finds in a row build a
streak; a find bursts, floats its points and leaves its spot glowing; a decoy
shakes the scene. When every hazard is found, or the battery or the hearts run
out, the round ends, and every hazard not found shows where it was. A debrief
closes the game: the scene with each hazard numbered, and one row per hazard
with what the learner did, the rule and «المصدر: …». The end screen
rings each hazard: green where it was found, red where it was missed.

**Audience.** Children and adults. It suits safety, hygiene, inspection and
"spot the risk" lectures, where the outcome is "notices it in a real place".
Arabic first (RTL), touch first: move the light with a finger, the mouse or
the arrow keys. A finger has no hover, so its first tap on a spot in the dark
brings the light there and shows the spot's words, and the next tap presses
it; a mouse press counts at once. A press that ends on the spot it began on
counts however much the finger wobbled; one that slid off it only moved the
light. Tab reaches every spot in reading order (hazards and decoys
interleaved, so the order tells nothing) and Enter presses it; Enter on the
open scene presses the spot under the light. Dragging the light is never
needed (WCAG 2.2 SC 2.5.7). The words identify a thing and never answer for
it, which is SC 1.1.1's case of a test that text would invalidate. Sound is
off until the learner turns it on.

## Where it comes from

It grows out of the engine's `hotspot` and `hidden-object` components (a
picture with regions to find, a found count, a wrong press that shakes), made
into a game: the darkness and the flashlight, the battery, hearts, streaks,
the start, end and debrief screens. Its juice is **dsh-game-studio's
`collector`** as the catch game carries it (MIT; notice below): the WebAudio
bleeps, the particles, the floating text, the screen shake, and the seeded
generator (mulberry32, as dsh's `voxel` seeds its island), so the same content
draws the same bursts in every render.

## Content

`content.schema.json` is the shape, with a description per field;
`sample.json` is neutral Arabic content in that shape, placed on the
placeholder scene `assets/scene.svg`, where each of the five hazards has its
safe twin (a saucepan whose handle lies over the counter, a socket with one
plug, medicine closed on a high shelf, knives in their block, water with a
sign beside it); a twin's `why` is what a learner who pressed it reads. The
words live only in the slide's
content block; outcome codes live only on the page's rows (`data-measures`),
one row per hazard and none for a decoy.

```
title
brief       the place, in a sentence; also what a screen reader says the picture shows
hazards[]   id (a data-question-id row), label, x, y, r, rule, source
decoys[]    id, label, x, y, r, why?      (never reported, no row)
slots?      scene: "../assets/<file>"     a picture of the lecture's own
```

**Where a spot is.** `x`, `y` and `r` are fractions of the scene picture, so
any picture of any size takes the same content: `x` from the picture's LEFT
edge (a picture is not mirrored for Arabic) and `y` from its top, both 0 to 1;
`r` the spot's radius as a fraction of the picture's width, 0.02 to 0.25. Keep
each circle wholly inside the picture (in its height the radius is `r` times
width over height), or its edge is cut off. A new picture needs new spots. The core checks shapes and not ranges, so the
game itself refuses a spot off its picture, and a decoy whose id is a
hazard's, the core's way: an Arabic box on the stage and one console error.

## What it reports

Through the core's events:

- **one `performance` answer per hazard**, the first outcome only: `found`
  (result `correct`, latency the time it took to find) when the learner
  presses it, or `missed` (result `wrong`, latency the time searched) for
  every hazard still unfound when the round ends;
- a hazard no round ever held (the learner opened the debrief before playing,
  or the platform's `skip`) is reported `response: "none"`, `result: "wrong"`
  when the debrief opens;
- a decoy reports nothing: it costs a heart;
- a replay after the first round is practice and reports nothing;
- progress (`engine:save`): each hazard's outcome, so a returning learner on
  SCORM continues with the hazards that are left, their finds still glowing;
  `engine:done` when they finish.

`game.json` declares three test settings: `duration` (5–180 s, the battery),
`lives` (1–5 hearts) and `sheet` (the feedback sheet's page). It declares one
picture slot, `scene` (1600×900, opaque). It states a weight of 32 KB
gzipped, for the game, its placeholder scene, the core and the sample together.

The platform's moments: `start`, `after-wrong` (the scene the instant a decoy
was pressed: a heart gone, the light on it, its words up), `debrief`, and
`feedback-sheet` (every hazard and decoy, numbered on the scene: what it is,
what to do with it, a hazard's rule and source).

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
