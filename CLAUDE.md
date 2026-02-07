# SCORM Content Studio

> AI-powered content creation pipeline for professional, LMS-ready SCORM packages.

## Quick Start

```bash
cd /Users/qusaiabushanap/dev/scorm-projects
claude
/scorm
```

## What This System Does

SCORM Content Studio combines specialized AI agents and skills into a content production pipeline that creates complete SCORM packages through a structured interview process.

## DELEGATION RULE (NON-NEGOTIABLE)

**NEVER do SCORM content work directly in the main conversation.** ALL course creation work MUST be delegated to subagents or Agent Teams. The main agent is a coordinator/orchestrator ONLY.

This applies to:
- Writing HTML/CSS/JS for SCOs
- Creating imsmanifest.xml
- Generating course specifications
- Building assessments/quizzes
- Creating visual assets
- Any file writing inside `output/`

**How to delegate:**

| Approach | When to Use |
|----------|-------------|
| **Agent Teams** (preferred) | Full `/scorm` pipeline, multi-phase work, complex courses |
| **Individual subagents** | Single focused tasks (e.g., "just package this course", "just build the quiz") |

**Both approaches work equally** because all pipeline instructions live in the `scorm-generator` skill (SKILL.md), which is loaded by ANY agent type that references it. Agent `.md` files add specialized workflow details on top.

**Why this matters:**
- Subagents have focused context = better quality output
- Parallel work = faster delivery
- Main agent stays responsive to user
- Each agent writes its own files without conflicts

## The Content Creation Team

| Agent | Role |
|-------|------|
| scorm-interview | Requirements gathering (7-phase interview) |
| scorm-instructional-designer | Learning architecture (Bloom's, Gagne's) |
| scorm-art-director | Visual style guide creation |
| scorm-visual-generator | AI image generation |
| scorm-animation-creator | Video/animation creation |
| scorm-assessment-builder | Quizzes and knowledge checks |
| scorm-content-renderer | HTML/CSS/JS page generation |
| scorm-packager | Manifest and ZIP packaging |

All agents use `model: inherit` so they always run on your current model (Opus for best quality).

## Integrated Skills

| Skill | Purpose |
|-------|---------|
| scorm-generator | SCORM API, manifest templates, packaging standards, behavioral tracking |
| course-builder | Instructional design, Bloom's taxonomy, QM alignment, Arabic support |
| nano-banana-pro | AI image generation with style presets |
| remotion-best-practices | Animation patterns, video creation |

## How Agents Work Together

When `/scorm` is invoked, use **Agent Teams** for the full pipeline:

1. **Spawn a team** with `Teammate(spawnTeam)` for the course
2. **Create tasks** for each phase using TaskCreate
3. **Launch agents** as teammates using the Task tool with `team_name`
4. **Run phases sequentially** where outputs depend on each other
5. **Run phases in parallel** where they don't (visual + animation + assessment)

```
Sequential:  Interview → Design → Art Direction
Parallel:    [Visual Generator + Animation Creator + Assessment Builder]
Sequential:  Content Renderer → Packager
```

Each agent reads the previous agent's output files (specs/, art-direction/, output/) and writes its own. The pipeline tracks progress in `specs/[course]_progress.json` so it can resume if interrupted.

Always use Agent Teams (not individual subagents) for the full /scorm workflow - teammates can coordinate and the team lead can monitor progress.

## Quality Standards

All generated content must meet:

### Quality Matters (QM) Alignment
- 15 Essential standards must be met (objectives, alignment, accessibility)
- Course overview with clear getting-started instructions
- Measurable learning objectives at every level
- Aligned assessments, materials, activities, and technology
- Multiple content types per module
- Progress tracking visible to learners

### NELC Saudi Compliance
- Video max 10 minutes per clip with objective summary
- Minimum 2 interaction types per module
- Arabic RTL support with 18px+ body text
- Self-contained packages (no external dependencies)
- WCAG 2.1 AA accessibility mandatory

### Accessibility (WCAG 2.1 AA)
- Semantic HTML with proper heading hierarchy
- All images have descriptive alt text
- Color contrast 4.5:1 minimum for text
- Keyboard navigation for all interactive elements
- Skip navigation links, focus indicators, ARIA roles
- No autoplay media, prefers-reduced-motion respected

### Gamification and Engagement
- Points system for section/quiz completion
- Progress visualization (lesson, module, course)
- Celebration animations on achievements
- Growth mindset feedback messaging
- Interactive activities in every lesson

### Behavioral Data Collection
- BehaviorTracker library in every SCO
- Timing, scroll, navigation, and quiz behavioral data
- Stored in cmi.suspend_data (compact format)
- Quiz interactions via cmi.interactions
- Privacy by design (no PII)

## Theme System (Design System as Code)

Courses use a **three-layer CSS system** instead of rebuilding styles from scratch:

```
Layer 1: base.css        ← Shared foundation (never changes)
Layer 2: theme.css       ← Style theme (space-explorer, corporate-clean, etc.)
Layer 3: brand.css       ← Brand overlay (optional: eduarabia, nelc)
         + course-custom.css  ← Tiny file for truly unique styles (~50 lines)
```

### Available Themes

```
themes/
  _base/
    base.css                ← ~1,900 lines: reset, layout, buttons, quiz, nav, player
  space-explorer/           ← Dark cosmic (astronomy, physics)
  corporate-clean/          ← Light professional (business, compliance)
  bold-gradient/            ← Vibrant gradients (creative, marketing)
  playful-bright/           ← Colorful gamified (onboarding, youth)
  technical-dark/           ← Code editor (programming, IT)
  brands/
    eduarabia/              ← EduArabia brand overlay
    nelc/                   ← NELC institutional overlay

.claude/skills/scorm-generator/resources/
  css/                      ← base.css + player-shell.css
  engine/                   ← 13 JS engine files (quiz, state, trigger, player, etc.)
  components/               ← 22 reusable HTML+CSS+JS interactive components
  icons/                    ← 8 SVG icons (currentColor for auto-theming)
```

### How It Works

1. **Art Director** reads themes, picks or customizes one → outputs `_tokens.json` + `_theme.css`
2. **Content Renderer** COPIES `base.css` + `theme.css` + engine JS + components from skill folder into `shared/`
3. Only `course-custom.css` is written fresh (~50-100 lines vs old ~700 lines)

### tokens.json Format

Each theme has a `tokens.json` — the single source of truth for colors, fonts, spacing:
- CSS reads it via generated `theme.css` (`:root` custom properties)
- Remotion imports it directly as JSON (TypeScript-native)
- Humans read the README.md alongside it

## Critical Rules

### Simulation & Minigame Accuracy (NON-NEGOTIABLE)

Any simulation, minigame, physics demo, math visualization, or scientific model
**MUST be 100% scientifically/factually accurate**. No shortcuts. Moon phases must
match real astronomy. Newton's laws must produce correct calculations. If accuracy
cannot be verified, flag it for human review before shipping.

### Design Quality Standards

Every theme and course must pass the "would a designer say wow?" test.
NO generic AI aesthetics. Use distinctive fonts (never default Inter/Roboto),
bold committed palettes, atmospheric backgrounds, high-impact motion, and
unexpected spatial composition.

## Output Quality - Make It Say "Wow"

Every output must be visually impressive and production-ready:

### Visual Design
- Select a theme from the theme library (or customize one)
- Custom CSS animations via stagger-item class and decorations.css
- Beautiful color gradients, subtle shadows, and micro-interactions
- Themed backgrounds via decorations.css (starfields, mesh gradients, grain)
- SVG/CSS-first for icons and decorative elements

### Content Sizing (16:9 Display)
- Design for 1280x720 or 1920x1080 display
- Content area max-width: 900px centered
- Images: 16:9 ratio (1280x720 for headers, 800x450 for inline)
- Video container: 56.25% padding-bottom (16:9 aspect ratio)
- Quiz options: full-width cards, not cramped radio buttons

### Interactive Elements
- Every lesson needs at least 2 interactive elements from the 22-component library (markers, hotspot, tabs, accordions, flip cards, drag-drop, sequence-sort, slider, word-bank, etc.)
- Touch-friendly: use touch events alongside HTML5 drag-and-drop
- Smooth CSS transitions on all state changes
- Hover effects that feel responsive and alive

### Gamification Must-Haves
- Points badge in header with animated counter
- Confetti/celebration animation on quiz pass and lesson complete
- Progress journey map (not just a progress bar)
- Growth mindset messaging: "Not yet - you're learning!" not "Wrong"
- Streak counter for consecutive correct answers

### Self-Contained
- Bundle ALL fonts locally (never CDN)
- No external dependencies
- All assets in shared/assets/
- Works offline inside any LMS

## Conventions

- Course specs: `specs/[course-slug]_spec.md`
- Learning structures: `specs/[course-slug]_structure.md`
- Style guides: `art-direction/[course-slug]_style.md`
- Output: `output/[course-slug]/`
- Progress tracking: `specs/[course-slug]_progress.json`
- File naming: lowercase, hyphens, no spaces
- SCORM version: Default to 1.2 unless user requests 2004

## Output Structure

```
output/[course-name]/
  imsmanifest.xml
  shared/
    scorm-api.js          ← COPIED from skill resources/
    behavior-tracker.js   ← COPIED from skill resources/
    gamification.js       ← COPIED from skill resources/
    base.css              ← COPIED from themes/_base/
    player-shell.css      ← COPIED from skill resources/css/
    theme.css             ← COPIED from art-direction/
    decorations.css       ← COPIED from art-direction/ (optional)
    brand.css             ← COPIED from themes/brands/ (optional)
    course-custom.css     ← Only unique course styles (~50 lines)
    engine/               ← Only the JS files needed for this course
      slide-controller.js ← Always included
      quiz-engine.js      ← If course has quizzes
      player-shell.js     ← If full player chrome needed
      state-engine.js     ← If complex interactions
      trigger-engine.js   ← If declarative triggers used
      variable-store.js   ← If variables used
      ...                 ← Other engine files as needed
    assets/
      icons/              ← SVG icons from skill resources/icons/
      fonts/              ← Bundled locally
      images/
  sco_01_introduction/
  sco_02_lesson_1/
  sco_03_quiz_1/
  [course-name].zip
```

## MENA/Arabic Support

- RTL layout with `dir="rtl"` and `lang="ar"`
- Arabic fonts bundled locally (Noto Kufi Arabic, Cairo, Tajawal)
- Bilingual content support (Arabic/English)
- Cultural context considerations
- Arabic numerals support

## Commands

| Command | Purpose |
|---------|---------|
| `/scorm` | Start the full SCORM creation workflow |
| `/scorm [topic]` | Quick start with a pre-filled topic |

## Testing Your Package

1. Local Preview: Open any SCO's index.html in browser
2. SCORM Cloud: Upload to cloud.scorm.com for testing
3. LMS Test: Upload to Moodle, Canvas, or your LMS

## Tips for Best Results

1. Be specific about transformation - what exactly should learners DO after?
2. Know your audience - their prior knowledge affects content depth
3. Provide brand assets - logos, colors, fonts if available
4. Think in modules - break content into 15-20 minute chunks
5. Plan assessments - how will you prove learning happened?
