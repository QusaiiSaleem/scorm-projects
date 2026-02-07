# Storyline 360 Interactive Elements & Question Types — Deep Research

> Research for SCORM Content Studio: Understanding every interaction type in Articulate Storyline 360
> and how to implement each in pure HTML/CSS/JS for our SCORM packages.

---

## Table of Contents

1. [Graded Question Types (11 Form-Based)](#1-graded-question-types-11-form-based)
2. [Survey Question Types (9 Form-Based)](#2-survey-question-types-9-form-based)
3. [Freeform Interaction Types (6 Types)](#3-freeform-interaction-types-6-types)
4. [Interactive Objects (Non-Question)](#4-interactive-objects-non-question)
5. [Result Slides & Feedback System](#5-result-slides--feedback-system)
6. [Question Banks & Randomization](#6-question-banks--randomization)
7. [HTML5 Output — How Storyline Renders](#7-html5-output--how-storyline-renders)
8. [Pure HTML/CSS/JS Implementation Guide](#8-pure-htmlcssjs-implementation-guide)

---

## 1. Graded Question Types (11 Form-Based)

Storyline 360 has **11 graded question types** that are form-based (pre-built UI, no custom design needed). Each is scored and reports to the LMS.

| # | Type | Learner Action | Max Choices | Scoring |
|---|------|---------------|-------------|---------|
| 1 | **True/False** | Select one of two options | 2 | Correct = full points |
| 2 | **Multiple Choice** | Select ONE correct answer | Up to 10 | Correct = full points |
| 3 | **Multiple Response** | Select ALL correct answers | Up to 10 | All correct = full points |
| 4 | **Fill-in-the-Blank** | Type the answer | Up to 10 acceptable answers | Exact/partial match |
| 5 | **Word Bank** | Drag correct words into blanks | Up to 10 word options | All correct = full points |
| 6 | **Matching Drag-and-Drop** | Drag items to match pairs | Up to 10 pairs | All correct = full points |
| 7 | **Matching Drop-Down** | Select matches from dropdowns | Up to 10 pairs | All correct = full points |
| 8 | **Sequence Drag-and-Drop** | Drag items into correct order | Up to 10 items | Correct order = full points |
| 9 | **Sequence Drop-Down** | Select order via dropdowns | Up to 10 items | Correct order = full points |
| 10 | **Numeric** | Enter a number | Single value, range, or combo | Within tolerance = full points |
| 11 | **Hotspot** | Click correct area on image | Multiple hotspot regions | Click in correct area = full points |

### Detailed Breakdown

#### 1.1 True/False
- **What learner sees**: A question with two radio-button options (True/False, Yes/No, or custom labels)
- **Interaction**: Click one option, then Submit
- **Scoring**: Binary — correct or incorrect
- **Feedback**: Correct/Incorrect layers shown after submit
- **SCORM reporting**: `cmi.interactions.n.type = "true-false"`

#### 1.2 Multiple Choice (Single Select)
- **What learner sees**: Question text + up to 10 answer options as radio buttons
- **Interaction**: Select ONE answer, then Submit
- **Options**: Shuffle answer order, partial credit (not default)
- **SCORM reporting**: `cmi.interactions.n.type = "choice"`

#### 1.3 Multiple Response (Multi-Select)
- **What learner sees**: Question text + up to 10 answer options as checkboxes
- **Interaction**: Select ALL that apply, then Submit
- **Scoring**: Must select all correct AND none incorrect for full points
- **SCORM reporting**: `cmi.interactions.n.type = "choice"` with multiple correct IDs

#### 1.4 Fill-in-the-Blank
- **What learner sees**: Question with a text input field
- **Interaction**: Type answer into text field, then Submit
- **Flexibility**: Up to 10 acceptable answer variations (e.g., "NYC", "New York City", "new york")
- **Options**: Case-sensitive toggle
- **SCORM reporting**: `cmi.interactions.n.type = "fill-in"`

#### 1.5 Word Bank
- **What learner sees**: A sentence/paragraph with blank spaces + a bank of draggable words
- **Interaction**: Drag words from the bank into the correct blanks
- **Scoring**: All blanks must be filled correctly
- **SCORM reporting**: `cmi.interactions.n.type = "matching"`

#### 1.6 Matching Drag-and-Drop
- **What learner sees**: Two columns — left items + right targets
- **Interaction**: Drag left items to their matching right targets
- **Max pairs**: Up to 10
- **Visual feedback**: Items snap to target positions
- **SCORM reporting**: `cmi.interactions.n.type = "matching"`

#### 1.7 Matching Drop-Down
- **What learner sees**: Left column of items, each with a dropdown menu
- **Interaction**: Select the matching item from each dropdown
- **Identical to Matching Drag-and-Drop** in logic but uses dropdowns instead of drag
- **Accessibility**: More keyboard-friendly than drag-and-drop
- **SCORM reporting**: `cmi.interactions.n.type = "matching"`

#### 1.8 Sequence Drag-and-Drop
- **What learner sees**: A list of items in random order
- **Interaction**: Drag items to reorder them in the correct sequence
- **Scoring**: Must be in exact correct order
- **SCORM reporting**: `cmi.interactions.n.type = "sequencing"`

#### 1.9 Sequence Drop-Down
- **What learner sees**: Each item has a dropdown for position number (1, 2, 3...)
- **Interaction**: Select the correct position number for each item
- **Accessibility**: Keyboard-friendly alternative to Sequence Drag-and-Drop
- **SCORM reporting**: `cmi.interactions.n.type = "sequencing"`

#### 1.10 Numeric
- **What learner sees**: Question with a number input field
- **Interaction**: Enter a numeric value, then Submit
- **Tolerance**: Can accept exact value, range (e.g., 3.1-3.2), or multiple values
- **SCORM reporting**: `cmi.interactions.n.type = "numeric"`, with `correct_responses` as range

#### 1.11 Hotspot
- **What learner sees**: An image with invisible clickable regions
- **Interaction**: Click on the correct area(s) of the image
- **Implementation**: Overlay transparent shapes on the image; clicks inside = correct
- **SCORM reporting**: `cmi.interactions.n.type = "other"` (hotspot regions)

---

## 2. Survey Question Types (9 Form-Based)

Survey questions are **ungraded** — no right/wrong answers. Used for feedback, preferences, self-assessment. All responses are captured and reported to LMS.

| # | Type | Learner Action | Max Options |
|---|------|---------------|-------------|
| 1 | **Likert Scale** | Rate agreement on a scale | 3-7 scale points |
| 2 | **Pick One** | Select single preference | Up to 10 |
| 3 | **Pick Many** | Select multiple preferences | Up to 10 |
| 4 | **Which Word** | Drag word to indicate preference | Up to 10 |
| 5 | **Short Answer** | Type brief response | 256 char limit |
| 6 | **Essay** | Type extended response | 5,000 char default |
| 7 | **Ranking Drag-and-Drop** | Drag items in preference order | Up to 10 |
| 8 | **Ranking Drop-Down** | Select preference rank via dropdowns | Up to 10 |
| 9 | **How Many** | Enter numeric response | Number only |

### Detailed Breakdown

#### 2.1 Likert Scale
- **What learner sees**: A statement with a horizontal scale (e.g., Strongly Disagree → Strongly Agree)
- **Interaction**: Click one point on the scale
- **Typical scales**: 3-point, 5-point, 7-point
- **Use cases**: Course satisfaction, confidence rating, self-assessment
- **SCORM**: `cmi.interactions.n.type = "likert"` with learner's selection

#### 2.2 Pick One (Survey)
- **What learner sees**: Options as radio buttons (same UI as graded Multiple Choice)
- **Difference from graded**: No correct answer, no scoring
- **Use case**: "What is your primary role?" or "Which topic interests you most?"

#### 2.3 Pick Many (Survey)
- **What learner sees**: Options as checkboxes (same UI as graded Multiple Response)
- **Difference from graded**: No correct answers, no scoring
- **Use case**: "Select all topics you'd like to learn more about"

#### 2.4 Which Word
- **What learner sees**: A sentence with a blank + a word bank
- **Interaction**: Drag the word that best represents their opinion into the blank
- **Use case**: "I feel _____ about this training" with options like Confident, Uncertain, Excited

#### 2.5 Short Answer
- **What learner sees**: Question with a text input (max 256 characters)
- **Interaction**: Type a brief response
- **Use case**: "What was most useful?" or "Any suggestions?"
- **SCORM**: Response stored in `cmi.interactions.n.learner_response`

#### 2.6 Essay
- **What learner sees**: Question with a large textarea (default 5,000 characters)
- **Interaction**: Type an extended written response
- **Use case**: Reflective journal entries, detailed feedback
- **Note**: Responses stored in LMS, typically reviewed by instructor

#### 2.7 Ranking Drag-and-Drop
- **What learner sees**: List of items to arrange by preference
- **Interaction**: Drag items up/down to rank them
- **Difference from Sequence**: No "correct" order — it's preference-based

#### 2.8 Ranking Drop-Down
- **What learner sees**: Items with dropdown menus for rank position
- **Interaction**: Select 1st, 2nd, 3rd... for each item
- **Accessibility**: Keyboard-friendly alternative to Ranking Drag-and-Drop

#### 2.9 How Many
- **What learner sees**: Question with a number input
- **Interaction**: Enter a numeric response
- **Use case**: "How many years of experience do you have?" or "Rate 1-10"

---

## 3. Freeform Interaction Types (6 Types)

Freeform questions let you **convert any existing slide into a graded interaction**. Unlike form-based questions (which have pre-built UI), freeform questions use your custom slide objects as the interaction elements.

**Key rule**: Only ONE freeform interaction type per slide.

| # | Type | What It Does | Graded? |
|---|------|-------------|---------|
| 1 | **Pick One** | Any objects become single-select choices | Yes |
| 2 | **Pick Many** | Any objects become multi-select choices | Yes |
| 3 | **Drag and Drop** | Objects become drag items / drop targets | Yes |
| 4 | **Text Entry** | Text input field with custom slide design | Yes |
| 5 | **Hotspot** | Custom shapes become click targets | Yes |
| 6 | **Shortcut Key** | Keyboard press detection | Yes |

### Detailed Breakdown

#### 3.1 Freeform Pick One
- **How it works**: You design a slide with any objects (images, shapes, characters, buttons). Then "Convert to Freeform" → Pick One. In Form View, assign which objects are answer choices and mark the correct one.
- **Learner experience**: Clicking any assigned object selects it (with Selected state). Clicking Submit checks the answer.
- **Difference from form-based**: Visually unlimited — use photos, illustrations, icons instead of text radio buttons.
- **Example**: Show 4 images of animals; learner clicks the mammal.

#### 3.2 Freeform Pick Many
- **How it works**: Same as Pick One but learner must select ALL correct objects.
- **Learner experience**: Click objects to toggle selection (Selected state), then Submit.
- **Scoring**: Must select all correct AND none incorrect.
- **Example**: "Click all items that are recyclable" with 8 images.

#### 3.3 Freeform Drag and Drop
- **How it works**: Design any objects on a slide. Convert to Freeform → Drag and Drop. In Form View, assign which objects are "drag items" and which are "drop targets."
- **Learner experience**: Drag items across the slide to their target locations. Items snap to targets.
- **Configuration options**:
  - **Snap to center**: Drag item centers on the drop target
  - **Free placement**: Item stays where dropped (within target bounds)
  - **One-to-one**: Each drag goes to exactly one target
  - **Many-to-one**: Multiple drags can go to same target
  - **Return if wrong**: Items snap back if placed incorrectly
  - **Delay feedback**: Don't show correct/incorrect until Submit
- **Example**: Label parts of a diagram, sort items into categories.

#### 3.4 Freeform Text Entry
- **How it works**: Add a text entry field to your custom slide. Convert to Freeform → Text Entry. Define acceptable answers in Form View.
- **Learner experience**: Type answer in the text field, then Submit.
- **Options**: Multiple acceptable answers, case-sensitive toggle
- **Example**: "What is the capital of France?" with acceptable answers: "Paris", "paris"

#### 3.5 Freeform Hotspot
- **How it works**: Place shapes (rectangles, circles, custom polygons) over areas of your slide. Convert to Freeform → Hotspot. Mark which shapes are correct hotspots.
- **Learner experience**: Click on the image/slide. If they click within a correct hotspot shape, it's correct.
- **Key detail**: Hotspot shapes are invisible to the learner (transparent fill, no border)
- **Example**: "Click on the mitochondria in this cell diagram"

#### 3.6 Freeform Shortcut Key
- **How it works**: Define which keyboard key(s) are the correct answer. Can be single keys or combinations (Ctrl+S, Alt+F4, etc.).
- **Learner experience**: Press the correct key or key combination, then Submit (or auto-submit on key press).
- **Use cases**: Software training ("Press Ctrl+P to print"), keyboard shortcut training, typing games, alphabet learning for children.
- **Example**: "What shortcut saves a file?" → Learner presses Ctrl+S.

---

## 4. Interactive Objects (Non-Question)

These are **non-graded interactive elements** that add engagement without being quiz questions. They don't report scores to the LMS but can be tracked via triggers and variables.

### 4.1 Dial Control

| Property | Details |
|----------|---------|
| **What it is** | A rotary knob that learners rotate to change a value |
| **Interaction** | Click and drag to rotate around a center point |
| **Properties** | Start value, End value, Initial value, Step increment |
| **Variable** | Bound to a numeric variable that updates as dial rotates |
| **Triggers** | "When Dial.Variable changes" → show/hide content, change states |
| **Use cases** | Temperature control, time selector, volume knob, cause-and-effect demos |
| **Accessibility** | Arrow keys for keyboard control |
| **Gallery** | Built-in customizable dial designs, or create custom with shapes/images |

**Example scenarios**:
- Air pressure dial showing weather effects
- Clock dial showing sun position throughout the day
- Budget dial showing resource allocation

### 4.2 Slider Control

| Property | Details |
|----------|---------|
| **What it is** | A horizontal/vertical track with a draggable thumb |
| **Interaction** | Drag the thumb along the track, or click positions on the track |
| **Properties** | Start position, End position, Initial position, Step increment |
| **Variable** | Bound to a numeric variable that updates as slider moves |
| **Triggers** | "When Slider.Variable changes" → show/hide content, animate |
| **Use cases** | Timeline scrubber, value selector, before/after comparison, rating scale |
| **Accessibility** | Arrow keys for keyboard control |

**Example scenarios**:
- Timeline slider revealing historical events
- Opacity slider for image comparison
- Budget allocation slider

### 4.3 Scrolling Panel

| Property | Details |
|----------|---------|
| **What it is** | A container with overflow scrolling (like an iframe) |
| **Interaction** | Scroll vertically/horizontally to see more content |
| **Properties** | Fixed viewport size, content can exceed viewport |
| **Content** | Text, images, shapes, buttons, other interactive elements |
| **Use cases** | Long text passages, terms & conditions, reference material, detailed lists |
| **Accessibility** | Keyboard scrollable, screen reader compatible |

### 4.4 Markers (Hotspot + Popup Callout)

| Property | Details |
|----------|---------|
| **What it is** | An icon on the slide that reveals a popup when activated |
| **Interaction** | Hover or click the marker icon to open popup |
| **Popup content** | Text, images, video, audio |
| **Icon gallery** | 200+ built-in icons across 10 categories |
| **States** | Normal, Hover, Visited |
| **Customization** | Resize icon, customize popup position, style colors |
| **Accessibility** | Keyboard accessible (Enter/Space to open/close), ARIA roles |
| **Use cases** | Labeled diagrams, image exploration, additional info callouts |

**Example scenarios**:
- Anatomy diagram with markers on each organ
- Office floor plan with department info markers
- Map with location markers

### 4.5 Button Sets (Radio Button Groups)

| Property | Details |
|----------|---------|
| **What it is** | A group of objects where only ONE can be selected at a time |
| **Behavior** | Selecting one object auto-deselects all others in the set |
| **Works like** | HTML radio buttons, but with any visual object |
| **Objects** | Buttons, shapes, images, characters, text boxes — almost anything |
| **States** | Automatically creates a "Selected" state if one doesn't exist |
| **Multiple sets** | Can have multiple independent button sets per slide |
| **Use cases** | Custom multiple-choice with visual options, tab navigation, toggle switches |

**How it works**:
1. Select multiple objects on a slide
2. Right-click → Button Set → assign to a set (Set 1, Set 2, or New Set)
3. Now clicking one object in the set deselects the others
4. Radio buttons are automatically added to Button Set 1

### 4.6 Knowledge Check Slides

| Property | Details |
|----------|---------|
| **What it is** | Informal, ungraded quiz questions for self-assessment |
| **Difference from quiz** | Not linked to a Result Slide, not scored, not reported to LMS |
| **Implementation** | Use any graded question type but don't connect to a Result Slide |
| **Feedback** | Show Correct/Incorrect layers with explanation |
| **Learner experience** | Low-stakes practice — "check your understanding" |
| **Use cases** | Mid-lesson comprehension checks, warm-up questions, practice before quiz |

---

## 5. Result Slides & Feedback System

### 5.1 Result Slide Types

| Type | Purpose | Score Display | LMS Data Sent |
|------|---------|--------------|---------------|
| **Graded** | Track quiz scores | Points, percentage, pass/fail | Score, pass/fail status, responses |
| **Survey** | Collect survey responses | No score shown | Response data only |
| **Blank** | Custom result display | Designer chooses | Completion data |
| **Combined** | Merge multiple quizzes | Aggregate score | Combined pass/fail |

### 5.2 Result Slide Layers

Every graded result slide has **three layers**:

| Layer | When Shown | Default Content | Customizable |
|-------|-----------|-----------------|--------------|
| **Base Layer** | Always | Score display, reference variables | Yes |
| **Success Layer** | Score >= passing | "Congratulations" message, Print button | Yes — add images, video, buttons |
| **Failure Layer** | Score < passing | "Try again" message, Retry button | Yes — add remediation link |

### 5.3 Result Slide Reference Variables

Storyline automatically creates variables you can display on the result slide:

| Variable | Shows |
|----------|-------|
| `Results.ScorePoints` | Raw score (e.g., "7") |
| `Results.ScorePercent` | Percentage (e.g., "70%") |
| `Results.PassPoints` | Points needed to pass |
| `Results.PassPercent` | Percentage needed to pass |

### 5.4 Result Slide Buttons

| Button | Where Placed | Function |
|--------|-------------|----------|
| **Review Quiz** | Base layer (always visible) | Steps through each question showing correct/incorrect |
| **Print Results** | Success layer | Prints score and response summary |
| **Retry Quiz** | Failure layer | Resets all question responses and restarts quiz |

### 5.5 Feedback System

Storyline's feedback is based on **layers** — overlay panels that appear on top of the question slide.

#### Feedback Types

| Feedback Type | Description |
|--------------|-------------|
| **By Question** | Single Correct/Incorrect feedback for the entire question |
| **By Choice** | Different feedback for each answer option selected |
| **None** | No visible feedback (silent scoring) |

#### Feedback Layers

| Layer | When Shown | Default Content |
|-------|-----------|-----------------|
| **Correct** | Answered correctly | Green checkmark + "That's correct!" |
| **Incorrect** | Answered wrong (final attempt) | Red X + "That's incorrect." |
| **Try Again** | Wrong answer, attempts remaining | Yellow ! + "Try again." |
| **Custom** | Triggered by specific choices | Designer-defined content |

#### Attempt Configuration
- **Attempts**: 1 (default), 2, 3, or unlimited
- **"Try Again" layer**: Shown on incorrect answers when attempts remain
- **After final attempt**: Shows "Incorrect" layer with optional correct answer reveal

### 5.6 Branching & Remediation

| Feature | How It Works |
|---------|-------------|
| **Branch by answer** | Different slides shown based on which answer was selected |
| **Branch by correct/incorrect** | Correct → next question; Incorrect → remediation slide |
| **Remediation path** | Send learner back to content they missed before retrying |
| **Skip logic** | Skip questions based on previous answers |
| **Question banks** | Draw random questions from a pool per attempt |

---

## 6. Question Banks & Randomization

| Feature | Details |
|---------|---------|
| **Question Bank** | A pool of questions organized by topic or difficulty |
| **Draw Questions** | Pull N random questions from the bank per attempt |
| **Randomize order** | Shuffle question order within a quiz |
| **Shuffle answers** | Randomize answer option order within a question |
| **Per-attempt variation** | Each attempt draws different questions from the pool |
| **Multiple banks** | Organize by topic; draw from each to ensure coverage |

---

## 7. HTML5 Output — How Storyline Renders

### 7.1 Rendering Architecture

| Aspect | How Storyline Does It |
|--------|----------------------|
| **Rendering engine** | Proprietary HTML5 engine (rewritten from Flash) |
| **Slide objects** | Rendered via `<canvas>` elements + dynamically named DOM nodes |
| **Text rendering** | Converted to web fonts, but NOT selectable (rendered as images) |
| **Element IDs** | **Randomly generated** — impossible to target by ID/class |
| **Targeting method** | Use `aria-label` (accessibility text) to find elements |
| **Animations** | CSS transitions + JS-driven canvas animations |
| **Media** | HTML5 `<video>` and `<audio>` elements |
| **Interactions** | DOM event listeners on dynamically created elements |

### 7.2 Published File Structure

```
published/
  story_content/
    slides/          ← One folder per slide with canvas data
    user.js          ← All variables, triggers, conditions
    frame.xml        ← Slide structure and properties
  mobile/
    *.html           ← Mobile-optimized versions
  story.html         ← Main entry point
  lms/
    scormdriver.js   ← SCORM API wrapper
```

### 7.3 Interaction Rendering (HTML5 DOM)

| Interaction | DOM Rendering |
|-------------|--------------|
| **Radio buttons** | Custom `<div>` elements with click handlers + canvas-rendered visuals |
| **Checkboxes** | Custom `<div>` elements with toggle state + canvas |
| **Text input** | Actual `<input>` or `<textarea>` element overlaid on canvas |
| **Drag-and-drop** | JS event handlers (mousedown/mousemove/mouseup) on canvas objects |
| **Dropdowns** | Custom `<select>`-like dropdowns rendered as layered divs |
| **Hotspot** | Invisible `<div>` regions with click event listeners |
| **Sliders** | Custom track + thumb with mouse/touch drag handlers |
| **Dials** | Rotation calculated from mouse angle relative to center point |
| **Markers** | Icon `<div>` + popup panel toggled on click/hover |
| **Scrolling panels** | `<div>` with `overflow: auto` and custom scrollbar styling |

---

## 8. Pure HTML/CSS/JS Implementation Guide

How we can implement each Storyline interaction in our SCORM Content Studio using standard web technologies.

### 8.1 Graded Questions

#### Multiple Choice (Single Select)

```
Implementation: Radio button group
HTML: <fieldset> with <input type="radio"> + <label> per option
CSS: Custom-styled radio cards with :checked state
JS: Track selected value, compare to correct answer on Submit
SCORM: cmi.interactions.n.type = "choice"
Accessibility: fieldset/legend, proper label association, keyboard nav
```

**Key HTML pattern**:
```html
<fieldset class="quiz-question" role="radiogroup" aria-labelledby="q1">
  <legend id="q1">What is the capital of France?</legend>
  <label class="quiz-option">
    <input type="radio" name="q1" value="a"> <span>London</span>
  </label>
  <label class="quiz-option">
    <input type="radio" name="q1" value="b"> <span>Paris</span>
  </label>
  <!-- ... -->
  <button class="quiz-submit" type="button">Submit</button>
</fieldset>
```

#### Multiple Response (Multi-Select)

```
Implementation: Checkbox group
HTML: <fieldset> with <input type="checkbox"> + <label> per option
CSS: Custom-styled checkbox cards with :checked state
JS: Collect all checked values, compare to correct set on Submit
SCORM: cmi.interactions.n.type = "choice" (comma-separated correct IDs)
```

#### True/False

```
Implementation: Radio group with exactly 2 options
HTML: Same as Multiple Choice but with only True/False options
CSS: Large toggle buttons or card layout
JS: Same as Multiple Choice
SCORM: cmi.interactions.n.type = "true-false"
```

#### Fill-in-the-Blank

```
Implementation: Text input with validation
HTML: <input type="text"> with associated question text
CSS: Underline-style input or card input
JS: Normalize input (trim, lowercase if case-insensitive), compare against array of acceptable answers
SCORM: cmi.interactions.n.type = "fill-in"
```

#### Word Bank

```
Implementation: Draggable word chips + drop zones in text
HTML: <span class="word-chip" draggable="true"> + <span class="blank-zone" data-accepts="word-id">
CSS: Inline blank styling, drag visual feedback
JS: HTML5 Drag and Drop API + touch events (touchstart/move/end)
Touch: CRITICAL — must implement touch event fallback alongside HTML5 DnD
SCORM: cmi.interactions.n.type = "matching"
```

#### Matching Drag-and-Drop

```
Implementation: Two-column layout with drag items and drop targets
HTML: Left column of draggable items + right column of drop zones
CSS: Grid/flex layout, visual snap feedback, connected-line animation
JS: Drag API + touch events, snap-to-target logic, pair tracking
Touch: touchstart/touchmove/touchend with getBoundingClientRect() hit testing
SCORM: cmi.interactions.n.type = "matching"
```

#### Matching Drop-Down

```
Implementation: Items with paired <select> elements
HTML: <div> per item with <select> containing all possible matches
CSS: Styled select or custom dropdown component
JS: Track all selections, validate all pairs on Submit
SCORM: cmi.interactions.n.type = "matching"
Accessibility: Native <select> is keyboard-friendly by default
```

#### Sequence Drag-and-Drop

```
Implementation: Sortable list with drag reordering
HTML: <ol> with <li draggable="true"> items
CSS: Grab cursor, insertion indicator, smooth reorder animation
JS: Drag API + touch events, calculate insertion position, reorder DOM
Libraries: Can use native DnD or a small sortable utility
SCORM: cmi.interactions.n.type = "sequencing"
```

#### Sequence Drop-Down

```
Implementation: Items with position <select> elements
HTML: Each item has a <select> with options 1, 2, 3... N
CSS: Styled dropdown + visual position indicator
JS: Track selections, validate no duplicate positions, compare to correct order
SCORM: cmi.interactions.n.type = "sequencing"
```

#### Numeric

```
Implementation: Number input with range validation
HTML: <input type="number" min="" max="" step="">
CSS: Large number input styling with units label
JS: Parse input, check against exact value or min/max range tolerance
SCORM: cmi.interactions.n.type = "numeric"
```

#### Hotspot

```
Implementation: Image with invisible clickable regions
HTML: <div class="hotspot-container"> with positioned <div class="hotspot-region"> overlays
CSS: Regions transparent by default, highlight on hover/click if desired
JS: Click handler on container, check if click coordinates fall within any correct region
Alternative: SVG <polygon> or <circle> overlay for complex shapes
SCORM: cmi.interactions.n.type = "other"
Accessibility: Provide text alternative ("Click on the area that shows...")
```

### 8.2 Survey Questions

#### Likert Scale

```
Implementation: Radio group styled as horizontal scale
HTML: <fieldset> with <input type="radio"> per scale point, visually arranged horizontally
CSS: Scale bar with labeled endpoints, circle indicators for each point
JS: Track selection, no scoring needed
SCORM: cmi.interactions.n.type = "likert"
```

**Key HTML pattern**:
```html
<fieldset class="likert-scale" role="radiogroup">
  <legend>I feel confident about this topic</legend>
  <div class="likert-options">
    <label><input type="radio" name="l1" value="1"><span>Strongly Disagree</span></label>
    <label><input type="radio" name="l1" value="2"><span>Disagree</span></label>
    <label><input type="radio" name="l1" value="3"><span>Neutral</span></label>
    <label><input type="radio" name="l1" value="4"><span>Agree</span></label>
    <label><input type="radio" name="l1" value="5"><span>Strongly Agree</span></label>
  </div>
</fieldset>
```

#### Short Answer / Essay

```
Implementation: <textarea> with character counter
HTML: <textarea maxlength="256"> (short) or <textarea maxlength="5000"> (essay)
CSS: Auto-expanding textarea, character counter below
JS: Track character count, store response text
SCORM: cmi.interactions.n.learner_response = text value
```

#### Ranking Drag-and-Drop / Ranking Drop-Down

```
Implementation: Same as Sequence Drag-and-Drop / Sequence Drop-Down
Difference: No "correct" order — all orderings are valid
JS: Store final order as learner's ranking preference
```

#### How Many

```
Implementation: Same as Numeric but ungraded
HTML: <input type="number">
JS: Store response, no validation against correct answer
```

### 8.3 Freeform Interactions

#### Freeform Pick One / Pick Many

```
Implementation: Button set with custom visual objects
HTML: <div class="freeform-option" role="button" tabindex="0"> for each option
CSS: Custom card/image styling, :focus and [aria-pressed] states
JS: Click/keyboard toggles aria-pressed, button set logic (pick one = deselect others)
Key: Use aria-pressed="true/false" instead of radio/checkbox for custom objects
```

#### Freeform Drag and Drop

```
Implementation: Absolutely positioned drag items + target zones
HTML: <div class="drag-item" draggable="true"> + <div class="drop-zone">
CSS: Position items absolutely, show drop zone highlights on dragover
JS: Full drag lifecycle with snap-to-target, return-to-origin on incorrect
Touch: MUST implement touchstart/touchmove/touchend alongside HTML5 DnD API
Configuration: data-snap="center|free", data-allow-multiple="true|false"
```

#### Freeform Hotspot

```
Implementation: SVG/CSS shapes overlaid on background image
HTML: <svg> with <polygon>/<circle>/<rect> elements over <img>
CSS: SVG shapes fill:transparent, pointer-events:all
JS: Click handler checks which SVG shape was clicked
Accessibility: aria-label on each hotspot shape
```

#### Freeform Shortcut Key

```
Implementation: Keyboard event listener
HTML: Display instruction + visual keyboard hint
JS: document.addEventListener('keydown', handler) capturing key + modifiers
Key detection: event.key, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey
Feedback: Show pressed keys visually, compare to correct combination
```

### 8.4 Interactive Objects

#### Dial Control

```
Implementation: Rotary knob via CSS transform + mouse/touch angle calculation
HTML: <div class="dial"> with <div class="dial-handle">
CSS: transform: rotate(Xdeg) on handle
JS:
  - On mousedown/touchstart: start tracking
  - On mousemove/touchmove: calculate angle = atan2(dy, dx) from center
  - Map angle to value within min/max range with step snapping
  - Update bound variable, fire change event
  - On mouseup/touchend: stop tracking
Accessibility: aria-role="slider", aria-valuemin/max/now, arrow keys change value
```

#### Slider Control

```
Implementation: Range input or custom track + thumb
HTML: <input type="range" min="" max="" step=""> OR custom div structure
CSS: Custom track and thumb styling via ::-webkit-slider-*
JS:
  - Track input/change events
  - Update bound variable on change
  - Trigger callbacks for showing/hiding content
Accessibility: Native <input type="range"> already accessible
Custom version: div.track + div.thumb with drag handling
```

#### Scrolling Panel

```
Implementation: CSS overflow container
HTML: <div class="scroll-panel" tabindex="0"><div class="scroll-content">...</div></div>
CSS: overflow-y: auto, fixed height, custom scrollbar styling
JS: Optional scroll tracking for "read to end" requirements
Accessibility: tabindex="0" for keyboard scrolling, role="region" with aria-label
```

#### Markers (Hotspot + Popup)

```
Implementation: Positioned icons + popup panels
HTML: <button class="marker" aria-expanded="false"> + <div class="marker-popup" hidden>
CSS: Position absolute on parent, popup with arrow pointing to marker
JS:
  - Click toggles aria-expanded and hidden attribute
  - Only one popup open at a time (close others when opening new)
  - Track visited state via data attribute or class
Accessibility: role="button", aria-expanded, focus trap in popup
```

**Key HTML pattern**:
```html
<div class="marker-container" style="position:relative">
  <img src="diagram.jpg" alt="Cell diagram">
  <button class="marker" style="top:30%;left:45%" aria-label="Mitochondria" aria-expanded="false">
    <svg><!-- marker icon --></svg>
  </button>
  <div class="marker-popup" id="popup-mito" hidden>
    <h3>Mitochondria</h3>
    <p>The powerhouse of the cell...</p>
    <button class="popup-close" aria-label="Close">×</button>
  </div>
</div>
```

#### Button Sets

```
Implementation: Radio group behavior on custom objects
HTML: <div role="radiogroup"> containing <div role="radio" tabindex="0" aria-checked="false">
CSS: Custom selected state styling via [aria-checked="true"]
JS:
  - Click on any item in set: set aria-checked="true", set all others to "false"
  - Keyboard: arrow keys move selection within group
  - Multiple sets: scope by data-set attribute
```

### 8.5 Result Slides

```
Implementation: Dedicated result page with dynamic score display
HTML: Score display area + conditional success/failure sections
CSS: Different styling for pass vs fail states
JS:
  - Calculate total score from all tracked interactions
  - Compare to passing threshold
  - Show/hide success or failure section
  - Populate score variables (points, percentage, pass threshold)
  - Report to LMS: cmi.core.score.raw, cmi.core.score.min, cmi.core.score.max
  - Set cmi.core.lesson_status = "passed" or "failed"

Buttons:
  - Review: Step through questions with correct/incorrect indicators
  - Retry: Reset all question states and navigate to first question
  - Print: window.print() with print-specific CSS

Combined Results:
  - Aggregate scores from multiple quiz sections
  - All sections must pass for overall pass
```

### 8.6 Feedback Layers

```
Implementation: Overlay panels shown after quiz submission
HTML: <div class="feedback-layer feedback-correct" hidden>
CSS:
  - Position fixed/absolute overlay
  - Correct = green accent, Incorrect = red accent, Try Again = yellow accent
  - Slide-in or fade animation
JS:
  - On submit: evaluate answer
  - If correct → show correct layer
  - If incorrect AND attempts remaining → show try-again layer
  - If incorrect AND no attempts left → show incorrect layer
  - Optional: show correct answer on incorrect layer
  - Continue button dismisses layer and advances

Attempt Tracking:
  - Store attempts per question
  - Decrement on each wrong answer
  - "Try Again" layer only when attempts > 0
```

---

## Summary: Interaction Inventory

### Complete Count

| Category | Count | Graded | Examples |
|----------|-------|--------|----------|
| **Graded Questions** | 11 | Yes | MC, T/F, Fill-blank, Matching, Sequence, Numeric, Hotspot |
| **Survey Questions** | 9 | No | Likert, Pick One/Many, Essay, Ranking, How Many |
| **Freeform Questions** | 6 | Yes (configurable) | Pick One/Many, DnD, Text Entry, Hotspot, Shortcut Key |
| **Interactive Objects** | 6 | No | Dial, Slider, Scrolling Panel, Markers, Button Sets, Knowledge Check |
| **Result System** | 4 types | N/A | Graded, Survey, Blank, Combined |
| **Feedback Layers** | 4 types | N/A | Correct, Incorrect, Try Again, Custom |
| **TOTAL** | **40+ distinct interaction patterns** | | |

### Priority Implementation for SCORM Content Studio

Based on usage frequency and learner impact, here is the recommended implementation priority:

#### Tier 1 — Must Have (implement first)
1. Multiple Choice (single select)
2. Multiple Response (multi-select)
3. True/False
4. Drag-and-Drop (matching)
5. Fill-in-the-Blank
6. Hotspot (click on image)
7. Result Slide (score, pass/fail, retry)
8. Feedback Layers (correct, incorrect, try again)
9. Markers (hotspot + popup)
10. Knowledge Check (ungraded)

#### Tier 2 — Should Have (implement second)
11. Sequence Drag-and-Drop (ordering)
12. Matching Drop-Down
13. Numeric Entry
14. Likert Scale (survey)
15. Short Answer / Essay (survey)
16. Slider Control
17. Button Sets
18. Scrolling Panel
19. Freeform Pick One / Pick Many (visual objects)

#### Tier 3 — Nice to Have (implement later)
20. Word Bank
21. Sequence Drop-Down
22. Ranking Drag-and-Drop
23. Ranking Drop-Down
24. Which Word
25. How Many
26. Dial Control
27. Freeform Shortcut Key
28. Freeform Text Entry
29. Combined Result Slides
30. Question Banks & Randomization

---

## Critical Implementation Rules

1. **Touch events are mandatory** — Every drag interaction MUST implement touch events (touchstart/touchmove/touchend) alongside HTML5 Drag and Drop API. Mobile/tablet users are a primary audience.

2. **Never use canvas rendering** — Unlike Storyline's opaque canvas approach, we use semantic HTML for accessibility and maintainability. Every element must be targetable by class/ID.

3. **SCORM interaction reporting** — Every graded question must report via `cmi.interactions` with proper type, correct response, learner response, result, and latency.

4. **Keyboard accessibility** — Every interactive element must be operable via keyboard (Tab to focus, Enter/Space to activate, Arrow keys for sliders/dials/radio groups).

5. **Attempt tracking** — Store attempts per question, support configurable max attempts (1, 2, 3, unlimited), and show appropriate feedback layer per attempt.

6. **No external dependencies** — All interactions must work with vanilla HTML/CSS/JS. No jQuery, React, or external libraries required.

7. **RTL support** — All interactions must work in both LTR and RTL layouts for Arabic content.

---

## Sources

- [Articulate Support: Question Types](https://articulate.com/support/article/Storyline-Question-Types)
- [GPI: Creating Quizzes in Storyline 360](https://www.globalizationpartners.com/2021/11/04/creating-quizzes-in-storyline-360/)
- [CommLab: Storyline 360 Quiz Capabilities](https://www.commlabindia.com/blog/articulate-storyline-360-quiz-capabilities)
- [Articulate Community: Freeform Drag-and-Drop](https://community.articulate.com/articles/articulate-storyline-360-user-guide-how-to-create-freeform-drag-and-drop-questions)
- [Articulate Community: Freeform Hotspot](https://community.articulate.com/articles/articulate-storyline-360-user-guide-how-to-create-freeform-hotspot-questions)
- [Articulate Community: Shortcut-Key Questions](https://community.articulate.com/articles/articulate-storyline-360-user-guide-how-to-create-freeform-shortcut-key-questions)
- [Articulate Community: Working with Sliders](https://community.articulate.com/articles/articulate-storyline-360-user-guide-how-to-work-with-sliders)
- [Articulate Community: Working with Dials](https://community.articulate.com/articles/articulate-storyline-360-user-guide-how-to-work-with-dials)
- [Articulate Community: Working with Markers](https://community.articulate.com/kb/user-guides/storyline-360-working-with-markers/1096416)
- [Articulate Community: Working with Button Sets](https://community.articulate.com/kb/user-guides/storyline-360-working-with-button-sets/1134508)
- [Articulate Community: Scrolling Panels](https://community.articulate.com/kb/user-guides/storyline-360-working-with-scrolling-panels/1096390)
- [Articulate Community: Result Slides](https://community.articulate.com/kb/user-guides/storyline-360-adding-result-slides/1083983)
- [Articulate Community: Feedback and Branching](https://community.articulate.com/articles/articulate-storyline-360-user-guide-how-to-choose-feedback-and-branching-options)
- [Articulate Community: Converting to Freeform](https://community.articulate.com/articles/articulate-storyline-360-user-guide-how-to-convert-existing-slide-to-freeform-interaction)
- [3 Ways to Create Drag-and-Drops](https://community.articulate.com/blog/articles/3-ways-to-create-drag-and-drops-with-storyline-360/1112385)
- [B Online Learning: Result Slides](https://bonlinelearning.com/using-result-slides-in-articulate-storyline/)
- [Michelle Johnson: Smart Quizzing in Storyline 360](https://www.michellejelearning.com/blog/5-smart-quizzing-amp-assessment-in-storyline-360)
- [Tictac: Storyline 360 Features](https://tictachelp.zendesk.com/hc/en-us/articles/360055034572-Storyline-360-Features)
- [Articulate Community: HTML5 Output](https://community.articulate.com/articles/why-people-love-storyline-s-html5-output)
