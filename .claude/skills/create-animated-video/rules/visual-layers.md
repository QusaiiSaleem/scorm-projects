# Visual Layering & Background Design

## The 3-Layer Rule

Every scene MUST have 3 layers. No exceptions.

```
┌──────────────────────────────┐
│  FOREGROUND (z-30)           │  ← Primary message, hero type
│  ┌──────────────────────┐    │
│  │  MIDGROUND (z-20)    │    │  ← Depth elements, shapes
│  │  ┌──────────────┐    │    │
│  │  │  BACKGROUND   │    │    │  ← Environment, gradients
│  │  │  (z-10)       │    │    │
│  │  └──────────────┘    │    │
│  └──────────────────────┘    │
└──────────────────────────────┘
```

## Background Techniques

### 1. Animated Gradient
```tsx
<motion.div
  className="absolute inset-0"
  style={{
    background: 'linear-gradient(-45deg, #0f0f23, #1a1a3e, #0d2847, #1e0a3c)',
    backgroundSize: '400% 400%',
  }}
  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
/>
```

### 2. Mesh Gradient (Multiple Blobs)
```tsx
const MeshGradient = ({ colors }) => (
  <div className="absolute inset-0 overflow-hidden">
    {colors.map((color, i) => (
      <motion.div
        key={i}
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
        style={{ backgroundColor: color, opacity: 0.4 }}
        animate={{
          x: [0, 100 * Math.sin(i), 0],
          y: [0, 80 * Math.cos(i), 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10 + i * 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);
```

### 3. Grain/Noise Overlay
```tsx
const GrainOverlay = () => (
  <div
    className="absolute inset-0 pointer-events-none z-50 opacity-[0.03]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
);
```

### 4. Grid Pattern
```tsx
const GridBackground = () => (
  <div
    className="absolute inset-0 opacity-[0.05]"
    style={{
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
    }}
  />
);
```

## Midground Elements

### Floating Geometric Shapes
```tsx
const FloatingShapes = ({ count = 5 }) => {
  const shapes = Array.from({ length: count }, (_, i) => ({
    size: 40 + Math.random() * 120,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: i * 1.5,
    duration: 8 + Math.random() * 8,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-white/10"
          style={{
            width: s.size,
            height: s.size,
            left: `${s.x}%`,
            top: `${s.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};
```

### Accent Lines
```tsx
const AccentLine = ({ delay = 0 }) => (
  <motion.div
    className="absolute h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
    style={{ width: '40%', top: '30%', left: '10%' }}
    initial={{ scaleX: 0, opacity: 0 }}
    animate={{ scaleX: 1, opacity: 1 }}
    transition={{ delay, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
  />
);
```

### Parallax Depth
```tsx
// Elements at different speeds create depth
<motion.div style={{ y: scrollY * 0.1 }}>  {/* Slow = far */}
<motion.div style={{ y: scrollY * 0.3 }}>  {/* Medium */}
<motion.div style={{ y: scrollY * 0.6 }}>  {/* Fast = close */}
```

## Foreground Composition

### Asymmetric Layout (NOT centered)
```tsx
// WRONG ❌
<div className="flex items-center justify-center text-center">

// RIGHT ✅
<div className="absolute left-[8%] top-[20%] max-w-[55%]">
  <h1 className="text-8xl font-black tracking-tight leading-none">
    Big Bold<br/>Statement
  </h1>
</div>
<div className="absolute right-[8%] bottom-[15%] max-w-[30%]">
  <p className="text-lg font-light opacity-70">Supporting context</p>
</div>
```

### Safe Zone
Keep all content within **90% of frame** (5% padding on each side):
```tsx
<div className="absolute inset-0 p-[5%]">
  {/* All foreground content here */}
</div>
```

## Color Palettes for Dark Themes

| Mood | Background | Accent 1 | Accent 2 | Text |
|------|-----------|----------|----------|------|
| Tech/Cyber | #0a0a1a | #00d4ff | #7c3aed | #ffffff |
| Luxury | #0f0f0f | #c8a951 | #8b7355 | #f5f5f5 |
| Nature | #0a1f0a | #22c55e | #86efac | #f0fdf4 |
| Energy | #1a0505 | #ef4444 | #f97316 | #fef2f2 |
| Clean | #f8fafc | #0ea5e9 | #6366f1 | #0f172a |

## Layer Composition Checklist

For each scene, verify:
- [ ] Background is animated (never static)
- [ ] At least 2 midground elements present
- [ ] Foreground uses asymmetric layout
- [ ] Grain/noise overlay active
- [ ] Elements at different z-indices create depth
- [ ] Nothing is perfectly centered (unless intentional hero moment)
