# AI Design Prompting Research

> How to prompt AI for stunning visual output — code generation, image generation, and design systems.
> Research compiled: 2026-02-06

---

## Table of Contents

1. [Prompting for Beautiful HTML/CSS (Code Generation)](#1-prompting-for-beautiful-htmlcss)
2. [Anthropic's Official Frontend Aesthetics Guide](#2-anthropics-official-frontend-aesthetics-guide)
3. [v0, Bolt, and Lovable Prompt Techniques](#3-v0-bolt-and-lovable-prompt-techniques)
4. [Prompt Frameworks and Structures](#4-prompt-frameworks-and-structures)
5. [AI Image Generation for E-Learning](#5-ai-image-generation-for-e-learning)
6. [Color and Typography with AI](#6-color-and-typography-with-ai)
7. [Design System Generation from Prompts](#7-design-system-generation-from-prompts)
8. [Generic vs Stunning: Prompt Comparison Examples](#8-generic-vs-stunning-prompt-comparison-examples)
9. [Integration Map: Our SCORM Pipeline](#9-integration-map-our-scorm-pipeline)
10. [Appendix: Copy-Pasteable Prompt Library](#10-appendix-copy-pasteable-prompt-library)

---

## 1. Prompting for Beautiful HTML/CSS

### The Core Problem

AI code generators default to safe, generic choices — what the industry now calls "AI slop aesthetics." Without specific guidance, you get: Inter font, gray-blue palette, evenly-distributed muted colors, solid white backgrounds, and zero animation.

The difference between generic and stunning output is **specificity of the design brief**.

### The Specificity Spectrum

| Prompt Quality | Example | Output Quality |
|---|---|---|
| **Vague** | "Make me a landing page" | Generic, cookie-cutter layout |
| **Structured** | "Landing page with hero, features grid, testimonials, CTA" | Correct structure, bland styling |
| **Specific** | "Hero with 80vh gradient bg (deep navy to electric blue), oversized serif headline (Playfair Display 72px), staggered fade-in cards with glassmorphism" | Production-ready, distinctive |
| **Reference-based** | "Design like Stripe's homepage meets Apple keynote. Generous whitespace, one idea per viewport, buttery parallax, surgical typography" | Premium, intentional aesthetics |

### Five Dimensions That Control Quality

Based on Anthropic's frontend aesthetics cookbook and real-world testing:

**1. Typography**
- Never use: Inter, Roboto, Open Sans, Lato, Arial, default system fonts
- Always specify: Font family, weight, size, letter-spacing, line-height
- Best practice: Pair a distinctive display font with a clean body font
- Example: "Use Space Grotesk 700 for headlines, DM Sans 400 for body text, with -0.02em letter-spacing on headings"

**2. Color & Theme**
- Commit to a bold palette, not timid evenly-distributed colors
- Use dominant color + sharp accent (not 5 equally-weighted colors)
- Specify CSS custom properties for consistency
- Example: "Deep navy (#0A1628) dominates, electric cyan (#00D4FF) for accents only, warm off-white (#F8F6F3) for text areas"

**3. Motion & Animation**
- Focus on high-impact moments, not scattered micro-interactions
- One well-orchestrated page load with staggered reveals beats many small animations
- Specify easing functions: cubic-bezier(0.25, 0.46, 0.45, 0.94) for elegance
- Example: "Staggered fade-in-up for cards (100ms delay between each), smooth parallax on hero at 0.5x speed, hover scale(1.02) with 200ms ease-out on interactive elements"

**4. Backgrounds & Atmosphere**
- Never default to solid white or plain colors
- Layer CSS gradients, subtle patterns, geometric shapes
- Create depth with overlapping elements and shadows
- Example: "Mesh gradient background (navy to deep purple to midnight blue), subtle grain texture overlay at 3% opacity, floating geometric shapes with slow rotation animation"

**5. Spatial Composition**
- Unexpected layouts, asymmetry, grid-breaking elements
- Generous negative space or controlled density
- Overlap, diagonal flow, parallax depth
- Example: "Hero text left-aligned at 60% width with floating 3D element bleeding off right edge, 120px padding between sections, cards in asymmetric bento grid"

### What Makes Output "Stunning" vs "Generic"

| Generic Output | Stunning Output |
|---|---|
| Inter font, 16px body | Space Grotesk + DM Sans, varied scale |
| `#f5f5f5` background | Layered gradient with grain texture |
| No animation | Staggered reveal with orchestrated timing |
| 12-column symmetric grid | Asymmetric bento grid with overlaps |
| Solid color buttons | Gradient buttons with subtle glow on hover |
| Stock photo placeholders | SVG illustrations or CSS-only graphics |
| Generic card shadows | Layered shadows with color tinting |
| Evenly-spaced sections | Dramatic whitespace contrasts |

---

## 2. Anthropic's Official Frontend Aesthetics Guide

This is the most directly relevant resource for our pipeline since we use Claude for code generation.

### Source

- [Anthropic Claude Cookbook: Prompting for Frontend Aesthetics](https://github.com/anthropics/claude-cookbooks/blob/main/coding/prompting_for_frontend_aesthetics.ipynb)
- [Claude Frontend Design Skill](https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md)
- [Improving Frontend Design Through Skills](https://claude.com/blog/improving-frontend-design-through-skills)

### The Three Core Strategies

1. **Guide specific design dimensions** — Direct Claude's attention to typography, color, motion, and backgrounds individually
2. **Reference design inspirations** — Suggest sources like IDE themes or cultural aesthetics without being overly prescriptive
3. **Call out common defaults to avoid** — Explicitly tell Claude to avoid its tendency toward generic choices

### Anthropic's Design Thinking Framework

Before generating code, commit to a bold aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme — brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian
- **Constraints**: Technical requirements
- **Differentiation**: What makes this unforgettable?

### Key Principle: "Bold maximalism and refined minimalism both work — the key is intentionality, not intensity."

### The Full Aesthetics Prompt (Adapted from Anthropic)

```
You are an expert frontend engineer skilled at crafting beautiful,
performant applications. Generate complete, self-contained HTML.

DESIGN RULES:
- Typography: Choose fonts that are beautiful, unique, and interesting.
  AVOID generic fonts (Inter, Roboto, Open Sans, Arial, system defaults).
  Use distinctive choices that elevate aesthetics.
- Color: Commit to a cohesive aesthetic. Use CSS variables for consistency.
  Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- Motion: Use animations for effects and micro-interactions. CSS-only preferred.
  Focus on high-impact moments: one well-orchestrated page load with staggered
  reveals creates more delight than scattered micro-interactions.
- Backgrounds: Create atmosphere and depth, never default to solid colors.
  Layer CSS gradients, geometric patterns, or contextual effects.
- Layout: Unexpected compositions, asymmetry, overlap, generous negative space.

ANTI-PATTERNS TO AVOID:
- Generic, safe, corporate aesthetics
- Evenly-distributed muted color palettes
- Centered-everything symmetric layouts
- Placeholder-heavy designs
- Default spacing and sizing
```

### How to Use This in Our Pipeline

This prompt (or a variant) should be embedded in our **Content Renderer agent's** system instructions. It replaces vague "make it beautiful" with specific, actionable design constraints.

---

## 3. v0, Bolt, and Lovable Prompt Techniques

### v0 by Vercel — The Three-Part Prompt

Source: [How to Prompt v0 — Vercel Blog](https://vercel.com/blog/how-to-prompt-v0)

Every v0 prompt should include:

1. **Product Surface**: List actual components, features, and data
2. **Context of Use**: Who uses it, when, what problem it solves
3. **Constraints & Taste**: What NOT to do, design preferences

**Example v0 Prompt:**
```
Build a lesson progress dashboard for an e-learning platform.

CONTEXT: Used by adult learners (25-45) in Arabic-speaking countries,
viewed on tablets and desktops. Must feel motivating, not overwhelming.

COMPONENTS:
- Course progress card with circular percentage indicator
- Lesson grid showing completed/current/locked states
- Points/gamification badge in header with animated counter
- Quiz performance chart (last 5 quizzes)

CONSTRAINTS:
- Mobile-first, support RTL layout
- High contrast (WCAG AA minimum)
- Color code states: green=complete, blue=current, gray=locked
- Use Tailwind CSS with shadcn/ui components
- Animations: subtle, purposeful (not flashy)
```

**Key Insight**: Good prompts consistently deliver 30-40% faster generation with fewer iterations. v0 uses a composite approach: retrieval, frontier LLM reasoning, and a streaming "AutoFix" post-processor.

### Bolt.new Prompting Best Practices

Source: [Bolt Prompting Guide](https://support.bolt.new/best-practices/prompting-effectively)

- Start with application architecture (framework, tools)
- Add individual components one by one (not all at once)
- Be explicit about what should and should NOT change
- Refer to specific elements, classes, or functions
- Use the "enhance" button to let the AI refine your prompt before sending
- Keep follow-up prompts small and specific

**Bolt Prompt Structure:**
```
ARCHITECTURE: Pure HTML/CSS/JS, no framework, self-contained
DESIGN: [Theme description]
COMPONENT: [Specific component to build]
BEHAVIOR: [How user interacts]
CONSTRAINTS: [What to avoid, accessibility, RTL]
```

### Lovable — Full-Stack From Prompts

- Strength: Generating full-stack applications from text prompts
- Best practice: Use its one-click GitHub integration for version control
- Uses shadcn/ui, Tailwind CSS, and Lucide React icons
- Better for full-stack (includes backend) vs pure frontend

### Key Takeaway for Our Pipeline

Our Content Renderer agent should adopt v0's three-part structure: **Surface + Context + Constraints**. This maps perfectly to how we already have specs from the Interview and Instructional Designer phases.

---

## 4. Prompt Frameworks and Structures

### Framework 1: CARE (NN/g)

Source: [NN/g CARE Framework](https://www.nngroup.com/articles/careful-prompts/)

- **C**ontext: Background information and design system details
- **A**sk: What you want the system to do
- **R**ules: How to do it (constraints, styles, accessibility)
- **E**xamples: Reference designs or output samples

### Framework 2: TC-EBC (Figma)

Source: [Cooking with Constraints — Figma Blog](https://www.figma.com/blog/designer-framework-for-better-ai-prompts/)

- **T**ask: What to build
- **C**ontext: Who it's for, what platform, what workflow
- **E**lements: Specific UI components needed
- **B**ehavior: How the user interacts (hover, click, swipe)
- **C**onstraints: Technical limits, accessibility, RTL, responsive

**Example TC-EBC Prompt:**
```
TASK: Build a flip-card quiz component for SCORM e-learning
CONTEXT: Adult learners in Saudi Arabia, NELC-compliant,
  embedded in 1280x720 fixed slide layout
ELEMENTS: Question on front, answer + explanation on back,
  correct/incorrect indicator, points awarded badge
BEHAVIOR: Click to flip (with 3D CSS transform), swipe on mobile,
  keyboard Enter to flip, Tab to navigate between cards
CONSTRAINTS: RTL Arabic support, WCAG AA, no external dependencies,
  CSS-only animation, works in LMS iframe
```

### Framework 3: PRD-Style (CrazyEgg Finding)

Source: [CrazyEgg Best AI Prompts](https://www.crazyegg.com/blog/ai-web-design-prompts/)

The most effective prompts follow a Product Requirements Document structure:
- **Identity**: What is this product/page?
- **Tech Stack**: HTML/CSS/JS, Tailwind, React, etc.
- **Vibe**: Aesthetic direction in 2-3 words
- **Core Features**: Bulleted list of must-haves

### Framework 4: Screen-Generation Prompt (6 Sections)

Source: [Prompt Engineering for UI — Medium/Bootcamp](https://medium.com/design-bootcamp/prompt-engineering-for-designers-how-to-get-stunning-uis-from-ai-in-2026-a431dd241588)

1. **Context Reset**: Clear instructions about the AI's role
2. **Library Reference**: Which UI kit/components to use
3. **Naming**: File and component naming conventions
4. **Frame**: Screen dimensions, device target
5. **Layout Scaffolding**: Grid, sections, hierarchy
6. **Aesthetic Guidance**: Colors, fonts, tone, mood

### Framework 5: Detection-Constraint-Reuse

Source: [Consistent UI with AI Prompts — DEV Community](https://dev.to/julian-io/consistent-ui-with-ai-prompts-me5)

1. **Detection**: Make the AI inspect your existing project first (CSS, components, config)
2. **Constraint**: Enforce one clear styling system — no mixing approaches
3. **Reuse**: Match existing component patterns exactly

**Key Insight**: "Consistency comes from repetition and constraints — not from writing longer prompts."

### Framework 6: Builder.io's 11 Tips

Source: [11 Prompting Tips for UIs That Don't Suck](https://www.builder.io/blog/prompting-tips)

Top actionable tips:
1. Show the AI what you're looking at (provide visual context)
2. Use YOUR design system, not the AI's defaults
3. Provide proper context (role, audience, purpose)
4. Point to specific file paths that reflect your desired coding style
5. Start with structure, then add details incrementally

### Which Framework for Our Pipeline?

**Recommended: Hybrid of TC-EBC + Anthropic's 5 Dimensions**

```
ROLE: Expert e-learning frontend engineer
TASK: [From instructional design spec]
CONTEXT: [From interview phase — audience, platform, locale]
ELEMENTS: [From component library — accordion, tabs, flip-card, etc.]
BEHAVIOR: [Interaction patterns from spec]
CONSTRAINTS: [NELC, WCAG AA, RTL, self-contained, 1280x720]

DESIGN (Anthropic's 5 Dimensions):
- Typography: [From art direction — specific fonts, sizes, weights]
- Color: [From tokens.json — CSS custom properties]
- Motion: [Stagger animations, transitions, micro-interactions]
- Backgrounds: [From decorations.css — gradients, patterns, effects]
- Layout: [Fixed slide, 16:9, max-width 900px centered]
```

---

## 5. AI Image Generation for E-Learning

### Midjourney: The Gold Standard for Illustration

Source: [Midjourney Style Reference Docs](https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference), [E-Learning Consistent Style](https://christytuckerlearning.com/ai-images-with-consistent-style-in-midjourney/)

#### Key Parameters for Consistency

| Parameter | Purpose | Example |
|---|---|---|
| `--sref [URL or code]` | Apply consistent style across images | `--sref https://example.com/style.png` |
| `--sw [0-1000]` | Style weight (how strongly style applies) | `--sw 250` (moderate influence) |
| `--cref [URL]` | Character reference for consistent characters | `--cref https://example.com/char.png` |
| `--oref [URL]` | Omni reference (V7) for objects/characters | New in V7, replaces some cref use |
| `--ar 16:9` | Aspect ratio for slide-sized images | Matches our 1280x720 layout |
| `--no text, words` | Prevent text artifacts in illustrations | Critical for clean e-learning images |

#### Sref Codes (Style Shortcuts)

Instead of describing style every time, use a numeric code:
```
/imagine a teacher explaining gravity --sref 12345 --ar 16:9
/imagine students in a lab --sref 12345 --ar 16:9
```
Same sref code = consistent visual style across all images in a course.

#### E-Learning Illustration Prompt Template (Midjourney)

```
[SCENE DESCRIPTION], [STYLE ANCHOR], educational illustration,
clean composition, [COLOR PALETTE], professional quality,
--ar 16:9 --sref [STYLE_CODE] --sw 200 --no text words letters
```

**Example:**
```
/imagine a diverse group of professionals collaborating around
a holographic display showing data analytics, flat vector
illustration style, bold geometric shapes, warm coral and deep
navy palette, clean white background, educational infographic
quality --ar 16:9 --sref 3847291065 --sw 200 --no text words
```

### DALL-E 3: Best for Text-in-Image and Quick Generation

Source: [OpenAI DALL-E 3 Cookbook](https://cookbook.openai.com/articles/what_is_new_with_dalle_3), [Consistent Style Guide](https://www.datastudios.org/post/dall-e-3-prompts-for-blog-images-consistent-styles-quality-and-workflow)

#### Style Anchor Technique

Maintain a fixed style prompt as a prefix for all course images:

```
STYLE ANCHOR (reuse for every image in this course):
"Horizontal 16:9 digital illustration, flat design with subtle
gradients, bold geometric shapes, warm professional palette
(coral #FF6B6B, navy #1A1A3E, cream #FFF8F0), clean composition,
educational infographic quality, no text"

SCENE: [Specific scene description for each image]
```

#### Key DALL-E 3 Tips

- Use 5-7 descriptors per prompt (balance specificity vs rigidity)
- Specify both foreground subject and background structure
- For recurring characters, use "descriptive anchors": "young female scientist with hijab, blue lab coat, warm brown eyes, digital art style, consistent facial structure"
- DALL-E 3 rewrites prompts via GPT-4 — check the rewritten prompt and iterate
- Limitation: Cross-image consistency is harder than Midjourney's sref approach

#### DALL-E 3 Educational Prompt Template

```
Create a [16:9 horizontal] educational illustration showing
[SCENE]. Style: [STYLE ANCHOR]. The image should feel
[professional/playful/warm/technical]. Include [SPECIFIC DETAILS].
Do not include any text or words in the image.
```

### Ideogram: Best for Text-Heavy Educational Graphics

Source: [Ideogram Docs](https://docs.ideogram.ai/using-ideogram/prompting-guide/2-prompting-fundamentals/text-and-typography), [Ideogram 3.0 Features](https://ideogram.ai/features/3.0)

Ideogram achieves ~90% text rendering accuracy vs ~30% for other tools.

#### When to Use Ideogram

- Infographic titles and headers
- Motivational quote cards for courses
- Certificate designs with learner names
- Social media cards for course promotion
- Diagrams with labels

#### Ideogram Prompt Template

```
Educational infographic titled "KEY CONCEPT NAME" in bold
modern typography, [VISUAL DESCRIPTION], [COLOR PALETTE],
clean professional layout, 16:9 aspect ratio
```

#### Ideogram 3.0 Features (March 2025)

- Style References: Upload up to 3 reference images
- Magic Prompt: Auto-enhances basic prompts
- Best for: Short text (1-5 words), everyday words over complex terms

### Tool Selection Guide for Our Pipeline

| Need | Best Tool | Why |
|---|---|---|
| Course illustrations (consistent set) | **Midjourney** | sref codes ensure style consistency |
| Quick concept images | **DALL-E 3** | Fast, GPT-4 prompt optimization |
| Infographics with text | **Ideogram** | 90% text rendering accuracy |
| Icons and simple graphics | **CSS/SVG** | Already in our component library |
| Character consistency across course | **Midjourney** with cref | Character reference maintains identity |
| Abstract/atmospheric backgrounds | **DALL-E 3 or CSS** | CSS gradients often better than images |

---

## 6. Color and Typography with AI

### AI Color Palette Tools

#### Khroma (khroma.co)
- Neural network trained on thousands of palettes
- You select colors you like, it learns your preferences
- Outputs: Typography pairings, gradients, palettes, custom images
- **Best for**: Discovering palettes that match a mood/brand

#### Coolors (coolors.co)
- Fast random palette generation with lock/shuffle
- Accessibility contrast checking built-in
- Export: CSS, SCSS, SVG, PDF, and more
- **Best for**: Quick exploration and accessibility validation

#### ColorMagic (colormagic.app)
- Type any keyword or mood to generate matching palette
- Examples: "warm professional", "dark cosmic", "playful education"
- **Best for**: Mood-to-palette conversion (perfect for our themes)

#### Colorffy (colorffy.com)
- Generates full dark/light theme color suites
- Export: Tailwind, CSS variables, PNG, PDF
- **Best for**: Complete theme generation with accessibility

### AI Font Pairing Tools

#### Fontjoy (fontjoy.com)
- Deep learning pairs fonts by analyzing weight, serif details, obliqueness
- Lock your primary font, shuffle to find companions
- Contrast slider: subtle similarity to dramatic difference
- **Best for**: Finding unexpected, harmonious font pairings

### How to Describe Visual Styles in Prompts

Instead of vague mood words, use structured descriptions:

| Mood Word | Structured Description |
|---|---|
| "Professional" | "Clean sans-serif typography (DM Sans), navy/white palette with subtle gray accents, generous whitespace, sharp 4px corners, restrained animation" |
| "Playful" | "Rounded display font (Nunito), saturated primary colors with pastel accents, bouncy easing (cubic-bezier(0.34, 1.56, 0.64, 1)), large rounded corners (16px), confetti micro-interactions" |
| "Cosmic" | "Futuristic mono font (Space Mono) + geometric sans (Space Grotesk), deep navy to purple gradient, cyan/magenta accents, star particle effects, glassmorphism cards" |
| "Warm/Inviting" | "Friendly serif (Lora) + readable sans (Source Sans 3), warm earth tones (terracotta, sage, cream), soft shadows, gentle fade-in animations, organic border-radius (40% 60%)" |
| "Technical" | "Monospace code font (JetBrains Mono) + clean sans (IBM Plex Sans), dark theme (charcoal bg, green/cyan text), syntax-highlighting-style accents, terminal-inspired UI, sharp 2px corners" |

### Integration for Our Pipeline

Our **Art Director agent** should use these tools in this workflow:
1. Take mood/brand keywords from interview phase
2. Generate palette via ColorMagic or Khroma
3. Find font pairings via Fontjoy
4. Output as tokens.json with CSS custom properties
5. Content Renderer reads tokens.json and applies consistently

---

## 7. Design System Generation from Prompts

### The 20-Minute Design System

Source: [From Prompt to Production — The New Stack](https://thenewstack.io/from-prompt-to-production-a-guide-to-ai-generated-design-systems/)

It is now possible to generate an entire production-grade design system from a single prompt in ~20 minutes: a complete library of reusable, tested, and fully documented components.

### Key Principles

1. **Structured configuration beats open-ended prompting** — more constraints = more reliable output
2. **Templates over generic prompting** — combining pre-configured code with focused instructions
3. **Detection first** — make the AI inspect existing styles before generating new ones

### Prompt Template: Generate tokens.json from Mood

```
Generate a complete design token system in JSON format for an
e-learning platform with this aesthetic: [MOOD DESCRIPTION].

Include these token categories:
- colors: primary, secondary, accent, background, surface,
  text (each with light/dark variants)
- typography: fontFamily (display, body, mono), fontSize scale
  (xs through 4xl), fontWeight (regular, medium, semibold, bold),
  lineHeight, letterSpacing
- spacing: scale from 2xs to 4xl (exponential)
- borderRadius: sm, md, lg, xl, full
- shadows: sm, md, lg, xl (with color tinting from primary)
- animation: duration (fast, normal, slow), easing (ease-in,
  ease-out, bounce, spring)
- breakpoints: mobile, tablet, desktop

Output format: JSON with CSS custom property names (--color-primary, etc.)
Include hex values for colors, rem for sizes, ms for durations.
```

**Example Mood Input:**
```
"Dark cosmic exploration theme for an astronomy course.
Deep space navy backgrounds with nebula purple gradients.
Electric cyan accents for interactive elements.
Stars and subtle particle effects.
Futuristic but approachable — not intimidating."
```

### Prompt Template: Generate CSS Theme from tokens.json

```
Convert this tokens.json into a complete CSS theme file:
[paste tokens.json]

Requirements:
- Use :root CSS custom properties for all values
- Include dark mode variant in @media (prefers-color-scheme: dark)
- Add utility classes for common patterns (e.g., .text-primary, .bg-surface)
- Include component-specific tokens (card, button, input, badge)
- Add transition defaults using the animation tokens
- Comments grouping each section
```

### Prompt Template: Generate decorations.css from Theme

```
Create a decorations.css file that adds atmospheric background
effects matching this theme: [THEME DESCRIPTION].

Include:
- Animated background effect (particles, gradients, or patterns)
- Section divider styles (wave, diagonal, zigzag)
- Decorative accents (floating shapes, glows, geometric patterns)
- Celebration animation (confetti, sparkles, or fireworks)
- All effects should respect prefers-reduced-motion
- Pure CSS only, no JavaScript
- Performance: use transform/opacity for animations, will-change hints
```

### W3C Design Tokens Format

For maximum interoperability, use the W3C Community Group draft format:

```json
{
  "color": {
    "primary": { "$value": "#0A1628", "$type": "color" },
    "accent": { "$value": "#00D4FF", "$type": "color" }
  },
  "typography": {
    "fontFamily": {
      "display": { "$value": "Space Grotesk", "$type": "fontFamily" },
      "body": { "$value": "DM Sans", "$type": "fontFamily" }
    },
    "fontSize": {
      "base": { "$value": "1rem", "$type": "dimension" },
      "lg": { "$value": "1.25rem", "$type": "dimension" }
    }
  },
  "spacing": {
    "md": { "$value": "1rem", "$type": "dimension" }
  }
}
```

---

## 8. Generic vs Stunning: Prompt Comparison Examples

### Example 1: Quiz Component

**Generic Prompt:**
```
Create a quiz component with multiple choice questions.
```

**Stunning Prompt:**
```
Create a SCORM quiz component for an astronomy course using
the "space-explorer" theme.

DESIGN:
- Dark background (#0A1628) with subtle star field CSS animation
- Questions in glassmorphism cards (backdrop-filter: blur(20px),
  rgba(255,255,255,0.05) bg, 1px rgba(255,255,255,0.1) border)
- Answer options as full-width cards, not cramped radio buttons
- Selected state: electric cyan (#00D4FF) border glow with
  box-shadow: 0 0 20px rgba(0,212,255,0.3)
- Correct answer: green pulse animation, +10 points badge flies
  to score counter
- Wrong answer: gentle red shake (not punishing), growth mindset
  message "Not yet — you're learning!"
- Progress: constellation-style dots connecting completed questions

TYPOGRAPHY: Space Grotesk 600 for questions (24px), DM Sans 400
for options (18px), monospace for score counter

ANIMATION: Cards stagger in with 80ms delay, flip animation for
answer reveal (preserve-3d), confetti burst on quiz pass (>70%)

CONSTRAINTS: RTL Arabic support, WCAG AA contrast, keyboard
navigable, works in LMS iframe, no external dependencies,
self-contained HTML
```

### Example 2: Course Navigation

**Generic Prompt:**
```
Create a course navigation sidebar.
```

**Stunning Prompt:**
```
Create a SCORM player sidebar navigation for a 12-lesson course.

METAPHOR: Journey map — not a boring list. Each lesson is a
waypoint on a path. Completed = glowing checkpoint, current =
pulsing beacon, locked = dim with lock icon.

DESIGN:
- Vertical path with subtle curved SVG line connecting waypoints
- Each waypoint: 40px circle with lesson number, title below
- Completed: filled circle with checkmark, warm glow
- Current: animated pulse ring, larger (48px), highlighted title
- Locked: 50% opacity, small lock icon overlay
- Module dividers: horizontal line with module title centered
- Collapse/expand animation for module groups

SPACING: 24px between waypoints, 48px between modules
COLOR: Use theme CSS variables (--color-primary for active,
--color-success for complete, --color-muted for locked)
FONT: DM Sans 500 for titles, 400 for descriptions

INTERACTION: Click to navigate (if unlocked), hover preview
tooltip with lesson duration and completion status, smooth
scroll to current lesson on open

ACCESSIBILITY: role="navigation", aria-current="step" on active,
aria-disabled on locked, keyboard Tab navigation
```

### Example 3: Slide Layout

**Generic Prompt:**
```
Create a lesson slide with content and an image.
```

**Stunning Prompt:**
```
Create a fixed-size (1280x720) e-learning slide for "The Water
Cycle" lesson in a science course.

LAYOUT: 60/40 split — content left, visual right
- Left panel: lesson title (28px, bold), body text (18px, 1.6
  line-height), 2 key concept callout boxes with icon + text
- Right panel: Large illustration area (maintains 4:3 aspect),
  caption below in smaller italic text
- Bottom bar: lesson progress (3/12), navigation arrows,
  estimated reading time

VISUAL TREATMENT:
- Subtle gradient from white to light blue-gray (left to right)
- Content area has generous 48px padding
- Callout boxes: left border accent (4px, theme primary color),
  light tinted background, rounded corners (8px)
- Image area: rounded corners (12px), subtle shadow

ANIMATION ON ENTER:
- Title slides in from left (300ms, ease-out)
- Body text fades in (400ms, 100ms delay)
- Callout boxes stagger in from bottom (500ms, 200ms delay each)
- Image scales up from 0.95 (600ms, ease-out)

TYPOGRAPHY: Playfair Display for title, Source Sans 3 for body
COLORS: From tokens.json CSS variables
```

---

## 9. Integration Map: Our SCORM Pipeline

### Which Agent Gets Which Prompting Technique?

| Agent | Prompting Technique | What It Controls |
|---|---|---|
| **Interview** | Open-ended questions | Captures mood, audience, brand keywords |
| **Instructional Designer** | Structured learning design | Bloom's taxonomy, QM alignment, content structure |
| **Art Director** | Mood-to-tokens generation + reference-based | tokens.json, theme.css, decorations.css, image style guide |
| **Visual Generator** | Style-anchored image prompts | Midjourney/DALL-E prompts with sref codes |
| **Animation Creator** | Remotion + tokens.json reference | Video/animation matching theme tokens |
| **Assessment Builder** | Constraint-based quiz generation | Quiz components with gamification + accessibility |
| **Content Renderer** | TC-EBC + Anthropic's 5 Dimensions | HTML/CSS/JS slides using all design assets |
| **Packager** | Structural validation | imsmanifest.xml, SCORM compliance |

### Art Director Agent — Enhanced Prompt

The Art Director should output:

1. **tokens.json** — Generated from mood keywords using structured prompt
2. **theme.css** — CSS custom properties derived from tokens
3. **decorations.css** — Atmospheric effects matching theme
4. **Image Style Guide** — Midjourney/DALL-E prompt templates with:
   - Style anchor text (reusable prefix for all images)
   - sref code (if using Midjourney)
   - Character description anchors (for recurring characters)
   - Color palette constraints
   - Composition guidelines

### Content Renderer Agent — Enhanced System Prompt

Add to the Content Renderer's instructions:

```
DESIGN QUALITY RULES (NON-NEGOTIABLE):

1. TYPOGRAPHY: Use fonts specified in tokens.json. NEVER use Inter,
   Roboto, Open Sans, or system defaults. Load fonts from shared/assets/fonts/.

2. COLOR: Read all colors from CSS custom properties in theme.css.
   Use dominant color + sharp accent pattern. Never distribute
   colors evenly.

3. MOTION: Every slide gets an entrance animation:
   - Staggered fade-in-up for content blocks (100ms delay each)
   - Use cubic-bezier(0.25, 0.46, 0.45, 0.94) for elegance
   - Respect prefers-reduced-motion
   - One "hero moment" animation per slide (not many small ones)

4. BACKGROUNDS: Never use plain solid colors. Reference decorations.css
   for atmospheric effects. Layer subtle gradients or patterns.

5. LAYOUT: Design for 1280x720 fixed viewport. Content max-width
   900px centered. Use asymmetric compositions — not everything centered.
   Generous whitespace between sections (48-80px).

6. COMPONENTS: Use HTML components from the 22-component library.
   Every lesson needs 2+ interactive elements. Touch-friendly (44px
   minimum tap targets).

7. ACCESSIBILITY: Semantic HTML, ARIA roles, keyboard navigation,
   4.5:1 contrast minimum, skip navigation links.

8. SELF-CONTAINED: No external dependencies. All fonts, icons, and
   assets bundled locally.
```

### Quality Checkpoints

After each agent's output, validate:

| Checkpoint | What to Check |
|---|---|
| After Art Direction | Do tokens.json colors have sufficient contrast? Are fonts distinctive (not generic)? |
| After Visual Generation | Are all images consistent in style? Correct aspect ratio? No text artifacts? |
| After Content Rendering | Does the slide look stunning at 1280x720? Are animations smooth? RTL working? |
| After Packaging | Does it work offline? All assets bundled? SCORM API communicating? |

---

## 10. Appendix: Copy-Pasteable Prompt Library

### A. System Prompt for Art Director Agent

```
You are a world-class visual designer creating design direction
for an e-learning course. Your output must be distinctive, bold,
and memorable — never generic or corporate.

Given the course topic, audience, and mood keywords, produce:

1. tokens.json — Complete design token system including:
   - Color palette (primary, secondary, accent, bg, surface, text,
     success, warning, error — each with light/dark variants)
   - Typography (display font, body font, mono font, size scale,
     weight scale, line-height, letter-spacing)
   - Spacing scale (2xs through 4xl)
   - Border radius scale
   - Shadow scale (with color-tinted variants)
   - Animation tokens (durations, easings)

2. theme.css — CSS custom properties from tokens, ready to use

3. decorations.css — Atmospheric CSS effects (backgrounds,
   particles, section dividers, celebration animations)

4. Image Style Guide — Prompt templates for Midjourney/DALL-E:
   - Style anchor (reusable prefix)
   - Character anchors (if course has recurring characters)
   - Composition rules
   - What to avoid

DESIGN PRINCIPLES:
- Bold maximalism OR refined minimalism — never bland middle ground
- Dominant color + sharp accent (not 5 equal colors)
- Distinctive fonts (NEVER Inter, Roboto, Open Sans, Arial)
- Create atmosphere through backgrounds, not just content
- Every choice should be intentional and defensible
```

### B. System Prompt for Content Renderer Agent

```
You are an expert frontend engineer creating e-learning slides
that make designers say "wow." Your HTML must be production-ready,
accessible, and visually stunning.

READ THESE FILES FIRST:
- tokens.json and theme.css for design tokens
- decorations.css for atmospheric effects
- The component library in shared/components/

FOR EVERY SLIDE:
- Fixed viewport: 1280x720, no scrolling
- Content area: max-width 900px, centered
- Use CSS custom properties from theme.css for ALL colors/fonts
- Include entrance animations (staggered fade-in-up, 100ms delay)
- Use 2+ interactive components from the library
- Touch-friendly: 44px minimum tap targets
- RTL support: use logical properties (margin-inline-start, etc.)
- WCAG AA: semantic HTML, ARIA, 4.5:1 contrast, keyboard nav

AESTHETIC RULES:
- Typography: Use the display/body fonts from tokens.json.
  Varied scale (hero text 48px, headings 28px, body 18px).
  Generous line-height (1.6 for body, 1.2 for headings).
- Color: Dominant + accent pattern. Never flat/even distribution.
- Backgrounds: Reference decorations.css. Layer gradients, subtle
  patterns. Never solid white.
- Animation: One hero moment + staggered content reveal.
  Use cubic-bezier(0.25, 0.46, 0.45, 0.94).
- Layout: Asymmetric where possible. Generous negative space
  (48-80px between major sections).
- Interactive elements: Smooth hover states (200ms transition),
  clear active states, satisfying click feedback.
```

### C. Image Generation Prompt Template (Midjourney)

```
/imagine [SCENE DESCRIPTION], [STYLE: flat vector / isometric /
watercolor / 3D render], [COLOR PALETTE DESCRIPTION], educational
illustration, clean composition, professional quality,
[MOOD: warm / energetic / serene / technical], 16:9 aspect ratio
--ar 16:9 --sref [STYLE_CODE] --sw 200 --no text words letters
watermark signature
```

### D. Image Generation Prompt Template (DALL-E 3)

```
Create a 16:9 horizontal educational illustration showing [SCENE].

Style: [STYLE ANCHOR — reuse across all course images].
Example: "flat digital illustration with bold geometric shapes,
clean lines, subtle gradients, warm professional palette
(coral, navy, cream)"

The illustration should feel [MOOD] and [TONE].
Include: [SPECIFIC VISUAL ELEMENTS].
Do not include any text, words, letters, or watermarks.
Background: [SPECIFIC BACKGROUND DESCRIPTION].
Composition: [SPECIFIC LAYOUT — centered, rule of thirds, etc.]
```

### E. Design Token Generation Prompt

```
Generate a design token system in JSON format for this e-learning
course theme:

COURSE: [Topic]
AUDIENCE: [Who]
MOOD: [2-3 mood keywords]
REFERENCE: [Design like X website/brand]

Output a complete tokens.json with:
{
  "meta": { "name": "[theme-name]", "description": "[mood]" },
  "colors": {
    "primary": "#...", "primaryLight": "#...", "primaryDark": "#...",
    "secondary": "#...", "accent": "#...",
    "background": "#...", "surface": "#...", "surfaceElevated": "#...",
    "text": "#...", "textSecondary": "#...", "textOnPrimary": "#...",
    "success": "#...", "warning": "#...", "error": "#...",
    "border": "#...", "borderLight": "#..."
  },
  "typography": {
    "fontFamilyDisplay": "...",
    "fontFamilyBody": "...",
    "fontFamilyMono": "...",
    "fontSizeXs": "0.75rem",
    "fontSizeSm": "0.875rem",
    "fontSizeBase": "1rem",
    "fontSizeLg": "1.25rem",
    "fontSizeXl": "1.5rem",
    "fontSize2xl": "2rem",
    "fontSize3xl": "2.5rem",
    "fontSize4xl": "3.5rem"
  },
  "spacing": {
    "2xs": "0.25rem", "xs": "0.5rem", "sm": "0.75rem",
    "md": "1rem", "lg": "1.5rem", "xl": "2rem",
    "2xl": "3rem", "3xl": "4rem", "4xl": "6rem"
  },
  "borderRadius": {
    "sm": "4px", "md": "8px", "lg": "12px", "xl": "16px", "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 2px rgba(0,0,0,0.05)",
    "md": "0 4px 12px rgba(0,0,0,0.1)",
    "lg": "0 8px 24px rgba(0,0,0,0.15)",
    "xl": "0 16px 48px rgba(0,0,0,0.2)",
    "glow": "0 0 20px [accent color at 30% opacity]"
  },
  "animation": {
    "durationFast": "150ms",
    "durationNormal": "300ms",
    "durationSlow": "500ms",
    "easingDefault": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    "easingBounce": "cubic-bezier(0.34, 1.56, 0.64, 1)",
    "easingSpring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)"
  }
}

Ensure:
- All colors pass WCAG AA contrast against their backgrounds
- Fonts are Google Fonts (for local bundling) but NOT generic defaults
- Accent color contrasts strongly against primary
- Shadow colors are tinted with the primary color
```

### F. Theme Validation Prompt

```
Review this tokens.json for design quality:

[paste tokens.json]

Check:
1. CONTRAST: Do text colors meet WCAG AA (4.5:1) against their backgrounds?
2. DISTINCTIVENESS: Are fonts unique and characterful (not Inter/Roboto)?
3. PALETTE: Is there a clear dominant + accent pattern (not evenly distributed)?
4. SCALE: Does the type scale have good hierarchy (display vs body)?
5. HARMONY: Do colors feel cohesive (same temperature/saturation family)?
6. ACCESSIBILITY: Is the error color distinguishable for color-blind users?

Rate each 1-5 and suggest specific improvements.
```

---

## Key Sources

### Code Generation Prompting
- [Anthropic: Prompting for Frontend Aesthetics](https://github.com/anthropics/claude-cookbooks/blob/main/coding/prompting_for_frontend_aesthetics.ipynb)
- [Anthropic: Frontend Design Skill](https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md)
- [Anthropic: Improving Frontend Design Through Skills](https://claude.com/blog/improving-frontend-design-through-skills)
- [Vercel: How to Prompt v0](https://vercel.com/blog/how-to-prompt-v0)
- [Bolt: Prompting Effectively](https://support.bolt.new/best-practices/prompting-effectively)
- [NN/g: Why Vague Prompts Fail](https://www.nngroup.com/articles/vague-prototyping/)
- [NN/g: CARE Prompt Framework](https://www.nngroup.com/articles/careful-prompts/)
- [Figma: Cooking with Constraints (TC-EBC)](https://www.figma.com/blog/designer-framework-for-better-ai-prompts/)
- [Builder.io: 11 Prompting Tips](https://www.builder.io/blog/prompting-tips)
- [DEV: Consistent UI with AI Prompts](https://dev.to/julian-io/consistent-ui-with-ai-prompts-me5)
- [The New Stack: Prompt to Production Design Systems](https://thenewstack.io/from-prompt-to-production-a-guide-to-ai-generated-design-systems/)
- [CrazyEgg: Best and Worst AI Prompts](https://www.crazyegg.com/blog/ai-web-design-prompts/)
- [Design+Code: Master AI Prompting for Stunning UI](https://designcode.io/prompt-ui/)

### Image Generation
- [Midjourney: Style Reference Docs](https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference)
- [Midjourney: Character Reference](https://docs.midjourney.com/hc/en-us/articles/32162917505293-Character-Reference)
- [Midjourney: Prompt Basics](https://docs.midjourney.com/hc/en-us/articles/32023408776205-Prompt-Basics)
- [Christy Tucker: AI Images with Consistent Style](https://christytuckerlearning.com/ai-images-with-consistent-style-in-midjourney/)
- [OpenAI: DALL-E 3 Cookbook](https://cookbook.openai.com/articles/what_is_new_with_dalle_3)
- [DataStudios: DALL-E 3 Consistent Styles](https://www.datastudios.org/post/dall-e-3-prompts-for-blog-images-consistent-styles-quality-and-workflow)
- [Ideogram: Text & Typography Guide](https://docs.ideogram.ai/using-ideogram/prompting-guide/2-prompting-fundamentals/text-and-typography)
- [Ideogram 3.0 Features](https://ideogram.ai/features/3.0)

### Design Tools
- [Khroma: AI Color Tool](https://www.khroma.co/)
- [Coolors: Color Palette Generator](https://coolors.co/)
- [ColorMagic: AI Palette from Keywords](https://colormagic.app)
- [Fontjoy: AI Font Pairing](https://fontjoy.com/)
- [Components.ai: Generative Design Systems](https://components.ai/)
- [Colorffy: Theme Generator](https://colorffy.com/)
- [TweakCN: shadcn/ui Theme Editor](https://tweakcn.com/)

### Frameworks & Research
- [Medium/Bootcamp: Prompt Engineering for Designers 2026](https://medium.com/design-bootcamp/prompt-engineering-for-designers-how-to-get-stunning-uis-from-ai-in-2026-a431dd241588)
- [Medium: Beyond "Make It Pretty"](https://medium.com/@rijuldahiya/beyond-make-it-pretty-how-to-prompt-ai-for-truly-beautiful-website-designs-74ec4c4b859e)
- [Parallel HQ: Prompt Engineering for Designers 2025](https://www.parallelhq.com/blog/prompt-engineering-designers)
