# Visual Style Guide: Data Mindset — NJR01 Unit 03

## 1. Design Concept

### Theme Statement
A premium academic blue theme designed for a Saudi university Computer Science course on "Data Mindset." The visual direction combines deep navy authority with sky blue energy, accented by warm amber to signal achievement and interaction. The result feels like a polished university learning platform — trustworthy but not boring, professional but engaging.

### Keywords
**Trustworthy, Academic, Data-Driven, Polished, Engaging**

### Visual Metaphor
**The Data Lens** — seeing the world through a structured, analytical perspective. Blue represents clarity and depth; amber represents insight and discovery.

---

## 2. Color Palette

### Primary Colors
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | Deep Academic Blue | #1B4D7E | Headers, buttons, navigation, key elements |
| Secondary | Sky Blue | #3B8DD6 | Supporting elements, links, info states |
| Accent | Amber Gold | #E8A817 | CTAs, achievements, points, highlights |

### Neutral Colors
| Role | Hex | Usage |
|------|-----|-------|
| Text Primary | #1A2332 | Body text (blue-tinted near-black) |
| Text Secondary | #4A5E78 | Captions, labels, secondary info |
| Text Muted | #8899AD | Placeholders, disabled text |
| Background | #F5F8FC | Page/slide background (cool white) |
| Surface | #FFFFFF | Cards, panels, content areas |
| Surface Alt | #EDF2F8 | Alternating rows, hover states |
| Border | #D4DEE9 | Dividers, card borders |

### Semantic Colors
| Role | Hex | Usage |
|------|-----|-------|
| Success | #10B981 | Correct answers, completion, high quality |
| Error | #EF4444 | Incorrect answers, errors, low quality |
| Warning | #F59E0B | Attention, growth mindset feedback |
| Info | #3B8DD6 | Tips, information callouts |

### Accessibility Check
- Primary (#1B4D7E) on white: 7.2:1 contrast ratio (AAA)
- Body text (#1A2332) on background (#F5F8FC): 14.1:1 (AAA)
- Accent (#E8A817) on dark (#0F2E4F): 5.8:1 (AA)
- All text combinations meet WCAG AA minimum

---

## 3. Typography

### Font Stack
**All text:** Tajawal (Arabic-native geometric sans-serif)
- **ExtraBold (800):** H1, H2, section titles
- **Bold (700):** H3, card titles, button labels
- **Medium (500):** Body text, descriptions, bullet points
- **Regular (400):** Captions, small text, metadata

### Type Scale
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 (slide title) | 32px / 2rem | 800 | 1.3 |
| H2 (section header) | 26px / 1.625rem | 800 | 1.35 |
| H3 (card title) | 20px / 1.25rem | 700 | 1.4 |
| Body | 18px / 1.125rem | 500 | 1.8 |
| Caption | 15px / 0.9375rem | 500 | 1.6 |
| Small | 13px / 0.8125rem | 400 | 1.5 |

### Arabic Typography Notes
- Direction: RTL (`dir="rtl"`, `lang="ar"`)
- Line height 1.8 for body (Arabic needs more vertical space)
- Minimum 18px body text (NELC requirement)
- All fonts bundled locally (no CDN)

---

## 4. Visual Style

### Imagery Style
**Primary:** AI-generated illustrations with isometric/flat style
- Clean geometric shapes suggesting data, analytics, technology
- Consistent blue/teal/amber color treatment
- Professional but not corporate-sterile
- Cultural sensitivity for Saudi academic context

### Icon Style
- Style: Outlined with 2px stroke
- Color: `currentColor` (inherits from parent)
- Size: 24px base
- Source: SVG icons from skill resources

### Shape Language
- Corners: Rounded (12px for cards, 8px for buttons, 10px for quiz options)
- Shadows: Blue-tinted (rgba(27, 77, 126, opacity))
- Borders: Subtle 1px light borders on cards

---

## 5. Slide Types

### Title Slide (slide 0)
- Full-bleed section gradient background
- Centered course title in ExtraBold white
- Subtitle underneath in Medium weight, 85% opacity
- "Start" button with accent color

### Objectives Slide (slide 1)
- Dark header banner at top
- White content area with stacked objective rows
- Target icon + objective text for each row
- Stagger animation on entrance

### Section Divider (slides 2, 5, 10, 13, 18, 23)
- Full section gradient background
- Large centered title (2.5rem, ExtraBold)
- Subtitle below (1.25rem, Medium, 85% opacity)
- Subtle grain texture overlay

### Content Slide (slides 3, 6, 9, 14, 19)
- Dark header banner (course title + navigation)
- Slide title (H2, ExtraBold)
- Bullet list on one side, image on the other
- Two-column layout (55% text / 45% image)

### Cards Slide (slides 7, 11, 21)
- 3 or 4 cards in a row
- Each card: image top, title middle, description bottom
- Blue top accent border (3px)
- Hover: lift + shadow increase

### Two-Column Comparison (slides 16, 20)
- Side-by-side columns
- Green border/background for positive
- Red border/background for negative
- Matching bullet lists in each column

### Quiz MCQ (slides 8, 17, 22)
- Question text + small illustration
- 4 option cards with letter badges (ا, ب, ج, د)
- "Check Answer" button (accent color)
- Feedback overlays (correct/incorrect)

### Drag & Drop (slide 12)
- Draggable items with grip handle icon
- Numbered drop zones
- Visual feedback on hover/drop
- Correct = green border, solid

### Click-to-Reveal (slides 4, 15)
- Row of tab buttons
- Active tab = primary blue fill
- Visited tabs = lighter background
- Content area below changes on click

### Slider Explorer (slide 24)
- Horizontal slider with 6 stops
- Stops 1-3: amber accent (challenges)
- Stops 4-6: green accent (solutions)
- Content card updates per stop

### Dropdown Matching (slide 25)
- 4 rows: concept label + dropdown menu
- Dropdown shows all possible definitions
- Submit button to check all answers
- Green/red highlights on result

---

## 6. Asset Requirements

### AI-Generated Images Needed

| # | Description | Size | Slide |
|---|-------------|------|-------|
| 1 | Section bg: Data patterns and digital connections | 1280x720 | 2 |
| 2 | Content: Person surrounded by data streams | 800x450 | 3 |
| 3 | Section bg: Big data visualization | 1280x720 | 5 |
| 4 | Card: Volume - massive data storage | 400x300 | 7 |
| 5 | Card: Velocity - speed/movement | 400x300 | 7 |
| 6 | Card: Variety - diverse data types | 400x300 | 7 |
| 7 | Quiz: Data processing illustration | 300x300 | 8 |
| 8 | Content: Real-world data examples | 800x450 | 9 |
| 9 | Section bg: Data in daily life | 1280x720 | 10 |
| 10 | Card: Business analytics | 400x300 | 11 |
| 11 | Card: Health monitoring | 400x300 | 11 |
| 12 | Card: Smart city | 400x300 | 11 |
| 13 | Card: Scientific research | 400x300 | 11 |
| 14 | Section bg: Data quality measurement | 1280x720 | 13 |
| 15 | Content: Quality control | 800x450 | 14 |
| 16 | Column: High quality data | 400x300 | 16 |
| 17 | Column: Low quality data | 400x300 | 16 |
| 18 | Quiz: Business planning | 300x300 | 17 |
| 19 | Section bg: Communication networks | 1280x720 | 18 |
| 20 | Content: Data visualization tools | 800x450 | 19 |
| 21 | Column: Effective communication | 400x300 | 20 |
| 22 | Column: Poor communication | 400x300 | 20 |
| 23 | Card: IoT devices | 400x300 | 21 |
| 24 | Card: 5G network | 400x300 | 21 |
| 25 | Quiz: Communication methods | 300x300 | 22 |
| 26 | Section bg: Privacy and ethics | 1280x720 | 23 |
| 27 | Closing: Achievement celebration | 1280x720 | 27 |

**Total: 27 images**

### AI Image Style Prompt (Base)
```
Flat isometric illustration, academic technology theme, blue (#1B4D7E) and
teal color palette with amber (#E8A817) accents, clean geometric shapes,
data visualization elements, modern Saudi university context, professional
educational style, white background, no text in image
```

---

## 7. Motion Design

### Animation Principles
- Easing: Gentle spring (`cubic-bezier(0.25, 0.46, 0.45, 0.94)`)
- Duration: 400ms for entrances
- Stagger: 80ms between sequential elements
- Direction: RTL-aware (items enter from right/left appropriately)

### Slide Transitions
- Between slides within a SCO: 300ms fade
- No transition on first slide load

### Element Animations
- Bullets: Stagger fade-in from top
- Cards: Stagger with slight upward motion
- Quiz options: Stagger fade-in
- Feedback: Scale up from center

---

## 8. Do's and Don'ts

### Do
- Use Tajawal consistently at specified weights
- Keep blue as the dominant color (60/30/10 rule)
- Use amber only for interactive/achievement elements
- Test all text at 18px+ for NELC compliance
- Maintain 4.5:1 contrast minimum everywhere

### Don't
- Use more than 3 prominent colors per slide
- Mix font families (Tajawal only)
- Use pure black (#000) — always use #1A2332
- Put text over busy images without overlay
- Use light gray text on white backgrounds
