# Storyline 360 File Structure & Technical Architecture

> Deep research into how Articulate Storyline 360 builds, structures, and delivers
> eLearning content — plus a comprehensive competitor comparison.

---

## 1. Published HTML5 Output — File & Folder Tree

When Storyline 360 publishes a course for LMS delivery, it generates a self-contained
package. Starting with build 3.35.20995.0, the output was simplified — separate
`story_html5.html` and `story_flash.html` files were consolidated into a single
`story.html` entry point.

### Typical SCORM Package Structure

```
course-package/
├── story.html                  ← Main entry point (bootstraps the player)
├── index_lms.html              ← LMS launch file (loads story.html in iframe)
├── meta.xml                    ← Course metadata
├── imsmanifest.xml             ← SCORM manifest (resources, organizations)
│
├── story_content/              ← Course-specific content
│   ├── user.js                 ← All custom JavaScript triggers (Script1, Script2…)
│   ├── frame.xml               ← Asset manifest — all asset names/paths parsed by runtime
│   ├── frame.json              ← Generated during publish (internal use, safe to remove)
│   ├── data.xml                ← Slide/scene structure data
│   ├── slides/                 ← Individual slide data and assets
│   │   ├── slide1.xml
│   │   ├── slide2.xml
│   │   └── …
│   └── thumbnails/             ← Slide thumbnail images
│
├── html5/                      ← HTML5 runtime engine
│   └── lib/
│       ├── scripts/
│       │   ├── storyline_compiled.js   ← Core runtime (parses frame.xml, runs slides)
│       │   ├── app.js                  ← Application bootstrap
│       │   └── vendor/                 ← jQuery (pre-bundled), utilities
│       ├── stylesheets/
│       │   ├── desktop.min.css         ← Player + slide styles (Base64-encoded assets)
│       │   └── mobile.min.css          ← Mobile-optimized styles
│       └── fonts/                      ← Bundled web fonts
│
├── mobile/                     ← Mobile-optimized output
│   ├── data.js                 ← HTML5 slide data (JS format for mobile)
│   ├── storyline_compiled.js   ← Mobile-specific runtime
│   └── images/                 ← Mobile-optimized images
│
├── lms/                        ← SCORM communication layer
│   ├── lmsAPI.js               ← LMS API wrapper
│   ├── SCORMFunctions.js       ← SCORM-specific calls (Initialize, GetValue, SetValue)
│   └── API_1484_11.js          ← SCORM 2004 API (if applicable)
│
└── assets/                     ← Media files
    ├── images/                 ← Course images (PNG, JPG, SVG)
    ├── audio/                  ← Audio narration files
    ├── video/                  ← Video files
    └── fonts/                  ← Custom fonts
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `story.html` | Single HTML entry point. Bootstraps the player, loads runtime JS |
| `index_lms.html` | LMS launcher. Creates iframe to story.html, initializes SCORM API |
| `story_content/user.js` | Every JavaScript trigger becomes a function (Script1, Script2…) |
| `story_content/frame.xml` | Asset manifest — parsed by `storyline_compiled.js` at runtime |
| `story_content/data.xml` | Scene/slide structure, navigation order, branching rules |
| `html5/lib/scripts/storyline_compiled.js` | Core runtime engine — renders slides, manages state |
| `mobile/data.js` | Slide data in JS format for mobile rendering |
| `lms/lmsAPI.js` | SCORM wrapper — handles LMSInitialize, LMSGetValue, LMSSetValue |
| `lms/SCORMFunctions.js` | SCORM-specific functions including objective tracking |

---

## 2. How story.html Bootstraps the Course

```
Browser loads index_lms.html
    │
    ├── Detects SCORM API (scans parent/opener window frames)
    ├── Calls LMSInitialize("")
    │
    └── Loads story.html in iframe
         │
         ├── Loads html5/lib/scripts/storyline_compiled.js
         ├── Parses story_content/frame.xml (asset manifest)
         ├── Parses story_content/data.xml (slide structure)
         │
         ├── Builds player chrome (sidebar, progress, controls)
         ├── Preloads first 3 slides (images → audio → video)
         │
         └── Renders Slide 1
              ├── Injects HTML/SVG/Canvas elements
              ├── Applies CSS animations
              ├── Executes timeline triggers
              └── Runs user.js Script functions
```

### Slide Loading Strategy

- **Preloads next 3 slides** — Storyline anticipates where learners go based on
  Story View order. Assets download in priority: images first, then audio, then video.
- **Dynamic rendering** — Slides are NOT static HTML pages. They are dynamically
  constructed from XML data + assets by the JavaScript runtime.
- **Canvas-based rendering** — Slide elements render in `<canvas>` tags with
  dynamically generated names. Direct DOM targeting is difficult; use `aria-label`
  attributes instead of CSS selectors.
- **No iframes per slide** — Everything renders in the same document context
  (unlike some competitors that use iframe-per-page).

---

## 3. CSS Architecture

Storyline's CSS architecture is **generated, not authored**:

- **No external stylesheets for content** — Slide-level styles are inline or
  generated dynamically by the runtime from XML data
- **Player styles** in `html5/lib/stylesheets/desktop.min.css` and `mobile.min.css`
  — these control the player chrome (sidebar, progress bar, buttons)
- **Base64-encoded assets** — Some assets are embedded directly in CSS files
  to reduce HTTP requests
- **Minified and obfuscated** — CSS files are production-built, not human-readable
- **No CSS custom properties** — Storyline doesn't use CSS variables; all values
  are baked in at publish time

### Font Loading Strategy

- Fonts are **bundled locally** in the output package (no CDN dependency)
- The player uses system fonts as fallback
- No explicit FOUT/FOIT handling strategy documented — relies on browser defaults
- Custom fonts imported in Storyline are embedded in the published output

---

## 4. What Makes Storyline Feel Like an App

### Smooth Transitions

- **17 built-in transitions**: fade, push, circle, box, cover, dissolve, clock, zoom, etc.
- Transitions are rendered by the JavaScript runtime (not CSS animations)
- Duration is configurable (typically 0.5–1.5 seconds)
- Layer transitions (overlays) use the same system

### Preloading & Performance

- **3-slide lookahead** preloader prevents loading delays
- Asset priority: images → audio → video
- A loading spinner appears if the next slide isn't ready
- Custom preloader CSS is configurable

### Responsive Scaling

- **Player scales to fill browser window** (default behavior)
- Content maintains aspect ratio — no stretching or layout breaks
- The player has **5 responsive layouts** based on device:
  - Desktop: Full chrome (sidebars, menu, resources)
  - Tablet landscape: Reduced chrome
  - Tablet portrait: Minimal sidebar
  - Phone landscape: Bottom controls only
  - Phone portrait: Minimal controls
- Player adds up to **260px width + 118px height** for chrome on desktop
- On mobile, browser always fills screen; player adapts

### Window Resize Handling

- Player responds to `resize` events
- Content area recalculates maintaining aspect ratio
- Chrome elements collapse/expand based on available space
- No layout breaks during resize (content area is proportionally scaled)

### Professional "App" Feel

| Feature | How Storyline Achieves It |
|---------|--------------------------|
| Consistent frame | Player chrome wraps content like a native app shell |
| No page loads | Dynamic rendering — no visible navigation between pages |
| Preloading | Next slides load before user needs them |
| Sound effects | Built-in audio engine for narration and sound effects |
| Hover states | CSS pseudo-states on buttons and interactive elements |
| Drag-and-drop | HTML5 drag API with visual feedback |
| Animation timeline | Frame-by-frame animation engine tied to slide timeline |

---

## 5. SCORM Communication Architecture

### SCORM 1.2 Data Model

```
cmi.core.lesson_status    ← completed / incomplete / passed / failed
cmi.core.score.raw        ← Numeric score (0-100)
cmi.core.lesson_location  ← Bookmark (slide ID)
cmi.suspend_data          ← State data (4,096 char limit in SCORM 1.2)
cmi.core.session_time     ← Time spent in current session
cmi.interactions.n.*      ← Individual question responses
```

### SCORM 2004 Data Model

```
cmi.completion_status     ← completed / incomplete / not attempted
cmi.success_status        ← passed / failed / unknown
cmi.score.scaled          ← Score as decimal (-1 to 1)
cmi.location              ← Bookmark
cmi.suspend_data          ← State data (64,000 char limit)
cmi.session_time          ← Session duration (ISO 8601)
cmi.interactions.n.*      ← Question-level tracking
```

### How Storyline Uses suspend_data

- Stores **bookmark position** (current slide)
- Stores **variable values** (all Storyline variables)
- Stores **button/object states** (visited, disabled, etc.)
- **SCORM 1.2 limit**: 4,096 characters — complex courses can exceed this
- **SCORM 2004 limit**: 64,000 characters — much safer for rich courses
- **Conflict warning**: Custom JS should NOT write to `suspend_data` directly
  as it conflicts with Storyline's internal bookmark storage

### Tracking Approach

- First tracking trigger reached is submitted to LMS (important for branching)
- Quiz results reported via `cmi.interactions.n.*` for question-level data
- Completion can be set by: slide viewed, quiz passed, or custom trigger

---

## 6. Typical File Sizes

| Course Type | Slides | Audio | Video | Package Size |
|------------|--------|-------|-------|-------------|
| Simple (text + images) | 15–20 | None | None | 5–15 MB |
| Standard (images + audio) | 30–50 | Yes | None | 20–50 MB |
| Rich media (full multimedia) | 50–80 | Yes | Yes | 50–150 MB |
| Complex simulation | 80–150 | Yes | Yes | 150–350 MB |

### Size Optimization Notes

- **Image scaling change (v3.63+)**: Images are no longer scaled during
  publishing — browser handles scaling. This can increase package size
  (small images can jump from 50–100 KB to 2+ MB).
- **Optimization strategies**: Compress images before import, adjust video/audio
  compression in publish settings, use Multi-SCO for very large courses.
- **LMS limits**: Some LMS platforms cap uploads at 50 MB (SCORM 1.2) or
  500 MB (SCORM 2004). Check your LMS before publishing.

---

## 7. Mobile vs. Desktop Output Differences

| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Entry file | `story.html` | Same file, mobile detection |
| Runtime | `html5/lib/scripts/storyline_compiled.js` | `mobile/storyline_compiled.js` |
| Data format | XML-based (`frame.xml`, `data.xml`) | JS-based (`mobile/data.js`) |
| Images | Full resolution | Optimized for mobile in `mobile/images/` |
| Player chrome | Full sidebar, menu, seekbar, resources | Minimal bottom controls |
| Transitions | All 17 available | Simplified for performance |
| Touch support | Mouse events | Touch events + gestures |
| Scaling | Scales to browser window | Fills device screen |

---

## 8. Competitor Comparison

### Overview Matrix

| Feature | Storyline 360 | Rise 360 | Adobe Captivate | iSpring Suite | Lectora | Evolve | Elucidat |
|---------|---------------|----------|-----------------|---------------|---------|--------|----------|
| **Authoring Model** | Slide-based (PowerPoint-like) | Block-based (web page) | Slide-based (timeline) | PowerPoint conversion | Page-based (flexible) | Block-based (cloud) | Block-based (cloud) |
| **Responsive** | Player scales only (content fixed) | Fully responsive (content reflows) | Fluid Boxes (true responsive) | Scales with PPT | Device profiles (3 layouts) | Fully responsive | Fully responsive |
| **SCORM Support** | 1.2, 2004, xAPI | 1.2, 2004, xAPI | 1.2, 2004, xAPI | 1.2, 2004, xAPI, cmi5, AICC | 1.2, 2004, xAPI, AICC, cmi5 | SCORM, xAPI | SCORM, xAPI |
| **Accessibility** | WCAG 2.1 AA (manual effort) | WCAG 2.1 AA (built-in) | WCAG 2.1 AA (manual) | WCAG support | WCAG 2.1 AA + EN 301 549 | WCAG-aware components | WCAG 2.1 A guidance |
| **VR/360** | No | No | Yes (360 images, VR headsets) | No | No | No | No |
| **Collaboration** | Desktop only (no real-time collab) | Cloud + real-time collab | Desktop (limited collab) | Desktop only | Desktop + Online versions | Cloud + joint editing | Cloud + real-time collab |
| **Output** | HTML5 (single app) | HTML5 (scrollable web) | HTML5 (app-like) | HTML5 (PPT-faithful) | HTML5 (page-based) | HTML5 (responsive web) | HTML5 (responsive web) |
| **Learning Curve** | Medium (PPT users adapt fast) | Low (web content builder) | High (complex interface) | Very Low (it IS PowerPoint) | Medium-High | Low-Medium | Low |
| **Interactions** | 25+ types (deepest library) | 15+ block types | 20+ types + VR | PPT-based + iSpring extras | 20+ types | 50+ building blocks | 20+ types |
| **Pricing** | ~$1,399/yr (Articulate 360) | Included with Articulate 360 | ~$33.99/mo (Adobe CC) | ~$770/yr | ~$1,299/yr (Desktop) | Custom pricing | Custom pricing |
| **AI Features (2025)** | Limited | AI text generation | AI content, voice, avatar | TTS, translation | Limited | Some | Some |

### Detailed Competitor Analysis

#### Articulate Rise 360

**Architecture**: Web-based, block-stacking model. Courses are long-scroll web pages
with blocks for text, media, interactions, and knowledge checks.

**Lesson Types**:
- Block lessons (custom stacking)
- Lesson templates (pre-built business topics)
- Quiz lessons (graded assessments)
- Storyline blocks (embed Storyline interactions)

**Block Categories**:
- Text (paragraph, heading, multi-column, tables)
- Statement (4 styled statement blocks + note)
- Quote (multiple styles + carousel)
- List (numbered, checkbox, bulleted)
- Image & Gallery (multiple layouts)
- Multimedia (video, audio, embed)
- Interactive (accordion, tabs, flashcard, button, labeled graphic, sorting, timeline, process, scenario)
- Knowledge Check (multiple choice, multiple response, fill-in-blank, matching)
- Chart (bar, line, pie)
- Divider (section breaks)

**Strengths**: Inherently responsive, beautiful default design, very fast to author,
cloud-based collaboration. Excellent for compliance and onboarding content.

**Weaknesses**: Limited customization, no custom JavaScript, can't create complex
branching or simulations, all courses look similar.

**Best for AI generation**: YES — block-based structure maps perfectly to AI output.
Each block is a self-contained unit with clear data requirements.

---

#### Adobe Captivate (2024)

**Architecture**: Slide-based with timeline, similar to Storyline but with Adobe's
design language. Uses Fluid Boxes for responsive layout.

**Responsive Approach**:
- **Fluid Boxes**: Container system that automatically arranges objects
- Objects resize and reflow based on screen size
- Breakpoint views for customizing per device
- True responsive content (not just player scaling)

**Unique Features**:
- VR/360 projects (360-degree images with hotspots)
- Software simulation (auto-capture screen actions)
- Fluid Boxes for genuine responsive design
- Adobe ecosystem integration (Photoshop, Illustrator)

**Upcoming (2025 roadmap)**:
- Web-based Captivate
- AI-generated eLearning content
- AI voice and text-to-avatar
- PowerPoint import to new Captivate

**Strengths**: Best responsive design (Fluid Boxes), VR capabilities, software
simulation capture, Adobe ecosystem.

**Weaknesses**: Steep learning curve, expensive with CC subscription, new version
still missing some Classic features (including 360 slides), smaller community.

**Best for AI generation**: MODERATE — complex interface makes automation harder,
but Fluid Boxes concept is valuable for responsive AI output.

---

#### iSpring Suite

**Architecture**: PowerPoint add-in. Courses start as PowerPoint files and get
published to HTML5 using iSpring's HyperPoint technology.

**Key Approach**:
- Works INSIDE PowerPoint (not a separate app)
- HyperPoint engine converts PPT → HTML5 with high fidelity
- Animations, transitions, narrations preserved
- Resources folder generated alongside PPT file

**Unique Features**:
- Video narration studio (webcam + slides)
- Dialogue simulations (branching conversations)
- Long reads (article-style content)
- TTS (text-to-speech) voices
- 87,000+ asset library

**Strengths**: Lowest learning curve (if you know PowerPoint), excellent video
integration, good value ($770/yr), high-fidelity PPT conversion.

**Weaknesses**: Limited to what PowerPoint can do, less interactive than Storyline,
desktop-only, responsive is "scaling" not "reflowing."

**Best for AI generation**: YES — PowerPoint is a well-understood format that AI
can generate. The PPT → SCORM pipeline is straightforward.

---

#### Lectora (ELB Learning)

**Architecture**: Page-based with full HTML control. Most flexible architecture —
you can modify the underlying HTML/CSS directly.

**Responsive Approach**:
- **Device Profiles**: 3 separate layouts (desktop, tablet, phone)
- Manual control over what shows on each device
- Not automatic reflow — author controls each breakpoint
- Most granular control of any tool

**Unique Features**:
- Direct HTML/CSS access
- Variables with inheritance (parent → child)
- Conditional actions with complex logic
- Desktop + Online versions
- Strongest WCAG compliance built-in (reading order, focus, captions)
- Course starters pre-built for accessibility

**Strengths**: Most flexible architecture, best accessibility support, variable
inheritance system, direct code access, Desktop + Online versions.

**Weaknesses**: Steeper learning curve, less modern UI, smaller community than
Articulate, device profiles require more manual work.

**Best for AI generation**: YES — direct HTML/CSS access means AI-generated code
can be injected directly. Most "code-friendly" of all tools.

---

#### Evolve (Intellum)

**Architecture**: Cloud-based, block-stacking. Similar philosophy to Rise 360
but with more customization.

**Key Approach**:
- 50+ "Evolve Interactions" (building blocks)
- Cloud-based with joint editing
- Responsive by default
- SCORM/xAPI output

**Block Types Include**:
- Flip cards, carousels, flow charts
- Sliders, responsive tables
- Interactive and embedded video
- Hotspots, accordions, tabs
- Knowledge checks, assessments

**Unique Features**:
- 50+ interaction types (more than Rise)
- Custom CSS/branding support
- Version control built-in
- Commenting system for review

**Strengths**: Rich interaction library, collaborative, responsive by default,
more customizable than Rise.

**Weaknesses**: Custom pricing (can be expensive), smaller market presence,
tied to Intellum platform.

**Best for AI generation**: YES — block-based structure is ideal for AI.
Similar to Rise but with more interaction variety.

---

#### Elucidat

**Architecture**: Cloud-based, template-driven with adaptive design. Built for
enterprise scale.

**Key Approach**:
- Template-driven authoring
- Adaptive design (auto mobile-friendly)
- Governance features (brand control, permissions)
- Auto-translate (75 languages)

**Unique Features**:
- People management (roles, permissions, brand guidelines)
- Personalization (learner-adaptive content)
- Mass localization (translate at scale)
- Analytics dashboard
- Learning impact measurement

**Strengths**: Best for enterprise scale, governance/brand control, localization,
collaboration features, analytics.

**Weaknesses**: Custom pricing (enterprise-focused), less interaction depth than
Storyline, template-dependent.

**Best for AI generation**: MODERATE — template-driven approach could work with AI
but governance features add complexity.

---

### Which Approach Works Best for AI-Generated Content?

| Approach | AI Compatibility | Why |
|----------|-----------------|-----|
| **Block-based (Rise, Evolve)** | EXCELLENT | Each block is a discrete, well-defined data unit. AI generates structured data → blocks render it. |
| **Slide-based with code access (Lectora)** | EXCELLENT | AI generates HTML/CSS/JS directly. Full control over output. |
| **PowerPoint-based (iSpring)** | GOOD | AI generates PPTX (well-documented format) → iSpring converts to SCORM. |
| **Custom HTML/CSS/JS (our approach)** | BEST | Full control. No proprietary format limitations. AI generates exactly what's needed. |
| **Slide-based proprietary (Storyline)** | POOR | Proprietary .story format can't be generated by AI. Must use their authoring tool. |
| **Slide-based proprietary (Captivate)** | POOR | Similar to Storyline — proprietary format, can't automate. |

### Key Insight for SCORM Content Studio

Our approach (AI-generated HTML/CSS/JS) has significant advantages:

1. **No proprietary format lock-in** — We generate standard web technologies
2. **Full design control** — We can implement any visual design, not just template options
3. **Unlimited interactions** — We can build any interaction type, not limited to a pre-built library
4. **True responsive** — We control the CSS, so we can implement real responsive design
5. **AI-native** — The entire pipeline is designed for AI generation from the ground up
6. **Cost** — No per-seat licensing for an authoring tool

**What we should learn from competitors**:
- **From Storyline**: Slide preloading (3-slide lookahead), consistent player chrome,
  smooth transitions, canvas-based rendering for complex visuals
- **From Rise**: Block-based content structure, inherent responsiveness,
  clean scrollable design
- **From Captivate**: Fluid Boxes responsive concept, VR/360 potential
- **From iSpring**: Video narration integration, high-fidelity conversion
- **From Lectora**: Accessibility-first approach, variable inheritance, device profiles
- **From Evolve**: 50+ interaction components as inspiration for our component library
- **From Elucidat**: Enterprise governance, localization, analytics

---

## 9. Architecture Comparison Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    AUTHORING TOOL ARCHITECTURES                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SLIDE-BASED (Desktop Apps)          BLOCK-BASED (Cloud Apps)    │
│  ┌─────────────────────┐             ┌─────────────────────┐     │
│  │  Storyline 360      │             │  Rise 360           │     │
│  │  ┌───┐┌───┐┌───┐   │             │  ┌─────────────┐    │     │
│  │  │ S1││ S2││ S3│   │             │  │ Text Block   │    │     │
│  │  └───┘└───┘└───┘   │             │  ├─────────────┤    │     │
│  │  Timeline + Layers  │             │  │ Image Block  │    │     │
│  │  Triggers + States  │             │  ├─────────────┤    │     │
│  │  → Proprietary .story│            │  │ Quiz Block   │    │     │
│  └─────────────────────┘             │  └─────────────┘    │     │
│                                      │  → Responsive HTML5  │     │
│  ┌─────────────────────┐             └─────────────────────┘     │
│  │  Adobe Captivate    │                                         │
│  │  ┌───┐┌───┐┌───┐   │             ┌─────────────────────┐     │
│  │  │ S1││ S2││ S3│   │             │  Evolve             │     │
│  │  └───┘└───┘└───┘   │             │  50+ Interaction    │     │
│  │  Fluid Boxes        │             │  Blocks             │     │
│  │  → Responsive        │             │  → Responsive HTML5  │     │
│  └─────────────────────┘             └─────────────────────┘     │
│                                                                  │
│  PPT-BASED                           TEMPLATE-DRIVEN             │
│  ┌─────────────────────┐             ┌─────────────────────┐     │
│  │  iSpring Suite      │             │  Elucidat           │     │
│  │  PowerPoint + Add-in│             │  Templates +        │     │
│  │  HyperPoint Engine  │             │  Governance         │     │
│  │  → HTML5 (scaled)    │             │  → Responsive HTML5  │     │
│  └─────────────────────┘             └─────────────────────┘     │
│                                                                  │
│  PAGE-BASED (Hybrid)                 AI-NATIVE (Our Approach)    │
│  ┌─────────────────────┐             ┌─────────────────────┐     │
│  │  Lectora            │             │  SCORM Content       │     │
│  │  HTML + CSS direct  │             │  Studio              │     │
│  │  Device Profiles    │             │  AI Agents generate  │     │
│  │  Variable Inheritance│             │  HTML/CSS/JS directly│     │
│  │  → Responsive HTML5  │             │  Theme System        │     │
│  └─────────────────────┘             │  → Full SCORM pkg    │     │
│                                      └─────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 10. Storyline's Runtime Architecture (Deep Dive)

```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER WINDOW                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  index_lms.html (LMS launcher)                        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  SCORM API Detection                            │  │  │
│  │  │  Scans: parent.API → parent.parent.API → …      │  │  │
│  │  │  Calls: LMSInitialize("")                       │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  story.html (in iframe)                         │  │  │
│  │  │                                                 │  │  │
│  │  │  ┌──────────┐  ┌──────────────────────────┐    │  │  │
│  │  │  │ Player   │  │  Content Area             │    │  │  │
│  │  │  │ Chrome   │  │  ┌────────────────────┐   │    │  │  │
│  │  │  │          │  │  │ Active Slide       │   │    │  │  │
│  │  │  │ • Menu   │  │  │ (canvas/SVG/HTML)  │   │    │  │  │
│  │  │  │ • Seekbar│  │  │                    │   │    │  │  │
│  │  │  │ • Notes  │  │  │ + Slide Layers     │   │    │  │  │
│  │  │  │ • Prev   │  │  │ (overlays)         │   │    │  │  │
│  │  │  │ • Next   │  │  └────────────────────┘   │    │  │  │
│  │  │  │ • Volume │  │                           │    │  │  │
│  │  │  └──────────┘  └──────────────────────────┘    │  │  │
│  │  │                                                 │  │  │
│  │  │  Runtime: storyline_compiled.js                  │  │  │
│  │  │  Data: frame.xml + data.xml                     │  │  │
│  │  │  User code: user.js                             │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Runtime Objects (JavaScript API)

```javascript
// Global player object
var player = GetPlayer();

// Get/Set Storyline variables
player.GetVar("variableName");
player.SetVar("variableName", value);

// Global DS object (presentation control)
DS.presentation.getFlatSlides();   // Get all slides
DS.presentation.currentSlide;      // Current slide reference

// jQuery is pre-bundled (no need to load)
$('.slide-element').css('color', 'red');

// SCORM communication
// (handled internally, but accessible via lmsAPI)
```

---

## 11. Lessons for SCORM Content Studio

### What We Should Adopt

1. **3-Slide Preloading**: Implement progressive loading — while the learner
   views Slide N, preload assets for N+1, N+2, N+3.

2. **Consistent Player Chrome**: Wrap all content in a consistent navigation
   shell. This is what makes Storyline feel "app-like" vs "web page-like."

3. **Transition System**: Build smooth slide-to-slide transitions (fade, push,
   zoom). Even simple fade transitions dramatically improve perceived quality.

4. **State Persistence**: Use suspend_data intelligently — store bookmark,
   variables, interaction states, and completion data.

5. **Asset Manifest**: Consider an assets manifest (like frame.xml) that
   catalogs all resources for efficient loading.

6. **Canvas for Complex Visuals**: For simulations and complex interactions,
   canvas rendering provides better performance than DOM manipulation.

### What We Already Do Better

1. **No proprietary format** — Our HTML/CSS/JS output is standard web tech
2. **True responsive design** — Our CSS handles responsive, not just scaling
3. **Theme system** — Our 3-layer CSS is more maintainable than generated styles
4. **Behavioral tracking** — Our BehaviorTracker goes far beyond SCORM basics
5. **Gamification** — Points, progress, celebrations — Storyline doesn't have this
6. **Accessibility** — We bake in WCAG from the start, not as an afterthought
7. **AI-native** — Our pipeline is designed for AI generation

### What to Build Next (Inspired by Competitors)

| Feature | Inspired By | Priority |
|---------|------------|----------|
| Slide preloading system | Storyline | HIGH |
| Player chrome shell | Storyline | HIGH |
| Transition engine | Storyline | HIGH |
| Block-based content model | Rise / Evolve | MEDIUM |
| Fluid responsive containers | Captivate | MEDIUM |
| Video narration support | iSpring | MEDIUM |
| Device-specific layouts | Lectora | LOW |
| Enterprise governance | Elucidat | LOW |
| VR/360 content | Captivate | LOW |

---

## Sources

- [Articulate Support: How Content Is Preloaded in Storyline](https://articulate.com/support/article/how-content-is-preloaded-in-storyline)
- [Articulate Support: Simplified Output Folder Names](https://articulate.com/support/article/Storyline-360-Simplified-Output-Folder-Names)
- [Articulate Support: Browser Settings and Player Size](https://community.articulate.com/articles/articulate-storyline-360-user-guide-how-to-change-the-browser-settings-and-player-size)
- [Articulate Support: JavaScript Best Practices](https://articulate.com/support/article/Articulate-Storyline-360-JavaScript-Best-Practices-and-Examples)
- [Articulate Support: SVG Support](https://articulate.com/support/article/Storyline-360-SVG-Support)
- [Articulate Support: Slide Transitions](https://community.articulate.com/kb/user-guide-series/storyline-360-applying-animations-and-slide-transitions/1193808)
- [Articulate 360 FAQs: Responsive Player](https://articulate.com/support/article/Articulate-360-FAQs-Responsive-Player)
- [Articulate Support: Rise Lesson and Block Types](https://articulate.com/support/article/Rise-Lesson-and-Block-Types)
- [ELB Learning: How to Hack Storyline's HTML5 Output](https://blog.elblearning.com/blog/webinar-hack-storylines-html5-output)
- [eLearning Company: Storyline vs Captivate 2025](https://elearning.company/blog/storyline-vs-captivate-features-articulate-storyline-adobe-captivate-compared/)
- [Adobe: Captivate Fluid Boxes](https://helpx.adobe.com/captivate/classic/responsive-project.html)
- [Adobe eLearning: Captivate Roadmap 2025](https://elearning.adobe.com/2024/07/new-captivate-roadmap/)
- [iSpring: SCORM Authoring Tools 2026](https://www.ispringsolutions.com/blog/scorm-software)
- [iSpring: Suite vs Elucidat](https://www.ispringsolutions.com/blog/ispring-suite-vs-elucidat)
- [Intellum: Evolve Features](https://www.intellum.com/platform/evolve)
- [Elucidat: Review vs Evolve](https://www.elucidat.com/blog/review-elucidat-vs-evolve/)
- [Lectora: Product Features](https://products.elblearning.com/create-learning/lectora-features)
- [SkyWork: iSpring vs Competitors AI Comparison](https://skywork.ai/blog/ispring-suite-vs-articulate-360-captivate-elucidat-skywork-ai-comparison/)
- [Community: Reducing SCORM Package File Size](https://community.articulate.com/discussions/articulate-storyline/reducing-scorm-package-file-size)
- [Community: Storyline 360 Suspend Data Handling](https://community.articulate.com/discussions/articulate-storyline/storyline-360-suspend-data-handling)
- [Community: Frame.json file](https://community.articulate.com/discussions/articulate-storyline/frame-json-file)
