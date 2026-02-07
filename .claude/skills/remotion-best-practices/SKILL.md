---
name: remotion-best-practices
description: Animation and video creation patterns using Remotion framework for e-learning content. Use when creating intro/outro videos, text animations (typewriter, word reveal, highlight), scene transitions (fade, slide, wipe, zoom), chart animations, or CSS animation fallbacks. Includes timing guidelines, easing functions, and stagger patterns.
---

# Remotion Best Practices Skill

Animation and video creation patterns using Remotion for e-learning content.

## What is Remotion?

Remotion is a framework for creating videos programmatically using React. It allows you to write video content as React components and render them to MP4, WebM, or other formats.

## Core Concepts

### Compositions
A composition defines a video's dimensions, duration, and frame rate.

```tsx
import { Composition } from 'remotion';

export const RemotionRoot = () => {
  return (
    <Composition
      id="CourseIntro"
      component={CourseIntro}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
```

### Sequences
Sequences place components at specific times in the video.

```tsx
import { Sequence } from 'remotion';

export const MyVideo = () => {
  return (
    <>
      <Sequence from={0} durationInFrames={60}>
        <TitleScreen />
      </Sequence>
      <Sequence from={60} durationInFrames={120}>
        <MainContent />
      </Sequence>
    </>
  );
};
```

### Interpolation
Create smooth animations between values.

```tsx
import { useCurrentFrame, interpolate } from 'remotion';

export const FadeIn = ({ children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return <div style={{ opacity }}>{children}</div>;
};
```

## Animation Patterns

### Fade In
```tsx
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: 'clamp',
});
```

### Slide In
```tsx
const translateX = interpolate(frame, [0, 30], [-100, 0], {
  extrapolateRight: 'clamp',
  easing: Easing.out(Easing.ease),
});
```

### Scale Pop
```tsx
const scale = interpolate(frame, [0, 15, 20], [0, 1.1, 1], {
  extrapolateRight: 'clamp',
});
```

### Typewriter Text
```tsx
const TypewriterText = ({ text, charsPerFrame = 0.5 }) => {
  const frame = useCurrentFrame();
  const charsToShow = Math.floor(frame * charsPerFrame);
  return <span>{text.slice(0, charsToShow)}</span>;
};
```

## Timing Guidelines

### Frame Rates
- **30 FPS** - Standard (recommended for most content)
- **60 FPS** - Smooth motion (complex animations)
- **24 FPS** - Cinematic feel

### Duration Reference (at 30 FPS)
| Duration | Frames | Use Case |
|----------|--------|----------|
| 0.5 sec | 15 | Quick transition |
| 1 sec | 30 | Standard animation |
| 2 sec | 60 | Slow reveal |
| 3 sec | 90 | Title hold |
| 5 sec | 150 | Content reading time |

### Easing Functions
```tsx
import { Easing } from 'remotion';

// Smooth deceleration (entrances)
Easing.out(Easing.ease)

// Smooth acceleration (exits)
Easing.in(Easing.ease)

// Bouncy effect
Easing.out(Easing.back(1.5))

// Custom bezier
Easing.bezier(0.4, 0, 0.2, 1)
```

## E-Learning Video Types

### Course Intro (5-10 seconds)
```tsx
export const CourseIntro = () => {
  return (
    <>
      <Sequence from={0} durationInFrames={60}>
        <LogoReveal />
      </Sequence>
      <Sequence from={45} durationInFrames={90}>
        <TitleReveal title="Course Name" />
      </Sequence>
      <Sequence from={120} durationInFrames={60}>
        <TaglineReveal tagline="Transform your skills" />
      </Sequence>
    </>
  );
};
```

### Text Highlight
```tsx
export const HighlightText = ({ text, highlightWords }) => {
  const frame = useCurrentFrame();

  return (
    <p>
      {text.split(' ').map((word, i) => {
        const isHighlight = highlightWords.includes(word);
        const delay = i * 5;
        const opacity = interpolate(frame - delay, [0, 10], [0.3, 1]);

        return (
          <span
            key={i}
            style={{
              opacity,
              color: isHighlight ? '#2563eb' : 'inherit',
              fontWeight: isHighlight ? 'bold' : 'normal',
            }}
          >
            {word}{' '}
          </span>
        );
      })}
    </p>
  );
};
```

### Animated Chart
```tsx
export const BarChart = ({ data }) => {
  const frame = useCurrentFrame();

  return (
    <div className="chart">
      {data.map((item, i) => {
        const delay = i * 10;
        const height = interpolate(
          frame - delay,
          [0, 30],
          [0, item.value],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        return (
          <div
            key={i}
            className="bar"
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
};
```

## Rendering

### CLI Commands
```bash
# Preview in browser
npx remotion preview src/Root.tsx

# Render to MP4
npx remotion render src/Root.tsx CompositionId \
  --output out/video.mp4 \
  --codec h264

# Render to WebM (smaller file)
npx remotion render src/Root.tsx CompositionId \
  --output out/video.webm \
  --codec vp8
```

### Render Settings
```bash
# High quality
--quality 100 --crf 18

# Balanced (recommended)
--quality 80 --crf 23

# Smaller file
--quality 60 --crf 28
```

## Project Structure

```
remotion-project/
├── package.json
├── remotion.config.ts
├── src/
│   ├── Root.tsx              # Composition definitions
│   ├── compositions/
│   │   ├── CourseIntro.tsx
│   │   ├── LessonTransition.tsx
│   │   └── ChartAnimation.tsx
│   ├── components/
│   │   ├── AnimatedText.tsx
│   │   ├── Logo.tsx
│   │   └── Transitions.tsx
│   └── styles/
│       └── theme.ts
└── public/
    ├── fonts/
    └── assets/
```

## CSS Fallbacks

When video isn't needed, use CSS animations instead:

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

/* Slide Up */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.slide-up {
  animation: slideUp 0.5s ease-out forwards;
}

/* Typewriter */
.typewriter {
  overflow: hidden;
  white-space: nowrap;
  animation: typing 2s steps(40) forwards;
}

@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}
```

## Best Practices

### Do
- Keep animations purposeful (guide attention)
- Use consistent timing throughout
- Apply easing for natural motion
- Test on different speeds
- Provide static alternatives

### Don't
- Over-animate (distracting)
- Use jarring transitions
- Make videos too long
- Ignore accessibility
- Forget loading states
