# Advanced Effects — Learned from Award-Winning Sites

## Lenis Smooth Scroll

Industry standard for smooth scrolling. Pairs with GSAP ScrollTrigger.

```tsx
// Install: npm install lenis
import Lenis from 'lenis';
import { useEffect } from 'react';

const useSmoothScroll = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);
};
```

**When to use:** Any video that uses scroll-driven scenes or parallax.
**For auto-playing videos:** Not needed — Lenis is for scroll-based experiences.

## SplitType — Professional Text Splitting

Don't manually `.split('')`. Use SplitType for proper line/word/char splitting with overflow masks.

```tsx
// Install: npm install split-type
import SplitType from 'split-type';
import gsap from 'gsap';

const animateText = (selector: string, opts = {}) => {
  const split = new SplitType(selector, { types: 'lines, words, chars' });

  // Wrap lines in overflow:hidden for clean mask reveals
  split.lines?.forEach(line => {
    const wrapper = document.createElement('div');
    wrapper.style.overflow = 'hidden';
    line.parentNode?.insertBefore(wrapper, line);
    wrapper.appendChild(line);
  });

  gsap.from(split.chars, {
    y: 100,
    opacity: 0,
    duration: 0.8,
    stagger: 0.02,
    ease: 'power3.out',
    ...opts,
  });
};
```

**Why better than manual split:**
- Handles multi-line text properly
- Preserves original DOM structure
- Line-level overflow masking built-in
- Works with responsive text reflows

## Text Scramble / Decode Effect

Letters cycle through random characters before settling on the correct letter.

```tsx
import { useState, useEffect, useCallback } from 'react';

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

const useTextScramble = (finalText: string, duration = 2000) => {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    const length = finalText.length;
    const interval = duration / (length * 3);
    let iteration = 0;

    const timer = setInterval(() => {
      setDisplay(
        finalText
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (i < iteration / 3) return finalText[i];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      iteration++;
      if (iteration >= length * 3) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [finalText, duration]);

  return display;
};

// Usage
const ScrambleText = ({ text }) => {
  const display = useTextScramble(text, 1500);
  return <span className="font-mono">{display}</span>;
};
```

**Best for:** Tech brands, hacker aesthetic, data reveals, dramatic number reveals.

## Custom Cursor

Replace the default cursor with a branded animated element.

```tsx
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const springX = useSpring(cursorX, { stiffness: 500, damping: 28 });
  const springY = useSpring(cursorY, { stiffness: 500, damping: 28 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-white mix-blend-difference pointer-events-none z-[9999]"
      style={{ x: springX, y: springY }}
    />
  );
};
```

**Note for videos:** Custom cursor only makes sense in interactive demos. For auto-playing motion pieces, skip this.

## Magnetic Button / Element

Elements that attract toward the cursor when nearby.

```tsx
const MagneticElement = ({ children, strength = 0.3 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ x, y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
    >
      {children}
    </motion.div>
  );
};
```

## Variable Font Animation

Animate font properties for organic, fluid text effects.

```css
/* Variable font setup */
@font-face {
  font-family: 'Recursive';
  src: url('Recursive-Variable.woff2') format('woff2-variations');
  font-weight: 300 1000;
  font-style: oblique 0deg 15deg;
}

/* Animate weight on hover/scroll */
.variable-text {
  font-family: 'Recursive', monospace;
  font-variation-settings: 'wght' 300, 'CASL' 0, 'MONO' 0;
  transition: font-variation-settings 0.4s ease;
}

.variable-text:hover {
  font-variation-settings: 'wght' 900, 'CASL' 1, 'MONO' 1;
}
```

```tsx
// Framer Motion version
<motion.span
  style={{ fontVariationSettings: `'wght' ${weight}` }}
  animate={{ fontVariationSettings: `'wght' 900` }}
  transition={{ duration: 0.8 }}
>
```

**Best Variable Fonts for Animation:**
| Font | Axes | Free? | Style |
|------|------|-------|-------|
| Recursive | wght, CASL, MONO, slnt, ital | ✅ Google | Versatile — mono to sans |
| Fraunces | wght, opsz, SOFT, WONK | ✅ Google | Expressive serif |
| Anybody | wght, wdth | ✅ Fontshare | Width + weight |
| Epilogue | wght | ✅ Google | Clean geometric |
| Inter | wght, slnt | ✅ Google | Utility (less creative) |

## Image/Shape Reveal with Clip-Path Animation

Reveal images with animated masks — more cinematic than fade-in.

```tsx
const ImageReveal = ({ src, alt, delay = 0 }) => (
  <div className="overflow-hidden">
    <motion.img
      src={src}
      alt={alt}
      initial={{ clipPath: 'inset(100% 0 0 0)', scale: 1.3 }}
      animate={{ clipPath: 'inset(0% 0 0 0)', scale: 1 }}
      transition={{
        clipPath: { delay, duration: 0.8, ease: [0.4, 0, 0.2, 1] },
        scale: { delay, duration: 1.2, ease: [0.4, 0, 0.2, 1] },
      }}
    />
  </div>
);
```

**The Ken Burns effect:** Scale starts larger and zooms to normal during reveal — feels cinematic.

## Line Draw Animation

SVG path drawing — great for icons, logos, and diagrams.

```tsx
const LineDrawIcon = ({ d, delay = 0 }) => (
  <motion.svg viewBox="0 0 24 24" className="w-12 h-12">
    <motion.path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { delay, duration: 1, ease: [0.4, 0, 0.2, 1] },
        opacity: { delay, duration: 0.3 },
      }}
    />
  </motion.svg>
);
```
