---
name: scorm-generator
description: Complete SCORM e-learning engine with player shell, quiz engine, 42 interactive components, 16 engine files, premium visual system (grain, glass, gradients, shadows, spring easing, sound effects, confetti, achievements), state machine, trigger system, branching, audio narration, and LMS-ready packaging. Use when generating SCORM courses, creating interactive lessons, building quizzes, rendering HTML content, or packaging ZIP files. Covers SCORM 1.2/2004, behavioral tracking, gamification, and WCAG 2.1 AA accessibility.
---

# SCORM Generator Skill

Complete e-learning engine for generating Storyline-quality (and better) SCORM packages with AI.

## Triggers

Activate this skill when:
- User mentions "SCORM", "e-learning", "LMS content", "course"
- User wants to create training modules or lessons
- User needs interactive quizzes or assessments
- User mentions Moodle, Canvas, Blackboard, or other LMS
- User asks about packaging or imsmanifest.xml
- User wants to create any interactive learning component

---

## Production Pipeline Overview

The SCORM creation pipeline has 8 phases. Each phase reads the previous phase's output.

```
Phase 1: Interview        → specs/[course]_spec.md
Phase 2: Design           → specs/[course]_structure.md
Phase 3: Art Direction     → art-direction/[course]_style.md + _tokens.json + _theme.css
Phase 4: Visual Generation → output/[course]/shared/assets/images/
Phase 5: Animation         → output/[course]/shared/assets/videos/ (or CSS fallback)
Phase 6: Assessment        → output/[course]/content/questions.json
Phase 7: Content Rendering → output/[course]/sco_*/ + shared/
Phase 8: Packaging         → output/[course]/imsmanifest.xml + .zip

Sequential:  Interview → Design → Art Direction
Parallel:    [Visual Generation + Animation + Assessment]
Sequential:  Content Rendering → Packaging
```

### Conventions

- Course specs: `specs/[course-slug]_spec.md`
- Learning structures: `specs/[course-slug]_structure.md`
- Style guides: `art-direction/[course-slug]_style.md`
- Design tokens: `art-direction/[course-slug]_tokens.json`
- Theme CSS: `art-direction/[course-slug]_theme.css`
- Output: `output/[course-slug]/`
- Progress tracking: `specs/[course-slug]_progress.json`
- File naming: lowercase, hyphens, no spaces
- SCORM version: Default to 1.2 unless user requests 2004

---

## Engine Architecture

The engine follows a layered architecture. NOT all files are required for every course — include only what you need.

### Layer 1: Foundation (Always Required)
```
resources/css/base.css           <- Layout, typography, buttons, cards, quiz styles
resources/engine/slide-controller.js  <- Slide navigation, swipe, keyboard
resources/scorm-api.js           <- SCORM 1.2/2004 LMS communication
```

### Layer 2: Interactivity (Include as needed)
```
resources/engine/quiz-engine.js        <- Quiz logic, review, retry, attempts, SCORM reporting
resources/engine/state-engine.js       <- Object states (hover, selected, visited, disabled, custom)
resources/engine/trigger-engine.js     <- Event+Action+Condition declarative system
resources/engine/variable-store.js     <- Project/slide variables, reactive updates
resources/engine/layer-system.js       <- Slide overlay layers (feedback, modals, reveal)
```

### Layer 3: Player Chrome (For full courses)
```
resources/css/player-shell.css         <- Player frame: topbar, sidebar, controls
resources/engine/player-shell.js       <- Sidebar, menu, glossary, resources, nav modes
resources/engine/lightbox.js           <- Modal/popup slides
resources/engine/captions.js           <- Closed captions (WebVTT sync)
resources/engine/audio-player.js       <- Narration, volume, cue points
```

### Layer 4: Intelligence (For adaptive courses)
```
resources/engine/branching-engine.js   <- Conditional navigation, remediation paths
resources/engine/question-bank.js      <- Random question draw, shuffle answers
resources/engine/interactivity-engine.js <- Unified entry point connecting all systems
```

### Layer 5: Engagement (Always include)
```
resources/behavior-tracker.js    <- Learning analytics (timing, scroll, navigation, quiz)
resources/gamification.js        <- Points, confetti, badges, growth mindset feedback
```

### Layer 5.5: Premium Experience (Highly recommended)
```
resources/engine/sound-effects.js      <- Synthesized Web Audio sounds (click, success, error, celebration, whoosh, pop)
resources/engine/confetti.js           <- Canvas particle celebration system (quiz pass, achievements, lesson complete)
resources/engine/achievement-system.js <- Badge/achievement manager with notification popups and gallery
```

## Interactive Components (42 total)

Copy-paste ready HTML snippets. Each is self-contained with inline CSS + JS. Organized into 7 categories.

### Content Components (7)
| Component | File | Use For |
|-----------|------|---------|
| Accordion | `resources/components/accordion.html` | Expandable sections |
| Tabs | `resources/components/tabs.html` | Tabbed content panels |
| Flip Card | `resources/components/flip-card.html` | Flashcards, term/definition |
| Click-Reveal | `resources/components/click-reveal.html` | Hidden content on click |
| Timeline | `resources/components/timeline.html` | Step-by-step process |
| Callout | `resources/components/callout.html` | Info/warning/tip boxes |
| Scroll Panel | `resources/components/scroll-panel.html` | Fixed-height scrollable area |

### Exploration Components (3)
| Component | File | Use For |
|-----------|------|---------|
| Markers | `resources/components/markers.html` | Hotspot pins on images with popups |
| Hotspot | `resources/components/hotspot.html` | Click-on-image-area interactions |
| Slider | `resources/components/slider.html` | Value selection with range input |

### Quiz Components (8)
| Component | File | Use For |
|-----------|------|---------|
| Checkbox Quiz | `resources/components/checkbox-quiz.html` | Multiple response (select all) |
| Fill-in-the-Blank | `resources/components/fill-blank.html` | Text input answer |
| Numeric Entry | `resources/components/numeric-entry.html` | Number input with tolerance |
| Matching Dropdown | `resources/components/matching-dropdown.html` | Match pairs via dropdowns |
| Sequence Sort | `resources/components/sequence-sort.html` | Drag to reorder items |
| Word Bank | `resources/components/word-bank.html` | Drag words into blanks |
| Likert Scale | `resources/components/likert.html` | Survey rating scale |
| Text Response | `resources/components/text-response.html` | Short answer / essay |

### Advanced Components (4)
| Component | File | Use For |
|-----------|------|---------|
| Drag & Drop | `resources/components/drag-drop.html` | Free drag with keyboard support |
| Button Set | `resources/components/button-set.html` | Radio group with visual objects |
| Dial | `resources/components/dial.html` | Rotary knob control |
| Per-Choice Feedback | `resources/components/per-choice-feedback.html` | Targeted feedback per answer |

### Game Components (10 NEW)
| Component | File | Use For |
|-----------|------|---------|
| Flashlight Reveal | `resources/components/flashlight-reveal.html` | Dark overlay with cursor-following spotlight revealing hidden content |
| Memory Match | `resources/components/memory-match.html` | Card-flipping matching pairs game (term/definition, image/label) |
| Branching Scenario | `resources/components/branching-scenario.html` | Choose-your-own-adventure decision engine with path tracking |
| Escape Room | `resources/components/escape-room.html` | Puzzle chain game with timer, hints, combination locks |
| Spinner Wheel | `resources/components/spinner-wheel.html` | Spinning wheel for random category/question selection |
| Hidden Object | `resources/components/hidden-object.html` | Find-the-difference or spot hidden items in a scene |
| Progress Journey | `resources/components/progress-journey.html` | SVG winding path with lesson waypoints (replaces boring nav lists) |
| Visual Novel | `resources/components/visual-novel.html` | Character portraits with dialogue bubbles and choices |
| Drawing Canvas | `resources/components/drawing-canvas.html` | Whiteboard for annotation, labeling, and freeform drawing |
| Word Search | `resources/components/word-search.html` | Generated letter grid with hidden vocabulary words |

### Gap-Fill Components (5 NEW)
| Component | File | Use For |
|-----------|------|---------|
| Content Carousel | `resources/components/content-carousel.html` | Swipeable card carousel for content browsing |
| Character Avatar | `resources/components/character-avatar.html` | Customizable character guide/mascot for course narration |
| Software Sim | `resources/components/software-sim.html` | Click-through software simulation with highlighted UI steps |
| Interactive Checklist | `resources/components/interactive-checklist.html` | Trackable checklist with progress bar and persistence |
| Labeled Graphic | `resources/components/labeled-graphic.html` | Image with positioned labels and expandable descriptions |

### Advanced Simulation (5 NEW)
| Component | File | Use For |
|-----------|------|---------|
| Crossword | `resources/components/crossword.html` | Classic crossword puzzle with clues for vocabulary assessment |
| Interactive Map | `resources/components/interactive-map.html` | SVG regions clickable with info panels (geography, anatomy, tours) |
| Decision Sim | `resources/components/decision-sim.html` | Multi-round business/leadership decision game with dashboard |
| Jigsaw | `resources/components/jigsaw.html` | Drag pieces to reassemble image or process diagram |
| Physics Sandbox | `resources/components/physics-sandbox.html` | Canvas-based physics demo (gravity, collision, forces) |

## Icons (8 SVG)

All icons use `currentColor` for auto-theming:
```
resources/icons/arrow-next.svg, arrow-prev.svg
resources/icons/check-circle.svg, x-circle.svg
resources/icons/info.svg, warning.svg
resources/icons/star.svg, trophy.svg
```

---

## Premium Visual System

CSS utility classes in `resources/css/base.css` that elevate every course from "template" to "premium."

### Shadow System
Layered shadows at doubling distances for realistic depth:
```css
.shadow-sm   /* Subtle resting state */
.shadow-md   /* Hover/elevated state */
.shadow-lg   /* Modal/overlay state */
```
Shadows use `--shadow-small`, `--shadow-medium`, `--shadow-large` custom properties from tokens.json.

### Micro-Interactions
```css
.elastic-click   /* Buttons squish on press: scale(0.97) */
.hover-lift      /* Cards float up 2px with shadow deepening on hover */
.magnetic-btn    /* Slight movement toward cursor on hover */
```

### Spring Easing
CSS custom properties using `linear()` function with cubic-bezier fallback:
```css
--spring-gentle   /* Soft overshoot, natural feel */
--spring-bouncy   /* Noticeable bounce, playful */
--spring-snappy   /* Quick snap into place */
```

### Grain Texture
```css
.has-grain   /* Inline SVG feTurbulence noise overlay, --grain-opacity: 0.08 */
```
Adds film-like warmth and depth to backgrounds. Works on any theme.

### Glassmorphism
```css
.glass         /* backdrop-filter: blur(12px) + rgba bg + subtle border */
.glass-dark    /* Dark variant for dark themes */
.glass-light   /* Light variant for light themes */
```
Limit to 2-3 glass elements per viewport for performance.

### Gradient Text
```css
.text-gradient   /* background-clip: text with gradient from --accent to --accent-secondary */
```
Use on section/module headings for emphasis.

### Animated Backgrounds
```css
.animated-bg     /* Multi-color gradient shifting over 15-20s */
.mesh-gradient   /* Layered radial gradients for mesh effect (like Stripe) */
```
Always respect `prefers-reduced-motion`.

### Clip-Path Reveals
```css
.reveal-circle    /* Circular clip-path expansion for slide transitions */
.reveal-chevron   /* Directional chevron wipe effect */
```

### Usage Rule
Every course MUST feel alive: use `.elastic-click` on all buttons, `.hover-lift` on all cards, `.stagger-item` on all content blocks. This is the baseline, not optional.

---

## Sound Design

Subtle, synthesized UI sounds using the Web Audio API. Zero audio files needed.

### 6 Synthesized Sounds
| Sound | When to Play | Description |
|-------|-------------|-------------|
| `click` | Any button/option tap | 800Hz square wave, 50ms, very quiet |
| `success` | Correct answer | Rising two-note chime: C5 to E5, sine wave |
| `error` | Wrong answer | Low descending buzz: 200Hz to 150Hz, sawtooth |
| `celebration` | Quiz pass, achievement | Ascending arpeggio: C5-E5-G5-C6, 4 notes |
| `whoosh` | Slide transition | Rapid frequency sweep with bandpass filter |
| `pop` | Item pickup, button interaction | Quick sine drop from 600Hz to 200Hz |

### Integration Points
- `quiz-engine.js`: `sounds.success()` / `sounds.error()` on answer check
- `slide-controller.js`: `sounds.whoosh()` on slide transition
- `gamification.js`: `sounds.celebration()` on achievement/quiz pass
- All interactive components: `sounds.click()` on interaction

### Preferences
- Subtle style by default (not loud or jarring)
- Mute toggle persisted in `cmi.suspend_data`
- AudioContext lazy-initialized on first user click (browser requirement)

---

## Design Quality Framework (5 Dimensions)

Based on Anthropic's Frontend Aesthetics research. Apply to EVERY course.

### 1. Typography
- NEVER use Inter, Roboto, Open Sans, Arial, or system defaults
- ALWAYS pair a distinctive display font with a clean body font
- Each course must have a unique typographic identity
- Specify: family, weight, size scale, letter-spacing, line-height

### 2. Color
- Commit to a DOMINANT color + SHARP accent (not 5 equal colors)
- Follow 60-30-10 rule: 60% dominant, 30% secondary, 10% accent
- Never use pure black (#000) for dark themes -- use tinted near-blacks
- Accent must contrast strongly against primary

### 3. Motion
- High-impact orchestrated moments, not scattered micro-interactions
- Staggered fade-in-up for content blocks (80-120ms delay between items)
- One "hero moment" animation per slide
- Always respect `prefers-reduced-motion`

### 4. Backgrounds
- Never solid white or plain colors
- Layer gradients, grain textures, geometric patterns for atmosphere
- Create depth with overlapping elements and shadows
- Use decorations.css for atmospheric effects

### 5. Spatial Composition
- Unexpected layouts, asymmetry, overlap, diagonal flow
- Generous negative space (48-80px between major sections)
- Grid-breaking hero elements
- Content max-width 900px centered in 1280x720 viewport

---

## Theme System (Reference-Based Approach)

Themes in the `themes/` directory are **reference examples for inspiration**, NOT templates to copy directly.

### How Themes Work
1. **Art Director reads ALL themes** in `themes/` directory for inspiration
2. **Creates a UNIQUE theme** for each course based on topic, audience, and mood
3. **Uses premium CSS utilities** (grain, glass, gradients, shadows, spring easing) from base.css
4. **Saved course themes** can be reused for related courses in the same series

### Reference: theme-dna.md
The Art Director should also read `resources/theme-dna.md` for curated DNA strands:
- Color DNA: 5 premium palette recipes with hex values
- Font DNA: 10 distinctive font pairings with personality descriptions
- Background DNA: 6 background pattern recipes
- Spacing DNA: comfortable vs dense layout patterns
- Motion DNA: subtle vs energetic motion presets

### Available Theme References
```
themes/
  _base/base.css              <- Shared foundation (never modify)
  space-explorer/             <- Dark cosmic reference (astronomy, physics)
  corporate-clean/            <- Light professional reference (business)
  bold-gradient/              <- Vibrant gradient reference (creative)
  playful-bright/             <- Colorful gamified reference (youth)
  technical-dark/             <- Code editor reference (programming)
  brands/
    eduarabia/                <- EduArabia brand overlay
    nelc/                     <- NELC institutional brand overlay
```

---

## Phase 1: Interview Methodology

Use **transformation-first** methodology — start with WHO the learner becomes, work backwards.

### 7 Interview Phases

**Phase 1: Transformation Discovery** — "What will learners DO after this course that they cannot do now?"
- Transformation statement: "Learners will transform from [CURRENT] to [DESIRED] by developing [SKILLS]"

**Phase 2: Audience & Context** — Who, what they know, devices, LMS, language, RTL needs

**Phase 3: Learning Objectives** — SMART formula using Bloom's Taxonomy:
| Level | Verbs | Assessment |
|-------|-------|------------|
| Remember | List, name, identify | Recognition quiz |
| Understand | Describe, explain | Explanation tasks |
| Apply | Use, implement | Practice activities |
| Analyze | Compare, debug | Case studies |
| Evaluate | Assess, recommend | Scenario exercises |
| Create | Design, develop | Projects |

**Phase 4: Content Structure** — 3-6 modules, 3-7 lessons/module, 5-10 min/lesson

**Phase 5: Assessment Design** — Passing score, retries, question types, checkpoint strategy

**Phase 6: Art Direction** — Colors, typography, visual style, mood, assets needed

**Phase 7: Animation Preferences** — Intro videos, text animations, transitions, audio

### Interview Output Format

Save to `specs/[course-name]_spec.md`:
```markdown
# Course Specification: [Course Name]
## 1. Transformation
## 2. Audience (target, prior knowledge, context, devices, LMS, SCORM version, language)
## 3. Learning Objectives (per module: terminal + enabling objectives)
## 4. Content Structure (modules, lessons, durations, content types)
## 5. Assessment Strategy (checks, quizzes, final, retries)
## 6. Visual Style (colors, typography, style, mood)
## 7. Animation (intro, text, transitions, charts, accessibility)
## 8. Assets Needed (thumbnail, headers, illustrations, icons, infographics)
```

---

## Phase 2: Instructional Design

### Core Principles

**Bloom's Taxonomy** — Map each objective to cognitive level:
| Level | Focus | Assessment Type | Content Approach |
|-------|-------|-----------------|------------------|
| Remember | Facts, terms | Recognition quiz | Reference materials |
| Understand | Concepts | Explanation tasks | Examples, analogies |
| Apply | Procedures | Practice activities | Step-by-step guides |
| Analyze | Relationships | Case studies | Comparison tables |
| Evaluate | Judgments | Scenario exercises | Criteria frameworks |
| Create | New solutions | Projects | Templates, scaffolds |

**Gagne's Nine Events of Instruction** (apply within each lesson):
1. Gain attention (hook, question, scenario)
2. Inform objectives ("By the end you will...")
3. Stimulate recall (connect to prior knowledge)
4. Present content (core instruction)
5. Provide guidance (examples, tips)
6. Elicit performance (practice activity)
7. Provide feedback (correct/incorrect)
8. Assess performance (knowledge check)
9. Enhance retention (summary, next steps)

**Adult Learning (Andragogy)**: Self-direction, build on experience, relevance, problem-centered, internal motivation.

### SCO Naming Convention
- `sco_01_introduction` — Course intro
- `sco_02_m1_lesson1` — Module 1, Lesson 1
- `sco_03_m1_lesson2` — Module 1, Lesson 2
- `sco_04_m1_quiz` — Module 1 Quiz
- `sco_XX_final` — Final Assessment

### Checkpoint Rules
- **Knowledge Checks** (within lessons): 1-3 questions, low stakes, immediate feedback
- **Module Quizzes**: 5-10 questions, tracked score, minimum passing, can retry
- **Final Assessment**: Comprehensive, higher threshold, limited retries

### Duration Guidelines
| Content Type | Duration |
|--------------|----------|
| Text lesson | 3-5 min |
| Video lesson | 5-10 min |
| Interactive activity | 2-5 min |
| Knowledge check | 1-2 min |
| Module quiz | 5-10 min |
| Final assessment | 15-30 min |

### Output
Save to `specs/[course-name]_structure.md` with: course overview, module/lesson structure, SCO IDs, Bloom's levels, content types, learning path diagram, sequencing rules.

---

## Phase 3: Art Direction

### Workflow (Reference-Based, Not Copy-Based)
1. Read ALL themes in `themes/` directory as **inspiration/reference**
2. Read `resources/theme-dna.md` for curated DNA strands (palettes, fonts, patterns)
3. Create a **UNIQUE theme** for each course based on topic, audience, and mood
4. Use premium CSS utilities (grain, glass, gradients, shadows, spring easing) from base.css
5. Optionally select brand overlay from `themes/brands/`
6. Produce THREE output files

### Design Quality Standards (5 Dimensions -- NON-NEGOTIABLE)

Every theme must pass the "Would a designer say wow?" test. NO generic AI aesthetics.

1. **Typography**: Distinctive fonts -- NEVER Inter/Roboto/Arial. Pair bold display + refined body. Each course gets unique typographic identity.
2. **Color**: Bold committed palette. Dominant + sharp accent (60-30-10 rule). Never pure black (#000) for dark themes.
3. **Backgrounds**: Atmosphere + depth -- gradient meshes, grain overlays, geometric patterns, glassmorphism. Never flat solid.
4. **Motion**: High-impact orchestrated moments -- staggered reveals, spring easing, celebration animations. Define in tokens.json.
5. **Spatial**: Unexpected layouts, asymmetry, overlap, generous negative space (48-80px between sections).

### Output Files (THREE Required)

1. **Style guide**: `art-direction/[course-name]_style.md` -- Human-readable visual direction
2. **Design tokens**: `art-direction/[course-name]_tokens.json` -- Machine-readable (same format as theme tokens)
3. **Theme CSS**: `art-direction/[course-name]_theme.css` -- CSS custom properties (copy directly to output)
4. **Optional**: `art-direction/[course-name]_decorations.css` -- Grain, glass, mesh gradients, animated backgrounds

---

## Phase 4: Visual Generation

### SVG/CSS-First Decision Tree

For every visual asset, follow this process:
1. "Can this be an SVG icon?" → YES: Create SVG with currentColor. Save to `shared/assets/icons/`
2. "Can this be pure CSS?" → YES: Add to decorations.css (gradient meshes, noise, patterns, grain)
3. "Needs realistic/complex imagery?" → YES: Use nano-banana-pro (PNG). Save to `shared/assets/images/`

### Asset Specifications
| Asset | Size | Format | Location |
|-------|------|--------|----------|
| Thumbnail | 1280x720 | PNG/JPEG | shared/assets/images/thumbnail.png |
| Module header | 1200x400 | PNG | shared/assets/images/module_N_header.png |
| Lesson image | 800x600 | PNG | shared/assets/images/lesson_[sco_id].png |
| Infographic | 1000x800 | PNG | shared/assets/images/infographic_[topic].png |
| Icons | 256x256 | PNG (or SVG) | shared/assets/icons/[name].svg |

### Prompt Engineering
Structure: `[Art style], [Subject matter], [Composition], [Colors], [Quality modifiers]`

Style Lock (add to every prompt for consistency):
```
[STYLE LOCK: [illustration style], color palette (#XXX, #XXX, #XXX), clean aesthetic, consistent with course branding]
```

---

## Phase 5: Animation Creation

### Remotion Integration
Import design tokens directly from tokens.json:
```tsx
import tokens from '../../art-direction/[course-name]_tokens.json';
```

### Animation Types
| Type | Duration | Use Case |
|------|----------|----------|
| Course intro | 5-10s | Logo + title reveal |
| Text reveal | 0.5-1.5s | Section headers |
| Transitions | 0.5-1s | Between sections |
| Chart build | 2-3s | Data visualization |

### Timing Guidelines
- Easing: `ease-out` for entrances, `ease-in` for exits
- Duration: 200-400ms for UI, 600-1000ms for content
- FPS: 30 standard, 60 for complex

### CSS Animation Fallbacks (when Remotion not available)
```css
.fade-in { animation: fadeIn 0.5s ease-out forwards; }
.slide-up { animation: slideUp 0.5s ease-out forwards; }
.stagger-item:nth-child(n) { animation-delay: calc(n * 80ms); }
```

---

## Phase 6: Assessment Design

### Alignment Principle
Every question must: (1) align with a specific learning objective, (2) test at appropriate Bloom's level, (3) reflect real-world application, (4) be unambiguous and fair.

### CRITICAL: Factual Accuracy (NON-NEGOTIABLE)
All quiz answers and explanations MUST be 100% factually verified. Wrong answers in a quiz destroy learner trust and teach misinformation.

### Question Types JSON Format

**Multiple Choice:**
```json
{"type": "multiple-choice", "id": "q_m1_l1_01", "stem": "...", "options": [{"id": "a", "text": "...", "correct": false}], "feedback": {"correct": "...", "incorrect": "..."}, "objective": "M1.L1.O1", "blooms": "understand"}
```

**True/False:**
```json
{"type": "true-false", "id": "q_m1_l1_02", "stem": "...", "correct": true, "feedback": {"correct": "...", "incorrect": "..."}}
```

**Fill in the Blank:**
```json
{"type": "fill-blank", "id": "q_m2_l1_01", "stem": "The ___ involves...", "blanks": [{"position": 1, "answers": ["correct", "alternate"], "caseSensitive": false}]}
```

**Matching:**
```json
{"type": "matching", "id": "q_m2_quiz_01", "stem": "Match terms:", "items": [{"id": "1", "term": "A"}], "targets": [{"id": "a", "definition": "Def 1", "matchTo": "1"}]}
```

### Behavioral Tracking in Quizzes
Track: time per question, answer changes, time to first click, hint usage, option position patterns.

Report via SCORM cmi.interactions:
```javascript
API.LMSSetValue("cmi.interactions.N.id", questionId);
API.LMSSetValue("cmi.interactions.N.type", "choice");
API.LMSSetValue("cmi.interactions.N.student_response", selectedOption);
API.LMSSetValue("cmi.interactions.N.correct_responses.0.pattern", correctOption);
API.LMSSetValue("cmi.interactions.N.result", isCorrect ? "correct" : "wrong");
API.LMSSetValue("cmi.interactions.N.latency", formatTime(timeSpent));
```

### Gamification in Assessments
- Award 10pts per correct answer + 5pt bonus for 3+ streak
- Growth mindset feedback: Correct: "Great work!" / Incorrect: "Not yet - you're learning!" / Retry: "Coming back shows persistence!"
- Celebrate quiz completion with animation

### Output
Save to `output/[course-name]/content/questions.json`

---

## Phase 7: Content Rendering

### CSS Strategy: COPY, Don't Rebuild

**NEVER rebuild CSS from scratch.** Copy layered files:
```
shared/base.css           <- COPY from resources/css/base.css (never modify)
shared/player-shell.css   <- COPY from resources/css/player-shell.css
shared/theme.css          <- COPY from art-direction/[course]_theme.css
shared/decorations.css    <- COPY from art-direction/ (optional)
shared/brand.css          <- COPY from themes/brands/[brand]/brand.css (optional)
shared/course-custom.css  <- WRITE only 50-100 lines of truly unique styles
```

### HTML Template (LTR)
```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Lesson Title] | [Course Name]</title>
  <link rel="stylesheet" href="../shared/base.css">
  <link rel="stylesheet" href="../shared/theme.css">
  <link rel="stylesheet" href="../shared/decorations.css">
  <link rel="stylesheet" href="../shared/course-custom.css">
</head>
<body>
  <div class="sco-container">
    <header class="sco-header">
      <div class="progress-bar"><div class="progress-fill" id="progress"></div></div>
      <h1 class="lesson-title">[Lesson Title]</h1>
    </header>
    <main class="sco-content" id="content"></main>
    <nav class="sco-nav">
      <button class="btn-prev" id="prevBtn" disabled>Previous</button>
      <span class="page-indicator" id="pageIndicator">1 / 5</span>
      <button class="btn-next" id="nextBtn">Next</button>
    </nav>
  </div>
  <script src="../shared/scorm-api.js"></script>
  <script src="../shared/behavior-tracker.js"></script>
  <script src="content.js"></script>
</body>
</html>
```

### HTML Template (RTL Arabic)
```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<!-- Same structure as LTR — RTL is handled by dir="rtl" + base.css -->
```

### Staggered Animation
Use `.stagger-item` class from base.css for entrance animations:
```html
<div class="stagger-item">First element</div>
<div class="stagger-item">Second element (80ms delay)</div>
```

### Engine JS Files (16 total -- copy needed ones to shared/engine/)
- `slide-controller.js` -- Always include
- `quiz-engine.js` -- If course has quizzes
- `player-shell.js` -- If full player chrome needed
- `layer-system.js` -- If overlay layers or feedback
- `state-engine.js` -- If complex interactions
- `trigger-engine.js` -- If declarative triggers
- `variable-store.js` -- If variables or conditional content
- `branching-engine.js` -- If adaptive/branching
- `question-bank.js` -- If randomized quizzes
- `audio-player.js` -- If narrated
- `captions.js` -- If closed captions
- `lightbox.js` -- If popup/modal slides
- `interactivity-engine.js` -- Unified entry point
- `sound-effects.js` -- Synthesized UI sounds (highly recommended)
- `confetti.js` -- Canvas celebration particles (highly recommended)
- `achievement-system.js` -- Badge/achievement manager (highly recommended)

### SCORM Bug Fixes (CRITICAL)
- Do NOT set status="incomplete" on every init — check current status first
- Do NOT use window.location.href for cross-SCO navigation
- Use touch events alongside HTML5 drag-and-drop for mobile
- Always wrap JSON.parse(suspend_data) in try-catch
- Track session time via cmi.core.session_time
- Bundle fonts locally — NEVER use external CDN

---

## Phase 8: SCORM Packaging

### SCORM 1.2 Manifest Template
```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="[course-id]" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                      http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="[org-id]">
    <organization identifier="[org-id]">
      <title>[Course Title]</title>
      <item identifier="item_sco_01" identifierref="sco_01">
        <title>[SCO Title]</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="sco_01" type="webcontent" adlcp:scormtype="sco" href="sco_01_intro/index.html">
      <file href="sco_01_intro/index.html"/>
      <file href="sco_01_intro/content.js"/>
      <dependency identifierref="shared_resources"/>
    </resource>
    <resource identifier="shared_resources" type="webcontent" adlcp:scormtype="asset">
      <file href="shared/scorm-api.js"/>
      <file href="shared/behavior-tracker.js"/>
      <file href="shared/base.css"/>
      <file href="shared/theme.css"/>
    </resource>
  </resources>
</manifest>
```

### Schema Files (SCORM 1.2)
Copy from `templates/scorm-1.2/schemas/` to package root:
- `adlcp_rootv1p2.xsd`
- `imscp_rootv1p1p2.xsd`
- `imsmd_rootv1p2p1.xsd`

### Packaging Commands
```bash
cd output/[course-name]
zip -r "../[course-name].zip" . -x "*.DS_Store" -x "__MACOSX/*"
```

### Pre-Package Validation Checklist
**SCORM Technical:**
- [ ] imsmanifest.xml is valid XML
- [ ] All file href paths exist and are relative
- [ ] No spaces in filenames
- [ ] UTF-8 encoding throughout
- [ ] No external dependencies (no CDN links)
- [ ] SCORM API wrapper included
- [ ] Session time tracking implemented

**QM Compliance:**
- [ ] Welcome/overview SCO exists
- [ ] Objectives visible at start of each SCO
- [ ] Progress tracking functional
- [ ] Help accessible from all SCOs

**NELC Compliance:**
- [ ] Videos under 10 minutes each
- [ ] At least 2 interaction types per module
- [ ] Responsive design
- [ ] Arabic RTL correct (if applicable)

**Accessibility:**
- [ ] Skip navigation on all pages
- [ ] Alt text on all images
- [ ] Keyboard navigation works
- [ ] Color contrast passes

**Behavioral Tracking:**
- [ ] BehaviorTracker library in shared/
- [ ] All SCOs initialize tracker
- [ ] Quiz SCOs report cmi.interactions

---

## SCORM Standards

### SCORM 1.2 API
```javascript
LMSInitialize("")      // Start session
LMSGetValue(element)   // Read data
LMSSetValue(element, value)  // Write data
LMSCommit("")          // Save data
LMSFinish("")          // End session
```

### SCORM 2004 API
```javascript
Initialize("")         // Start session
GetValue(element)      // Read data
SetValue(element, value)  // Write data
Commit("")             // Save data
Terminate("")          // End session
```

### Key Data Model Elements

| SCORM 1.2 | SCORM 2004 | Purpose |
|-----------|------------|---------|
| cmi.core.lesson_status | cmi.completion_status | Completion state |
| cmi.core.score.raw | cmi.score.scaled | Score value |
| cmi.suspend_data | cmi.suspend_data | Bookmark/state data |
| cmi.core.session_time | cmi.session_time | Time spent |
| cmi.interactions.n.* | cmi.interactions.n.* | Quiz response data |

## Theme System (Design System as Code)

Courses use a three-layer CSS system with premium visual utilities:
```
Layer 1: base.css        <- Shared foundation + premium CSS utilities (from this skill)
Layer 2: theme.css       <- UNIQUE per-course theme (created by Art Director, NOT copied)
Layer 3: brand.css       <- Brand overlay (optional)
         + course-custom.css  <- Tiny unique styles (~50 lines)
```

### Theme Reference Library (for inspiration, not copying)
- `space-explorer` - Dark cosmic (astronomy, physics)
- `corporate-clean` - Light professional (business)
- `bold-gradient` - Vibrant gradients (creative)
- `playful-bright` - Colorful gamified (youth, onboarding)
- `technical-dark` - Code editor (programming, IT)

### Brand Overlays
- `brands/eduarabia` - EduArabia brand
- `brands/nelc` - NELC institutional

### Theme DNA Reference
See `resources/theme-dna.md` for curated palette recipes, font pairings, background patterns, and motion presets.

## Quality Standards

### Quality Matters (QM) Alignment
- Course overview with getting-started instructions (QM 1.1)
- Measurable learning objectives at every level (QM 2.1-2.5)
- Aligned assessments measuring stated objectives (QM 3.1)
- Multiple content types per module (QM 4.5)
- Interactive activities in every lesson (QM 5.2)
- Consistent navigation across all SCOs (QM 8.1)
- WCAG 2.1 AA accessibility compliance (QM 8.1-8.7)

### NELC Saudi Compliance
- Video max 10 minutes per clip with objective summary
- Minimum 2 interaction types per module
- Arabic RTL support with 18px+ body text
- Self-contained packages (no external dependencies)
- WCAG 2.1 AA mandatory

### Behavioral Data Tracking
Every SCO must integrate BehaviorTracker:
- Track page view durations and scroll depth
- Track quiz behavioral signals (time-to-first-click, answer changes)
- Track navigation patterns and content revisits
- Store compressed data in cmi.suspend_data
- Report quiz interactions via cmi.interactions

### Gamification
Every lesson SCO should include:
- Points display in header (earned for completing sections/quizzes)
- Progress visualization (lesson, module, course level)
- Celebration animation on achievements
- Growth mindset feedback: "Not yet -- you're learning!" not "Wrong"

## Accessibility Checklist (Every SCO)
- [ ] Skip navigation link
- [ ] Semantic HTML (proper heading hierarchy)
- [ ] All images have descriptive alt text
- [ ] Color contrast 4.5:1 minimum
- [ ] Keyboard navigation for all interactive elements
- [ ] Focus indicators visible (3px outline)
- [ ] ARIA roles and labels on interactive elements
- [ ] No autoplay media
- [ ] prefers-reduced-motion respected
- [ ] Touch-friendly (44px min tap targets)
- [ ] RTL layout support (dir="rtl", logical CSS properties)
- [ ] Drag-and-drop has keyboard alternative

## Output Structure

```
output/[course-name]/
  imsmanifest.xml
  *.xsd                   <- Schema files
  shared/
    scorm-api.js          <- From resources/
    behavior-tracker.js   <- From resources/
    gamification.js       <- From resources/
    base.css              <- From resources/css/
    player-shell.css      <- From resources/css/
    theme.css             <- From art-direction/
    decorations.css       <- From art-direction/ (optional)
    brand.css             <- From themes/brands/ (optional)
    course-custom.css     <- Generated (~50 lines)
    engine/               <- Only the JS files needed for this course
    assets/
      icons/              <- From resources/icons/
      fonts/              <- Bundled locally
      images/             <- Generated by nano-banana-pro
      videos/             <- Generated by Remotion (optional)
  sco_01_introduction/
  sco_02_lesson_1/
  sco_03_quiz_1/
  [course-name].zip
```

## Simulation & Minigame Accuracy (NON-NEGOTIABLE)

Any simulation, minigame, physics demo, math visualization, or scientific model
**MUST be 100% scientifically/factually accurate**. No shortcuts. If accuracy
cannot be verified, flag it for human review before shipping.
