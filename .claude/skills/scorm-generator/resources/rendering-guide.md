# Content Rendering Guide

Reference guide for rendering HTML/CSS/JS content for SCORM packages.

---

## Simulation & Minigame Accuracy (NON-NEGOTIABLE)

Any simulation, minigame, physics demo, math visualization, or scientific model
**MUST be 100% scientifically/factually accurate**. No shortcuts.

- Moon phase angles must match real astronomy
- Newton's laws must produce correct physics calculations
- Blockchain hashing must use real algorithms
- Math formulas must compute correctly
- Chemical reactions must be balanced
- Historical timelines must use verified dates

**If accuracy cannot be verified, flag it for human review before shipping.**

---

## Input Requirements

Read from:
- `specs/[course-name]_structure.md` - Learning structure
- `art-direction/[course-name]_style.md` - Visual style guide
- `art-direction/[course-name]_theme.css` - Theme CSS (COPY to shared/)
- `art-direction/[course-name]_decorations.css` - Decorations (COPY if exists)
- `.claude/skills/scorm-generator/resources/css/base.css` - Foundation CSS (COPY to shared/)
- `.claude/skills/scorm-generator/resources/css/player-shell.css` - Player chrome CSS (COPY to shared/)
- `.claude/skills/scorm-generator/resources/components/` - All 42 reusable HTML component snippets
- `.claude/skills/scorm-generator/resources/icons/` - SVG icons (COPY to shared/assets/)
- `.claude/skills/scorm-generator/resources/engine/` - JS engine files (COPY needed ones to shared/engine/)
- `output/[course-name]/content/questions.json` - Assessment questions
- `output/[course-name]/shared/assets/` - Generated visuals

---

## The Non-Negotiable Slide Structure

Every SCO page MUST follow this exact DOM structure. This is the **contract** between
the HTML you generate and the CSS/JS engine that makes it work.

```
WHY THIS WORKS: The flexbox column layout gives .sco-content ALL remaining
space between the header and nav. Slides use position:absolute to stack on
top of each other. Only the .active slide is visible. The nav is flex-shrink:0
so it NEVER gets pushed off-screen.

┌─────────────────────────────────────────────────┐
│  .sco-container  (height:100vh, flex-col)       │
│  ┌─────────────────────────────────────────────┐ │
│  │  header.nav-bar  (flex-shrink:0, 56px)      │ │
│  │  Logo │ Title │ Points Badge                │ │
│  └─────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────┐ │
│  │  main.sco-content  (flex:1, overflow:hidden)│ │
│  │  ┌─────────────────────────────────────┐    │ │
│  │  │  .slide  (position:absolute, inset:0)│   │ │
│  │  │  ┌───────────────────────────────┐  │    │ │
│  │  │  │  .slide-inner (max-width:900px)│ │    │ │
│  │  │  │  ┌───────────────────────┐    │  │    │ │
│  │  │  │  │  Actual slide content │    │  │    │ │
│  │  │  │  └───────────────────────┘    │  │    │ │
│  │  │  └───────────────────────────────┘  │    │ │
│  │  └─────────────────────────────────────┘    │ │
│  └─────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────┐ │
│  │  nav.sco-nav  (flex-shrink:0, 56px)         │ │
│  │  ◀ Prev  │  1 / 5  │  Next ▶               │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**The `<main class="sco-content">` wrapper is MANDATORY.** Without it, slides
compete with the nav bar for space, causing content overflow.

---

## BANNED: Inline Styles on Slides

These patterns were found in the NJR01 course and MUST NEVER be used again.
They override base.css and break the fixed viewport layout.

### NEVER do this:
```html
<!-- WRONG: Inline styles override base.css layout -->
<div class="slide" style="display:flex; padding:48px; flex-direction:column;">
  ...
</div>

<!-- WRONG: Missing <main class="sco-content"> wrapper -->
<div class="sco-container">
  <div class="slide active">...</div>
  <div class="slide">...</div>
  <nav class="slide-nav">...</nav>  <!-- slides push nav off viewport -->
</div>

<!-- WRONG: Custom class names that don't match base.css -->
<nav class="lesson-navigation">...</nav>  <!-- base.css won't style this -->
```

### ALWAYS do this:
```html
<!-- CORRECT: Let base.css handle all layout via class names -->
<div class="sco-container">
  <header class="nav-bar">...</header>
  <main class="sco-content">                    <!-- MANDATORY wrapper -->
    <div class="slide active" data-slide="0">   <!-- NO inline styles -->
      <div class="slide-inner">                  <!-- Centers content -->
        <!-- Your content here -->
      </div>
    </div>
  </main>
  <nav class="sco-nav">...</nav>                <!-- OR .slide-nav (alias) -->
</div>
```

---

## CSS Strategy: COPY, Don't Rebuild

**Before (old way):** Write 600-800 lines of CSS from scratch for every course.

**After (new way):** Copy layered CSS files:
```
shared/base.css           <- COPY from .claude/skills/scorm-generator/resources/css/base.css (never modify)
shared/player-shell.css   <- COPY from .claude/skills/scorm-generator/resources/css/player-shell.css
shared/theme.css          <- COPY from art-direction/[course]_theme.css
shared/decorations.css    <- COPY from art-direction/[course]_decorations.css (optional)
shared/brand.css          <- COPY from themes/brands/[brand]/brand.css (optional)
shared/course-custom.css  <- WRITE only 50-100 lines of truly unique styles
```

The HTML template changes from one CSS link to layered CSS:
```html
<link rel="stylesheet" href="../shared/base.css">
<link rel="stylesheet" href="../shared/theme.css">
<link rel="stylesheet" href="../shared/decorations.css">  <!-- optional -->
<link rel="stylesheet" href="../shared/brand.css">         <!-- optional -->
<link rel="stylesheet" href="../shared/course-custom.css"> <!-- tiny file -->
```

---

## Reusable Component Library (42 Total)

Copy interactive component snippets from `.claude/skills/scorm-generator/resources/components/`:

### Content Components (7)
- `accordion.html` - Expandable sections
- `tabs.html` - Tabbed content panels
- `flip-card.html` - Flashcard-style Q&A
- `click-reveal.html` - Click to show hidden content
- `timeline.html` - Step-by-step timeline
- `callout.html` - Info/success/warning/tip boxes
- `scroll-panel.html` - Fixed-height scrollable area

### Exploration Components (3)
- `markers.html` - Hotspot pins on images with popup callouts
- `hotspot.html` - Click-on-image-area interactions
- `slider.html` - Value selection with range input

### Quiz Components (8)
- `checkbox-quiz.html` - Multiple response (select all that apply)
- `fill-blank.html` - Text input answer
- `numeric-entry.html` - Number input with tolerance
- `matching-dropdown.html` - Match pairs via dropdowns
- `sequence-sort.html` - Drag to reorder items
- `word-bank.html` - Drag words into blanks (cloze test)
- `likert.html` - Survey rating scale (Likert)
- `text-response.html` - Short answer / essay

### Advanced Components (4)
- `drag-drop.html` - Free drag & drop with keyboard support
- `button-set.html` - Radio group with visual objects
- `dial.html` - Rotary knob control
- `per-choice-feedback.html` - Targeted feedback per answer choice

### Game Components (10)
- `flashlight-reveal.html` - Dark overlay with cursor-following spotlight
- `memory-match.html` - Card-flipping matching pairs game
- `branching-scenario.html` - Choose-your-own-adventure decision engine
- `escape-room.html` - Puzzle chain game with timer and hints
- `spinner-wheel.html` - Spinning wheel for random selection
- `hidden-object.html` - Find-the-difference / spot hidden items
- `progress-journey.html` - SVG winding path with lesson waypoints
- `visual-novel.html` - Character portraits with dialogue and choices
- `drawing-canvas.html` - Whiteboard for annotation and labeling
- `word-search.html` - Generated letter grid with hidden words

### Gap-Fill Components (5)
- `content-carousel.html` - Swipeable card carousel
- `character-avatar.html` - Customizable character guide/mascot
- `software-sim.html` - Click-through software simulation
- `interactive-checklist.html` - Trackable checklist with progress
- `labeled-graphic.html` - Image with positioned labels and descriptions

### Advanced Simulation (5)
- `crossword.html` - Crossword puzzle with clues
- `interactive-map.html` - SVG regions clickable with info panels
- `decision-sim.html` - Multi-round decision game with dashboard
- `jigsaw.html` - Drag pieces to reassemble image/process
- `physics-sandbox.html` - Canvas-based physics demo

Read each component snippet, adapt the content, paste into the lesson HTML.

---

## Engine JS Files (16 Total)

Copy needed files to `shared/engine/`:

- `slide-controller.js` - Always include (slide navigation)
- `quiz-engine.js` - Include for quiz SCOs (handles all question types, attempts, review, retry)
- `player-shell.js` - Include for full courses (sidebar, menu, glossary, nav modes)
- `layer-system.js` - Include if using overlay layers or feedback layers
- `state-engine.js` - Include for complex interactions with object states
- `trigger-engine.js` - Include for declarative event+action+condition logic
- `variable-store.js` - Include if using variables or conditional content
- `branching-engine.js` - Include for adaptive/branching courses
- `question-bank.js` - Include for randomized quizzes
- `audio-player.js` - Include for narrated courses
- `captions.js` - Include for closed captions
- `lightbox.js` - Include for popup/modal slides
- `interactivity-engine.js` - Include as unified entry point (connects all above)
- `sound-effects.js` - Highly recommended: synthesized UI sounds (click, success, error, celebration, whoosh, pop)
- `confetti.js` - Highly recommended: canvas celebration particles on quiz pass/achievements
- `achievement-system.js` - Highly recommended: badge/achievement with notification popups

---

## Staggered Animation on Page Load

Use the `.stagger-item` class from base.css for entrance animations:
```html
<div class="stagger-item">First element</div>
<div class="stagger-item">Second element (80ms delay)</div>
<div class="stagger-item">Third element (160ms delay)</div>
```

---

## Premium CSS Utility Classes (USE THESE EVERYWHERE)

These utility classes from `base.css` elevate every course from template to premium:

### Required on Every Course (NON-NEGOTIABLE)
```css
.elastic-click    /* On ALL buttons -- squish on press: scale(0.97) */
.hover-lift       /* On ALL cards/containers -- float up 2px on hover with shadow deepening */
.stagger-item     /* On ALL content blocks -- entrance animation with stagger delay */
.has-grain        /* On slide backgrounds -- subtle film-like noise texture */
```

### Recommended for Visual Impact
```css
.shadow-sm        /* Resting card state */
.shadow-md        /* Hover/elevated state */
.shadow-lg        /* Modal/overlay state */
.text-gradient    /* On section/module headings for emphasis */
.glass            /* Glassmorphism for overlays and feature cards */
.glass-dark       /* Glass variant for dark themes */
.glass-light      /* Glass variant for light themes */
.animated-bg      /* On hero/intro slides -- animated gradient background */
.mesh-gradient    /* Layered radial gradients for section backgrounds */
.reveal-circle    /* Circular clip-path expansion for transitions */
.reveal-chevron   /* Directional wipe effect for transitions */
```

### Spring Easing Variables
```css
--spring-gentle   /* Soft overshoot, natural feel */
--spring-bouncy   /* Noticeable bounce, playful themes */
--spring-snappy   /* Quick snap, professional themes */
```

**RULE: Every course MUST feel alive with micro-interactions.** Use `.elastic-click` on buttons, `.hover-lift` on cards, `.stagger-item` on content blocks. This is the baseline, not optional.

---

## Sound Integration

Include `sound-effects.js` in every course for synthesized UI sounds (zero audio files):

```html
<script src="../shared/engine/sound-effects.js"></script>
```

### When to Trigger Sounds
- **Navigation**: `sounds.whoosh()` on slide transition
- **Quiz option click**: `sounds.click()`
- **Correct answer**: `sounds.success()`
- **Wrong answer**: `sounds.error()`
- **Quiz pass / Achievement**: `sounds.celebration()`
- **Interactive element interaction**: `sounds.pop()` or `sounds.click()`

Sounds are subtle by default. Mute toggle persists in `cmi.suspend_data`.

---

## Confetti Integration

Include `confetti.js` for canvas celebration particles:

```html
<script src="../shared/engine/confetti.js"></script>
```

### When to Fire Confetti
- Quiz passed (score >= passing threshold)
- Lesson completed
- Achievement unlocked
- Course completed (big celebration)

### Usage
```javascript
const confetti = new ConfettiSystem();
confetti.fire(); // Standard burst
confetti.fire({ intensity: 'big' }); // Course completion
```

---

## Achievement Integration

Include `achievement-system.js` for badge/achievement manager:

```html
<script src="../shared/engine/achievement-system.js"></script>
```

### Initialization
```javascript
const achievements = new AchievementSystem(scormAPI);
achievements.init(); // Loads earned badges from suspend_data
```

### Trigger on Milestones
- First lesson completed: `achievements.check('first_lesson')`
- Perfect quiz score: `achievements.check('perfect_quiz')`
- Speed completion: `achievements.check('speed_demon')`
- All optional content viewed: `achievements.check('explorer')`
- 5+ correct streak: `achievements.check('streak_5')`

Notification popup slides in from top-right with badge icon + title + description.

---

## SCO Structure

Each SCO follows this file structure:

```
sco_XX_[name]/
├── index.html      # Entry point (loaded by LMS)
├── content.js      # Lesson logic and SCORM calls
├── data.json       # Content data
└── styles.css      # SCO-specific styles (optional)
```

---

## HTML Template Structure

### Base SCO Template

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Lesson Title] | [Course Name]</title>
  <!-- Layered CSS: base -> theme -> decorations -> brand -> course-custom -->
  <link rel="stylesheet" href="../shared/base.css">
  <link rel="stylesheet" href="../shared/theme.css">
  <link rel="stylesheet" href="../shared/decorations.css">
  <link rel="stylesheet" href="../shared/course-custom.css">
</head>
<body>
  <div class="sco-container">
    <!-- Header -->
    <header class="sco-header">
      <div class="progress-bar">
        <div class="progress-fill" id="progress"></div>
      </div>
      <h1 class="lesson-title">[Lesson Title]</h1>
    </header>

    <!-- Main Content -->
    <main class="sco-content" id="content">
      <!-- Content sections loaded dynamically -->
    </main>

    <!-- Navigation -->
    <nav class="sco-nav">
      <button class="btn-prev" id="prevBtn" disabled>Previous</button>
      <span class="page-indicator" id="pageIndicator">1 / 5</span>
      <button class="btn-next" id="nextBtn">Next</button>
    </nav>
  </div>

  <!-- SCORM API -->
  <script src="../shared/scorm-api.js"></script>
  <script src="content.js"></script>
</body>
</html>
```

### RTL Arabic Template

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[عنوان الدرس] | [اسم الدورة]</title>
  <!-- Layered CSS: same as LTR (base.css already supports RTL) -->
  <link rel="stylesheet" href="../shared/base.css">
  <link rel="stylesheet" href="../shared/theme.css">
  <link rel="stylesheet" href="../shared/decorations.css">
  <link rel="stylesheet" href="../shared/course-custom.css">
</head>
<!-- Same structure -- RTL is handled by dir="rtl" + base.css -->
```

---

## Content JavaScript Pattern

```javascript
// content.js - Lesson Controller

(function() {
  'use strict';

  // Initialize SCORM
  const scorm = new SCORMWrapper();
  scorm.initialize();

  // Lesson configuration
  const config = {
    scoId: '[sco_id]',
    totalSections: 5,
    currentSection: 0,
    startTime: new Date()
  };

  // Content data (loaded from data.json or embedded)
  const sections = [
    {
      id: 'section-1',
      type: 'content',
      title: 'Introduction',
      html: `<div class="section">...</div>`
    },
    {
      id: 'section-2',
      type: 'content',
      title: 'Key Concepts',
      html: `<div class="section">...</div>`
    },
    {
      id: 'knowledge-check',
      type: 'quiz',
      questions: [/* embedded or reference */]
    }
  ];

  // Navigation
  function showSection(index) {
    const section = sections[index];
    const container = document.getElementById('content');

    if (section.type === 'content') {
      container.innerHTML = section.html;
    } else if (section.type === 'quiz') {
      renderQuiz(container, section.questions);
    }

    updateProgress(index);
    updateNavigation(index);
  }

  function updateProgress(index) {
    const progress = ((index + 1) / sections.length) * 100;
    document.getElementById('progress').style.width = progress + '%';
    document.getElementById('pageIndicator').textContent =
      `${index + 1} / ${sections.length}`;
  }

  function updateNavigation(index) {
    document.getElementById('prevBtn').disabled = index === 0;
    const nextBtn = document.getElementById('nextBtn');

    if (index === sections.length - 1) {
      nextBtn.textContent = 'Complete';
      nextBtn.onclick = completeSCO;
    } else {
      nextBtn.textContent = 'Next';
      nextBtn.onclick = () => showSection(index + 1);
    }
  }

  // SCORM completion
  function completeSCO() {
    const duration = Math.floor((new Date() - config.startTime) / 1000);

    scorm.setSessionTime(duration);
    scorm.setLessonStatus('completed');
    scorm.commit();
    scorm.terminate();

    // Show completion message
    document.getElementById('content').innerHTML = `
      <div class="completion-message">
        <h2>Lesson Complete!</h2>
        <p>You have completed this lesson.</p>
      </div>
    `;
  }

  // Event listeners
  document.getElementById('prevBtn').onclick = () => {
    if (config.currentSection > 0) {
      config.currentSection--;
      showSection(config.currentSection);
    }
  };

  document.getElementById('nextBtn').onclick = () => {
    if (config.currentSection < sections.length - 1) {
      config.currentSection++;
      showSection(config.currentSection);
    }
  };

  // Bookmark/resume support
  const bookmark = scorm.getBookmark();
  if (bookmark) {
    config.currentSection = parseInt(bookmark, 10);
  }

  // Save bookmark on navigation
  window.addEventListener('beforeunload', () => {
    scorm.setBookmark(config.currentSection.toString());
    scorm.commit();
  });

  // Initialize
  showSection(config.currentSection);
})();
```

---

## Quiz Renderer

```javascript
// quiz-renderer.js

function renderQuiz(container, quiz) {
  const scorm = new SCORMWrapper();

  let currentQuestion = 0;
  let answers = {};

  function showQuestion(index) {
    const q = quiz.questions[index];
    container.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-header">
          <h2>${quiz.title}</h2>
          <span class="quiz-progress">Question ${index + 1} of ${quiz.questions.length}</span>
        </div>
        <div class="question">
          <p class="question-stem">${q.stem}</p>
          <div class="options">
            ${q.options.map(opt => `
              <label class="option">
                <input type="radio" name="answer" value="${opt.id}"
                  ${answers[q.id] === opt.id ? 'checked' : ''}>
                <span class="option-text">${opt.text}</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div class="quiz-nav">
          <button onclick="prevQuestion()" ${index === 0 ? 'disabled' : ''}>Previous</button>
          ${index === quiz.questions.length - 1
            ? '<button onclick="submitQuiz()">Submit</button>'
            : '<button onclick="nextQuestion()">Next</button>'}
        </div>
      </div>
    `;
  }

  window.nextQuestion = function() {
    saveAnswer();
    if (currentQuestion < quiz.questions.length - 1) {
      currentQuestion++;
      showQuestion(currentQuestion);
    }
  };

  window.prevQuestion = function() {
    saveAnswer();
    if (currentQuestion > 0) {
      currentQuestion--;
      showQuestion(currentQuestion);
    }
  };

  function saveAnswer() {
    const selected = document.querySelector('input[name="answer"]:checked');
    if (selected) {
      const q = quiz.questions[currentQuestion];
      answers[q.id] = selected.value;
    }
  }

  window.submitQuiz = function() {
    saveAnswer();

    // Calculate score
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      const userAnswer = answers[q.id];
      const correctOption = q.options.find(o => o.correct);
      const isCorrect = userAnswer === correctOption.id;

      if (isCorrect) correct++;

      // Record interaction in SCORM
      scorm.recordInteraction(i, {
        id: q.id,
        type: 'choice',
        response: userAnswer,
        correct: correctOption.id,
        result: isCorrect ? 'correct' : 'incorrect'
      });
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.settings.passing_score;

    // Set SCORM score
    scorm.setScore(score, 100, quiz.settings.passing_score);
    scorm.setLessonStatus(passed ? 'passed' : 'failed');
    scorm.commit();

    // Show results
    showResults(score, passed, correct, quiz.questions.length);
  };

  function showResults(score, passed, correct, total) {
    container.innerHTML = `
      <div class="quiz-results ${passed ? 'passed' : 'failed'}">
        <h2>${passed ? 'Congratulations!' : 'Keep Learning'}</h2>
        <div class="score-display">
          <span class="score">${score}%</span>
          <span class="details">${correct} of ${total} correct</span>
        </div>
        <p class="result-message">
          ${passed
            ? 'You have passed this assessment.'
            : `You need ${quiz.settings.passing_score}% to pass. Please review the material and try again.`}
        </p>
        ${!passed && quiz.settings.attempts > 1
          ? '<button onclick="retryQuiz()">Try Again</button>'
          : ''}
      </div>
    `;
  }

  showQuestion(0);
}
```

---

## Output Location

Generate files to:
```
output/[course-name]/
├── shared/
│   ├── scorm-api.js
│   ├── behavior-tracker.js
│   ├── base.css            <- COPIED from .claude/skills/scorm-generator/resources/css/base.css
│   ├── theme.css           <- COPIED from art-direction/[course]_theme.css
│   ├── decorations.css     <- COPIED from art-direction/ (optional)
│   ├── brand.css           <- COPIED from themes/brands/ (optional)
│   ├── course-custom.css   <- WRITTEN: only 50-100 lines of unique styles
│   └── assets/
│       ├── icons/          <- COPIED from .claude/skills/scorm-generator/resources/icons/
│       ├── fonts/          <- Bundled locally (no CDN!)
│       └── images/
├── sco_01_introduction/
│   ├── index.html
│   ├── content.js
│   └── data.json
├── sco_02_m1_lesson1/
│   └── ...
└── sco_XX_quiz/
    └── ...
```

---

## Quality Standards Compliance

Every generated SCO must include:

### QM Essential Standards
- Welcome/orientation in first SCO (QM 1.1, 1.2)
- Objectives displayed at start of every lesson (QM 2.3)
- Alignment map visible to learners (QM 2.4)
- Assessment criteria shown before quizzes (QM 3.3)
- Progress tracking visible (QM 3.5)
- At least 3 content types per module (QM 4.5)
- Interactive activity in every lesson (QM 5.2)
- Help button persistent on all pages (QM 7.1)
- Skip navigation link (QM 8.1)
- WCAG 2.1 AA accessibility throughout (QM 8.1-8.7)

### NELC Requirements
- Video max 10 minutes with summary at end
- Minimum 2 interaction types per module
- Arabic RTL with 18px+ body text (when Arabic)
- No external dependencies (no Google Fonts CDN)
- Self-contained fonts bundled in package

### Accessibility Checklist
- [ ] Semantic HTML with proper heading hierarchy
- [ ] All images have descriptive alt text
- [ ] Color contrast 4.5:1 minimum
- [ ] Keyboard navigation for all elements
- [ ] Focus indicators visible
- [ ] ARIA roles on interactive elements
- [ ] No autoplay media
- [ ] prefers-reduced-motion support
- [ ] Tab order follows visual order

### Gamification Components to Include
- Points display in header
- Progress bar (lesson, module, course levels)
- Celebration animation on completion
- Growth mindset feedback messaging
- Micro-interactions (hover effects, click feedback)

### Behavioral Tracking Integration
Include BehaviorTracker library in every SCO:
```html
<script src="../shared/behavior-tracker.js"></script>
```
Initialize with: `const tracker = new BehaviorTracker(scormAPI);`

### SCORM Bug Fixes (from moon-phases analysis)
- Do NOT set status to "incomplete" on every init - check current status first
- Do NOT use window.location.href for cross-SCO navigation
- Use touch events alongside HTML5 drag-and-drop for mobile
- Always wrap JSON.parse(suspend_data) in try-catch
- Track session time via cmi.core.session_time
- Bundle fonts locally, never use external CDN
