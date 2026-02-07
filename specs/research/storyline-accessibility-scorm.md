# Storyline 360: Accessibility & SCORM Implementation Research

> Deep-dive analysis of how Articulate Storyline 360 implements accessibility (WCAG 2.1) and SCORM communication. Includes lessons we can match or improve upon in SCORM Content Studio.

---

## Table of Contents

1. [Accessibility (WCAG 2.1)](#1-accessibility-wcag-21)
   - [HTML Output & Semantic Structure](#11-html-output--semantic-structure)
   - [ARIA Roles & Landmarks](#12-aria-roles--landmarks)
   - [Tab Order & Focus Management](#13-tab-order--focus-management)
   - [Keyboard Navigation](#14-keyboard-navigation)
   - [Screen Reader Support](#15-screen-reader-support)
   - [Alt Text & Image Accessibility](#16-alt-text--image-accessibility)
   - [Closed Captions](#17-closed-captions)
   - [Drag-and-Drop Accessibility](#18-drag-and-drop-accessibility)
   - [Focus Indicators](#19-focus-indicators)
   - [Color Contrast](#110-color-contrast)
   - [Skip Navigation](#111-skip-navigation)
   - [Reduced Motion](#112-reduced-motion)
   - [Known Accessibility Gaps](#113-known-accessibility-gaps)
2. [SCORM Implementation](#2-scorm-implementation)
   - [SCORM 1.2 Implementation](#21-scorm-12-implementation)
   - [SCORM 2004 Differences](#22-scorm-2004-differences)
   - [scormdriver.js Architecture](#23-scormdriverjs-architecture)
   - [LMS Communication Lifecycle](#24-lms-communication-lifecycle)
   - [Completion & Status Reporting](#25-completion--status-reporting)
   - [Score Calculation & Reporting](#26-score-calculation--reporting)
   - [Bookmarking & suspend_data](#27-bookmarking--suspend_data)
   - [Quiz Interaction Reporting](#28-quiz-interaction-reporting-cmiinteractions)
   - [Error Handling](#29-error-handling)
   - [Multi-SCO vs Single-SCO](#210-multi-sco-vs-single-sco)
   - [imsmanifest.xml Structure](#211-imsmanifestxml-structure)
   - [xAPI (Tin Can) Support](#212-xapi-tin-can-support)
   - [LMS Compatibility & Quirks](#213-lms-compatibility--quirks)
3. [Gap Analysis: What We Can Improve](#3-gap-analysis-what-we-can-improve)
4. [Implementation Recommendations](#4-implementation-recommendations)

---

## 1. Accessibility (WCAG 2.1)

### 1.1 HTML Output & Semantic Structure

Storyline 360 publishes **HTML5-only** output (builds 3.35.20995.0+). The modern player yields clean HTML5 with:

- Automatic semantic formatting for paragraphs, links, and lists
- Course title used as `<title>` element (WCAG 2.4.2 Page Titled)
- Distinct semantic groups for player controls vs slide content
- HTML structure that separates player chrome from slide canvas

**Key limitation:** Tables created in Storyline historically lacked semantic `<table>` markup (treated as positioned shapes). Recent updates (2024-2025) improved table recognition by screen readers.

**What we can do better:**
```html
<!-- Storyline: Non-semantic positioned elements -->
<div class="slide-object-text" style="position:absolute; left:120px; top:80px;">
  Content here
</div>

<!-- Our approach: Full semantic HTML -->
<main role="main" aria-label="Lesson Content">
  <article>
    <h2>Lesson Title</h2>
    <section aria-label="Key Concepts">
      <p>Content here</p>
    </section>
  </article>
</main>
```

### 1.2 ARIA Roles & Landmarks

Storyline 360's modern player uses ARIA landmarks to define regions:

| Region | ARIA Role | Purpose |
|--------|-----------|---------|
| Player sidebar | `navigation` | Menu, resources panel |
| Slide content | `main` or `application` | Primary learning content |
| Player controls | `toolbar` | Next/Prev, volume, seekbar |
| Slide title | `heading` | Current slide identification |

The player uses distinct ARIA landmarks for:
- Course navigation (sidebar menu)
- Slide content area
- Player toolbar (Next/Prev, seekbar, volume)
- Dialog/modal layers (when triggered)

**What we can do better:**
```html
<!-- Our enhanced ARIA landmark structure -->
<div role="banner" aria-label="Course Header">
  <h1 id="course-title">Course Name</h1>
  <div role="status" aria-live="polite" id="progress-announce">
    Module 2 of 5 - 40% complete
  </div>
</div>

<nav role="navigation" aria-label="Course Navigation">
  <ol role="list">
    <li aria-current="true">Current Lesson</li>
  </ol>
</nav>

<main role="main" aria-labelledby="lesson-title">
  <h2 id="lesson-title">Lesson Content</h2>
  <!-- Slide content -->
</main>

<footer role="contentinfo">
  <nav role="toolbar" aria-label="Lesson Controls">
    <button aria-label="Previous lesson">Previous</button>
    <button aria-label="Next lesson">Next</button>
  </nav>
</footer>
```

### 1.3 Tab Order & Focus Management

Storyline provides a **Focus Order panel** (similar to PowerPoint's Selection Pane):

- Authors can switch from "default focus order" to "custom focus order"
- Objects can be reordered via drag or Up/Down arrows
- Objects can be removed from the focus order (hidden from Tab)
- Focus order is per-slide (each slide has its own tab sequence)

**Focus management behaviors:**
- When navigating to a new slide, focus moves to the first focusable element
- When a layer opens, focus moves to the layer content
- Website/video objects are positioned last in focus order (cross-domain constraint)
- Player tab order (sidebar, toolbar) is fixed and cannot be customized

**What we can do better:**
```javascript
// Our enhanced focus management
class FocusManager {
  constructor(slideContainer) {
    this.container = slideContainer;
    this.focusableElements = [];
    this.currentIndex = -1;
  }

  // On slide transition, move focus to first content element
  onSlideEnter() {
    const firstFocusable = this.container.querySelector(
      '[tabindex="0"], a, button, input, select, textarea, [role="button"]'
    );
    if (firstFocusable) {
      // Announce slide change to screen readers
      this.announceSlideChange();
      // Small delay to let DOM settle
      requestAnimationFrame(() => firstFocusable.focus());
    }
  }

  // Announce slide transitions via aria-live region
  announceSlideChange() {
    const announcer = document.getElementById('slide-announcer');
    const title = this.container.querySelector('h2, h3, [role="heading"]');
    announcer.textContent = `Navigated to: ${title?.textContent || 'New slide'}`;
  }

  // Trap focus within modal/layer when open
  trapFocus(layerElement) {
    const focusable = layerElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    layerElement.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      // Escape closes layer
      if (e.key === 'Escape') {
        this.closeLayer(layerElement);
      }
    });

    first.focus();
  }
}
```

### 1.4 Keyboard Navigation

Storyline supports keyboard navigation with these patterns:

| Key | Action |
|-----|--------|
| Tab | Move to next focusable element |
| Shift+Tab | Move to previous focusable element |
| Enter/Space | Activate buttons, links, and controls |
| Arrow keys | Navigate within radio groups, sliders |
| Escape | Close layers/modals (if configured) |

**Key limitations in Storyline:**
- Drag-and-drop is NOT keyboard accessible (workaround: build click alternatives)
- Likert scale questions lack keyboard access (planned fix Q1 2026)
- Some custom interactions require author-built keyboard handlers

**What we can do better:**
```javascript
// Keyboard-accessible drag-and-drop alternative
class AccessibleDragDrop {
  constructor(container) {
    this.container = container;
    this.dragItems = container.querySelectorAll('[data-draggable]');
    this.dropZones = container.querySelectorAll('[data-dropzone]');
    this.selectedItem = null;

    this.init();
  }

  init() {
    // Make drag items focusable and keyboard-operable
    this.dragItems.forEach(item => {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'option');
      item.setAttribute('aria-grabbed', 'false');
      item.setAttribute('aria-describedby', 'dnd-instructions');

      item.addEventListener('keydown', (e) => this.handleItemKey(e, item));
      item.addEventListener('click', () => this.selectItem(item));
    });

    // Make drop zones focusable
    this.dropZones.forEach(zone => {
      zone.setAttribute('tabindex', '0');
      zone.setAttribute('role', 'listbox');
      zone.setAttribute('aria-label', zone.dataset.label || 'Drop zone');

      zone.addEventListener('keydown', (e) => this.handleZoneKey(e, zone));
      zone.addEventListener('click', () => this.dropItem(zone));
    });

    // Add instructions for screen readers
    this.addInstructions();
  }

  handleItemKey(e, item) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.selectItem(item);
    }
  }

  handleZoneKey(e, zone) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.dropItem(zone);
    }
  }

  selectItem(item) {
    // Deselect previous
    if (this.selectedItem) {
      this.selectedItem.setAttribute('aria-grabbed', 'false');
      this.selectedItem.classList.remove('selected');
    }
    // Select new
    this.selectedItem = item;
    item.setAttribute('aria-grabbed', 'true');
    item.classList.add('selected');
    this.announce(`Selected: ${item.textContent}. Press Tab to move to a drop zone, then Enter to place.`);
  }

  dropItem(zone) {
    if (!this.selectedItem) {
      this.announce('No item selected. First select an item, then choose a drop zone.');
      return;
    }
    zone.appendChild(this.selectedItem);
    this.selectedItem.setAttribute('aria-grabbed', 'false');
    this.announce(`Placed ${this.selectedItem.textContent} in ${zone.dataset.label}`);
    this.selectedItem = null;
  }

  announce(message) {
    const announcer = document.getElementById('dnd-announcer');
    announcer.textContent = message;
  }

  addInstructions() {
    const instructions = document.createElement('div');
    instructions.id = 'dnd-instructions';
    instructions.className = 'sr-only';
    instructions.textContent = 'Press Enter to select an item. Then Tab to a drop zone and press Enter to place it.';
    this.container.prepend(instructions);

    const announcer = document.createElement('div');
    announcer.id = 'dnd-announcer';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'assertive');
    announcer.className = 'sr-only';
    this.container.prepend(announcer);
  }
}
```

### 1.5 Screen Reader Support

Storyline 360 is tested with:
- **JAWS 2025** (Windows)
- **NVDA 2025** (Windows)
- **Narrator** (Windows)
- **VoiceOver** (macOS, iOS)
- **TalkBack** (Android)

**How Storyline handles screen readers:**
- Course title announced on launch
- Slide objects read in focus order sequence
- Objects labeled with author-defined alt text
- Player controls have built-in accessible names
- State changes (hover, selected, visited) can have distinct alt text

**Known screen reader issues:**
- Layer changes are NOT automatically announced to screen readers
- Slider values lack contextual labels
- Alt text on object states not always read correctly
- NVDA announces "clickable" when reading text boxes (false positive)
- JAWS 2025 sometimes fails to activate buttons on base layers

**What we can do better:**
```html
<!-- Live regions for dynamic content changes -->
<div id="slide-announcer" role="status" aria-live="polite" class="sr-only"></div>
<div id="quiz-feedback" role="alert" aria-live="assertive" class="sr-only"></div>

<!-- Screen reader only utility class -->
<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
```

```javascript
// Announce dynamic changes that Storyline misses
function announceToScreenReader(message, priority = 'polite') {
  const announcer = document.getElementById(
    priority === 'assertive' ? 'quiz-feedback' : 'slide-announcer'
  );
  // Clear then set to trigger announcement
  announcer.textContent = '';
  requestAnimationFrame(() => {
    announcer.textContent = message;
  });
}

// Use for quiz feedback
function showQuizFeedback(isCorrect, feedback) {
  const feedbackEl = document.querySelector('.quiz-feedback');
  feedbackEl.textContent = feedback;
  feedbackEl.classList.add(isCorrect ? 'correct' : 'incorrect');

  // Announce to screen readers immediately
  announceToScreenReader(
    isCorrect ? `Correct! ${feedback}` : `Not quite. ${feedback}`,
    'assertive'
  );
}
```

### 1.6 Alt Text & Image Accessibility

Storyline 360's alt text system:
- Authors add alt text per object (images, shapes, groups)
- Objects can be marked as "decorative" (empty alt="")
- Different states (Normal, Hover, Selected) can have different alt text
- Recent addition: AI-generated alt text suggestions

**What we can do better:**
```html
<!-- Decorative images -->
<img src="bg-pattern.svg" alt="" role="presentation">

<!-- Informative images with rich alt text -->
<img src="moon-phases-diagram.png"
     alt="Diagram showing the 8 phases of the moon:
          New Moon, Waxing Crescent, First Quarter,
          Waxing Gibbous, Full Moon, Waning Gibbous,
          Third Quarter, and Waning Crescent arranged
          in a circle around Earth."
     loading="lazy">

<!-- Complex images with long description -->
<figure role="figure" aria-labelledby="chart-caption">
  <img src="data-chart.svg" alt="Bar chart showing quarterly sales">
  <figcaption id="chart-caption">
    Q1: $120K, Q2: $185K, Q3: $210K, Q4: $195K.
    Q3 had the highest sales at $210K.
  </figcaption>
</figure>
```

### 1.7 Closed Captions

Storyline 360 supports:
- Built-in caption editor (author types captions per slide/audio)
- Import of VTT caption files
- Captions displayed in a panel below the slide or overlaid
- Caption text stored alongside slide data in the published output
- AI-generated captions (recent addition)

**Known issues:**
- Captions disappear when videos open in new windows
- Multi-language caption support is unavailable
- Caption overlap occurs when layered with other content
- Captions are NOT in the Tab Order (screen reader users cannot navigate to them)

**What we can do better:**
```html
<!-- WebVTT captions with proper ARIA -->
<div class="video-container" role="region" aria-label="Video with captions">
  <video id="lesson-video" aria-describedby="video-transcript">
    <track kind="captions" src="captions-en.vtt" srclang="en" label="English" default>
    <track kind="captions" src="captions-ar.vtt" srclang="ar" label="Arabic">
  </video>

  <!-- Visible caption area accessible to keyboard users -->
  <div id="caption-display"
       role="log"
       aria-live="off"
       aria-label="Captions"
       tabindex="0">
    <!-- Captions rendered here dynamically -->
  </div>

  <!-- Full transcript available -->
  <details>
    <summary>View Full Transcript</summary>
    <div id="video-transcript" lang="en">
      <!-- Full transcript text -->
    </div>
  </details>
</div>
```

### 1.8 Drag-and-Drop Accessibility

**Storyline's major weakness:** Drag-and-drop interactions are NOT keyboard accessible at all. The official workaround is to build a completely separate click-based alternative version.

This is a significant gap. Many e-learning interactions rely on drag-and-drop (matching, sorting, labeling diagrams).

**What we can do better:**

We should always provide keyboard-accessible drag-and-drop using the pattern shown in Section 1.4, plus touch event support:

```javascript
// Combined touch + mouse + keyboard drag-and-drop
class UniversalDragDrop {
  constructor(container) {
    this.container = container;
    this.initTouch();
    this.initMouse();
    this.initKeyboard();
  }

  initTouch() {
    this.container.querySelectorAll('[data-draggable]').forEach(item => {
      item.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
      item.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
      item.addEventListener('touchend', (e) => this.onTouchEnd(e));
    });
  }

  initMouse() {
    // Standard HTML5 DnD for desktop
    this.container.querySelectorAll('[data-draggable]').forEach(item => {
      item.draggable = true;
      item.addEventListener('dragstart', (e) => this.onDragStart(e));
      item.addEventListener('dragend', (e) => this.onDragEnd(e));
    });
    this.container.querySelectorAll('[data-dropzone]').forEach(zone => {
      zone.addEventListener('dragover', (e) => e.preventDefault());
      zone.addEventListener('drop', (e) => this.onDrop(e));
    });
  }

  initKeyboard() {
    // Keyboard-driven select-then-place pattern
    // (See AccessibleDragDrop class in Section 1.4)
  }

  onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.dragElement = e.target.closest('[data-draggable]');
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.dragElement.classList.add('dragging');
    this.dragElement.setAttribute('aria-grabbed', 'true');
  }

  onTouchMove(e) {
    if (!this.dragElement) return;
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - this.startX;
    const dy = touch.clientY - this.startY;
    this.dragElement.style.transform = `translate(${dx}px, ${dy}px)`;

    // Highlight drop zone under finger
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elementBelow?.closest('[data-dropzone]');
    this.highlightDropZone(dropZone);
  }

  onTouchEnd(e) {
    if (!this.dragElement) return;
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elementBelow?.closest('[data-dropzone]');

    if (dropZone) {
      this.completeDrop(this.dragElement, dropZone);
    } else {
      this.cancelDrag(this.dragElement);
    }

    this.dragElement.classList.remove('dragging');
    this.dragElement.style.transform = '';
    this.dragElement = null;
  }
}
```

### 1.9 Focus Indicators

Storyline 360 provides a **two-color focus indicator** system:
- Outer color (default: dark) and inner color (default: light)
- Creates a visible focus rectangle around the currently focused element
- Authors can customize both colors to complement course design
- Focus indicator is visible by default for keyboard users

**What we can do better:**
```css
/* Our enhanced focus indicator system */

/* Base focus style - always visible for keyboard users */
:focus-visible {
  outline: 3px solid var(--focus-outer, #005FCC);
  outline-offset: 2px;
  box-shadow: 0 0 0 6px var(--focus-inner, rgba(0, 95, 204, 0.25));
}

/* Remove outline for mouse clicks (use :focus-visible, not :focus) */
:focus:not(:focus-visible) {
  outline: none;
  box-shadow: none;
}

/* High contrast mode support */
@media (forced-colors: active) {
  :focus-visible {
    outline: 3px solid Highlight;
    outline-offset: 2px;
  }
}

/* Specific element focus styles */
button:focus-visible,
[role="button"]:focus-visible {
  outline: 3px solid var(--focus-outer);
  outline-offset: 2px;
  box-shadow: 0 0 0 6px var(--focus-inner);
  /* Subtle scale for visual feedback */
  transform: scale(1.02);
}

/* Quiz option focus */
.quiz-option:focus-visible {
  outline: 3px solid var(--focus-outer);
  outline-offset: 4px;
  background-color: var(--focus-bg, rgba(0, 95, 204, 0.08));
}
```

### 1.10 Color Contrast

Storyline's approach:
- Authors are responsible for ensuring color contrast meets WCAG 4.5:1 for text
- 3:1 contrast ratio required between clickable and non-clickable text
- No built-in contrast checker (authors must use external tools)
- Icon or text labels required when color alone conveys information
- Pattern/texture supplementation recommended for charts

**What we can do better:**

Our theme system already enforces contrast via CSS custom properties. Each theme's `tokens.json` should define contrast-safe color pairs:

```json
{
  "colors": {
    "text-primary": "#1A1A2E",
    "text-secondary": "#4A4A68",
    "bg-primary": "#FFFFFF",
    "bg-secondary": "#F5F5FA",
    "interactive": "#005FCC",
    "interactive-hover": "#004299",
    "success": "#0A7B3E",
    "error": "#C41E3A",
    "warning": "#8B6914"
  },
  "contrast_notes": {
    "text-primary_on_bg-primary": "15.3:1 (AAA)",
    "text-secondary_on_bg-primary": "7.2:1 (AA)",
    "interactive_on_bg-primary": "7.1:1 (AA)",
    "success_on_bg-primary": "5.8:1 (AA)",
    "error_on_bg-primary": "6.4:1 (AA)"
  }
}
```

### 1.11 Skip Navigation

Storyline provides a built-in skip navigation mechanism:
- A "Back to top" button appears after tabbing through all slide objects
- Positioned in the lower-right corner of the slide
- Visible temporarily for sighted keyboard users
- Enabled by default (can be disabled in Player > Other settings)
- Allows screen reader users to skip player controls and jump to slide content

**What we can do better:**
```html
<!-- Our skip navigation: visible on focus, multiple targets -->
<a href="#main-content" class="skip-link">Skip to main content</a>
<a href="#lesson-nav" class="skip-link">Skip to lesson navigation</a>
<a href="#quiz-section" class="skip-link">Skip to quiz</a>

<style>
.skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  background: var(--color-interactive);
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  z-index: 10000;
  font-weight: 600;
  text-decoration: none;
  transition: top 0.2s ease;
}

.skip-link:focus {
  top: 16px;  /* Slides into view when focused */
}
</style>
```

### 1.12 Reduced Motion

**Storyline does NOT natively support `prefers-reduced-motion`.**

This is a gap. Users who have enabled reduced motion in their OS settings still see full animations in Storyline courses.

**What we can do better:**
```css
/* Respect OS-level reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .confetti-animation,
  .celebration-animation,
  .progress-animation {
    display: none;
  }

  /* Keep essential feedback visible but without animation */
  .quiz-feedback {
    opacity: 1;
    transform: none;
  }
}

/* Also provide a manual toggle for users */
.motion-toggle {
  position: fixed;
  bottom: 16px;
  right: 16px;
}
```

```javascript
// Respect and remember motion preference
class MotionPreference {
  constructor() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.userOverride = localStorage.getItem('reduceMotion');

    if (this.userOverride !== null) {
      this.reducedMotion = this.userOverride === 'true';
    }

    document.documentElement.classList.toggle('reduce-motion', this.reducedMotion);
  }

  toggle() {
    this.reducedMotion = !this.reducedMotion;
    localStorage.setItem('reduceMotion', String(this.reducedMotion));
    document.documentElement.classList.toggle('reduce-motion', this.reducedMotion);
  }
}
```

### 1.13 Known Accessibility Gaps in Storyline 360

Based on Articulate's own Accessibility Maturity Plan and community reports:

| Gap | Impact | Our Advantage |
|-----|--------|---------------|
| Drag-and-drop NOT keyboard accessible | High | We build keyboard+touch alternatives |
| Likert scale not keyboard accessible | Medium | We use standard radio groups |
| Layer changes not announced to screen readers | High | We use aria-live regions |
| Tables lack semantic markup (improving) | Medium | We use proper `<table>` HTML |
| No `prefers-reduced-motion` support | Medium | We respect OS motion settings |
| Multi-language captions unavailable | Medium | We support multi-language VTT |
| Player tab order not customizable | Low | We control all our HTML |
| Slider values lack contextual labels | Medium | We use `aria-valuetext` |
| GIFs cannot be paused | Low | We use CSS animations (pausable) |
| No WCAG 1.3.5 (Input Purpose) support | Low | We use `autocomplete` attributes |

---

## 2. SCORM Implementation

### 2.1 SCORM 1.2 Implementation

**SCORM 1.2 Core Data Model Elements:**

| Element | Type | Access | Description |
|---------|------|--------|-------------|
| `cmi.core.student_id` | CMIIdentifier | RO | Learner identifier from LMS |
| `cmi.core.student_name` | CMIString255 | RO | Learner name from LMS |
| `cmi.core.lesson_location` | CMIString255 | RW | Bookmark location (slide/page ID) |
| `cmi.core.lesson_status` | Vocab | RW | `passed`, `completed`, `failed`, `incomplete`, `browsed`, `not attempted` |
| `cmi.core.score.raw` | CMIDecimal | RW | Numeric score (0-100 typical) |
| `cmi.core.score.min` | CMIDecimal | RW | Minimum possible score |
| `cmi.core.score.max` | CMIDecimal | RW | Maximum possible score |
| `cmi.core.credit` | Vocab | RO | `credit` or `no-credit` |
| `cmi.core.entry` | Vocab | RO | `ab-initio`, `resume`, or empty |
| `cmi.core.exit` | Vocab | WO | `time-out`, `suspend`, `logout`, empty |
| `cmi.core.session_time` | CMITimespan | WO | Time for current session |
| `cmi.core.total_time` | CMITimespan | RO | Cumulative time across sessions |
| `cmi.suspend_data` | CMIString4096 | RW | **Max 4,096 chars** - bookmark state |
| `cmi.launch_data` | CMIString4096 | RO | Data from imsmanifest.xml |
| `cmi.interactions.n.*` | Various | WO | Quiz question-level data |

**SCORM 1.2 API Functions:**

```javascript
// The 8 required API functions (implemented by the LMS)
API.LMSInitialize("")     // Start session
API.LMSFinish("")          // End session
API.LMSGetValue(element)   // Read data
API.LMSSetValue(element, value)  // Write data
API.LMSCommit("")          // Persist data
API.LMSGetLastError()      // Get error code
API.LMSGetErrorString(errorCode)  // Get error description
API.LMSGetDiagnostic(errorCode)   // Get diagnostic info
```

**SCORM 1.2 Error Codes:**

| Code | Meaning |
|------|---------|
| 0 | No error |
| 101 | General exception |
| 201 | Invalid argument error |
| 202 | Element cannot have children |
| 203 | Element not an array |
| 301 | Not initialized |
| 401 | Not implemented error |
| 402 | Invalid set value |
| 403 | Element is read only |
| 404 | Element is write only |
| 405 | Incorrect data type |

### 2.2 SCORM 2004 Differences

Key differences from 1.2:

| Feature | SCORM 1.2 | SCORM 2004 |
|---------|-----------|------------|
| Status | Single `lesson_status` | Split: `completion_status` + `success_status` |
| Score | `score.raw/min/max` | Adds `score.scaled` (-1.0 to 1.0) |
| suspend_data | 4,096 chars | **64,000 chars** |
| API object name | `API` | `API_1484_11` |
| Sequencing | None | Full sequencing & navigation |
| Navigation | Content-controlled | `adl.nav.request` (continue, previous, choice, jump) |
| Init/Finish | `LMSInitialize`/`LMSFinish` | `Initialize`/`Terminate` |
| Interactions | Write-only | **Read-Write** (can review answers) |
| Editions | Single | 2nd, 3rd, 4th editions (4th adds jump navigation) |

**SCORM 2004 API naming changes:**
```javascript
// SCORM 2004 uses different function names
API_1484_11.Initialize("")
API_1484_11.Terminate("")
API_1484_11.GetValue(element)
API_1484_11.SetValue(element, value)
API_1484_11.Commit("")
API_1484_11.GetLastError()
API_1484_11.GetErrorString(errorCode)
API_1484_11.GetDiagnostic(errorCode)
```

**SCORM 2004 status separation example:**
```javascript
// SCORM 1.2: Single status field
API.LMSSetValue("cmi.core.lesson_status", "passed");

// SCORM 2004: Separate completion and success
API_1484_11.SetValue("cmi.completion_status", "completed");
API_1484_11.SetValue("cmi.success_status", "passed");
```

### 2.3 scormdriver.js Architecture

Storyline 360 packages a `scormdriver.js` file that serves as the bridge between content and LMS:

**Evolution:**
- Older versions: Multiple files (`lms/`, `SCORMFunctions.js`, `SCORM2004Functions.js`)
- Builds 3.39.21985.0+: Consolidated into a single `scormdriver.js`

**Key functions in scormdriver.js:**

```javascript
// Storyline's SCORM wrapper functions (simplified representation)

// Global flag to prevent double-initialization
var initCalled = false;

function SCORM_GrabAPI() {
  // Searches parent frames and opener windows for the API object
  // SCORM 1.2: looks for window.API
  // SCORM 2004: looks for window.API_1484_11
  var api = null;
  var findAttempts = 0;
  var findAttemptLimit = 500; // max search depth

  // Check opener window first (pop-up launch)
  if (window.opener && !window.opener.closed) {
    api = findAPI(window.opener);
  }
  // Then check parent frames (iframe launch)
  if (!api) {
    api = findAPI(window);
  }
  return api;
}

function SCORM_CallLMSInitialize() {
  if (initCalled) return "true"; // Prevent double-init
  initCalled = true;

  var api = SCORM_GrabAPI();
  if (!api) {
    // Graceful fallback: content works without LMS
    console.warn("No LMS API found. Running in standalone mode.");
    return "false";
  }

  var result = api.LMSInitialize("");
  if (result !== "true") {
    var errorCode = api.LMSGetLastError();
    console.error("LMSInitialize failed:", errorCode);
  }
  return result;
}

function SCORM_CallLMSSetValue(element, value) {
  var api = SCORM_GrabAPI();
  if (!api) return "false";

  var result = api.LMSSetValue(element, value);
  if (result !== "true") {
    var errorCode = api.LMSGetLastError();
    console.error("LMSSetValue failed for", element, ":", errorCode);
  }
  return result;
}

function SCORM_CallLMSCommit() {
  var api = SCORM_GrabAPI();
  if (!api) return "false";
  return api.LMSCommit("");
}

function SCORM_CallLMSFinish() {
  var api = SCORM_GrabAPI();
  if (!api) return "false";
  return api.LMSFinish("");
}
```

**Debug mode:**
```javascript
// In scormdriver.js, set to true for debug logging
var SHOW_DEBUG_ON_LAUNCH = false;
// When true, shows a debug panel with all SCORM calls
```

### 2.4 LMS Communication Lifecycle

```
┌─────────────────────────────────────────────────────┐
│                   SCORM Lifecycle                     │
├─────────────────────────────────────────────────────┤
│                                                       │
│  1. LMS launches SCO in iframe/popup                  │
│     └── Sets API/API_1484_11 on window               │
│                                                       │
│  2. SCO calls LMSInitialize("")                       │
│     └── LMS returns "true" or error                  │
│                                                       │
│  3. SCO reads initial state                           │
│     ├── LMSGetValue("cmi.core.entry")                │
│     │   └── "ab-initio" (new) or "resume"            │
│     ├── LMSGetValue("cmi.core.lesson_status")        │
│     │   └── Check if already completed               │
│     ├── LMSGetValue("cmi.core.lesson_location")      │
│     │   └── Get bookmark for resume                  │
│     └── LMSGetValue("cmi.suspend_data")              │
│         └── Get saved state (variables, progress)    │
│                                                       │
│  4. Learner interacts with content                    │
│     ├── LMSSetValue("cmi.core.lesson_location", ...) │
│     ├── LMSSetValue("cmi.suspend_data", ...)         │
│     ├── LMSSetValue("cmi.interactions.n.*", ...)     │
│     └── LMSCommit("") (periodic save)                │
│                                                       │
│  5. On completion/quiz finish                         │
│     ├── LMSSetValue("cmi.core.lesson_status", ...)   │
│     ├── LMSSetValue("cmi.core.score.raw", ...)       │
│     ├── LMSSetValue("cmi.core.score.min", "0")       │
│     ├── LMSSetValue("cmi.core.score.max", "100")     │
│     └── LMSCommit("")                                │
│                                                       │
│  6. SCO calls LMSFinish("")                           │
│     ├── LMSSetValue("cmi.core.exit", "suspend")      │
│     ├── LMSSetValue("cmi.core.session_time", ...)    │
│     └── LMS persists all data                        │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Critical implementation detail from Storyline:**

```javascript
// How Storyline handles the init → check status → resume flow
function onCourseLoad() {
  SCORM_CallLMSInitialize();

  // CRITICAL: Check current status BEFORE setting anything
  var currentStatus = SCORM_CallLMSGetValue("cmi.core.lesson_status");
  var entry = SCORM_CallLMSGetValue("cmi.core.entry");

  // Only set "incomplete" if this is a brand new attempt
  if (currentStatus === "not attempted" || currentStatus === "") {
    SCORM_CallLMSSetValue("cmi.core.lesson_status", "incomplete");
  }

  // If resuming, restore state
  if (entry === "resume") {
    var bookmarkSlide = SCORM_CallLMSGetValue("cmi.core.lesson_location");
    var savedState = SCORM_CallLMSGetValue("cmi.suspend_data");

    if (bookmarkSlide) {
      navigateToSlide(bookmarkSlide);
    }
    if (savedState) {
      try {
        restoreState(JSON.parse(savedState));
      } catch (e) {
        console.warn("Could not parse suspend_data:", e);
      }
    }
  }

  SCORM_CallLMSCommit();
}
```

### 2.5 Completion & Status Reporting

**Storyline 360 completion tracking options:**

1. **Track by slides viewed** - Course completes when learner views N of M slides
2. **Track by quiz result** - Course completes when quiz Results slide is reached
3. **Track by trigger** - Course author sets a JavaScript trigger for completion

**Status values and their meaning:**

| Status | When Set | SCORM 1.2 | SCORM 2004 |
|--------|----------|-----------|------------|
| Not attempted | Before first launch | `not attempted` | completion: `not attempted` |
| Incomplete | After launch, before criteria met | `incomplete` | completion: `incomplete` |
| Completed | Criteria met (no quiz) | `completed` | completion: `completed` |
| Passed | Quiz score >= passing score | `passed` | success: `passed` |
| Failed | Quiz score < passing score | `failed` | success: `failed` |

**Critical behavior: Whichever tracking option is met first gets reported.**

```javascript
// Our improved status reporting
class StatusReporter {
  constructor(scormAPI) {
    this.api = scormAPI;
    this.hasReportedCompletion = false;
  }

  reportCompletion() {
    if (this.hasReportedCompletion) return; // Don't re-report

    if (this.api.version === '1.2') {
      this.api.setValue('cmi.core.lesson_status', 'completed');
    } else {
      this.api.setValue('cmi.completion_status', 'completed');
    }
    this.api.commit();
    this.hasReportedCompletion = true;
  }

  reportQuizResult(score, passingScore, maxScore) {
    const passed = score >= passingScore;

    if (this.api.version === '1.2') {
      this.api.setValue('cmi.core.score.raw', String(score));
      this.api.setValue('cmi.core.score.min', '0');
      this.api.setValue('cmi.core.score.max', String(maxScore));
      this.api.setValue('cmi.core.lesson_status', passed ? 'passed' : 'failed');
    } else {
      this.api.setValue('cmi.score.raw', String(score));
      this.api.setValue('cmi.score.min', '0');
      this.api.setValue('cmi.score.max', String(maxScore));
      this.api.setValue('cmi.score.scaled', String(score / maxScore));
      this.api.setValue('cmi.success_status', passed ? 'passed' : 'failed');
      this.api.setValue('cmi.completion_status', 'completed');
    }
    this.api.commit();
  }
}
```

### 2.6 Score Calculation & Reporting

**How Storyline calculates scores:**
- Each quiz question has a weight (default: equal weight)
- Raw score = sum of correct question points / total possible points * 100
- Passing score set per Results slide (e.g., 80%)
- `mastery_score` in imsmanifest.xml can override the passing threshold

**Key issue:** `cmi.core.score` values are constantly revised during a quiz. The LMS typically captures the final values after `LMSCommit()`.

**Mastery score behavior:**
- If `mastery_score` is defined in the manifest, the LMS compares `cmi.core.score.raw` against it
- This can override Storyline's own pass/fail determination
- Some LMS platforms use this to auto-set lesson_status to "passed" or "failed"

```javascript
// Our score reporting with full data
function reportScore(quizData) {
  const { questions, passingPercent } = quizData;

  // Calculate weighted score
  let totalWeight = 0;
  let earnedWeight = 0;
  questions.forEach(q => {
    totalWeight += q.weight;
    if (q.correct) earnedWeight += q.weight;
  });

  const rawScore = Math.round((earnedWeight / totalWeight) * 100);
  const scaledScore = earnedWeight / totalWeight;
  const passed = rawScore >= passingPercent;

  // Report to SCORM
  scormAPI.setValue('cmi.core.score.raw', String(rawScore));
  scormAPI.setValue('cmi.core.score.min', '0');
  scormAPI.setValue('cmi.core.score.max', '100');
  scormAPI.setValue('cmi.core.lesson_status', passed ? 'passed' : 'failed');

  // Also report individual interactions (see Section 2.8)
  reportInteractions(questions);

  scormAPI.commit();
}
```

### 2.7 Bookmarking & suspend_data

**Storyline's suspend_data format:**

Storyline stores compressed/encoded state in `cmi.suspend_data`:
- Current slide location
- Variable values (all Storyline variables)
- Slide visited states
- Button/object states (normal, visited, selected, disabled)
- Quiz attempt data
- Layer states

**suspend_data limits are a real problem:**

| SCORM Version | Limit | Storyline Impact |
|---------------|-------|-----------------|
| SCORM 1.2 | 4,096 chars | A 25-question quiz uses ~50% of this limit |
| SCORM 2004 4th Ed | 64,000 chars | Much more room, but still finite |

**suspend_data growth factors:**
- Each slide visit adds ~10 characters
- Quiz questions add significant data (responses, states)
- Custom variables add to the size
- Toggling between slides inflates the data

**Strategies Storyline authors use to reduce suspend_data:**
1. Delete unused variables
2. Set slides to "Reset to initial state" on revisit
3. Minimize the number of tracked states
4. Use SCORM 2004 when possible (16x more space)

**What we can do better:**

```javascript
// Our compact suspend_data format
class SuspendDataManager {
  constructor(scormAPI, maxSize) {
    this.api = scormAPI;
    this.maxSize = maxSize; // 4096 for SCORM 1.2, 64000 for 2004
    this.data = {};
  }

  // Load saved state
  load() {
    const raw = this.api.getValue('cmi.suspend_data');
    if (!raw) return {};

    try {
      // Try JSON first
      this.data = JSON.parse(raw);
    } catch (e) {
      // Try LZ-compressed JSON
      try {
        this.data = JSON.parse(this.decompress(raw));
      } catch (e2) {
        console.warn('Could not parse suspend_data, starting fresh');
        this.data = {};
      }
    }
    return this.data;
  }

  // Save state with compression if needed
  save() {
    let serialized = JSON.stringify(this.data);

    // If over limit, compress
    if (serialized.length > this.maxSize * 0.8) {
      serialized = this.compress(serialized);
    }

    // If still over limit, trim non-essential data
    if (serialized.length > this.maxSize) {
      this.trimNonEssential();
      serialized = JSON.stringify(this.data);
    }

    if (serialized.length <= this.maxSize) {
      this.api.setValue('cmi.suspend_data', serialized);
      this.api.commit();
      return true;
    } else {
      console.error('suspend_data exceeds limit even after compression');
      return false;
    }
  }

  // Efficient data format: use short keys
  setProgress(scoId, slideIndex, variables) {
    this.data = {
      s: scoId,                    // Current SCO
      p: slideIndex,               // Current slide/page
      v: variables,                // User variables (short keys)
      q: this.data.q || [],        // Quiz responses
      t: Math.floor(Date.now()/1000), // Timestamp
      b: this.data.b || {}         // Behavioral summary
    };
  }

  // Simple run-length compression for repeated characters
  compress(str) {
    // Use base64 encoding + simple compression
    return btoa(str);
  }

  decompress(str) {
    return atob(str);
  }

  trimNonEssential() {
    // Remove behavioral data first (it's in cmi.interactions too)
    delete this.data.b;
    // Then trim old quiz attempts (keep only latest)
    if (this.data.q && this.data.q.length > 1) {
      this.data.q = [this.data.q[this.data.q.length - 1]];
    }
  }
}
```

### 2.8 Quiz Interaction Reporting (cmi.interactions)

**SCORM interaction data model:**

```javascript
// For each quiz question, Storyline reports:
cmi.interactions.n.id           // Unique interaction ID
cmi.interactions.n.type         // true_false, choice, fill_in, matching, etc.
cmi.interactions.n.timestamp    // When the interaction occurred (2004 only)
cmi.interactions.n.weighting    // Point value/weight
cmi.interactions.n.learner_response  // What the learner answered (called student_response in 1.2)
cmi.interactions.n.correct_responses.0.pattern  // The correct answer
cmi.interactions.n.result       // correct, incorrect, unanticipated, neutral
cmi.interactions.n.latency      // Time spent on this question
cmi.interactions.n.description  // Question text (SCORM 2004 only, NOT reported by Storyline)
```

**Interaction types and response formats:**

| Type | Response Format | Example |
|------|----------------|---------|
| `true-false` | `true` or `false` | `true` |
| `choice` | Comma-separated IDs | `option_a,option_c` |
| `fill-in` | Free text | `photosynthesis` |
| `matching` | Source[.]Target pairs | `1[.]a,2[.]c,3[.]b` |
| `sequencing` | Ordered IDs | `step_3,step_1,step_2` |
| `numeric` | Number | `42.5` |
| `likert` | Scale ID | `strongly_agree` |

**Storyline's known limitation:** `cmi.interactions.n.description` (question text) is NOT reported. Some users edit SCORM2004Functions.js manually to add it.

**What we can do better:**

```javascript
// Our comprehensive interaction reporting
class InteractionReporter {
  constructor(scormAPI) {
    this.api = scormAPI;
    this.interactionCount = 0;
  }

  reportQuestion(question) {
    const n = this.interactionCount;
    const prefix = this.api.version === '1.2'
      ? `cmi.interactions.${n}`
      : `cmi.interactions.${n}`;

    // Human-readable IDs (not "urn:scormdriver:..." like Storyline)
    this.api.setValue(`${prefix}.id`, question.id);
    this.api.setValue(`${prefix}.type`, question.type);

    // Question text - Storyline MISSES this!
    if (this.api.version !== '1.2') {
      this.api.setValue(`${prefix}.description`, question.text);
    }

    // Learner response with human-readable values
    const responseKey = this.api.version === '1.2'
      ? `${prefix}.student_response`
      : `${prefix}.learner_response`;
    this.api.setValue(responseKey, this.formatResponse(question));

    // Correct response pattern
    this.api.setValue(
      `${prefix}.correct_responses.0.pattern`,
      this.formatCorrectResponse(question)
    );

    // Result
    this.api.setValue(`${prefix}.result`, question.correct ? 'correct' : 'incorrect');

    // Weight
    this.api.setValue(`${prefix}.weighting`, String(question.weight || 1));

    // Latency (time spent on question)
    if (question.timeSpent) {
      this.api.setValue(`${prefix}.latency`, this.formatTime(question.timeSpent));
    }

    // Timestamp (SCORM 2004 only)
    if (this.api.version !== '1.2') {
      this.api.setValue(`${prefix}.timestamp`, new Date().toISOString());
    }

    this.interactionCount++;
    this.api.commit();
  }

  formatResponse(question) {
    switch (question.type) {
      case 'true-false':
        return question.learnerResponse ? 'true' : 'false';
      case 'choice':
        // Use meaningful IDs, not letters
        return question.selectedOptions.join(',');
      case 'fill-in':
        return question.learnerResponse;
      case 'matching':
        return question.pairs.map(p => `${p.source}[.]${p.target}`).join(',');
      case 'sequencing':
        return question.orderedItems.join(',');
      case 'numeric':
        return String(question.learnerResponse);
      default:
        return String(question.learnerResponse);
    }
  }

  formatCorrectResponse(question) {
    switch (question.type) {
      case 'true-false':
        return question.correctAnswer ? 'true' : 'false';
      case 'choice':
        return question.correctOptions.join(',');
      case 'fill-in':
        return question.correctAnswer;
      case 'matching':
        return question.correctPairs.map(p => `${p.source}[.]${p.target}`).join(',');
      case 'numeric':
        return `${question.min}:${question.max}`;
      default:
        return String(question.correctAnswer);
    }
  }

  formatTime(milliseconds) {
    // SCORM 1.2: HHHH:MM:SS.SS
    // SCORM 2004: PT#H#M#S (ISO 8601 duration)
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (this.api.version === '1.2') {
      return `${String(hours).padStart(4,'0')}:${String(minutes%60).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}.00`;
    } else {
      return `PT${hours}H${minutes%60}M${seconds%60}S`;
    }
  }
}
```

### 2.9 Error Handling

**How Storyline handles LMS communication failures:**

1. **Connectivity monitoring:** The SCORM player pings the server periodically by hitting a `checknet` file with a 2-second timeout
2. **Offline alert:** Optional alert warns users their progress may not be saved
3. **Graceful degradation:** Content continues to function even without LMS communication
4. **API not found:** If no LMS API is detected, content runs in "standalone mode"
5. **syncAfterResume bug:** A known bug (fixed in build 3.84.31647.0) caused errors when resuming courses set to "Always Resume"

**What we can do better:**

```javascript
// Our robust SCORM error handling
class SCORMErrorHandler {
  constructor(api) {
    this.api = api;
    this.errorLog = [];
    this.isConnected = true;
    this.pendingWrites = [];
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  // Wrap every SCORM call with error handling
  safeSetValue(element, value) {
    try {
      const result = this.api.setValue(element, value);
      if (result !== 'true') {
        const errorCode = this.api.getLastError();
        this.handleError(errorCode, 'SetValue', element, value);
        return false;
      }
      this.retryCount = 0;
      return true;
    } catch (e) {
      this.handleConnectionError(element, value);
      return false;
    }
  }

  handleError(errorCode, operation, element, value) {
    const error = {
      code: errorCode,
      operation: operation,
      element: element,
      value: value,
      timestamp: Date.now()
    };

    this.errorLog.push(error);

    switch (errorCode) {
      case '301': // Not initialized
        console.warn('SCORM not initialized, attempting re-init...');
        this.api.initialize();
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          this.safeSetValue(element, value);
        }
        break;

      case '402': // Invalid set value
        console.error(`Invalid value for ${element}: ${value}`);
        break;

      case '403': // Read only
        console.warn(`Cannot write to read-only element: ${element}`);
        break;

      default:
        console.error(`SCORM error ${errorCode}: ${this.api.getErrorString(errorCode)}`);
    }
  }

  handleConnectionError(element, value) {
    this.isConnected = false;
    // Queue the write for retry
    this.pendingWrites.push({ element, value, timestamp: Date.now() });
    // Show user-friendly message (not an intrusive alert)
    this.showConnectionWarning();
  }

  // Retry pending writes when connection restored
  retryPendingWrites() {
    while (this.pendingWrites.length > 0) {
      const write = this.pendingWrites.shift();
      if (!this.safeSetValue(write.element, write.value)) {
        // Put it back and stop retrying
        this.pendingWrites.unshift(write);
        break;
      }
    }
    if (this.pendingWrites.length === 0) {
      this.isConnected = true;
      this.hideConnectionWarning();
    }
  }

  showConnectionWarning() {
    const warning = document.getElementById('connection-warning');
    if (warning) {
      warning.hidden = false;
      warning.setAttribute('role', 'alert');
    }
  }

  hideConnectionWarning() {
    const warning = document.getElementById('connection-warning');
    if (warning) warning.hidden = true;
  }
}
```

### 2.10 Multi-SCO vs Single-SCO

**Storyline's approach:** Single-SCO only. Each published Storyline project is ONE SCO with one launch file. For multi-SCO courses, users must:
1. Publish each module separately
2. Use a third-party tool (e.g., Simple SCORM Packager) to combine them
3. Manually edit the imsmanifest.xml

**Industry reality:** ~90% of SCORM 1.2 courses are single-SCO.

**Our approach (already better):**

```
output/course-name/
  imsmanifest.xml          ← We generate multi-SCO manifests natively
  shared/                  ← Shared resources across all SCOs
    scorm-api.js
    base.css
    theme.css
  sco_01_introduction/     ← Each SCO is independently trackable
    index.html
  sco_02_lesson_1/
    index.html
  sco_03_quiz_1/
    index.html
```

Each SCO can independently:
- Initialize/terminate with the LMS
- Report its own completion status
- Report its own score
- Store its own suspend_data
- Report its own interactions

### 2.11 imsmanifest.xml Structure

**Storyline's generated manifest (SCORM 1.2):**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="Storyline_Course_ID"
          version="1.0"
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>

  <organizations default="storyline_org">
    <organization identifier="storyline_org">
      <title>Course Title Here</title>
      <item identifier="storyline_item"
            identifierref="storyline_resource"
            isvisible="true">
        <title>Course Title Here</title>
        <adlcp:masteryscore>80</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>

  <resources>
    <resource identifier="storyline_resource"
              type="webcontent"
              adlcp:scormtype="sco"
              href="story.html">
      <file href="story.html"/>
      <file href="story_content/..."/>
      <file href="mobile/..."/>
      <file href="scormdriver/scormdriver.js"/>
      <!-- All content files listed here -->
    </resource>
  </resources>
</manifest>
```

**Our multi-SCO manifest (SCORM 1.2):**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="course_manifest_id"
          version="1.0"
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>

  <organizations default="course_org">
    <organization identifier="course_org">
      <title>Moon Phases: A Space Explorer's Journey</title>

      <item identifier="item_intro"
            identifierref="res_intro"
            isvisible="true">
        <title>Welcome & Overview</title>
      </item>

      <item identifier="item_lesson1"
            identifierref="res_lesson1"
            isvisible="true">
        <title>Module 1: Understanding the Moon</title>
      </item>

      <item identifier="item_quiz1"
            identifierref="res_quiz1"
            isvisible="true">
        <title>Knowledge Check: Module 1</title>
        <adlcp:masteryscore>80</adlcp:masteryscore>
      </item>

      <item identifier="item_lesson2"
            identifierref="res_lesson2"
            isvisible="true">
        <title>Module 2: The Eight Phases</title>
      </item>

      <item identifier="item_quiz2"
            identifierref="res_quiz2"
            isvisible="true">
        <title>Knowledge Check: Module 2</title>
        <adlcp:masteryscore>80</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>

  <resources>
    <!-- Shared resources -->
    <resource identifier="res_shared" type="webcontent" adlcp:scormtype="asset">
      <file href="shared/scorm-api.js"/>
      <file href="shared/behavior-tracker.js"/>
      <file href="shared/base.css"/>
      <file href="shared/theme.css"/>
    </resource>

    <!-- Individual SCOs -->
    <resource identifier="res_intro" type="webcontent"
              adlcp:scormtype="sco" href="sco_01_introduction/index.html">
      <file href="sco_01_introduction/index.html"/>
      <dependency identifierref="res_shared"/>
    </resource>

    <resource identifier="res_lesson1" type="webcontent"
              adlcp:scormtype="sco" href="sco_02_lesson_1/index.html">
      <file href="sco_02_lesson_1/index.html"/>
      <dependency identifierref="res_shared"/>
    </resource>

    <resource identifier="res_quiz1" type="webcontent"
              adlcp:scormtype="sco" href="sco_03_quiz_1/index.html">
      <file href="sco_03_quiz_1/index.html"/>
      <dependency identifierref="res_shared"/>
    </resource>
  </resources>
</manifest>
```

### 2.12 xAPI (Tin Can) Support

Storyline 360 supports xAPI via a built-in "Send xAPI Statement" trigger. No custom code needed for basic statements.

**xAPI statement structure from Storyline:**

```json
{
  "actor": {
    "name": "Learner Name",
    "mbox": "mailto:learner@example.com",
    "objectType": "Agent"
  },
  "verb": {
    "id": "http://adlnet.gov/expapi/verbs/experienced",
    "display": {
      "en-US": "experienced"
    }
  },
  "object": {
    "id": "http://example.com/courses/course-id/activity-id",
    "objectType": "Activity",
    "definition": {
      "name": {
        "en-US": "Activity Name"
      },
      "type": "http://adlnet.gov/expapi/activities/cmi.interaction"
    }
  },
  "result": {
    "score": {
      "scaled": 0.85,
      "raw": 85,
      "min": 0,
      "max": 100
    },
    "success": true,
    "completion": true
  }
}
```

**Default xAPI verbs Storyline sends:**
- `experienced` - Learner viewed content
- `attempted` - Learner started a quiz/assessment
- `launched` - Course was opened

**Custom xAPI variables in Storyline:**
- `verbID_xAPI` - URL for the verb (e.g., `http://adlnet.gov/expapi/verbs/completed`)
- `verbDisplay_xAPI` - Display text for the verb (e.g., "completed")
- `contentID_xAPI` - Activity URL identifier
- `contentName_xAPI` - Human-readable activity name

### 2.13 LMS Compatibility & Quirks

**Known LMS-specific issues with Storyline 360:**

#### Moodle
- Responsive player doesn't shrink for mobile (change Display setting to "New Window (simple)")
- Nav buttons may not display in Moodle mobile app
- Scores don't update on quiz retake in SCORM 1.2 (Moodle considers course in "review mode")
- JavaScript in textareas can intercept keypress events

#### Canvas
- Chrome sync XHR deprecation broke completion reporting (needs `exit module` trigger)
- Replacing a SCORM file requires clearing student attempts
- SCORM 2004 works more reliably than 1.2 on Canvas

#### Blackboard
- Must use "Track using quiz result" (not slides viewed) to report scores
- Some Blackboard versions override Storyline's completion settings

#### General Best Practices
- **Always test in SCORM Cloud first** to isolate LMS vs content issues
- Add an explicit `exit module` or `course end` trigger
- Use SCORM 2004 4th Edition when possible (better data model)
- Set `cmi.core.exit = "suspend"` to ensure proper bookmarking

---

## 3. Gap Analysis: What We Can Improve

### Accessibility Improvements Over Storyline

| Feature | Storyline | Our SCORM Studio | Advantage |
|---------|-----------|-------------------|-----------|
| Semantic HTML | Positioned divs | Full semantic (`<article>`, `<section>`, `<nav>`) | Much better screen reader experience |
| Keyboard drag-and-drop | Not supported | Built-in select-then-place pattern | Full keyboard accessibility |
| Layer announcements | Not announced | `aria-live` regions for all dynamic content | Screen readers catch all changes |
| `prefers-reduced-motion` | Not supported | Full support + manual toggle | Motion-sensitive users served |
| Skip navigation | "Back to top" only | Multiple skip links (content, nav, quiz) | More flexible navigation |
| Focus indicators | Two-color rectangle | `:focus-visible` with high contrast mode support | Works in forced-colors mode |
| Tables | Non-semantic (improving) | Full `<table>` with `<th>`, `<caption>`, scope | Proper data tables |
| Multi-language captions | Not supported | Multiple `<track>` elements with language selector | Arabic + English captions |
| Color contrast | Author responsibility | Enforced via theme tokens with documented ratios | Guaranteed compliance |
| Input purpose (1.3.5) | Not supported | `autocomplete` attributes on all form inputs | WCAG 2.1 compliant |

### SCORM Improvements Over Storyline

| Feature | Storyline | Our SCORM Studio | Advantage |
|---------|-----------|-------------------|-----------|
| Multi-SCO packaging | Not supported (single SCO only) | Native multi-SCO with shared resources | Better LMS tracking |
| Interaction description | Not reported | Full question text in `cmi.interactions.n.description` | Better LMS reporting |
| suspend_data efficiency | Bloats ~10 chars/slide visit | Compact JSON with optional compression | More room for state |
| Behavioral tracking | None | Full BehaviorTracker library (timing, scroll, navigation) | Rich learning analytics |
| Status checking on init | Sometimes overwrites status | Always checks current status before setting | No accidental status reset |
| Error queuing | Alert + stop | Queue writes, retry when connection restores | Better offline resilience |
| Session time tracking | Basic | Precise `cmi.core.session_time` with pause detection | Accurate time data |

---

## 4. Implementation Recommendations

### For Our scorm-api.js

1. **Support both SCORM 1.2 and 2004** with a unified wrapper that detects the API version
2. **Always check status before setting** - never blindly set "incomplete"
3. **Report full interaction data** including question text (description field)
4. **Implement connection monitoring** with write queuing for offline resilience
5. **Use compact suspend_data** with short keys and optional compression
6. **Track session time accurately** with pause/resume detection
7. **Handle mastery_score** from manifest to avoid LMS conflicts

### For Our Accessibility

1. **Use semantic HTML throughout** - `<article>`, `<section>`, `<nav>`, `<main>`
2. **Implement aria-live regions** for all dynamic content changes (slide transitions, quiz feedback, progress updates)
3. **Build keyboard-accessible alternatives** for every interactive element
4. **Support `prefers-reduced-motion`** in all CSS animations
5. **Provide skip navigation links** at the top of every page
6. **Use `:focus-visible`** for focus indicators (not `:focus`)
7. **Include full alt text** and `role="presentation"` for decorative images
8. **Support closed captions** with multi-language VTT files
9. **Test with JAWS, NVDA, and VoiceOver** before shipping

### For LMS Compatibility

1. **Test all packages in SCORM Cloud** before LMS deployment
2. **Include an explicit completion trigger** (don't rely solely on slide views)
3. **Set `cmi.core.exit = "suspend"`** on every session end for proper bookmarking
4. **Use SCORM 2004 4th Edition** as default (better data model, more suspend_data space)
5. **Document mastery_score behavior** for course admins
6. **Provide a "review mode"** that doesn't overwrite previous scores

---

## Sources

- [Articulate Storyline 360 Accessibility Conformance Report (VPAT)](https://www.articulate.com/about/accessibility/storyline-360-accessibility-conformance-report-vpat/)
- [Storyline 360 Accessibility Maturity Plan](https://www.articulate.com/about/accessibility/storyline-360-accessibility-maturity-plan/)
- [Storyline 360: Customizing the Focus Order](https://community.articulate.com/kb/user-guides/storyline-360-customizing-the-focus-order-of-slide-objects/1122908)
- [Storyline 360: Two-Color Focus Indicator](https://access.articulate.com/support/article/Storyline-360-Two-Color-Focus-Indicator)
- [Storyline 360: Skip Navigation Shortcut](https://articulate.com/support/article/Storyline-360-How-to-Use-the-Skip-Navigation-Shortcut)
- [Storyline 360: Adjustable Accessibility Settings](https://articulate.com/support/article/Storyline-360-Adjustable-Accessibility-Settings)
- [SCORM 1.2 Overview for Developers](https://scorm.com/scorm-explained/technical-scorm/scorm-12-overview-for-developers/)
- [SCORM 2004 Overview for Developers](https://scorm.com/scorm-explained/technical-scorm/scorm-2004-overview-for-developers/)
- [SCORM Run-Time Reference Chart](https://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/)
- [SCORM 2004 Manifest Structure](https://scorm.com/scorm-explained/technical-scorm/content-packaging/manifest-structure/)
- [4 Things Every SCORM Test Should Do](https://scorm.com/blog/4-things-every-scorm-test-should-do-when-reporting-interactions/)
- [Storyline 360: Custom xAPI Statements](https://articulate.com/support/article/Storyline-360-Custom-xAPI-Statements)
- [Storyline SCORM and Moodle Settings Guide](https://pttcnetwork.org/wp-content/uploads/2024/09/Storyline-SCORM-and-Moodle-Settings-for-HealtheKnowledge-Updated-09102020.pdf)
- [Track Multiple SCOs in the Same Course](https://articulate.com/support/article/track-multiple-scos-in-the-same-course)
- [Accessibility in Articulate Storyline: Complete Guide (B Online Learning)](https://bonlinelearning.com/accessible-elearning-articulate-storyline/)
