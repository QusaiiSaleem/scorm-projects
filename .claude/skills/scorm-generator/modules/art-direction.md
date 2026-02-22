
# Art Direction — Visual Creative Direction for E-Learning

## Mission

Based on the course specification and topic, create a UNIQUE visual direction by:
1. **Reading ALL themes** from `themes/` directory as **inspiration/reference** (not to copy)
2. **Reading `resources/theme-dna.md`** for curated palette recipes, font pairings, and patterns
3. **Creating a unique theme** tailored to the course topic, audience, and mood
4. Using **premium CSS utilities** from base.css (grain, glass, gradients, shadows, spring easing)
5. Optionally selecting a brand overlay from `themes/brands/`
6. Producing THREE output files:
   - `art-direction/[course-name]_style.md` -- Visual style guide (human-readable)
   - `art-direction/[course-name]_tokens.json` -- Design tokens (machine-readable)
   - `art-direction/[course-name]_theme.css` -- CSS custom properties (ready to copy)
7. Creating guidance for the Visual Generator agent

## Theme Approach: Learn and Create (NOT Select and Copy)

Themes in `themes/` are **reference examples** showing different aesthetic directions. Do NOT copy them directly.

**Workflow:**
1. Read ALL `themes/[theme]/tokens.json` and `themes/[theme]/README.md` for inspiration
2. Read `resources/theme-dna.md` for curated DNA strands (palettes, fonts, backgrounds, motion)
3. Create a **UNIQUE theme** for each course by mixing and matching DNA strands
4. Use premium CSS utilities: `.has-grain`, `.glass`, `.animated-bg`, `.mesh-gradient`, `.shadow-sm/md/lg`, `--spring-bouncy`
5. Save generated theme -- it can be **reused for related courses** in the same series
6. If a brand is specified, layer the brand.css on top

### Theme Reference Library
```
themes/
  _base/base.css              <- Shared foundation (never modify)
  space-explorer/             <- Dark cosmic reference (astronomy, physics)
  corporate-clean/            <- Light professional reference (business)
  bold-gradient/              <- Vibrant gradient reference (creative)
  playful-bright/             <- Colorful gamified reference (youth)
  technical-dark/             <- Code editor reference (programming)
  brands/
    eduarabia/                <- EduArabia brand overlay
    nelc/                     <- NELC institutional brand overlay
```

## Design Quality Framework (5 Dimensions -- NON-NEGOTIABLE)

Every theme must pass the **"Would a designer say wow?" test**. NO generic AI aesthetics. Based on Anthropic's Frontend Aesthetics research.

### Dimension 1: Typography
- NEVER use Inter, Roboto, Open Sans, Arial, or system defaults
- ALWAYS pair a distinctive display font with a refined body font
- Each course must have a unique typographic identity
- Specify: family, weight, size scale, letter-spacing, line-height

**Font Pairing Strategies:**
| Mood | Display Font | Body Font | Personality |
|------|-------------|-----------|-------------|
| Technical | Clash Display | Inter | Sharp, modern, confident |
| Corporate | Gilroy | Source Sans 3 | Professional, trustworthy |
| Playful | Space Grotesk | DM Sans | Friendly, approachable |
| Editorial | Playfair Display | Lora | Elegant, sophisticated |
| Futuristic | Space Mono | IBM Plex Sans | Techy, cutting-edge |
| Warm | Fraunces | Source Serif 4 | Inviting, human |
| Bold | Plus Jakarta Sans | Nunito | Energetic, youthful |
| Minimal | Outfit | Karla | Clean, focused |
| Arabic | Noto Kufi Arabic | Cairo | Arabic-native, modern |
| Arabic Elegant | Aref Ruqaa | Noto Sans Arabic | Traditional, refined |

### Dimension 2: Color
- Commit to a DOMINANT color + SHARP accent (not 5 equal colors)
- Follow 60-30-10 rule: 60% dominant, 30% secondary, 10% accent
- Never use pure black (#000) for dark themes -- use tinted near-blacks
- Accent must contrast strongly against primary

**Premium Palette Recipes:**
| Recipe | Background | Primary | Accent | Best For |
|--------|-----------|---------|--------|----------|
| Dark Premium | `#0a1628` | `#1a2942` | `#635bff` | Science, tech, finance |
| Warm Premium | `#1a1418` | `#2d2024` | `#f59e0b` | Leadership, culture, HR |
| Cool Premium | `#0c1222` | `#162033` | `#38bdf8` | Healthcare, education |
| Vibrant | `#faf5ff` | `#7c3aed` | `#f97316` | Creative, marketing, design |
| Earth Tones | `#faf8f5` | `#78716c` | `#34d399` | Environment, sustainability |

### Dimension 3: Motion
- Define entrance animations in tokens.json (duration, easing, stagger delay)
- Use spring easing: `--spring-gentle`, `--spring-bouncy`, `--spring-snappy`
- Include celebration animation colors (for confetti) in tokens.json
- One well-orchestrated page load > many scattered micro-interactions

### Dimension 4: Backgrounds
- Never specify solid colors -- always layered
- Include grain overlay opacity (0.05-0.15 range) in tokens.json
- Specify gradient type: linear, radial mesh, animated
- Use premium utilities: `.has-grain`, `.glass`, `.mesh-gradient`, `.animated-bg`
- Include decorative elements: geometric shapes, glows, particles

### Dimension 5: Spatial Composition
- Specify section padding (60-120px between major sections)
- Content max-width and alignment
- Asymmetric vs centered layout preference
- Overlap/layering direction
- Generous negative space is premium; dense grids are utilitarian

## Design Philosophy

### E-Learning Visual Principles

1. **Clarity over decoration** - Visuals support learning, not distract
2. **Consistency builds trust** - Unified visual language throughout
3. **Hierarchy guides attention** - Clear visual priority
4. **Whitespace enables focus** - Room to breathe
5. **Accessibility is essential** - WCAG 2.1 AA minimum

### Theme Library → Visual Style Mapping

| Theme | Best For | Characteristics |
|-------|----------|-----------------|
| **space-explorer** | Science, astronomy | Dark, cosmic, glowing accents |
| **corporate-clean** | Business, compliance | Light, minimal, professional |
| **bold-gradient** | Creative, marketing | Vibrant gradients, mesh backgrounds |
| **playful-bright** | Onboarding, youth | Colorful, rounded, gamified |
| **technical-dark** | Programming, IT | Code editor aesthetic, monospace |

---

## Input Requirements

Receive from the specification:
- Course topic and transformation
- Target audience
- Organizational context
- Existing brand guidelines (if any)
- Mood/style preferences from interview

---

## Output: Visual Style Guide

Create a comprehensive style guide:

```markdown
# Visual Style Guide: [Course Name]

## 1. Design Concept

### Theme Statement
[One paragraph describing the overall visual direction and why it fits the course]

### Keywords
[3-5 words that capture the mood: e.g., "Professional, Trustworthy, Modern"]

### Visual Metaphor
[Optional: A unifying visual concept, e.g., "Building blocks" for a construction course]

---

## 2. Color Palette

### Primary Colors
| Role | Color | Hex | RGB | Usage |
|------|-------|-----|-----|-------|
| Primary | [name] | #XXXXXX | rgb(X,X,X) | Headers, buttons, key elements |
| Secondary | [name] | #XXXXXX | rgb(X,X,X) | Supporting elements, backgrounds |
| Accent | [name] | #XXXXXX | rgb(X,X,X) | CTAs, highlights, focus states |

### Neutral Colors
| Role | Hex | Usage |
|------|-----|-------|
| Text Primary | #XXXXXX | Body text |
| Text Secondary | #XXXXXX | Captions, labels |
| Background | #XXXXXX | Page background |
| Surface | #XXXXXX | Cards, panels |
| Border | #XXXXXX | Dividers, outlines |

### Semantic Colors
| Role | Hex | Usage |
|------|-----|-------|
| Success | #XXXXXX | Correct answers, completion |
| Warning | #XXXXXX | Cautions, attention |
| Error | #XXXXXX | Incorrect, errors |
| Info | #XXXXXX | Tips, information |

### Accessibility Check
- Primary on white: [contrast ratio] ✓/✗
- Text on background: [contrast ratio] ✓/✗
- All combinations meet WCAG AA: ✓/✗

---

## 3. Typography

### Font Stack

**Headings:** [Font Name]
- Source: [Google Fonts / System / Custom]
- Weights: [400, 600, 700]
- Fallback: [fallback stack]

**Body:** [Font Name]
- Source: [Google Fonts / System / Custom]
- Weights: [400, 500, 600]
- Fallback: [fallback stack]

**Code/Mono:** [Font Name] (if needed)
- Source: [source]
- Fallback: [fallback stack]

### Arabic Typography (if applicable)
**Arabic Headings:** [Noto Kufi Arabic / Cairo / Tajawal]
**Arabic Body:** [Noto Sans Arabic / Cairo]
- Direction: RTL
- Line height: 1.8 (increased for Arabic)

### Type Scale
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 32px / 2rem | 700 | 1.2 |
| H2 | 24px / 1.5rem | 600 | 1.3 |
| H3 | 20px / 1.25rem | 600 | 1.4 |
| Body | 16px / 1rem | 400 | 1.6 |
| Caption | 14px / 0.875rem | 400 | 1.5 |
| Small | 12px / 0.75rem | 400 | 1.4 |

---

## 4. Visual Style

### Imagery Style
**Primary Style:** [Photography / Illustration / Abstract / Icon-based]

**Photography Guidelines:**
- [ ] Authentic, not stock-looking
- [ ] Diverse representation
- [ ] Relevant to content
- [ ] High quality (min 1200px wide)
- [ ] Consistent color treatment

**Illustration Guidelines:**
- Style: [Flat / Isometric / Hand-drawn / 3D]
- Line weight: [thin / medium / thick]
- Character style: [if applicable]
- Complexity: [simple / detailed]

### Icon Style
- Style: [Outlined / Filled / Duotone]
- Stroke width: [1px / 2px / etc.]
- Corner radius: [sharp / rounded]
- Size: [24px base]

### Shape Language
- Corners: [Sharp / Rounded / Pill]
- Border radius: [0px / 4px / 8px / 16px]
- Shadows: [None / Subtle / Pronounced]

---

## 5. Layout Principles

### Grid System
- Columns: [12-column grid]
- Gutter: [24px]
- Margins: [40px desktop / 20px mobile]
- Max content width: [1200px]

### Spacing Scale
| Name | Value | Usage |
|------|-------|-------|
| xs | 4px | Tight spacing |
| sm | 8px | Related elements |
| md | 16px | Section spacing |
| lg | 24px | Component gaps |
| xl | 32px | Major sections |
| 2xl | 48px | Page sections |

### Component Patterns
- Cards: [rounded corners, subtle shadow]
- Buttons: [pill / rounded / sharp]
- Inputs: [underline / outlined / filled]
- Progress: [bar / circular / steps]

---

## 6. Asset Requirements

### Course Thumbnail
- Size: 1280 x 720px
- Format: JPEG or PNG
- Content: [description of what should be shown]
- Text overlay: [Course title, optional tagline]

### Module Headers
- Size: 1200 x 400px
- Count: [X modules]
- Content per module:
  1. [Module 1 header description]
  2. [Module 2 header description]
  [...]

### Lesson Images
- Size: 800 x 600px or 16:9 ratio
- Count: [X lessons]
- Content per lesson:
  1. [Lesson 1.1 image description]
  2. [Lesson 1.2 image description]
  [...]

### Icons Needed
- Count: [X icons]
- List:
  - [ ] [icon 1 description]
  - [ ] [icon 2 description]
  [...]

### Infographics
- Count: [X infographics]
- Topics:
  1. [Infographic 1 topic and content]
  2. [Infographic 2 topic and content]
  [...]

---

## 7. Motion Design (if applicable)

### Animation Principles
- Easing: [ease-out for entrances, ease-in for exits]
- Duration: [200-400ms for UI, 600-1000ms for content]
- Direction: [consistent motion direction]

### Intro Video Style
- Duration: [5-10 seconds]
- Content: [Logo, course title, tagline]
- Music: [style - upbeat, corporate, ambient]

### Text Animation Style
- Type: [Fade in / Typewriter / Word by word]
- Speed: [characters per second if typewriter]

### Transition Style
- Between lessons: [Fade / Slide / None]
- Between sections: [Fade / Wipe]

---

## 8. Do's and Don'ts

### Do ✓
- Use consistent color application
- Maintain visual hierarchy
- Include alt text for all images
- Test on multiple screen sizes
- Use high-contrast text

### Don't ✗
- Use more than 3 colors prominently
- Mix illustration styles
- Use decorative fonts for body text
- Rely on color alone to convey meaning
- Use low-resolution images

---

## 9. Reference & Inspiration

### Mood Board Elements
[Describe 3-5 reference images or styles that capture the intended look]

1. [Reference 1 description]
2. [Reference 2 description]
3. [Reference 3 description]

### Similar Courses/Brands
[List examples of courses or brands with similar visual direction]

---

## 10. AI Image Generation Prompts

### Thumbnail Prompt
```
[Detailed prompt for generating course thumbnail with generate_svg.py or generate_image.py]
```

### Module Header Prompts
1. Module 1: ```[prompt]```
2. Module 2: ```[prompt]```

### Illustration Style Prompt
```
[Base prompt that defines the illustration style for consistency]
```
```

---

## Output Files (THREE Required)

### 1. Style Guide (human-readable)
Save to: `art-direction/[course-name]_style.md`

### 2. Design Tokens (machine-readable)
Save to: `art-direction/[course-name]_tokens.json`
Follow the same format as `themes/[theme]/tokens.json`.

### 3. Theme CSS (ready to copy into output)
Save to: `art-direction/[course-name]_theme.css`
This file will be COPIED directly into `output/[course-name]/shared/theme.css`.

### Optional: Decorations CSS
Save to: `art-direction/[course-name]_decorations.css`
For starfields, grain overlays, mesh backgrounds, geometric patterns.

### Optional: Brand CSS
If a brand was selected, note it in the style guide. The Content Renderer
will copy `themes/brands/[brand]/brand.css` into the output.

These files will be used by:
- Visual Generator (image creation prompts, SVG/CSS decision)
- Animation Creator (motion design, import tokens.json for Remotion)
- Content Renderer (COPY theme.css instead of rebuilding CSS)

---

## Code Implementation Map

How art direction principles map to actual code in the system:

| Principle | Implemented In | Location |
|-----------|---------------|----------|
| CSS custom properties from tokens.json | `resources/css/base.css` | `:root` defaults (L31-97) |
| Premium shadow system | `resources/css/base.css` | Section 18a: `--shadow-small/medium/large` |
| Micro-interactions (.elastic-click, .hover-lift) | `resources/css/base.css` | Section 18b |
| Spring easing variables | `resources/css/base.css` | Section 18c: `--spring-gentle/bouncy/snappy` |
| Film grain texture | `resources/css/base.css` | Section 18e: `.has-grain` |
| Glassmorphism | `resources/css/base.css` | Section 18f: `.glass`, `.glass-dark`, `.glass-light` |
| Gradient text | `resources/css/base.css` | Section 18g: `.text-gradient` |
| Animated backgrounds | `resources/css/base.css` | Section 18h: `.animated-bg`, `.mesh-gradient` |
| Font loading | Generated `theme.css` | `@font-face` declarations per course |
| Color palette | Generated `theme.css` | `:root` overrides for `--color-*` variables |
| Reduced motion | `resources/css/base.css` | Sections 16 + 18j |
| High contrast | `resources/css/base.css` | Section 17 |

### WHY This Architecture Works

**The "CSS Sandwich"** — base.css provides ALL the mechanical layout and interaction code.
theme.css only needs to set color/font/spacing variables. This means:
- Art direction outputs are tiny (50-100 lines of `:root` overrides)
- Every course automatically gets premium utilities, accessibility, and responsive behavior
- Changing a theme never breaks layout — because layout lives in base.css, not theme.css
