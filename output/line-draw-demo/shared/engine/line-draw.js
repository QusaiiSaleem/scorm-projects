/**
 * SCORM Content Studio — Line Draw Background
 * ===========================================
 * A single continuous "one-line" drawing that lives BEHIND the slide content
 * as an ambient background element (not a foreground image). The whole line is
 * ONE illustration; each slide reveals (draws) the NEXT segment of it, so the
 * drawing grows as the learner advances — and retracts if they go back.
 *
 * Inspired by one-line ("continuous line") illustration art: the pen never
 * lifts. Technically this uses the classic SVG stroke-dash reveal, but driven
 * by requestAnimationFrame so we can also ride a "pen" dot along the tip while
 * it draws and keep the drawing SPEED constant across every slide.
 *
 * WHY A BACKGROUND, NOT AN <img>:
 *   - Uses `currentColor` / theme tokens so it recolors with the course theme.
 *   - pointer-events:none so it never blocks clicks on real content.
 *   - Low opacity + z-index:0 so it reads as texture, not subject.
 *
 * ---------------------------------------------------------------------------
 * USAGE (with SlideController — the common case):
 *
 *   const line = new LineDrawBackground({
 *     paths: '#bg-line path',   // one continuous path (or several, chained)
 *     segments: 5,              // usually === number of slides
 *     pen: '#bg-line .pen',     // optional dot that rides the drawing tip
 *     duration: 900             // ms to draw ONE segment
 *   });
 *
 *   const controller = new SlideController({
 *     onSlideChange: function (index) { line.drawTo(index); }
 *   });
 *   // Or the shortcut: line.attachTo(controller)  (see attachTo below)
 *
 * USAGE (standalone, no controller):
 *   line.drawTo(2);            // reveal segments 0..2, animating the new part
 *   line.drawTo(2, false);     // jump there with no animation
 *
 * ---------------------------------------------------------------------------
 * EXPECTED SVG (see components/line-draw-background.html for full presets):
 *
 *   <svg id="bg-line" class="line-draw-bg" viewBox="0 0 1280 720"
 *        preserveAspectRatio="xMidYMid slice" aria-hidden="true">
 *     <path d="M ... one long continuous path ..." />
 *     <circle class="pen" r="6" />   <!-- optional -->
 *   </svg>
 *
 * The path(s) get their stroke/fill from CSS. This module only touches
 * stroke-dasharray / stroke-dashoffset and the pen position.
 */

(function () {
  'use strict';

  var prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resolvePaths(paths) {
    if (!paths) return [];
    if (typeof paths === 'string') {
      return Array.prototype.slice.call(document.querySelectorAll(paths));
    }
    if (paths.nodeType) return [paths];               // single element
    return Array.prototype.slice.call(paths);         // NodeList / array
  }

  function resolveOne(sel) {
    if (!sel) return null;
    if (typeof sel === 'string') return document.querySelector(sel);
    return sel.nodeType ? sel : null;
  }

  function easeInOut(t) {
    // Smooth acceleration/deceleration so each segment feels hand-drawn.
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function LineDrawBackground(options) {
    options = options || {};

    this.paths = resolvePaths(options.paths);
    if (!this.paths.length) {
      // Nothing to draw — fail quietly so a missing background never breaks a SCO.
      this._empty = true;
      return;
    }

    this.pen = resolveOne(options.pen);
    this.segments = Math.max(1, options.segments || this.paths.length);
    this.duration = options.duration != null ? options.duration : 900;
    this.easing = typeof options.easing === 'function' ? options.easing : easeInOut;
    this.retractOnBack = options.retractOnBack !== false; // default true
    this.onDrawStart = options.onDrawStart || null;
    this.onDrawEnd = options.onDrawEnd || null;

    // Cross-page continuity: a SCORM course is often split into SEPARATE SCO
    // pages. Within one page the line is naturally continuous (same DOM), but
    // a page reload would reset it. If you give the WHOLE course one virtual
    // line and pass a shared `persistKey` + `offset`, each SCO page resumes the
    // drawing exactly where the previous page left off — so it reads as ONE
    // uninterrupted line across the entire course, never a fresh cut per page.
    //   persistKey: a string shared by every SCO of the course
    //   offset:     how many segments earlier SCOs already consumed
    this.persistKey = options.persistKey || null;
    this.offset = options.offset || 0;

    // Measure each path once. Total length is treated as ONE virtual line so
    // multiple paths (e.g. a shape + a detail) draw as a single continuous pen.
    this.lengths = this.paths.map(function (p) { return p.getTotalLength(); });
    this.totalLength = this.lengths.reduce(function (a, b) { return a + b; }, 0);

    // Constant pen speed: every segment takes `duration` ms regardless of how
    // much line it contains, so pacing feels even slide to slide.
    this.speed = this.totalLength / (this.segments * Math.max(1, this.duration));

    // Prime the dash reveal: hide the whole line initially.
    var self = this;
    this.paths.forEach(function (p, i) {
      p.style.strokeDasharray = self.lengths[i] + ' ' + self.lengths[i];
      p.style.strokeDashoffset = self.lengths[i];
      // We drive animation via rAF, so kill any CSS transition on the offset.
      p.style.transition = 'none';
    });

    this.currentLength = 0;    // how much of the virtual line is shown right now
    this.currentIndex = -1;    // last LOCAL segment index requested
    this._raf = null;

    // Resume point for cross-page continuity: the furthest GLOBAL segment any
    // SCO of this course has reached. Defaults to "everything before this SCO
    // is already drawn" so the line never restarts at the top of a new page.
    var resumeGlobal = this.offset - 1;
    var stored = this._readPersisted();
    if (stored !== null && stored > resumeGlobal) resumeGlobal = stored;

    if (resumeGlobal >= 0) {
      // Instantly show everything drawn so far (no re-animating past segments).
      this._applyLength(this._lengthForGlobal(resumeGlobal));
      if (this.pen) this.pen.style.opacity = '0';
    } else if (options.startAtInitial !== false) {
      // Very first SCO, very first slide: draw the opening segment in.
      this.drawTo(0);
      return;
    } else {
      this._applyLength(0);
    }
  }

  /** localStorage helpers for the shared course-wide line (opt-in). */
  LineDrawBackground.prototype._readPersisted = function () {
    if (!this.persistKey) return null;
    try {
      var v = window.localStorage.getItem(this.persistKey);
      return v === null ? null : parseInt(v, 10);
    } catch (e) { return null; }
  };
  LineDrawBackground.prototype._persist = function (globalIndex) {
    if (!this.persistKey) return;
    try {
      var prev = this._readPersisted();
      if (prev === null || globalIndex > prev) {
        window.localStorage.setItem(this.persistKey, String(globalIndex));
      }
    } catch (e) { /* storage unavailable — continuity is best-effort */ }
  };

  /** Length of the virtual line visible at a given GLOBAL segment index. */
  LineDrawBackground.prototype._lengthForGlobal = function (globalIndex) {
    var clamped = Math.max(0, Math.min(this.segments - 1, globalIndex));
    return this.totalLength * ((clamped + 1) / this.segments);
  };

  /**
   * Paint the line so exactly `len` (of totalLength) is visible, and move the
   * pen to the tip. Walks the chained paths cumulatively.
   */
  LineDrawBackground.prototype._applyLength = function (len) {
    var remaining = len;
    var tipPath = this.paths[0];
    var tipLocal = 0;

    for (var i = 0; i < this.paths.length; i++) {
      var pathLen = this.lengths[i];
      var shown = Math.max(0, Math.min(pathLen, remaining));
      // dashoffset = hidden portion. offset 0 => fully drawn.
      this.paths[i].style.strokeDashoffset = (pathLen - shown);
      if (remaining > 0) {
        tipPath = this.paths[i];
        tipLocal = shown;
      }
      remaining -= pathLen;
    }

    if (this.pen) {
      if (len <= 0) {
        this.pen.style.opacity = '0';
      } else {
        var pt = tipPath.getPointAtLength(tipLocal);
        this.pen.setAttribute('cx', pt.x);
        this.pen.setAttribute('cy', pt.y);
        this.pen.style.opacity = '1';
      }
    }

    this.currentLength = len;
  };

  /**
   * Reveal the line up through slide `index`.
   * @param {number} index   LOCAL slide index (0-based) within this SCO.
   *                         It is mapped to a global segment via `offset`.
   * @param {boolean} animate Default true. false => jump with no animation.
   */
  LineDrawBackground.prototype.drawTo = function (index, animate) {
    if (this._empty) return;
    if (animate === undefined) animate = true;

    var globalIndex = this.offset + index;
    var target = this._lengthForGlobal(globalIndex);
    var goingBack = target < this.currentLength;

    // Remember how far the course line has reached (never lose ground).
    this._persist(globalIndex);

    // If we're moving backward and retraction is off, keep the drawing as-is.
    if (goingBack && !this.retractOnBack) {
      this.currentIndex = index;
      return;
    }

    this.currentIndex = index;

    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }

    if (!animate || prefersReduced) {
      this._applyLength(target);
      if (this.pen) this.pen.style.opacity = '0'; // no "drawing" state when static
      if (this.onDrawEnd) this.onDrawEnd(index);
      return;
    }

    var self = this;
    var startLen = this.currentLength;
    var distance = target - startLen;
    // Duration scales with how far we travel so speed stays constant.
    var dur = Math.max(120, Math.abs(distance) / this.speed);
    var startTime = null;

    if (this.onDrawStart) this.onDrawStart(index);

    function frame(now) {
      if (startTime === null) startTime = now;
      var t = Math.min(1, (now - startTime) / dur);
      var eased = self.easing(t);
      self._applyLength(startLen + distance * eased);

      if (t < 1) {
        self._raf = requestAnimationFrame(frame);
      } else {
        self._raf = null;
        if (self.pen) self.pen.style.opacity = '0'; // pen rests when done
        if (self.onDrawEnd) self.onDrawEnd(index);
      }
    }

    this._raf = requestAnimationFrame(frame);
  };

  /**
   * Convenience: wire this drawing to a SlideController so it advances/retracts
   * automatically. Preserves any onSlideChange you already passed to the
   * controller (calls it first, then draws).
   */
  LineDrawBackground.prototype.attachTo = function (controller) {
    if (!controller) return this;
    var self = this;
    var prev = controller.onSlideChange;
    controller.onSlideChange = function (index, total) {
      if (prev) prev(index, total);
      self.drawTo(index);
    };
    // Sync to wherever the controller currently sits.
    this.drawTo(controller.currentIndex || 0, false);
    return this;
  };

  /** Re-measure paths after a resize/layout change (viewBox scaling is free,
   *  but call this if you swap the path `d` at runtime). */
  LineDrawBackground.prototype.remeasure = function () {
    if (this._empty) return;
    var self = this;
    this.lengths = this.paths.map(function (p) { return p.getTotalLength(); });
    this.totalLength = this.lengths.reduce(function (a, b) { return a + b; }, 0);
    this.speed = this.totalLength / (this.segments * Math.max(1, this.duration));
    this.paths.forEach(function (p, i) {
      p.style.strokeDasharray = self.lengths[i] + ' ' + self.lengths[i];
    });
    var idx = this.currentIndex < 0 ? 0 : this.currentIndex;
    this._applyLength(this._lengthForGlobal(this.offset + idx));
  };

  window.LineDrawBackground = LineDrawBackground;
})();
