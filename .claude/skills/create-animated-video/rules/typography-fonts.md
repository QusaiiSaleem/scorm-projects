# Typography & Font Reference

## The Rule

Typography IS the design. In motion graphics, text isn't content — it's the primary visual element.

**Avoid:** Inter, Roboto, Open Sans, Arial, system fonts. These are invisible. We want fonts with personality.

## Display Fonts (Headlines)

### Geometric / Modern (Clean + Bold)
| Font | Source | Vibe |
|------|--------|------|
| **Clash Display** | Fontshare (free) | Sharp corners, bold geometric |
| **Satoshi** | Fontshare (free) | Clean, versatile |
| **Cabinet Grotesk** | Fontshare (free) | Strong personality |
| **General Sans** | Fontshare (free) | Modern, professional |
| **Space Grotesk** | Google (free) | Technical, mono-inspired |

### Expressive / Artistic (High Impact)
| Font | Source | Vibe |
|------|--------|------|
| **Monument Extended** | Pangram Pangram (premium) | Ultra-wide, dramatic |
| **Neue Machina** | Pangram Pangram (free) | Futuristic, technical |
| **Bebas Neue** | Google (free) | Tall, condensed, impactful |
| **Oswald** | Google (free) | Condensed, strong |
| **Dela Gothic One** | Google (free) | Ultra-bold, statement |

### Serif Display (Elegant)
| Font | Source | Vibe |
|------|--------|------|
| **Fraunces** | Google (free, variable!) | Expressive, organic |
| **Playfair Display** | Google (free) | Classic editorial |
| **DM Serif Display** | Google (free) | Contemporary |
| **Cormorant** | Google (free) | High contrast, elegant |

## Body Fonts

| Font | Source | Vibe |
|------|--------|------|
| **Plus Jakarta Sans** | Google (free) | Modern, geometric, readable |
| **Outfit** | Google (free) | Contemporary, clean |
| **Sora** | Google (free) | Technical geometric |
| **Manrope** | Google (free) | Semi-condensed, modern |
| **DM Sans** | Google (free) | Geometric, low contrast |

## Arabic Display Fonts (RTL)
| Font | Source | Vibe |
|------|--------|------|
| **Cairo** | Google (free, variable) | Clean, modern Arabic |
| **Tajawal** | Google (free) | Professional, readable |
| **IBM Plex Sans Arabic** | Google (free) | Technical, clean |
| **Noto Sans Arabic** | Google (free) | Universal, neutral |
| **Almarai** | Google (free) | Modern, rounded |

## Font Sources

| Source | URL | Free? |
|--------|-----|-------|
| **Fontshare** | fontshare.com | ✅ Free for commercial |
| **Google Fonts** | fonts.google.com | ✅ Free |
| **Pangram Pangram** | pangrampangram.com | Some free |
| **Atipo** | atipofoundry.com | Some free |
| **Uncut** | uncut.wtf | ✅ Free |

## Font Pairing Rules

### The Formula
**1 Display + 1 Body.** Max 2 fonts. Never 3+.

### Proven Pairings
| Display | Body | Mood |
|---------|------|------|
| Clash Display | DM Sans | Modern tech |
| Bebas Neue | Plus Jakarta Sans | Bold editorial |
| Fraunces | Outfit | Elegant modern |
| Space Grotesk | Sora | Technical |
| Monument Extended | Manrope | Dramatic minimal |
| Cairo (AR) | IBM Plex Sans Arabic | Professional Arabic |

### Weight Contrast
Mix weights dramatically within one font family:
- **Headline:** Black (900) or Bold (700)
- **Subline:** Light (300) or Regular (400)
- **Label:** Medium (500) with UPPERCASE + wide tracking

```css
.hero { font-weight: 900; letter-spacing: -0.04em; line-height: 0.9; }
.subline { font-weight: 300; letter-spacing: 0; line-height: 1.4; }
.label { font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; font-size: 0.75rem; }
```

## Loading Fonts for Video

```html
<!-- Google Fonts CDN (recommended for quick setup) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;700&family=Sora:wght@300;400;700&display=swap" rel="stylesheet">

<!-- Fontshare CDN -->
<link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,700&f[]=satoshi@300,400,700&display=swap" rel="stylesheet">
```

## Type Scale for Motion Graphics (16:9)

| Role | Size | Weight | Tracking |
|------|------|--------|----------|
| Hero number | 8-12rem | 900 | -0.04em |
| Hero headline | 5-7rem | 900 | -0.03em |
| Section title | 3-4rem | 700 | -0.02em |
| Subline | 1.5-2rem | 300 | 0 |
| Body | 1.1-1.3rem | 400 | 0 |
| Label/tag | 0.7-0.85rem | 500 | 0.1em |
| Source/footnote | 0.65rem | 400 | 0.05em |
