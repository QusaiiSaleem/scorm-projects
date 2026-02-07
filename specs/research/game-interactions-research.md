# Game-Like Interaction Patterns for Web-Based E-Learning

> Research compiled 2026-02-06 — Practical techniques for self-contained SCORM packages (no server needed)

---

## Table of Contents

1. [Point-and-Click Exploration](#1-point-and-click-exploration)
2. [Narrative Branching](#2-narrative-branching)
3. [Scroll-Driven Storytelling](#3-scroll-driven-storytelling)
4. [Mini-Games for Learning](#4-mini-games-for-learning)
5. [Gamification UI Systems](#5-gamification-ui-systems)
6. [Web Game Frameworks](#6-web-game-frameworks)
7. [Interactive Simulations](#7-interactive-simulations)
8. [Implementation Priority Matrix](#8-implementation-priority-matrix)
9. [Recommendations for SCORM Studio](#9-recommendations-for-scorm-studio)

---

## 1. Point-and-Click Exploration

### 1A. Room Exploration / Scene Discovery

**Description:** Learners explore a 2D environment (office, lab, warehouse, virtual room) by clicking on objects to discover information. Each clickable object triggers a popup, layer, or panel with learning content. This is the e-learning equivalent of a "hidden object" game — the learner must actively search the environment rather than passively read slides.

**How Storyline 360 Does It:** The Storyline "Room Exploration" template uses hotspots + triggers + layers. Learners use an on-screen flashlight metaphor to discover clickable areas. Each click reveals a new layer with content. An example: L'Artisan Parfumeur built an interactive apartment where each room focuses on a learning module, unlocked by completing quizzes.

**HTML/CSS/JS Implementation:**
- **Container:** A full-width background image (the "room") with absolutely-positioned clickable regions
- **Hotspots:** `<button>` elements with transparent/semi-transparent styling, positioned with CSS `position: absolute` + percentage-based coordinates for responsiveness
- **Reveal mechanism:** CSS classes toggled on click — show/hide `.info-panel` overlays
- **Progress tracking:** A simple counter (`3 of 7 discovered`) stored in a JS variable, written to `cmi.suspend_data`
- **Completion gate:** All objects must be discovered before the "Next" button enables

**Complexity:** LOW-MEDIUM — Pure HTML/CSS/JS, no Canvas needed

**E-Learning Mapping:**
- Orientation/onboarding courses ("Explore your new office")
- Safety training ("Find the hazards in this workplace")
- Product knowledge ("Discover features of our product")
- Historical/cultural exploration ("Explore this historical site")

**Code Pattern:**
```html
<div class="room-scene" style="background-image: url('room.jpg')">
  <button class="hotspot" style="left:25%; top:40%" data-target="panel-1" aria-label="Computer monitor">
    <span class="hotspot-pulse"></span>
  </button>
  <!-- More hotspots... -->
  <div class="info-panel" id="panel-1" hidden>
    <h3>Computer Security</h3>
    <p>Always lock your screen when stepping away...</p>
    <button class="close-panel">Got it</button>
  </div>
</div>
```

```css
.hotspot {
  position: absolute; width: 48px; height: 48px;
  border-radius: 50%; border: 2px solid rgba(255,255,255,0.6);
  background: rgba(255,255,255,0.15); cursor: pointer;
  animation: pulse 2s ease-in-out infinite;
}
.hotspot.discovered { border-color: var(--accent); opacity: 0.5; pointer-events: none; }
@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
```

---

### 1B. Flashlight / Spotlight Reveal

**Description:** A dark overlay covers the screen. A circular "flashlight" follows the mouse/touch cursor, revealing hidden content underneath. The learner must actively search by moving the flashlight beam around. Creates genuine discovery and curiosity.

**How It Works:** A CSS `clip-path: circle()` or SVG `<clipPath>` with a `<circle>` element is dynamically updated to follow `mousemove` / `touchmove` coordinates. The background layer contains the actual content; the foreground is a dark mask with the circular cutout.

**HTML/CSS/JS Implementation:**
- **Technique 1 (CSS):** Use `mask-image: radial-gradient(circle 80px at var(--mx) var(--my), black 100%, transparent 100%)` where `--mx` and `--my` are CSS custom properties updated by JS on mousemove
- **Technique 2 (SVG):** An SVG overlay with a `<rect>` fill + a `<circle>` cutout inside a `<mask>`, position updated via JS
- **Technique 3 (Canvas):** Draw a dark overlay on Canvas, use `globalCompositeOperation: 'destination-out'` to punch a circle at cursor position
- **Performance:** CSS clip-path is GPU-accelerated and most performant. Canvas fallback for older browsers.

**Complexity:** LOW — ~30 lines of JS + CSS

**E-Learning Mapping:**
- "Find the errors" exercises (proofreading, safety violations)
- Discovery-based learning (explore a diagram, find key concepts)
- Fun intro slides ("Shine the light to reveal today's topic!")
- Assessment: "Find all 5 hidden items" before proceeding

**Code Pattern:**
```js
const scene = document.querySelector('.flashlight-scene');
scene.addEventListener('mousemove', (e) => {
  const rect = scene.getBoundingClientRect();
  scene.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  scene.style.setProperty('--my', `${e.clientY - rect.top}px`);
});
```
```css
.flashlight-scene {
  position: relative;
}
.flashlight-scene::after {
  content: ''; position: absolute; inset: 0;
  background: rgba(0,0,0,0.92);
  mask-image: radial-gradient(circle 80px at var(--mx, 50%) var(--my, 50%), transparent 100%, black 100%);
  -webkit-mask-image: radial-gradient(circle 80px at var(--mx, 50%) var(--my, 50%), transparent 100%, black 100%);
  pointer-events: none;
}
```

---

### 1C. Hidden Object / Find the Difference

**Description:** Two similar images side-by-side (or overlapping with a slider). The learner must spot differences or find specific objects. Clicking correct items marks them; clicking wrong areas gives feedback.

**HTML/CSS/JS Implementation:**
- Two images with positioned hit-zones
- Click detection via coordinate comparison against predefined regions
- Visual feedback: CSS checkmark animation on correct finds, subtle shake on wrong clicks
- Timer optional for gamification

**Complexity:** LOW — Pure CSS/JS

**E-Learning Mapping:**
- Quality control training ("Find the defects")
- Compliance ("Spot what's wrong in this scenario")
- Before/after comparisons

---

## 2. Narrative Branching

### 2A. Choose-Your-Own-Adventure / Decision Trees

**Description:** Learners make choices at key points in a narrative. Each choice leads to a different branch with different consequences. Choices can lead to success, partial success, or failure — creating authentic learning from mistakes.

**References:**
- Twine (twinery.org) — Free, exports single HTML file
- Ink by Inkle Studios — Narrative scripting language with web export
- BranchTrack — Commercial branching scenario tool
- Stornaway.io — Video branching platform

**How Twine Works for E-Learning:** Twine exports a single self-contained HTML file with all passages, CSS, and JavaScript embedded. The SugarCube story format supports variables, conditionals, inventory systems, stat tracking, and dynamic text. Instructional designers use it for branching learning scenarios where learner choices matter.

**SCORM Integration Challenge:** Twine doesn't natively output SCORM. But since it's a single HTML file, it can be wrapped inside a SCORM SCO by:
1. Placing the exported HTML inside a SCORM package
2. Adding `scorm-api.js` calls to track completion and choices
3. Using SugarCube's `<<script>>` macro to call SCORM API at key decision points

**HTML/CSS/JS Implementation (native, no Twine):**
- **State machine:** A JS object maps `sceneId` → `{ text, choices: [{ label, nextScene, consequence }] }`
- **Renderer:** Reads current scene, renders narrative text + choice buttons
- **History:** Array of previous choices for review/scoring
- **Consequences:** Variables track outcomes (e.g., `trust += 1`, `budget -= 500`)
- **Ending evaluation:** Final score based on accumulated consequences

**Complexity:** MEDIUM — Requires content authoring + state management

**E-Learning Mapping:**
- Soft skills (customer service, conflict resolution, leadership)
- Compliance training (ethical dilemmas, policy scenarios)
- Sales training (customer objection handling)
- Medical decision-making (patient diagnosis paths)

**Code Pattern:**
```js
const scenes = {
  start: {
    text: "A customer approaches looking frustrated. What do you do?",
    choices: [
      { label: "Greet them warmly and ask how you can help", next: "empathy", score: +2 },
      { label: "Wait for them to speak first", next: "passive", score: 0 },
      { label: "Immediately offer a discount", next: "discount", score: -1 }
    ]
  },
  empathy: {
    text: "The customer relaxes and explains their issue...",
    choices: [/* ... */]
  }
  // ... more scenes
};

function renderScene(id) {
  const scene = scenes[id];
  document.querySelector('.narrative-text').innerHTML = scene.text;
  const choicesEl = document.querySelector('.choices');
  choicesEl.innerHTML = '';
  scene.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = choice.label;
    btn.onclick = () => {
      totalScore += choice.score;
      history.push({ scene: id, chose: choice.label });
      renderScene(choice.next);
    };
    choicesEl.appendChild(btn);
  });
}
```

---

### 2B. Visual Novel / Dialogue System

**Description:** Character portraits with dialogue boxes. Characters speak, emote, and the learner chooses dialogue responses. Think of it as a "conversation simulator" with visual characters.

**HTML/CSS/JS Implementation:**
- Character images (can be AI-generated) positioned left/right
- Dialogue box at bottom with typewriter text effect
- Choice buttons appear after dialogue finishes
- CSS transitions for character enter/exit, emotion changes
- Optional: character relationship/trust meters

**Complexity:** MEDIUM — Needs character assets + dialogue scripting

**E-Learning Mapping:**
- Communication skills training
- Language learning (conversational practice)
- Customer interaction scenarios
- Interviewing/HR training

---

### 2C. Virtual Escape Room

**Description:** Learners must solve a series of puzzles (content-based questions) to "unlock" doors or padlocks and escape a virtual room before a timer runs out. Combines exploration + knowledge assessment in a high-engagement format.

**Key Components:**
- **Room environment** with clickable objects (same as 1A)
- **Puzzle locks** — combination locks where digits come from answering questions correctly
- **Timer** — countdown creating urgency
- **Clue system** — hints available at a point cost
- **Sequential unlocking** — solving one puzzle reveals the next

**HTML/CSS/JS Implementation:**
- Room scene with hotspots (reuse pattern 1A)
- Lock UI: CSS-styled digit wheels or keypad
- Timer: `setInterval` countdown displayed in corner
- State: which locks are solved, stored in `cmi.suspend_data`
- Score: time remaining + hints used = final score

**Complexity:** MEDIUM-HIGH — Multiple interlocking systems

**E-Learning Mapping:**
- Review/assessment activities
- Team-building (collaborative escape rooms)
- Compliance certification (must "escape" = pass all checks)
- Onboarding ("Unlock all the knowledge to complete your first day")

**References:**
- Genially escape room templates
- Breakout EDU digital games
- Room Escape Maker (roomescapemaker.com)

---

## 3. Scroll-Driven Storytelling

### 3A. Scrollytelling (Parallax Narrative)

**Description:** Content unfolds as the learner scrolls. Different layers move at different speeds (parallax), elements fade in/out, charts animate, and the narrative progresses. Scroll position drives the animation timeline rather than a clock. Achieves 400% higher engagement than static content per industry benchmarks.

**Famous Examples:**
- NYT "Snow Fall" (pioneered the format)
- Pudding.cool visual essays
- NRK (Norwegian Broadcasting) scroll-driven stories

**Technical Approaches:**

| Approach | Technology | Bundle Size | Browser Support | Performance |
|----------|-----------|-------------|----------------|-------------|
| CSS Scroll-Driven Animations | `animation-timeline: scroll()` | 0 KB (native) | Chrome 115+, coming to others | Excellent (off main thread) |
| GSAP ScrollTrigger | gsap + ScrollTrigger plugin | ~45 KB min | All modern browsers | Excellent |
| IntersectionObserver | Native JS API | 0 KB (native) | All modern browsers | Good |
| CSS scroll-triggered (new) | `animation-trigger: scroll()` | 0 KB (native) | Chrome 145+ (mid-2026) | Excellent |

**GSAP is now free (2025):** Since Webflow acquired GSAP, ScrollTrigger is completely free for all projects including commercial use.

**HTML/CSS/JS Implementation:**
- **Sections:** Each "chapter" is a full-viewport `<section>` with `min-height: 100vh`
- **Pinning:** Elements stay fixed while scroll text passes by (GSAP `pin: true` or `position: sticky`)
- **Scrub:** Animations linked directly to scroll position (`scrub: true`)
- **Reveal:** Elements animate in as they enter viewport via IntersectionObserver

**Complexity:** MEDIUM — GSAP makes it approachable; pure CSS approach is simpler but less supported

**E-Learning Mapping:**
- Long-form content lessons (history, science narratives)
- Data visualization stories ("The state of X in numbers")
- Process explanations (step-by-step workflows)
- Case studies with progressive reveal

**Important SCORM Consideration:** Scrollytelling works best for **lesson/content SCOs**, NOT quiz SCOs. It breaks the "fixed slide" paradigm — this is intentional. Best used for narrative-heavy modules where the "journey" IS the learning.

**Code Pattern (GSAP ScrollTrigger):**
```js
// Pin the chart while explanations scroll past
gsap.to('.chart', {
  scrollTrigger: {
    trigger: '.chart-section',
    start: 'top top',
    end: '+=2000',       // pin for 2000px of scroll
    pin: true,
    scrub: 1
  }
});

// Animate data bars as user scrolls into section
gsap.from('.bar', {
  scaleY: 0,
  transformOrigin: 'bottom',
  stagger: 0.1,
  scrollTrigger: {
    trigger: '.data-section',
    start: 'top 80%',
    end: 'top 20%',
    scrub: true
  }
});
```

**Code Pattern (Pure CSS — IntersectionObserver fallback):**
```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.classList.toggle('visible', entry.isIntersecting);
  });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
```
```css
.reveal-on-scroll {
  opacity: 0; transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal-on-scroll.visible {
  opacity: 1; transform: translateY(0);
}
```

---

### 3B. Scroll-Linked Data Visualization

**Description:** Charts, graphs, and infographics that animate as the user scrolls. Numbers count up, bars grow, pie charts fill in. The scroll position controls the animation progress — scroll down to see data build, scroll up to reverse.

**HTML/CSS/JS Implementation:**
- SVG charts with `stroke-dasharray` / `stroke-dashoffset` animations
- CSS `counter()` for animated number tickers
- GSAP or scroll-timeline to link animation to scroll

**Complexity:** MEDIUM

**E-Learning Mapping:**
- Statistical/data literacy lessons
- Business case presentations
- Research findings modules

---

## 4. Mini-Games for Learning

### 4A. Memory Card Matching

**Description:** Cards arranged in a grid, face-down. Learner flips two cards at a time trying to find matching pairs. Pairs can be term + definition, image + label, question + answer.

**HTML/CSS/JS Implementation:**
- **Grid:** CSS Grid with square cards using `aspect-ratio: 1`
- **Flip:** CSS `transform: rotateY(180deg)` with `perspective` and `backface-visibility: hidden`
- **State:** `hasFlippedCard`, `lockBoard`, matched pairs counter
- **Match logic:** Compare `data-pair` attributes; if match, disable cards; if not, flip back after 1.5s
- **Completion:** All pairs matched = success; optionally track attempts/time

**Complexity:** LOW — ~80 lines of JS, pure CSS animations

**E-Learning Mapping:**
- Vocabulary/terminology review
- Concept-to-definition matching
- Image recognition (identify equipment, symbols)
- Language learning (word pairs)

**Code Pattern:**
```js
let hasFlippedCard = false, lockBoard = false, firstCard, secondCard;

function flipCard() {
  if (lockBoard || this === firstCard) return;
  this.classList.add('flipped');
  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    return;
  }
  secondCard = this;
  lockBoard = true;
  const isMatch = firstCard.dataset.pair === secondCard.dataset.pair;
  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  firstCard.classList.add('matched');
  secondCard.classList.add('matched');
  matchedPairs++;
  resetBoard();
  if (matchedPairs === totalPairs) onGameComplete();
}
```

---

### 4B. Word Search Puzzle

**Description:** A grid of letters with hidden words. Learner selects letters by clicking/dragging to highlight words. Found words are struck from the word list.

**Libraries:**
- **wordfind.js** — Zero-dependency JS library that generates word search puzzles from any word list. Works in browser and Node.js.
- **jsWordsearch** — Configurable generator with size, color, direction, shape options

**HTML/CSS/JS Implementation:**
- Grid rendered as a `<table>` or CSS Grid of `<span>` elements
- Click-drag selection via mousedown/mousemove/mouseup
- Highlight found words with CSS background color transition
- Word list sidebar shows remaining/found words

**Complexity:** MEDIUM — Selection logic requires careful coordinate tracking

**E-Learning Mapping:**
- Vocabulary reinforcement
- Key term familiarization
- Fun review activity after content sections

---

### 4C. Crossword Puzzle

**Description:** Classic crossword grid with clues. Learner types letters into cells. Correct answers fill in automatically or on verification.

**Libraries:**
- **Crossword.js** — Open source HTML5 crossword puzzle game
- Custom implementations with randomized word placement algorithms

**HTML/CSS/JS Implementation:**
- Grid of `<input maxlength="1">` cells styled with CSS Grid
- Auto-advance to next cell on input
- Clue panel with numbered clues (Across/Down)
- Validation: compare grid against answer key
- Visual feedback: green/red cell highlights

**Complexity:** MEDIUM-HIGH — Word placement algorithm is complex; using a library recommended

**E-Learning Mapping:**
- Terminology/vocabulary assessment
- Review activities
- Fun self-check exercises

---

### 4D. Jigsaw / Drag-Drop Puzzle

**Description:** An image or diagram is split into pieces. Learner must drag pieces to correct positions to reassemble. Can also be process steps, organizational structures, or sequence ordering.

**HTML/CSS/JS Implementation:**
- Pieces: `<div>` elements with `clip-path` or background-position to show image fragments
- Drop zones: CSS Grid cells with dashed borders
- HTML5 Drag and Drop API + touch events for mobile
- Snap-to-grid on correct placement
- Visual feedback: piece glows green when correctly placed

**Complexity:** LOW-MEDIUM — HTML5 DnD API, but touch support needs extra work

**E-Learning Mapping:**
- Process sequencing ("Arrange these steps in order")
- Diagram assembly ("Build the organizational chart")
- Visual learning (reassemble anatomy, geography)

---

### 4E. Sorting / Categorization Games

**Description:** Items must be sorted into categories by dragging them to the correct bucket. Think "this or that" or multi-category sorting.

**HTML/CSS/JS Implementation:**
- Draggable items with category labels or images
- Drop zone containers for each category
- Correct/incorrect feedback with animation
- Score tracking (correct on first try vs. retry)

**Complexity:** LOW — Reuses same DnD patterns as sequence-sort component

**E-Learning Mapping:**
- Classification exercises (types of waste, risk levels)
- Decision-making (appropriate vs. inappropriate responses)
- Taxonomy learning (biology, compliance categories)

---

### 4F. Wheel of Fortune / Spinner

**Description:** A spinning wheel that randomly selects a category, question, or reward. Adds excitement and randomness to reviews.

**HTML/CSS/JS Implementation:**
- SVG or CSS conic-gradient wheel with segments
- CSS `transform: rotate()` animation with easing
- Random result calculation: `Math.random() * 360` mapped to segment
- Result callback triggers question display or reward

**Complexity:** LOW — Pure CSS animation + minimal JS

**E-Learning Mapping:**
- Random question selection for review
- Gamified category selection
- Reward/bonus point distribution

---

## 5. Gamification UI Systems

### 5A. Progress Map / Learning Journey (Duolingo-Style)

**Description:** Instead of a plain progress bar, learners see a visual map/path with nodes representing lessons. Completed nodes are highlighted, current node pulses, locked nodes are greyed out. Creates a sense of journey and destination.

**Duolingo's Approach:**
- Vertical path with lesson nodes connected by a winding road
- Completed = solid color, Current = pulsing/glowing, Locked = greyed + lock icon
- Checkpoint/review nodes at intervals
- Crown/star system for mastery levels per node

**HTML/CSS/JS Implementation:**
- **SVG path:** A winding `<path>` element connecting circular node elements
- **Node states:** CSS classes `.completed`, `.current`, `.locked`
- **Animation:** `stroke-dasharray` + `stroke-dashoffset` to animate the path filling
- **Interactivity:** Click on completed/current nodes to navigate
- **Data:** Node states stored in `cmi.suspend_data`

**Complexity:** MEDIUM — SVG path design + state management

**Code Pattern:**
```html
<svg class="journey-map" viewBox="0 0 200 800">
  <path class="journey-path" d="M100,20 C50,100 150,200 100,300 C50,400 150,500 100,600"
        fill="none" stroke="var(--path-color)" stroke-width="4"
        stroke-dasharray="1000" stroke-dashoffset="600" />
  <circle class="node completed" cx="100" cy="20" r="16" />
  <circle class="node completed" cx="75" cy="150" r="16" />
  <circle class="node current" cx="125" cy="300" r="16" />
  <circle class="node locked" cx="75" cy="450" r="16" />
</svg>
```

---

### 5B. XP / Points System

**Description:** Every action earns experience points (XP). Points accumulate toward levels. Learners see their XP counter animate upward after completing activities.

**Duolingo Data:**
- XP leaderboards drive 40% more engagement
- Leveling up triggers celebration animations
- Daily XP goals create habit loops

**HTML/CSS/JS Implementation:**
- Points badge in header with animated counter (CSS `counter` or JS `requestAnimationFrame` number ticker)
- XP gain popup: "+25 XP" floats up and fades out
- Level progress bar: fills toward next level threshold
- Level-up celebration: confetti + modal
- Store in `cmi.suspend_data` for persistence

**Complexity:** LOW — Our existing `gamification.js` already handles points

---

### 5C. Streak Counter

**Description:** Tracks consecutive correct answers or consecutive days of learning. Visual representation (flame icon, numbered badge) that grows with streak length.

**Duolingo Data:**
- Users with 7-day streaks are 3.6x more likely to stay engaged
- "Streak Freeze" (one free miss) reduced churn by 21%

**HTML/CSS/JS Implementation:**
- Counter variable incremented on correct answer, reset on wrong
- Visual: flame/fire icon that grows larger with streak
- CSS animation: shake/glow when streak hits milestones (5, 10, 25)
- "Streak freeze" power-up: one free miss per quiz

**Complexity:** LOW — Simple counter + CSS animations

---

### 5D. Hearts / Lives System

**Description:** Learner starts with 5 hearts. Each wrong answer costs a heart. Losing all hearts requires restarting the section. Creates stakes and careful thinking.

**HTML/CSS/JS Implementation:**
- Row of heart SVG icons in header
- CSS animation: heart breaks/greys out on loss
- Shake effect on wrong answer
- "Game Over" modal when hearts = 0
- Optional: earn hearts back by reviewing content

**Complexity:** LOW — Counter + SVG animation

---

### 5E. Achievement / Badge System

**Description:** Unlockable achievements for specific accomplishments (first quiz passed, perfect score, completed all optional content, speed run). Creates collection motivation.

**Badge Components:**
1. **Trigger** — The action that unlocks it
2. **Visual** — Badge icon/image (can be SVG)
3. **Notification** — Xbox-style popup when unlocked
4. **Gallery** — Collection view of all earned badges

**HTML/CSS/JS Implementation:**
- Badge definitions: JS object with `{ id, title, description, icon, condition }`
- Unlock check: Run conditions after each learner action
- Notification: CSS slide-in from top with badge icon + title
- Gallery: Grid of badge cards (earned = full color, locked = greyed + "?")
- Persist: Store earned badge IDs in `cmi.suspend_data`

**Notification Code Pattern:**
```css
.achievement-popup {
  position: fixed; top: -80px; right: 20px;
  background: var(--surface); border-radius: 12px;
  padding: 12px 20px; display: flex; align-items: center; gap: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  transition: top 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.achievement-popup.show { top: 20px; }
.achievement-popup .badge-icon { width: 48px; height: 48px; }
```

---

### 5F. Celebration Animations

**Description:** Confetti, fireworks, or particle effects triggered on achievements (quiz pass, lesson complete, perfect score). Provides dopamine hit and positive reinforcement.

**Libraries:**
- **canvas-confetti** (~6KB gzipped) — The gold standard. Supports custom colors, shapes, position targeting, off-main-thread rendering via Web Worker.
- **js-confetti** (~4KB) — Zero dependencies, supports emoji confetti

**HTML/CSS/JS Implementation:**
- Import canvas-confetti (can be bundled locally for SCORM)
- Trigger on events: `confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })`
- Pair with sound effect for multi-sensory feedback
- CSS-only alternative: keyframe animations on positioned `<span>` elements

**Complexity:** LOW — Single function call

---

### 5G. Leaderboard (Session-Based)

**Description:** In a SCORM package (no server), a "leaderboard" can show the learner's current score vs. benchmark scores (average, expert level) or their own previous attempts.

**HTML/CSS/JS Implementation:**
- Display: Table or card list with rank, name, score
- Benchmark data: Hardcoded "average" and "expert" scores
- Learner's attempts: Stored in `cmi.suspend_data` across sessions
- Animation: New entry slides in, highlights the learner's row

**Complexity:** LOW

**Note:** True multi-user leaderboards require server-side — not possible in self-contained SCORM. But "beat your own score" and "beat the benchmark" work great.

---

## 6. Web Game Frameworks

### Framework Comparison for SCORM Integration

| Framework | Min Size | Custom Build | Canvas/WebGL | Audio | Physics | SCORM Ready | Best For |
|-----------|---------|-------------|-------------|-------|---------|-------------|----------|
| **Phaser 3** | 880 KB (full) / 404 KB (custom) / 110 KB (gzip) | Yes (Webpack) | WebGL + Canvas fallback | Yes | Arcade + Matter.js | Yes (phaser-scorm boilerplate exists) | Full 2D games, complex mini-games |
| **PixiJS** | ~200 KB | Yes | WebGL + Canvas fallback | No (add Howler.js) | No (add separately) | Manual integration | Custom rendering, interactive graphics |
| **LittleJS** | ~15 KB (full) / 7 KB (js13k) | N/A (already tiny) | WebGL + Canvas | Yes | Built-in | Easy to wrap | Lightweight mini-games |
| **Kontra.js** | ~10 KB | Yes (tree-shakeable) | Canvas | Partial | No | Easy to wrap | Micro-games, js13k |
| **Kaboom.js** | ~150 KB | No | Canvas | Yes | Built-in | Manual integration | Quick prototyping, fun API |
| **Three.js** | ~600 KB | Tree-shakeable | WebGL (3D) | No (add Howler) | No (add Cannon.js) | Manual | 3D simulations, virtual environments |

### Recommendations for SCORM

**For lightweight mini-games (memory, matching, puzzles):**
Use **vanilla JS** — no framework needed. Our existing components already handle these with pure CSS + JS under 5KB each.

**For medium-complexity games (tower defense, platformer, physics sim):**
Use **LittleJS** (15KB) or **Kontra.js** (10KB). Both are tiny enough to bundle in any SCORM package without bloat.

**For complex, graphics-intensive games:**
Use **Phaser 3** with a custom build (404KB min). The `phaser-scorm` GitHub boilerplate provides ready-made SCORM integration. Run game in an `<iframe>` within the SCO for clean isolation.

**Avoid for SCORM:** Three.js (too heavy for typical e-learning), full Phaser (unnecessary for simple interactions)

### SCORM Integration Pattern

```js
// In your game's completion handler:
function onGameComplete(score, maxScore) {
  // Report score to SCORM
  if (window.SCORM_API) {
    SCORM_API.SetValue('cmi.core.score.raw', score);
    SCORM_API.SetValue('cmi.core.score.max', maxScore);
    SCORM_API.SetValue('cmi.core.score.min', '0');
    SCORM_API.SetValue('cmi.core.lesson_status', score >= maxScore * 0.7 ? 'passed' : 'failed');
    SCORM_API.Commit();
  }
}
```

---

## 7. Interactive Simulations

### 7A. Virtual Lab / Science Simulation

**Description:** Interactive scientific models where learners manipulate variables and observe outcomes. Think PhET simulations (University of Colorado Boulder) — drag sliders, change parameters, watch physics/chemistry/biology respond in real-time.

**Reference:** PhET Interactive Simulations (phet.colorado.edu) — 100+ free simulations, all HTML5, no plugins

**HTML/CSS/JS Implementation:**
- **Canvas/SVG rendering** for dynamic visuals (particle systems, graphs, animations)
- **Input controls:** Range sliders, toggles, dropdowns for variable manipulation
- **Real-time calculation:** JS physics/math engines update on input change
- **Data display:** Live-updating charts, counters, graphs
- **State persistence:** Save variable states to `cmi.suspend_data`

**Complexity:** HIGH — Requires domain-accurate math/physics models

**E-Learning Mapping:**
- Science education (forces, circuits, chemistry reactions)
- Engineering training (stress analysis, fluid dynamics)
- Financial modeling (compound interest, portfolio simulation)

---

### 7B. Decision Simulator / Business Scenario

**Description:** Learners make sequential business decisions (pricing, hiring, resource allocation) and see financial/organizational consequences unfold over simulated time periods. Each round shows results of previous decisions before presenting new choices.

**HTML/CSS/JS Implementation:**
- **Round system:** Each "round" presents a scenario + choices
- **Dashboard:** Live metrics (revenue, satisfaction, headcount) update after each decision
- **Consequence engine:** JS functions calculate outcomes based on decision + random variance
- **Charts:** SVG/Canvas bar or line charts showing trends over rounds
- **Ending:** Final evaluation based on cumulative metrics

**Complexity:** MEDIUM-HIGH — Needs realistic consequence modeling

**E-Learning Mapping:**
- Leadership/management training
- Financial literacy
- Project management (resource allocation)
- Risk assessment

---

### 7C. Process Simulator / Workflow Builder

**Description:** Learners arrange steps of a process in a visual flowchart. Drag-and-drop nodes, connect them with lines, validate the sequence. Or: watch a process animation and identify where it goes wrong.

**HTML/CSS/JS Implementation:**
- **Nodes:** Draggable `<div>` elements with labels
- **Connections:** SVG `<line>` or `<path>` elements drawn between nodes
- **Validation:** Compare learner's arrangement to correct sequence
- **Feedback:** Highlight correct/incorrect connections

**Complexity:** MEDIUM

**E-Learning Mapping:**
- Business process training
- Manufacturing workflows
- IT incident response procedures
- Medical protocols

---

### 7D. Drawing / Annotation Canvas

**Description:** A whiteboard/canvas where learners can draw, annotate, label, or mark up images. Useful for labeling diagrams, drawing concepts, or freeform responses.

**Libraries:**
- **Fabric.js** — Full-featured canvas library with object manipulation
- **Excalidraw** — Hand-drawn style whiteboard (open source)
- **Konva** — Lightweight 2D drawing library
- **Literally Canvas** — BSD-licensed HTML5 drawing widget

**HTML/CSS/JS Implementation:**
- HTML5 Canvas with drawing tools (pen, shapes, text, eraser)
- Touch support for tablet/iPad
- Export drawing as data URL for storage in `cmi.suspend_data`
- Overlay on existing images for annotation exercises

**Complexity:** MEDIUM (with library) / HIGH (from scratch)

**E-Learning Mapping:**
- Diagram labeling ("Label the parts of the cell")
- Freeform response questions
- Collaborative brainstorming
- Technical drawing practice

---

### 7E. Interactive Map / Geographic Exploration

**Description:** Click on regions of a map (world, country, building floor plan, human body) to reveal information about each area. Regions highlight on hover, show popups on click.

**HTML/CSS/JS Implementation:**
- **SVG map** with `<path>` elements for each region
- **CSS hover effects:** `fill` color change on `:hover`
- **Click handler:** Show info panel with region data
- **Completion tracking:** Mark visited regions
- **Responsive:** SVG viewBox scales to any container

**Complexity:** LOW-MEDIUM — SVG creation is the main effort

**E-Learning Mapping:**
- Geography/cultural studies
- Anatomy ("Click on body regions")
- Facility orientation ("Explore our office/campus")
- Market analysis ("Click on regions to see sales data")

**Code Pattern:**
```html
<svg viewBox="0 0 1000 500" class="interactive-map">
  <path class="region" id="region-north" d="M..." data-name="North Region" data-info="..." />
  <path class="region" id="region-south" d="M..." data-name="South Region" data-info="..." />
</svg>
```
```css
.region { fill: var(--region-default); cursor: pointer; transition: fill 0.3s; }
.region:hover { fill: var(--region-hover); }
.region.visited { fill: var(--region-visited); }
```

---

## 8. Implementation Priority Matrix

### How to Read This Matrix

- **Impact** = How much it transforms the learning experience from "slides" to "interactive game"
- **Effort** = Development complexity for our SCORM Studio engine
- **Reusability** = Can it be used across many different courses/topics?

| Pattern | Impact | Effort | Reusability | Priority | Already Have? |
|---------|--------|--------|-------------|----------|--------------|
| Memory Card Matching | HIGH | LOW | HIGH | **P1** | No |
| Flashlight Reveal | HIGH | LOW | HIGH | **P1** | No |
| Room Exploration | HIGH | LOW-MED | HIGH | **P1** | Partial (hotspot component) |
| Achievement Badges | HIGH | LOW | HIGH | **P1** | Partial (gamification.js) |
| Celebration Confetti | MED | LOW | HIGH | **P1** | Partial (gamification.js) |
| Choose-Your-Adventure | HIGH | MED | HIGH | **P1** | No |
| Hearts/Lives System | MED | LOW | HIGH | **P1** | No |
| Streak Counter | MED | LOW | HIGH | **P1** | No |
| Progress Map (SVG) | HIGH | MED | HIGH | **P2** | No |
| Virtual Escape Room | HIGH | MED-HIGH | MED | **P2** | No |
| Word Search | MED | MED | MED | **P2** | No |
| Scrollytelling (GSAP) | HIGH | MED | MED | **P2** | No |
| Spinner/Wheel | MED | LOW | MED | **P2** | No |
| Crossword Puzzle | MED | MED-HIGH | MED | **P2** | No |
| Decision Simulator | HIGH | HIGH | MED | **P3** | No |
| Jigsaw Puzzle | MED | MED | MED | **P3** | No |
| Visual Novel | HIGH | MED-HIGH | MED | **P3** | No |
| Drawing Canvas | MED | MED-HIGH | LOW | **P3** | No |
| Interactive Map | MED | MED | MED | **P3** | No |
| Tower Defense Learning | MED | HIGH | LOW | **P4** | No |
| Physics Simulation | HIGH | VERY HIGH | LOW | **P4** | No |

---

## 9. Recommendations for SCORM Studio

### New Components to Build (Priority Order)

#### Wave 1 — Quick Wins (Each <200 lines of JS)

1. **`memory-match.html`** — Card matching game component
   - Input: Array of `{ front, back }` pairs (text or image)
   - Grid auto-sizes based on pair count (4, 6, 8, 12 pairs)
   - CSS flip animation, match detection, attempts counter
   - Reports score via SCORM interactions

2. **`flashlight-reveal.html`** — Spotlight discovery component
   - Input: Background image + positioned reveal zones
   - CSS mask follows cursor, discovered items counter
   - Works on mobile with touch

3. **`branching-scenario.html`** — Decision tree engine
   - Input: JSON scene graph `{ scenes: { id: { text, choices } } }`
   - Renders narrative + choice buttons
   - Tracks path, calculates score from consequences
   - Optional: character portraits, dialogue styling

4. **`achievement-system.js`** — Achievement/badge manager
   - Define achievements with conditions
   - Xbox-style popup notifications
   - Badge gallery view
   - Persists to `cmi.suspend_data`

5. **`hearts-system.js`** — Lives/hearts manager
   - Configurable heart count (default 5)
   - Visual heart row with break animation
   - Game-over trigger when hearts = 0

6. **`streak-counter.js`** — Streak tracking
   - Consecutive correct answer counter
   - Visual flame/fire that grows with streak
   - Milestone celebrations (5, 10, 25)

#### Wave 2 — Medium Effort

7. **`escape-room.html`** — Virtual escape room template
   - Room scene + puzzle locks + timer
   - Modular puzzle types (code entry, drag-match, question-answer)
   - Score = time remaining - hints used

8. **`word-search.html`** — Word search puzzle
   - Generated grid from word list (using wordfind algorithm)
   - Click-drag letter selection
   - Found words highlight + cross off list

9. **`progress-journey.html`** — SVG learning path map
   - Winding path with lesson nodes
   - States: completed, current, locked
   - Animated path fill as learner progresses

10. **`spinner-wheel.html`** — Random selection wheel
    - Configurable segments with labels/colors
    - CSS rotation animation
    - Result callback for integration

#### Wave 3 — Advanced

11. **`scrollytelling-engine.js`** — Scroll-driven narrative engine
    - GSAP ScrollTrigger integration (free since 2025)
    - Section pinning, scrub animations, reveal triggers
    - For content-heavy lesson SCOs

12. **`crossword.html`** — Crossword puzzle (use Crossword.js)
13. **`visual-novel.html`** — Dialogue/character system
14. **`decision-sim.html`** — Multi-round business simulator
15. **`interactive-map.html`** — SVG region exploration

### Engine Modifications Needed

1. **Game State Manager** — Extend `state-engine.js` to handle game-specific state (lives, score, streak, achievements, timer) alongside existing slide/quiz state
2. **Component Loader** — Allow SCOs to declare which game components they need in a manifest, loaded dynamically
3. **Sound Manager** — Add a lightweight audio system for game feedback sounds (correct, wrong, achievement unlock, timer tick)
4. **Touch Enhancement** — Ensure all game interactions have proper touch support (our drag-drop already needs this)

### Key Technical Decisions

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| Game framework? | **No framework** for Wave 1-2 | Our patterns are simple enough for vanilla JS; adding Phaser/PixiJS adds 100-900KB for little benefit |
| Confetti library? | **canvas-confetti** (6KB gzip) | Industry standard, off-thread rendering, custom positioning |
| Scroll library? | **GSAP ScrollTrigger** (45KB, now free) | Best DX, universal browser support, huge ecosystem |
| Word search? | **wordfind.js** (zero-dep) | Already solves the hard algorithm; just need UI wrapper |
| Crossword? | **Crossword.js** (open source) | Word placement algorithm is genuinely complex; don't rebuild |
| 2D game engine? | **LittleJS** (15KB) for Wave 3+ | Only if we need Canvas-based games; stays tiny |

### What This Gets Us

If we build Wave 1 (6 new components/systems), our SCORM packages go from:

**Before:** "Slides with quizzes and some interactive components"
**After:** "Explorable environments, mystery discovery, branching narratives, memory games, achievement hunts, and lives-at-stake quizzes"

That's a massive leap in perceived interactivity — and every component is:
- Self-contained (works offline in SCORM)
- Reusable (data-driven, works for any topic)
- Lightweight (under 200 lines each, no heavy dependencies)
- Accessible (keyboard navigable, ARIA labels, focus management)
- Mobile-friendly (touch events throughout)

---

## Sources

- [Storyline Room Exploration Template](https://community.articulate.com/download/storyline-room-exploration-interaction)
- [Twine Interactive Fiction Tool](https://twinery.org/)
- [Ink Web Tutorial — Inkle Studios](https://www.inklestudios.com/ink/web-tutorial/)
- [Branching Narrative — Learning Engineer's KB](https://lekb.org/index.php/Branching_narrative)
- [Complete Scrollytelling Guide 2025](https://ui-deploy.com/blog/complete-scrollytelling-guide-how-to-create-interactive-web-narratives-2025)
- [NRK Scroll-Driven Animations Case Study](https://developer.chrome.com/blog/nrk-casestudy)
- [GSAP ScrollTrigger Docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [CSS Scroll-Driven Animations — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)
- [CSS Scroll-Triggered Animations — Chrome Blog](https://developer.chrome.com/blog/scroll-triggered-animations)
- [Duolingo Gamification Secrets](https://www.orizon.co/blog/duolingos-gamification-secrets)
- [Duolingo Streak System Breakdown](https://medium.com/@salamprem49/duolingo-streak-system-detailed-breakdown-design-flow-886f591c953f)
- [How to Design Like Duolingo](https://www.uinkits.com/blog-post/how-to-design-like-duolingo-gamification-engagement)
- [Phaser vs PixiJS](https://dev.to/ritza/phaser-vs-pixijs-for-making-2d-games-2j8c)
- [phaser-scorm Boilerplate](https://github.com/colorfield/phaser-scorm)
- [Phaser Custom Build Tool](https://github.com/phaserjs/custom-build)
- [LittleJS Game Engine](https://killedbyapixel.github.io/LittleJS/)
- [Kontra.js Micro Engine](https://github.com/straker/kontra)
- [PhET Interactive Simulations](https://phet.colorado.edu/)
- [canvas-confetti Library](https://github.com/catdad/canvas-confetti)
- [wordfind.js Library](https://github.com/bunkat/wordfind)
- [Crossword.js](https://github.com/habibieamrullah/HTML5-Crossword-Puzzle-Game)
- [CSS Clip-Path Examples](https://freefrontend.com/css-clip-path-examples/)
- [Flashlight Effect CSS](https://foolishdeveloper.com/flashlight-effect-html-css/)
- [Dynamic CSS Masks with GSAP — Codrops](https://tympanus.net/codrops/2021/05/04/dynamic-css-masks-with-custom-properties-and-gsap/)
- [Memory Card Game Tutorial — DEV](https://dev.to/javascriptacademy/creating-a-memory-card-game-with-html-css-and-javascript-57g1)
- [Memory Game Vanilla JS — FreeCodeCamp](https://marina-ferreira.github.io/tutorials/js/memory-game/)
- [Pure CSS Games Collection](https://freefrontend.com/css-games/)
- [CSS Gamification Badge Snippets](https://speckyboy.com/css-badges/)
- [Virtual Escape Rooms](https://virtualescaperooms.org/digital-escape-room-puzzle-ideas/)
- [Room Escape Maker](https://roomescapemaker.com/)
- [Animated Map Path — Codrops](https://tympanus.net/codrops/2015/12/16/animated-map-path-for-interactive-storytelling/)
- [ProgressBar.js SVG Progress](https://www.cssscript.com/svg-paths-progressbar/)
- [H5P Image Hotspots](https://h5p.org/image-hotspots)
- [Clickable SVG Map Tutorial](https://www.freecodecamp.org/news/how-to-make-clickable-svg-map-html-css/)
- [BranchTrack Scenario Tool](https://www.branchtrack.com/)
- [iSpring Branching Scenarios](https://www.ispringsolutions.com/blog/branching-scenarios)
- [Top 15 Storyline Games](https://fastercourse.com/top-15-games-articulate-storyline/)
- [JS Game Rendering Benchmark](https://github.com/Shirajuki/js-game-rendering-benchmark)
- [PixiJS vs Phaser 3 — Aircada](https://aircada.com/blog/pixijs-vs-phaser-3)
