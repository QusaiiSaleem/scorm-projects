# Scene Transitions — Cinematic, Not Slideshow

Basic fades are BANNED. Every transition must feel intentional and crafted.

## Architecture

### Vite Dev Preview Path (AnimatePresence)

AnimatePresence works for **Vite dev preview** (browser playback) but **NOT for Remotion rendering**.
Remotion renders frame-by-frame, so exit animations never complete — the component unmounts instantly.

```tsx
// WORKS: Vite dev preview (real-time browser playback)
// FAILS: Remotion frame-by-frame rendering
<AnimatePresence mode="popLayout">
  <motion.div
    key={currentScene}
    initial={transitions[currentScene].initial}
    animate={transitions[currentScene].animate}
    exit={transitions[currentScene].exit}
    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
  >
    {scenes[currentScene]}
  </motion.div>
</AnimatePresence>
```

**Always use `mode="popLayout"`** — ensures exit and enter animations overlap properly.

### Remotion-Compatible Path (interpolate cross-fade)

For Remotion rendering, use `interpolate()` for transitions and swap scenes by frame number:

```tsx
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

const TRANSITION_FRAMES = 12; // ~0.4s at 30fps

export const Video: React.FC = () => {
  const frame = useCurrentFrame();

  // Determine current scene from frame number
  const currentScene = getSceneForFrame(frame);
  const frameInScene = frame - SCENE_STARTS[currentScene];
  const sceneDuration = SCENE_DURATIONS[currentScene];

  let sceneOpacity = 1;

  // Fade in (skip for first scene)
  if (currentScene > 0 && frameInScene < TRANSITION_FRAMES) {
    sceneOpacity = interpolate(
      frameInScene,
      [0, TRANSITION_FRAMES],
      [0, 1],
      { extrapolateRight: "clamp" }
    );
  }

  // Fade out (skip for last scene)
  if (currentScene < TOTAL_SCENES - 1
      && frameInScene > sceneDuration - TRANSITION_FRAMES) {
    sceneOpacity = interpolate(
      frameInScene,
      [sceneDuration - TRANSITION_FRAMES, sceneDuration],
      [1, 0],
      { extrapolateLeft: "clamp" }
    );
  }

  const CurrentScene = SCENES[currentScene];
  return (
    <AbsoluteFill>
      {/* key={currentScene} triggers Framer Motion initial→animate */}
      <div style={{ opacity: sceneOpacity }}>
        <CurrentScene key={currentScene} />
      </div>
    </AbsoluteFill>
  );
};
```

### Dual-Path Comparison

| Feature | Vite Preview | Remotion Render |
|---------|-------------|-----------------|
| Scene transitions | AnimatePresence exit/enter | `interpolate()` cross-fade |
| Intra-scene animations | Framer Motion `initial→animate` | Framer Motion `initial→animate` (works!) |
| Exit animations | AnimatePresence `exit` | NOT supported — skip |
| Continuous motion | `repeat: Infinity` | `repeat: Infinity` (works!) |
| Timing control | `setTimeout` / `delay` | Frame-based `useCurrentFrame()` |

**Key insight:** Framer Motion `initial→animate` animations work perfectly in Remotion because
they trigger on mount. Only `exit` animations fail (component unmounts before they complete).

## Transition Library

### 1. Clip-Path Circle Reveal
```tsx
const clipPathCircle = {
  initial: { clipPath: 'circle(0% at 50% 50%)' },
  animate: { clipPath: 'circle(75% at 50% 50%)' },
  exit: { clipPath: 'circle(0% at 50% 50%)' },
};
```
**Use for:** Dramatic reveals, hero moments

### 2. Clip-Path Polygon Wipe
```tsx
const clipPathWipe = {
  initial: { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' },
  animate: { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
  exit: { clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' },
};
```
**Use for:** Clean directional reveals

### 3. Morph Expand
A shape from Scene A grows to become Scene B's background.
```tsx
const morphExpand = {
  initial: { scale: 0, borderRadius: '50%' },
  animate: { scale: 1, borderRadius: '0%' },
  exit: { scale: 0, borderRadius: '50%' },
};
```
**Use for:** Connecting related topics

### 4. Perspective Flip
```tsx
const perspectiveFlip = {
  initial: { rotateY: 90, opacity: 0, perspective: 1200 },
  animate: { rotateY: 0, opacity: 1 },
  exit: { rotateY: -90, opacity: 0 },
};
```
**Use for:** Contrasting ideas (before/after, problem/solution)

### 5. Momentum Slide
Both scenes move in the same direction — creates sense of forward motion.
```tsx
const momentumRight = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
};

const momentumUp = {
  initial: { y: '100%', opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: '-100%', opacity: 0 },
};
```
**Use for:** Sequential flow, progress, timeline

### 6. Zoom Through
Feels like the camera flies into the next scene.
```tsx
const zoomThrough = {
  initial: { scale: 0.3, opacity: 0, filter: 'blur(20px)' },
  animate: { scale: 1, opacity: 1, filter: 'blur(0px)' },
  exit: { scale: 3, opacity: 0, filter: 'blur(20px)' },
};
```
**Use for:** Diving deeper into a topic, dramatic emphasis

### 7. Split Reveal
Screen splits open to reveal new content.
```tsx
// Implemented with two half-panels that slide apart
const SplitReveal = ({ children }) => (
  <div className="relative overflow-hidden">
    <motion.div
      className="absolute inset-0 bg-black z-10"
      initial={{ clipPath: 'inset(0 0 0 0)' }}
      animate={{ clipPath: 'inset(0 50% 0 50%)' }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    />
    {children}
  </div>
);
```
**Use for:** Grand reveals, before/after

## Transition Selection Guide

| From → To | Best Transition | Why |
|-----------|----------------|-----|
| Intro → Problem | Zoom Through | Diving into the issue |
| Problem → Solution | Perspective Flip | Contrast in direction |
| Feature 1 → Feature 2 | Momentum Slide | Sequential flow |
| Stats → CTA | Clip-Path Circle | Dramatic focus |
| Any → Final scene | Morph Expand | Wrapping up |
| Final → Loop back | Match Scene 1's entrance | Seamless loop |

## Loop Integrity

The MOST important transition: **Final scene exit → Scene 1 entry**

```tsx
// Scene 1 entrance = reverse of final scene exit
const scene1Enter = { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } };
const finalExit = { exit: { opacity: 0, scale: 1.1 } }; // opposite direction
```

Test by watching the loop point 10+ times. Any stutter = fix it.

## Transition Timing

| Transition Type | Duration | Easing |
|----------------|----------|--------|
| Clip-path | 0.6-0.8s | `[0.4, 0, 0.2, 1]` |
| Morph | 0.8-1.0s | `[0.4, 0, 0.2, 1]` |
| Perspective | 0.6-0.8s | `[0.4, 0, 0.2, 1]` |
| Momentum | 0.5-0.7s | `[0.4, 0, 0.2, 1]` |
| Zoom through | 0.8-1.0s | `[0.7, 0, 0.3, 1]` |
