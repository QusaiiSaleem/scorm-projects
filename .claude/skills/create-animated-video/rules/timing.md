# Timing, Pacing & Motion System

## The Golden Rule of Motion

Every element in every scene must answer: **"Why am I moving, and when?"**

Random animation = amateur. Choreographed timing = agency.

## Intra-Scene Choreography Template

Every scene follows this timing spine:

```
T+0.0s  Background shift/pulse begins
T+0.2s  Accent element enters (line draws, shape appears)
T+0.5s  Primary content begins staggering in
T+0.8s  Secondary content appears
T+1.2s  Supporting elements arrive
T+1.5s  Everything settled — hold for reading
T+[end-0.5s]  Exit choreography begins
```

### Implementation
```tsx
const SceneChoreography = () => {
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),   // accent
      setTimeout(() => setPhase(2), 500),   // primary
      setTimeout(() => setPhase(3), 800),   // secondary
      setTimeout(() => setPhase(4), 1200),  // supporting
    ];
    return () => timers.forEach(clearTimeout);
  }, []);
  
  return (
    <>
      <Background animate={phase >= 0} />
      <AccentLine animate={phase >= 1} />
      <Headline animate={phase >= 2} />
      <Subline animate={phase >= 3} />
      <Details animate={phase >= 4} />
    </>
  );
};
```

## Scene Duration Guide

| Scene Type | Duration | Content |
|------------|----------|---------|
| Logo reveal | 2-3s | Brand mark only |
| Hero statement | 4-5s | One big line |
| Feature showcase | 5-7s | Feature + description |
| Data/stats | 5-6s | Numbers + context |
| Comparison | 6-8s | Two sides |
| CTA/closing | 4-5s | Final message |

**Total video:** 25-45 seconds is the sweet spot for promotional content.

## Easing System

### Primary Easing (use 80% of the time)
```tsx
ease: [0.4, 0, 0.2, 1]  // Material Design standard
```
This is your default. Smooth deceleration that feels natural.

### Easing by Purpose

| Purpose | Easing | Framer Motion |
|---------|--------|---------------|
| Entrance (default) | Smooth decel | `ease: [0.4, 0, 0.2, 1]` |
| Quick snap | Sharp decel | `ease: [0, 0, 0.2, 1]` |
| Exit | Accelerate out | `ease: [0.4, 0, 1, 1]` |
| Dramatic reveal | Slow start | `ease: [0.7, 0, 0.3, 1]` |
| Bouncy/playful | Spring | `type: "spring", stiffness: 300, damping: 20` |
| Elastic pop | Strong spring | `type: "spring", stiffness: 400, damping: 10` |
| Gentle float | Soft spring | `type: "spring", stiffness: 100, damping: 15` |

### GSAP Equivalent
```js
// Material standard
gsap.to(el, { duration: 0.6, ease: "power2.out" });

// Dramatic
gsap.to(el, { duration: 0.8, ease: "power3.out" });

// Bouncy
gsap.to(el, { duration: 0.6, ease: "back.out(1.7)" });

// Elastic
gsap.to(el, { duration: 1.0, ease: "elastic.out(1, 0.3)" });
```

## Stagger Patterns

### Linear (Most Common)
```tsx
transition={{ delay: index * 0.05 }}
```
Even spacing. Professional, predictable.

### Accelerating
```tsx
transition={{ delay: index * index * 0.02 }}
```
Starts slow, gets faster. Builds energy.

### Decelerating
```tsx
transition={{ delay: Math.sqrt(index) * 0.1 }}
```
Fast start, slows down. Natural settling.

### From Center
```tsx
const center = Math.floor(items.length / 2);
const distFromCenter = Math.abs(index - center);
transition={{ delay: distFromCenter * 0.05 }}
```
Elements closest to center appear first. Radial energy.

## Continuous Background Motion

Backgrounds must NEVER be static. Always add subtle life:

```tsx
// Slow gradient drift
<motion.div
  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
/>

// Floating blobs
<motion.div
  animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
/>

// Particle drift (with scale)
<motion.div
  animate={{ 
    x: [0, 30, 0], 
    y: [0, -20, 0],
    scale: [1, 1.05, 1],
    opacity: [0.3, 0.5, 0.3]
  }}
  transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
/>
```

## Pacing Profiles

### 🔥 High Energy (Social media, hype video)
- Scene duration: 2-4s
- Transition: 0.3-0.4s
- Stagger: 0.02-0.03s
- Total: 15-25s
- Music: 120+ BPM

### 💼 Professional (Brand film, product demo)
- Scene duration: 4-6s
- Transition: 0.6-0.8s
- Stagger: 0.04-0.06s
- Total: 25-40s
- Music: 90-110 BPM

### 🎬 Cinematic (Luxury brand, awards)
- Scene duration: 6-10s
- Transition: 0.8-1.2s
- Stagger: 0.06-0.10s
- Total: 35-60s
- Music: 60-80 BPM

## Reading Time Calculator

```
Characters / 15 = seconds needed (conservative)
Words / 4 = seconds needed (average reader)
```

Always add 0.5s buffer after text is fully revealed before starting exit.
