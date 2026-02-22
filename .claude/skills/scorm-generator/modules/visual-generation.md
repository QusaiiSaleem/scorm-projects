# Visual Asset Generation Module

AI-powered SVG illustration and visual asset pipeline for SCORM courses. Uses **Gemini-powered `generate_svg.py`** as the primary tool for all course illustrations, with `generate_image.py` available as a raster fallback for photographic or complex bitmap needs.

---

## Why SVG-First?

Every visual asset in a SCORM package should start as SVG unless there is a specific reason it cannot be:

- **Zero bloat** — inline SVGs add negligible file size vs. 200-500KB PNGs
- **Auto-theming** — `currentColor` makes every SVG respect the course's CSS custom properties
- **Resolution-independent** — crisp on any screen, any zoom level
- **Self-contained** — no external image requests, works offline inside any LMS
- **Editable** — Claude can read, modify, and refine SVG code directly
- **Animated** — CSS `@keyframes` inside the SVG for draw-on effects, fades, staggers

---

## SVG/CSS-First Decision Tree

Before generating any asset, run through this checklist:

```
"Can this be pure CSS?"
  → YES: Add to decorations.css
  → Examples: gradient meshes, noise textures, geometric patterns,
    layered transparencies, grain overlays, starfields

"Can this be an SVG icon or illustration?"
  → YES: Use generate_svg.py (PRIMARY TOOL)
  → Save icons to: output/[course-name]/shared/assets/icons/
  → Save illustrations to: output/[course-name]/shared/assets/images/

"Does this need photographic realism or complex bitmap textures?"
  → YES: Use generate_image.py (RASTER FALLBACK)
  → Save to: output/[course-name]/shared/assets/images/
  → Use cases: realistic photos, complex textures, photographic backgrounds
```

---

## Primary Tool: generate_svg.py

**Location:** `.claude/skills/scorm-generator/scripts/generate_svg.py`

Generates clean, themeable SVG icons and illustrations using the Gemini API. Supports animated SVGs with CSS `@keyframes`, style presets, use-case templates, prompt patterns, and batch generation.

### Basic Usage

```bash
# Simple icon
python3 .claude/skills/scorm-generator/scripts/generate_svg.py \
  --prompt "warning triangle with exclamation mark" \
  --style line-icon \
  --output output/my-course/shared/assets/icons/warning.svg

# Animated content illustration
python3 .claude/skills/scorm-generator/scripts/generate_svg.py \
  --prompt "brain with neural pathways lighting up" \
  --style detailed \
  --use-case content-illustration \
  --pattern cinematic \
  --width 800 --height 600 \
  --output output/my-course/shared/assets/images/neural-brain.svg

# Static diagram (no animation)
python3 .claude/skills/scorm-generator/scripts/generate_svg.py \
  --prompt "three-step process flow: input, process, output" \
  --style diagram \
  --no-animated \
  --width 900 --height 300 \
  --output output/my-course/shared/assets/images/process-flow.svg

# Fast generation with Flash model
python3 .claude/skills/scorm-generator/scripts/generate_svg.py \
  --prompt "simple checkmark in circle" \
  --model flash \
  --output output/my-course/shared/assets/icons/check.svg
```

### CLI Flags Reference

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--prompt` | `-p` | (required) | Text description of the SVG to generate |
| `--output` | `-o` | (required) | Output file path (.svg) |
| `--style` | `-s` | `line-icon` | Style preset (see table below) |
| `--width` | `-W` | `64` | viewBox width |
| `--height` | `-H` | `64` | viewBox height |
| `--animated` | `-a` | ON | Add CSS @keyframes animation |
| `--no-animated` | | | Disable animation (static SVG) |
| `--model` | `-m` | `pro` | `pro` (Gemini 3.1 Pro, best quality) or `flash` (fast+cheap) |
| `--use-case` | `-u` | | Context template (see below) |
| `--pattern` | | | Quality pattern: `simple`, `cinematic`, `isometric` |
| `--batch` | `-b` | | Path to JSON manifest for batch generation |
| `--batch-output-dir` | | | Output directory for batch mode |

### Style Presets

| Preset | Description | Best For |
|--------|-------------|----------|
| `line-icon` | Minimal line icon, single 2px stroke, no fills, rounded caps | Small icons, UI elements |
| `flat-fill` | Bold filled shapes, no strokes, geometric, clean edges | Card icons, large decorations |
| `detailed` | Mix of fills and strokes, opacity variations, badge quality | Hero illustrations, headers |
| `pattern` | Repeating geometric pattern, tileable, subtle opacity (0.05-0.3) | Section backgrounds, textures |
| `diagram` | Technical diagram, connecting lines and arrows, 1.5px stroke | Process flows, system diagrams |

### Use-Case Templates

The script includes five built-in templates that prepend context-appropriate instructions to your prompt. Use these with the `--use-case` flag:

| Template | What It Produces | Typical Size |
|----------|-----------------|--------------|
| `section-bg` | Abstract background for a slide section. Subtle, decorative, low visual weight — content overlays on top. Soft shapes, flowing curves, geometric patterns. | 1280x720 or 1280x400 |
| `card-icon` | Simple, recognizable icon for a card or button. Single concept, readable at 48x48px. Minimal detail, bold shapes. | 48x48 to 96x96 |
| `content-illustration` | Educational illustration explaining a concept. Clear visual hierarchy, uses visual metaphors rather than literal depictions. | 600x400 to 800x600 |
| `quiz-decoration` | Decorative illustration for a quiz screen. Encouraging and motivational — conveys thinking/discovery. Light, unobtrusive. | 300x300 to 600x400 |
| `module-header` | Wide banner illustration for a module header. Landscape, bold composition, thematic. Works at 1280x400 with text overlaid. | 1280x400 |

#### Example — using a template

```bash
python3 .claude/skills/scorm-generator/scripts/generate_svg.py \
  --prompt "rocket launching from a book, representing knowledge takeoff" \
  --use-case module-header \
  --style detailed \
  --width 1280 --height 400 \
  --output output/my-course/shared/assets/images/module-01-header.svg
```

---

## Prompt Patterns

Three battle-tested prompt structures for different visual goals. Use the `--pattern` flag or apply the thinking manually.

### Pattern A: Simple

> "Clean, minimal SVG. 3-4 shapes max. Every element serves a purpose."

Best for icons, card decorations, and UI elements where clarity matters more than richness.

```bash
# Example: a lightbulb icon for a "key insight" callout
python3 .claude/skills/scorm-generator/scripts/generate_svg.py \
  --prompt "lightbulb with three small rays of light" \
  --pattern simple \
  --style line-icon \
  --width 64 --height 64 \
  --output output/my-course/shared/assets/icons/insight.svg
```

**What you get:** A clean lightbulb shape with exactly three ray lines. Nothing extra.

**When to use:**
- Navigation icons (next, prev, menu, close)
- Status indicators (check, warning, info)
- Card-level illustrations where the text is the star

### Pattern B: Cinematic

> "Atmospheric, layered SVG illustration. Depth through overlapping shapes with varying opacity. Subtle gradients for dimension. Movie poster composition."

Best for hero images, module headers, and anywhere you want visual impact.

```bash
# Example: a dramatic cityscape for an urban planning course
python3 .claude/skills/scorm-generator/scripts/generate_svg.py \
  --prompt "city skyline at dusk, buildings silhouetted against gradient sky, a few lit windows" \
  --pattern cinematic \
  --style detailed \
  --width 1280 --height 400 \
  --output output/my-course/shared/assets/images/urban-hero.svg
```

**What you get:** Layered building silhouettes with varying opacity, a sky gradient from deep blue to amber, scattered lit-window rectangles creating depth.

**When to use:**
- Module headers and course covers
- Section backgrounds that set a mood
- "Wow" moments at the start of a learning journey

### Pattern C: Isometric

> "Isometric 3D-style SVG. 30-degree angles for the isometric grid. Consistent lighting from top-left. Clean geometric precision."

Best for technical subjects, process diagrams, and anything that benefits from a sense of structure and dimension.

```bash
# Example: an isometric server stack for a cybersecurity course
python3 .claude/skills/scorm-generator/scripts/generate_svg.py \
  --prompt "isometric server rack with three stacked servers, status LEDs, network cables" \
  --pattern isometric \
  --style flat-fill \
  --width 600 --height 500 \
  --output output/my-course/shared/assets/images/server-stack.svg
```

**What you get:** Clean geometric server boxes at 30-degree angles, consistent top-left shadows, small colored circles for LEDs, thin lines for cables — all perfectly aligned to an invisible isometric grid.

**When to use:**
- Technology and infrastructure illustrations
- Process and system architecture visuals
- Any subject that benefits from a "built" or "engineered" feeling

---

## Iteration Workflow

SVG generation is not one-shot. The real power is in the **generate-review-refine** loop, because Claude can read and edit SVG code directly.

### Step 1: Generate

```bash
python3 .claude/skills/scorm-generator/scripts/generate_svg.py \
  --prompt "shield with a lock icon in the center" \
  --style flat-fill \
  --use-case card-icon \
  --width 96 --height 96 \
  --output output/my-course/shared/assets/icons/security.svg
```

### Step 2: Review the SVG Code

Open or read the generated `.svg` file. Look for:
- **Too many shapes?** Ask Claude to simplify by removing unnecessary paths
- **Wrong proportions?** Adjust the viewBox or specific transform values
- **Colors hardcoded?** Replace hex values with `currentColor` for theming
- **Animation too fast/slow?** Adjust `animation-duration` and `animation-delay` values
- **Excess complexity?** Remove decorative elements that don't serve the educational goal

### Step 3: Refine

Ask Claude to edit the SVG directly:
- "Make the shield taller and narrower"
- "Change the lock to use currentColor instead of #333"
- "Slow down the draw-on animation to 1.5 seconds"
- "Remove the background circle, keep just the shield and lock"

### Step 4: Final Check

Before using the SVG in a course:
- Does it render correctly at the target size?
- Does it respect `currentColor` (test by changing the parent CSS color)?
- Is the file size reasonable (most SVGs should be under 5KB)?
- Does the animation feel natural and not distracting?

---

## Visual Grammar

What separates effective educational illustrations from decorative filler.

### Effective Educational Illustrations

| Principle | Good | Bad |
|-----------|------|-----|
| **Serves the content** | A brain diagram that shows the specific region being discussed | A generic brain clipart that could go on any page |
| **Visual metaphor** | A bridge connecting two cliffs labeled "beginner" and "expert" | A stock photo of a person at a computer |
| **Hierarchy** | The important element is largest, brightest, most central | Everything is the same size and weight |
| **Restraint** | 3-5 elements that each mean something | 15 decorative shapes that mean nothing |
| **Consistency** | Every illustration in the course shares the same style, weight, palette | Random mix of line icons, filled shapes, and photos |

### Rules of Thumb

1. **If you can remove it and nothing is lost, remove it.** Every shape must teach, orient, or motivate.
2. **Use the same style preset for an entire course.** One course = one style. Never mix `line-icon` and `detailed` in the same course.
3. **Icons should be recognizable at 32px.** If you squint and cannot tell what it is, simplify.
4. **Backgrounds should be invisible.** A section background succeeds when the learner never consciously notices it — it just "feels right."
5. **Color comes from the theme, not the SVG.** Use `currentColor` so the course palette stays in control.

---

## Batch Mode

For courses with many visual assets, generate them all at once using a JSON manifest.

### Manifest Format

Create a JSON file listing every SVG you need:

```json
[
  {
    "name": "module-01-header",
    "prompt": "abstract network of connected nodes, representing collaboration",
    "use_case": "module-header",
    "pattern": "cinematic",
    "style": "detailed",
    "width": 1280,
    "height": 400
  },
  {
    "name": "icon-teamwork",
    "prompt": "three people in a circle, hands connected",
    "use_case": "card-icon",
    "pattern": "simple",
    "style": "line-icon",
    "width": 64,
    "height": 64
  },
  {
    "name": "quiz-think",
    "prompt": "question mark made of gears and lightbulbs",
    "use_case": "quiz-decoration",
    "pattern": "simple",
    "style": "flat-fill",
    "width": 300,
    "height": 300
  },
  {
    "name": "bg-section-02",
    "prompt": "flowing wave pattern, organic curves",
    "use_case": "section-bg",
    "style": "pattern",
    "width": 1280,
    "height": 720
  }
]
```

### Run Batch Generation

```bash
python3 .claude/skills/scorm-generator/scripts/generate_svg.py \
  --batch specs/my-course-assets.json \
  --batch-output-dir output/my-course/shared/assets/images/
```

This generates all four SVGs into the specified output directory, printing progress as it goes:

```
Batch generating 4 SVGs from specs/my-course-assets.json

  [1/4] module-01-header...
  Generated SVG: output/my-course/shared/assets/images/module-01-header.svg (3.2 KB)
  [2/4] icon-teamwork...
  Generated SVG: output/my-course/shared/assets/images/icon-teamwork.svg (1.1 KB)
  [3/4] quiz-think...
  Generated SVG: output/my-course/shared/assets/images/quiz-think.svg (2.4 KB)
  [4/4] bg-section-02...
  Generated SVG: output/my-course/shared/assets/images/bg-section-02.svg (1.8 KB)

Batch complete: 4/4 generated successfully
```

### Manifest Tips

- **`name`** becomes the filename (e.g., `"name": "hero-bg"` outputs `hero-bg.svg`)
- **`use_case`** and **`pattern`** are optional per item — omit them to use defaults
- **`style`** can be set per item, or falls back to the global `--style` flag
- **`width`/`height`** default to 64x64 if omitted — always set them explicitly for non-icon assets

---

## Color Integration

### From Style Guide to SVG Prompt

The art direction phase produces a `_tokens.json` and `_style.md` for the course. Use those colors in your prompts:

```javascript
// From tokens.json
primary: "#2563eb"
secondary: "#64748b"
accent: "#f59e0b"

// In the SVG prompt, reference them:
"...using a blue (#2563eb) and amber (#f59e0b) color scheme"
```

However, for most SVGs, **do not hardcode colors in the prompt**. Instead, let the script generate with `currentColor` and let CSS theming handle the palette. Only specify colors when you need multi-color illustrations where different parts must have different theme colors.

### Embedding SVGs in HTML

```html
<!-- Inline SVG (best for theming — inherits color from parent) -->
<div class="card-icon" style="color: var(--color-primary);">
  <svg viewBox="0 0 64 64"><!-- generated SVG content --></svg>
</div>

<!-- External SVG file (use <img> for simple display) -->
<img src="shared/assets/icons/warning.svg" alt="Warning" width="48" height="48">

<!-- External SVG with theming (use <object> or inline it) -->
<object data="shared/assets/icons/warning.svg" type="image/svg+xml"></object>
```

**Note:** `<img>` tags cannot be styled with CSS (no `currentColor` theming). For themeable SVGs, inline them or use `<object>`.

---

## Raster Fallback: generate_image.py

**Location:** `.claude/skills/scorm-generator/scripts/generate_image.py`

Use this only when SVG cannot do the job — photographic images, complex textures, or realistic scenes.

### When to Use the Raster Fallback

- Photorealistic backgrounds or hero images
- Complex textures that would be enormous as SVG paths
- Images where the art direction specifically calls for photography

### Usage

```bash
python3 .claude/skills/scorm-generator/scripts/generate_image.py \
  --prompt "professional workplace meeting, diverse team" \
  --output output/my-course/shared/assets/images/team-photo.png \
  --width 1280 --height 720 \
  --style professional
```

### Raster Style Presets

| Preset | Description |
|--------|-------------|
| `professional` | Clean corporate, modern aesthetic |
| `illustration` | Flat design, vector art style |
| `isometric` | Isometric 3D, geometric shapes |
| `minimal` | Simple shapes, whitespace |
| `vibrant` | Bold colors, high contrast |
| `technical` | Diagram-style, precise lines |
| `friendly` | Warm, soft colors, approachable |

### Raster Output Specifications

| Asset Type | Dimensions | Format |
|------------|------------|--------|
| Thumbnail | 1280 x 720 | PNG/JPG |
| Module Header | 1200 x 400 | PNG |
| Lesson Image | 800 x 600 | PNG |
| Icon | 256 x 256 | PNG (transparent) |
| Infographic | 1000 x 800 | PNG |

---

## Usage in SCORM Workflow

### 1. Read Style Guide
```
Read art-direction/[course-name]_style.md
Extract: colors, style preset, mood, asset list from the style guide
```

### 2. Generate SVG Assets (Primary Path)
```bash
# For each required asset, use generate_svg.py:
python3 .claude/skills/scorm-generator/scripts/generate_svg.py \
  --prompt "[description from style guide]" \
  --style [preset matching course style] \
  --use-case [section-bg | card-icon | content-illustration | quiz-decoration | module-header] \
  --pattern [simple | cinematic | isometric] \
  --width [width] --height [height] \
  --output "output/[course]/shared/assets/images/[filename].svg"
```

### 3. Generate Raster Assets (Only If Needed)
```bash
# Only for photographic or complex bitmap needs:
python3 .claude/skills/scorm-generator/scripts/generate_image.py \
  --prompt "[description]" \
  --output "output/[course]/shared/assets/images/[filename].png" \
  --width [width] --height [height] \
  --style [preset]
```

### 4. Review and Refine
- Read each generated SVG — simplify if needed
- Replace hardcoded colors with `currentColor`
- Adjust animation timing if present
- Verify consistent style across all course assets

---

## Best Practices

### Do
- Use `generate_svg.py` as the default for every visual asset
- Pick one style preset per course and stick with it
- Use `--use-case` to get context-appropriate compositions
- Review generated SVG code and simplify when possible
- Use `currentColor` for automatic theme integration
- Use `--model flash` for simple icons (faster, cheaper)
- Use `--model pro` for complex illustrations (better quality)
- Create a batch manifest early in the process

### Don't
- Mix SVG styles within a course (one course = one preset)
- Hardcode hex colors in SVGs (use `currentColor`)
- Include `<text>` elements in SVGs (use paths instead, or overlay HTML text)
- Generate raster images when SVG would work
- Skip the review step — always read and refine the generated SVG
- Use overly complex prompts — the model works better with clear, specific descriptions

---

## Fallback Strategy

If SVG generation fails:

1. **Retry with a simpler prompt** — fewer details, fewer shapes
2. **Switch to `--model flash`** — faster, less likely to timeout
3. **Use `--no-animated`** — removes animation complexity from the prompt
4. **Accept the placeholder** — `generate_svg.py` automatically creates a placeholder SVG when the API is unavailable (dashed circle with an X)
5. **Fall back to raster** — use `generate_image.py` as a last resort
6. **Create pure CSS** — for backgrounds and patterns, CSS gradients and shapes may be simpler than any generated asset

---

## Environment Setup

The script requires a `GEMINI_API_KEY` to generate real SVGs. Without it, placeholder SVGs are created automatically.

```bash
# Option 1: Environment variable
export GEMINI_API_KEY="your-key-here"

# Option 2: .env file in the project root
echo 'GEMINI_API_KEY=your-key-here' >> .env
```

The script searches up to 6 parent directories for a `.env` file, so placing it at the project root covers all use cases.
