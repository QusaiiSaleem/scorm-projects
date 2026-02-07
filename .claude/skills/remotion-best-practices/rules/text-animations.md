# Text Animation Patterns

## Typewriter Effect

Reveals text character by character, simulating typing.

```tsx
import { useCurrentFrame, interpolate } from 'remotion';

interface TypewriterProps {
  text: string;
  startFrame?: number;
  charsPerFrame?: number;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  startFrame = 0,
  charsPerFrame = 0.5,
}) => {
  const frame = useCurrentFrame();
  const effectiveFrame = Math.max(0, frame - startFrame);
  const charsToShow = Math.floor(effectiveFrame * charsPerFrame);
  const displayText = text.slice(0, charsToShow);

  return (
    <span>
      {displayText}
      {charsToShow < text.length && (
        <span className="cursor">|</span>
      )}
    </span>
  );
};
```

**Best for:** Instructions, code snippets, dramatic reveals

---

## Word-by-Word Reveal

Each word fades/slides in sequentially.

```tsx
export const WordByWord: React.FC<{ text: string; delayPerWord?: number }> = ({
  text,
  delayPerWord = 5,
}) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');

  return (
    <p>
      {words.map((word, i) => {
        const wordDelay = i * delayPerWord;
        const opacity = interpolate(
          frame - wordDelay,
          [0, 10],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        const translateY = interpolate(
          frame - wordDelay,
          [0, 10],
          [10, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        return (
          <span
            key={i}
            style={{
              opacity,
              transform: `translateY(${translateY}px)`,
              display: 'inline-block',
              marginRight: '0.25em',
            }}
          >
            {word}
          </span>
        );
      })}
    </p>
  );
};
```

**Best for:** Headlines, key messages, poetic content

---

## Highlight Keywords

Emphasizes specific words within a sentence.

```tsx
export const HighlightKeywords: React.FC<{
  text: string;
  keywords: string[];
  highlightColor?: string;
}> = ({ text, keywords, highlightColor = '#2563eb' }) => {
  const frame = useCurrentFrame();

  return (
    <p>
      {text.split(' ').map((word, i) => {
        const isKeyword = keywords.some(
          kw => word.toLowerCase().includes(kw.toLowerCase())
        );

        if (!isKeyword) {
          return <span key={i}>{word} </span>;
        }

        const highlightStart = 30 + i * 3;
        const scale = interpolate(
          frame,
          [highlightStart, highlightStart + 10, highlightStart + 15],
          [1, 1.1, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        const bgOpacity = interpolate(
          frame,
          [highlightStart, highlightStart + 10],
          [0, 0.2],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        return (
          <span
            key={i}
            style={{
              color: highlightColor,
              fontWeight: 'bold',
              transform: `scale(${scale})`,
              display: 'inline-block',
              backgroundColor: `rgba(37, 99, 235, ${bgOpacity})`,
              padding: '0 4px',
              borderRadius: '4px',
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

**Best for:** Key concepts, important terms, call-to-action

---

## Line-by-Line Reveal

Each line appears sequentially with a stagger effect.

```tsx
export const LineByLine: React.FC<{
  lines: string[];
  delayPerLine?: number;
}> = ({ lines, delayPerLine = 20 }) => {
  const frame = useCurrentFrame();

  return (
    <div>
      {lines.map((line, i) => {
        const lineDelay = i * delayPerLine;
        const opacity = interpolate(
          frame - lineDelay,
          [0, 15],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        const translateX = interpolate(
          frame - lineDelay,
          [0, 15],
          [-20, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        return (
          <p
            key={i}
            style={{
              opacity,
              transform: `translateX(${translateX}px)`,
            }}
          >
            {line}
          </p>
        );
      })}
    </div>
  );
};
```

**Best for:** Lists, bullet points, steps

---

## Timing Recommendations

| Effect | Duration (frames @ 30fps) | Use Case |
|--------|---------------------------|----------|
| Typewriter | 2-4 chars/frame | Short text, code |
| Word reveal | 5-8 frames/word | Headlines |
| Line reveal | 15-20 frames/line | Lists |
| Highlight pulse | 10-15 frames | Keywords |
