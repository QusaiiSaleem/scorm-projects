# games/decision: the decision game

**Purpose.** Practise applying a rule in a situation the learner will meet.
The learner reads a situation, chooses what to do, and first SEES WHAT THE
CHOICE DID (the consequence); one more press («لماذا؟») shows the rule and its
source. The feedback names the behaviour, in the choice's own words, never the
learner. A retry is allowed and is practice. A debrief closes the game with one
row per situation: what the learner chose, the rule, and «المصدر: …». An
optional commitment line asks what they will do next time.

**Audience.** Adult and young-adult learners in workplace, safety, conduct and
procedure training; any lecture whose outcome is a behaviour in a situation
rather than a fact to recall. Arabic first (RTL), touch first, every control a
native button, so it is played the same with a mouse, a finger or a keyboard.

**Where it comes from.** The look of `components/decision-sim.html` (scenario
card, full-width option buttons, the review list), laid out for the 1280x720
stage: the situation and the choices on one side, what happened on the other.
The content shape is the Nibras shield game's shape with neutral content of our
own.

## Content

`content.schema.json` is the shape, with a description per field; `sample.json`
is neutral Arabic content in that shape, which the page starts with. The words
live only in the slide's content block; outcome codes live only on the page's
rows (`data-measures`), never in the content.

```
title
stages[]       id, scene
  points[]     id (a data-question-id row), situation
    choices[]  id, label, result (correct|wrong|neutral), severity? (high|medium|low),
               consequence, rule, source
commitment?    prompt
```

## What it reports

Through the core's events, for the host to put on its wire:

- **one `performance` answer per point**, the first answer only: `response` is
  the choice's ASCII id, `result` its result, `severity` when the choice has
  one, `latency` from when the situation came on screen (`HHHH:MM:SS.SS`);
- a point skipped («تخطَّ هذا الموقف») reports `response: "none"`, `result:
  "wrong"`;
- the commitment, when the learner wrote one, as a `fill-in` with id
  `commitment` and their words as the response (at most 250 characters, under
  SCORM 1.2's 255);
- progress (`engine:save`): the points answered and the choices made, so a
  returning learner on SCORM comes back to the situation they left; `engine:done`
  when they finish.

Any amount of content plays: the core's stage scrolls, a new situation opens
at its top, and what a choice did is brought on screen.

`game.json` declares one test setting, `sheet` (a whole number from 1), and no
picture slots. `moment=feedback-sheet` photographs every choice of every point
-- the behaviour, what happened, the rule, the source -- a page of the stage at
a time: as many whole points as one 1280x720 picture holds, measured. The head
says «الصفحة ك من ن» and the query for the next page (`sheet=2`); the first
page by default, the last for a number past it. Its `weight_kb` (16) is the
gzip of every file a learner's browser fetches for this game, this folder's
and `games/core/`'s together, stated before the game was built.

## The contract

An agent building a lecture with this game follows `GAME_CONTRACT` in Scitter's
`app/mcp_tools.py`, which `get_template` hands out with the page. It is written
there once and not copied here.
