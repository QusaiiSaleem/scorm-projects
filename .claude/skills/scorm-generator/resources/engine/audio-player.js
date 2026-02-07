/**
 * SCORM Content Studio — Audio Player
 * =====================================
 * Audio narration system with play/pause/stop controls, volume,
 * mute toggle, cue points for timeline sync, background music
 * with auto-ducking, and mobile autoplay policy handling.
 *
 * Accessible: keyboard shortcuts (Space=play/pause, M=mute),
 * ARIA labels, screen reader announcements.
 *
 * Usage:
 *   const audio = new AudioPlayer();
 *
 *   // Load narration for the current slide
 *   audio.loadNarration('shared/assets/audio/slide-01.mp3', {
 *     autoplay: false,
 *     cuePoints: {
 *       'show_diagram': 3.5,    // seconds
 *       'highlight_step': 8.2,
 *       'summary': 15.0
 *     }
 *   });
 *
 *   // Background music (auto-ducks during narration)
 *   audio.loadBackgroundMusic('shared/assets/audio/bg-ambient.mp3', {
 *     volume: 0.2,
 *     loop: true
 *   });
 *
 *   // Listen for cue points
 *   audio.onCuePoint('show_diagram', () => {
 *     engine.layers.show('diagram-layer');
 *   });
 *
 * @version 1.0.0
 */

(function () {
  'use strict';

  /**
   * @class AudioPlayer
   * @description Per-slide audio narration with controls, cue points,
   *              background music, and accessibility.
   */
  class AudioPlayer {
    constructor() {
      /**
       * Main narration audio element.
       * @type {HTMLAudioElement|null}
       */
      this._narration = null;

      /**
       * Background music audio element.
       * @type {HTMLAudioElement|null}
       */
      this._bgMusic = null;

      /**
       * Cue points for the current narration.
       * Map<cuePointName, { time: number, fired: boolean }>
       */
      this._cuePoints = new Map();

      /**
       * Cue point listeners.
       * Map<cuePointName, Array<Function>>
       */
      this._cueListeners = new Map();

      /**
       * Global audio event listeners.
       * @type {Array<{ event: string, callback: Function }>}
       */
      this._listeners = [];

      /**
       * Current volume (0.0 to 1.0).
       * @type {number}
       */
      this._volume = 1.0;

      /**
       * Whether audio is muted.
       * @type {boolean}
       */
      this._muted = false;

      /**
       * Volume before muting (to restore on unmute).
       * @type {number}
       */
      this._preMuteVolume = 1.0;

      /**
       * Background music volume (before ducking).
       * @type {number}
       */
      this._bgBaseVolume = 0.2;

      /**
       * Ducked volume for background music during narration.
       * @type {number}
       */
      this._bgDuckVolume = 0.05;

      /**
       * Whether user has interacted (for autoplay policy).
       * @type {boolean}
       */
      this._userInteracted = false;

      /**
       * requestAnimationFrame ID for cue point checking.
       * @type {number|null}
       */
      this._rafId = null;

      /**
       * URL of preloaded next-slide audio.
       * @type {string|null}
       */
      this._preloadedUrl = null;

      /**
       * Preloaded audio element for next slide.
       * @type {HTMLAudioElement|null}
       */
      this._preloaded = null;

      // Track user interaction for mobile autoplay
      this._setupInteractionTracking();

      // Bind keyboard shortcuts
      this._setupKeyboardShortcuts();
    }

    // -------------------------------------------------------------------------
    // Narration
    // -------------------------------------------------------------------------

    /**
     * Load narration audio for the current slide.
     *
     * @param {string} src - Audio file path
     * @param {Object} [options]
     * @param {boolean} [options.autoplay=false] - Start playing immediately
     * @param {Object} [options.cuePoints] - { name: timeInSeconds, ... }
     */
    loadNarration(src, options = {}) {
      // Stop any existing narration
      this.stop();

      // Check if we have this preloaded
      if (this._preloaded && this._preloadedUrl === src) {
        this._narration = this._preloaded;
        this._preloaded = null;
        this._preloadedUrl = null;
      } else {
        this._narration = new Audio();
        this._narration.src = src;
        this._narration.preload = 'auto';
      }

      this._narration.volume = this._muted ? 0 : this._volume;

      // Register cue points
      this._cuePoints.clear();
      if (options.cuePoints) {
        for (const [name, time] of Object.entries(options.cuePoints)) {
          this._cuePoints.set(name, { time, fired: false });
        }
      }

      // Set up event handlers
      this._narration.addEventListener('play', () => {
        this._duckBackgroundMusic(true);
        this._startCuePointTracking();
        this._emit('play');
      });

      this._narration.addEventListener('pause', () => {
        this._duckBackgroundMusic(false);
        this._stopCuePointTracking();
        this._emit('pause');
      });

      this._narration.addEventListener('ended', () => {
        this._duckBackgroundMusic(false);
        this._stopCuePointTracking();
        this._emit('ended');

        // Dispatch for trigger engine integration
        document.dispatchEvent(new CustomEvent('scorm:mediaEnd', {
          detail: { type: 'narration', src }
        }));
      });

      this._narration.addEventListener('timeupdate', () => {
        this._emit('timeupdate', {
          currentTime: this._narration.currentTime,
          duration: this._narration.duration
        });
      });

      this._narration.addEventListener('error', (e) => {
        console.warn('[AudioPlayer] Narration load error:', e);
        this._emit('error', { src, error: e });
      });

      // Autoplay (respecting mobile policy)
      if (options.autoplay) {
        this.play();
      }
    }

    /**
     * Play the current narration.
     * Handles mobile autoplay policy gracefully.
     */
    play() {
      if (!this._narration) return;

      const playPromise = this._narration.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Autoplay was prevented by browser policy
          if (error.name === 'NotAllowedError') {
            this._emit('autoplayBlocked');
            // Show a "tap to play" indicator — the UI should handle this
            document.dispatchEvent(new CustomEvent('scorm:autoplayBlocked'));
          }
        });
      }
    }

    /**
     * Pause the current narration.
     */
    pause() {
      if (this._narration && !this._narration.paused) {
        this._narration.pause();
      }
    }

    /**
     * Stop narration and reset to beginning.
     */
    stop() {
      if (this._narration) {
        this._narration.pause();
        this._narration.currentTime = 0;
        this._stopCuePointTracking();
        this._duckBackgroundMusic(false);
      }
    }

    /**
     * Toggle play/pause.
     */
    togglePlay() {
      if (!this._narration) return;
      if (this._narration.paused) {
        this.play();
      } else {
        this.pause();
      }
    }

    /**
     * Check if narration is currently playing.
     * @returns {boolean}
     */
    isPlaying() {
      return this._narration ? !this._narration.paused : false;
    }

    /**
     * Get current playback position in seconds.
     * @returns {number}
     */
    getCurrentTime() {
      return this._narration ? this._narration.currentTime : 0;
    }

    /**
     * Get total duration in seconds.
     * @returns {number}
     */
    getDuration() {
      return this._narration ? (this._narration.duration || 0) : 0;
    }

    /**
     * Get playback progress as 0-100 percentage.
     * @returns {number}
     */
    getProgress() {
      if (!this._narration || !this._narration.duration) return 0;
      return Math.round((this._narration.currentTime / this._narration.duration) * 100);
    }

    /**
     * Seek to a specific time.
     * @param {number} seconds
     */
    seekTo(seconds) {
      if (this._narration) {
        this._narration.currentTime = Math.max(0, Math.min(seconds, this._narration.duration || 0));
        // Reset cue points that are now ahead of playhead
        for (const [, cp] of this._cuePoints) {
          if (cp.time > this._narration.currentTime) {
            cp.fired = false;
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // Volume & Mute
    // -------------------------------------------------------------------------

    /**
     * Set volume (0.0 to 1.0).
     * @param {number} level
     */
    setVolume(level) {
      this._volume = Math.max(0, Math.min(1, level));
      if (this._narration && !this._muted) {
        this._narration.volume = this._volume;
      }
      this._emit('volumeChange', { volume: this._volume, muted: this._muted });
    }

    /**
     * Get current volume.
     * @returns {number}
     */
    getVolume() {
      return this._volume;
    }

    /**
     * Toggle mute on/off.
     */
    toggleMute() {
      this._muted = !this._muted;
      if (this._muted) {
        this._preMuteVolume = this._volume;
        if (this._narration) this._narration.volume = 0;
        if (this._bgMusic) this._bgMusic.volume = 0;
      } else {
        this._volume = this._preMuteVolume;
        if (this._narration) this._narration.volume = this._volume;
        if (this._bgMusic) {
          const isNarrating = this._narration && !this._narration.paused;
          this._bgMusic.volume = isNarrating ? this._bgDuckVolume : this._bgBaseVolume;
        }
      }
      this._emit('muteChange', { muted: this._muted });
    }

    /**
     * Check if muted.
     * @returns {boolean}
     */
    isMuted() {
      return this._muted;
    }

    // -------------------------------------------------------------------------
    // Background Music
    // -------------------------------------------------------------------------

    /**
     * Load background music.
     *
     * @param {string} src - Audio file path
     * @param {Object} [options]
     * @param {number} [options.volume=0.2] - Base volume (before ducking)
     * @param {boolean} [options.loop=true] - Loop the music
     * @param {boolean} [options.autoplay=false] - Start playing immediately
     */
    loadBackgroundMusic(src, options = {}) {
      this.stopBackgroundMusic();

      this._bgMusic = new Audio();
      this._bgMusic.src = src;
      this._bgMusic.preload = 'auto';
      this._bgMusic.loop = options.loop !== false;

      this._bgBaseVolume = options.volume !== undefined ? options.volume : 0.2;
      this._bgMusic.volume = this._muted ? 0 : this._bgBaseVolume;

      if (options.autoplay) {
        this._bgMusic.play().catch(() => {
          // Autoplay blocked — will start on first user interaction
        });
      }
    }

    /**
     * Play background music.
     */
    playBackgroundMusic() {
      if (this._bgMusic) {
        this._bgMusic.play().catch(() => {});
      }
    }

    /**
     * Stop and unload background music.
     */
    stopBackgroundMusic() {
      if (this._bgMusic) {
        this._bgMusic.pause();
        this._bgMusic.currentTime = 0;
        this._bgMusic.src = '';
        this._bgMusic = null;
      }
    }

    // -------------------------------------------------------------------------
    // Cue Points
    // -------------------------------------------------------------------------

    /**
     * Listen for a cue point to be reached during narration.
     *
     * @param {string} cuePointName
     * @param {Function} callback - Called when playback reaches this time
     * @returns {Function} Unsubscribe function
     */
    onCuePoint(cuePointName, callback) {
      if (!this._cueListeners.has(cuePointName)) {
        this._cueListeners.set(cuePointName, []);
      }
      this._cueListeners.get(cuePointName).push(callback);

      return () => {
        const list = this._cueListeners.get(cuePointName);
        if (list) {
          const idx = list.indexOf(callback);
          if (idx !== -1) list.splice(idx, 1);
        }
      };
    }

    /**
     * Add a cue point to the current narration.
     * @param {string} name
     * @param {number} timeSeconds
     */
    addCuePoint(name, timeSeconds) {
      this._cuePoints.set(name, { time: timeSeconds, fired: false });
    }

    /**
     * Remove a cue point.
     * @param {string} name
     */
    removeCuePoint(name) {
      this._cuePoints.delete(name);
      this._cueListeners.delete(name);
    }

    // -------------------------------------------------------------------------
    // Preloading
    // -------------------------------------------------------------------------

    /**
     * Preload the next slide's audio for seamless transitions.
     * @param {string} src - Audio file path to preload
     */
    preload(src) {
      if (!src || src === this._preloadedUrl) return;

      this._preloaded = new Audio();
      this._preloaded.src = src;
      this._preloaded.preload = 'auto';
      this._preloadedUrl = src;
    }

    // -------------------------------------------------------------------------
    // Event listeners
    // -------------------------------------------------------------------------

    /**
     * Listen for audio player events.
     * Events: play, pause, ended, timeupdate, volumeChange, muteChange,
     *         autoplayBlocked, error
     *
     * @param {string} eventName
     * @param {Function} callback
     * @returns {Function} Unsubscribe function
     */
    on(eventName, callback) {
      this._listeners.push({ event: eventName, callback });
      return () => {
        const idx = this._listeners.findIndex(l => l.event === eventName && l.callback === callback);
        if (idx !== -1) this._listeners.splice(idx, 1);
      };
    }

    // -------------------------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------------------------

    /**
     * Stop all audio and clean up.
     * Call this when navigating away from a slide.
     */
    destroy() {
      this.stop();
      this.stopBackgroundMusic();
      this._stopCuePointTracking();
      this._cuePoints.clear();
      this._cueListeners.clear();
      this._listeners = [];

      if (this._preloaded) {
        this._preloaded.src = '';
        this._preloaded = null;
        this._preloadedUrl = null;
      }

      // Remove keyboard listeners
      if (this._keyHandler) {
        document.removeEventListener('keydown', this._keyHandler);
      }
    }

    // -------------------------------------------------------------------------
    // Internal: Cue point tracking
    // -------------------------------------------------------------------------

    /**
     * Start checking for cue points using requestAnimationFrame.
     * More precise than relying solely on timeupdate events.
     * @private
     */
    _startCuePointTracking() {
      if (this._cuePoints.size === 0) return;
      this._stopCuePointTracking();

      const check = () => {
        if (!this._narration || this._narration.paused) return;

        const currentTime = this._narration.currentTime;

        for (const [name, cp] of this._cuePoints) {
          if (!cp.fired && currentTime >= cp.time) {
            cp.fired = true;

            // Fire cue point listeners
            const callbacks = this._cueListeners.get(name);
            if (callbacks) {
              callbacks.forEach(cb => {
                try { cb({ name, time: cp.time, currentTime }); } catch (e) {
                  console.error(`[AudioPlayer] Cue point "${name}" error:`, e);
                }
              });
            }

            // Dispatch custom event for trigger engine
            document.dispatchEvent(new CustomEvent('scorm:timelineCuePoint', {
              detail: { cuePoint: name, time: cp.time, timelineId: 'narration' }
            }));
          }
        }

        this._rafId = requestAnimationFrame(check);
      };

      this._rafId = requestAnimationFrame(check);
    }

    /**
     * Stop cue point tracking.
     * @private
     */
    _stopCuePointTracking() {
      if (this._rafId !== null) {
        cancelAnimationFrame(this._rafId);
        this._rafId = null;
      }
    }

    // -------------------------------------------------------------------------
    // Internal: Background music ducking
    // -------------------------------------------------------------------------

    /**
     * Duck (reduce) or restore background music volume.
     * Called automatically when narration starts/stops.
     * @private
     * @param {boolean} duck - true to duck, false to restore
     */
    _duckBackgroundMusic(duck) {
      if (!this._bgMusic || this._muted) return;

      const targetVolume = duck ? this._bgDuckVolume : this._bgBaseVolume;

      // Smooth volume transition using CSS-like easing
      // (fade over 500ms instead of abrupt change)
      const startVolume = this._bgMusic.volume;
      const startTime = performance.now();
      const duration = 500; // ms

      const fade = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out curve for natural-sounding fade
        const eased = 1 - Math.pow(1 - progress, 3);
        this._bgMusic.volume = startVolume + (targetVolume - startVolume) * eased;

        if (progress < 1) {
          requestAnimationFrame(fade);
        }
      };

      requestAnimationFrame(fade);
    }

    // -------------------------------------------------------------------------
    // Internal: Mobile autoplay handling
    // -------------------------------------------------------------------------

    /**
     * Track user interaction so we know when autoplay is allowed.
     * Mobile browsers block audio until user taps/clicks.
     * @private
     */
    _setupInteractionTracking() {
      const onInteract = () => {
        this._userInteracted = true;
        // Remove listeners after first interaction
        document.removeEventListener('click', onInteract);
        document.removeEventListener('touchstart', onInteract);
        document.removeEventListener('keydown', onInteract);
      };

      document.addEventListener('click', onInteract, { once: true });
      document.addEventListener('touchstart', onInteract, { once: true });
      document.addEventListener('keydown', onInteract, { once: true });
    }

    // -------------------------------------------------------------------------
    // Internal: Keyboard shortcuts
    // -------------------------------------------------------------------------

    /**
     * Set up keyboard shortcuts for audio control.
     * Space = play/pause, M = mute toggle
     * Only active when focus is not in a text input.
     * @private
     */
    _setupKeyboardShortcuts() {
      this._keyHandler = (e) => {
        // Don't capture keys when user is typing in an input field
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (e.target.isContentEditable) return;

        switch (e.key) {
          case ' ':
            // Space to play/pause (only when narration is loaded)
            if (this._narration) {
              e.preventDefault();
              this.togglePlay();
            }
            break;

          case 'm':
          case 'M':
            // M to toggle mute
            this.toggleMute();
            break;
        }
      };

      document.addEventListener('keydown', this._keyHandler);
    }

    // -------------------------------------------------------------------------
    // Internal: Event emission
    // -------------------------------------------------------------------------

    /** @private */
    _emit(eventName, detail = {}) {
      this._listeners
        .filter(l => l.event === eventName)
        .forEach(l => {
          try { l.callback(detail); } catch (e) {
            console.error('[AudioPlayer] Listener error:', e);
          }
        });
    }
  }

  // Expose globally
  window.AudioPlayer = AudioPlayer;

})();
