/* ==========================================================================
   SCORM Content Studio — Sound Effects Engine
   ============================================================================
   Web Audio API synthesized UI sounds — ZERO audio files needed.
   All sounds are generated from mathematical waveforms in real-time.

   Usage:
     const sounds = new SoundEffects();
     sounds.playSound('click');    // Short sine blip
     sounds.playSound('success');  // Ascending two-tone chime
     sounds.playSound('error');    // Descending low buzz
     sounds.playSound('celebration'); // Chord arpeggio
     sounds.playSound('whoosh');   // Noise sweep
     sounds.playSound('pop');      // Short resonant click

   The AudioContext is lazily initialized on first user gesture
   to comply with browser autoplay policies.
   ========================================================================== */

'use strict';

class SoundEffects {
  constructor() {
    /** @type {AudioContext|null} */
    this._ctx = null;
    /** @type {boolean} */
    this._muted = false;
    /** @type {number} 0-1 */
    this._volume = 0.5;
  }

  /* ------------------------------------------------------------------
     Lifecycle
     ------------------------------------------------------------------ */

  /**
   * Lazily create and resume the AudioContext.
   * Must be called from a user-gesture handler on first use.
   */
  _init() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
  }

  /* ------------------------------------------------------------------
     Public API
     ------------------------------------------------------------------ */

  /**
   * Play a named sound effect.
   * @param {'click'|'success'|'error'|'celebration'|'whoosh'|'pop'} name
   */
  playSound(name) {
    if (this._muted) return;
    if (typeof this[name] === 'function') {
      this[name]();
    }
  }

  /**
   * Set master volume (0 = silent, 1 = full).
   * @param {number} level
   */
  setVolume(level) {
    this._volume = Math.max(0, Math.min(1, level));
  }

  /**
   * Toggle mute state. Returns new muted boolean.
   * @returns {boolean}
   */
  toggleMute() {
    this._muted = !this._muted;
    return this._muted;
  }

  /** @returns {boolean} */
  get muted() { return this._muted; }

  /* ------------------------------------------------------------------
     Internal: helper to create an oscillator-gain pair with fade-out
     ------------------------------------------------------------------ */

  /** @private */
  _tone(frequency, duration, type, relativeVolume) {
    this._init();
    var now = this._ctx.currentTime;
    var vol = relativeVolume * this._volume;

    var osc = this._ctx.createOscillator();
    var gain = this._ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this._ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  /* ------------------------------------------------------------------
     Sound Definitions — subtle, soft, minimal
     ------------------------------------------------------------------ */

  /** Short sine blip — UI tap feedback */
  click() {
    this._tone(800, 0.06, 'sine', 0.15);
  }

  /** Ascending two-tone chime — correct / success */
  success() {
    this._init();
    var now = this._ctx.currentTime;
    var vol = 0.25 * this._volume;

    [523.25, 659.25].forEach(function (freq, i) {
      var osc = this._ctx.createOscillator();
      var gain = this._ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      var start = i * 0.15;
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(vol, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + 0.4);

      osc.connect(gain);
      gain.connect(this._ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + 0.4);
    }.bind(this));
  }

  /** Descending low buzz — incorrect / error */
  error() {
    this._init();
    var now = this._ctx.currentTime;
    var vol = 0.12 * this._volume;

    var osc = this._ctx.createOscillator();
    var gain = this._ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(150, now + 0.3);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this._ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  /** Ascending arpeggio chord — celebration / achievement */
  celebration() {
    this._init();
    var now = this._ctx.currentTime;
    var vol = 0.2 * this._volume;

    [523.25, 659.25, 783.99, 1046.50].forEach(function (freq, i) {
      var osc = this._ctx.createOscillator();
      var gain = this._ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      var start = i * 0.12;
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(vol, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + 0.6);

      osc.connect(gain);
      gain.connect(this._ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + 0.6);
    }.bind(this));
  }

  /** Frequency sweep — slide transition / navigation */
  whoosh() {
    this._init();
    var now = this._ctx.currentTime;
    var vol = 0.08 * this._volume;

    var osc = this._ctx.createOscillator();
    var gain = this._ctx.createGain();
    var filter = this._ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.15);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.Q.setValueAtTime(0.5, now);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this._ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  /** Short resonant click — button pop */
  pop() {
    this._init();
    var now = this._ctx.currentTime;
    var vol = 0.15 * this._volume;

    var osc = this._ctx.createOscillator();
    var gain = this._ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this._ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }
}

/* Export for SCORM iframe compatibility */
window.SoundEffects = SoundEffects;
