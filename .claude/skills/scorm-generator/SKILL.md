---
name: scorm-generator
description: Complete SCORM e-learning pipeline from interview to LMS-ready ZIP. 8 phases — Interview, Design, Art Direction, Visual Generation, Animation, Assessment, Content Rendering, Packaging. Includes 42 interactive components, 16 JS engine files, premium CSS system, gamification, behavioral tracking, and WCAG 2.1 AA accessibility.
---

# SCORM Content Studio — Pipeline Hub

This is the **only skill needed for SCORM work**. It orchestrates the complete pipeline
from requirements interview to LMS-ready ZIP package.

All work runs in the main conversation. Each phase routes to the right module or resource file.

---

## The 8-Phase Pipeline

### Phase 1: Interview — Gather Requirements

Conduct a structured interview to understand the learning transformation.

→ Read: `modules/course-design.md` (transformation-first methodology, SMART objectives)
→ Read: `references/interview-guide.md` (7-phase interview questions + output template)
→ **Output:** `specs/[course-slug]_spec.md`

---

### Phase 2: Instructional Design — Create Learning Structure

Transform the specification into detailed module/lesson architecture with Bloom's levels.

→ Read: `modules/course-design.md` (Bloom's taxonomy, Gagne's Nine Events, SCO naming, durations)
→ Read: `references/curriculum-design.md` (extended pedagogical patterns)
→ **Output:** `specs/[course-slug]_structure.md`

---

### Phase 3: Art Direction — Establish Visual Identity

Create a unique visual theme using the "Learn and Create" methodology.

→ Read: `modules/art-direction.md` (5-dimension design framework, font pairings, palettes)
→ Read: `resources/theme-dna.md` (curated palette recipes, font pairings, background patterns)
→ Reference: `themes/` directory (inspiration, NOT templates to copy)
→ **Output:** `art-direction/[course-slug]_style.md`, `_tokens.json`, `_theme.css`

---

### Phase 4: Visual Generation (can run parallel with Phase 5-6)

Generate course images. Always prefer SVG/CSS over raster when possible.

→ Read: `modules/visual-generation.md` (SVG/CSS-first decision tree, style presets, prompts)
→ Script: `scripts/generate_image.py --prompt "..." --style professional --output path.png`
→ **Output:** `output/[course-slug]/shared/assets/images/`

---

### Phase 5: Animation (parallel, optional)

Create animated intro/outro videos or motion graphics if needed.

→ Use: **create-animated-video** skill (separate skill — loads its own rules)
→ **Output:** `output/[course-slug]/shared/assets/videos/`

---

### Phase 6: Assessment Design (parallel)

Design quizzes, knowledge checks, and question banks aligned to learning objectives.

→ Read: `references/assessment-guide.md` (Bloom's alignment, question JSON formats, behavioral tracking)
→ **Output:** `output/[course-slug]/content/questions.json`

**CRITICAL:** All quiz answers must be 100% factually verified. Wrong answers destroy learner trust.

---

### Phase 7: Content Rendering — Build HTML/CSS/JS

Generate all SCO files (HTML pages, interactive elements, quiz interfaces).

→ Read: `resources/rendering-guide.md` (CSS strategy, 42 component catalog, HTML templates, JS patterns)
→ **Copy to output:** `resources/css/`, `resources/engine/`, `resources/components/`, `resources/icons/`
→ **Output:** `output/[course-slug]/sco_*/index.html`

CSS is layered (COPY, don't rebuild):
```
shared/base.css           ← COPY from resources/css/base.css
shared/player-shell.css   ← COPY from resources/css/player-shell.css
shared/theme.css          ← COPY from art-direction/[course]_theme.css
shared/course-custom.css  ← WRITE only ~50-100 lines of unique styles
```

---

### Phase 8: Packaging — Create SCORM ZIP

Generate imsmanifest.xml, include schemas, validate, and create ZIP.

→ Read: `resources/packaging-guide.md` (manifest templates 1.2 + 2004, validation checklists)
→ **Copy:** `templates/scorm-1.2/schemas/` (XSD schema files)
→ **Output:** `output/[course-slug].zip`

---

## Pipeline Flow

```
Sequential:  Phase 1 → Phase 2 → Phase 3
Parallel:    Phase 4 + Phase 5 + Phase 6
Sequential:  Phase 7 → Phase 8
```

---

## Conventions

- Course specs: `specs/[course-slug]_spec.md`
- Learning structures: `specs/[course-slug]_structure.md`
- Style guides: `art-direction/[course-slug]_style.md`
- Output: `output/[course-slug]/`
- File naming: lowercase, hyphens, no spaces
- SCORM version: Default to 1.2 unless user requests 2004

---

## Quality Standards

Every course must meet these standards:

| Standard | Reference |
|----------|-----------|
| Quality Matters (15 Essential) | `resources/qm-checklist.md` |
| NELC Saudi (59 indicators) | `resources/nelc-checklist.md` |
| WCAG 2.1 AA Accessibility | Semantic HTML, 4.5:1 contrast, keyboard nav |
| Gamification | `resources/gamification-components.md` |
| Behavioral Tracking | `resources/behavior-tracker.js` (1311 lines) |

---

## Critical Rules

- **Simulation accuracy (NON-NEGOTIABLE):** Moon phases, physics, math, chemistry — must be 100% correct
- **Design quality:** "Would a designer say wow?" — no generic AI aesthetics
- **Self-contained:** Bundle ALL fonts locally (never CDN), no external dependencies
- **Arabic/RTL:** `dir="rtl"`, `lang="ar"`, 18px+ body text, Arabic fonts bundled
- **Fixed slides layout:** Like Storyline 360, not scrollable pages

---

## Output Structure

```
output/[course-slug]/
  imsmanifest.xml
  shared/
    scorm-api.js, behavior-tracker.js, gamification.js
    base.css, player-shell.css, theme.css, course-custom.css
    engine/ (JS files needed for this course)
    assets/icons/, assets/fonts/, assets/images/
  sco_01_introduction/
  sco_02_m1_lesson1/
  sco_03_m1_quiz/
  [course-slug].zip
```

---

## Module & Resource Index

| File | What's Inside | Used In |
|------|--------------|---------|
| **Modules** | | |
| `modules/course-design.md` | Transformation-first design, Bloom's, Gagne's, objectives, structure | Phase 1-2 |
| `modules/art-direction.md` | 5-dimension design framework, theme methodology, style guide template | Phase 3 |
| `modules/visual-generation.md` | SVG/CSS decision tree, image prompts, style presets | Phase 4 |
| **References** | | |
| `references/interview-guide.md` | 7-phase interview questions, output spec template | Phase 1 |
| `references/assessment-guide.md` | Question bank JSON formats, Bloom's alignment, behavioral data | Phase 6 |
| `references/curriculum-design.md` | Extended pedagogical patterns and templates | Phase 2 |
| **Resources** | | |
| `resources/rendering-guide.md` | HTML/CSS/JS templates, 42 component catalog, engine JS guide | Phase 7 |
| `resources/packaging-guide.md` | Manifest templates (1.2 + 2004), validation checklists | Phase 8 |
| `resources/theme-dna.md` | Curated palette recipes, font pairings, background patterns | Phase 3 |
| `resources/qm-checklist.md` | Quality Matters 44 standards, 15 Essential | All phases |
| `resources/nelc-checklist.md` | NELC Saudi 59 indicators | All phases |
| `resources/gamification-components.md` | Points, badges, celebrations, growth mindset | Phase 7 |
| `resources/css/base.css` | Foundation CSS with premium utilities (52KB) | Phase 7 |
| `resources/css/player-shell.css` | Player chrome styling (22KB) | Phase 7 |
| `resources/engine/` | 16 JS engine files (slide, quiz, state, trigger, etc.) | Phase 7 |
| `resources/components/` | 42 interactive HTML component snippets | Phase 7 |
| `resources/icons/` | 8 SVG icons with currentColor | Phase 7 |
| **Scripts** | | |
| `scripts/generate_image.py` | AI image generation with style presets | Phase 4 |
| **Templates** | | |
| `templates/scorm-1.2/schemas/` | XSD schema files for SCORM 1.2 | Phase 8 |
| `templates/` | Manifest templates, SCO templates, interaction templates | Phase 8 |
