/**
 * SCORM Content Studio — Slide Line Art (draw-in + morph)
 * =======================================================
 * A single continuous "one-line" drawing that acts as the VISUAL for each
 * slide. Every slide owns its own line illustration (related to that slide's
 * content). As the learner navigates, the SAME line RESHAPES — it morphs from
 * the current slide's drawing into the next slide's drawing — so it reads like
 * one living line that keeps turning into different pictures.
 *
 * This is the "Loooop-style" continuous-line effect: the pen never lifts, and
 * the line flows from one subject into another.
 *
 *   - Slide shown for the first time in the session  -> the line DRAWS ITSELF
 *     in (classic stroke-dash reveal, with a pen dot riding the tip).
 *   - Every navigation after that                    -> the line MORPHS from
 *     the current shape into the target slide's shape.
 *
 * It lives BEHIND the content as an ambient background element (theme colored,
 * low opacity, pointer-events:none) — the drawing, not a photo.
 *
 * ---------------------------------------------------------------------------
 * USAGE:
 *
 *   const art = new SlideLineArt({
 *     path:  '#line-bg .line-path',   // the ONE visible line
 *     pen:   '#line-bg .pen',         // optional dot for the draw-in
 *     shapes: [                       // ONE entry per slide, in slide order
 *       { d: 'M ...idea...',    label: 'A lightbulb' },
 *       { d: 'M ...book...',    label: 'An open book' },
 *       { d: 'M ...target...',  label: 'A target' }
 *     ]
 *   });
 *
 *   const controller = new SlideController();
 *   art.attachTo(controller);         // morphs the line on every slide change
 *
 * Each `d` is ONE continuous path drawn on the 1280x720 viewBox. Shapes do NOT
 * need matching point counts — the morph resamples both by arc length, so any
 * two paths interpolate smoothly. Give each a `label` for the sr-only caption.
 *
 * See components/slide-line-art.html for ready-made single-line shape presets.
 */

(function () {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resolveOne(sel) {
    if (!sel) return null;
    if (typeof sel === 'string') return document.querySelector(sel);
    return sel.nodeType ? sel : null;
  }
  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function SlideLineArt(options) {
    options = options || {};
    this.path = resolveOne(options.path);
    this.shapes = options.shapes || [];

    if (!this.path || !this.shapes.length) {
      this._empty = true; // fail quietly — a missing visual never breaks a SCO
      return;
    }

    this.pen = resolveOne(options.pen);
    this.caption = resolveOne(options.caption); // optional sr-only <element>
    this.samples = options.samples || 240;      // points used for morphing
    this.drawInDuration = options.drawInDuration != null ? options.drawInDuration : 1100;
    this.morphDuration = options.morphDuration != null ? options.morphDuration : 900;
    this.easing = typeof options.easing === 'function' ? options.easing : easeInOut;

    this.current = null;   // index of the shape currently displayed
    this._raf = null;

    // Hidden helper path used to measure/sample arbitrary `d` strings without
    // disturbing the visible line.
    this._probe = document.createElementNS(SVGNS, 'path');
    this._probe.setAttribute('d', 'M0 0');
    this._probe.style.visibility = 'hidden';
    this._probe.style.pointerEvents = 'none';
    this.path.parentNode.appendChild(this._probe);

    if (this.pen) this.pen.style.opacity = '0';
  }

  /** Sample `n` evenly arc-spaced points from a path element. */
  SlideLineArt.prototype._sample = function (el, n) {
    var len = el.getTotalLength();
    var pts = [];
    if (len === 0) { for (var k = 0; k < n; k++) pts.push([0, 0]); return pts; }
    for (var i = 0; i < n; i++) {
      var p = el.getPointAtLength((len * i) / (n - 1));
      pts.push([p.x, p.y]);
    }
    return pts;
  };

  function ptsToPath(pts) {
    var s = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 1; i < pts.length; i++) {
      s += ' L' + pts[i][0].toFixed(1) + ' ' + pts[i][1].toFixed(1);
    }
    return s;
  }

  /**
   * Reorder `to` (rotation + optional reversal) to best line up with `from`,
   * so the morph flows instead of twisting itself inside out.
   */
  SlideLineArt.prototype._align = function (from, to) {
    var n = to.length;
    var probes = 24;
    var step = Math.max(1, Math.floor(n / 60));

    function cost(cand) {
      var c = 0;
      for (var m = 0; m < probes; m++) {
        var idx = Math.floor((m / probes) * n);
        var dx = from[idx][0] - cand[idx][0];
        var dy = from[idx][1] - cand[idx][1];
        c += dx * dx + dy * dy;
      }
      return c;
    }
    function rotate(arr, off) {
      return arr.slice(off).concat(arr.slice(0, off));
    }

    var best = to, bestCost = cost(to);
    var reversed = to.slice().reverse();
    var dirs = [to, reversed];
    for (var d = 0; d < dirs.length; d++) {
      for (var off = 0; off < n; off += step) {
        var cand = rotate(dirs[d], off);
        var c = cost(cand);
        if (c < bestCost) { bestCost = c; best = cand; }
      }
    }
    return best;
  };

  SlideLineArt.prototype._setCaption = function (index) {
    if (this.caption && this.shapes[index] && this.shapes[index].label) {
      this.caption.textContent = this.shapes[index].label;
    }
  };

  SlideLineArt.prototype._cancel = function () {
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
  };

  /** Show slide `index`: draw it in the first time, morph into it thereafter. */
  SlideLineArt.prototype.show = function (index, animate) {
    if (this._empty) return;
    index = Math.max(0, Math.min(this.shapes.length - 1, index));
    if (animate === undefined) animate = true;
    this._cancel();
    this._setCaption(index);

    var shape = this.shapes[index];

    if (!animate || prefersReduced) {
      this.path.style.strokeDasharray = 'none';
      this.path.style.strokeDashoffset = '0';
      this.path.setAttribute('d', shape.d); // crisp curves, no animation
      if (this.pen) this.pen.style.opacity = '0';
      this.current = index;
      return;
    }

    if (this.current === null) {
      this._drawIn(shape, index);
    } else {
      this._morph(this.current, index);
    }
  };

  /** Classic stroke-dash reveal — the line draws itself onto the slide. */
  SlideLineArt.prototype._drawIn = function (shape, index) {
    var self = this;
    this.path.setAttribute('d', shape.d);
    var len = this.path.getTotalLength();
    this.path.style.strokeDasharray = len + ' ' + len;
    this.path.style.strokeDashoffset = len;

    var startTime = null;
    function frame(now) {
      if (startTime === null) startTime = now;
      var t = Math.min(1, (now - startTime) / self.drawInDuration);
      var e = self.easing(t);
      var shown = len * e;
      self.path.style.strokeDashoffset = (len - shown);
      if (self.pen) {
        var pt = self.path.getPointAtLength(shown);
        self.pen.setAttribute('cx', pt.x);
        self.pen.setAttribute('cy', pt.y);
        self.pen.style.opacity = t < 1 ? '1' : '0';
      }
      if (t < 1) { self._raf = requestAnimationFrame(frame); }
      else { self._raf = null; self.path.style.strokeDasharray = 'none'; }
    }
    this.current = index;
    this._raf = requestAnimationFrame(frame);
  };

  /** Morph the visible line from shape[fromIdx] into shape[toIdx]. */
  SlideLineArt.prototype._morph = function (fromIdx, toIdx) {
    var self = this;
    var n = this.samples;

    // Sample the CURRENT rendered line (whatever it is) as the "from".
    this.path.style.strokeDasharray = 'none';
    this.path.style.strokeDashoffset = '0';
    var from = this._sample(this.path, n);

    // Sample the target `d` via the hidden probe.
    this._probe.setAttribute('d', this.shapes[toIdx].d);
    var to = this._align(from, this._sample(this._probe, n));

    if (this.pen) this.pen.style.opacity = '0';

    var startTime = null;
    var cur = new Array(n);
    function frame(now) {
      if (startTime === null) startTime = now;
      var t = Math.min(1, (now - startTime) / self.morphDuration);
      var e = self.easing(t);
      for (var i = 0; i < n; i++) {
        cur[i] = [
          from[i][0] + (to[i][0] - from[i][0]) * e,
          from[i][1] + (to[i][1] - from[i][1]) * e
        ];
      }
      self.path.setAttribute('d', ptsToPath(cur));
      if (t < 1) {
        self._raf = requestAnimationFrame(frame);
      } else {
        self._raf = null;
        // Snap to the crisp curved target so the resting shape is clean.
        self.path.setAttribute('d', self.shapes[toIdx].d);
      }
    }
    this.current = toIdx;
    this._raf = requestAnimationFrame(frame);
  };

  /** Wire to a SlideController: morph the line on every slide change. */
  SlideLineArt.prototype.attachTo = function (controller) {
    if (!controller || this._empty) return this;
    var self = this;
    var prev = controller.onSlideChange;
    controller.onSlideChange = function (index, total) {
      if (prev) prev(index, total);
      self.show(index);
    };
    this.show(controller.currentIndex || 0);
    return this;
  };

  window.SlideLineArt = SlideLineArt;
})();
