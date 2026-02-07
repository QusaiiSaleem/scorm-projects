# Visual Style Guide: Digital Mindset & Technology Innovation Practices
# (NJR01-U02)

## 1. Design Concept

### Theme Statement
This theme draws from the identity of Najran University and Saudi Vision 2030 to create a clean, academic visual language that communicates trust, authority, and forward-looking innovation. The palette centers on the university's deep navy blue and gold — colors associated with knowledge, prestige, and ambition in the MENA academic tradition. The design is restrained and professional: generous whitespace, subtle layered shadows, and refined typography that lets the content breathe. Light backgrounds with navy text establish clarity; gold accents mark progress, achievement, and key interactions.

### Keywords
Academic, Professional, Trustworthy, Forward-Looking, Clean

### Visual Metaphor
"The Innovation Compass" — guiding learners from foundational knowledge toward creative application, with each module acting as a waypoint on the journey from idea to market.

---

## 2. Color Palette

### Primary Colors
| Role | Color | Hex | RGB | Usage |
|------|-------|-----|-----|-------|
| Primary | Najran Navy | #003366 | rgb(0, 51, 102) | Headers, primary buttons, navigation bar, hero backgrounds |
| Primary Dark | Deep Navy | #002244 | rgb(0, 34, 68) | Button hover states, gradient endpoints, dark accents |
| Primary Light | Academic Blue | #1A5C8A | rgb(26, 92, 138) | Gradient midpoints, secondary interactive states |
| Secondary | Sky Complement | #0C7BB3 | rgb(12, 123, 179) | Progress bars, secondary elements, links |
| Accent | University Gold | #D4A520 | rgb(212, 165, 32) | Points badge, achievements, CTA highlights, celebrations |

### Neutral Colors
| Role | Hex | Usage |
|------|-----|-------|
| Text Primary | #1A2332 | Body text (tinted navy-black, never pure #000) |
| Text Secondary | #5C6B7A | Captions, labels, secondary information |
| Background | #F7F8FA | Page background (cool off-white) |
| Surface | #FFFFFF | Cards, panels, elevated content |
| Surface Elevated | #FFFFFF | Modals, active cards with shadow |
| Border | #DDE3EA | Dividers, card outlines |
| Border Subtle | #EEF1F5 | Faint separators, inactive states |

### Semantic Colors
| Role | Hex | Background | Usage |
|------|-----|------------|-------|
| Success | #0F9D6E | #E8F8F2 | Correct answers, completion, passing |
| Warning | #D4A520 | #FDF6E3 | Cautions, attention (uses gold accent) |
| Error | #DC3545 | #FDF0F1 | Incorrect answers, validation errors |
| Info | #0C7BB3 | #EBF5FB | Tips, informational callouts |
| Growth | #6B5CE7 | #F3F1FE | Growth mindset feedback (encouraging, not punishing) |

### Accessibility Check
- Navy #003366 on white #FFFFFF: 10.1:1 (AAA)
- Text #1A2332 on background #F7F8FA: 13.8:1 (AAA)
- Gold #D4A520 on navy #003366: 4.6:1 (AA)
- All text combinations meet WCAG AA minimum

---

## 3. Typography

### Font Stack

**Headings:** Noto Kufi Arabic
- Source: Locally bundled (Google Fonts origin)
- Weights: 400 (normal), 700 (bold)
- Fallback: 'Segoe UI', Tahoma, Arial, sans-serif
- Letter-spacing: 0 (Arabic does not benefit from letter-spacing adjustments)
- Line-height: 1.35 for headings

**Body:** Cairo
- Source: Locally bundled (Google Fonts origin)
- Weights: 400 (regular), 600 (semibold), 700 (bold)
- Fallback: 'Segoe UI', Tahoma, Arial, sans-serif
- Letter-spacing: 0
- Line-height: 1.8 for body text (critical for Arabic readability)

**Code/Mono:** JetBrains Mono
- Source: Locally bundled
- Fallback: 'Courier New', monospace

### Arabic Typography Notes
- All content is Arabic-primary with dir="rtl" and lang="ar"
- English technical terms appear inline in parentheses using class `.ltr-inline`
- Body line-height of 1.8 is mandatory for Arabic legibility
- Minimum body font size: 18px (1.125rem) per NELC requirements
- Heading weight 700 provides strong visual anchoring for RTL scanning

### Type Scale
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Display | 2.25rem (36px) | 700 | 1.25 |
| H1 | 1.875rem (30px) | 700 | 1.3 |
| H2 | 1.5rem (24px) | 700 | 1.35 |
| H3 | 1.25rem (20px) | 600 | 1.4 |
| H4 | 1.125rem (18px) | 600 | 1.5 |
| Body | 1.125rem (18px) | 400 | 1.8 |
| Small | 0.9375rem (15px) | 400 | 1.6 |
| Code | 0.875rem (14px) | 400 | 1.7 |

---

## 4. Visual Style

### Imagery Style
**Primary Style:** Icon-based + Abstract geometric patterns

This is an academic innovation course, not a photo-heavy narrative. Visuals come from:
- SVG icons from the component library (currentColor-themed)
- CSS geometric decorations (subtle, not overwhelming)
- Flat illustration concepts for Design Thinking phases (if generated)

**Illustration Guidelines:**
- Style: Flat / geometric / clean line
- Line weight: 2px stroke
- Colors: Navy primary, gold accent, sky blue secondary
- Complexity: Simple — support learning, do not distract

### Icon Style
- Style: Outlined (from resources/icons/ library)
- Stroke width: 2px
- Corner radius: Rounded
- Size: 24px base
- Color: currentColor (inherits from parent, auto-themed)

### Shape Language
- Corners: Moderately rounded (8px cards, 12px containers, 16px hero)
- Border radius: `--radius-sm: 6px`, `--radius-md: 10px`, `--radius-lg: 16px`
- Shadows: Subtle and layered (premium shadow system from base.css)
- Borders: 1px solid borders on cards (light, not heavy)

---

## 5. Layout Principles

### Grid System
- Columns: Flexible (not rigid 12-column; content-driven)
- Max content width: 900px centered
- Gutter: 24px between cards
- Margins: 32px desktop / 16px mobile
- Direction: RTL (right-to-left)

### Fixed Slide Layout (16:9)
- Viewport: 1280 x 720 target
- All content contained within viewport (no page scrolling)
- Navigation bar at top, lesson nav at bottom
- Content area fills space between nav bars
- `.slide-inner` vertically centers short content
- `.slide-inner.align-top` for content that needs top alignment

### Spacing Scale
| Name | Value | Usage |
|------|-------|-------|
| xs | 4px | Tight internal spacing |
| sm | 8px | Related elements, icon gaps |
| md | 16px | Section padding, paragraph spacing |
| lg | 24px | Card padding, component gaps |
| xl | 32px | Major section separation |
| 2xl | 48px | Hero padding, celebration views |

### Component Patterns
- Cards: White surface, 10px radius, subtle shadow, 1px border
- Buttons: 10px radius, navy gradient primary, gold for gamification
- Inputs: Outlined style with 2px border, navy focus ring
- Progress: Gradient bar (navy to sky blue)
- Callouts: RTL border on right side (already handled by base.css)

---

## 6. Backgrounds & Decorations

### Approach: Clean Academic
This theme relies on whitespace and subtle shadows rather than heavy decorative backgrounds. The corporate-clean reference is the foundation.

**Hero Sections:**
- Navy-to-deep-navy gradient: `linear-gradient(135deg, #003366 0%, #002244 60%, #1A5C8A 100%)`
- White text on dark background
- Subtle grain overlay at very low opacity (0.03) for premium texture

**Content Backgrounds:**
- Cool off-white #F7F8FA for page background
- Pure white #FFFFFF for content surfaces/cards
- No mesh gradients or animated backgrounds (too flashy for academic context)

**Decorative Elements:**
- Geometric pattern at very low opacity (0.02) on hero sections only
- Film grain at `--grain-opacity: 0.03` on hero sections (barely visible, adds premium feel)
- Glass-light utility for emphasis cards: `.glass-light` on key concept highlights

### Premium Utilities Used
| Utility | Where | Purpose |
|---------|-------|---------|
| `.shadow-sm` | All cards | Subtle depth |
| `.shadow-md` | Active/hover cards | Interaction feedback |
| `.hover-lift` | Interactive cards, flip cards | Hover depth change |
| `.elastic-click` | Buttons, quiz options | Satisfying click feedback |
| `.has-grain` | Hero section only | Premium texture (very subtle) |
| `.glass-light` | Key concept highlights | Frosted emphasis panel |
| `--spring-gentle` | Page transitions | Professional, understated spring |

---

## 7. Motion Design

### Animation Principles
- **Easing:** `--spring-gentle` for entrances, `ease-out` for standard UI
- **Duration:** 300-400ms for UI elements, 500ms for content reveals
- **Stagger:** 80ms delay between sequential items
- **Direction:** RTL-aware (slides enter from left in RTL context)

### Motion DNA: Subtle (Professional)
```json
{
  "staggerDelay": "80ms",
  "entranceDuration": "400ms",
  "entranceEasing": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  "hoverDuration": "200ms",
  "springType": "--spring-gentle"
}
```

### Celebration Animations
- Confetti colors: Navy (#003366), Gold (#D4A520), Sky Blue (#0C7BB3), Success Green (#0F9D6E)
- Triggered on: Quiz pass (70%+), lesson completion, course completion
- Style: Understated (fewer particles, shorter duration than playful themes)

### Slide Transitions
- Between slides: Fade + horizontal translate (RTL-aware, from base.css)
- Content entrance: `.stagger-item` with 80ms stagger
- Interactive reveals: `fadeUp 0.4s ease-out`

---

## 8. RTL-Specific Guidance

### Layout Direction
- All pages use `<html dir="rtl" lang="ar">`
- Text alignment defaults to right
- Navigation: "Previous" button on right, "Next" on left
- Timeline vertical line on right side (already handled by base.css)
- Callout accent borders on right side

### Bilingual Content
- Arabic is primary language for all content
- English technical terms in parentheses: `SCAMPER (سكامبر)`
- English terms use `.ltr-inline` class for proper bidirectional isolation
- Glossary entries show Arabic first, then English

### Font Loading
- Bundle all fonts in `shared/assets/fonts/`
- Required files:
  - `NotoKufiArabic-Regular.woff2`
  - `NotoKufiArabic-Bold.woff2`
  - `Cairo-Regular.woff2`
  - `Cairo-SemiBold.woff2`
  - `Cairo-Bold.woff2`

---

## 9. Component Styling Summary

### Quiz Options
- Full-width card style (`.btn-quiz-option`)
- Navy border on hover/selection
- Growth mindset feedback: encouraging purple (#6B5CE7), not punishing red
- Gold points animation on correct answers

### Interactive Activities
- Drag-and-drop: Navy border items, gold highlight on correct placement
- Tabs: Navy active indicator
- Accordion: Clean border with navy chevron
- Flip cards: Navy-to-blue gradient front, white back

### Gamification
- Points badge: Gold gradient (`linear-gradient(135deg, #D4A520, #B8860B)`)
- Progress bar: Navy-to-sky-blue gradient
- Journey map nodes: Navy active, success green completed
- Celebration: Gold confetti primary color

---

## 10. Do's and Don'ts

### Do
- Use consistent navy + gold color application throughout
- Maintain generous whitespace (this is a premium academic course)
- Use Noto Kufi Arabic for ALL headings (consistency)
- Test all slides at 1280x720 viewport
- Ensure all text passes WCAG AA contrast on its background
- Use `.elastic-click` on all interactive buttons for satisfying feedback

### Don't
- Use more than 3 colors prominently in any single slide
- Apply grain or glass effects heavily (keep at 0.03 opacity max)
- Use decorative animations on content slides (save for celebrations)
- Mix font families beyond the two specified
- Use pure black (#000000) for any text or background
- Rely on color alone to convey meaning (always pair with icons/text)

---

## 11. Reference & Inspiration

### DNA Strands Used
- **Color:** Custom Najran palette (inspired by Cool Premium recipe, adjusted for university branding)
- **Font:** Arabic Modern (Noto Kufi Arabic + Cairo)
- **Background:** Film Grain (hero only, very subtle) + Clean whitespace
- **Spacing:** Comfortable (900px max-width, generous padding)
- **Motion:** Subtle (80ms stagger, gentle spring, professional feel)

### Similar Visual Direction
- Najran University official website (navy + gold institutional identity)
- Saudi Ministry of Education e-learning portals (clean, professional, Arabic-first)
- Khan Academy Arabic (clear hierarchy, focused learning environment)
- Stripe/Linear aesthetics (premium shadows, restrained motion) applied to Arabic academic context
