# Kinetic Typography — Motion Graphics Style

Typography is NOT just "displaying text" — it's a choreographed performance.

---

## ⚠️ Arabic/RTL Safety — NEVER Split Arabic by Character

Arabic is a **cursive script** — letters connect within each word. Splitting by character
**breaks letter joining** and renders unreadable garbage (isolated letter forms instead of
connected words).

| Script | Split by Character? | Split by Word? |
|--------|-------------------|----------------|
| Latin (English, French) | YES — letters are independent | YES |
| Arabic, Farsi, Urdu | **NEVER** — breaks cursive joins | YES — safe |
| CJK (Chinese, Japanese) | YES — characters are independent | N/A |

**Golden rule:** When text may contain Arabic, ALWAYS stagger by **word**, never by character.

---

## Character Stagger (Latin Only)

The most impactful text animation. Each character enters individually.
**Only use this for Latin/CJK scripts — NEVER for Arabic.**

```tsx
import { motion } from 'framer-motion';

const KineticText = ({ text, className = '' }) => {
  const chars = text.split('');
  
  return (
    <div className={className}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, rotateX: -90, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{
            delay: i * 0.04,
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
          }}
          style={{ display: 'inline-block', transformOrigin: 'bottom' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </div>
  );
};
```

**Variations:**
- `rotateX: -90` → Characters flip up from below (cinematic)
- `rotateY: 90` → Characters rotate in from side (playful)
- `scale: 2, filter: blur(10px)` → Characters zoom in from blur (dramatic)
- `y: -100` → Characters drop from above (gravity)

## Word Stagger (Arabic/RTL Safe)

The same kinetic energy as character stagger, but words stay intact.
**This is the default for ANY text that might contain Arabic.**

```tsx
const KineticText = ({ text, className = '' }) => {
  // Split by WORD, not character — Arabic letters stay connected
  const words = text.split(' ').filter(w => w.length > 0);

  return (
    <div className={className} dir="rtl">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{
            opacity: 0,
            rotateX: -90,
            scale: 0.5,
            y: 20,
          }}
          animate={{
            opacity: 1,
            rotateX: 0,
            scale: 1,
            y: 0,
          }}
          transition={{
            // Multiply stagger by 3 — fewer words need wider gaps
            delay: i * 0.15,
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
          }}
          style={{
            display: 'inline-block',
            transformOrigin: 'center bottom',
            willChange: 'transform, opacity',
          }}
        >
          {word}
          {i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </div>
  );
};
```

**Variations:**
- `rotateX: -90` → Words flip up from below (cinematic)
- `x: 50, filter: blur(10px)` → Words slide in from blur (dramatic, great for RTL)
- `clipPath: polygon(...)` → Mask reveal from right-to-left for RTL

---

## Word-by-Word Reveal

Each word enters as a unit — good for readability.

```tsx
const WordReveal = ({ text, stagger = 0.08 }) => {
  const words = text.split(' ');
  
  return (
    <motion.div className="flex flex-wrap gap-x-3">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            delay: i * stagger,
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};
```

## Line-by-Line with Mask Reveal

Lines slide up from behind a clip mask — broadcast quality.

```tsx
const MaskReveal = ({ lines }) => (
  <div className="space-y-2">
    {lines.map((line, i) => (
      <div key={i} className="overflow-hidden">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{
            delay: i * 0.15,
            duration: 0.7,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {line}
        </motion.div>
      </div>
    ))}
  </div>
);
```

## Highlight / Emphasis

Draw attention to keywords mid-sentence.

```tsx
const HighlightWord = ({ children, delay = 0, color = '#2563eb' }) => (
  <motion.span
    className="relative inline-block"
    initial={{ color: 'inherit' }}
    animate={{ color }}
    transition={{ delay, duration: 0.3 }}
  >
    {children}
    <motion.div
      className="absolute bottom-0 left-0 h-[3px] rounded-full"
      style={{ backgroundColor: color }}
      initial={{ width: 0 }}
      animate={{ width: '100%' }}
      transition={{ delay: delay + 0.2, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    />
  </motion.span>
);
```

## Counter / Number Animation

Animated number counting — great for stats.

```tsx
const AnimatedCounter = ({ from = 0, to, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(from);
  
  useEffect(() => {
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [from, to, duration]);
  
  return <span>{count.toLocaleString()}{suffix}</span>;
};
```

## Typography Scale for Motion

| Role | Weight | Size | Tracking | Animation |
|------|--------|------|----------|-----------|
| Hero headline | Black (900) | 6-8rem | -0.04em | Char stagger |
| Section title | Bold (700) | 3-4rem | -0.02em | Word reveal |
| Body/subline | Light (300) | 1.2-1.5rem | 0 | Blur fade-in |
| Data/number | Black (900) | 5-7rem | -0.02em | Counter |
| Label/tag | Medium (500) | 0.75rem | 0.1em | Slide up |

## Timing Rules

- **Character stagger (Latin only):** 0.03-0.05s per character
- **Word stagger (Arabic safe):** 0.10-0.18s per word (wider gaps because fewer items)
- **Word reveal:** 0.06-0.10s per word
- **Line stagger:** 0.12-0.20s per line
- **Hold time after reveal:** Minimum 1.5s for reading
- **Exit:** Start 0.5s before scene transition

> **Arabic timing tip:** Arabic words are longer on average than English, so use the
> upper range of word stagger delays (0.15-0.18s) for natural rhythm.
