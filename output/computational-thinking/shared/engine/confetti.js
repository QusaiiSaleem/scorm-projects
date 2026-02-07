/* ==========================================================================
   SCORM Content Studio — Confetti Particle System
   ============================================================================
   Canvas-based confetti burst for celebrations.
   Self-contained — no external libraries or images needed.

   Usage:
     const confetti = new Confetti();
     confetti.fire();           // Burst from center-top
     confetti.fire(x, y, 100); // Custom origin and particle count

   Respects prefers-reduced-motion: shows a static "Congratulations"
   message instead of animating particles.
   ========================================================================== */

'use strict';

class Confetti {
  constructor() {
    /** @type {HTMLCanvasElement|null} */
    this._canvas = null;
    /** @type {CanvasRenderingContext2D|null} */
    this._ctx = null;
    /** @type {Array} */
    this._particles = [];
    /** @type {boolean} */
    this._running = false;
    /** @type {number|null} */
    this._cleanupTimer = null;
  }

  /* ------------------------------------------------------------------
     Public API
     ------------------------------------------------------------------ */

  /**
   * Fire a confetti burst.
   * @param {number} [x] - Origin X (defaults to center)
   * @param {number} [y] - Origin Y (defaults to 30% from top)
   * @param {number} [count=80] - Number of particles (max 100)
   */
  fire(x, y, count) {
    /* Respect reduced motion preference */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this._showStaticMessage();
      return;
    }

    this._ensureCanvas();
    count = Math.min(count || 80, 100);
    var cx = x != null ? x : this._canvas.width * 0.5;
    var cy = y != null ? y : this._canvas.height * 0.3;

    var colors = this._getColors();

    for (var i = 0; i < count; i++) {
      this._particles.push({
        x: cx,
        y: cy,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14 - 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        w: 6 + Math.random() * 6,
        h: 3 + Math.random() * 4,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.18,
        drag: 0.98,
        opacity: 1,
        fade: 0.006 + Math.random() * 0.008
      });
    }

    if (!this._running) {
      this._running = true;
      this._animate();
    }
  }

  /* ------------------------------------------------------------------
     Internals
     ------------------------------------------------------------------ */

  /** @private Create or reuse a fullscreen overlay canvas. */
  _ensureCanvas() {
    if (this._canvas) return;
    this._canvas = document.createElement('canvas');
    this._canvas.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    document.body.appendChild(this._canvas);
    this._ctx = this._canvas.getContext('2d');
    this._resize();
    this._resizeHandler = this._resize.bind(this);
    window.addEventListener('resize', this._resizeHandler);
  }

  /** @private */
  _resize() {
    if (!this._canvas) return;
    this._canvas.width = window.innerWidth;
    this._canvas.height = window.innerHeight;
  }

  /** @private Resolve theme colors or use a vibrant fallback palette. */
  _getColors() {
    var root = getComputedStyle(document.documentElement);
    var primary = root.getPropertyValue('--color-primary').trim();
    var secondary = root.getPropertyValue('--color-secondary').trim();
    var accent = root.getPropertyValue('--color-accent').trim();

    if (primary && secondary && accent) {
      return [primary, secondary, accent, '#F7DC6F', '#82E0AA', '#F8C471'];
    }
    return ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#F7DC6F', '#BB8FCE'];
  }

  /** @private Animation loop. */
  _animate() {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

    for (var i = this._particles.length - 1; i >= 0; i--) {
      var p = this._particles[i];

      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.opacity -= p.fade;

      if (p.opacity <= 0) {
        this._particles.splice(i, 1);
        continue;
      }

      this._ctx.save();
      this._ctx.translate(p.x, p.y);
      this._ctx.rotate((p.rotation * Math.PI) / 180);
      this._ctx.globalAlpha = p.opacity;
      this._ctx.fillStyle = p.color;
      this._ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      this._ctx.restore();
    }

    if (this._particles.length > 0) {
      requestAnimationFrame(this._animate.bind(this));
    } else {
      this._cleanup();
    }
  }

  /** @private Remove canvas after animation completes. */
  _cleanup() {
    this._running = false;
    if (this._canvas && this._canvas.parentNode) {
      window.removeEventListener('resize', this._resizeHandler);
      this._canvas.parentNode.removeChild(this._canvas);
      this._canvas = null;
      this._ctx = null;
    }
  }

  /** @private Reduced-motion fallback: brief text overlay. */
  _showStaticMessage() {
    var el = document.createElement('div');
    el.textContent = 'Congratulations!';
    el.setAttribute('role', 'status');
    el.style.cssText =
      'position:fixed;top:20%;left:50%;transform:translateX(-50%);' +
      'font-size:2rem;font-weight:700;color:var(--color-primary,#6C5CE7);' +
      'z-index:9999;pointer-events:none;text-align:center;';
    document.body.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 3000);
  }
}

/* Export for SCORM iframe compatibility */
window.Confetti = Confetti;
