# System Architecture Map

How all pieces in the SCORM Content Studio connect.

---

## 1. The HTML Contract

Every SCO page MUST follow this exact DOM structure. The CSS and JS engine
depend on these class names and nesting. Break this contract and nothing works.

```
.sco-container  (height:100vh, display:flex, flex-direction:column)
  |
  +-- header.nav-bar  (flex-shrink:0, 56px)
  |     Logo | Title | Points Badge
  |
  +-- main.sco-content  (flex:1, overflow:hidden)     <-- MANDATORY wrapper
  |     |
  |     +-- .slide  (position:absolute, inset:0)
  |           |
  |           +-- .slide-inner  (max-width:900px, centered)
  |                 |
  |                 +-- Actual slide content
  |
  +-- nav.sco-nav  (flex-shrink:0, 56px)
        Prev | 1/5 | Next
```

**Why `<main class="sco-content">` is mandatory:**
Without it, slides compete with the nav bar for vertical space. The flexbox
column layout gives `.sco-content` ALL remaining space between header and nav.
Slides use `position:absolute` to stack. Only the `.active` slide shows.
The nav has `flex-shrink:0` so it never gets pushed off-screen.

---

## 2. CSS Sandwich (3 layers)

```
Layer 1:  base.css           <-- COPY from resources/css/ (NEVER modify)
          player-shell.css   <-- COPY from resources/css/ (NEVER modify)

Layer 2:  theme.css          <-- COPY from art-direction/[course]_theme.css
          decorations.css    <-- COPY from art-direction/ (optional)

Layer 3:  course-custom.css  <-- WRITE fresh, ~50-100 lines max
```

**Load order in HTML (cascade matters):**
```html
<link rel="stylesheet" href="../shared/base.css">
<link rel="stylesheet" href="../shared/player-shell.css">
<link rel="stylesheet" href="../shared/theme.css">
<link rel="stylesheet" href="../shared/decorations.css">   <!-- optional -->
<link rel="stylesheet" href="../shared/course-custom.css">  <!-- tiny file -->
```

**Rules:**
- base.css is ~52KB with premium utilities (grain, glass, shadows, gradients, spring easing)
- theme.css is generated from `_tokens.json` during art direction (Phase 3)
- course-custom.css is the ONLY file written from scratch per course

---

## 3. Engine Dependencies

Which JS files depend on which HTML structures:

| JS File               | Required HTML                          | When to Include          |
|-----------------------|----------------------------------------|--------------------------|
| slide-controller.js   | `.sco-content > .slide[data-slide]`    | ALWAYS                   |
| quiz-engine.js        | `.quiz-container`, `.question`         | Quiz SCOs                |
| player-shell.js       | `.sco-container`, `.nav-bar`           | Full course player       |
| layer-system.js       | `.layer-overlay`                       | Feedback/overlay layers  |
| state-engine.js       | `[data-state]` attributes              | Complex interactions     |
| trigger-engine.js     | `[data-trigger]` attributes            | Declarative events       |
| variable-store.js     | n/a (pure data)                        | Variables/conditionals   |
| branching-engine.js   | `[data-branch]` attributes             | Adaptive courses         |
| question-bank.js      | `.quiz-container`                      | Randomized quizzes       |
| audio-player.js       | `<audio>`, `.audio-controls`           | Narrated courses         |
| captions.js           | `.caption-track`                       | Closed captions          |
| lightbox.js           | `[data-lightbox]`                      | Popup/modal slides       |
| interactivity-engine  | n/a (connects all above)               | Unified entry point      |
| sound-effects.js      | n/a (synthesized audio)                | Highly recommended       |
| confetti.js           | `<canvas>` (auto-created)              | Highly recommended       |
| achievement-system.js | `.achievement-popup` (auto-created)    | Highly recommended       |

---

## 4. Script Dependencies

Two scripts for visual generation (Phase 4):

| Script              | Output  | API             | When to Use                              |
|---------------------|---------|-----------------|------------------------------------------|
| `generate_svg.py`   | SVG     | Gemini 3.1 Pro  | PRIMARY -- icons, illustrations, patterns |
| `generate_image.py` | PNG/JPG | Placeholder/API | FALLBACK -- photos, complex raster images |

**generate_svg.py features:**
- Style presets: `line-icon`, `flat-fill`, `detailed`, `pattern`, `diagram`
- Use-case templates: `section-bg`, `card-icon`, `content-illustration`, `quiz-decoration`, `module-header`
- Prompt patterns: `simple`, `cinematic`, `isometric`
- Batch mode via JSON manifest (`--batch manifest.json`)
- Animated SVGs with CSS @keyframes (default ON, use `--no-animated` for static)
- Automatic placeholder fallback when API key is missing

**generate_image.py features:**
- Style presets: `professional`, `illustration`, `isometric`, `minimal`, `vibrant`, `technical`, `friendly`
- Placeholder generation via PIL when no API configured
- Template ready for DALL-E, Stability AI, Replicate, or local SD

---

## 5. File Flow Diagram

```
Phase 1-2: Interview + Design
  specs/[slug]_spec.md --------+
  specs/[slug]_structure.md ---+
                               |
Phase 3: Art Direction         v
  resources/theme-dna.md --> art-direction/[slug]_style.md
                             art-direction/[slug]_tokens.json
                             art-direction/[slug]_theme.css
                             art-direction/[slug]_decorations.css (optional)
                               |
Phase 4-6: Visuals + Animation + Assessment (parallel)
  scripts/generate_svg.py  --> output/[slug]/shared/assets/images/*.svg
  scripts/generate_image.py -> output/[slug]/shared/assets/images/*.png
  create-animated-video -----> output/[slug]/shared/assets/videos/
  references/assessment ----> output/[slug]/content/questions.json
                               |
Phase 7: Content Rendering     v
  resources/css/base.css ------> output/[slug]/shared/base.css        (COPY)
  resources/css/player-shell --> output/[slug]/shared/player-shell.css (COPY)
  art-direction/*_theme.css --> output/[slug]/shared/theme.css         (COPY)
  resources/engine/*.js ------> output/[slug]/shared/engine/           (COPY needed)
  resources/components/ ------> embedded in sco_*/index.html           (ADAPT)
  resources/icons/ -----------> output/[slug]/shared/assets/icons/     (COPY)
                               |
Phase 8: Packaging             v
  templates/scorm-1.2/ -------> output/[slug]/imsmanifest.xml
                                output/[slug]/*.xsd
                                output/[slug].zip  <-- FINAL DELIVERABLE
```

---

## 6. The Non-Negotiable Rules

Five rules that break everything if violated:

### Rule 1: Always wrap slides in `<main class="sco-content">`
Without this wrapper, the flexbox layout breaks and slides push the nav
bar off-screen. Every SCO must have this structure.

### Rule 2: Never inline styles on `.slide` elements
Inline styles override base.css layout rules and break the fixed viewport.
Use class names from base.css instead. No `style="display:flex; padding:48px;"`.

### Rule 3: Always use class names from base.css (not custom names)
The CSS and JS engine expect specific class names: `.sco-container`,
`.sco-content`, `.slide`, `.slide-inner`, `.sco-nav`, `.nav-bar`.
Using custom names like `.lesson-navigation` means base.css won't style them.

### Rule 4: Copy CSS/JS from resources/ (never rebuild)
The CSS sandwich exists to prevent rewriting 600+ lines per course.
COPY `base.css` and engine JS files. Only write `course-custom.css` fresh.

### Rule 5: Bundle fonts locally (never CDN)
SCORM packages must be self-contained and work offline inside any LMS.
Download fonts into `shared/assets/fonts/` and use `@font-face` in theme.css.
Never link to Google Fonts, Adobe Fonts, or any external CDN.
