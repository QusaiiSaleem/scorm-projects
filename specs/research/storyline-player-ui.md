# Storyline 360 Player UI & Navigation System - Deep Research

> Comprehensive technical analysis of Articulate Storyline 360's Modern Player chrome,
> navigation controls, responsive behavior, and implementation patterns for building
> an equivalent player in pure HTML/CSS/JS.

---

## Table of Contents

1. [Player Architecture Overview](#1-player-architecture-overview)
2. [Player Chrome Components](#2-player-chrome-components)
3. [Navigation Controls](#3-navigation-controls)
4. [Sidebar System](#4-sidebar-system)
5. [Topbar System](#5-topbar-system)
6. [Seekbar & Playback Controls](#6-seekbar--playback-controls)
7. [Player Sizing & Scaling](#7-player-sizing--scaling)
8. [Responsive / Mobile Behavior](#8-responsive--mobile-behavior)
9. [Color Themes & Branding](#9-color-themes--branding)
10. [Lightbox & Dialog Layers](#10-lightbox--dialog-layers)
11. [Keyboard Shortcuts & Accessibility](#11-keyboard-shortcuts--accessibility)
12. [Technical Implementation (DOM, CSS, JS)](#12-technical-implementation)
13. [Player Layout ASCII Diagrams](#13-player-layout-ascii-diagrams)
14. [Feature Comparison: Modern vs Classic](#14-feature-comparison-modern-vs-classic)
15. [Implementation Recommendations](#15-implementation-recommendations)

---

## 1. Player Architecture Overview

Storyline 360 offers two player styles: **Modern** (default for new projects) and **Classic** (legacy). The Modern player is HTML5-only, responsive, and provides a unified experience across desktop and mobile.

### Key Principles

- **Unified experience**: Same player chrome on desktop, tablet, and phone
- **HTML5-only output**: No Flash dependency
- **Responsive scaling**: Fills browser window, adapts to screen size
- **Touch-optimized**: Swipe, drag, pinch-to-zoom on mobile
- **Accessible**: WCAG AA contrast, ARIA landmarks, keyboard navigation
- **Customizable**: Dark/Light/Custom themes, accent colors, font choices

### Published Output Structure

```
published-course/
  story.html                    <-- Main entry point (HTML5-only)
  imsmanifest.xml               <-- SCORM manifest
  story_content/                <-- Course content files
    slides/                     <-- Individual slide data
    user.js                     <-- Variables and state
  html5/
    lib/
      scripts/
        app.min.js              <-- Main player application
        frame.js                <-- Player frame controller
      stylesheets/
        player.css              <-- Player chrome styles
    data/
      css/
        output.min.css          <-- Compiled slide + player CSS
      js/
        slide data files...     <-- Slide-specific JS
```

**Important**: The `story_html5.html` file was removed in build 3.35.20995.0+. Now there is only `story.html` for HTML5-only output.

---

## 2. Player Chrome Components

The "player chrome" is the frame surrounding the course content. It consists of four main areas:

```
+------------------------------------------------------------------+
|                        TOPBAR (Title + Tabs)                      |
+----------+-------------------------------------------------------+
|          |                                                        |
|          |                                                        |
| SIDEBAR  |              SLIDE CONTENT AREA                        |
| (Menu,   |              (720x405 default)                         |
| Glossary,|                                                        |
| Notes,   |                                                        |
| Resources)|                                                       |
|          |                                                        |
|          |                                                        |
+----------+-------------------------------------------------------+
|                    BOTTOMBAR (Controls + Seekbar)                 |
+------------------------------------------------------------------+
```

### Component Inventory

| Component | Location | Purpose |
|-----------|----------|---------|
| Course Title | Topbar | Displays course/project name |
| Topbar Tabs | Topbar (opposite sidebar) | Quick access to Menu/Glossary/Resources/Notes |
| Sidebar | Left or Right side | Persistent panel for Menu/Glossary/Resources/Notes |
| Slide Area | Center | Main content display area |
| Prev Button | Bottombar left | Navigate to previous slide |
| Next Button | Bottombar right | Navigate to next slide |
| Play/Pause | Bottombar center-left | Control slide timeline playback |
| Seekbar | Bottombar center | Scrub through slide timeline |
| Volume | Bottombar | Audio volume control |
| Captions Toggle | Bottombar | Show/hide closed captions |
| Accessibility Menu | Bottombar | Zoom, text, keyboard settings |
| Slide Counter | Player (via variables) | "Slide X of Y" display |
| Logo | Below tabs / on slide master | Brand logo placement |
| Cover Photo | Below tabs | Visual branding element |

---

## 3. Navigation Controls

### Prev/Next Buttons

- Automatically added to all content slides
- Question slides get a **Submit** button instead of Next
- Three display styles:
  - **Icons only** (arrow chevrons)
  - **Text only** ("Previous" / "Next")
  - **Icons + Text** (default on desktop)
- On smartphones: always icons-only (space constraint)
- Customizable text labels (e.g., "Back" / "Continue")
- Can be disabled per-slide via Slide Properties

### Submit Button

- Appears on question/quiz slides
- Replaces the Next button
- Triggers answer evaluation
- Styled with accent color

### Button Styles

```
Icons Only:     [<]  [>]
Text Only:      [Previous]  [Next]
Icons + Text:   [< Previous]  [Next >]
Submit:         [Submit]  (accent color background)
```

### Navigation Behavior

- **Free navigation**: Learner can go anywhere via menu
- **Restricted navigation**: Learner must follow linear path
- **Per-slide control**: Individual slides can override navigation settings
- **Resume behavior**: Course can prompt "Resume where you left off?"

---

## 4. Sidebar System

### Sidebar Position

- **Left** (default) or **Right**
- Width: **240 pixels** when expanded
- Collapses on mobile devices automatically
- Can start collapsed or expanded on desktop

### Sidebar Panels

The sidebar can contain one or more of these panels:

#### Menu Panel
- Auto-generated from story structure (scenes > slides)
- Hierarchical tree with expandable sections
- Shows completion status per item (visited checkmarks)
- Customizable: rename entries, reorder, show/hide items
- Numbering options: None, Decimal, Numeric, Alpha, Roman
- Indent level reflects scene/slide hierarchy

#### Glossary Panel
- Alphabetical term definitions
- Searchable
- Available throughout entire course
- Terms appear in a scrollable list

#### Notes Panel
- Displays slide-specific notes
- Content from the author's Notes tab
- Read-only for learners
- Scrollable text area

#### Resources Panel
- Links to files or URLs
- Custom title for each resource
- Files are bundled in published output
- URLs open in new browser tab

### Sidebar Behavior

| Screen Size | Sidebar Behavior |
|-------------|-----------------|
| Desktop (wide) | Always visible, can be toggled |
| Desktop (narrow) | Auto-collapses, hamburger toggle |
| Tablet portrait | Auto-collapses, overlay on tap |
| Tablet landscape | Can remain visible if space allows |
| Phone portrait | Hamburger menu, full overlay |
| Phone landscape | Hamburger menu, full overlay |

### Sidebar Animation

- Slides in/out with smooth CSS transition
- Content area resizes to accommodate
- Overlay mode on mobile (doesn't push content)
- Semi-transparent backdrop when overlaid on mobile

---

## 5. Topbar System

### Topbar Structure

```
+------------------------------------------------------------------+
| [Hamburger] Course Title          [Glossary] [Resources] [Notes] |
+------------------------------------------------------------------+
     ^                                    ^
     |                                    |
  (mobile only)                   (topbar tabs - opposite side
   menu toggle                     from sidebar position)
```

### Topbar Components

| Element | Behavior |
|---------|----------|
| Course Title | Always visible; set in Player Properties |
| Hamburger Icon | Appears on mobile or when sidebar is collapsed |
| Topbar Tabs | Positioned opposite the sidebar; collapse into icons on small screens |

### Topbar Dimensions

- **Title only** (no tabs): adds **23px** to player height
- **Title + tabs**: adds **47px** to player height (23 + 24)
- Topbar tabs: **24px** additional height

### Tab Positioning Rules

- Tabs on the **topbar** collapse when not in use
- Tabs on the **sidebar** are always visible when sidebar is open
- Custom tabs (author-created) can only go on the topbar
- Built-in tabs (Menu, Glossary, Notes, Resources) can go either location
- When sidebar is on the LEFT, topbar tabs appear on the RIGHT (and vice versa)

---

## 6. Seekbar & Playback Controls

### Seekbar

- Horizontal progress bar at the bottom of the player
- Shows slide timeline progress (not course progress)
- Interactive: learners can scrub to any point
- **Conditional seekbar**: locks on first view, unlocks after slide completes
- Visual: thin line with progress fill and scrubber handle

### Seekbar Mobile Behavior

| Device + Orientation | Seekbar Style |
|---------------------|---------------|
| Desktop | Full horizontal bar across bottom |
| Tablet portrait | Full horizontal bar across bottom |
| Tablet landscape | Full horizontal bar across bottom |
| Phone portrait | Full horizontal bar across bottom |
| Phone landscape | **Circular indicator** around play/pause button |

The circular indicator on phone landscape:
- Wraps around the play/pause button
- Shows elapsed vs remaining as a ring
- NOT interactive (cannot scrub)
- Saves vertical space in landscape

### Play/Pause Button

- **Decoupled from seekbar** (can enable/disable independently)
- Located in the bottom-left control area
- Toggle icon: Play triangle / Pause bars
- Controls slide timeline playback

### Volume Control

- Located in the bottombar
- Adds **51px** to player height when present
- Click to toggle mute/unmute
- Slider for volume level adjustment

### Captions Toggle (CC)

- Button in bottombar control area
- Toggles closed captions visibility
- Can be hidden if no captions exist
- Accessible via keyboard shortcut

### Bottombar Layout

```
+------------------------------------------------------------------+
| [Play/Pause] [==========seekbar==========] [Vol] [CC] [A11y]    |
|              [< Prev]              [Next >]                       |
+------------------------------------------------------------------+
```

### Bottombar Dimensions

- Navigation controls (Prev/Next, seekbar, volume, CC): adds **51px** height
- **Player frame padding**: 10px all around = **20px** total width + **20px** total height

---

## 7. Player Sizing & Scaling

### Slide Size Defaults

- **Default slide size**: 720 x 405 pixels (16:9 aspect ratio)
- Common alternatives: 720x540 (4:3), 1280x720 (HD 16:9)
- Custom sizes supported

### Player Frame Overhead

| Feature | Width Added | Height Added |
|---------|------------|--------------|
| Player frame (padding) | +20 px | +20 px |
| Title bar | 0 | +23 px |
| Topbar tabs | 0 | +24 px |
| Nav controls (prev/next, seekbar, volume) | 0 | +51 px |
| Sidebar | +240 px | 0 |
| **Maximum total** | **+260 px** | **+118 px** |

### Size Calculation Example

```
Slide Size:          720 x 405
+ Player Frame:      +20   +20     = 740 x 425
+ Title + Tabs:       +0   +47     = 740 x 472
+ Nav Controls:       +0   +51     = 740 x 523
+ Sidebar:          +240    +0     = 980 x 523
                    ================
Final Output:        980 x 523 pixels (at optimal browser size)
```

### Browser Sizing Options

| Option | Behavior |
|--------|----------|
| **Scale player to fill browser** | Scales up/down to fill entire window; no whitespace |
| **Lock player at optimal size** | Fixed at calculated size; centered with whitespace |
| **Resize browser to optimal size** | Attempts to resize browser window to match |
| **Display at user's current size** | Uses whatever browser dimensions exist |

### Scaling Behavior

- Modern player scales smoothly (not pixel-snapped)
- Maintains aspect ratio during scaling
- CSS transform: scale() used for smooth resizing
- On mobile: always fills the screen (no sizing options)

---

## 8. Responsive / Mobile Behavior

### Device Detection & Adaptation

Storyline's responsive player detects the device type and adapts:

| Device | Screen Size | Player Adaptation |
|--------|------------|-------------------|
| Desktop | >1024px wide | Full chrome: sidebar visible, full controls, seekbar |
| Tablet Landscape | ~1024px | Sidebar may auto-collapse, full bottom controls |
| Tablet Portrait | ~768px | Sidebar collapses to hamburger, overlay when opened |
| Phone Landscape | ~667px | Minimal chrome, circular seekbar, hamburger menu |
| Phone Portrait | ~375px | Minimal chrome, full seekbar, hamburger menu |

### Mobile-Specific Behaviors

1. **Sidebar collapse**: Auto-hides sidebar, replaced by hamburger icon
2. **Browser chrome removal**: Eliminates address bar and browser UI
3. **Touch gestures supported**:
   - **Swipe left/right**: Navigate between slides
   - **Pinch-to-zoom**: Zoom in/out on content
   - **Double-tap**: Quick zoom toggle
   - **Drag**: Interact with draggable objects
   - **Swipe can be disabled** per-slide via Slide Properties
4. **Full-screen overlay menu**: Sidebar becomes full-screen panel on phones
5. **Icons-only nav buttons**: Text labels hidden on phones
6. **Seekbar adaptation**: Circular ring on phone landscape

### Preview Modes (in authoring tool)

- Desktop preview
- Tablet Portrait preview
- Tablet Landscape preview
- Phone Portrait preview
- Phone Landscape preview

---

## 9. Color Themes & Branding

### Theme Options

| Theme | Background | Controls | Use Case |
|-------|-----------|----------|----------|
| **Dark** | Dark gray/charcoal (#1a1a1a-ish) | Light gray (#BABBBA) | Immersive, media-heavy |
| **Light** | White/light gray | Dark gray (#585858) | Clean, corporate, reading |
| **Custom** | Any color | Auto-contrast adjusted | Brand-matched |

### Accent Color

- Applied to: active tabs, seekbar progress fill, selected items, buttons
- Sourced from theme colors or custom picker
- Enhanced color selector with hex input
- Used consistently throughout player chrome

### Auto-Contrast Behavior

When using Custom theme:
- **Dark background** chosen → controls render in **#BABBBA** (light gray)
- **Light background** chosen → controls render in **#585858** (dark gray)
- Automatic WCAG AA contrast compliance

### Accessible Contrast (Modern Player)

The modern player meets and exceeds **WCAG Level AA** accessibility guidelines:
- 4.5:1 contrast ratio for normal text
- 3:1 contrast ratio for large text and UI components
- Focus indicators clearly visible against all background colors

### Font Customization

- Player font applies to: course title, menu items, navigation buttons, panel text
- Separate from slide content fonts
- Affects all player chrome text

### Logo & Branding

| Element | Placement | Notes |
|---------|-----------|-------|
| Course Logo | Below sidebar tabs | Small image, optional |
| Cover Photo | Below sidebar tabs | Larger banner image |
| Course Title | Topbar | Text, customizable |
| Brand Colors | Accent + background | Via Custom theme |

**Limitation**: Logo cannot be placed directly in the topbar in the modern player. Workaround: add logo to slide master for on-content branding.

---

## 10. Lightbox & Dialog Layers

### Lightbox Slides

- A **slide** displayed as a popup over the current slide
- Background dims (semi-transparent overlay)
- Has its own player controls
- Close button (X) in top-right corner
- Does NOT navigate away from current slide
- Common uses: glossary popups, media galleries, help/instructions, certificates

### Dialog Layers

- A **slide layer** (not a separate slide)
- Overlays the **entire browser window** (not just the slide area)
- Dims all other content
- Modern player exclusive feature
- More accessible than regular layers
- Familiar modal dialog UX pattern
- Ideal for: confirmations, important messages, accessible feedback

### Comparison

| Feature | Lightbox Slide | Dialog Layer | Regular Layer |
|---------|---------------|--------------|---------------|
| Type | Separate slide | Layer on current slide | Layer on current slide |
| Overlay area | Slide area only | Entire browser/player | Slide area only |
| Background dim | Yes | Yes (stronger) | Optional |
| Close button | Built-in X | Custom trigger | Custom trigger |
| Own player controls | Yes | No | No |
| Accessibility | Good | Best | Basic |
| Navigation impact | None (stays on slide) | None | None |

---

## 11. Keyboard Shortcuts & Accessibility

### Built-in Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Alt+P | Play / Pause |
| Ctrl+Alt+. | Next slide |
| Ctrl+Alt+, | Previous slide |
| Ctrl+Alt+M | Mute / Unmute audio |
| Ctrl+Alt+R | Replay slide |
| Ctrl+Alt+C | Toggle closed captions |
| Ctrl+Alt+A | Toggle background audio |
| Shift+? | Show keyboard shortcut list |
| Tab | Navigate through player controls |
| Enter/Space | Activate focused element |
| Escape | Close lightbox/dialog/panel |

### Why Ctrl+Alt Prefix?

- Avoids conflicts with screen readers (JAWS, NVDA)
- Learners can disable shortcuts via accessibility menu
- Customizable per-learner preference

### Accessibility Features

1. **ARIA Landmarks**: Player regions identified for screen readers
2. **Focus Management**: Logical tab order left-to-right, top-to-bottom
3. **Focus Indicators**: Visible focus rings on all interactive elements
4. **Skip Navigation**: Skip to main content option
5. **Accessible Contrast**: WCAG AA minimum for all player elements
6. **Screen Reader Support**: JAWS, NVDA, VoiceOver compatible
7. **Adjustable Settings Menu**:
   - Zoom mode toggle
   - Accessible text on/off
   - Keyboard shortcuts on/off
   - Background audio on/off

### Tab Order (Keyboard Navigation)

```
1. Skip to main content link
2. Sidebar toggle (hamburger)
3. Course title
4. Topbar tabs (left to right)
5. Slide content area (layer objects in tab order)
6. Previous button
7. Play/Pause button
8. Seekbar
9. Volume control
10. Captions toggle
11. Accessibility settings
12. Next button
```

---

## 12. Technical Implementation

### Known CSS Classes (from DOM inspection)

| CSS Class | Element |
|-----------|---------|
| `.cs-base` | Root player container |
| `.cs-area-primary` | Main content area (slide + controls) |
| `.cs-area-secondary` | Sidebar area |
| `.cs-slide-container` | Slide display container |
| `.cs-left` | Left sidebar panel |
| `.area-secondary-wrapper` | Sidebar width container |
| `.top-ui-bg` | Topbar background |
| `.slide-control-button-next` | Next button |
| `.slide-control-button-prev` | Previous button |

### CSS File Location

```
Published output:
  html5/data/css/output.min.css    <-- Main compiled CSS
  html5/lib/stylesheets/player.css <-- Player chrome styles
```

### JavaScript Architecture

- **jQuery built-in**: Available for DOM manipulation
- **app.min.js**: Main player application controller
- **frame.js**: Player frame management
- **Execute JavaScript trigger**: Author can inject custom JS
- **Player API**: `GetPlayer()` returns player object for variable access

### Key JavaScript Patterns

```javascript
// Access player object
var player = GetPlayer();

// Get/set variables
var score = player.GetVar("ScorePoints");
player.SetVar("ScorePoints", score + 10);

// Built-in slide number variables
// %Project.SlideNumber%      - Current slide number
// %Project.TotalSlides%      - Total slides in project
// %Menu.SlideNumber%         - Current slide in menu
// %Menu.TotalSlides%         - Total menu slides
// %Scene.SlideNumber%        - Current slide in scene

// Manipulate DOM (jQuery available)
$('.cs-slide-container').css('background', '#000');

// Access parent player from slide iframe
var parentPlayer = parent.GetPlayer();
```

### DOM Structure (Simplified)

```html
<!-- story.html - Main entry point -->
<html>
<head>
  <link rel="stylesheet" href="html5/lib/stylesheets/player.css">
  <link rel="stylesheet" href="html5/data/css/output.min.css">
</head>
<body>
  <div class="cs-base">
    <!-- Topbar -->
    <div class="top-ui-bg">
      <button class="hamburger-toggle">Menu</button>
      <span class="course-title">Course Name</span>
      <div class="topbar-tabs">
        <button class="tab-glossary">Glossary</button>
        <button class="tab-resources">Resources</button>
      </div>
    </div>

    <!-- Main Layout -->
    <div class="cs-layout">
      <!-- Sidebar -->
      <div class="cs-area-secondary">
        <div class="area-secondary-wrapper">
          <div class="cs-left">
            <div class="menu-panel">...</div>
            <div class="notes-panel">...</div>
          </div>
        </div>
      </div>

      <!-- Slide Area -->
      <div class="cs-area-primary">
        <div class="cs-slide-container">
          <iframe src="slide_content.html"></iframe>
        </div>
      </div>
    </div>

    <!-- Bottom Controls -->
    <div class="player-controls">
      <button class="slide-control-button-prev">Previous</button>
      <button class="play-pause-btn">Play</button>
      <div class="seekbar">
        <div class="seekbar-fill"></div>
        <div class="seekbar-handle"></div>
      </div>
      <button class="volume-btn">Volume</button>
      <button class="cc-toggle">CC</button>
      <button class="a11y-settings">Settings</button>
      <button class="slide-control-button-next">Next</button>
    </div>
  </div>
</body>
</html>
```

**Note**: Actual class names may vary between builds. The above is a synthesis from community inspection reports. Articulate regenerates some class prefixes on each publish.

---

## 13. Player Layout ASCII Diagrams

### Desktop - Full Player (Sidebar Left)

```
+------------------------------------------------------------------+
| [=] Course Title                    [Glossary] [Resources] [CC]  |  <- Topbar (47px)
+--------+---------------------------------------------------------+
|        |                                                         |
| MENU   |                                                         |
| ----   |                                                         |
| > Mod 1|            SLIDE CONTENT AREA                           |
|   Lsn 1|               720 x 405                                |
|   Lsn 2|          (or custom dimensions)                         |
| > Mod 2|                                                         |
|   Lsn 3|                                                         |
|   Quiz |                                                         |
|        |                                                         |
| 240px  |                                                         |
+--------+---------------------------------------------------------+
| [< Prev]  [>||] [=======seekbar=======] [Vol] [CC] [A]  [Next >]|  <- Controls (51px)
+------------------------------------------------------------------+
  ^                                                            ^
  |--- 10px frame padding all around ---|                      |
       Total frame adds: +260w, +118h max
```

### Desktop - No Sidebar (Minimal)

```
+----------------------------------------------------------+
| Course Title                              [CC] [Settings] |  <- Topbar (23px)
+----------------------------------------------------------+
|                                                           |
|                                                           |
|                SLIDE CONTENT AREA                         |
|                   720 x 405                               |
|                                                           |
|                                                           |
|                                                           |
+----------------------------------------------------------+
| [< Prev]  [>||] [====seekbar====] [Vol] [CC]    [Next >] |  <- Controls (51px)
+----------------------------------------------------------+
```

### Tablet Portrait

```
+----------------------------------------+
| [=]  Course Title           [Tabs...] |
+----------------------------------------+
|                                        |
|                                        |
|          SLIDE CONTENT AREA            |
|         (scaled to fit width)          |
|                                        |
|                                        |
|                                        |
+----------------------------------------+
| [<]  [>||] [==seekbar==] [V] [CC] [>] |
+----------------------------------------+

Sidebar: collapsed, opens as overlay on [=] tap
```

### Phone Portrait

```
+-----------------------------+
| [=]  Title           [...] |
+-----------------------------+
|                             |
|     SLIDE CONTENT           |
|    (scaled to fit)          |
|                             |
|                             |
+-----------------------------+
| [<] [>||] [=seek=] [>]     |
+-----------------------------+

Controls: icons only
Sidebar: full-screen overlay
```

### Phone Landscape

```
+--------------------------------------------------+
| [=]                                        [...] |
+--------------------------------------------------+
|                                                   |
|            SLIDE CONTENT (maximized)              |
|                                                   |
+--------------------------------------------------+
|  [<]    ( seekbar-ring around play/pause )   [>]  |
+--------------------------------------------------+

Seekbar: circular ring around play/pause button
Controls: minimal, icons only
Title: may be hidden for space
```

### Sidebar Open (Mobile Overlay)

```
+-----------+--------------------+
|           |                    |
|  SIDEBAR  |   SLIDE CONTENT   |
|  OVERLAY  |   (dimmed)        |
|           |                    |
|  Menu     |                    |
|  > Mod 1  |                    |
|    Lsn 1  |                    |
|    Lsn 2  |                    |
|  > Mod 2  |                    |
|           |                    |
|   [X]     |                    |
+-----------+--------------------+

On phone: sidebar covers entire screen
On tablet: sidebar overlays ~60% of width
Background: semi-transparent dim
```

### Lightbox Overlay

```
+------------------------------------------------------------------+
|                    (dimmed background)                             |
|         +----------------------------------------------+          |
|         |                                        [X]   |          |
|         |                                              |          |
|         |        LIGHTBOX SLIDE CONTENT                |          |
|         |        (separate slide displayed              |          |
|         |         as modal popup)                       |          |
|         |                                              |          |
|         |                                              |          |
|         |  [< Prev]  [seekbar]           [Next >]      |          |
|         +----------------------------------------------+          |
|                                                                   |
+------------------------------------------------------------------+
```

### Dialog Layer Overlay

```
+------------------------------------------------------------------+
|                                                                   |
|            (entire browser window dimmed)                          |
|                                                                   |
|         +----------------------------------------------+          |
|         |                                              |          |
|         |        DIALOG LAYER CONTENT                  |          |
|         |        (overlays entire player,               |          |
|         |         not just slide area)                  |          |
|         |                                              |          |
|         |        [OK Button]                           |          |
|         +----------------------------------------------+          |
|                                                                   |
+------------------------------------------------------------------+
```

---

## 14. Feature Comparison: Modern vs Classic

| Feature | Modern Player | Classic Player |
|---------|--------------|----------------|
| Output format | HTML5 only | HTML5 + Flash |
| Responsive | Yes (unified) | Yes (separate mobile) |
| Theme options | Dark / Light / Custom | Full color control per element |
| Accent color | Single accent color | Multiple color settings |
| Button styles | Icons / Text / Both | Text only |
| Seekbar | Conditional lock, circular mobile | Standard only |
| Play/Pause | Decoupled from seekbar | Tied to seekbar |
| Dialog layers | Yes | No |
| Streaming video | Yes | No |
| Print slides | Yes | No |
| Accessible feedback | Enhanced | Basic |
| Accessible contrast | WCAG AA auto-contrast | Manual |
| Background audio control | Trigger-based | Limited |
| Sidebar collapse | Automatic on small screens | Manual only |
| Logo placement | Below tabs / slide master | Topbar direct |
| Font customization | Player-wide font choice | Per-element |
| Mobile hamburger | Automatic | Automatic |
| Touch gestures | Swipe, pinch, drag | Limited |
| Default for new projects | Yes | No |

---

## 15. Implementation Recommendations

### How to Build a Storyline-Like Player in Pure HTML/CSS/JS

Based on this research, here is a recommended implementation architecture for our SCORM Content Studio.

### HTML Structure

```html
<!-- player.html -->
<div class="sl-player" data-theme="dark" data-sidebar="left">

  <!-- Skip Navigation (Accessibility) -->
  <a href="#slide-content" class="sl-skip-nav">Skip to content</a>

  <!-- Topbar -->
  <header class="sl-topbar" role="banner">
    <button class="sl-hamburger" aria-label="Toggle menu"
            aria-expanded="false">
      <svg><!-- hamburger icon --></svg>
    </button>
    <h1 class="sl-title">Course Title</h1>
    <nav class="sl-topbar-tabs" role="navigation" aria-label="Player tabs">
      <button class="sl-tab" data-panel="glossary">Glossary</button>
      <button class="sl-tab" data-panel="resources">Resources</button>
    </nav>
  </header>

  <!-- Main Layout -->
  <div class="sl-layout">

    <!-- Sidebar -->
    <aside class="sl-sidebar" role="complementary" aria-label="Course navigation">
      <div class="sl-sidebar-inner">
        <nav class="sl-menu" role="navigation" aria-label="Course menu">
          <!-- Menu items -->
        </nav>
        <div class="sl-panel sl-glossary" hidden>
          <!-- Glossary content -->
        </div>
        <div class="sl-panel sl-notes" hidden>
          <!-- Notes content -->
        </div>
        <div class="sl-panel sl-resources" hidden>
          <!-- Resources list -->
        </div>
      </div>
    </aside>

    <!-- Slide Content -->
    <main class="sl-content" id="slide-content" role="main">
      <div class="sl-slide-container">
        <!-- Slide HTML injected here -->
      </div>
    </main>

  </div>

  <!-- Bottom Controls -->
  <footer class="sl-controls" role="toolbar" aria-label="Player controls">
    <button class="sl-btn-prev" aria-label="Previous slide">
      <svg><!-- chevron left --></svg>
      <span class="sl-btn-text">Previous</span>
    </button>

    <div class="sl-playback">
      <button class="sl-btn-play" aria-label="Play">
        <svg><!-- play icon --></svg>
      </button>
      <div class="sl-seekbar" role="slider" aria-label="Slide progress"
           aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <div class="sl-seekbar-track">
          <div class="sl-seekbar-fill"></div>
          <div class="sl-seekbar-handle" tabindex="0"></div>
        </div>
      </div>
    </div>

    <div class="sl-secondary-controls">
      <button class="sl-btn-volume" aria-label="Volume">
        <svg><!-- volume icon --></svg>
      </button>
      <button class="sl-btn-cc" aria-label="Closed captions">
        <svg><!-- CC icon --></svg>
      </button>
      <button class="sl-btn-a11y" aria-label="Accessibility settings">
        <svg><!-- gear icon --></svg>
      </button>
    </div>

    <button class="sl-btn-next" aria-label="Next slide">
      <span class="sl-btn-text">Next</span>
      <svg><!-- chevron right --></svg>
    </button>
  </footer>

</div>
```

### CSS Architecture

```css
/* === Player CSS Custom Properties === */
:root {
  /* Theme: Dark */
  --sl-bg: #1a1a2e;
  --sl-bg-secondary: #16213e;
  --sl-text: #e0e0e0;
  --sl-text-muted: #888;
  --sl-accent: #0f3460;
  --sl-accent-hover: #1a5276;
  --sl-border: rgba(255, 255, 255, 0.1);
  --sl-controls-bg: #0d1117;
  --sl-controls-text: #BABBBA;

  /* Dimensions */
  --sl-sidebar-width: 240px;
  --sl-topbar-height: 47px;
  --sl-controls-height: 51px;
  --sl-frame-padding: 10px;

  /* Transitions */
  --sl-transition: 0.3s ease;
}

/* Light theme override */
[data-theme="light"] {
  --sl-bg: #ffffff;
  --sl-bg-secondary: #f5f5f5;
  --sl-text: #333333;
  --sl-text-muted: #666;
  --sl-controls-bg: #f0f0f0;
  --sl-controls-text: #585858;
}

/* === Player Layout === */
.sl-player {
  display: grid;
  grid-template-rows: var(--sl-topbar-height) 1fr var(--sl-controls-height);
  grid-template-columns: var(--sl-sidebar-width) 1fr;
  grid-template-areas:
    "topbar   topbar"
    "sidebar  content"
    "controls controls";
  width: 100%;
  height: 100vh;
  background: var(--sl-bg);
  color: var(--sl-text);
  overflow: hidden;
}

/* Sidebar collapsed state */
.sl-player[data-sidebar-collapsed] {
  grid-template-columns: 0 1fr;
}

/* No sidebar at all */
.sl-player[data-sidebar="none"] {
  grid-template-columns: 1fr;
  grid-template-areas:
    "topbar"
    "content"
    "controls";
}

/* === Topbar === */
.sl-topbar {
  grid-area: topbar;
  display: flex;
  align-items: center;
  padding: 0 var(--sl-frame-padding);
  background: var(--sl-bg-secondary);
  border-bottom: 1px solid var(--sl-border);
  gap: 12px;
  z-index: 100;
}

/* === Sidebar === */
.sl-sidebar {
  grid-area: sidebar;
  background: var(--sl-bg-secondary);
  border-right: 1px solid var(--sl-border);
  overflow-y: auto;
  transition: transform var(--sl-transition),
              width var(--sl-transition);
}

/* === Slide Content === */
.sl-content {
  grid-area: content;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sl-frame-padding);
  overflow: hidden;
}

.sl-slide-container {
  width: 100%;
  max-width: 720px;
  aspect-ratio: 16 / 9;
  background: #000;
  position: relative;
  overflow: hidden;
}

/* === Bottom Controls === */
.sl-controls {
  grid-area: controls;
  display: flex;
  align-items: center;
  padding: 0 var(--sl-frame-padding);
  background: var(--sl-controls-bg);
  color: var(--sl-controls-text);
  gap: 8px;
  z-index: 100;
}

/* === Seekbar === */
.sl-seekbar-track {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.sl-seekbar-fill {
  height: 100%;
  background: var(--sl-accent);
  border-radius: 2px;
  width: 0%;
  transition: width 0.1s linear;
}

.sl-seekbar-handle {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--sl-accent);
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
}

/* === Responsive: Tablet === */
@media (max-width: 1024px) {
  .sl-player {
    grid-template-columns: 1fr;
    grid-template-areas:
      "topbar"
      "content"
      "controls";
  }

  .sl-sidebar {
    position: fixed;
    left: 0;
    top: var(--sl-topbar-height);
    bottom: var(--sl-controls-height);
    width: 280px;
    transform: translateX(-100%);
    z-index: 200;
    box-shadow: 4px 0 20px rgba(0,0,0,0.3);
  }

  .sl-sidebar.open {
    transform: translateX(0);
  }
}

/* === Responsive: Phone === */
@media (max-width: 600px) {
  .sl-topbar { --sl-topbar-height: 40px; }
  .sl-controls { --sl-controls-height: 44px; }

  .sl-btn-text { display: none; }  /* Icons only */

  .sl-sidebar {
    width: 100%;  /* Full screen overlay */
  }
}

/* Phone Landscape: Circular seekbar */
@media (max-width: 900px) and (orientation: landscape) and (max-height: 500px) {
  .sl-seekbar { display: none; }
  .sl-btn-play {
    position: relative;
  }
  .sl-btn-play::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 3px solid var(--sl-accent);
    /* Animated via JS to show progress as conic-gradient */
    background: conic-gradient(
      var(--sl-accent) calc(var(--progress) * 1%),
      transparent 0
    );
    mask: radial-gradient(circle, transparent 60%, black 61%);
    -webkit-mask: radial-gradient(circle, transparent 60%, black 61%);
  }
}
```

### JavaScript Controller

```javascript
class StorylinePlayer {
  constructor(config) {
    this.config = {
      theme: 'dark',           // 'dark' | 'light' | 'custom'
      accentColor: '#0f3460',
      sidebarPosition: 'left', // 'left' | 'right' | 'none'
      sidebarStartOpen: true,
      showSeekbar: true,
      showPlayPause: true,
      showVolume: true,
      showCaptions: true,
      showPrevNext: true,
      buttonStyle: 'both',     // 'icons' | 'text' | 'both'
      conditionalSeekbar: false,
      ...config
    };

    this.currentSlide = 0;
    this.totalSlides = 0;
    this.isPlaying = false;
    this.isMuted = false;
    this.sidebarOpen = this.config.sidebarStartOpen;
    this.variables = {};

    this.init();
  }

  init() {
    this.bindKeyboardShortcuts();
    this.bindTouchGestures();
    this.bindNavigation();
    this.updateTheme();
    this.announceToScreenReader('Course loaded');
  }

  // Navigation
  nextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.currentSlide++;
      this.loadSlide(this.currentSlide);
      this.updateSeekbar();
      this.updateSlideCounter();
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.loadSlide(this.currentSlide);
      this.updateSeekbar();
      this.updateSlideCounter();
    }
  }

  // Sidebar
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    const sidebar = document.querySelector('.sl-sidebar');
    const hamburger = document.querySelector('.sl-hamburger');

    sidebar.classList.toggle('open', this.sidebarOpen);
    hamburger.setAttribute('aria-expanded', this.sidebarOpen);

    // Trap focus in sidebar on mobile
    if (this.isMobile() && this.sidebarOpen) {
      this.trapFocus(sidebar);
    }
  }

  // Keyboard Shortcuts (matching Storyline)
  bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.altKey) {
        switch(e.key) {
          case 'p': case 'P':
            e.preventDefault();
            this.togglePlayPause();
            break;
          case '.':
            e.preventDefault();
            this.nextSlide();
            break;
          case ',':
            e.preventDefault();
            this.prevSlide();
            break;
          case 'm': case 'M':
            e.preventDefault();
            this.toggleMute();
            break;
          case 'r': case 'R':
            e.preventDefault();
            this.replaySlide();
            break;
          case 'c': case 'C':
            e.preventDefault();
            this.toggleCaptions();
            break;
        }
      }
      // Shift+? = Show shortcuts
      if (e.shiftKey && e.key === '?') {
        this.showShortcutHelp();
      }
    });
  }

  // Touch Gestures
  bindTouchGestures() {
    let startX, startY;
    const content = document.querySelector('.sl-content');

    content.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    content.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX;
      const diffY = endY - startY;

      // Only trigger swipe if horizontal movement > vertical
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          this.prevSlide(); // Swipe right = prev
        } else {
          this.nextSlide(); // Swipe left = next
        }
      }
    }, { passive: true });
  }

  // Theme
  updateTheme() {
    const player = document.querySelector('.sl-player');
    player.dataset.theme = this.config.theme;
    document.documentElement.style.setProperty(
      '--sl-accent', this.config.accentColor
    );
  }

  // Accessibility
  announceToScreenReader(message) {
    const announcer = document.getElementById('sl-announcer');
    if (announcer) {
      announcer.textContent = message;
    }
  }

  trapFocus(element) {
    const focusable = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      if (e.key === 'Escape') {
        this.toggleSidebar();
      }
    });

    first.focus();
  }

  // Lightbox
  openLightbox(slideId) {
    const overlay = document.createElement('div');
    overlay.className = 'sl-lightbox-overlay';
    overlay.innerHTML = `
      <div class="sl-lightbox" role="dialog" aria-modal="true">
        <button class="sl-lightbox-close" aria-label="Close">&times;</button>
        <div class="sl-lightbox-content">
          <!-- Lightbox slide content loaded here -->
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Focus trap and escape key
    overlay.querySelector('.sl-lightbox-close').focus();
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeLightbox();
    });
  }

  isMobile() {
    return window.innerWidth <= 768;
  }
}
```

### Implementation Priority

For our SCORM Content Studio, implement these player features in order:

| Priority | Feature | Complexity |
|----------|---------|-----------|
| P0 | Basic layout (topbar + content + controls) | Low |
| P0 | Prev/Next navigation | Low |
| P0 | Dark/Light theme toggle | Low |
| P0 | Keyboard shortcuts (Ctrl+Alt) | Low |
| P1 | Sidebar with menu panel | Medium |
| P1 | Seekbar with progress | Medium |
| P1 | Responsive mobile layout | Medium |
| P1 | Touch swipe gestures | Low |
| P1 | ARIA landmarks + focus management | Medium |
| P2 | Glossary panel | Medium |
| P2 | Notes panel | Low |
| P2 | Resources panel | Low |
| P2 | Closed captions | Medium |
| P2 | Volume controls | Low |
| P2 | Lightbox system | High |
| P3 | Dialog layers | Medium |
| P3 | Conditional seekbar | Medium |
| P3 | Circular seekbar (phone landscape) | High |
| P3 | Accessibility settings menu | Medium |
| P3 | Print slide functionality | Low |

---

## Sources

### Official Articulate Documentation
- [Storyline 360: The Modern Player](https://articulate.com/support/article/Storyline-360-Modern-Player)
- [Storyline 360: Modern Player-Only Features](https://access.articulate.com/support/article/Storyline-360-Modern-Player-Features)
- [Storyline 360: Choosing Player Features](https://community.articulate.com/kb/user-guides/storyline-360-choosing-player-features/1142414)
- [Storyline 360: Choosing a Player Style](https://community.articulate.com/kb/user-guides/storyline-360-choosing-a-player-style-modern-or-classic/1135906)
- [Storyline 360: Choosing Player Colors, Fonts, and Button Styles](https://community.articulate.com/kb/user-guides/storyline-360-choosing-player-colors-fonts-and-button-styles/1132005)
- [Storyline 360: Changing Browser Settings and Player Size](https://community.articulate.com/kb/user-guides/storyline-360-changing-the-browser-settings-and-player-size/1123150)
- [Storyline 360: How the Seekbar Behaves in the Responsive Player](https://access.articulate.com/support/article/How-the-Seekbar-Works-in-the-Responsive-Player)
- [Storyline 360: Accessible Player Controls](https://articulate.com/support/article/Storyline-360-Accessible-Player-Controls)
- [Storyline 360: Accessible Video Controls](https://articulate.com/support/article/Storyline-360-Accessible-Video-Controls)
- [Storyline 360: Modern Player Accessible Contrast](https://access.articulate.com/support/article/Storyline-360-Modern-Player-Accessible-Contrast)
- [Storyline 360: Modern Player Custom Color](https://access.articulate.com/support/article/Storyline-360-Modern-Player-Custom-Color)
- [Storyline 360: Adjustable Accessibility Settings](https://articulate.com/support/article/Storyline-360-Adjustable-Accessibility-Settings)
- [Storyline 360: Dialog Layers](https://articulate.com/support/article/Storyline-360-Dialog-Layers)

### Community & Technical Resources
- [Calculate Course Resolution Based on Features](https://www.swiftelearningservices.com/articulate-storyline-360-calculate-course-resolution-based-on-features-selected-player-size/)
- [Sidebar and Modern Player Controls](https://www.swiftelearningservices.com/how-to-utilize-the-sidebar-and-modern-player-controls-in-articulate-storyline-360/)
- [Changing the Default Storyline Player Style (CSS)](https://learningdojo.ninja/blog/adjusting-storyline-player-css.html)
- [JavaScript Tricks for Storyline 3/360](https://blog.elblearning.com/blog/javascript-tricks-articulate-storyline-3-360)
- [Hacking Storyline HTML5 Output](https://blog.elblearning.com/blog/webinar-hack-storylines-html5-output)
- [Introducing the Modern Player (Omniplex)](https://omniplexlearning.com/blog/introducing-the-modern-player-in-articulate-storyline-360/)
- [Modern Player in Action (CommLab)](https://www.commlabindia.com/blog/articulate-storyline-360-modern-player)
- [Storyline 360 Responsiveness Features](https://storylinetraining.com.au/storyline-360-responsiveness-features/)
- [HTML5 Gestures for Tablets and Smartphones](https://articulate.com/support/article/Articulate-Storyline-360-and-Studio-360-HTML5-Gestures-for-Tablets-and-Smartphones)
- [Responsive Mobile Player FAQs](https://articulate.com/support/article/Articulate-360-FAQs-Responsive-Player)
- [All About Lightboxes in Storyline 360](https://community.articulate.com/blog/articles/all-about-lightboxes-in-storyline-360/1100030)
- [Storyline Keyboard Shortcuts for Learners](https://elearninguncovered.com/2021/02/new-storyline-keyboard-shortcuts-for-your-learners/)
