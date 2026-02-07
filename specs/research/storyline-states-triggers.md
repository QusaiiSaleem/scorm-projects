# Storyline 360: States, Triggers & Variables System — Deep Research

> Research document for replicating Storyline 360's interactivity engine in pure HTML/CSS/JS.
> Last updated: 2026-02-06

---

## Table of Contents

1. [Object States System](#1-object-states-system)
2. [Triggers System](#2-triggers-system)
3. [Variables System](#3-variables-system)
4. [Slide Layers](#4-slide-layers)
5. [Timeline & Cue Points](#5-timeline--cue-points)
6. [Motion Paths](#6-motion-paths)
7. [Published HTML5/JS Architecture](#7-published-html5js-architecture)
8. [Implementation: Pure JS Interactivity Engine](#8-implementation-pure-js-interactivity-engine)

---

## 1. Object States System

### Overview

Every object in Storyline 360 can have multiple **states** — alternate visual representations that change based on user interaction or programmatic control. States are the foundation of all visual interactivity.

### Built-In States

Storyline provides 10 built-in states, some automatic (no trigger needed) and some that must be triggered:

| State | Behavior | Auto-Triggered? | Description |
|-------|----------|-----------------|-------------|
| **Normal** | Default appearance | Yes (always exists) | Created automatically when an object is inserted. Cannot be renamed or deleted. The baseline appearance. |
| **Hover** | Mouse over | Yes | Appears when the learner moves their mouse cursor over the object. Signals clickability. Reverts when cursor leaves. |
| **Down** | Mouse press | Yes | Appears while the learner is actively clicking (mouse button held down). Reverts on release. |
| **Selected** | Toggle on/off | Yes (for button sets) | Like a radio button or toggle. Learner can select AND deselect. Used in quiz answer choices. Objects in a **button set** auto-deselect siblings when one is selected. |
| **Visited** | After first click | Yes | Permanent state change after first interaction. Does NOT revert automatically — stays visited unless a trigger resets it. Great for menus and click-to-reveal. |
| **Disabled** | No interaction | No (trigger only) | Object is visible but completely non-interactive. No hover, click, or drag events fire. Visual appearance typically grayed out. |
| **Hidden** | Invisible | No (trigger only) | Object is fully invisible and non-interactive. Removed from the visual display entirely. |
| **Drop Correct** | Drag-drop feedback | Yes (freeform quiz) | Appears when a draggable object is dropped on the CORRECT drop target. Auto-triggered in freeform drag-drop quizzes. |
| **Drop Incorrect** | Drag-drop feedback | Yes (freeform quiz) | Appears when a draggable object is dropped on an INCORRECT drop target. |
| **Drag Over** | Drag hover | Yes | Appears when a draggable object is hovering over (but not yet dropped on) a drop target. |

### Custom States

- Authors can create unlimited custom states with any name
- Custom states are NEVER auto-triggered — they always require an explicit trigger
- Each custom state can modify: text content, fill color, border, position, size, rotation, visibility of sub-elements, images, and more
- Since May 2022, custom states can be reordered freely in the States panel
- Common custom patterns: "Active", "Correct", "Incorrect", "Locked", "Completed", "Highlighted"

### State Diagram

```
                    ┌──────────┐
                    │  Normal  │ ← Default state (always exists)
                    └────┬─────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │  Hover   │  │ Disabled │  │  Hidden  │
    │ (auto)   │  │(trigger) │  │(trigger) │
    └────┬─────┘  └──────────┘  └──────────┘
         │
         ▼
    ┌──────────┐
    │   Down   │ ← Mouse button held
    │  (auto)  │
    └────┬─────┘
         │
    ┌────┴────────────────┐
    │                     │
    ▼                     ▼
┌──────────┐        ┌──────────┐
│ Selected │        │ Visited  │
│ (toggle) │        │(permanent│
└──────────┘        │ one-way) │
                    └──────────┘

Drag-Drop States (separate flow):
    ┌──────────┐     ┌──────────────┐     ┌────────────────┐
    │Drag Over │ ──► │ Drop Correct │ OR  │ Drop Incorrect │
    │ (hover)  │     │  (on submit) │     │  (on submit)   │
    └──────────┘     └──────────────┘     └────────────────┘
```

### State Properties (What Can Change Per State)

Each state is essentially a complete visual "snapshot" of the object. Properties that can differ per state:

- **Text**: Content, font, size, color, alignment
- **Fill**: Solid color, gradient, pattern, image fill
- **Border/Outline**: Color, width, style, radius
- **Position**: X, Y offset (object can shift position)
- **Size**: Width, height (object can grow/shrink)
- **Rotation**: Angle
- **Opacity**: Transparency level
- **Shadow**: Drop shadow, inner shadow
- **Image**: Completely different image/icon
- **Sub-element visibility**: Show/hide parts of grouped objects
- **Character poses**: For illustrated characters, different pose/expression

### Button Sets

When multiple objects are placed in a **button set**, they behave like radio buttons:
- Only ONE object in the set can be in the "Selected" state at a time
- Clicking a new object auto-deselects the previously selected one
- This is the foundation for quiz answer choices, tab interfaces, and toggle groups

---

## 2. Triggers System

### Overview

Triggers are the programming logic of Storyline — the "if this, then that" engine. Every interaction is powered by triggers. The system follows an **Event → Action → Target → Condition** model.

### Trigger Anatomy

Every trigger has three parts:

```
┌────────────────────────────────────────────────┐
│                   TRIGGER                       │
├────────────────────────────────────────────────┤
│  ACTION:  What should happen?                  │
│           e.g., "Change state of Button1       │
│                  to Visited"                   │
│                                                │
│  WHEN:    What event causes it?                │
│           e.g., "User clicks Button1"          │
│                                                │
│  IF:      What conditions must be true?        │
│   (opt)   e.g., "Variable 'score' >= 80"      │
│                                                │
│  ELSE:    What happens if conditions are false?│
│   (opt)   e.g., "Show layer 'TryAgain'"       │
└────────────────────────────────────────────────┘
```

### Trigger Actions (Complete List — ~25 Actions)

Based on research across official docs, community forums, and technical blogs:

#### Navigation Actions
| Action | Parameters | Description |
|--------|-----------|-------------|
| **Jump to slide** | Target slide | Navigate to a specific slide in any scene |
| **Jump to scene** | Target scene | Navigate to the first slide of a scene |
| **Jump to next slide** | — | Move to the next slide in sequence |
| **Jump to previous slide** | — | Move to the previous slide |
| **Jump to URL/file** | URL or file path | Open external link or file |
| **Lightbox slide** | Target slide | Open a slide as a lightbox overlay |
| **Close lightbox** | — | Dismiss the current lightbox |
| **Exit course** | — | Close the course entirely |

#### Layer Actions
| Action | Parameters | Description |
|--------|-----------|-------------|
| **Show layer** | Target layer | Display a slide layer |
| **Hide layer** | Target layer | Hide a specific slide layer |
| **Hide all layers** | — | Hide all visible layers at once |

#### State Actions
| Action | Parameters | Description |
|--------|-----------|-------------|
| **Change state of** | Object, target state | Switch an object to a specific state |
| **Toggle state** | Object, state A, state B | Alternate between two states (e.g., Hidden/Normal) |

#### Variable Actions
| Action | Parameters | Description |
|--------|-----------|-------------|
| **Adjust variable** | Variable, operator, value | Set, add, subtract, or assign a value to a variable |

#### Media Actions
| Action | Parameters | Description |
|--------|-----------|-------------|
| **Play media** | Target media | Start playing audio/video |
| **Pause media** | Target media | Pause audio/video |
| **Stop media** | Target media | Stop and reset audio/video |

#### Timeline Actions
| Action | Parameters | Description |
|--------|-----------|-------------|
| **Pause timeline** | Target (slide/layer) | Pause the timeline |
| **Resume timeline** | Target (slide/layer) | Resume a paused timeline |
| **Jump to time/cue point** | Time or cue point name | Seek timeline to specific position |

#### Motion Actions
| Action | Parameters | Description |
|--------|-----------|-------------|
| **Move object along path** | Object, motion path | Trigger a motion path animation |

#### Misc Actions
| Action | Parameters | Description |
|--------|-----------|-------------|
| **Execute JavaScript** | JS code string | Run arbitrary JavaScript code |
| **Set focus** | Target object | Move keyboard focus to an object (accessibility) |
| **Print results** | — | Print the results slide |
| **Complete course** | — | Mark the course as complete in the LMS |
| **Send xAPI statement** | Verb, object, result | Send a custom xAPI statement |
| **Submit interaction** | — | Submit the current interaction/quiz |

### Trigger Events ("When" Conditions — Complete List)

| Event Category | Specific Events |
|----------------|----------------|
| **Click Events** | User clicks, User double-clicks |
| **Hover Events** | User hovers over, User moves off |
| **Keyboard Events** | User presses key (specific key selection) |
| **Timeline Events** | Timeline starts, Timeline ends, Timeline reaches cue point [name] |
| **Slide Events** | Slide starts (first visit), Slide revisits |
| **Media Events** | Media starts, Media completes |
| **Drag-Drop Events** | Object dropped on [target], Object dropped over [target], Object drag started |
| **Variable Events** | Variable changes (specific variable) |
| **State Events** | State changes of [object] to [state] |
| **Layer Events** | Layer timeline starts, Layer timeline ends |
| **Animation Events** | Animation completes, Motion path completes |
| **Focus Events** | Object receives focus, Object loses focus |
| **Scroll Events** | Scrolling panel scrolls |
| **Data Entry Events** | Control loses focus (data entry fields) |

### Trigger Conditions

Conditions are optional filters that gate whether a trigger's action fires:

```
IF [condition_subject] [operator] [value]
  AND/OR [condition_subject] [operator] [value]
  ...
THEN [primary action]
ELSE [alternate action]    ← Optional "else" branch
```

#### Condition Subjects
- **Variable value**: Any user or built-in variable
- **Object state**: The current state of any object on the slide/layer
- **Window size**: The current browser/player window dimensions

#### Condition Operators
- **Numeric**: ==, !=, <, >, <=, >=
- **Text**: ==, !=, contains, starts with, ends with
- **Boolean**: is true, is false
- **State**: is [state name], is not [state name]

#### AND/OR Logic
- Multiple conditions can be combined with AND (all must be true) or OR (any can be true)
- Conditions are evaluated in order from top to bottom
- You can mix AND and OR, but they group logically

### Trigger Execution Order

Critical for predictable behavior:

1. **Slide Master triggers** execute FIRST (before slide/layer triggers)
2. **Slide triggers** execute next, in panel order (top to bottom)
3. **Layer triggers** execute when their layer is shown
4. Within the same event group, triggers execute **top-to-bottom** in the Triggers panel
5. A trigger that navigates away (Jump to slide) stops remaining triggers from firing
6. Order can be changed by dragging triggers up/down in the panel

```
Execution Priority:
┌─────────────────────┐
│  1. Slide Master     │ ← Highest priority
├─────────────────────┤
│  2. Base Slide       │
├─────────────────────┤
│  3. Active Layers    │ ← In stacking order
└─────────────────────┘

Within each level:
  Top trigger → fires first
  Bottom trigger → fires last
  ⚠️ Navigation triggers should be LAST (they exit the slide)
```

---

## 3. Variables System

### Overview

Variables in Storyline are data containers that persist across slides and scenes. They're the "memory" of the course — tracking scores, completion, user choices, and more.

### Variable Types

| Type | Values | Default | Use Cases |
|------|--------|---------|-----------|
| **True/False** (Boolean) | `true` or `false` | `false` | Toggle flags, visited tracking, feature gates, showing/hiding elements |
| **Number** | Any numeric value | `0` | Scores, counters, attempts, percentages, time tracking |
| **Text** (String) | Any text string | `""` (empty) | Learner name, custom feedback messages, data entry responses |

### Variable Scope

```
┌─────────────────────────────────────────────┐
│  PROJECT SCOPE (global)                      │
│  ┌──────────────────────────────────────┐   │
│  │  SCENE SCOPE                          │   │
│  │  ┌──────────────────────────────┐    │   │
│  │  │  SLIDE SCOPE                  │    │   │
│  │  │  (states live here only)      │    │   │
│  │  └──────────────────────────────┘    │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

User variables → Project-wide (any slide, any scene)
Built-in variables → Read-only, auto-updated by the system
States → Slide-only (reset on slide revisit unless configured)
```

**Key distinction**: Variables persist across slides/scenes. States are slide-local. This is why you use a variable (not a state) to track whether a learner has completed Module 1 when you need to check it on Module 2's slide.

### Built-In Variables

These are read-only system variables automatically maintained by Storyline:

#### Project-Level Variables
| Variable | Type | Description |
|----------|------|-------------|
| `Project.TotalSlides` | Number | Total slides in the entire project |
| `Project.SlidesViewed` | Number | How many slides the learner has visited |
| `Project.SlideNumber` | Number | Current slide's number in the project |
| `Project.CompletionPercentage` | Number | Percentage of slides viewed (0-100) |
| `Project.SceneCount` | Number | Total number of scenes |

#### Scene-Level Variables
| Variable | Type | Description |
|----------|------|-------------|
| `Scene.TotalSlides` | Number | Total slides in the current scene |
| `Scene.SlidesViewed` | Number | Slides viewed in the current scene |
| `Scene.SlideNumber` | Number | Current slide's number within the scene |
| `Scene.SceneNumber` | Number | Current scene's number in the project |

#### Slide-Level Variables
| Variable | Type | Description |
|----------|------|-------------|
| `Slide.Number` | Number | Current slide number |
| `Slide.MenuTitle` | Text | The slide's title as shown in the menu |

#### Quiz/Results Variables
| Variable | Type | Description |
|----------|------|-------------|
| `Results.ScorePoints` | Number | Points earned on quiz |
| `Results.ScorePercent` | Number | Percentage score on quiz |
| `Results.PassPoints` | Number | Points needed to pass |
| `Results.PassPercent` | Number | Percentage needed to pass |
| `Results.QuizAttempts` | Number | Number of quiz attempts taken |

#### Elapsed Time Variables
| Variable | Type | Description |
|----------|------|-------------|
| `Project.ElapsedTime` | Number | Total time spent in course (seconds) |
| `Scene.ElapsedTime` | Number | Time spent in current scene |
| `Slide.ElapsedTime` | Number | Time spent on current slide |

### User/Custom Variables

Authors create these for custom interactivity:

```
Variable creation:
  Name:     scoreTotal        (no spaces, camelCase convention)
  Type:     Number
  Default:  0
  Scope:    Project-wide (always)

Common patterns:
  visitedIntro        True/False    Track if intro was seen
  quizScore           Number        Running quiz score
  userName            Text          Learner's entered name
  attemptCount        Number        Number of quiz attempts
  moduleComplete_01   True/False    Module completion flag
  feedbackMessage     Text          Dynamic feedback text
```

### Variable Operations in Triggers

| Operation | Syntax | Example |
|-----------|--------|---------|
| **Assign** | Set [var] to [value] | Set `score` to `0` |
| **Add** | Add [value] to [var] | Add `10` to `score` |
| **Subtract** | Subtract [value] from [var] | Subtract `1` from `attempts` |
| **Assign from variable** | Set [var] to [other_var] | Set `total` to `score` |
| **Concatenate (text)** | Set [var] to [text] + [var] | Set `feedback` to `"Score: "` + `score` |

### Variable References in Content

Variables can be displayed inline in text objects using the reference syntax:
```
"Welcome, %userName%! Your score is %quizScore%."
```
The `%variableName%` placeholder is replaced with the live variable value at runtime.

---

## 4. Slide Layers

### Overview

Layers are overlay panels that stack on top of the base slide. They're used for feedback, popups, click-to-reveal content, and conditional information display.

### Layer Architecture

```
┌─────────────────────────────────────┐
│           SLIDE                      │
│  ┌──────────────────────────────┐   │
│  │      BASE LAYER              │   │ ← Always visible
│  │   (main slide content)       │   │    Has its own timeline
│  │                              │   │
│  │  ┌────────────────────────┐  │   │
│  │  │    LAYER 1: "Correct"  │  │   │ ← Overlays base layer
│  │  │  (feedback popup)      │  │   │    Has its own timeline
│  │  └────────────────────────┘  │   │
│  │                              │   │
│  │  ┌────────────────────────┐  │   │
│  │  │    LAYER 2: "Hint"     │  │   │ ← Another overlay
│  │  │  (help content)        │  │   │    Independent timeline
│  │  └────────────────────────┘  │   │
│  │                              │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Layer Properties

Each layer has configurable properties:

| Property | Options | Description |
|----------|---------|-------------|
| **Prevent clicking on base layer** | On/Off | When ON, the base layer becomes non-interactive. Learner must interact with the layer. |
| **Pause timeline of base layer** | On/Off | When ON, the base layer's timeline pauses while this layer is visible. |
| **Hide other slide layers** | On/Off | When ON, showing this layer automatically hides all other visible layers. |
| **Hide layer when timeline finishes** | On/Off | Layer auto-hides after its timeline completes. |
| **Allow seeking** | On/Off | Whether the timeline scrubber is available for this layer. |
| **Slide revisits** | Reset to initial state / Resume saved state | Behavior when the slide is revisited. |

### Layer Lifecycle

```
Layer Show Event:
  1. Layer becomes visible (overlaid on base)
  2. Layer timeline starts playing from 0:00
  3. Layer triggers marked "When timeline starts" fire
  4. If "Pause base layer timeline" → base pauses
  5. If "Prevent clicking base" → base becomes non-interactive
  6. If "Hide other layers" → other visible layers hide

Layer Hide Event:
  1. Layer becomes invisible
  2. Layer timeline stops
  3. Base layer timeline resumes (if it was paused)
  4. Base layer regains interactivity (if it was blocked)
```

### Common Layer Patterns

1. **Feedback layers**: "Correct" / "Incorrect" / "Try Again" — shown after quiz submission
2. **Click-to-reveal**: Each button shows a different info layer, with "hide other layers" ON
3. **Modal dialogs**: Layer with "prevent clicking base" creates a modal effect
4. **Timed hints**: Layer appears at a cue point, hides when its timeline ends
5. **Narration overlays**: Audio/video in a layer that pauses the base timeline

---

## 5. Timeline & Cue Points

### Timeline Overview

Every slide and every layer has its own **independent timeline** — a time-based ruler that controls when objects appear, animate, and disappear.

### Timeline Features

```
Timeline (10 seconds):
0s ──────────────────────────────────── 10s
│                                       │
│  ╔═══════════════════════╗            │  ← Object A: visible 0s-7s
│  ║     Object A          ║            │
│  ╚═══════════════════════╝            │
│                                       │
│        ╔═══════════════════════════╗  │  ← Object B: visible 2s-10s
│        ║       Object B            ║  │
│        ╚═══════════════════════════╝  │
│                                       │
│     ▼ Cue Point "show_hint"          │  ← Cue point at 3s
│                                       │
│              ╔══════════╗             │  ← Animation bar (entrance)
│              ║ Entrance ║             │
│              ╚══════════╝             │
```

### Object Timing on the Timeline

- Each object has a **start time** (when it appears) and **end time** (when it disappears)
- Objects can be dragged on the timeline to change their timing
- The z-order (depth) of objects is also controlled by timeline stacking

### Cue Points

Cue points are named markers on the timeline:

- Used as reference points for triggers ("When timeline reaches cue point X")
- Can be dragged to adjust timing without editing trigger values
- Motion path animations can be synced to cue points
- Named descriptively: "show_answer", "play_feedback", "start_animation"

### Timeline Triggers

| Event | Description |
|-------|-------------|
| Timeline starts | Fires when the slide/layer timeline begins playing |
| Timeline ends | Fires when the timeline reaches its end |
| Timeline reaches [time] | Fires at a specific time (e.g., 3.5 seconds) |
| Timeline reaches [cue point] | Fires when the playhead hits a named cue point |

### Timeline Actions

| Action | Description |
|--------|-------------|
| Pause timeline of [target] | Pause a slide or layer timeline |
| Resume timeline of [target] | Resume a paused timeline |
| Jump to [time/cue point] on timeline of [target] | Seek the playhead to a position |

---

## 6. Motion Paths

### Overview

Motion paths allow objects to move along defined paths on the slide. They can be triggered by events or synced to timeline cue points.

### Motion Path Types

| Type | Description |
|------|-------------|
| **Line** | Straight-line movement from point A to point B |
| **Arc** | Curved movement along an arc |
| **Turn** | Movement that makes a turn/corner |
| **Custom** | Freeform path with multiple control points (Bezier curves) |

### Motion Path Properties

| Property | Options | Description |
|----------|---------|-------------|
| **Start Point** | Relative / Absolute | Relative: starts from current position. Absolute: starts from fixed position. |
| **Origin** | Locked / Unlocked | Unlocked (default): path moves with object. Locked: path stays fixed on slide. |
| **Orient shape** | On / Off | When ON, the object rotates to follow the path direction. |
| **Ease** | In / Out / Both / None | Acceleration/deceleration effect on the animation. |
| **Duration** | Time in seconds | How long the motion takes. |
| **Delay** | Time in seconds | Delay before the motion starts. |

### Multiple Motion Paths

- An object can have MULTIPLE motion paths
- Each path can be triggered independently
- With "Relative Start Point", each subsequent path starts from where the previous one ended
- This enables complex multi-step animations

### Syncing to Timeline

Motion paths can be synced to cue points:
1. Place a cue point on the timeline where you want motion to begin
2. Right-click the motion path → Align to Cue Point → choose the cue point
3. Dragging the cue point now adjusts the motion timing automatically

---

## 7. Published HTML5/JS Architecture

### File Structure

```
published-output/
├── story.html              ← Main entry point (launches the player)
├── story_content/
│   ├── frame.xml           ← Player frame definition
│   ├── user.js             ← All Execute JavaScript trigger code
│   ├── data/               ← Slide data, object definitions
│   ├── slides/             ← Individual slide content
│   └── media/              ← Audio, video, images
├── html5/
│   ├── lib/                ← Player runtime engine + jQuery
│   └── data/               ← Compiled course data
├── mobile/                 ← Mobile-specific assets
└── meta.xml                ← Course metadata
```

### JavaScript Architecture

#### The Player Object

The **Player** is the central runtime engine. It acts as a gatekeeper for all course data:

```javascript
// The Player is the only bridge between JS and Storyline internals
var player = GetPlayer();

// Read a variable
var score = player.GetVar("scoreTotal");

// Write a variable
player.SetVar("scoreTotal", score + 10);
```

**Key architectural points:**
- `GetPlayer()` returns the singleton Player object
- `GetVar(name)` reads any Storyline variable (user or built-in)
- `SetVar(name, value)` writes to user variables only
- The Player "hides" all internal state — no direct DOM access to slide objects
- jQuery is bundled into the player (available without import)

#### user.js — Compiled Trigger Code

All JavaScript triggers are compiled into `story_content/user.js`:

```javascript
// Storyline wraps each trigger's JS in a named function
function Script1(){
  // Code from first JavaScript trigger
  var player = GetPlayer();
  player.SetVar("visited_intro", true);
}

function Script2(){
  // Code from second JavaScript trigger
  var player = GetPlayer();
  var name = player.GetVar("userName");
  alert("Hello, " + name);
}

// Functions are called by the engine when trigger events fire
// e.g., Script1() fires "when timeline starts" on slide 1
```

#### Advanced JavaScript API (2024+)

The newer Advanced API exposes object manipulation:

```javascript
// Get a reference to a named slide object
var obj = GetPlayer().GetSlideObject("myButton");

// Available properties:
obj.SetX(100);          // X position
obj.SetY(200);          // Y position
obj.SetRotation(45);    // Rotation in degrees
obj.SetScale(1.5);      // Scale factor
obj.SetOpacity(0.5);    // Transparency (0-1)
obj.SetDepth(10);       // Z-index / stacking order
```

#### Element Targeting in DOM

- Storyline assigns **random/obfuscated** element names in the DOM
- Targeting by **aria-label** (accessibility text) is the recommended approach
- Player chrome elements have predictable class names:
  - `.slide-control-button-next` — Next button
  - `.slide-control-button-prev` — Previous button
  - `.area-secondary` — Side menu panel
- Slide content elements are harder to target reliably

### Rendering Architecture

| Component | Technology |
|-----------|-----------|
| Text | Rendered as individual SVG files per character |
| Images | Standard img tags or canvas-rendered |
| Interactive objects | Canvas-based rendering with overlaid hit areas |
| Player chrome | Standard HTML/CSS with jQuery |
| Animations | CSS transitions + JS-driven transforms |
| Audio/Video | HTML5 audio/video elements |

---

## 8. Implementation: Pure JS Interactivity Engine

### Design Goals

Build a system that provides Storyline-equivalent interactivity using pure HTML/CSS/JS, suitable for our SCORM Content Studio pipeline.

### 8.1 State Manager

```javascript
/**
 * StateManager — Manages visual states for interactive objects
 * Equivalent to Storyline's Object States system
 */
class StateManager {
  constructor() {
    // Map of objectId → { currentState, states: { stateName: cssClass } }
    this.objects = new Map();
    // Map of buttonSetName → Set of objectIds
    this.buttonSets = new Map();
    // Callbacks for state change events
    this.listeners = [];
  }

  /**
   * Register an object with its available states
   * @param {string} objectId - DOM element id
   * @param {Object} states - { stateName: { className, styles, content } }
   * @param {Object} options - { buttonSet, initialState, autoStates }
   */
  register(objectId, states, options = {}) {
    const el = document.getElementById(objectId);
    if (!el) return;

    // Always include "normal" state
    const allStates = { normal: { className: '' }, ...states };

    this.objects.set(objectId, {
      element: el,
      currentState: options.initialState || 'normal',
      previousState: null,
      states: allStates,
      autoStates: options.autoStates !== false, // Hover/Down auto-behavior
      visited: false,
      disabled: false,
      hidden: false
    });

    // Register in button set if specified
    if (options.buttonSet) {
      if (!this.buttonSets.has(options.buttonSet)) {
        this.buttonSets.set(options.buttonSet, new Set());
      }
      this.buttonSets.get(options.buttonSet).add(objectId);
    }

    // Set up auto-states (hover, down, visited)
    if (options.autoStates !== false) {
      this._bindAutoStates(objectId);
    }

    // Apply initial state
    this._applyState(objectId, options.initialState || 'normal');
  }

  /**
   * Change an object's state
   * @param {string} objectId
   * @param {string} stateName
   */
  setState(objectId, stateName) {
    const obj = this.objects.get(objectId);
    if (!obj) return;
    if (obj.disabled && stateName !== 'normal') return; // Disabled blocks state changes

    // Handle special states
    if (stateName === 'hidden') {
      obj.hidden = true;
      obj.element.style.display = 'none';
      obj.element.setAttribute('aria-hidden', 'true');
      return;
    }

    if (stateName === 'disabled') {
      obj.disabled = true;
      obj.element.style.pointerEvents = 'none';
      obj.element.style.opacity = '0.5';
      obj.element.setAttribute('aria-disabled', 'true');
    }

    // Handle button set (deselect siblings)
    if (stateName === 'selected') {
      this._handleButtonSet(objectId);
    }

    obj.previousState = obj.currentState;
    obj.currentState = stateName;
    this._applyState(objectId, stateName);

    // Emit state change event
    this._emit('stateChange', { objectId, stateName, previousState: obj.previousState });
  }

  /**
   * Toggle between two states
   */
  toggleState(objectId, stateA, stateB) {
    const obj = this.objects.get(objectId);
    if (!obj) return;
    const next = obj.currentState === stateA ? stateB : stateA;
    this.setState(objectId, next);
  }

  /**
   * Get current state of an object
   */
  getState(objectId) {
    const obj = this.objects.get(objectId);
    return obj ? obj.currentState : null;
  }

  /** Check if object was visited */
  isVisited(objectId) {
    const obj = this.objects.get(objectId);
    return obj ? obj.visited : false;
  }

  // --- Internal Methods ---

  _bindAutoStates(objectId) {
    const obj = this.objects.get(objectId);
    const el = obj.element;

    // Hover state
    if (obj.states.hover) {
      el.addEventListener('mouseenter', () => {
        if (!obj.disabled && !obj.hidden) {
          el.classList.add(obj.states.hover.className || 'state--hover');
        }
      });
      el.addEventListener('mouseleave', () => {
        el.classList.remove(obj.states.hover.className || 'state--hover');
        el.classList.remove(obj.states.down?.className || 'state--down');
      });
    }

    // Down state
    if (obj.states.down) {
      el.addEventListener('mousedown', () => {
        if (!obj.disabled && !obj.hidden) {
          el.classList.add(obj.states.down.className || 'state--down');
        }
      });
      el.addEventListener('mouseup', () => {
        el.classList.remove(obj.states.down?.className || 'state--down');
      });
    }

    // Visited state (permanent on first click)
    el.addEventListener('click', () => {
      if (!obj.disabled && !obj.hidden && !obj.visited) {
        obj.visited = true;
        if (obj.states.visited) {
          this.setState(objectId, 'visited');
        }
      }
    });
  }

  _handleButtonSet(objectId) {
    // Find which button set this object belongs to
    for (const [setName, members] of this.buttonSets) {
      if (members.has(objectId)) {
        // Deselect all other members
        for (const memberId of members) {
          if (memberId !== objectId) {
            const member = this.objects.get(memberId);
            if (member && member.currentState === 'selected') {
              this.setState(memberId, 'normal');
            }
          }
        }
        break;
      }
    }
  }

  _applyState(objectId, stateName) {
    const obj = this.objects.get(objectId);
    if (!obj) return;

    const el = obj.element;
    const stateConfig = obj.states[stateName];

    // Remove all state classes
    Object.values(obj.states).forEach(s => {
      if (s.className) el.classList.remove(s.className);
    });

    // Apply new state class
    if (stateConfig?.className) {
      el.classList.add(stateConfig.className);
    }

    // Apply inline styles if specified
    if (stateConfig?.styles) {
      Object.assign(el.style, stateConfig.styles);
    }

    // Update content if specified
    if (stateConfig?.content !== undefined) {
      el.innerHTML = stateConfig.content;
    }

    // Unhide if transitioning from hidden
    if (stateName !== 'hidden' && obj.hidden) {
      obj.hidden = false;
      el.style.display = '';
      el.removeAttribute('aria-hidden');
    }

    // Re-enable if transitioning from disabled
    if (stateName !== 'disabled' && obj.disabled) {
      obj.disabled = false;
      el.style.pointerEvents = '';
      el.style.opacity = '';
      el.removeAttribute('aria-disabled');
    }

    // Update data attribute for CSS targeting
    el.dataset.state = stateName;
  }

  _emit(eventName, detail) {
    this.listeners
      .filter(l => l.event === eventName)
      .forEach(l => l.callback(detail));
  }

  on(eventName, callback) {
    this.listeners.push({ event: eventName, callback });
  }
}
```

### 8.2 Trigger Engine

```javascript
/**
 * TriggerEngine — Event-driven action system
 * Equivalent to Storyline's Trigger system
 */
class TriggerEngine {
  constructor(stateManager, variableStore, layerManager, timelineManager) {
    this.stateManager = stateManager;
    this.variables = variableStore;
    this.layers = layerManager;
    this.timelines = timelineManager;
    this.triggers = [];
    this.triggerGroups = new Map(); // Group triggers by event for execution order
  }

  /**
   * Register a trigger
   * @param {Object} config
   * @param {string} config.action - Action to perform
   * @param {Object} config.actionParams - Parameters for the action
   * @param {string} config.event - When to fire
   * @param {Object} config.eventParams - Event parameters (target object, etc.)
   * @param {Array}  config.conditions - Optional conditions [{subject, operator, value}]
   * @param {string} config.conditionLogic - 'AND' or 'OR' (default: 'AND')
   * @param {Object} config.elseAction - Optional alternate action
   * @param {number} config.priority - Execution order (lower = first)
   */
  register(config) {
    const trigger = {
      id: `trigger_${this.triggers.length}`,
      ...config,
      priority: config.priority || this.triggers.length
    };

    this.triggers.push(trigger);
    this._bindEvent(trigger);
    return trigger.id;
  }

  /**
   * Register multiple triggers at once (common for slide setup)
   */
  registerAll(configs) {
    return configs.map(c => this.register(c));
  }

  // --- Action Executors ---

  _executeAction(action, params) {
    const actions = {
      // State actions
      'changeState': () => this.stateManager.setState(params.target, params.state),
      'toggleState': () => this.stateManager.toggleState(params.target, params.stateA, params.stateB),

      // Layer actions
      'showLayer': () => this.layers.show(params.layer),
      'hideLayer': () => this.layers.hide(params.layer),
      'hideAllLayers': () => this.layers.hideAll(),

      // Variable actions
      'setVariable': () => this.variables.set(params.variable, params.value),
      'addToVariable': () => this.variables.add(params.variable, params.value),
      'subtractFromVariable': () => this.variables.subtract(params.variable, params.value),

      // Navigation actions
      'jumpToSlide': () => this._navigate(params.slideId),
      'jumpToNextSlide': () => this._navigate('next'),
      'jumpToPrevSlide': () => this._navigate('prev'),
      'jumpToURL': () => window.open(params.url, params.target || '_blank'),

      // Timeline actions
      'pauseTimeline': () => this.timelines.pause(params.target || 'base'),
      'resumeTimeline': () => this.timelines.resume(params.target || 'base'),
      'jumpToTime': () => this.timelines.seekTo(params.target || 'base', params.time),
      'jumpToCuePoint': () => this.timelines.seekToCuePoint(params.target || 'base', params.cuePoint),

      // Media actions
      'playMedia': () => this._playMedia(params.target),
      'pauseMedia': () => this._pauseMedia(params.target),
      'stopMedia': () => this._stopMedia(params.target),

      // Motion actions
      'moveAlongPath': () => this._animateMotionPath(params.target, params.path),

      // Misc actions
      'executeJS': () => new Function(params.code)(),
      'setFocus': () => document.getElementById(params.target)?.focus(),
      'completeCourse': () => this._completeCourse(),
      'printResults': () => window.print(),

      // Custom xAPI
      'sendXAPI': () => this._sendXAPI(params.verb, params.object, params.result)
    };

    const executor = actions[action];
    if (executor) {
      executor();
    } else {
      console.warn(`Unknown trigger action: ${action}`);
    }
  }

  // --- Condition Evaluator ---

  _evaluateConditions(conditions, logic = 'AND') {
    if (!conditions || conditions.length === 0) return true;

    const results = conditions.map(cond => {
      let actualValue;

      // Determine condition subject
      if (cond.type === 'variable') {
        actualValue = this.variables.get(cond.subject);
      } else if (cond.type === 'state') {
        actualValue = this.stateManager.getState(cond.subject);
      } else if (cond.type === 'window') {
        actualValue = cond.property === 'width' ? window.innerWidth : window.innerHeight;
      }

      // Evaluate operator
      return this._compareValues(actualValue, cond.operator, cond.value);
    });

    return logic === 'AND'
      ? results.every(r => r)
      : results.some(r => r);
  }

  _compareValues(actual, operator, expected) {
    switch (operator) {
      case '==':  return actual == expected;
      case '!=':  return actual != expected;
      case '>':   return actual > expected;
      case '<':   return actual < expected;
      case '>=':  return actual >= expected;
      case '<=':  return actual <= expected;
      case 'is':  return actual === expected;
      case 'isNot': return actual !== expected;
      case 'contains': return String(actual).includes(String(expected));
      case 'startsWith': return String(actual).startsWith(String(expected));
      case 'endsWith': return String(actual).endsWith(String(expected));
      case 'isTrue': return actual === true;
      case 'isFalse': return actual === false;
      default: return false;
    }
  }

  // --- Event Binding ---

  _bindEvent(trigger) {
    const { event, eventParams } = trigger;

    const handler = () => {
      // Evaluate conditions
      const conditionsMet = this._evaluateConditions(
        trigger.conditions,
        trigger.conditionLogic
      );

      if (conditionsMet) {
        this._executeAction(trigger.action, trigger.actionParams);
      } else if (trigger.elseAction) {
        this._executeAction(trigger.elseAction.action, trigger.elseAction.params);
      }
    };

    switch (event) {
      case 'click':
        document.getElementById(eventParams.target)
          ?.addEventListener('click', handler);
        break;

      case 'hover':
        document.getElementById(eventParams.target)
          ?.addEventListener('mouseenter', handler);
        break;

      case 'hoverOff':
        document.getElementById(eventParams.target)
          ?.addEventListener('mouseleave', handler);
        break;

      case 'keyPress':
        document.addEventListener('keydown', (e) => {
          if (e.key === eventParams.key) handler();
        });
        break;

      case 'timelineStarts':
        this.timelines?.on('start', eventParams?.target || 'base', handler);
        break;

      case 'timelineEnds':
        this.timelines?.on('end', eventParams?.target || 'base', handler);
        break;

      case 'timelineReachesCuePoint':
        this.timelines?.on('cuepoint', eventParams.cuePoint, handler);
        break;

      case 'variableChanges':
        this.variables?.on('change', eventParams.variable, handler);
        break;

      case 'stateChanges':
        this.stateManager?.on('stateChange', (detail) => {
          if (detail.objectId === eventParams.target &&
              (!eventParams.state || detail.stateName === eventParams.state)) {
            handler();
          }
        });
        break;

      case 'mediaCompletes':
        document.getElementById(eventParams.target)
          ?.addEventListener('ended', handler);
        break;

      case 'objectDroppedOn':
        // Handled by DragDropManager integration
        break;

      case 'slideStart':
        // Fire immediately (or on DOMContentLoaded)
        if (document.readyState === 'complete') {
          handler();
        } else {
          window.addEventListener('load', handler);
        }
        break;

      default:
        console.warn(`Unknown trigger event: ${event}`);
    }
  }

  // --- Navigation Helpers ---
  _navigate(target) {
    // Dispatch custom event for the SCORM navigation system to handle
    window.dispatchEvent(new CustomEvent('scorm:navigate', { detail: { target } }));
  }

  _completeCourse() {
    window.dispatchEvent(new CustomEvent('scorm:complete'));
  }

  _playMedia(targetId) {
    const el = document.getElementById(targetId);
    if (el && el.play) el.play();
  }

  _pauseMedia(targetId) {
    const el = document.getElementById(targetId);
    if (el && el.pause) el.pause();
  }

  _stopMedia(targetId) {
    const el = document.getElementById(targetId);
    if (el) {
      if (el.pause) el.pause();
      if ('currentTime' in el) el.currentTime = 0;
    }
  }

  _animateMotionPath(targetId, pathConfig) {
    // Delegate to motion path system
    window.dispatchEvent(new CustomEvent('scorm:motionPath', {
      detail: { targetId, pathConfig }
    }));
  }

  _sendXAPI(verb, object, result) {
    window.dispatchEvent(new CustomEvent('scorm:xapi', {
      detail: { verb, object, result }
    }));
  }
}
```

### 8.3 Variable Store

```javascript
/**
 * VariableStore — Reactive variable system with persistence
 * Equivalent to Storyline's Variables system
 */
class VariableStore {
  constructor() {
    this.variables = new Map();
    this.listeners = new Map(); // variable name → [callbacks]
    this.builtIn = {}; // Read-only system variables
  }

  /**
   * Define a variable
   */
  define(name, type, defaultValue) {
    const typeDefaults = {
      'boolean': false,
      'number': 0,
      'text': ''
    };

    this.variables.set(name, {
      type,
      value: defaultValue !== undefined ? defaultValue : typeDefaults[type],
      defaultValue: defaultValue !== undefined ? defaultValue : typeDefaults[type]
    });
  }

  /**
   * Get a variable value
   */
  get(name) {
    // Check user variables first, then built-in
    const userVar = this.variables.get(name);
    if (userVar) return userVar.value;
    return this.builtIn[name];
  }

  /**
   * Set a variable value
   */
  set(name, value) {
    const variable = this.variables.get(name);
    if (!variable) {
      console.warn(`Variable "${name}" not defined`);
      return;
    }

    const oldValue = variable.value;

    // Type coercion
    switch (variable.type) {
      case 'boolean':
        variable.value = Boolean(value);
        break;
      case 'number':
        variable.value = Number(value);
        break;
      case 'text':
        variable.value = String(value);
        break;
    }

    // Notify listeners if value changed
    if (oldValue !== variable.value) {
      this._notify(name, variable.value, oldValue);
    }

    // Update any variable references in the DOM
    this._updateReferences(name, variable.value);
  }

  /**
   * Add a value to a numeric variable
   */
  add(name, amount) {
    const current = this.get(name);
    this.set(name, current + Number(amount));
  }

  /**
   * Subtract a value from a numeric variable
   */
  subtract(name, amount) {
    const current = this.get(name);
    this.set(name, current - Number(amount));
  }

  /**
   * Reset a variable to its default
   */
  reset(name) {
    const variable = this.variables.get(name);
    if (variable) {
      this.set(name, variable.defaultValue);
    }
  }

  /**
   * Reset all variables to defaults
   */
  resetAll() {
    for (const [name, variable] of this.variables) {
      this.set(name, variable.defaultValue);
    }
  }

  /**
   * Listen for variable changes
   */
  on(eventType, variableName, callback) {
    if (eventType === 'change') {
      if (!this.listeners.has(variableName)) {
        this.listeners.set(variableName, []);
      }
      this.listeners.get(variableName).push(callback);
    }
  }

  /**
   * Update built-in system variables
   */
  updateBuiltIn(name, value) {
    this.builtIn[name] = value;
    this._updateReferences(name, value);
  }

  /**
   * Serialize all variables for SCORM suspend_data
   */
  serialize() {
    const data = {};
    for (const [name, variable] of this.variables) {
      data[name] = variable.value;
    }
    return JSON.stringify(data);
  }

  /**
   * Restore variables from SCORM suspend_data
   */
  deserialize(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      for (const [name, value] of Object.entries(data)) {
        if (this.variables.has(name)) {
          this.set(name, value);
        }
      }
    } catch (e) {
      console.warn('Failed to deserialize variables:', e);
    }
  }

  // --- Internal ---

  _notify(name, newValue, oldValue) {
    const callbacks = this.listeners.get(name) || [];
    callbacks.forEach(cb => cb({ name, newValue, oldValue }));
  }

  _updateReferences(name, value) {
    // Find all elements with data-var-ref attribute containing this variable
    const refs = document.querySelectorAll(`[data-var-ref*="${name}"]`);
    refs.forEach(el => {
      let template = el.dataset.varTemplate || el.dataset.varRef;
      // Replace %variableName% pattern
      const output = template.replace(
        new RegExp(`%${name}%`, 'g'),
        value
      );
      el.textContent = output;
    });
  }
}
```

### 8.4 Layer Manager

```javascript
/**
 * LayerManager — Overlay panel system
 * Equivalent to Storyline's Slide Layers
 */
class LayerManager {
  constructor(timelineManager) {
    this.layers = new Map();
    this.timelines = timelineManager;
    this.listeners = [];
  }

  /**
   * Register a layer
   * @param {string} layerId - DOM element id
   * @param {Object} options
   */
  register(layerId, options = {}) {
    const el = document.getElementById(layerId);
    if (!el) return;

    this.layers.set(layerId, {
      element: el,
      visible: false,
      options: {
        preventBaseClick: options.preventBaseClick || false,
        pauseBaseTimeline: options.pauseBaseTimeline || false,
        hideOtherLayers: options.hideOtherLayers || false,
        hideOnTimelineEnd: options.hideOnTimelineEnd || false,
        ...options
      }
    });

    // Initially hidden
    el.style.display = 'none';
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('role', 'dialog');
  }

  /**
   * Show a layer
   */
  show(layerId) {
    const layer = this.layers.get(layerId);
    if (!layer || layer.visible) return;

    // Hide other layers if configured
    if (layer.options.hideOtherLayers) {
      this.hideAll();
    }

    // Show this layer
    layer.visible = true;
    layer.element.style.display = '';
    layer.element.removeAttribute('aria-hidden');

    // Pause base timeline if configured
    if (layer.options.pauseBaseTimeline) {
      this.timelines?.pause('base');
    }

    // Prevent base layer clicks if configured
    if (layer.options.preventBaseClick) {
      const baseLayer = document.getElementById('base-layer');
      if (baseLayer) {
        baseLayer.style.pointerEvents = 'none';
        baseLayer.setAttribute('inert', '');
      }
    }

    // Start layer timeline
    this.timelines?.start(layerId);

    // Auto-hide when timeline ends
    if (layer.options.hideOnTimelineEnd) {
      this.timelines?.on('end', layerId, () => this.hide(layerId));
    }

    this._emit('show', { layerId });
  }

  /**
   * Hide a layer
   */
  hide(layerId) {
    const layer = this.layers.get(layerId);
    if (!layer || !layer.visible) return;

    layer.visible = false;
    layer.element.style.display = 'none';
    layer.element.setAttribute('aria-hidden', 'true');

    // Resume base timeline
    if (layer.options.pauseBaseTimeline) {
      this.timelines?.resume('base');
    }

    // Re-enable base layer clicks
    if (layer.options.preventBaseClick) {
      const baseLayer = document.getElementById('base-layer');
      if (baseLayer) {
        baseLayer.style.pointerEvents = '';
        baseLayer.removeAttribute('inert');
      }
    }

    // Stop layer timeline
    this.timelines?.stop(layerId);

    this._emit('hide', { layerId });
  }

  /**
   * Hide all visible layers
   */
  hideAll() {
    for (const [layerId, layer] of this.layers) {
      if (layer.visible) {
        this.hide(layerId);
      }
    }
  }

  /**
   * Check if a layer is visible
   */
  isVisible(layerId) {
    const layer = this.layers.get(layerId);
    return layer ? layer.visible : false;
  }

  _emit(eventName, detail) {
    this.listeners
      .filter(l => l.event === eventName)
      .forEach(l => l.callback(detail));
  }

  on(eventName, callback) {
    this.listeners.push({ event: eventName, callback });
  }
}
```

### 8.5 Timeline Manager

```javascript
/**
 * TimelineManager — Time-based event system with cue points
 * Equivalent to Storyline's Timeline
 */
class TimelineManager {
  constructor() {
    this.timelines = new Map();
    this.listeners = [];
  }

  /**
   * Register a timeline
   * @param {string} timelineId - Unique identifier (e.g., 'base', 'layer-correct')
   * @param {Object} config
   */
  register(timelineId, config = {}) {
    this.timelines.set(timelineId, {
      duration: config.duration || 10000, // ms
      currentTime: 0,
      playing: false,
      cuePoints: config.cuePoints || {}, // { name: timeInMs }
      firedCuePoints: new Set(),
      intervalId: null,
      tickRate: 50 // ms between ticks
    });
  }

  /**
   * Start/resume a timeline
   */
  start(timelineId) {
    const tl = this.timelines.get(timelineId);
    if (!tl || tl.playing) return;

    tl.playing = true;
    tl.firedCuePoints.clear();

    this._emit('start', timelineId);

    tl.intervalId = setInterval(() => {
      tl.currentTime += tl.tickRate;

      // Check cue points
      for (const [name, time] of Object.entries(tl.cuePoints)) {
        if (!tl.firedCuePoints.has(name) && tl.currentTime >= time) {
          tl.firedCuePoints.add(name);
          this._emit('cuepoint', name, { timelineId, time: tl.currentTime });
        }
      }

      // Check timeline end
      if (tl.currentTime >= tl.duration) {
        this.stop(timelineId);
        this._emit('end', timelineId);
      }
    }, tl.tickRate);
  }

  /**
   * Pause a timeline
   */
  pause(timelineId) {
    const tl = this.timelines.get(timelineId);
    if (!tl || !tl.playing) return;

    tl.playing = false;
    clearInterval(tl.intervalId);
    this._emit('pause', timelineId);
  }

  /**
   * Resume a paused timeline
   */
  resume(timelineId) {
    const tl = this.timelines.get(timelineId);
    if (!tl || tl.playing) return;
    this.start(timelineId); // Re-starts from current position
  }

  /**
   * Stop and reset a timeline
   */
  stop(timelineId) {
    const tl = this.timelines.get(timelineId);
    if (!tl) return;

    tl.playing = false;
    clearInterval(tl.intervalId);
  }

  /**
   * Seek to a specific time
   */
  seekTo(timelineId, timeMs) {
    const tl = this.timelines.get(timelineId);
    if (!tl) return;
    tl.currentTime = Math.max(0, Math.min(timeMs, tl.duration));
    // Re-evaluate cue points
    tl.firedCuePoints.clear();
    for (const [name, time] of Object.entries(tl.cuePoints)) {
      if (tl.currentTime >= time) {
        tl.firedCuePoints.add(name);
      }
    }
  }

  /**
   * Seek to a named cue point
   */
  seekToCuePoint(timelineId, cuePointName) {
    const tl = this.timelines.get(timelineId);
    if (!tl) return;
    const time = tl.cuePoints[cuePointName];
    if (time !== undefined) {
      this.seekTo(timelineId, time);
    }
  }

  /**
   * Get current time of a timeline
   */
  getCurrentTime(timelineId) {
    const tl = this.timelines.get(timelineId);
    return tl ? tl.currentTime : 0;
  }

  /**
   * Get progress as percentage (0-100)
   */
  getProgress(timelineId) {
    const tl = this.timelines.get(timelineId);
    if (!tl) return 0;
    return Math.round((tl.currentTime / tl.duration) * 100);
  }

  // Event system
  _emit(eventType, target, detail = {}) {
    this.listeners
      .filter(l => l.eventType === eventType &&
                   (l.target === target || l.target === '*'))
      .forEach(l => l.callback(detail));
  }

  on(eventType, target, callback) {
    this.listeners.push({ eventType, target, callback });
  }
}
```

### 8.6 Motion Path Animator

```javascript
/**
 * MotionPathAnimator — Object movement along defined paths
 * Equivalent to Storyline's Motion Paths
 */
class MotionPathAnimator {
  constructor() {
    this.paths = new Map();
    this.activeAnimations = new Map();
  }

  /**
   * Define a motion path for an object
   * @param {string} pathId - Unique path identifier
   * @param {Object} config
   */
  definePath(pathId, config) {
    this.paths.set(pathId, {
      type: config.type || 'line', // 'line', 'arc', 'custom'
      points: config.points,       // Array of {x, y} for custom paths
      startX: config.startX,
      startY: config.startY,
      endX: config.endX,
      endY: config.endY,
      duration: config.duration || 1000,
      easing: config.easing || 'ease-in-out',
      relativeStart: config.relativeStart !== false,
      orientToPath: config.orientToPath || false,
      delay: config.delay || 0
    });
  }

  /**
   * Animate an object along a defined path
   */
  animate(targetId, pathId) {
    const el = document.getElementById(targetId);
    const path = this.paths.get(pathId);
    if (!el || !path) return Promise.resolve();

    return new Promise((resolve) => {
      const startRect = el.getBoundingClientRect();
      const parentRect = el.offsetParent?.getBoundingClientRect() || { left: 0, top: 0 };

      // Calculate start position
      let startX, startY;
      if (path.relativeStart) {
        startX = el.offsetLeft;
        startY = el.offsetTop;
      } else {
        startX = path.startX;
        startY = path.startY;
      }

      const deltaX = path.endX - (path.relativeStart ? 0 : startX);
      const deltaY = path.endY - (path.relativeStart ? 0 : startY);

      // Use CSS animation for smooth performance
      el.style.transition = 'none';
      el.style.transform = `translate(0px, 0px)`;

      setTimeout(() => {
        el.style.transition = `transform ${path.duration}ms ${path.easing}`;
        el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Orientation to path
        if (path.orientToPath) {
          const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
          el.style.transform += ` rotate(${angle}deg)`;
        }

        setTimeout(() => {
          // Apply final position as actual position (not transform)
          el.style.transition = 'none';
          el.style.left = `${startX + deltaX}px`;
          el.style.top = `${startY + deltaY}px`;
          el.style.transform = '';
          resolve();
        }, path.duration);
      }, path.delay);
    });
  }
}
```

### 8.7 Putting It All Together — InteractivityEngine

```javascript
/**
 * InteractivityEngine — Unified system combining all components
 * This is the main entry point, equivalent to Storyline's Player runtime
 */
class InteractivityEngine {
  constructor() {
    this.timelines = new TimelineManager();
    this.variables = new VariableStore();
    this.states = new StateManager();
    this.layers = new LayerManager(this.timelines);
    this.triggers = new TriggerEngine(
      this.states,
      this.variables,
      this.layers,
      this.timelines
    );
    this.motionPaths = new MotionPathAnimator();
  }

  /**
   * Initialize from a slide configuration object
   * This is called once per SCO/slide to set up all interactivity
   */
  init(slideConfig) {
    // 1. Define variables
    if (slideConfig.variables) {
      for (const [name, config] of Object.entries(slideConfig.variables)) {
        this.variables.define(name, config.type, config.default);
      }
    }

    // 2. Register object states
    if (slideConfig.objects) {
      for (const [objectId, config] of Object.entries(slideConfig.objects)) {
        this.states.register(objectId, config.states || {}, {
          buttonSet: config.buttonSet,
          initialState: config.initialState,
          autoStates: config.autoStates
        });
      }
    }

    // 3. Register layers
    if (slideConfig.layers) {
      for (const [layerId, config] of Object.entries(slideConfig.layers)) {
        this.layers.register(layerId, config);
      }
    }

    // 4. Register timelines
    if (slideConfig.timelines) {
      for (const [timelineId, config] of Object.entries(slideConfig.timelines)) {
        this.timelines.register(timelineId, config);
      }
    }

    // 5. Define motion paths
    if (slideConfig.motionPaths) {
      for (const [pathId, config] of Object.entries(slideConfig.motionPaths)) {
        this.motionPaths.definePath(pathId, config);
      }
    }

    // 6. Register triggers (LAST — they depend on everything else)
    if (slideConfig.triggers) {
      this.triggers.registerAll(slideConfig.triggers);
    }

    // 7. Start base timeline
    this.timelines.start('base');
  }

  /**
   * Restore state from SCORM suspend_data
   */
  restore(suspendData) {
    this.variables.deserialize(suspendData);
  }

  /**
   * Save state for SCORM suspend_data
   */
  save() {
    return this.variables.serialize();
  }
}
```

### 8.8 Example: Slide Configuration (Declarative)

```javascript
// Example: A click-to-reveal interaction with quiz
const slideConfig = {
  variables: {
    tabsViewed: { type: 'number', default: 0 },
    allTabsViewed: { type: 'boolean', default: false },
    quizScore: { type: 'number', default: 0 }
  },

  objects: {
    'btn-topic-1': {
      states: {
        hover: { className: 'btn--hover' },
        visited: { className: 'btn--visited' },
        selected: { className: 'btn--selected' }
      },
      buttonSet: 'topic-tabs'
    },
    'btn-topic-2': {
      states: {
        hover: { className: 'btn--hover' },
        visited: { className: 'btn--visited' },
        selected: { className: 'btn--selected' }
      },
      buttonSet: 'topic-tabs'
    },
    'btn-topic-3': {
      states: {
        hover: { className: 'btn--hover' },
        visited: { className: 'btn--visited' },
        selected: { className: 'btn--selected' }
      },
      buttonSet: 'topic-tabs'
    },
    'btn-continue': {
      states: {
        disabled: { className: 'btn--disabled' },
        hover: { className: 'btn--hover' }
      },
      initialState: 'disabled'
    }
  },

  layers: {
    'layer-topic-1': { hideOtherLayers: true },
    'layer-topic-2': { hideOtherLayers: true },
    'layer-topic-3': { hideOtherLayers: true },
    'layer-complete': {
      preventBaseClick: true,
      hideOnTimelineEnd: false
    }
  },

  timelines: {
    'base': { duration: 60000 }
  },

  triggers: [
    // Tab 1 click → show layer, track progress
    {
      action: 'showLayer',
      actionParams: { layer: 'layer-topic-1' },
      event: 'click',
      eventParams: { target: 'btn-topic-1' }
    },
    {
      action: 'addToVariable',
      actionParams: { variable: 'tabsViewed', value: 1 },
      event: 'click',
      eventParams: { target: 'btn-topic-1' },
      conditions: [
        { type: 'state', subject: 'btn-topic-1', operator: 'isNot', value: 'visited' }
      ]
    },

    // Tab 2 click
    {
      action: 'showLayer',
      actionParams: { layer: 'layer-topic-2' },
      event: 'click',
      eventParams: { target: 'btn-topic-2' }
    },
    {
      action: 'addToVariable',
      actionParams: { variable: 'tabsViewed', value: 1 },
      event: 'click',
      eventParams: { target: 'btn-topic-2' },
      conditions: [
        { type: 'state', subject: 'btn-topic-2', operator: 'isNot', value: 'visited' }
      ]
    },

    // Tab 3 click
    {
      action: 'showLayer',
      actionParams: { layer: 'layer-topic-3' },
      event: 'click',
      eventParams: { target: 'btn-topic-3' }
    },
    {
      action: 'addToVariable',
      actionParams: { variable: 'tabsViewed', value: 1 },
      event: 'click',
      eventParams: { target: 'btn-topic-3' },
      conditions: [
        { type: 'state', subject: 'btn-topic-3', operator: 'isNot', value: 'visited' }
      ]
    },

    // When all 3 tabs viewed → enable Continue button
    {
      action: 'changeState',
      actionParams: { target: 'btn-continue', state: 'normal' },
      event: 'variableChanges',
      eventParams: { variable: 'tabsViewed' },
      conditions: [
        { type: 'variable', subject: 'tabsViewed', operator: '>=', value: 3 }
      ]
    },

    // Continue button → navigate to next slide
    {
      action: 'jumpToNextSlide',
      actionParams: {},
      event: 'click',
      eventParams: { target: 'btn-continue' },
      conditions: [
        { type: 'state', subject: 'btn-continue', operator: 'isNot', value: 'disabled' }
      ]
    }
  ]
};

// Usage:
const engine = new InteractivityEngine();
engine.init(slideConfig);
```

---

## Summary: Storyline vs. Our Implementation

| Storyline Feature | Our JS Equivalent | Notes |
|-------------------|-------------------|-------|
| Object States (10 built-in + custom) | `StateManager` class | CSS class-based with data-state attribute |
| Button Sets | `StateManager.buttonSets` | Radio-button behavior via Map |
| Triggers (25 actions) | `TriggerEngine` class | Declarative config → runtime binding |
| Trigger Conditions (AND/OR) | `_evaluateConditions()` | Same logic model |
| Else Actions | `elseAction` in trigger config | Conditional branching |
| Variables (bool/num/text) | `VariableStore` class | Reactive with listeners |
| Variable References (%var%) | `_updateReferences()` | data-var-ref attribute |
| Built-in Variables | `builtIn` object | Read-only system data |
| Slide Layers | `LayerManager` class | Overlay with base-layer blocking |
| Layer Properties | Options object | preventBaseClick, pauseTimeline, etc. |
| Timeline | `TimelineManager` class | setInterval-based with cue points |
| Cue Points | `cuePoints` in timeline config | Named time markers |
| Motion Paths | `MotionPathAnimator` class | CSS transform-based |
| Player API (GetVar/SetVar) | `InteractivityEngine` | Unified access point |
| Execution Order | Priority-based trigger array | Top-to-bottom like Storyline |
| SCORM Persistence | `serialize()`/`deserialize()` | Via suspend_data |

---

## Sources

- [Everything You Need to Know About States in Storyline 360](https://community.articulate.com/blog/articles/everything-you-need-to-know-about-states-in-storyline-360/1107905)
- [Storyline 360: Working with Triggers](https://community.articulate.com/kb/user-guides/storyline-360-working-with-triggers/1091358)
- [Storyline 360: New Trigger Workflow](https://articulate.com/support/article/storyline-360-new-trigger-workflow)
- [Storyline 360: Conditional Trigger Enhancements](https://articulate.com/support/article/Storyline-360-Conditional-Trigger-Enhancements)
- [Storyline 360: The Order in Which Triggers Are Executed](https://articulate.com/support/article/Storyline-360-The-Order-in-Which-Triggers-Are-Executed)
- [Storyline 360: Working with Variables](https://community.articulate.com/articles/articulate-storyline-360-user-guide-how-to-work-with-variables)
- [Storyline 360: Built-In Variables](https://articulate.com/support/article/Storyline-360-Built-In-Variables)
- [Storyline 360: Working with Layers](https://community.articulate.com/kb/user-guides/storyline-360-working-with-layers/1137567)
- [Storyline 360: Working with the Timeline](https://community.articulate.com/kb/user-guides/storyline-360-working-with-the-timeline/1115134)
- [7 Pro Tips for Motion Path Animations](https://community.articulate.com/blog/articles/7-pro-tips-for-working-with-motion-path-animations-in-storyline-360/1140096)
- [Storyline 360: Fine-Tune Motion Paths](https://articulate.com/support/article/storyline-360-fine-tune-motion-paths)
- [How the Built-In Disabled State Works](https://articulate.com/support/article/Articulate-Storyline-360-How-the-Built-In-Disabled-State-Works)
- [Selected vs. Visited State](https://www.thearticulatetrainer.com/when-should-i-use-a-selected-versus-visited-state-in-storyline-360/)
- [Storyline 360: JavaScript Best Practices](https://articulate.com/support/article/Articulate-Storyline-360-JavaScript-Best-Practices-and-Examples)
- [JavaScript Tricks for Storyline 3/360 (ELB Learning)](https://blog.elblearning.com/blog/javascript-tricks-articulate-storyline-3-360)
- [How to Hack Storyline's HTML5 Output (ELB Learning)](https://blog.elblearning.com/blog/webinar-hack-storylines-html5-output)
- [Storyline SDK (GitHub)](https://github.com/articulate/storyline-sdk)
- [Storyline eLearning TechTalk Part 2 (eLearning Industry)](https://elearningindustry.com/javascript-code-storyline-elearning-techtalk-for-beginners-part-2)
- [Drop Correct and Drop Incorrect States (IconLogic)](https://blog.iconlogic.com/weblog/2016/05/articulate-storyline-drop-correct-and-drop-incorrect-states.html)
- [3 Ways to Create Drag-and-Drops (Articulate)](https://community.articulate.com/blog/articles/3-ways-to-create-drag-and-drops-with-storyline-360/1112385)
- [Storyline 360: Advanced JavaScript API](https://access.articulate.com/support/article/Storyline-360-Advanced-JavaScript-API)
- [When Does Trigger Order Matter?](https://www.thearticulatetrainer.com/when-does-trigger-order-matter/)
- [Slide Layers and Base Layer Properties (Swift eLearning)](https://www.swiftelearningservices.com/slide-layer-base-layer-revisiting-properties/)
- [Motion Path Animations in Storyline 360 (Swift eLearning)](https://www.swiftelearningservices.com/motion-path-animations-storyline-360/)
