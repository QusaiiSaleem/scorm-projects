# Transition Patterns

## Fade Transition

Simple opacity crossfade between scenes.

```tsx
import { useCurrentFrame, interpolate, Sequence, AbsoluteFill } from 'remotion';

interface FadeTransitionProps {
  children: React.ReactNode;
  durationInFrames?: number;
}

export const FadeIn: React.FC<FadeTransitionProps> = ({
  children,
  durationInFrames = 20,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const FadeOut: React.FC<FadeTransitionProps> = ({
  children,
  durationInFrames = 20,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, durationInFrames], [1, 0], {
    extrapolateRight: 'clamp',
  });

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};
```

**Best for:** Subtle scene changes, professional feel

---

## Slide Transition

Content slides in from a direction.

```tsx
import { Easing } from 'remotion';

type Direction = 'left' | 'right' | 'up' | 'down';

export const SlideIn: React.FC<{
  children: React.ReactNode;
  direction?: Direction;
  durationInFrames?: number;
}> = ({ children, direction = 'left', durationInFrames = 20 }) => {
  const frame = useCurrentFrame();

  const getTransform = () => {
    const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.ease),
    });

    switch (direction) {
      case 'left':
        return `translateX(${(1 - progress) * -100}%)`;
      case 'right':
        return `translateX(${(1 - progress) * 100}%)`;
      case 'up':
        return `translateY(${(1 - progress) * -100}%)`;
      case 'down':
        return `translateY(${(1 - progress) * 100}%)`;
    }
  };

  return (
    <AbsoluteFill style={{ transform: getTransform() }}>
      {children}
    </AbsoluteFill>
  );
};
```

**Best for:** Sequential content, showing progression

---

## Wipe Transition

Reveals new content by "wiping" across the screen.

```tsx
export const WipeIn: React.FC<{
  children: React.ReactNode;
  direction?: 'left' | 'right';
  durationInFrames?: number;
}> = ({ children, direction = 'left', durationInFrames = 20 }) => {
  const frame = useCurrentFrame();

  const clipProgress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.ease),
  });

  const clipPath = direction === 'left'
    ? `inset(0 ${100 - clipProgress}% 0 0)`
    : `inset(0 0 0 ${100 - clipProgress}%)`;

  return (
    <AbsoluteFill style={{ clipPath }}>
      {children}
    </AbsoluteFill>
  );
};
```

**Best for:** Dramatic reveals, before/after comparisons

---

## Zoom Transition

Content zooms in or out.

```tsx
export const ZoomIn: React.FC<{
  children: React.ReactNode;
  durationInFrames?: number;
}> = ({ children, durationInFrames = 25 }) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, durationInFrames], [0.8, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.2)),
  });

  const opacity = interpolate(frame, [0, durationInFrames * 0.5], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
```

**Best for:** Focus points, emphasis, modern feel

---

## Cross-Dissolve

Smooth blend between two scenes.

```tsx
export const CrossDissolve: React.FC<{
  scene1: React.ReactNode;
  scene2: React.ReactNode;
  transitionFrame: number;
  transitionDuration?: number;
}> = ({
  scene1,
  scene2,
  transitionFrame,
  transitionDuration = 30,
}) => {
  const frame = useCurrentFrame();

  const scene2Opacity = interpolate(
    frame,
    [transitionFrame, transitionFrame + transitionDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <>
      <AbsoluteFill>{scene1}</AbsoluteFill>
      <AbsoluteFill style={{ opacity: scene2Opacity }}>
        {scene2}
      </AbsoluteFill>
    </>
  );
};
```

**Best for:** Scene changes, topic transitions

---

## Transition Guidelines

| Transition | Duration | When to Use |
|------------|----------|-------------|
| Fade | 15-20 frames | Default, subtle |
| Slide | 15-25 frames | Sequential content |
| Wipe | 15-20 frames | Dramatic reveal |
| Zoom | 20-30 frames | Emphasis, focus |
| Cross-dissolve | 20-30 frames | Scene changes |

### Timing Tips

- **Entrance animations:** Use `Easing.out()` (fast start, slow end)
- **Exit animations:** Use `Easing.in()` (slow start, fast end)
- **Emphasis:** Use `Easing.back()` for slight overshoot
- **Smooth:** Use `Easing.bezier(0.4, 0, 0.2, 1)` for natural motion
