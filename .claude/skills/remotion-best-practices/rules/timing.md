# Animation Timing Guide

## Frame Rate Standards

| FPS | Use Case |
|-----|----------|
| 24 | Cinematic, film-like |
| 30 | Standard web video (recommended) |
| 60 | Smooth motion, gaming content |

**Recommendation:** Use 30 FPS for e-learning content - good balance of smoothness and file size.

## Duration Reference Table

### At 30 FPS

| Seconds | Frames | Use For |
|---------|--------|---------|
| 0.17 | 5 | Micro-interaction |
| 0.33 | 10 | Quick transition |
| 0.5 | 15 | Standard animation |
| 0.67 | 20 | Comfortable reveal |
| 1.0 | 30 | Full animation |
| 1.5 | 45 | Slow reveal |
| 2.0 | 60 | Title hold |
| 3.0 | 90 | Reading time (short) |
| 5.0 | 150 | Reading time (medium) |

## Animation Durations by Type

### UI Elements
- Button hover: 5-10 frames
- Menu open: 10-15 frames
- Modal appear: 15-20 frames
- Page transition: 20-30 frames

### Content Reveals
- Fade in text: 15-20 frames
- Slide in element: 15-25 frames
- List item stagger: 5-10 frames between items
- Image reveal: 20-30 frames

### Video Segments
- Logo animation: 30-60 frames (1-2 sec)
- Title card: 60-90 frames (2-3 sec)
- Intro sequence: 150-300 frames (5-10 sec)
- Transition between topics: 15-30 frames

## Easing Functions

### Import
```tsx
import { Easing } from 'remotion';
```

### Common Easings

| Easing | Pattern | Best For |
|--------|---------|----------|
| `Easing.linear` | Constant speed | Progress bars |
| `Easing.ease` | Subtle accel/decel | General use |
| `Easing.out(Easing.ease)` | Fast start, slow end | Entrances |
| `Easing.in(Easing.ease)` | Slow start, fast end | Exits |
| `Easing.inOut(Easing.ease)` | Slow-fast-slow | Loops |
| `Easing.out(Easing.back(1.5))` | Overshoot | Bouncy entrances |
| `Easing.bezier(0.4,0,0.2,1)` | Material design | Smooth motion |

### Usage Examples

```tsx
// Entrance (fast in, ease out)
interpolate(frame, [0, 20], [0, 1], {
  easing: Easing.out(Easing.ease),
});

// Exit (ease in, fast out)
interpolate(frame, [0, 20], [1, 0], {
  easing: Easing.in(Easing.ease),
});

// Bouncy pop
interpolate(frame, [0, 25], [0, 1], {
  easing: Easing.out(Easing.back(1.5)),
});

// Smooth (Material Design)
interpolate(frame, [0, 20], [0, 1], {
  easing: Easing.bezier(0.4, 0, 0.2, 1),
});
```

## Stagger Patterns

### Linear Stagger
Each item has fixed delay.

```tsx
const staggerDelay = index * 5; // 5 frames between items
const opacity = interpolate(
  frame - staggerDelay,
  [0, 15],
  [0, 1],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
);
```

### Decreasing Stagger
First items slower, speeds up.

```tsx
const staggerDelay = Math.sqrt(index) * 10;
```

### Wave Stagger
Items animate in a wave pattern.

```tsx
const waveOffset = Math.sin(index * 0.5) * 10;
const staggerDelay = index * 5 + waveOffset;
```

## Hold Times

Time content stays on screen for reading:

| Content | Hold Time |
|---------|-----------|
| Single word | 30-45 frames (1-1.5 sec) |
| Short phrase | 60-90 frames (2-3 sec) |
| Sentence | 90-150 frames (3-5 sec) |
| Paragraph | 150-300 frames (5-10 sec) |
| Complex diagram | 180-300 frames (6-10 sec) |

### Calculating Reading Time

```tsx
// ~250 words per minute = ~4 words per second
const wordsPerSecond = 4;
const words = text.split(' ').length;
const readingFrames = (words / wordsPerSecond) * 30; // at 30 FPS
```

## Pacing Guidelines

### Fast Pacing (energetic)
- Quick cuts: 30-60 frames per scene
- Snappy transitions: 10-15 frames
- Stagger: 3-5 frames between items

### Medium Pacing (standard)
- Normal cuts: 90-180 frames per scene
- Smooth transitions: 20-30 frames
- Stagger: 5-10 frames between items

### Slow Pacing (relaxed)
- Long holds: 180-300 frames per scene
- Gentle transitions: 30-45 frames
- Stagger: 10-15 frames between items
