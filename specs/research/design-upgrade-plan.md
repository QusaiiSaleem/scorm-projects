# SCORM Content Studio: Design Upgrade Plan

> Synthesized from 5 research documents into an actionable, prioritized roadmap.
> Date: 2026-02-06 | For: Product Designer (not developer)

---

## How to Read This Document

This plan is organized into **9 sections** answering the key questions about upgrading our SCORM system. Everything is prioritized into **3 waves**:

- **Wave 1: Quick Wins** -- Can be done in 1 session, huge "wow" payoff
- **Wave 2: Medium Effort** -- 1-2 sessions, builds on Wave 1
- **Wave 3: Advanced** -- Multiple sessions, game-changing capabilities

For each recommendation, you will see:
- **What it is** -- plain language description
- **Why it matters** -- the "wow" factor
- **How to implement** -- specific files to create or modify
- **Effort** -- small / medium / large
- **Source** -- which research document it came from

---

## Section 1: TOP 10 Design Techniques to Add

These are the highest-impact visual and interaction upgrades, ranked by "wow per effort."

### #1. Synthesized Sound Effects (Web Audio API)

**What it is:** Generate click, success, error, and celebration sounds using code alone -- zero audio files needed. The Web Audio API creates sounds from mathematical waveforms in real-time.

**Why it matters:** Sound is the single biggest differentiator between "slideshow" and "app." Duolingo, Brilliant, and every game uses audio feedback. Currently, our courses are completely silent. Adding even basic click/success/error sounds transforms the feel instantly.

**How to implement:**
- Create `resources/engine/sound-effects.js` (~120 lines)
- 6 synthesized sounds: click, success, error, celebration, whoosh, pop
- Integrate into quiz-engine.js (correct/incorrect), slide-controller.js (navigation), gamification.js (achievements)
- Add user preference toggle (sound on/off) persisted in `cmi.suspend_data`

**Effort:** Small (one new JS file, ~120 lines)
**Source:** CSS/JS Techniques Research, Section 6

---

### #2. Premium Visual Foundation (Grain + Shadows + Gradient Text)

**What it is:** Three CSS techniques that instantly make any design look premium:
1. **Grain texture overlay** -- Subtle film-like noise over backgrounds (creates warmth and depth)
2. **Layered shadow system** -- Multiple shadows at doubling distances (like real-world light)
3. **Gradient text** -- Headings with color gradients flowing through the text

**Why it matters:** These three together are what separate "app store quality" from "made with a template." Stripe, Linear, and Arc all use these. They work on every theme and cost almost nothing to implement.

**How to implement:**
- Add `.has-grain`, `.shadow-sm/md/lg`, `.text-gradient` utility classes to `resources/css/base.css`
- Add grain SVG data URI (inline, no external file) to decorations layer
- Add `--shadow-small`, `--shadow-medium`, `--shadow-large` CSS custom properties to each theme's `tokens.json`
- Update Content Renderer agent prompt to use these classes

**Effort:** Small (CSS additions only, ~80 lines across files)
**Source:** Visual Design Research, Sections 5, 6, 11

---

### #3. Micro-Interactions on Everything

**What it is:** Every button, card, and interactive element gets smooth animations on hover, click, and state changes:
- **Elastic click** -- Buttons squish slightly when pressed (scale 0.97)
- **Hover lift** -- Cards float up 2px with shadow deepening
- **Spring physics** -- Elements bounce slightly with CSS `linear()` easing
- **Staggered reveals** -- Content items appear one-by-one with 80-100ms delays

**Why it matters:** This is what makes the difference between "dead interface" and "alive interface." Every app you love (Duolingo, Apple, Arc Browser) has micro-interactions on every touchpoint. Without them, even beautiful colors and typography feel flat.

**How to implement:**
- Add `.elastic-click`, `.hover-lift`, `.spring-gentle/bouncy/snappy` utility classes to `resources/css/base.css`
- Enhance existing `.stagger-item` with better easing: `cubic-bezier(0.22, 1, 0.36, 1)`
- Add CSS custom property `--spring-bouncy` using native `linear()` function with fallback
- Update all 22 components to include hover/active states

**Effort:** Small-Medium (CSS utilities + updating existing components)
**Source:** Visual Design Research, Section 8; CSS/JS Techniques Research, Section 2

---

### #4. Confetti Celebration System

**What it is:** A self-contained Canvas-based confetti particle system that fires on quiz pass, lesson completion, achievement unlock, and streak milestones. Colorful paper rectangles burst from the center and fall with realistic gravity.

**Why it matters:** Duolingo's research proves celebration animations are their #1 retention driver. Our existing `gamification.js` has points and messages but no visual celebration. This is the "dopamine hit" that makes learners want to keep going.

**How to implement:**
- Create `resources/engine/confetti.js` (~80 lines, self-contained, no library needed)
- Integrate with gamification.js triggers: `onQuizPass()`, `onLessonComplete()`, `onAchievement()`
- CSS overlay canvas (position: fixed, pointer-events: none, z-index: 9999)
- Keep particle count under 100 for 60fps on mid-range devices

**Effort:** Small (one new JS file, ~80 lines)
**Source:** CSS/JS Techniques Research, Section 3.1; E-Learning Showcase Research, Section 4.1

---

### #5. Flashlight / Spotlight Reveal Interaction

**What it is:** A dark overlay covers the screen. A circular "flashlight" follows the mouse/finger, revealing hidden content underneath. The learner must actively search by moving the light around. Clicking on discovered items reveals information panels.

**Why it matters:** This single interaction was rated 9/10 "wow factor" in our showcase research. It transforms a boring "click to read" exercise into a mystery/exploration game. The Articulate community downloads this interaction template more than almost any other. It takes only ~50 lines of JS + CSS.

**How to implement:**
- Create `resources/components/flashlight-reveal.html` (~80 lines total)
- CSS `mask-image: radial-gradient()` follows cursor via `--mx`, `--my` custom properties
- JS mousemove/touchmove updates custom properties
- Positioned hotspot items beneath the overlay trigger on click
- Progress counter: "3 of 7 discovered"

**Effort:** Small (one new component, ~80 lines)
**Source:** E-Learning Showcase Research, Sections 1.1, 7.1; Game Interactions Research, Section 1B

---

### #6. Memory Card Matching Game

**What it is:** Cards arranged in a grid, face-down. The learner flips two at a time trying to find matching pairs. Pairs can be term + definition, image + label, question + answer. Uses CSS 3D flip animation.

**Why it matters:** Vocabulary and terminology review is the #1 most common e-learning activity. Currently we have quizzes for this. A memory game makes the same learning activity feel like a game, dramatically increasing engagement. It is also extremely reusable -- works for ANY course topic.

**How to implement:**
- Create `resources/components/memory-match.html` (~120 lines)
- CSS `transform: rotateY(180deg)` with `perspective` and `backface-visibility: hidden`
- Grid auto-sizes based on pair count (4, 6, 8, 12 pairs)
- Match detection, attempts counter, timer (optional)
- Reports score via SCORM interactions

**Effort:** Small (one new component, ~120 lines)
**Source:** Game Interactions Research, Section 4A

---

### #7. Glassmorphism Cards for Dark Themes

**What it is:** Translucent frosted-glass panels that float over gradient backgrounds. The background blurs through the card, creating a sense of depth and sophistication. Linear, Apple, and every premium dark UI uses this.

**Why it matters:** Our dark themes (space-explorer, technical-dark) currently use solid dark cards. Adding glassmorphism transforms them from "dark mode" to "premium dark mode." It is purely a CSS change -- no JS needed.

**How to implement:**
- Add `.glass`, `.glass-dark`, `.glass-light` utility classes to each theme's `decorations.css`
- `backdrop-filter: blur(12px); background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08)`
- Limit to 2-3 glass elements per viewport (performance rule)
- Reduce blur to 6-8px on mobile
- Add gradient border variant using `mask-composite` technique

**Effort:** Small (CSS additions to theme decorations.css files)
**Source:** Visual Design Research, Section 3

---

### #8. Branching Scenario Engine

**What it is:** A choose-your-own-adventure engine where learners make choices at key points in a narrative. Each choice leads to different consequences and outcomes. Tracks the decision path and calculates a final score.

**Why it matters:** Award-winning e-learning consistently uses scenario-based branching. It is the most requested interaction type by instructional designers. Currently we have no branching capability -- all our content is linear. This single component unlocks an entire category of training (soft skills, compliance, ethics, customer service).

**How to implement:**
- Create `resources/components/branching-scenario.html` (~200 lines)
- JSON scene graph: `{ scenes: { id: { text, image, choices: [{ label, nextScene, consequence }] } } }`
- Renders narrative text + choice buttons with animated transitions
- Tracks path history, calculates cumulative score from consequences
- Optional: character portraits, dialogue styling, comic-panel layout

**Effort:** Medium (one new component, ~200 lines + JSON data structure)
**Source:** Game Interactions Research, Section 2A; E-Learning Showcase Research, Section 1.2

---

### #9. Achievement / Badge System

**What it is:** Unlockable achievements for specific accomplishments (first quiz passed, perfect score, speed run, explored all optional content). When unlocked, an Xbox-style notification slides in from the top. A badge gallery shows all earned and locked badges.

**Why it matters:** Khan Academy uses badge tiers (Meteorite to Black Hole) and Duolingo uses streak celebrations -- both drive collection motivation. Our `gamification.js` tracks points but has no visual badge/achievement system. This adds the "collector's drive" that keeps learners exploring.

**How to implement:**
- Create `resources/engine/achievement-system.js` (~150 lines)
- Badge definitions: `{ id, title, description, icon, condition }`
- Notification popup: CSS slide-in from top with badge icon + title + description
- Badge gallery: grid of badge cards (earned = full color, locked = greyed + "?")
- Persist earned badge IDs in `cmi.suspend_data`
- Predefined achievements: first_lesson, perfect_quiz, speed_demon, explorer, streak_5, streak_10

**Effort:** Medium (one new JS file + notification CSS)
**Source:** Game Interactions Research, Section 5E; E-Learning Showcase Research, Section 4.3

---

### #10. Animated Gradient Backgrounds

**What it is:** Multi-color gradients that slowly animate (shifting position over 15-20 seconds), creating an organic, living background. Can be layered radial gradients for a "mesh" effect (like Stripe's homepage).

**Why it matters:** Static solid-color backgrounds are the most obvious sign of "template" design. Animated gradients add energy and atmosphere without any images. They work on every theme and are pure CSS -- no performance cost.

**How to implement:**
- Add `.animated-bg` and `.mesh-gradient` classes to theme decorations.css files
- Animated: `background-size: 400% 400%; animation: bg-shift 15s ease infinite`
- Mesh: Multiple `radial-gradient()` layers at different positions
- Respect `prefers-reduced-motion` (disable animation, show static gradient)
- Use theme colors from tokens.json

**Effort:** Small (CSS additions to decorations.css)
**Source:** Visual Design Research, Section 2

---

## Section 2: New Interactive Components to Create

Beyond our current 22 components. Organized by priority wave.

### Wave 1: Quick Wins (each under 200 lines)

| # | Component | File to Create | What It Does | Reusability |
|---|-----------|---------------|-------------|-------------|
| 1 | **Flashlight Reveal** | `resources/components/flashlight-reveal.html` | Dark overlay with cursor-following light circle revealing hidden content | HIGH -- works for any discovery activity |
| 2 | **Memory Match** | `resources/components/memory-match.html` | Card-flipping matching pairs game | HIGH -- works for any term/definition content |
| 3 | **Branching Scenario** | `resources/components/branching-scenario.html` | Choose-your-own-adventure decision engine | HIGH -- works for any scenario training |
| 4 | **Spinner Wheel** | `resources/components/spinner-wheel.html` | Spinning wheel for random category/question selection | MEDIUM -- gamified review activity |
| 5 | **Hidden Object** | `resources/components/hidden-object.html` | Two images side-by-side, find the differences | MEDIUM -- visual comparison exercises |

### Wave 2: Medium Effort

| # | Component | File to Create | What It Does | Reusability |
|---|-----------|---------------|-------------|-------------|
| 6 | **Escape Room** | `resources/components/escape-room.html` | Room with puzzles, locks, timer, inventory | MEDIUM -- assessment/review activity |
| 7 | **Progress Journey Map** | `resources/components/progress-journey.html` | SVG winding path with lesson waypoints | HIGH -- replaces boring nav lists |
| 8 | **Word Search** | `resources/components/word-search.html` | Generated letter grid with hidden words | MEDIUM -- vocabulary reinforcement |
| 9 | **Visual Novel / Dialogue** | `resources/components/visual-novel.html` | Character portraits with dialogue + choices | MEDIUM -- conversation simulations |
| 10 | **Drawing Canvas** | `resources/components/drawing-canvas.html` | Whiteboard for annotation/labeling exercises | MEDIUM -- diagram labeling, freeform response |

### Wave 3: Advanced

| # | Component | File to Create | What It Does | Reusability |
|---|-----------|---------------|-------------|-------------|
| 11 | **Crossword Puzzle** | `resources/components/crossword.html` | Classic crossword with clues | MEDIUM -- vocabulary assessment |
| 12 | **Interactive Map** | `resources/components/interactive-map.html` | SVG regions clickable with info panels | MEDIUM -- geography, anatomy, facility tours |
| 13 | **Decision Simulator** | `resources/components/decision-sim.html` | Multi-round business decision game with dashboard | LOW-MEDIUM -- leadership/finance training |
| 14 | **Jigsaw Puzzle** | `resources/components/jigsaw.html` | Drag pieces to reassemble image/process | MEDIUM -- process sequencing |
| 15 | **Physics Sandbox** | `resources/components/physics-sandbox.html` | Canvas-based physics demo (gravity, collision) | LOW -- science courses only |

**Total new components: 15** (bringing library from 22 to 37)

---

## Section 3: CSS/JS Patterns to Add

### To `resources/css/base.css` -- Add These Utility Classes

```
ADDITIONS (add to end of base.css):

1. Premium Shadow System (~20 lines)
   --shadow-small, --shadow-medium, --shadow-large CSS custom properties
   .shadow-sm, .shadow-md, .shadow-lg utility classes
   Layered shadows at doubling distances for realistic depth

2. Micro-Interaction Classes (~30 lines)
   .elastic-click -- scale(0.97) on :active
   .hover-lift -- translateY(-2px) + shadow-medium on :hover
   .magnetic-btn -- slight movement toward cursor direction on hover

3. Spring Easing Variables (~15 lines)
   --spring-gentle, --spring-bouncy, --spring-snappy using linear() function
   Fallback to cubic-bezier for older browsers

4. Grain Overlay (~15 lines)
   .has-grain::before -- inline SVG feTurbulence noise texture
   Opacity: 0.08 default, customizable via --grain-opacity

5. Gradient Text (~8 lines)
   .text-gradient -- background-clip: text with gradient from --accent to --accent-secondary

6. Glass Panels (~20 lines)
   .glass -- backdrop-filter: blur(12px) with rgba bg and subtle border
   .glass-dark, .glass-light variants

7. Clip-Path Transitions (~25 lines)
   .reveal-circle, .reveal-diagonal, .reveal-spotlight
   Slide transition effects using clip-path animation

8. Reduced Motion (~10 lines)
   @media (prefers-reduced-motion: reduce) block disabling all animations
```

**Total addition to base.css: ~145 lines**

### To Each Theme's `decorations.css` -- Add These Effects

```
1. Animated gradient background class (.animated-bg)
2. Mesh gradient background class (.mesh-gradient) using theme colors
3. Grain overlay tuned to theme's color temperature
4. Glass card variant using theme's accent color for border tint
5. Glow accent for dark themes (.glow-accent)
```

### New Engine Files to Create

| File | Purpose | Size | Wave |
|------|---------|------|------|
| `resources/engine/sound-effects.js` | Web Audio synthesized UI sounds | ~120 lines | Wave 1 |
| `resources/engine/confetti.js` | Canvas confetti particle system | ~80 lines | Wave 1 |
| `resources/engine/achievement-system.js` | Badge/achievement manager + notifications | ~150 lines | Wave 1 |

---

## Section 4: Art Director Agent Prompting Upgrades

### Current Problem

The Art Director agent produces "nice" output but not "Stripe/Linear-level wow." The gap is **specificity** -- our prompts are too vague about what premium design actually means.

### Upgrade: Embed Anthropic's 5-Dimension Framework

Add these 5 dimensions as NON-NEGOTIABLE requirements in the Art Director agent's system prompt:

```
DESIGN QUALITY RULES (5 Dimensions -- ALL must be addressed):

1. TYPOGRAPHY
   - NEVER use Inter, Roboto, Open Sans, Arial, or system defaults
   - ALWAYS pair a distinctive display font with a clean body font
   - Specify: family, weight, size scale, letter-spacing, line-height
   - Recommended pairings:
     Technical: Clash Display + Inter (exception: Inter ok for body with distinctive display)
     Corporate: Gilroy + Source Sans 3
     Playful: Space Grotesk + DM Sans
     Editorial: Playfair Display + Lora
     Arabic: Noto Kufi Arabic + Cairo

2. COLOR
   - Commit to a DOMINANT color + SHARP accent (not 5 equal colors)
   - Follow the 60-30-10 rule: 60% dominant, 30% secondary, 10% accent
   - Never use pure black (#000) for dark themes -- use tinted near-blacks
   - Include premium palette recipes from research:
     Stripe: #0a2540 + #635bff + #00d4aa
     Linear: #0A0A0B + #5E6AD2
     Warm Dark: #1a1418 + #f59e0b
     Ocean Deep: #0c1222 + #38bdf8
     Forest: #0a1a0e + #34d399

3. MOTION
   - Define entrance animations in tokens.json (duration, easing)
   - Specify stagger timing (80-120ms between items)
   - Include celebration animation direction (confetti colors, intensity)
   - Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94) for elegance

4. BACKGROUNDS
   - Never specify solid colors -- always layered
   - Include grain overlay opacity (0.05-0.15)
   - Specify gradient type: linear, radial mesh, animated
   - Include decorative elements: geometric shapes, glows, particles

5. SPATIAL COMPOSITION
   - Specify section padding (60-120px between major sections)
   - Content max-width and alignment
   - Asymmetric vs centered layout preference
   - Overlap/layering direction
```

### Upgrade: Enhanced tokens.json Output

The Art Director should output an expanded tokens.json that includes:

```json
{
  "meta": { "name": "theme-name", "mood": "2-3 mood keywords" },
  "colors": {
    "primary": "#...", "primaryLight": "#...", "primaryDark": "#...",
    "secondary": "#...", "accent": "#...", "accentRgb": "R, G, B",
    "background": "#...", "surface": "#...", "surfaceElevated": "#...",
    "text": "#...", "textSecondary": "#...", "textOnPrimary": "#...",
    "success": "#...", "warning": "#...", "error": "#...",
    "border": "#...", "borderSubtle": "#..."
  },
  "typography": {
    "fontFamilyDisplay": "Clash Display",
    "fontFamilyBody": "DM Sans",
    "fontFamilyMono": "JetBrains Mono",
    "fontSizeHero": "clamp(48px, 8vw, 80px)",
    "fontSizeH1": "clamp(36px, 6vw, 64px)",
    "... (full scale)"
  },
  "shadows": {
    "small": "0.5px 1px 1px hsl(var(--shadow-hue) 3% 15% / 0.7)",
    "medium": "multiple layered shadows",
    "large": "multiple layered shadows at doubling distances",
    "glow": "0 0 20px rgba(accent, 0.3)"
  },
  "animation": {
    "staggerDelay": "100ms",
    "entranceDuration": "500ms",
    "entranceEasing": "cubic-bezier(0.22, 1, 0.36, 1)",
    "springBouncy": "linear(0, 0.004, ... 1)",
    "celebrationColors": ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"]
  },
  "grain": {
    "opacity": 0.08,
    "blendMode": "overlay"
  }
}
```

### Upgrade: Add Theme Validation Step

After generating tokens.json, the Art Director should self-validate:
1. Do text colors meet WCAG AA (4.5:1) against backgrounds?
2. Are fonts distinctive (not Inter/Roboto)?
3. Is there a clear dominant + accent pattern?
4. Do shadows include color tinting from the primary?
5. Are celebration colors defined?

**Source:** AI Design Prompting Research, Sections 2, 7, 10

---

## Section 5: Content Renderer Agent Prompting Upgrades

### Current Problem

The Content Renderer produces correct HTML but visually generic output. It does not leverage the visual research findings.

### Upgrade: Embed the Full Aesthetic Framework

Replace the current rendering instructions with this enhanced system prompt section:

```
AESTHETIC RULES (Apply to EVERY slide):

FOUNDATION (apply automatically -- no exceptions):
- Load .has-grain on slide backgrounds (subtle texture)
- Use .stagger-item on all content blocks (entrance animation)
- Apply .elastic-click on all buttons and interactive elements
- Apply .hover-lift on all cards and clickable containers
- Use .shadow-sm on resting cards, .shadow-md on hover

TYPOGRAPHY:
- Slide title: var(--font-display), font-size var(--text-h2), font-weight 700
  letter-spacing: -0.02em, line-height: 1.15
- Body text: var(--font-body), font-size var(--text-base), line-height: 1.6
- Use .text-gradient on section/module headings for emphasis
- Use clamp() for responsive sizing

COLOR:
- Read ALL colors from CSS custom properties (never hardcode)
- Use dominant + accent pattern (not rainbow)
- Dark themes: surface elevation = lighter colors (opposite of light themes)
- Quiz feedback: --color-success (correct), --color-error (incorrect)

MOTION:
- Every slide entrance: staggered fade-in-up (100ms delay between items)
- Easing: var(--easing-default) for smooth, var(--spring-bouncy) for playful
- One "hero moment" per slide (a larger, more dramatic animation)
- Respect prefers-reduced-motion ALWAYS

BACKGROUNDS:
- Reference decorations.css for atmospheric effects
- Use .animated-bg for hero/intro slides
- Use .mesh-gradient for section dividers
- Never solid white/black -- always layered gradients or tinted surfaces

INTERACTIVE ELEMENTS:
- Every lesson: minimum 2 interactive components from library
- All components get: hover state, active state, focus-visible ring
- Touch targets: minimum 44px
- Smooth CSS transitions on ALL state changes (200-300ms)

SOUND INTEGRATION (if sound-effects.js loaded):
- Quiz option click: sounds.click()
- Correct answer: sounds.success()
- Wrong answer: sounds.error()
- Quiz pass: sounds.celebration()
- Slide transition: sounds.whoosh()
```

### Upgrade: View Transitions API for Slide Navigation

Add slide-to-slide transitions using the View Transitions API with graceful fallback:

```js
// In slide-controller.js, wrap slide changes:
function goToSlide(newSlide) {
  if (document.startViewTransition) {
    document.startViewTransition(() => renderSlide(newSlide));
  } else {
    renderSlide(newSlide); // Fallback: instant swap
  }
}
```

This gives us smooth crossfade or slide animations between slides for free in supported browsers.

### Upgrade: Bento Grid Layout for Overview Slides

Add a bento grid layout option for course overview, module summary, and dashboard slides:

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 180px;
  gap: 16px;
}
.bento-item-large { grid-column: span 2; grid-row: span 2; }
.bento-item-wide { grid-column: span 2; }
```

**Source:** AI Design Prompting Research, Sections 1, 2, 9; Visual Design Research, Sections 8, 9, 13

---

## Section 6: Game-Like Interaction Templates to Build

These are complete, reusable game experiences that can be selected during the Interview phase.

### Template 1: Room Exploration

**What the learner experiences:** They see a room/environment (office, lab, factory). They click on objects to discover information. A counter shows "4 of 8 discovered." They must find all items to proceed.

**How it works technically:**
- Full-width background image with absolutely-positioned hotspot buttons
- CSS pulse animation on undiscovered hotspots
- Click reveals an info panel overlay
- Progress counter stored in JS, written to `cmi.suspend_data`
- Completion gate: all items discovered = enable "Next" button

**Best for:** Onboarding, safety training, product knowledge, facility orientation

**Build on:** Our existing `hotspot.html` component + new discovery tracking logic

**Effort:** Medium
**Source:** E-Learning Showcase Research, Section 1.1; Game Interactions Research, Section 1A

---

### Template 2: Escape Room Challenge

**What the learner experiences:** They are "locked" in a virtual room. They must solve 3-5 puzzles (each testing course knowledge) to find combination codes. A timer counts down. Hints are available at a point cost. Solving all puzzles = "escape" and course completion.

**How it works technically:**
- Room scene with clickable objects (reuse hotspot pattern)
- Puzzle modals: combination lock (number inputs), question-answer, drag-match
- Timer: CSS conic-gradient countdown + JS interval
- Hint system: 3 progressive hints per puzzle (subtle highlight -> arrow -> text)
- Score = time remaining - hints used
- State machine tracks which puzzles are solved

**Best for:** Assessment/review, compliance certification, team building

**Effort:** Large
**Source:** E-Learning Showcase Research, Sections 1.3, 3.1; Game Interactions Research, Section 2C

---

### Template 3: Branching Comic / Graphic Novel

**What the learner experiences:** A story unfolds in comic-book panels with character dialogue in speech bubbles. At key moments, the learner chooses what to say or do. Their choices affect the story outcome. Different endings based on cumulative choices.

**How it works technically:**
- CSS Grid asymmetric panel layout mimicking comic pages
- Speech bubble components with CSS triangle pointers
- Character images positioned within panels
- Decision buttons styled as thought bubbles
- JS state machine tracks choices and loads next panel set
- CSS clip-path animations for panel wipe transitions

**Best for:** Soft skills, ethics scenarios, conflict resolution, customer service

**Effort:** Medium-Large
**Source:** E-Learning Showcase Research, Section 1.2; Game Interactions Research, Section 2A

---

### Template 4: Duolingo-Style Learning Path

**What the learner experiences:** Instead of a boring sidebar menu, they see a winding path with lesson waypoints. Completed lessons glow with checkmarks. The current lesson pulses. Locked lessons are dimmed. As they progress, the path fills in with color.

**How it works technically:**
- SVG `<path>` element for the winding road
- Circle nodes at waypoints with `.completed`, `.current`, `.locked` CSS states
- `stroke-dasharray` / `stroke-dashoffset` animation to fill the path progressively
- Click on completed/current nodes to navigate
- Module dividers as horizontal breaks in the path
- Data from `cmi.suspend_data` for state

**Best for:** ANY course -- replaces the sidebar navigation entirely

**Effort:** Medium
**Source:** E-Learning Showcase Research, Section 4.1; Game Interactions Research, Section 5A

---

### Template 5: Interactive Data Explorer

**What the learner experiences:** An interactive chart/diagram where sliders and toggles change the visualization in real-time. For example: drag a slider to change a variable and watch the graph update instantly. This is how Brilliant.org teaches abstract concepts.

**How it works technically:**
- SVG or Canvas chart with dynamic data
- Range input sliders for variable manipulation
- Real-time calculation + chart update on input change
- Step-by-step guided exploration (prompts tell learner what to try)
- CSS transitions for smooth visual updates

**Best for:** Math, science, statistics, data literacy, financial concepts

**Effort:** Medium-Large (varies by visualization complexity)
**Source:** E-Learning Showcase Research, Section 4.2; Game Interactions Research, Section 7A

---

### Template 6: Scrollytelling Lesson

**What the learner experiences:** Instead of fixed slides, content unfolds as they scroll. Different layers move at different speeds (parallax). Charts animate as they come into view. Numbers count up. It feels like reading a premium interactive article (like the New York Times "Snow Fall").

**How it works technically:**
- GSAP ScrollTrigger (free since 2025, ~45KB) or IntersectionObserver fallback
- Each "chapter" = full-viewport `<section>` with min-height: 100vh
- Pin elements while scroll text passes by
- Scrub: animations tied to scroll position
- Reveal: elements fade in as they enter viewport

**Best for:** Long-form narrative content, historical timelines, case studies, data stories

**Important:** This breaks the fixed-slide paradigm -- use for specific lesson types only, not for quizzes

**Effort:** Medium
**Source:** Game Interactions Research, Section 3A; Visual Design Research, Section 12

---

## Section 7: Sound Design Integration

### The Opportunity

Currently our courses are completely silent. Every competing platform (Duolingo, Brilliant, Khan Academy, Codecademy) uses audio feedback. The research reveals we can add professional-quality sounds using zero audio files through the Web Audio API.

### The Sound Palette (6 Sounds)

| Sound | When to Play | Technical Description |
|-------|-------------|----------------------|
| **Click** | Any button/option tap | 800Hz square wave, 50ms, very quiet |
| **Success** | Correct answer | Rising two-note chime: C5 to E5, sine wave |
| **Error** | Wrong answer | Low descending buzz: 200Hz to 150Hz, sawtooth |
| **Celebration** | Quiz pass, achievement unlock | Ascending arpeggio: C5-E5-G5-C6, 4 notes |
| **Whoosh** | Slide transition | Rapid frequency sweep 100Hz to 2000Hz, bandpass filtered |
| **Pop** | Button interaction, item pickup | Quick sine 600Hz to 200Hz drop, 100ms |

### Implementation Plan

1. Create `resources/engine/sound-effects.js` with the `SoundEffects` class
2. Lazy initialization: AudioContext created on first user click (browser requirement)
3. Add a sound preference toggle: `sounds.muted = true/false`
4. Persist preference in `cmi.suspend_data`
5. Integration points:
   - `quiz-engine.js`: call `sounds.success()` / `sounds.error()` on answer check
   - `slide-controller.js`: call `sounds.whoosh()` on slide transition
   - `gamification.js`: call `sounds.celebration()` on achievement
   - All interactive components: call `sounds.click()` on interaction

### Performance

- Zero file downloads (sounds are mathematically generated)
- Each sound is ~3-5 lines of oscillator code
- Garbage collected immediately after playing
- No performance impact on animations or rendering

**Source:** CSS/JS Techniques Research, Section 6

---

## Section 8: Specific File Changes Needed

### Files to CREATE (New)

| File | Purpose | Lines | Wave |
|------|---------|-------|------|
| `resources/engine/sound-effects.js` | Synthesized UI sounds | ~120 | 1 |
| `resources/engine/confetti.js` | Canvas confetti particle system | ~80 | 1 |
| `resources/engine/achievement-system.js` | Badge/achievement manager | ~150 | 1 |
| `resources/components/flashlight-reveal.html` | Spotlight discovery interaction | ~80 | 1 |
| `resources/components/memory-match.html` | Card matching game | ~120 | 1 |
| `resources/components/branching-scenario.html` | Decision tree engine | ~200 | 1 |
| `resources/components/spinner-wheel.html` | Random selection wheel | ~100 | 1 |
| `resources/components/hidden-object.html` | Find-the-difference activity | ~100 | 1 |
| `resources/components/escape-room.html` | Puzzle chain game template | ~400 | 2 |
| `resources/components/progress-journey.html` | SVG learning path map | ~200 | 2 |
| `resources/components/word-search.html` | Word search puzzle | ~250 | 2 |
| `resources/components/visual-novel.html` | Character dialogue system | ~200 | 2 |
| `resources/components/drawing-canvas.html` | Annotation/whiteboard | ~150 | 2 |
| `resources/components/crossword.html` | Crossword puzzle | ~300 | 3 |
| `resources/components/interactive-map.html` | SVG region exploration | ~200 | 3 |

### Files to MODIFY (Existing)

| File | Changes | Wave |
|------|---------|------|
| `resources/css/base.css` | Add ~145 lines: shadow system, micro-interactions, grain, gradient text, glass, clip-path, reduced motion | 1 |
| `themes/space-explorer/decorations.css` | Add glassmorphism, animated gradient, glow accent classes | 1 |
| `themes/technical-dark/decorations.css` | Add glassmorphism, animated gradient, glow accent classes | 1 |
| `themes/bold-gradient/decorations.css` | Add mesh gradient, animated bg classes | 1 |
| `themes/playful-bright/decorations.css` | Add spring animations, bouncy easing | 1 |
| `themes/corporate-clean/decorations.css` | Add glass-light, layered shadows | 1 |
| Each theme's `tokens.json` | Add shadow, animation, grain, and accentRgb tokens | 1 |
| `resources/engine/quiz-engine.js` | Integrate sound-effects.js calls | 1 |
| `resources/engine/slide-controller.js` | Integrate sound-effects.js + View Transitions API | 1 |
| `resources/gamification.js` | Integrate confetti.js + achievement-system.js | 1 |

### Files to UPDATE (Agent Prompts)

| File | Changes | Wave |
|------|---------|------|
| `.claude/skills/scorm-generator/SKILL.md` | Add new components to library list (Section 7), update Phase 3 with 5-dimension framework, update Phase 7 with aesthetic rules, add sound integration to Phase 7 | 1 |
| Art Director agent `.md` | Embed 5-dimension design quality rules, enhanced tokens.json format, validation step | 1 |
| Content Renderer agent `.md` | Embed full aesthetic framework, View Transitions, bento grid, sound integration | 1 |
| Interview agent `.md` | Add game template selection question (escape room, branching, exploration, etc.) | 2 |

---

## Section 9: Priority Order -- The 3 Waves

### Wave 1: Quick Wins (1 Session)

**Goal:** Make existing output look 2x more premium with minimal effort.

| # | Task | Impact | Effort | Type |
|---|------|--------|--------|------|
| 1 | Add premium CSS utilities to base.css (shadows, grain, gradient text, elastic click, hover lift, glass, spring easing) | VERY HIGH | Small | CSS |
| 2 | Create `sound-effects.js` | HIGH | Small | JS |
| 3 | Create `confetti.js` | HIGH | Small | JS |
| 4 | Create `flashlight-reveal.html` component | HIGH | Small | Component |
| 5 | Create `memory-match.html` component | HIGH | Small | Component |
| 6 | Update theme decorations.css files with glassmorphism + animated gradients | HIGH | Small | CSS |
| 7 | Update all theme tokens.json with shadow/animation/grain tokens | MEDIUM | Small | Config |
| 8 | Integrate sounds into quiz-engine.js + slide-controller.js | MEDIUM | Small | JS |
| 9 | Integrate confetti into gamification.js | MEDIUM | Small | JS |
| 10 | Update Art Director agent prompt with 5-dimension framework | HIGH | Small | Prompt |
| 11 | Update Content Renderer agent prompt with aesthetic rules | HIGH | Small | Prompt |

**Wave 1 delivers:**
- Every course automatically gets premium shadows, grain textures, micro-interactions, and gradient text
- Sound effects on quiz interactions and navigation
- Confetti celebrations on quiz pass and achievements
- 2 new interactive components (flashlight reveal, memory match)
- Art Director produces Stripe/Linear-quality design tokens
- Content Renderer produces visually stunning slides

---

### Wave 2: Medium Effort (1-2 Sessions)

**Goal:** Add game-like interactions and advanced visual capabilities.

| # | Task | Impact | Effort | Type |
|---|------|--------|--------|------|
| 1 | Create `branching-scenario.html` component | VERY HIGH | Medium | Component |
| 2 | Create `achievement-system.js` | HIGH | Medium | JS |
| 3 | Create `escape-room.html` template | HIGH | Large | Component |
| 4 | Create `progress-journey.html` (SVG learning path) | HIGH | Medium | Component |
| 5 | Create `spinner-wheel.html` | MEDIUM | Small | Component |
| 6 | Create `hidden-object.html` | MEDIUM | Small | Component |
| 7 | Create `word-search.html` | MEDIUM | Medium | Component |
| 8 | Create `visual-novel.html` (dialogue system) | HIGH | Medium | Component |
| 9 | Create `drawing-canvas.html` | MEDIUM | Medium | Component |
| 10 | Add View Transitions API to slide-controller.js | MEDIUM | Small | JS |
| 11 | Add bento grid layout option to base.css | MEDIUM | Small | CSS |
| 12 | Update SKILL.md with all new components and templates | HIGH | Small | Docs |
| 13 | Update Interview agent to ask about game template preferences | MEDIUM | Small | Prompt |

**Wave 2 delivers:**
- Branching scenarios for soft skills training
- Full escape room game template
- Visual learning path navigation
- Achievement/badge collection system
- 5 more interactive components (spinner, hidden object, word search, visual novel, drawing)
- Smooth slide transitions in modern browsers
- Bento grid layout for dashboard/overview slides

---

### Wave 3: Advanced (Multiple Sessions)

**Goal:** Push toward feature parity with Storyline 360 and beyond.

| # | Task | Impact | Effort | Type |
|---|------|--------|--------|------|
| 1 | Create `crossword.html` | MEDIUM | Medium | Component |
| 2 | Create `interactive-map.html` | MEDIUM | Medium | Component |
| 3 | Create `decision-sim.html` (business simulator) | HIGH | Large | Component |
| 4 | Create `jigsaw.html` | MEDIUM | Medium | Component |
| 5 | Create `physics-sandbox.html` | MEDIUM | Large | Component |
| 6 | Add scrollytelling engine (GSAP ScrollTrigger integration) | HIGH | Medium | JS |
| 7 | Add 3D card tilt effect as utility class | MEDIUM | Small | JS+CSS |
| 8 | Add kinetic typography animations | MEDIUM | Medium | CSS |
| 9 | Add dark/light mode toggle with `light-dark()` CSS function | MEDIUM | Medium | CSS |
| 10 | Add container queries to all 37 components for layout portability | HIGH | Large | CSS |
| 11 | Create comic-panel layout system for branching scenarios | HIGH | Medium | CSS+JS |
| 12 | Add streaks tracking system (consecutive day learning) | MEDIUM | Medium | JS |

**Wave 3 delivers:**
- Full game template library (escape room, crossword, jigsaw, decision sim)
- Scrollytelling capability for narrative lessons
- 3D effects and kinetic typography
- Dark/light mode support per course
- All components responsive via container queries
- Comic-panel branching scenario layout
- Streak-based engagement system

---

## Summary: What Changes After Each Wave

### After Wave 1 (1 session of work)

| Aspect | Before | After |
|--------|--------|-------|
| **Visual Quality** | Clean but flat | Premium with grain, shadows, gradient text, glassmorphism |
| **Sound** | Silent | Click, success, error, celebration sounds |
| **Celebrations** | Text message only | Confetti particles + sound + message |
| **Interactions** | 22 components | 24 components (+ flashlight, memory match) |
| **Art Direction** | Generic tokens | Stripe/Linear-quality design system output |
| **Rendering** | Correct HTML | Visually stunning HTML with micro-interactions |
| **Component Count** | 22 | 24 |

### After Wave 2 (2-3 sessions total)

| Aspect | Before | After |
|--------|--------|-------|
| **Game Interactions** | None | Branching scenarios, escape rooms, visual novels |
| **Navigation** | Sidebar list | SVG learning journey path option |
| **Achievements** | Points only | Full badge/achievement system with notifications |
| **Slide Transitions** | Instant swap | Smooth crossfade/slide via View Transitions API |
| **Layout Options** | Fixed slide only | Fixed slide + bento grid + scrollable |
| **Component Count** | 24 | 33 |

### After Wave 3 (5+ sessions total)

| Aspect | Before | After |
|--------|--------|-------|
| **Game Templates** | Escape room only | Escape room + crossword + jigsaw + decision sim + physics |
| **Narrative** | Linear only | Comic panels, scrollytelling, visual novels |
| **Responsiveness** | Viewport-based | Container query-based (components adapt to context) |
| **Theme Flexibility** | Light or dark | Light/dark toggle per course |
| **3D Effects** | Flip cards only | 3D tilt, perspective, kinetic typography |
| **Engagement** | Points + badges | Points + badges + streaks + leaderboard |
| **Component Count** | 33 | 37+ |
| **Storyline Parity** | ~55% | ~80%+ |

---

## Appendix: Research Document Index

| Document | Key Contributions to This Plan |
|----------|-------------------------------|
| **elearning-showcase-research.md** | Top 10 interaction patterns, Duolingo/Brilliant/Khan analysis, "wow vs meh" criteria, celebration system design |
| **game-interactions-research.md** | 15 new component designs, game framework comparison, puzzle types, room exploration + escape room patterns |
| **visual-design-research.md** | Stripe/Linear/Arc analysis, glassmorphism, grain, gradient text, shadows, dark theme rules, bento grids, micro-interactions |
| **css-js-techniques-research.md** | Spring physics CSS, confetti system, Web Audio sounds, SVG animations, touch gestures, clip-path transitions, View Transitions API |
| **ai-design-prompting-research.md** | Anthropic's 5-dimension framework, v0/Bolt prompt techniques, Art Director + Content Renderer prompt upgrades, tokens.json generation |

---

*This plan was synthesized from 5 research documents totaling ~5,000 lines of research. Every recommendation includes the specific research source and implementation path. The priority ordering (Wave 1 > 2 > 3) is based on the ratio of "wow impact" to "implementation effort" -- Wave 1 items deliver the most visual transformation for the least work.*
