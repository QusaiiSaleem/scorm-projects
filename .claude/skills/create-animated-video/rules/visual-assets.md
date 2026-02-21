# Visual Assets — SVG Generation for Motion Graphics

Scenes need proper visual assets, not crude CSS shapes. This rule covers both
manual SVG generation (via AI prompts) and automated pipeline (via script).

---

## Manual Workflow: AI-Generated SVGs

### Prompt Template (Gemini 2.5 Pro)

```
Create a single SVG icon for: [DESCRIPTION]

Requirements:
- Clean, minimal SVG code
- Use viewBox="0 0 [WIDTH] [HEIGHT]" (default: 0 0 64 64)
- All colors as currentColor (for CSS theming)
- No <text> elements (renders inconsistently across systems)
- No embedded images or external references
- Optimize paths — minimal nodes, no unnecessary groups
- Style: [STYLE_PRESET]
- File size: under 3KB

Output ONLY the raw SVG code, no markdown fences, no explanation.
```

### Style Presets

| Preset | Description | Best For |
|--------|-------------|----------|
| `line-icon` | Single-weight strokes, no fills, 2px stroke | UI icons, step indicators |
| `flat-fill` | Solid filled shapes, no strokes, geometric | Brand icons, category markers |
| `detailed` | Mixed fills and strokes, subtle gradients | Hero illustrations, emblems |
| `pattern` | Repeating geometric elements, tileable | Background textures, decorations |
| `diagram` | Technical precision, arrows, connectors | Process flows, architecture |

### Prompt Templates by Asset Type

#### Icons (line-icon)
```
Create a single SVG icon: [SUBJECT] in a minimal line-icon style.
2px uniform stroke, no fills, rounded linecaps.
viewBox="0 0 48 48", all strokes as currentColor.
```

#### Emblems (detailed)
```
Create an SVG emblem: [SUBJECT] in a detailed badge/emblem style.
Geometric frame with centered symbol. Mix of fills and strokes.
viewBox="0 0 96 96", use currentColor for primary, opacity variants for depth.
```

#### Patterns (pattern)
```
Create a tileable SVG pattern: [DESCRIPTION].
Must tile seamlessly when repeated. viewBox matches one tile unit.
Use currentColor with varying opacity (0.05-0.3) for subtlety.
```

#### Diagrams (diagram)
```
Create an SVG diagram: [SUBJECT] showing [PROCESS/RELATIONSHIP].
Use arrows, connectors, labeled shapes. Clean technical style.
viewBox="0 0 200 120", currentColor strokes, 1.5px weight.
```

---

## React Embedding Patterns

### Static SVG Component
```tsx
// Simple: inline the SVG as JSX
export const WarningTriangle = ({ className = '' }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M32 8 L4 56 L60 56 Z" />
    <path d="M32 28 L32 40" />
    <circle cx="32" cy="48" r="2" fill="currentColor" />
  </svg>
);
```

### Animated SVG with Framer Motion (Path Draw)
```tsx
import { motion } from 'framer-motion';

export const AnimatedIcon = ({ delay = 0 }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={2}>
    <motion.path
      d="M32 8 L4 56 L60 56 Z"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { delay, duration: 1.2, ease: [0.4, 0, 0.2, 1] },
        opacity: { delay, duration: 0.3 },
      }}
    />
  </svg>
);
```

### Animated Fill Reveal
```tsx
<motion.svg viewBox="0 0 64 64">
  {/* Draw outline first */}
  <motion.path
    d="..."
    stroke="currentColor"
    fill="none"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 1, delay: 0 }}
  />
  {/* Then fill */}
  <motion.path
    d="..."
    fill="currentColor"
    stroke="none"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, delay: 1 }}
  />
</motion.svg>
```

---

## Quality Checklist

Before using any SVG in a scene:

- [ ] Has `viewBox` attribute (not `width`/`height` in pixels)
- [ ] Uses `currentColor` for all colors (enables CSS theming)
- [ ] No `<text>` elements (use HTML text instead)
- [ ] No external references (`xlink:href`, `url()` to external files)
- [ ] File size under 3KB (ideally under 1KB for icons)
- [ ] Renders correctly at 24px, 48px, and 96px sizes
- [ ] Path directions support `pathLength` animation
- [ ] No redundant `<g>` wrappers or empty attributes

---

## Automated Pipeline: generate_svg.py

### CLI Usage

```bash
# Basic
python3 scripts/generate_svg.py \
  --prompt "warning triangle with exclamation mark" \
  --style line-icon \
  --output src/components/icons/warning.svg

# Custom dimensions
python3 scripts/generate_svg.py \
  --prompt "shield with checkmark, trust and protection" \
  --style detailed \
  --width 96 --height 96 \
  --output src/components/icons/shield.svg
```

### Available Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--prompt` | (required) | Text description of the SVG |
| `--style` | `line-icon` | Style preset (line-icon, flat-fill, detailed, pattern, diagram) |
| `--output` | (required) | Output file path (.svg) |
| `--width` | 64 | viewBox width |
| `--height` | 64 | viewBox height |

### Environment

Requires `GEMINI_API_KEY` environment variable. Falls back to a placeholder SVG
(with prompt as XML comment) if the API key is not set or the API call fails.

### Agent Integration

When the animation agent needs visual assets:

1. **Director's Treatment** identifies needed assets (Step 2.5)
2. Agent runs `generate_svg.py` for each asset
3. Agent wraps output SVG in a React component with Framer Motion animation
4. If API is unavailable, agent uses the placeholder SVG and flags for manual replacement

```
# Example agent workflow
python3 scripts/generate_svg.py --prompt "user profile silhouette" --style line-icon --output icons/user.svg
python3 scripts/generate_svg.py --prompt "rising bar chart" --style flat-fill --output icons/chart.svg
python3 scripts/generate_svg.py --prompt "impact map with connected nodes" --style diagram --output icons/map.svg
```

---

## Don't

- Do NOT use CSS shapes (border tricks, clip-path polygons) for icons
- Do NOT use inline emoji as visual elements
- Do NOT embed raster images in SVGs
- Do NOT use `<text>` in SVGs (font rendering varies)
- Do NOT hardcode colors (always `currentColor`)

## Do

- DO generate SVGs for every visual element in the scene
- DO animate paths with `pathLength` for draw-on effects
- DO use `currentColor` for automatic theme compatibility
- DO keep SVGs under 3KB
- DO test at multiple sizes before committing
