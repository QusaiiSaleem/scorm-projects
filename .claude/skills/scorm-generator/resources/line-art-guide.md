# One-Line Art — Standalone Agent Guide

> **Self-contained.** This single file contains the entire visual spec, all the
> code (engine + controller + CSS + HTML), the authoring rules, a lint, and a
> render check. An agent handed **only this `.md`** (plus a reference image) can
> build the whole effect with nothing else. Do not go looking for other files.

---

## 0. TL;DR

A single continuous **one-line drawing** (the pen never lifts) **is the visual
for each slide**. When the learner moves to the next slide, the **same line
reshapes (morphs)** into a new drawing about the next slide's content. First
slide draws itself in; every move after that morphs. It sits behind the slide
text, is drawn as a thin themed stroke, and enters/exits the frame as a flat
"tail" so it feels like one line running through the whole scene.

Reference look: Loooop-style continuous-line art — one animal/figure melts into
the next.

---

## 1. Intent — what we are and are NOT doing

| We ARE doing | We are NOT doing |
|---|---|
| The drawing **is** the slide's visual | A photo/texture behind the text |
| **One continuous stroke** per drawing | Multiple disconnected shapes / clip-art |
| The line **morphs** into the next subject | A new picture that hard-cuts in |
| Subject **relates to the slide content** | A random flourish unrelated to the lesson |
| A flat **tail enters one edge, exits the other** | A shape floating unconnected to the frame |
| Thin, confident, minimal **stroke** | Filled shapes, gradients-as-subject, heavy detail |

---

## 2. Two variants — pick one, then commit

There are two distinct effects. This guide is about **A**.

- **A · Morph per slide** *(this guide)* — each slide has its OWN one-line
  drawing; the line reshapes into the next slide's drawing. "The line **becomes**
  each slide."
- **B · One line that extends** — a single drawing that isn't finished until the
  last slide; each slide draws the next segment of the same subject. "The line
  **continues/finishes** across slides." (Different engine; not covered here.)

Rule of thumb: *becomes* → A. *continues* → B.

---

## 3. Handoff mode — decide this FIRST

The deliverable's structure depends on where you're running. Pick one:

- **Mode SELF-CONTAINED (default).** Produce **one HTML file** with the engine,
  controller, CSS, shapes, and wiring all **inlined** — no external `.js`/`.css`,
  no build step. This matches the no-build workflow and is what you want when you
  were handed only this guide. **Everything you need is embedded in §7–§10 below.**
- **Mode REPO.** You are working inside the SCORM resources repo, where the
  engine already exists as shared files. Then you may load the engine from
  `shared/engine/` instead of inlining, and use the repo's own slide controller.
  The engine code is identical to §8.

If unsure, use **SELF-CONTAINED**.

---

## 4. Direction — RTL is the primary case

Courses here are frequently **RTL Arabic** (`dir="rtl"`, `lang="ar"`). Author for
RTL first; LTR is the mirror.

- **RTL (default):** the pen should travel **with** reading direction — enter from
  the **right** edge, exit **left**. Author each path as
  `M 1320 <y> … L -40 <y>` and place the slide text on the **right**.
- **LTR:** mirror it — enter **left**, exit **right**:
  `M -40 <y> … L 1320 <y>`, text on the **left**.

Keep the traversal direction **consistent across every shape in a course** (all
enter the same edge). Mixed directions make the morph flip the line around
(the engine's `_align` will reverse a path to reduce twisting, but consistent
authoring looks better).

Both skeletons are given in §10. Alternative for dense Arabic text: a **vertical
ink rail** down one side instead of a horizontal tail — same engine, just author
the tail vertically.

---

## 5. Visual rules for each drawing (the real invariants)

1. **One unbroken stroke = exactly one `M`.** The `d` starts with a single
   `M` and then only curve/line commands to the end. **Do NOT use a second `M`
   (no second subpath) in variant A.** The morph samples the path by
   `getTotalLength()`/`getPointAtLength()`; a second subpath makes the sampler
   jump across the gap between pieces mid-morph, which looks broken. One subpath
   only.
2. **Canvas = `viewBox="0 0 1280 720"`** (16:9, matches the slide area).
3. **Flat entry/exit tail (the one true invariant about coordinates):**
   the path **starts off one edge and ends off the other**, on a horizontal tail:
   - LTR: begins `M -40 <y>`, ends `L 1320 <y>`.
   - RTL: begins `M 1320 <y>`, ends `L -40 <y>`.
   The tail `<y>` **may differ from drawing to drawing** (a cat can sit on
   `y=600`, a fish swim at `y=380`). The morph tweens the whole line, so a
   differing tail just glides vertically during the transition — that is fine and
   often looks good. If you specifically want zero vertical tail movement, keep
   `<y>` equal across shapes — that is an aesthetic choice, **not** a requirement.
   (Earlier drafts of this guide wrongly called equal baselines "non-negotiable";
   they are not.)
4. **Stroke, never fill.** `fill:none`, thin uniform weight (`2–3px`), round
   caps/joins. Color from the theme so it recolors with the course.
5. **The drawing is the subject** → high opacity (`~0.9`).
6. **Behind text, not under the mouse.** The `<svg>` is `z-index:0` inside
   `.sco-content`, `pointer-events:none`; slide content is `z-index:1`. Put text
   to the side (right for RTL, left for LTR) so the figure stays visible.
7. **Recognizable & accurate.** Per the studio accuracy rule, if it depicts
   something real (an animal silhouette, an exercise, a labeled object) it must
   read clearly and be factually correct.

---

## 6. Authoring shapes that morph WELL (learned the hard way)

"Any two single-line paths morph" is mechanically true but says nothing about
looking good. For clean morphs, every shape in a course should obey:

- **Same traversal direction** — all enter the same edge, flow to the other
  (see §4). Otherwise the line visibly turns itself inside-out at the swap.
- **Similar x-band and similar total length** — keep each figure within roughly
  the same horizontal region (e.g. the subject lives around `x≈250…900`) and of
  comparable path length. The morph maps points by arc-length fraction, so wildly
  different lengths make points bunch up and the tween looks lopsided.
- **No closed loops / no shapes that fight the left↔right flow.** A motif that
  doubles back on itself or closes a loop reads as a tangle when interpolated,
  and its arc-length sampling fights the tail. Favor open, mostly-monotonic-in-x
  silhouettes that progress from the entry tail to the exit tail.
  - *Lesson paid for:* a **mosque-arch** motif (a closed, symmetric arch) morphed
    into mush and had to be re-authored as a **minaret** (an open, tall, flowing
    silhouette) before it worked. If a subject wants to be a closed loop,
    restyle it as an open line before committing.
- **Roughly consistent point of interest** — put the "head"/focal mass at a
  similar place across shapes so the eye tracks one thing through the morph.

If a shape violates these, fix the shape — don't fight the engine.

---

## 7. The CSS (inline this)

```css
/* The single continuous line, behind slide content */
.line-art-bg{
  position:absolute; inset:0; width:100%; height:100%;
  z-index:0; pointer-events:none; overflow:visible;
}
.line-art-bg .line-path{
  fill:none;
  stroke: var(--color-text, #141821);   /* theme color; swap for an accent */
  stroke-width:2.6;
  stroke-linecap:round; stroke-linejoin:round;
  opacity:.9;                            /* the drawing IS the subject */
}
.line-art-bg .pen{                       /* dot that rides the tip on draw-in */
  fill: var(--color-accent, #e4572e);
  opacity:0; transition:opacity .2s ease;
}
.sco-content{ position:relative; overflow:hidden; }
.sco-content > .slide{ position:relative; z-index:1; }   /* text above the line */

@media (prefers-reduced-motion: reduce){ .line-art-bg .pen{ display:none; } }
```

---

## 8. The engine (inline this — complete, verbatim)

`SlideLineArt`: draws the first shape in, morphs into every subsequent shape.
Resamples both paths by arc length and aligns them so the line flows. Handles
`prefers-reduced-motion` (jump, no anim), updates an `sr-only` caption, and
**cancels any in-flight animation before starting the next** (so rapid Next/Back
never stacks animation frames — `show()` calls `_cancel()` first).

```js
(function () {
  'use strict';
  var SVGNS = 'http://www.w3.org/2000/svg';
  var prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resolveOne(sel) {
    if (!sel) return null;
    if (typeof sel === 'string') return document.querySelector(sel);
    return sel.nodeType ? sel : null;
  }
  function easeInOut(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2; }

  function SlideLineArt(options) {
    options = options || {};
    this.path = resolveOne(options.path);
    this.shapes = options.shapes || [];
    if (!this.path || !this.shapes.length) { this._empty = true; return; }

    this.pen = resolveOne(options.pen);
    this.caption = resolveOne(options.caption);           // optional sr-only element
    this.samples = options.samples || 240;                // morph point count (see §12)
    this.drawInDuration = options.drawInDuration != null ? options.drawInDuration : 1100;
    this.morphDuration  = options.morphDuration  != null ? options.morphDuration  : 900;
    this.easing = typeof options.easing === 'function' ? options.easing : easeInOut;

    this.current = null;                                  // index currently shown
    this._raf = null;

    this._probe = document.createElementNS(SVGNS, 'path'); // hidden sampler
    this._probe.setAttribute('d', 'M0 0');
    this._probe.style.visibility = 'hidden';
    this._probe.style.pointerEvents = 'none';
    this.path.parentNode.appendChild(this._probe);

    if (this.pen) this.pen.style.opacity = '0';
  }

  SlideLineArt.prototype._sample = function (el, n) {
    var len = el.getTotalLength(), pts = [];
    if (len === 0) { for (var k=0;k<n;k++) pts.push([0,0]); return pts; }
    for (var i=0;i<n;i++){ var p = el.getPointAtLength((len*i)/(n-1)); pts.push([p.x,p.y]); }
    return pts;
  };

  function ptsToPath(pts) {
    var s = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i=1;i<pts.length;i++) s += ' L' + pts[i][0].toFixed(1) + ' ' + pts[i][1].toFixed(1);
    return s;
  }

  // Rotate/reverse `to` to best line up with `from` so the morph flows.
  SlideLineArt.prototype._align = function (from, to) {
    var n = to.length, probes = 24, step = Math.max(1, Math.floor(n/60));
    function cost(cand){ var c=0; for (var m=0;m<probes;m++){ var idx=Math.floor((m/probes)*n);
      var dx=from[idx][0]-cand[idx][0], dy=from[idx][1]-cand[idx][1]; c+=dx*dx+dy*dy; } return c; }
    function rotate(a,off){ return a.slice(off).concat(a.slice(0,off)); }
    var best=to, bestCost=cost(to), dirs=[to, to.slice().reverse()];
    for (var d=0;d<dirs.length;d++) for (var off=0;off<n;off+=step){
      var cand=rotate(dirs[d],off), c=cost(cand); if (c<bestCost){ bestCost=c; best=cand; } }
    return best;
  };

  SlideLineArt.prototype._setCaption = function (index) {
    if (this.caption && this.shapes[index] && this.shapes[index].label)
      this.caption.textContent = this.shapes[index].label;
  };
  SlideLineArt.prototype._cancel = function () {
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
  };

  // Show slide `index`: draw in the first time, morph thereafter.
  SlideLineArt.prototype.show = function (index, animate) {
    if (this._empty) return;
    index = Math.max(0, Math.min(this.shapes.length - 1, index)); // clamp — see §12
    if (animate === undefined) animate = true;
    this._cancel();                                                // no stacked RAFs
    this._setCaption(index);
    var shape = this.shapes[index];

    if (!animate || prefersReduced) {
      this.path.style.strokeDasharray = 'none';
      this.path.style.strokeDashoffset = '0';
      this.path.setAttribute('d', shape.d);
      if (this.pen) this.pen.style.opacity = '0';
      this.current = index; return;
    }
    if (this.current === null) this._drawIn(shape, index);
    else this._morph(this.current, index);
  };

  SlideLineArt.prototype._drawIn = function (shape, index) {
    var self = this;
    this.path.setAttribute('d', shape.d);
    var len = this.path.getTotalLength();
    this.path.style.strokeDasharray = len + ' ' + len;
    this.path.style.strokeDashoffset = len;
    var startTime = null;
    function frame(now){
      if (startTime===null) startTime=now;
      var t=Math.min(1,(now-startTime)/self.drawInDuration), e=self.easing(t), shown=len*e;
      self.path.style.strokeDashoffset = (len - shown);
      if (self.pen){ var pt=self.path.getPointAtLength(shown);
        self.pen.setAttribute('cx',pt.x); self.pen.setAttribute('cy',pt.y);
        self.pen.style.opacity = t<1 ? '1' : '0'; }
      if (t<1) self._raf=requestAnimationFrame(frame);
      else { self._raf=null; self.path.style.strokeDasharray='none'; }
    }
    this.current = index;
    this._raf = requestAnimationFrame(frame);
  };

  SlideLineArt.prototype._morph = function (fromIdx, toIdx) {
    var self = this, n = this.samples;
    this.path.style.strokeDasharray='none'; this.path.style.strokeDashoffset='0';
    var from = this._sample(this.path, n);
    this._probe.setAttribute('d', this.shapes[toIdx].d);
    var to = this._align(from, this._sample(this._probe, n));
    if (this.pen) this.pen.style.opacity='0';
    var startTime=null, cur=new Array(n);
    function frame(now){
      if (startTime===null) startTime=now;
      var t=Math.min(1,(now-startTime)/self.morphDuration), e=self.easing(t);
      for (var i=0;i<n;i++) cur[i]=[from[i][0]+(to[i][0]-from[i][0])*e,
                                    from[i][1]+(to[i][1]-from[i][1])*e];
      self.path.setAttribute('d', ptsToPath(cur));
      if (t<1) self._raf=requestAnimationFrame(frame);
      else { self._raf=null; self.path.setAttribute('d', self.shapes[toIdx].d); } // snap crisp
    }
    this.current = toIdx;
    this._raf = requestAnimationFrame(frame);
  };

  SlideLineArt.prototype.attachTo = function (controller) {
    if (!controller || this._empty) return this;
    var self = this, prev = controller.onSlideChange;
    controller.onSlideChange = function (index, total) {
      if (prev) prev(index, total);
      self.show(index);
    };
    this.show(controller.currentIndex || 0);
    return this;
  };

  window.SlideLineArt = SlideLineArt;
})();
```

---

## 9. A minimal, complete slide controller (inline this)

Enough to run standalone: shows one `.slide` at a time, Prev/Next buttons,
arrow keys, `currentIndex`, `onSlideChange`, `onComplete`. (In Mode REPO you'd
use the repo's richer `slide-controller.js` instead — same `onSlideChange`
contract.)

```js
(function () {
  function SlideController(opts){
    opts = opts || {};
    this.slides = document.querySelectorAll('.slide');
    this.total = this.slides.length;
    this.currentIndex = 0;
    this.onSlideChange = opts.onSlideChange || null;
    this.onComplete = opts.onComplete || null;
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.indicator = document.getElementById('pageIndicator');
    var self = this;
    if (this.prevBtn) this.prevBtn.addEventListener('click', function(){ self.prev(); });
    if (this.nextBtn) this.nextBtn.addEventListener('click', function(){ self.next(); });
    document.addEventListener('keydown', function(e){
      if (e.key==='ArrowRight'||e.key==='ArrowDown'){ e.preventDefault(); self.next(); }
      else if (e.key==='ArrowLeft'||e.key==='ArrowUp'){ e.preventDefault(); self.prev(); }
    });
    this._render(false);
  }
  SlideController.prototype._render = function(fire){
    for (var i=0;i<this.total;i++) this.slides[i].classList.toggle('active', i===this.currentIndex);
    if (this.indicator) this.indicator.textContent = (this.currentIndex+1)+' / '+this.total;
    if (this.prevBtn) this.prevBtn.disabled = this.currentIndex===0;
    if (fire && this.onSlideChange) this.onSlideChange(this.currentIndex, this.total);
  };
  SlideController.prototype.next = function(){
    if (this.currentIndex < this.total-1){ this.currentIndex++; this._render(true); }
    else if (this.onComplete) this.onComplete();
  };
  SlideController.prototype.prev = function(){
    if (this.currentIndex > 0){ this.currentIndex--; this._render(true); }
  };
  SlideController.prototype.goTo = function(i){
    if (i>=0 && i<this.total && i!==this.currentIndex){ this.currentIndex=i; this._render(true); }
  };
  window.SlideController = SlideController;
})();
```

---

## 10. Full HTML skeletons (copy one)

### 10a. RTL (Arabic) — the default

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>خط واحد</title>
<style>
  :root{ --color-text:#141821; --color-accent:#2e7d5b; }
  *{box-sizing:border-box} html,body{height:100%;margin:0;font-family:system-ui}
  .sco-container{height:100vh;display:flex;flex-direction:column}
  .sco-content{flex:1;position:relative;overflow:hidden}
  /* ——— paste §7 CSS here ——— */
  .slide{position:absolute;inset:0;z-index:1;display:none;align-items:center;
         justify-content:flex-start;padding:0 8%}          /* text on the RIGHT in RTL */
  .slide.active{display:flex}
  .slide-inner{max-width:420px;text-align:right}
  .sco-nav{height:60px;display:flex;align-items:center;justify-content:center;gap:16px;
           border-top:1px solid #0002}
  .sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}
</style></head>
<body>
<div class="sco-container">
  <main class="sco-content">
    <!-- RTL: enters RIGHT (M 1320 …), exits LEFT (… L -40) -->
    <svg id="line-bg" class="line-art-bg" viewBox="0 0 1280 720"
         preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      <path class="line-path" d="M 1320 600 L -40 600"></path>
      <circle class="pen" r="6"></circle>
    </svg>
    <section class="slide" data-slide="0"><div class="slide-inner"><h2>الشريحة الأولى</h2></div></section>
    <section class="slide" data-slide="1"><div class="slide-inner"><h2>الشريحة الثانية</h2></div></section>
    <!-- one <section.slide> per shape -->
  </main>
  <nav class="sco-nav">
    <button id="prevBtn">السابق</button>
    <span id="pageIndicator">1 / 2</span>
    <button id="nextBtn">التالي</button>
  </nav>
</div>
<div class="sr-only" id="lineCaption" aria-live="polite"></div>

<script>/* ——— paste §8 engine here ——— */</script>
<script>/* ——— paste §9 controller here ——— */</script>
<script>
  var art = new SlideLineArt({
    path:'#line-bg .line-path', pen:'#line-bg .pen', caption:'#lineCaption',
    samples:240,                       // morph fidelity (see §12)
    drawInDuration:1300, morphDuration:900,
    shapes:[                           // RTL: each starts M 1320 <y>, ends L -40 <y>
      { d:'M 1320 600 … L -40 600', label:'وصف الرسم الأول' },
      { d:'M 1320 470 … L -40 470', label:'وصف الرسم الثاني' }
    ]
  });
  var controller = new SlideController({ onComplete:function(){ controller.goTo(0); } });
  art.attachTo(controller);
</script>
</body></html>
```

### 10b. LTR — the mirror

Same file, but `dir="ltr"`, text on the left (`justify-content:flex-start` with
`text-align:left`), and every path enters left / exits right:
`M -40 <y> … L 1320 <y>`.

---

## 11. SCORM tracking — this is a VISUAL LAYER ONLY

**The line art does not report anything to the LMS.** It has no `cmi.*`
completion/status, no `imsmanifest.xml`, no xAPI. In the runnable demo,
`onComplete` merely calls `goTo(0)` to loop — that is **demo-only**.

In a real SCO:

- Completion/pass/score is reported by your **SCORM wrapper** (e.g. the course's
  `scorm-api.js` and the SCO's own completion logic), **not** by `SlideLineArt`.
- **Do not let the line-art `onComplete` swallow the LMS-completion signal.** If
  you pass `onComplete` to the controller for the visual (e.g. a restart or a
  celebration), it must **also** call your real completion reporter, or leave the
  LMS reporting on a separate handler:

  ```js
  var controller = new SlideController({
    onComplete: function(){
      if (window.SCORM && SCORM.setComplete) SCORM.setComplete(); // report to LMS
      // optional visual flourish here — must NOT replace the line above
    }
  });
  ```

- Decide up front whether SCORM tracking is in your scope or a separate wrapping
  layer. If in scope, wire the real `setComplete()/setScore()` at the point the
  learner finishes the SCO — the line art is independent of it.

---

## 12. Behavior notes / FAQ (answers an agent will need)

- **`samples`** — the N points used for the morph (`options.samples`, **default
  240**). Higher = smoother curves but more per-frame work; 160–320 is a sane
  range. Listed in the §10 wiring.
- **Rapid navigation** — safe. `show()` calls `_cancel()`
  (`cancelAnimationFrame`) before starting a new animation, so spamming
  Next/Back never stacks RAF loops. Each new move interrupts the previous cleanly.
- **`shapes.length` ≠ number of slides** — `show()` **clamps** the index to
  `[0, shapes.length-1]`. So with **fewer** shapes than slides, the extra slides
  reuse the **last** shape; with **more** shapes, the extras are unused. Validate
  before shipping:
  ```js
  if (shapes.length !== document.querySelectorAll('.slide').length)
    console.warn('line-art: shapes count != slide count', shapes.length,
                 document.querySelectorAll('.slide').length);
  ```
- **The pen dot** shows only during the first-slide draw-in, then hides. It never
  appears during morphs.
- **Reduced motion** — the engine jumps straight to the crisp shape and hides the
  pen. Don't add your own animation on top.

---

## 13. Where drawings come from (dependable → last resort)

Getting a model to emit **one unbroken stroke with correct flat tails** is
unreliable, so treat generation as a draft:

1. **Hand-author** the `d` on the 1280×720 viewBox, then **render-check and
   iterate** (§14). This is the dependable path — it's how the shipped shapes
   were made.
2. **Designer SVG** — paste a designer's single `<path d="…">`; verify it's one
   `M` and has the flat tails, fix the ends if not.
3. **Model generation — DRAFT ONLY, ALWAYS HAND-FIX.** If you have an SVG
   generator available, prompt for *"single continuous one-line drawing of
   <SUBJECT>, side view, ONE unbroken stroke, no fills, 2px, enters flat from one
   edge and exits the other, 1280×720."* Then **repair** the output: collapse it
   to a single `M`, force the tails to `M ±edge <y> … L ∓edge <y>`, and
   render-check. Never ship raw generator output.

---

## 14. VERIFY (a headless agent cannot eyeball — do both)

### 14a. Lint the `d` strings (pure Node, no deps)

Asserts the real invariants: single `M`, correct entry/exit tails.

```js
// node lint-shapes.js  — edit DIR/SHAPES and EDGE for LTR vs RTL
var SHAPES = require('./shapes.js'); // or paste the array
var DIR = 'rtl';                     // 'rtl' | 'ltr'
var enterX = DIR==='rtl' ? 1320 : -40, exitX = DIR==='rtl' ? -40 : 1320;
var ok = true;
SHAPES.forEach(function(s, i){
  var d = s.d.trim();
  var mCount = (d.match(/M/gi) || []).length;
  var start = new RegExp('^M\\s*' + enterX + '\\b');
  var end   = new RegExp('L\\s*' + exitX + '\\s+\\d+(\\.\\d+)?\\s*$');
  if (mCount !== 1)      { ok=false; console.error('#'+i, s.label, 'has', mCount, 'M commands (need 1)'); }
  if (!start.test(d))    { ok=false; console.error('#'+i, s.label, 'must start M '+enterX+' <y>'); }
  if (!end.test(d))      { ok=false; console.error('#'+i, s.label, 'must end L '+exitX+' <y>'); }
});
console.log(ok ? 'LINT OK' : 'LINT FAILED'); process.exit(ok?0:1);
```

### 14b. Render each shape to PNG and look at it

Dependable render path — **cairosvg** (Python), no browser needed:

```bash
pip install cairosvg
python3 - <<'PY'
import cairosvg, re
# paste your shapes as a list of (label, d)
shapes = [("cat", "M -40 600 ... L 1320 600")]
for name, d in shapes:
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720">
      <path d="{d}" fill="none" stroke="#111" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round"/></svg>'''
    cairosvg.svg2png(bytestring=svg.encode(), write_to=f"{name}.png",
                     output_width=640, output_height=360)
    print("wrote", name+".png")
PY
```

Or, if a browser is available, load the self-contained HTML headlessly, step
Next through every slide, and screenshot — confirming draw-in, each morph, the
caption updates, and **zero console errors**. Either way: **open the PNGs and
confirm each subject is recognizable** before shipping. Iterate the `d` until it
reads. Don't trust a `d` you haven't rendered.

---

## 15. Pre-ship checklist

- [ ] Handoff mode chosen (SELF-CONTAINED unless inside the repo).
- [ ] Direction set (RTL default): all shapes enter the same edge, text on the
      correct side.
- [ ] Every shape: **one `M`**, `viewBox 0 0 1280 720`, enters `±edge <y>`,
      exits `∓edge <y>`. (`<y>` may vary per shape.)
- [ ] `fill:none`, thin themed stroke, opacity ~0.9.
- [ ] `<svg>` behind content (`z-index:0`, `pointer-events:none`); text to the side.
- [ ] Shapes share traversal direction + similar x-band/length; no closed loops.
- [ ] Each subject relates to its slide and is factually accurate.
- [ ] `label` on every shape (sr-only caption); `prefers-reduced-motion` untouched.
- [ ] `shapes.length === slide count` (or the reuse/unused behavior is intended).
- [ ] SCORM completion reported by the wrapper, **not** swallowed by the line art.
- [ ] **Lint passes (14a) AND every shape rendered and eyeballed (14b), no
      console errors.**
