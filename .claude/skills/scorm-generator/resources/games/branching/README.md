# games/branching: the branching game

**Purpose.** Judgment over several turns inside one slide. A story is told in
turns: each turn is a situation (a NODE) and two to four things the learner
may do; each choice moves a meter and decides what happens next, another node
or one of several endings. The learner acts, sees what came of it, and then
reads the rule and its source (consequence before rule). A debrief closes the
game: the first walk through the story step by step, and one row per node --
what the learner chose, the rule, «المصدر: …».

**Audience.** Adults and older pupils, wherever the outcome is "handles the
situation well when it unfolds": customer service, safety procedures, ethics,
first response, a difficult conversation. Arabic first (RTL); touch first; a
keyboard path for everything (Tab and Enter, or the number keys 1-9 and their
Arabic forms for the choices, P or Escape to pause). Sound is off until the
learner turns it on.

## What makes it a game, not a quiz

It is the engine's own `components/branching-scenario.html` used whole and
given stakes. Kept from the component: the scene graph (a choice leads to
another scene or an ending), the several endings, the trail of the steps taken
(its breadcrumb), the word-by-word telling of each scene, a person beside the
words, «جرّب مرة أخرى» after an ending. Added for play:

- **A meter at stake, and it bites.** The content names it («ثقة العميل»,
  «سلامة الفريق»). It starts at 50 of 100; a right choice raises it by 10, a
  hesitant one (`neutral`) lowers it by 10, a wrong one by 25 -- so two wrong
  acts in a row empty it, and at 0 the story ends on the spot, with an ending
  of the game's own («انتهت القصة مبكرًا»).
- **The meter changes the story, not only the stars.** A node may name an
  ending in `leave`: a learner who arrives there with the meter under 35 (its
  «منخفض» band, a dashed line on the bar) never enters it -- the story goes to
  that ending instead («نفد صبره»), and the ending says the meter did it. The
  sample's check-up node does this: hesitate and slip once on the way and the
  customer leaves before you start.
- **A clock on every turn.** 20 seconds to think, or 0.8 s a word of the
  node's text and choices when that is longer (a slow reader is not punished
  for reading; `clock=` fixes it), a ring that empties; once it has run out
  the meter drains (5 a second) until the learner chooses, with a tick and
  «أسرِع!». The learner can switch the clock off before starting, and that is
  saved; they can pause at any time (WCAG 2.2 SC 2.2.1); it waits while the
  slide is off screen (`deckNav.onScreen`) and in a hidden tab.
- **Each turn answers at once.** The meter's fill slides and its number
  floats off it (+10, −25), the stage shakes on a wrong act and throws sparks
  on a right one, the person in the story hops or wobbles, leans with the
  meter's level and wears its mood as a mark beside the face (♥ high, ؟
  middle, ! low: a shape and a word in the meter, never colour alone), a
  short tone plays (when sound is on); then what happened, then -- after a
  beat -- the rule. The placeholder face is plain on purpose, so the mark and
  the motion carry the mood whatever picture a team puts in the slot.
- **Endings that score.** Stars from the meter (three at 75 or more, two at
  45, one above 0), the endings found so far («اكتشفت 1 من 5 نهايات»), and how
  many situations are still unseen (a node the clock ran out on was met, and
  is named instead: «… قبل أن تختار»). «جرّب طريقًا آخر» replays the story from
  the top with the meter back at its start; it is the primary button until
  an ending is good AND nothing is unseen, because «إلى الخلاصة» settles the
  unseen nodes as wrong.
- **Seeded order.** Each node's choices are shuffled on screen, seeded by its
  ids, so the right one is not always first and is always in the same place.

## Content

`content.schema.json` is the shape, with a description per field;
`sample.json` is neutral Arabic content in that shape (a customer at a help
desk). The words live only in the slide's content block; the outcome codes
live only on the page's rows (`data-measures`).

```
title
meter       label: what is at stake
start       the id of the first node
nodes[]     id (a data-question-id row), title, speaker?, text, leave?, rule,
            source,
            choices[] id, label, result (correct|wrong|neutral), consequence,
                      next (a node's id or an ending's id)
            leave: an ending's id, taken instead of this node under 35
endings[]   id (never a node's), title, text, tone (good|mixed|bad)
slots?      character, scene: "../assets/<file>" pictures of the lecture
```

**A story that cannot be told is refused,** like content that does not fit its
shape (the core's rule): a choice whose `next` names no node and no ending, a
`start` that is no node, an ending wearing a node's id, a `leave` that names
no ending, or a part of the story
from which no ending can be reached (a learner there could never finish, and
Next would never open). An Arabic box on the stage, one console error naming
the field, and no test hooks. A node no path reaches is allowed, with a
console warning: it will always be reported as no decision.

## What it reports

Through the core's events:

- **one `performance` row per node**, the FIRST answer only: `response` the
  choice's ASCII id, `result` the choice's own, `latency` from when the node
  came on screen;
- a replay is practice for every node already reported, and says so on screen
  («تدريب: أجبت عنه من قبل، فلا يُحسب»); a node a replay meets for the first
  time is reported then, its first answer like any other;
- **every node never reached is reported `response: "none"`, `result:
  "wrong"` when the debrief opens** -- a decision never made, «لم يُتَّخذ قرار»
  in the debrief -- so every declared row has exactly one row before
  `engine:done`. The meter running out on a node leaves that node unanswered
  too;
- endings report nothing;
- progress (`engine:save`, about a kilobyte at most): every node's first
  answer, where the learner is and the meter there, the replay count, the
  endings found, and THE PATH -- `path` the first walk's steps as
  `node.choice`, `end` the ending it reached ('' when the meter ran out). A
  returning learner on SCORM continues at the node they left, with their
  meter; one who left while reading an outcome comes back to that outcome --
  the choice already made and reported, the meter moved once, «تابع» going
  where THAT choice leads -- never to the node again as practice, which would
  let the story and the saved path take a branch the LMS never recorded. A
  meter that ran out stays out after a reload, and the ending remembers the
  node it ran out on. cmi5 keeps no saved object and the story opens fresh.

**Why `performance` and not `choice`.** SCORM 1.2 spells a choice answer as
single characters a-z / 0-9 (RTE 3.4, `cmi.interactions.n.student_response`),
and the core's answer for a decision never made is `none`, four characters,
so a row typed `choice` could not carry the core's own rule on that wire.
`performance` is CMIFeedback on 1.2, `[.]<answer>` on 2004 and a plain string
on cmi5: the same ASCII id on all three, as the decision and catch games send.

**Why the path is not on the wire.** It belongs in each answer's
`extensions`, and the core's `announce()` carries none; until it does, the
path is in the saved progress and on the debrief.

**What the score means, said out loud.** Every node is a reported point, so a
learner who walks one path and never replays is scored over every node, the
ones they never met counted wrong. So the ALL-RIGHT walk must meet every
node: the choice marked correct at each node leads on through all of them,
and wrong choices skip ahead, end the story, or lower the meter until a
`leave` turns it. Then a flawless single walk scores full marks, and only a
learner who erred misses nodes. The game warns in the console when the
all-right walk misses a node (render_slide hands that to the agent as a
finding). The sample walks n1 to n5 on its right path. Whether a node never
met should count wrong at all, or be recorded and not scored (`neutral`), is
a core rule and Qusai's call; this game follows the core.

`game.json` declares three test settings: `clock` (3-120 s, a turn's
thinking time), `meter` (1-100, where the meter starts) and `sheet` (the
feedback sheet's page). It declares two picture slots: `character` (256x256,
transparent; a person from the waist up) and `scene` (1280x720, opaque; the
place). Its weight is 30 KB gzipped, for the game, the core and the sample
together (measured 30,158 bytes of 30,720 after the review's fixes). **Said
plainly: 26 KB was stated before building; the game was built at 29.4 KB
(the HUD's meter and clock, the trail, the replay and the story's checks are
more code than that estimate counted, after the shipped comments were cut
down to this README) and the budget was revised once, to catch's 30.**

The platform's moments: `start`, `after-wrong` (the first node with a wrong
choice, the instant after it was chosen: the meter down, what happened, the
rule), `debrief`, and `feedback-sheet` (every node and every choice: its
words, its result and how far it moves the meter, where it leads, what it
did, the node's rule and source). `play(path)` goes through the game's own
`record()` and never the story's links: every node not yet reported, in the
page's order, takes its first choice of that result (`skip` takes none), then
the debrief and the end.

## Layout

The 1280x720 stage holds one turn in one column: the score bar (meter, count,
clock, sound, pause), the trail of this walk's steps, and the scene -- the
`scene` picture behind, the person at the inline start (the right in Arabic,
who speaks first) and the story card beside them, choices under the words.
After a choice the card holds the outcome in place of the choices. Every word
sits on an opaque surface in the text colour: green, red and amber are fills
and borders, never text (the success green on white is 2.54:1). A moment is
drawn still (`[data-still]`): no word-by-word fade, no sparks, no clock.

## The contract an agent follows

Written once, as `GAME_CONTRACT` in Scitter's `app/mcp_tools.py`, and handed out
with every game kind. It is not repeated here.
