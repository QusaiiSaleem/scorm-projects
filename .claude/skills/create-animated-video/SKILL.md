---
name: create-animated-video
description: Create broadcast-quality animated videos using React, Framer Motion, GSAP, and Three.js. NOT a website builder — this is a motion graphics directing framework for agency-quality video content. Use when creating intro/outro videos, brand films, promotional motion pieces, kinetic typography, or any animated video that needs to feel crafted, not assembled.
---

# Motion Graphics Director — The Playbook

Read this top to bottom before writing ANY code. This is your directing brief.
Code patterns live in `rules/` — this file tells you WHAT to do and WHEN to consult them.

---

## 1. Identity + Anti-Patterns

**You are NOT building a website. You are directing a high-end motion piece.**

- NO interactivity: No buttons, no menus, no clicking
- NO slideshow look: Centered text + fade = FAILURE
- Every scene must have depth, visual surprise, and a specific aesthetic POV
- The video auto-plays and loops seamlessly

**The "Agency Test" preview** — at the end of this file you'll run 6 quality checks.
Keep them in mind from the start. If any scene looks like PowerPoint, you failed.

---

## 2. Tech Stack + Constraints

| Layer | Tool | Role |
|-------|------|------|
| Framework | React + Tailwind CSS | Component architecture |
| Orchestration | Framer Motion (v11+) | Scene management |
| Complex motion | GSAP | Timelines, morphing |
| 3D/Particles | Three.js / @react-three/fiber | Background depth |
| Physics | @react-spring/web | Natural spring animations |
| Video Render | Remotion | Frame-by-frame MP4 export |
| Icons | Lucide (minimal) | Accent elements only |
| Fonts | Google Fonts (max 2) | Display + Body |

### Performance Rules
- **GPU-only:** Animate `transform` (x, y, scale, rotate) and `opacity`
- **Always:** `will-change: transform` on animated elements
- **Never:** Animate `width`, `height`, `top`, `left`, `margin`, `padding`
- **Target:** 60fps — no frame drops

### Resolution
- Standard: 1920x1080 (16:9) at 30fps
- Square: 1080x1080 (1:1) for social
- Vertical: 1080x1920 (9:16) for reels
- All content inside **90% safe zone**

---

## 3. The Directing Process

Follow these steps IN ORDER. Do not skip ahead.

### Step 1: Director's Treatment
Before ANY code, write this document:

```markdown
## Director's Treatment
- **Aesthetic:** [e.g., "Kinetic Energy", "Cinematic Minimal", "Neon Brutalist"]
- **Palette:** [exact hex codes — max 5 colors]
- **Typography:** [Display font + Body font]
- **Mood:** [3-5 adjectives: bold, rhythmic, luxurious...]
- **Reference:** [What does this feel like? Apple keynote? Nike ad?]
```

### Step 2: Visual Layering (3 Layers Minimum)
Every scene MUST have three layers. No exceptions.

| Layer | What | Examples |
|-------|------|---------|
| **Background** | Animated environment | Gradient shifts, noise textures, blurred blobs, particles |
| **Midground** | Depth elements | Floating shapes, accent lines, parallax textures, grids |
| **Foreground** | Primary content | Massive typography, key visuals, data, the message |

**The Slideshow Test:** If a scene is just centered text on a flat background → it FAILS.

→ Code patterns for all 3 layers: `rules/visual-layers.md`

### Step 2.5: Generate Visual Assets
Before choreographing, generate the SVG icons and illustrations:

- Every icon uses `currentColor` for theming
- Animate SVG paths with Framer Motion's `pathLength` for draw effects
- Use the automated script or craft manually

→ Prompt templates + React patterns: `rules/visual-assets.md`
→ AI generation script: `scripts/generate_svg.py --prompt "..." --style line-icon --output path.svg`

### Step 3: Intra-Scene Choreography
Nothing appears all at once. Every scene is a timed sequence:

```
T+0.0s  Background shifts/pulses
T+0.2s  Accent element enters (line draws, shape appears)
T+0.5s  Primary content begins staggering in
T+0.8s  Secondary content appears
T+1.2s  Supporting elements arrive
T+1.5s  Everything settled — hold for reading
T+[end-0.5s]  Exit choreography begins
```

**Continuous motion:** Background elements must drift, pulse, or breathe DURING the scene — never static.

→ Full choreography system + stagger patterns: `rules/timing.md`

### Step 4: Cross-Scene Continuity ("One-Shot" Feel)
This separates amateur from agency. Use **Persistent Anchors** — elements that live
OUTSIDE scene transitions and morph between scenes (logo, accent shape, progress bar).

```tsx
{/* Persistent — morphs between scenes */}
<motion.div
  animate={{
    x: sceneAnchors[currentScene].x,
    scale: sceneAnchors[currentScene].scale,
    backgroundColor: sceneAnchors[currentScene].color
  }}
  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
/>
```

### Step 5: Scene Transitions
**Ban basic fades.** Choose cinematic transitions:

| Transition | When to Use |
|------------|------------|
| **Clip-Path Reveal** | Dramatic moments (circle/polygon grows) |
| **Morph Expand** | Connected topics (shape becomes next bg) |
| **Perspective Flip** | Contrasting ideas (3D Y-axis rotation) |
| **Momentum Slide** | Sequential flow (same direction) |
| **Zoom Through** | Diving deeper (scale + blur) |

→ All 7 transition code patterns + selection guide: `rules/transitions.md`

**CRITICAL: Remotion rendering.** AnimatePresence `exit` animations do NOT work in Remotion
(component unmounts before animation completes). For video export, use `interpolate()` cross-fades.
→ Full Remotion workaround: `rules/transitions.md` > "Remotion-Compatible Path"

---

## 4. Design Principles

### Typography as Art
- **Mix weights:** Black (900) + Light (300) in the same headline
- **Tight tracking:** `-0.02em` to `-0.05em` for display type
- **Kinetic type:** Characters/words stagger in with `rotateX` and `scale`
- **Negative space:** Generous whitespace, asymmetric layouts — don't center everything

→ Font library (Display/Body/Arabic) + proven pairings: `rules/typography-fonts.md`
→ All text animation patterns (stagger, blur, mask, counter): `rules/text-animations.md`

### Arabic/RTL Golden Rule

**NEVER split Arabic text by character.** Arabic is cursive — characters connect within words.

| Mode | Method | Arabic Safe? |
|------|--------|-------------|
| Character stagger | `text.split('')` | **NO** — breaks cursive |
| Word stagger | `text.split(' ')` | **YES** — words stay intact |
| Word blur-in | `text.split(' ')` + blur | **YES** |
| Line reveal | Clip-path polygon | **YES** — one DOM element |

RTL checklist: `dir="rtl"`, `lang="ar"`, Arabic fonts (Cairo, Noto Kufi Arabic, Tajawal),
clip-path reveals from RIGHT to LEFT.

→ Full Arabic-safe implementations: `rules/text-animations.md` > "Word Stagger"

---

## 5. Motion System

### Easing Reference

| Easing | Framer Motion | Use Case |
|--------|--------------|----------|
| Smooth decel | `[0.4, 0, 0.2, 1]` | Entrances (default — use 80% of the time) |
| Sharp decel | `[0, 0, 0.2, 1]` | Quick snaps |
| Bouncy | `{ type: "spring", stiffness: 300, damping: 20 }` | Playful entrances |
| Dramatic | `[0.7, 0, 0.3, 1]` | Slow reveals |
| Elastic | `{ type: "spring", stiffness: 400, damping: 10 }` | Attention grab |

### Pacing Guide

| Tempo | Scene Duration | Transition | Stagger | Feel |
|-------|---------------|------------|---------|------|
| **Fast** | 3-4s | 0.3-0.5s | 0.03s | Energetic, hype |
| **Medium** | 5-6s | 0.6-0.8s | 0.05s | Professional, clear |
| **Slow** | 7-10s | 0.8-1.2s | 0.08s | Cinematic, luxurious |

### Stagger Timing
- **Character (Latin only):** 0.03-0.05s per character
- **Word (Arabic safe):** 0.10-0.18s per word
- **Line:** 0.12-0.20s per line
- **Hold after reveal:** Minimum 1.5s for reading

→ Full timing system + 4 stagger pattern types: `rules/timing.md`

---

## 6. Dual-Path Rendering

| Feature | Vite Preview (`pnpm dev`) | Remotion Render (`pnpm studio`) |
|---------|--------------------------|-------------------------------|
| Scene transitions | AnimatePresence exit/enter | `interpolate()` cross-fade |
| Intra-scene animation | Framer Motion `initial→animate` | Framer Motion `initial→animate` (works!) |
| Exit animations | AnimatePresence `exit` | **NOT supported** — skip |
| Timing control | `setTimeout` / `delay` | Frame-based `useCurrentFrame()` |

**Key insight:** Framer Motion `initial→animate` works perfectly in Remotion.
Only `exit` animations fail (component unmounts before they complete).

### Package Scripts
```json
{
  "dev": "vite",
  "studio": "remotion studio src/remotion/index.ts",
  "render": "remotion render src/remotion/index.ts Video --output out/video.mp4",
  "build": "vite build"
}
```

### Tailwind v4 + Remotion Webpack Config
```ts
// remotion.config.ts
import { Config } from "@remotion/cli/config";
Config.overrideWebpackConfig((config) => {
  config.module?.rules?.push({
    test: /\.css$/,
    use: ["style-loader", "css-loader", "postcss-loader"],
  });
  return config;
});
```

### Architecture: useVideoPlayer Hook
```tsx
const SCENE_DURATIONS = [5000, 4000, 6000, 4000, 5000]; // ms per scene

function useVideoPlayer() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const totalScenes = SCENE_DURATIONS.length;

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      setCurrentScene((prev) => (prev + 1) % totalScenes);
    }, SCENE_DURATIONS[currentScene]);
    return () => clearTimeout(timer);
  }, [currentScene, isPlaying]);

  return { currentScene, totalScenes, isPlaying };
}
```

---

## 7. SCORM Course Integration

When creating animations for SCORM courses, read these project files:

- `art-direction/[course-name]_style.md` — Visual style + motion preferences
- `art-direction/[course-name]_tokens.json` — Design tokens (import for Remotion)
- `specs/[course-name]_spec.md` — Course specification
- `specs/[course-name]_structure.md` — Learning structure

Import tokens directly as JSON:
```tsx
import tokens from '../../art-direction/[course-name]_tokens.json';
const theme = { primary: tokens.colors.primary, fontHeading: tokens.fonts.heading };
```

### Project Structure
```
src/
├── App.tsx                    # Main component + useVideoPlayer
├── scenes/
│   ├── Scene1_Intro.tsx       # Each scene is self-contained
│   ├── Scene2_Problem.tsx
│   └── Scene3_Solution.tsx
├── components/
│   ├── PersistentAnchors.tsx  # Cross-scene elements
│   ├── KineticText.tsx        # Typography animations
│   └── icons/                 # SVG components
├── hooks/
│   └── useVideoPlayer.ts
└── remotion/
    ├── Root.tsx               # Remotion composition registry
    └── Video.tsx              # Frame-based scene switcher
```

---

## 8. Quality Gate — The Agency Test

Run these 6 checks before delivery. If ANY fails, fix it.

| Test | Question | If Fails |
|------|----------|----------|
| **Squint Test** | Is hierarchy clear when blurred? | Fix typography scale |
| **Mute Test** | Does the story work without audio? | Strengthen visual narrative |
| **Slideshow Test** | Does any scene look like PowerPoint? | Add layers + stagger timing |
| **Static Test** | Is anything not moving during a scene? | Add continuous background motion |
| **Loop Test** | Does final exit flow into Scene 1? | Fix exit/entry animations |
| **Containment** | Everything within 16:9 frame? | Fix overflow |

→ For premium polish techniques (SplitType, variable fonts, SVG line draw): `rules/advanced-effects.md`

### Don't
- Add ANY interactivity (buttons, links, hover states)
- Use basic fade as the only transition
- Show a scene with flat background + centered text
- Let anything stay static during a scene
- Use more than 2 Google Fonts
- Forget the loop — final scene must flow back to Scene 1
- Animate layout properties (width, height, top, left)
- Split Arabic text by character

### Do
- Write a Director's Treatment before any code
- 3 visual layers minimum per scene
- Choreograph every element's entrance timing
- Use persistent anchors for cross-scene continuity
- GPU-only animations (transform + opacity)
- Run the Agency Test before delivery

---

## 9. Rules Reference — Code Pattern Libraries

Consult these during implementation. Each file is a self-contained code pattern reference.

| File | What's Inside | When to Read |
|------|--------------|-------------|
| `rules/text-animations.md` | Character stagger, word stagger (Arabic safe), mask reveal, counters, highlight | Implementing any text animation |
| `rules/transitions.md` | 7 cinematic transitions, Remotion cross-fade workaround, loop integrity | Implementing scene changes |
| `rules/timing.md` | Choreography template, 4 stagger patterns, easing system, pacing profiles | Setting up scene timing |
| `rules/visual-layers.md` | 4 background types, midground elements, foreground composition, color palettes | Building the 3-layer system |
| `rules/visual-assets.md` | SVG prompt templates, 5 style presets, React embedding patterns, quality checklist | Generating icons/illustrations |
| `rules/typography-fonts.md` | Font library (Display/Body/Arabic), 10 proven pairings, type scale | Choosing fonts |
| `rules/advanced-effects.md` | SplitType, text scramble, variable fonts, image reveals, SVG line draw | Adding premium polish |
