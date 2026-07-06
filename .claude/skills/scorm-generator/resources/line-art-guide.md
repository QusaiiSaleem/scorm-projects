# One-Line Art — Agent Guide

> **What this visual is:** a single continuous "one-line" drawing (the pen never
> lifts) that acts as the **visual for the slide itself** — not a photo sitting
> behind text. As the learner moves between slides, the **same line reshapes
> (morphs) into a new drawing** related to the next slide's content.

This is the effect in professional continuous-line ("Loooop-style") art: one
unbroken stroke flows in from the edge of the frame, becomes a subject (an
animal, a person exercising, an object), and flows back out — and on the next
slide it transforms into a different subject.

If you are generating a SCORM course and the user asks for "line drawing",
"one-line art", "animated line", "the line that draws each slide", or points at
continuous-line reference art — **this is the feature. Read this whole file
before building.**

---

## 1. The intent (what we are trying to achieve)

| We ARE doing | We are NOT doing |
|---|---|
| The drawing **is** the slide's visual | A decorative texture behind an image |
| **One continuous stroke** per drawing | Multiple disconnected shapes / clip-art |
| The line **morphs** into the next slide's subject | A new picture that hard-cuts in |
| Subject **relates to the slide's content** | A random flourish unrelated to the lesson |
| Enters flat from the **left edge**, exits right | A floating shape with no connection to the frame |
| Thin, confident, minimal stroke | Filled shapes, gradients-as-subject, heavy detail |

**The signature look:** a thin line runs in flat from the **left edge** at a
baseline, weaves up into the figure, and exits flat to the **right edge**. That
in/out "tail" makes the single line feel like it runs through the whole scene.
Every drawing shares the same baseline so the morph between them flows.

**Reference:** Loooop Studio one-line wildlife animations; stock "continuous
line" athletes (squat, run, stretch). One subject melts into the next.

---

## 2. Two variants — pick the right one

There are two different effects in this system. Do not confuse them.

### A. Morph per slide  ← **this is almost always what people mean**
Each slide has its **own** one-line drawing; the line **reshapes** into the next
slide's drawing on navigation. First slide *draws itself in*; every move after
that *morphs*.
- Engine: `engine/line-art.js` → `SlideLineArt`
- Component: `components/slide-line-art.html`
- Runnable: `output/line-art-slides/` (and `example-standalone.html`)

### B. One line that keeps extending across slides
A **single** drawing that is not finished until the last slide; each slide draws
the **next segment** of the same line (it does not change subject). Going back
retracts it.
- Engine: `engine/line-draw.js` → `LineDrawBackground`
- Component: `components/line-draw-background.html`
- Runnable: `output/line-draw-demo/`

> Rule of thumb: "the line **becomes** each slide" → **A (morph)**.
> "the line **continues/finishes** across slides" → **B (extend)**.

The rest of this guide is about **variant A (morph)**, the primary one.

---

## 3. Visual rules for the drawings (non-negotiable)

1. **One unbroken stroke.** A single `<path>` whose `d` starts with one `M` and
   then only curve/line commands. You *may* use a second subpath for a small
   detail, but the drawing must read as one continuous line.
2. **Canvas = `viewBox="0 0 1280 720"`** (16:9, matches the slide area).
3. **Flat entry/exit tail.** Start at `M -40 <baseline>` off the left edge, end
   at `L 1320 <baseline>` off the right edge. Keep the same `<baseline>` (y)
   across every drawing in a course so the morph doesn't jump.
   - Land subjects: baseline ≈ `600` (ground).
   - Water subjects: baseline ≈ `440–470` (waterline).
   - Air/flying: baseline ≈ `380–400` (a flowing mid-line).
4. **Stroke, never fill.** `fill:none`. Thin uniform weight (`2–3px`), round
   caps/joins. Color comes from the theme (`var(--color-text)` or an accent),
   so it recolors with the course.
5. **The drawing is the subject.** High opacity (`~0.9`). (The *other* variant,
   the ambient background line, uses low opacity — not this one.)
6. **Behind the text, not under the mouse.** The `<svg>` sits at `z-index:0`
   inside `.sco-content` with `pointer-events:none`; slide content is `z-index:1`.
   Put the lesson text to **one side** so the figure stays visible.
7. **Recognizable & accurate.** The subject must read clearly and, per the
   studio's accuracy rule, be factually correct if it depicts anything real
   (anatomy of an exercise, a species silhouette, a labeled diagram).

---

## 4. How it works (mechanism)

`SlideLineArt` keeps ONE visible `<path>` and an array of `shapes`, one per slide:

- **First slide shown** → **draw-in**: classic `stroke-dasharray` reveal, with an
  optional "pen" dot riding the tip.
- **Every navigation after** → **morph**: it samples the current path and the
  target path into N equal arc-length points, aligns them (rotation/reversal so
  the line flows instead of twisting), and interpolates over time.

Because it resamples by arc length, **any two single-line paths morph into each
other** — the shapes do **not** need matching point counts. Authors just supply
`d` strings.

Accessibility: an `sr-only` live-region caption is updated to each shape's
`label`; `prefers-reduced-motion` makes it jump to the crisp shape with no
animation and hides the pen.

---

## 5. How to build it in a course

**Step 1 — Put the line in the SCO.** As the FIRST child of `.sco-content`:

```html
<svg id="line-bg" class="line-art-bg" viewBox="0 0 1280 720"
     preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
  <path class="line-path" d="M -40 600 L 1320 600"></path>  <!-- starts as the tail -->
  <circle class="pen" r="6"></circle>
</svg>
<div class="sr-only" id="lineCaption" aria-live="polite"></div>
```

**Step 2 — Copy the engine** into the course `shared/engine/`:
`slide-controller.js` + `line-art.js`.

**Step 3 — Provide one shape per slide, in slide order**, then wire it:

```html
<script>
  var art = new SlideLineArt({
    path: '#line-bg .line-path',
    pen:  '#line-bg .pen',
    caption: '#lineCaption',
    shapes: [
      { d: 'M -40 600 L 360 600 C ... L 1320 600', label: 'A sitting cat' },
      { d: 'M -40 470 L 340 470 C ... L 1320 470', label: 'A swan on the water' }
      // ...one per slide...
    ],
    drawInDuration: 1300,   // ms for the first slide to draw in
    morphDuration: 900      // ms per slide-to-slide morph
  });

  var controller = new SlideController();
  art.attachTo(controller);   // morphs the line on every slide change
</script>
```

The full CSS + a copy-paste block live in `components/slide-line-art.html`.

---

## 6. Where the drawings come from (choose per project)

1. **Generate with the studio SVG pipeline** (best; matches reference art):
   ```bash
   python3 .claude/skills/scorm-generator/scripts/generate_svg.py \
     --prompt "single continuous one-line drawing of a <SUBJECT>, side view,
               one unbroken stroke that enters flat from the left edge and
               exits flat to the right, no fills, 2px stroke, minimalist
               Loooop style, 1280x720" \
     --style line-icon --no-animated --output subject.svg
   ```
   Then copy the `<path d="…">` from `subject.svg` into the `shapes` array.
   *(Needs `GEMINI_API_KEY`; without it the script writes a placeholder.)*
2. **Designer SVG** — paste the single `<path>` `d` the same way.
3. **Hand-author** on the 1280×720 viewBox (see the presets in
   `components/slide-line-art.html`).

**Always verify visually.** Render each shape (a tiny HTML grid of
`<svg><path d="…"></svg>`, or a browser screenshot) and confirm it reads as the
intended subject before shipping. Iterate the `d` until it does.

---

## 7. Checklist before shipping

- [ ] One `<path>` per slide, single continuous stroke, `viewBox 0 0 1280 720`.
- [ ] Every shape shares the same baseline y; enters `-40`, exits `1320`.
- [ ] `fill:none`, thin themed stroke, high opacity.
- [ ] `<svg>` is behind content (`z-index:0`, `pointer-events:none`); text to one side.
- [ ] Each subject clearly relates to its slide and is factually accurate.
- [ ] `label` set on every shape (screen-reader caption).
- [ ] Verified draw-in on slide 1 and morph on navigation, in a browser, no JS errors.
- [ ] `prefers-reduced-motion` respected (engine handles it — don't fight it).

---

## 8. Files

| Purpose | Path |
|---|---|
| Engine (morph) | `resources/engine/line-art.js` |
| Component + presets | `resources/components/slide-line-art.html` |
| Runnable demo | `output/line-art-slides/index.html` |
| Single-file example | `output/line-art-slides/example-standalone.html` |
| Engine (extend variant) | `resources/engine/line-draw.js` |
| Component (extend variant) | `resources/components/line-draw-background.html` |
