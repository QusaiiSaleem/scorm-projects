# Visual Asset Generation Module

AI-powered image generation and SVG/CSS-first visual asset pipeline for SCORM courses.

# Nano Banana Pro Skill

AI-powered image generation for e-learning content using text-to-image models.

## Capabilities

### Image Types
- **Course Thumbnails** - Eye-catching preview images
- **Module Headers** - Section banner images
- **Lesson Illustrations** - Concept visualizations
- **Infographics** - Data and process visuals
- **Icons** - Simple concept representations
- **Character Art** - Consistent characters/mascots

### Style Presets
- `professional` - Clean corporate aesthetic
- `illustration` - Flat design illustration
- `isometric` - 3D isometric graphics
- `minimal` - Simple, clean visuals
- `vibrant` - Bold, colorful imagery
- `technical` - Diagrams and schematics
- `friendly` - Warm, approachable style

## Prompt Engineering

### Structure
```
[Art style], [Subject], [Composition], [Colors], [Quality modifiers]
```

### Example Prompts

#### Course Thumbnail
```
Professional flat illustration,
workplace safety training concept,
hard hat and safety icons floating in space,
blue and yellow color scheme (#2563eb, #f59e0b),
clean white background,
modern e-learning thumbnail,
16:9 aspect ratio,
high quality
```

#### Lesson Illustration
```
Flat design illustration,
team collaboration meeting,
diverse group of professionals around table,
warm corporate colors,
minimal background,
centered composition,
educational style
```

#### Infographic Base
```
Clean infographic template,
process flow diagram style,
5 connected steps,
professional blue palette,
white background,
space for text labels,
modern flat design
```

### Style Consistency Lock
Add to all prompts in a course:
```
[STYLE: flat illustration, color palette (#2563eb, #64748b, #f59e0b),
clean minimal aesthetic, consistent with course branding]
```

## Color Integration

### From Style Guide to Prompt
```javascript
// Style guide colors
primary: "#2563eb"
secondary: "#64748b"
accent: "#f59e0b"

// Prompt format
"color palette using professional blue (#2563eb),
warm gray (#64748b), and amber accent (#f59e0b)"
```

## Output Specifications

### Recommended Sizes
| Asset Type | Dimensions | Format |
|------------|------------|--------|
| Thumbnail | 1280 x 720 | PNG/JPG |
| Module Header | 1200 x 400 | PNG |
| Lesson Image | 800 x 600 | PNG |
| Icon | 256 x 256 | PNG (transparent) |
| Infographic | 1000 x 800 | PNG |

### Quality Settings
- Resolution: High (1024px minimum width)
- Format: PNG for transparency, JPG for photos
- Compression: Optimize for web (< 500KB)

## SVG/CSS-First Decision Tree

Before generating raster images, check if the asset can be lighter-weight:

```
"Can this be an SVG icon?"
  → YES: Create SVG with currentColor (auto-themes with CSS)
  → Save to: output/[course-name]/shared/assets/icons/

"Can this be pure CSS?"
  → YES: Add to course decorations.css
  → Examples: gradient meshes, noise textures, geometric patterns,
    layered transparencies, grain overlays, starfields

"Needs realistic/complex imagery?"
  → YES: Use nano-banana-pro (PNG) — continue below
  → Save to: output/[course-name]/shared/assets/images/
```

**Why SVG/CSS first?**
- Zero file size overhead (inline or tiny files)
- Auto-themes with CSS custom properties
- Crisp at any resolution
- No external dependencies
- Self-contained in the SCORM package

## Usage in SCORM Workflow

### 1. Read Style Guide
```
Read art-direction/[course-name]_style.md
Extract: colors, style, mood, asset list
```

### 2. Generate Assets
```bash
# For each required asset:
python3 .claude/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "[constructed prompt]" \
  --output "output/[course]/shared/assets/images/[filename].png" \
  --width [width] \
  --height [height]
```

### 3. Verify Output
- Check dimensions match spec
- Verify style consistency
- Confirm file saved correctly

## Best Practices

### Do
- Use consistent style across all course images
- Include color codes in prompts
- Specify aspect ratios
- Request clean backgrounds
- Use quality modifiers

### Don't
- Mix different illustration styles
- Include text in generated images (add separately)
- Use overly complex prompts
- Request copyrighted characters
- Expect perfect results on first try

## Fallback Strategy

If generation fails:
1. Retry with simplified prompt
2. Use alternative style preset
3. Generate placeholder with solid color
4. Log issue for manual creation

## Scripts

### generate_image.py
Main script for image generation.

```python
# Usage
python3 generate_image.py \
  --prompt "Your prompt here" \
  --output "path/to/output.png" \
  --width 1280 \
  --height 720 \
  --style professional
```

### font_to_image.py
Generate text as images for overlays.

```python
# Usage
python3 font_to_image.py \
  --text "Course Title" \
  --font "Inter" \
  --size 48 \
  --color "#ffffff" \
  --output "path/to/title.png"
```
