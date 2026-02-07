# Visual Style Guide: Computational Thinking (التفكير الحاسوبي)

## 1. Design Concept

### Theme Statement

This course lives inside a code editor. The visual language draws directly from the IDE experience that CS students already know and love -- dark surfaces layered with glowing syntax-highlighted accents, monospace headings that feel like file tabs, and subtle dot-grid backgrounds that evoke digital graph paper. Every visual decision reinforces the idea that the learner is not just studying computational thinking, they are *inside* a computational environment. The dark palette reduces eye strain during long study sessions while the high-contrast accent colors (cyan for keywords, green for success, orange for functions, violet for types) create an immediate visual language that maps to programming concepts. Arabic text is treated with equal care: Noto Kufi Arabic's geometric Kufic letterforms complement the angular monospace aesthetic, while Cairo provides warm readability for body paragraphs.

### Keywords

Precise, Terminal, Algorithmic, Focused, Hacker-Cool

### Visual Metaphor

**The IDE as Learning Space** -- The entire course interface is modeled on a modern code editor (think VS Code Dark+). Lessons are "files," modules are "workspaces," quiz questions are "test cases," and correct answers are "tests passing." This metaphor makes the abstract concept of computational thinking feel native to the tools students will use throughout their careers.

---

## 2. Color Palette

### Primary Colors

| Role | Color | Hex | RGB | Usage |
|------|-------|-----|-----|-------|
| Primary (Keyword Cyan) | Electric Cyan | #22D3EE | rgb(34, 211, 238) | Headers, buttons, key interactive elements, links |
| Secondary (Type Violet) | Soft Violet | #A78BFA | rgb(167, 139, 250) | Secondary headings, data type highlights, inactive tabs |
| Accent (String Green) | Emerald | #34D399 | rgb(52, 211, 153) | Success states, progress, points, string-value callouts |

### Extended Syntax Colors

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Function Orange | Warm Amber | #F59E0B | Function names, interactive hotspots, CTA secondary |
| Comment Gray | Slate Comment | #6B7280 | Code comments, disabled text, placeholder |
| Number Blue | Sky Blue | #60A5FA | Numeric values, counters, quiz numbering |
| Operator White | Bright White | #F8FAFC | Operators, critical emphasis |

### Neutral Colors (Dark Surface Stack)

| Role | Hex | Usage |
|------|-----|-------|
| Background (Editor BG) | #0B1120 | Page background -- deepest layer |
| Surface (Panel) | #141B2D | Cards, content panels, sidebar |
| Surface Elevated (Active Tab) | #1E293B | Active elements, elevated cards, hover states |
| Surface Highlight | #2A3650 | Hover backgrounds, selected rows |
| Text Primary | #E2E8F0 | Body text, headings |
| Text Secondary | #94A3B8 | Captions, labels, secondary info |
| Text Muted | #64748B | Hints, metadata, line numbers |
| Border | #1E293B | Card borders, dividers |
| Border Highlight | #334155 | Active borders, focus rings |

### Semantic Colors

| Role | Hex | Background Variant | Usage |
|------|-----|--------------------|-------|
| Success | #34D399 | rgba(52, 211, 153, 0.12) | Correct answers, "tests passing," completion |
| Warning | #FBBF24 | rgba(251, 191, 36, 0.12) | Cautions, edge cases, "gotchas" |
| Error | #FB7185 | rgba(251, 113, 133, 0.12) | Incorrect answers, "build failed" |
| Info | #60A5FA | rgba(96, 165, 250, 0.12) | Tips, documentation notes, hints |
| Growth | #A78BFA | rgba(167, 139, 250, 0.12) | Growth mindset feedback, "refactoring" |

### Accessibility Check

- Primary (#22D3EE) on background (#0B1120): 10.2:1 -- PASSES AAA
- Text primary (#E2E8F0) on background (#0B1120): 13.4:1 -- PASSES AAA
- Text primary (#E2E8F0) on surface (#141B2D): 11.2:1 -- PASSES AAA
- Text secondary (#94A3B8) on background (#0B1120): 5.8:1 -- PASSES AA
- Text secondary (#94A3B8) on surface (#141B2D): 4.9:1 -- PASSES AA
- Error (#FB7185) on background (#0B1120): 6.3:1 -- PASSES AA
- All interactive element combinations meet WCAG 2.1 AA minimum (4.5:1)

---

## 3. Typography

### Font Stack

**Headings (English):** JetBrains Mono
- Source: Bundled locally (self-contained, no CDN)
- Weights: 400 (regular), 700 (bold)
- Fallback: 'Fira Code', 'Cascadia Code', monospace
- Letter-spacing: -0.02em (tightened for display sizes)
- Character: Geometric monospace with distinctive ligatures -- feels like a premium IDE

**Body (English):** IBM Plex Sans
- Source: Bundled locally
- Weights: 400 (regular), 500 (medium), 600 (semibold)
- Fallback: 'DM Sans', system-ui, sans-serif
- Character: Technical but readable -- IBM's type system has engineering DNA

**Code/Mono:** JetBrains Mono
- Source: Same as headings (shared file)
- Weights: 400
- Fallback: 'Fira Code', monospace
- Features: Ligatures enabled (!=, =>, <=, >=, -->, etc.)

### Arabic Typography

**Arabic Headings:** Noto Kufi Arabic
- Source: Bundled locally
- Weights: 700 (bold)
- Character: Geometric Kufic letterforms that harmonize with monospace English
- Line height: 1.4 (headings)

**Arabic Body:** Cairo
- Source: Bundled locally
- Weights: 400 (regular), 600 (semibold)
- Character: Excellent Arabic readability, modern geometric design
- Line height: 1.8 (body text -- extra space for Arabic diacritics)
- Minimum size: 18px (NELC compliance)

**Direction:** RTL for Arabic sections with `dir="rtl"` and `lang="ar"`

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Notes |
|---------|------|--------|-------------|----------------|-------|
| Display | 36px / 2.25rem | 700 | 1.15 | -0.03em | Course title, hero text |
| H1 | 30px / 1.875rem | 700 | 1.2 | -0.02em | Lesson titles |
| H2 | 24px / 1.5rem | 600 | 1.3 | -0.02em | Section headers |
| H3 | 20px / 1.25rem | 600 | 1.35 | -0.01em | Subsection headers |
| H4 | 16px / 1rem | 600 | 1.4 | 0 | Detail headings |
| Body | 16px / 1rem | 400 | 1.6 | 0 | Content paragraphs |
| Body Arabic | 18px / 1.125rem | 400 | 1.8 | 0 | Arabic body text (NELC min) |
| Caption | 14px / 0.875rem | 400 | 1.5 | 0.01em | Labels, metadata |
| Small/Code | 14px / 0.875rem | 400 | 1.6 | 0 | Inline code, line numbers |
| Overline | 11px / 0.688rem | 700 | 1.2 | 0.1em | Section labels (uppercase) |

---

## 4. Visual Style

### Imagery Style

**Primary Style:** SVG/CSS illustrations, algorithm visualizations, flowchart diagrams

**Illustration Guidelines:**
- Style: Flat geometric with glow effects on dark backgrounds
- Color: Use the syntax palette (cyan, green, violet, orange on dark surfaces)
- Line weight: 2px strokes with 1px for fine details
- Complexity: Clean and diagrammatic -- more "technical diagram" than "cartoon illustration"
- Glow: Key elements have a soft colored glow (box-shadow with accent color at 0.2 opacity)

**Diagram Guidelines (Algorithm Visualizations):**
- Flowcharts: Rounded rectangles for processes, diamonds for decisions
- Fill: Surface color (#141B2D) with accent-colored borders
- Connectors: 2px lines in text-secondary color with arrow markers
- Labels: JetBrains Mono at 14px, accent colors for keywords
- Animate: Sequential highlight of nodes to show algorithm flow

**Photography:** Avoid -- this course should feel entirely digital/constructed.

### Icon Style

- Style: Line icons (outlined), 2px stroke weight
- Color: `currentColor` (inherits from parent, enables theming)
- Size: 24px base grid
- Corner radius: 2px (sharp but not harsh)
- Source: Custom SVGs from skill resources/icons/ (8 base icons)
- Additional: Generate topic-specific icons as inline SVG
- Glow on hover: Soft accent-colored drop shadow

### Shape Language

- Corners: Sharp to slightly rounded (0px - 6px radius)
- Cards: 6px radius, 1px border, no rounded pill shapes
- Buttons: 6px radius (rectangular, not pill -- feels like IDE buttons)
- Code blocks: 4px radius with 1px border
- Shadows: Minimal -- dark themes use border and glow instead of shadow

### Background Treatments

**Page Background:** Deep navy-black (#0B1120) with subtle dot grid pattern

**Dot Grid Pattern:**
```css
background-image: radial-gradient(circle, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
background-size: 24px 24px;
```

**Circuit Board Traces (Decorative):**
Thin lines connecting elements, 1px width in border color, with small dots at intersections. Used sparingly on hero sections and module intros. Implemented as SVG overlay.

**Code Rain (Very Subtle):**
Vertical columns of fading characters in the deepest background layer. Only on intro/celebration screens. Opacity 0.03-0.05.

**Terminal Scanline (Micro-texture):**
```css
background-image: repeating-linear-gradient(
  0deg,
  transparent,
  transparent 2px,
  rgba(148, 163, 184, 0.02) 2px,
  rgba(148, 163, 184, 0.02) 4px
);
```

---

## 5. Layout Principles

### Grid System

- Columns: 12-column grid (CSS Grid)
- Gutter: 24px
- Margins: 40px desktop / 20px mobile
- Max content width: 900px centered (comfortable reading)
- Slide dimensions: Fixed 1280x720 (16:9, like a code editor viewport)

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| --space-2xs | 2px | Tight inner padding, border gaps |
| --space-xs | 4px | Icon gaps, tight element spacing |
| --space-sm | 8px | Related elements, list item gaps |
| --space-md | 16px | Component internal padding |
| --space-lg | 24px | Card padding, section gaps |
| --space-xl | 32px | Major component separation |
| --space-2xl | 48px | Section separation |
| --space-3xl | 64px | Page-level vertical rhythm |

### Component Patterns

**Cards:**
- Background: var(--color-surface) (#141B2D)
- Border: 1px solid var(--color-border) (#1E293B)
- Border-radius: 6px
- Padding: 24px
- Hover: border-color transitions to var(--color-border-highlight) (#334155)
- No visible shadow (dark themes use borders for elevation)

**Buttons (Primary):**
- Background: linear-gradient(135deg, #22D3EE, #06B6D4)
- Text: #0B1120 (dark text on bright button)
- Font: JetBrains Mono 600
- Border-radius: 6px
- Hover: box-shadow glow 0 4px 20px rgba(34, 211, 238, 0.4)

**Code Blocks:**
- Background: #0B1120 (deepest layer -- matches page bg for "embedded terminal" feel)
- Border: 1px solid #1E293B
- Border-radius: 4px
- Padding: 16px
- Font: JetBrains Mono 14px
- Line numbers: in text-muted color, 40px left gutter
- Syntax colors: Use the syntax palette (keyword=cyan, string=green, function=orange, type=violet, comment=gray)

**Quiz Options:**
- Full-width cards (not cramped radio buttons)
- Background: var(--color-surface)
- Border: 1px solid var(--color-border)
- Selected: border-color changes to var(--color-primary), background adds primary at 0.08 opacity
- Correct: border-color success, left 3px solid success accent
- Incorrect: border-color error, left 3px solid error accent

**Progress Bar:**
- Track: var(--color-surface) with 1px border
- Fill: linear-gradient(90deg, #22D3EE, #34D399) -- cyan to green
- Height: 6px (thin, terminal-style)

---

## 6. Asset Requirements

### Course Thumbnail
- Size: 1280 x 720px
- Format: PNG
- Content: Dark background with a centered algorithm flowchart rendered in glowing cyan and green lines. Course title "Computational Thinking" in JetBrains Mono across the top. Arabic subtitle "التفكير الحاسوبي" in Noto Kufi Arabic below. Subtle dot grid pattern in background. Circuit board traces fading from edges.

### Module Headers (Chapter 1)
- Size: 1200 x 400px
- Count: 1 (Chapter 1: Computational Thinking)
- Content: Wide banner with dark gradient background (#0B1120 to #141B2D). Left side: large monospace text "Chapter 01" with glowing cyan underline. Right side: abstract algorithm visualization (connected nodes in accent colors). Arabic title overlaid.

### SCO Type Icons (18 SCOs)
- Size: 64 x 64px SVG
- Create distinct icons for each SCO type:
  1. Infographic: bar chart / data visualization icon
  2. Pre-test / Post-test: terminal with checkmark icon
  3. Interactive Lecture: code window with cursor icon
  4. PDF Lecture: document with code brackets icon
  5. Motion Video: play button in terminal frame icon
  6. Interactive Activity: drag-drop / puzzle piece icon
  7. Discussion: speech bubbles with code brackets icon
  8. Assignment: clipboard with algorithm icon
  9. Summary: checklist with completion marks icon

### Algorithm Visualization Assets

For the core content, create these diagrams as inline SVG:

1. **Decomposition Diagram**: A complex problem broken into sub-problems, shown as a tree structure with glowing nodes
2. **Pattern Recognition**: Repeating sequences highlighted with accent colors
3. **Abstraction Layers**: Stacked transparent cards showing detail removal
4. **Algorithm Flowchart**: Decision diamonds, process rectangles, arrows -- animated step-by-step
5. **Iteration Loop**: Circular flow showing repeat logic with counter
6. **Selection Branch**: If/else fork with two paths highlighted differently (cyan vs violet)
7. **Example Algorithm**: Full algorithm with all CT elements annotated

### Infographics

1. **Learning Objectives Infographic (SCO 01)**: Visual grid of 4 course objectives, each in a "terminal card" with an icon, short description in Arabic, and a progress indicator
2. **Learning Map Infographic (SCO 02)**: Journey-style roadmap showing all 18 SCOs as connected nodes on a circuit board pattern. Groups color-coded by type. Current position marker.

---

## 7. Motion Design

### Animation Principles

- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` for entrances (snappy overshoot)
- Exit easing: `cubic-bezier(0.7, 0, 0.84, 0)` (quick deceleration)
- Duration: 200-350ms for UI transitions, 400-600ms for content reveals
- Stagger delay: 60ms between sequential items (fast cascade)
- Direction: Content enters from bottom (12px translate-Y), fades in
- Respect `prefers-reduced-motion`: Disable transforms, keep opacity fades at 200ms

### Terminal-Style Reveal

**Typing Cursor Effect:**
```css
.cursor-blink::after {
  content: '';
  display: inline-block;
  width: 2px;
  height: 1em;
  background: var(--color-primary);
  animation: blink 1s step-end infinite;
  margin-left: 2px;
  vertical-align: text-bottom;
}
@keyframes blink {
  50% { opacity: 0; }
}
```

Used for: Hero titles, section headers on first appearance.

**Staggered Line Reveal:**
Content lines appear one by one with a 60ms delay, sliding up 12px with opacity fade. Like code being written line by line.

### Page Transitions

- Between slides within a lesson: Fade (200ms) -- minimal disruption
- Hero section entrance: Staggered reveal (title, then subtitle, then content)
- Quiz option entrance: Stagger from top (4 options, 60ms apart)
- Score reveal: Scale from 0.8 to 1.0 with opacity, 400ms
- Celebration: Confetti burst (CSS particles) + score circle scale-up

### Hover States

- Buttons: Glow intensifies (box-shadow spreads), 150ms transition
- Cards: Border color lightens to highlight, 150ms
- Quiz options: Background lightens slightly, left border accent appears
- Links: Underline slides in from left (width animation)
- Icons: Subtle scale 1.05 + color shift to primary

### Scroll-Triggered

- For infographic SCOs (scrollable layouts): Elements fade in as they enter viewport
- Progress bar fills as user scrolls through content
- Not used in fixed-slide SCOs (most of the course)

---

## 8. Do's and Don'ts

### Do

- Use monospace (JetBrains Mono) consistently for headings, labels, and code
- Apply syntax highlighting colors to match their semantic roles (cyan=keywords, green=success)
- Keep backgrounds dark and surfaces clearly separated by border, not shadow
- Use inline SVG for all diagrams so they can be animated and themed
- Maintain generous negative space -- the IDE aesthetic breathes
- Test all Arabic text at 18px+ on dark backgrounds for legibility
- Use `dir="rtl"` on Arabic containers, `dir="ltr"` on English/code containers
- Wrap all code-like elements in monospace even in Arabic contexts
- Add alt text to all diagrams describing the algorithm step
- Use `role="img"` and `aria-label` on SVG illustrations

### Don't

- Use rounded pill shapes -- this is not a playful theme, keep edges sharp (6px max)
- Add decorative illustrations or characters -- this is diagrams-and-data territory
- Use more than 2 accent colors simultaneously on one screen (pick 2 of 5 syntax colors)
- Make backgrounds lighter than #1E293B for any surface element
- Use serif fonts anywhere -- the entire typographic system is sans-serif + monospace
- Add gradients to backgrounds (reserve gradients for buttons and progress bars only)
- Let interactive elements blend into the background -- every clickable element needs a visible border
- Use emoji in headings -- use SVG icons instead for consistent rendering
- Rely on color alone for quiz feedback (always pair color with icon + text label)
- Use animation durations longer than 600ms (snappy theme, not floaty)

---

## 9. Reference and Inspiration

### Mood Board Elements

1. **VS Code Dark+ Theme** -- The default dark theme of Visual Studio Code. Deep blue-black backgrounds (#1e1e1e to #252526), bright syntax colors (cyan, green, orange, yellow), minimal chrome, monospace everywhere. This is the primary reference for the entire visual language.

2. **GitHub Dark Dimmed** -- GitHub's dark mode with dimmed colors. The way it handles cards and surfaces (subtle border differentiation rather than shadows) is exactly what we want. Notice how code blocks sit naturally in the dark surface hierarchy.

3. **Linear App** -- The project management tool's dark mode. Notice the snappy 150-200ms transitions, the way hover states feel precise and responsive, the clean spacing. The dot-grid background on empty states is a direct reference for our page backgrounds.

4. **Raycast** -- The launcher app's aesthetic: monospace labels, sharp corners, fast animations, command-palette feel. The way results stagger in 40-60ms apart is our animation reference.

5. **Vercel Dashboard** -- Dark engineering dashboard. Clean type hierarchy, status indicators in syntax colors (green=deployed, yellow=building, red=error), minimal decoration. This maps directly to our quiz feedback and progress indicators.

### Similar Courses/Brands

- Khan Academy's AP Computer Science (content structure reference)
- Codecademy's dark mode interface (IDE-in-browser reference)
- freeCodeCamp's dark theme (dark mode + code readability)
- MIT OCW 6.0001 (academic rigor and structure reference)

---

## 10. AI Image Generation Prompts

### Thumbnail Prompt

```
Dark navy-black background (#0B1120) with subtle dot grid pattern. Center: a glowing algorithm flowchart with cyan (#22D3EE) and emerald (#34D399) lines connecting geometric nodes (rectangles, diamonds, circles). Nodes have soft glow effect. Top: "Computational Thinking" in monospace font, white text. Below: Arabic text "التفكير الحاسوبي" in geometric Arabic font. Thin circuit board traces fade from corners. Minimal, technical, premium. Style: flat vector, no 3D, no gradients except glow. Aspect ratio 16:9.
```

### Module Header Prompt

```
Wide banner, 3:1 aspect ratio. Dark gradient background from #0B1120 (left) to #141B2D (right). Left side: large "01" in cyan monospace font with soft glow underline. Right side: abstract network of connected nodes in cyan, violet (#A78BFA), and green (#34D399) -- representing an algorithm. Nodes are small circles (8px) connected by thin lines (1px). Subtle dot grid pattern in background. Technical, clean, dark.
```

### Illustration Style Base Prompt

```
Technical diagram on dark background (#0B1120). Flat vector style. Lines in 2px stroke weight. Primary elements in cyan (#22D3EE) with soft glow. Secondary elements in violet (#A78BFA). Success/correct paths in green (#34D399). Warning elements in amber (#FBBF24). Text labels in monospace font, white (#E2E8F0). No shadows, no 3D. Subtle dot grid background. Style: engineering diagram meets code editor aesthetic.
```

### Algorithm Flowchart Prompt

```
Algorithm flowchart on dark navy background. Start/End: rounded rectangles with cyan (#22D3EE) border and glow. Process steps: rectangles with white border. Decision diamonds: violet (#A78BFA) border. Arrows: white with directional markers. Active/highlighted path: green (#34D399) with brighter glow. Labels in white monospace font. Grid pattern dots at 24px intervals in background at 5% opacity. Clean, precise, technical.
```

---

## 11. Special Content Type Guidelines

### Infographic SCOs (01, 02)

These are the only scrollable SCOs. Design as vertical scrolling pages with fixed-width content (900px). Each section fades in on scroll. Use the full syntax color palette across sections. Large data visualizations, icon grids, progress indicators.

### Interactive Lecture SCOs (04, 10)

Fixed-slide layout (1280x720). Each slide has one concept. Click-to-reveal interactions, hotspot diagrams, tabbed content panels. Slides feel like IDE editor tabs. Slide counter styled as `// slide 3 of 12` in comment-gray.

### Interactive Activity SCOs (07, 08, 09, 12, 13, 14)

These are the core engagement SCOs. Use drag-drop for algorithm ordering, matching for concept pairing, sequence-sort for algorithm steps. Every activity has:
- Clear instruction text (bilingual)
- Visual workspace area (darker surface)
- Draggable elements styled as "code tokens" (monospace text in colored chips)
- Immediate feedback with terminal-style messaging ("Test passed!" / "Syntax error -- try again")
- Points awarded on completion

### Quiz SCOs (03, 18)

Full-width option cards. Question stem in large body text. Options in cards with monospace option labels (A, B, C, D). Terminal-style progress: `[3/10] Running tests...`. Score displayed as a terminal output: `Results: 88% -- 15/17 tests passing`.

### Discussion SCO (15)

Scenario presented in a "code review" format -- a highlighted algorithm with annotations pointing to "gotchas." Reflection text area styled as a code editor input (monospace, dark background, blinking cursor). Link to LMS forum styled as an external-link button.

### Summary SCO (17)

Visual recap using the same color-coding from the course. Key concepts listed as "exports" from the module. Final progress visualization showing all completed SCOs on the learning map. Celebration animation if all activities were completed.
