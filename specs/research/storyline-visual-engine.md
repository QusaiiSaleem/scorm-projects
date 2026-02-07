# Storyline 360 Visual & Animation Engine — Deep Research

> Research into how Storyline 360 renders graphics, animates objects, handles media,
> manages characters, and performs in HTML5 output. Includes comparison with our
> CSS/SVG-first approach and actionable recommendations.

---

## 1. RENDERING ARCHITECTURE

### 1.1 Core Rendering Technology

Storyline 360's HTML5 output uses a **hybrid SVG + Canvas rendering approach** that has
evolved significantly over time:

| Generation | Technology | Notes |
|-----------|-----------|-------|
| Storyline 1-2 (Flash era) | Flash vector + Canvas fallback | Canvas API drew bitmap artwork in the browser |
| Storyline 360 (early) | Canvas-dominant | Rasterized everything, including text → blurry on mobile |
| Storyline 360 (current) | **SVG-dominant + web fonts** | Shapes → SVG, text → web fonts, images → PNG/JPEG |

**Current architecture**: Storyline converts almost everything on a slide into an **SVG**
when it publishes. Each SVG is wrapped in an HTML `<div>` tag that holds the `aria-label`
attribute (derived from the object's Alt Text in the authoring tool).

```html
<!-- Typical Storyline HTML5 DOM structure -->
<div aria-label="my_shape" role="img" style="position:absolute; left:120px; top:80px;">
  <svg width="200" height="150" viewBox="0 0 200 150">
    <!-- Vector shape data -->
    <rect x="0" y="0" width="200" height="150" fill="#3B82F6" rx="8"/>
  </svg>
</div>
```

### 1.2 Shape Rendering

| Shape Type | How Rendered | Format |
|-----------|-------------|--------|
| Built-in shapes (rectangles, circles, arrows) | SVG paths/primitives | Inline SVG in `<div>` wrapper |
| Callouts & speech bubbles | SVG compound paths | Inline SVG |
| Freeform/custom shapes | SVG paths | Inline SVG |
| Imported SVG images | Preserved as SVG | Inline or referenced SVG |
| Complex grouped shapes | SVG `<g>` groups | Nested SVG elements |

**Key finding**: All shapes use SVG vector rendering in the current engine. This is a major
improvement over the earlier Canvas-based rasterization approach that produced blurry output.

### 1.3 Text Rendering

Storyline's text rendering has undergone significant evolution:

- **Old approach**: Text was rendered as vector outlines (in Flash) or rasterized bitmaps
  (early HTML5), making text blurry and non-selectable
- **Current approach**: HTML5 output generates **web fonts** that render cleanly across
  browsers — course content appears pixel-perfect and easy to read
- **Limitation**: Despite using web fonts, text in Storyline HTML5 output is **still not
  user-selectable** — it renders as visual web font glyphs but cannot be copied/pasted
- **Typography**: Supports custom fonts imported into the authoring tool; these are bundled
  as web fonts (WOFF/WOFF2) in the published output
- **Text effects**: Drop shadows, outlines, and glow effects are applied via SVG filters

### 1.4 Image Formats in Output

| Image Type | Format Used | Notes |
|-----------|-----------|-------|
| Photographs | **JPEG** | Quality configurable (default 100%) |
| Graphics with transparency | **PNG** | Preferred for crisp edges |
| Imported WebP | **Converted to PNG** | WebP not preserved in output |
| SVG imports | **Preserved as SVG** | Maintained as vector |
| Character images | **PNG** (photographic) / **EMF→SVG** (illustrated) | |
| Slide backgrounds | **JPEG or PNG** | Depends on content |

**Mobile folder**: Published output includes a `mobile/` folder with duplicate images,
though in some versions these were 50%+ larger than desktop versions due to a scaling bug.

### 1.5 Retina/HiDPI Handling

Storyline 360's HiDPI support is **limited and problematic**:

- The authoring tool itself displays poorly on high-DPI monitors (appears pixelated)
- Published HTML5 output relies on **browser-level scaling** rather than providing @2x assets
- **Workaround**: Design at higher resolutions (e.g., 2048x1152) and use "Scale player to
  fill browser window" setting
- SVG-rendered shapes scale cleanly at any resolution (advantage of current SVG approach)
- Raster images (photos, screenshots) can appear blurry on Retina displays unless
  high-resolution source images are used
- No automatic generation of @2x or @3x image variants

---

## 2. ANIMATION SYSTEM

### 2.1 Animation Categories

Storyline 360 provides four categories of animations:

#### Entrance Animations (15 types)
Objects appearing on the slide:

| Animation | Description | Masking? |
|----------|------------|---------|
| Fade | Opacity 0→1 | No |
| Grow | Scale 0→100% | No |
| Fly In | Slide in from edge | No |
| Float In | Gentle rise + fade | No |
| Split | Two halves separate to reveal | Yes |
| Wipe | Progressive reveal from edge | Yes |
| Shape | Reveal through shape mask | Yes |
| Wheel | Pie-slice reveal | Yes |
| Random Bars | Vertical/horizontal bars reveal | Yes |
| Spin | Rotation while appearing | No |
| Spin & Grow | Combined rotation + scale | No |
| Grow & Spin | Combined scale + rotation | No |
| Zoom | Scale from center | No |
| Swivel | 3D-like rotation reveal | No |
| Bounce | Scale with overshoot easing | No |

#### Exit Animations (15 types)
Mirror of entrance animations (Fade Out, Fly Out, Shrink, etc.)

#### Emphasis Animations (5 types)
Draw attention to visible objects:

| Animation | Description |
|----------|------------|
| Pulse | Brief scale up/down (heartbeat) |
| Grow | Increase size and hold |
| Shrink | Decrease size and hold |
| Shake | Rapid horizontal oscillation |
| Teeter | Rocking rotation left/right |

**Note**: The emphasis animation library is notably limited (only 5 types). This was a
known gap that developers work around with custom JavaScript animations.

#### Motion Path Animations
Move objects along defined paths:

| Path Type | Description |
|----------|------------|
| Line | Straight point-to-point movement |
| Arc | Curved movement |
| S-Curve | Sinusoidal path |
| Custom/Freeform | Hand-drawn path |

- Objects can be set to face the direction of travel (auto-rotate along path)
- Start and end points are independently configurable

### 2.2 Animation Timing & Sequencing

| Property | Default | Range |
|---------|---------|-------|
| Duration (entrance/exit/emphasis) | **0.75 seconds** | 0.25s to 5s+ |
| Duration (motion paths) | **2 seconds** | 0.25s to variable |
| Delay | 0 | Any positive value |
| Easing | Linear / ease-in-out | Limited easing options |

**Timeline-based sequencing**:
- Every slide has a **timeline** (like a video editor timeline)
- Objects and animations are placed on the timeline at specific time points
- **Cue points** can be added (press C key during audio playback) to sync animation starts
  with narration
- Multiple objects can animate simultaneously or in sequence by adjusting their timeline positions
- Animations can be triggered at: timeline start, after previous, with previous, or at cue point

### 2.3 How Animations Render in HTML5

The technical implementation uses a **multi-layer approach**:

1. **jQuery `.animate()` method** — Primary animation engine
   ```javascript
   // Example from Storyline's output
   $(element).animate({
     'width': '+=20',
     'height': '+=20',
     'left': '-=10',
     'top': '-=10'
   }, duration);
   ```

2. **CSS transforms** — Used for simple transforms (translate, rotate, scale)

3. **SVG property manipulation** — SVG attributes modified via JavaScript

4. **Masking animations** — Complex effects (wipe, split, wheel, shape) use SVG clipping
   paths or CSS masking — these have **limited mobile support** and fall back to simple
   fades on mobile browsers

**Mobile degradation**: On mobile Safari and mobile Chrome, masking animations (split,
wheel, wipe, shape, random bars) are automatically **converted to fade animations**.
This affects 5 of the 15 entrance/exit animation types.

### 2.4 Slide Transitions

17 transition types between slides:

| Transition | Category |
|-----------|---------|
| Fade | Basic |
| Push | Directional |
| Cover | Directional |
| Uncover | Directional |
| Dissolve | Basic |
| Clock (clockwise/counter) | Masking |
| Circle | Masking |
| Box | Masking |
| Zoom | Basic |
| + 8 more variants | Various |

**Note**: Push and Uncover transitions are **not available for layers** (only for slide-to-slide).

---

## 3. MEDIA HANDLING

### 3.1 Video Playback

| Feature | Implementation |
|---------|---------------|
| Format | **MP4** (H.264 baseline/main/high profiles) |
| Player | HTML5 `<video>` element |
| Controls | Custom player controls (play, pause, seek, volume) |
| Compression | Configurable quality slider; can disable compression for source MP4s |
| Adaptive quality | Basic — single quality level at publish time |
| Timeline sync | Video objects placed on slide timeline; auto-play or trigger-based |
| Optimization | Storyline re-encodes all video at publish time (unless compression set to "None") |

### 3.2 Audio Playback

| Feature | Implementation |
|---------|---------------|
| Narration | Per-slide audio, placed on timeline |
| Background music | Separate background audio channel (auto-ducks under narration) |
| Sound effects | Trigger-based audio clips |
| Format | MP3 in HTML5 output |
| Bitrate | Default 56 kbps (configurable) |
| Duck behavior | Background music auto-lowers to ~70-80% when narration plays |
| Cue points | Created by pressing C key during audio preview; snap objects to sync |

### 3.3 Video/Audio Synchronization

Storyline's synchronization model:

1. **Timeline is master clock** — All media, animations, and interactions sync to the slide timeline
2. **Cue points** — Named markers on timeline that trigger animation starts
3. **Object timing** — Each object has a start time and duration on the timeline
4. **Trigger-based** — Audio/video can start/pause/resume via trigger conditions
5. **Layer timelines** — Each layer has its own independent sub-timeline

### 3.4 Closed Captions / Subtitles

| Feature | Detail |
|---------|--------|
| Import formats | **SRT, VTT (WebVTT), SBV, SUB** |
| Export format | **VTT** (always exports as WebVTT) |
| Auto-detection | Analyzes audio track to detect speech units → generates placeholder captions |
| Built-in editor | Full caption editor with timeline scrubbing |
| Multi-language | Supports multiple caption tracks for different languages |
| Accessibility | Keyboard accessible, screen reader compatible |
| Transcript generation | Automatically generates synchronized video transcripts from captions |

### 3.5 360-Degree Images

| Feature | Detail |
|---------|--------|
| Format | Equirectangular panoramas (2:1 aspect ratio) |
| Interaction | Drag/swipe to look around; add markers and hotspots |
| Markers can contain | Images, audio, video, links to slides/layers |
| Accessibility | Keyboard navigable, screen reader compatible (since Oct 2021) |
| Virtual tours | Can chain multiple 360° images for tour-like experiences |

### 3.6 Zoom Regions

| Feature | Detail |
|---------|--------|
| Purpose | Magnify a specific area of the slide at a point in time |
| Aspect ratio | Locked to match slide aspect ratio |
| Transition speed | Configurable: slow, medium (default), fast |
| Limitation | Only works on base layer (not on layers) |
| Creative use | Consecutive zoom regions create panning effects |
| Best practice | Pair with high-resolution images for crisp zoomed views |

### 3.7 Screen Recording → Interactive Simulations

| Mode | Purpose | Graded? |
|------|---------|---------|
| **View Mode** | Passive walkthrough — video split into steps with captions | No |
| **Try Mode** | Interactive practice — hotspots, hints, pause points | No |
| **Test Mode** | Graded assessment — complete task without assistance | Yes |
| **Video on Single Slide** | Full screencast as embedded video | No |

- All modes auto-generate step-by-step slides from a single screen recording
- The same recording can be inserted multiple times in different modes
- Try Mode adds timed pauses, hotspots, keyboard shortcuts automatically
- Test Mode converts each interactive step into a graded question

---

## 4. CHARACTER SYSTEM

### 4.1 Character Types

| Type | Count | Format | Expressions? |
|------|-------|--------|-------------|
| Photographic | 50+ characters | **PNG** images | No (pose-only) |
| Illustrated | 50+ characters | **EMF** vectors (→ SVG in output) | Yes (full expression control) |

### 4.2 Illustrated Character Features

- **Expressions**: Happy, sad, confused, surprised, angry, neutral, etc.
- **Poses**: Standing, sitting, pointing, thinking, presenting, etc.
- **Perspectives**: Left-facing, front-facing, right-facing
- **Swapping**: Can swap entire character group (all poses) with another character
- Drop-down controls for quick expression/pose changes

### 4.3 Photographic Character Features

- **Poses**: Multiple poses per character (no expression swap)
- **Cropping**: Built-in crop tools
- **Replacement**: Can replace individual poses but NOT swap entire character group
- Stored as pre-rendered PNG images at various poses

### 4.4 How Characters Render

In HTML5 output:
- Photographic characters → PNG images in `<img>` tags or as SVG `<image>` references
- Illustrated characters → SVG vector graphics (converted from EMF source format)
- Both wrapped in the standard `<div aria-label="...">` container
- Characters can have states (normal, hover, selected, visited, etc.) with different poses

---

## 5. PERFORMANCE

### 5.1 Typical File Sizes

| Course Type | Typical Size |
|------------|-------------|
| Text/graphics only (20 slides) | 5-15 MB |
| With narration (20 slides) | 20-50 MB |
| Video-heavy course | 50-200 MB |
| Complex simulation course | 100-350 MB |
| Large project (.story file) | Up to 1.3 GB (publishes to ~350 MB) |

**LMS concern**: Many LMS systems limit SCORM uploads to 50 MB, causing issues for
media-rich Storyline courses.

### 5.2 JavaScript Payload

- Storyline's JavaScript framework: **~2.3 MB** (all JS files combined)
- Includes bundled **jQuery** (no need to load externally)
- Framework loads entirely on first page (no lazy loading of JS)
- Without caching, every visit re-downloads all JavaScript

### 5.3 Loading Strategy

| Aspect | Approach |
|--------|---------|
| JavaScript | All loaded upfront (~2.3 MB) |
| Images | Loaded per slide (not lazy-loaded globally) |
| Video | Loaded when slide reached |
| Audio | Loaded when slide reached |
| Fonts | Loaded upfront (bundled web fonts) |
| Caching | **Relies on browser/server caching** — no service worker |

### 5.4 Mobile Performance

- Responsive player auto-scales to device screen
- Masking animations downgraded to fades on mobile (performance)
- Touch events supported for drag-and-drop
- No offline support (no service worker/cache manifest)
- Single-version output serves all devices (no separate mobile build)

### 5.5 Known Performance Issues

1. **No caching headers by default** — server must be configured to cache assets
2. **Large JS payload** loads synchronously on every page
3. **Image scaling bug** (v3.63) — images not pre-scaled, relying on browser scaling,
   inflating file sizes (50KB image becoming 2.4 MB)
4. **Mobile folder duplication** — separate mobile/ folder with duplicate (sometimes larger)
   images
5. **No lazy loading** for off-screen content
6. **No code splitting** — entire framework loaded regardless of features used

---

## 6. COMPARISON WITH OUR CSS/SVG-FIRST APPROACH

### 6.1 Rendering: Storyline vs. SCORM Content Studio

| Aspect | Storyline 360 | Our Approach | Advantage |
|--------|--------------|-------------|-----------|
| Shape rendering | SVG in div wrappers | CSS + SVG hybrid | **Ours** — semantic HTML + CSS is lighter |
| Text rendering | Web fonts (non-selectable) | Native HTML text | **Ours** — selectable, searchable, accessible |
| Layout | Absolute positioning (px) | CSS Grid/Flexbox | **Ours** — responsive by design |
| Styling | Inline styles + SVG attrs | CSS custom properties | **Ours** — theme-able, maintainable |
| Images | PNG/JPEG (no WebP) | PNG/JPEG/SVG (WebP possible) | **Ours** — modern formats available |
| HiDPI | Browser scaling only | SVG + CSS = resolution independent | **Ours** — naturally crisp |
| DOM accessibility | aria-label on div wrappers | Semantic HTML5 elements | **Ours** — proper headings, lists, nav |
| File size (framework) | ~2.3 MB JavaScript | ~50 KB (scorm-api + behavior-tracker) | **Ours** — 46x smaller |

### 6.2 Animations: Storyline vs. SCORM Content Studio

| Aspect | Storyline 360 | Our Approach | Advantage |
|--------|--------------|-------------|-----------|
| Animation engine | jQuery .animate() | CSS animations + transitions | **Ours** — GPU-accelerated, 60fps |
| Entrance effects | 15 built-in | CSS keyframe library (unlimited) | **Ours** — extensible |
| Emphasis effects | 5 built-in only | CSS @keyframes (unlimited) | **Ours** — much richer |
| Motion paths | Lines, arcs, custom | CSS offset-path / JS (future) | **Storyline** — mature path editor |
| Timeline sequencing | Visual timeline editor | CSS animation-delay + stagger | **Storyline** — easier for non-devs |
| Mobile fallbacks | Auto-degrades masking→fade | CSS works everywhere | **Ours** — consistent cross-device |
| Performance | jQuery DOM manipulation | GPU-composited CSS transforms | **Ours** — significantly smoother |

### 6.3 Media: Storyline vs. SCORM Content Studio

| Aspect | Storyline 360 | Our Approach | Advantage |
|--------|--------------|-------------|-----------|
| Video | MP4 re-encoded | Native HTML5 video | **Ours** — no quality loss |
| Audio sync | Timeline cue points | Custom JS timing | **Storyline** — visual timeline |
| Captions | SRT/VTT import + editor | WebVTT | **Equal** |
| 360° images | Built-in support | Not yet implemented | **Storyline** |
| Zoom regions | Built-in | Not yet implemented | **Storyline** |
| Screen simulations | View/Try/Test modes | Not yet implemented | **Storyline** |
| Characters | 100K+ combinations | AI-generated images | **Different approach** |

---

## 7. RECOMMENDATIONS FOR SCORM CONTENT STUDIO

### 7.1 Leverage Our Strengths (Already Better)

These are areas where our CSS/SVG-first approach is inherently superior:

1. **Semantic HTML** — Our text is real text (selectable, searchable, screen-reader native).
   Storyline wraps everything in divs with aria-labels. Keep this advantage.

2. **CSS-powered animations** — GPU-accelerated CSS transforms/keyframes outperform
   jQuery `.animate()`. Our approach is already technically superior for animation performance.

3. **Theme system** — Our three-layer CSS (base → theme → brand) is far more maintainable
   than Storyline's inline-styled SVG approach. Design System as Code is a genuine
   competitive advantage.

4. **Lightweight output** — ~50 KB framework vs ~2.3 MB. Our packages load faster and
   work better on slow connections (critical for MENA market).

5. **Modern CSS layout** — Grid/Flexbox is inherently responsive. Storyline's absolute
   positioning requires explicit responsive breakpoints.

### 7.2 Close the Gaps (Storyline Has These, We Don't)

Priority features to implement based on Storyline's capabilities:

#### HIGH PRIORITY

| Feature | Storyline Has | Effort | Impact |
|---------|--------------|--------|--------|
| Rich entrance/exit animations | 15 types | Medium | High — visual polish |
| Emphasis animations | 5 types | Low | Medium — attention direction |
| Slide transitions | 17 types | Medium | High — professional feel |
| Audio narration with sync | Timeline + cue points | High | High — accessibility + engagement |

#### MEDIUM PRIORITY

| Feature | Storyline Has | Effort | Impact |
|---------|--------------|--------|--------|
| Motion path animations | Lines, arcs, custom | High | Medium — for creative courses |
| Zoom regions (magnify) | Built-in | Medium | Medium — training on visual content |
| Background music with ducking | Auto-duck under narration | Medium | Medium — atmosphere |
| Video with custom controls | Styled video player | Low | Medium — media-rich courses |

#### FUTURE CONSIDERATION

| Feature | Storyline Has | Effort | Impact |
|---------|--------------|--------|--------|
| 360° panoramic images | Built-in viewer | High | Niche — virtual tours |
| Screen recording simulations | View/Try/Test modes | Very High | Niche — software training |
| Character library | 100K+ combinations | Very High | High — but AI generation is alternative |

### 7.3 Animation Library Specification

Based on Storyline's animation catalog, here's what we should build as CSS keyframes:

```css
/* === ENTRANCE ANIMATIONS (match Storyline's 15) === */
@keyframes fade-in        { from { opacity: 0 } to { opacity: 1 } }
@keyframes grow-in        { from { transform: scale(0) } to { transform: scale(1) } }
@keyframes fly-in-left    { from { transform: translateX(-100%) } to { transform: translateX(0) } }
@keyframes fly-in-right   { from { transform: translateX(100%) } to { transform: translateX(0) } }
@keyframes fly-in-top     { from { transform: translateY(-100%) } to { transform: translateY(0) } }
@keyframes fly-in-bottom  { from { transform: translateY(100%) } to { transform: translateY(0) } }
@keyframes float-in       { from { opacity: 0; transform: translateY(40px) } to { opacity: 1; transform: translateY(0) } }
@keyframes zoom-in        { from { opacity: 0; transform: scale(0.3) } to { opacity: 1; transform: scale(1) } }
@keyframes bounce-in      { /* scale with overshoot easing */ }
@keyframes spin-in        { from { opacity: 0; transform: rotate(-360deg) } to { opacity: 1; transform: rotate(0) } }
@keyframes swivel-in      { from { opacity: 0; transform: rotateY(-90deg) } to { opacity: 1; transform: rotateY(0) } }

/* === EMPHASIS ANIMATIONS (exceed Storyline's 5) === */
@keyframes pulse          { 0%,100% { transform: scale(1) } 50% { transform: scale(1.1) } }
@keyframes shake          { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-5px) } 75% { transform: translateX(5px) } }
@keyframes teeter         { 0%,100% { transform: rotate(0) } 25% { transform: rotate(-5deg) } 75% { transform: rotate(5deg) } }
@keyframes glow           { 0%,100% { box-shadow: 0 0 5px var(--accent) } 50% { box-shadow: 0 0 20px var(--accent) } }

/* === SLIDE TRANSITIONS (CSS-native) === */
/* Implemented via CSS classes on slide containers */
.transition-fade    { animation: fade-in 0.5s ease }
.transition-push    { animation: fly-in-right 0.4s ease-out }
.transition-zoom    { animation: zoom-in 0.5s ease }
```

### 7.4 Key Technical Decisions

Based on this research, these architectural decisions are validated:

1. **CSS animations over jQuery** — Storyline's jQuery approach is a legacy decision.
   CSS animations are hardware-accelerated and perform significantly better.

2. **SVG for icons/decorations, CSS for layout** — Storyline went all-SVG (even for text).
   Our hybrid approach (semantic HTML + CSS + SVG icons) is more accessible and maintainable.

3. **Web fonts bundled locally** — Both approaches agree: no CDN dependencies. Fonts must
   be self-contained.

4. **WebVTT for captions** — Storyline exports VTT. This is the web standard. Use it.

5. **Progressive loading** — Storyline loads everything upfront (bad). We should implement
   per-SCO loading with lazy image loading for better performance.

---

## 8. SOURCES

- [Storyline 360: SVG Support](https://articulate.com/support/article/Storyline-360-SVG-Support)
- [Why People Love Storyline's HTML5 Output](https://community.articulate.com/articles/why-people-love-storyline-s-html5-output)
- [How to Hack Storyline's HTML5 Output](https://blog.elblearning.com/blog/webinar-hack-storylines-html5-output)
- [Storyline 360: Adding Animations](https://community.articulate.com/kb/user-guides/storyline-360-adding-animations/1121958)
- [Storyline 360: Emphasis Animations](https://access.articulate.com/support/article/Storyline-360-Emphasis-Animations)
- [Emphasis Articulate Storyline Animations (ELB Learning)](https://blog.elblearning.com/blog/emphasis-articulate-storyline-animations)
- [Motion Path Animations in Storyline 360](https://www.swiftelearningservices.com/motion-path-animations-storyline-360/)
- [7 Pro Tips for Motion Path Animations](https://community.articulate.com/blog/articles/7-pro-tips-for-working-with-motion-path-animations-in-storyline-360/1140096)
- [Using Animations and Transitions](https://bonlinelearning.com/animations-and-transitions-in-articulate-storyline/)
- [Adding Transitions to Slides and Layers](https://community.articulate.com/kb/user-guides/storyline-360-adding-transitions-to-slides-and-layers/1141859)
- [How Masking Animations Work in HTML5](https://access.articulate.com/support/article/Storyline-360-How-Masking-Animations-and-Transitions-Work-in-in-HTML5-Output)
- [Some Animations Converted to Fades on Mobile](https://articulate.com/support/article/Storyline-360-Some-HTML5-Animations-and-Transitions-Are-Converted-to-Fades-on-Mobile-Devices)
- [Creating Closed Captions](https://community.articulate.com/kb/user-guides/storyline-360-creating-and-editing-closed-captions-with-the-built-in-editor/1138912)
- [Importing Closed Captions](https://community.articulate.com/articles/storyline-360-importing-closed-captions-for-narration-and-videos)
- [Synchronized Video Transcripts](https://www.swiftelearningservices.com/synchronized-video-from-closed-captions-in-storyline-360/)
- [Interactive 360 Images](https://community.articulate.com/discussions/articulate-storyline/new-beta-feature-in-storyline-360-interactive-360-images)
- [360 Image FAQs](https://community.articulate.com/articles/storyline-360-answering-360-degree-images-faqs)
- [Adding Zoom Regions](https://community.articulate.com/articles/articulate-storyline-360-user-guide-how-to-add-zoom-regions)
- [Step-by-Step Slides: View, Try, Test Modes](https://community.articulate.com/blog/articles/storyline-step-by-step-slides-view-try-and-test-mode/1093767)
- [Creating Interactive Simulations](https://blog.commlabindia.com/elearning-development/articulate-storyline-create-interactive-simulations)
- [Editing Content Library Characters](https://community.articulate.com/kb/user-guides/storyline-360-editing-content-library-360-characters/1139569)
- [Storyline 360 HTML5 Performance](https://community.articulate.com/discussions/articulate-storyline/storline-360-html5-performance)
- [Reducing SCORM Package File Size](https://community.articulate.com/discussions/articulate-storyline/reducing-scorm-package-file-size)
- [Best Practices for Images and Videos](https://articulate.com/support/article/Storyline-360-Best-Practices-for-High-Quality-Images-and-Videos)
- [High Resolution Screen Support](https://community.articulate.com/discussions/articulate-storyline/articulate-storyline-360-high-resolution-screen-support)
- [Simplified Output Folder Names](https://access.articulate.com/support/article/Storyline-360-Simplified-Output-Folder-Names)
- [Changing Browser Settings and Player Size](https://community.articulate.com/articles/articulate-storyline-360-user-guide-how-to-change-the-browser-settings-and-player-size)
- [Adding Videos](https://community.articulate.com/kb/user-guides/storyline-360-adding-videos/1121445)
- [Video Encoding for Storyline 360](https://community.articulate.com/discussions/articulate-storyline/video-encoding-for-storyline-360)
- [Audio Tools](https://community.articulate.com/articles/articulate-storyline-360-user-guide-how-to-use-the-audio-tools)
- [Background Audio](https://www.articulatesupport.com/article/Storyline-360-Background-Audio)
