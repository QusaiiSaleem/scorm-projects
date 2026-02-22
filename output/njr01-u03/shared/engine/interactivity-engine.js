/**
 * SCORM Content Studio — Interactivity Engine
 * ==============================================
 * Unified entry point that initializes and connects all Smart Engine
 * subsystems. This is the main integration file — load this AFTER
 * all individual engine files.
 *
 * Equivalent to Storyline 360's Player runtime — a single init()
 * call reads a slide configuration and wires up states, triggers,
 * variables, branching, question banks, and audio.
 *
 * Load order (all scripts go in <head> or before </body>):
 *   1. variable-store.js
 *   2. state-engine.js
 *   3. trigger-engine.js
 *   4. branching-engine.js
 *   5. question-bank.js
 *   6. audio-player.js
 *   7. interactivity-engine.js  ← THIS FILE (last)
 *
 * Usage:
 *   <script src="shared/variable-store.js"></script>
 *   <script src="shared/state-engine.js"></script>
 *   <script src="shared/trigger-engine.js"></script>
 *   <script src="shared/branching-engine.js"></script>
 *   <script src="shared/question-bank.js"></script>
 *   <script src="shared/audio-player.js"></script>
 *   <script src="shared/interactivity-engine.js"></script>
 *   <script>
 *     const engine = new InteractivityEngine();
 *     engine.init({
 *       variables: { score: { type: 'number', default: 0 } },
 *       objects: { 'btn-1': { states: { selected: { classes: ['selected'] } } } },
 *       triggers: [
 *         { event: 'click', eventTarget: '#btn-1', action: 'setVariable',
 *           actionParams: { variable: 'score', value: 10 } }
 *       ]
 *     });
 *   </script>
 *
 * Config can also be loaded from an external JSON file:
 *   engine.initFromUrl('shared/slide-config.json');
 *
 * @version 1.0.0
 */

(function () {
  'use strict';

  /**
   * @class InteractivityEngine
   * @description Unified facade that initializes and coordinates all
   *              Smart Engine subsystems from a single config object.
   */
  class InteractivityEngine {
    constructor() {
      // Only create subsystems that are available (files may not all be loaded)
      this.variables  = typeof VariableStore  === 'function' ? new VariableStore()  : null;
      this.states     = typeof StateManager   === 'function' ? new StateManager()   : null;
      this.audio      = typeof AudioPlayer    === 'function' ? new AudioPlayer()    : null;
      this.branching  = typeof BranchingEngine === 'function' && this.variables
                        ? new BranchingEngine(this.variables) : null;
      this.questionBank = typeof QuestionBank === 'function' ? new QuestionBank()  : null;

      // TriggerEngine needs references to other systems
      this.triggers = typeof TriggerEngine === 'function'
        ? new TriggerEngine({
            states: this.states,
            variables: this.variables,
            layers: null,  // Will be set if LayerManager exists (Phase 3)
            audio: this.audio
          })
        : null;

      /**
       * Whether the engine has been initialized.
       * @type {boolean}
       */
      this._initialized = false;

      // Listen for navigation events from triggers/branching
      this._setupNavigationBridge();
    }

    // -------------------------------------------------------------------------
    // Initialization
    // -------------------------------------------------------------------------

    /**
     * Initialize the engine from a slide configuration object.
     * This is the primary entry point — call once per slide/SCO.
     *
     * @param {Object} config - Slide configuration
     * @param {Object} [config.variables] - Variable definitions
     * @param {Object} [config.objects] - Object state definitions
     * @param {Object} [config.layers] - Layer definitions (Phase 3)
     * @param {Array}  [config.triggers] - Trigger definitions
     * @param {Object} [config.branching] - Branching rules
     * @param {Object} [config.questionBanks] - Question pool definitions
     * @param {Object} [config.audio] - Audio narration config
     * @param {Object} [config.courseInfo] - Course structure info for built-in variables
     */
    init(config = {}) {
      // 1. Define variables (must be first — triggers depend on them)
      if (config.variables && this.variables) {
        this.variables.defineAll(config.variables);
      }

      // 2. Set up built-in system variables
      if (config.courseInfo && this.variables) {
        this.variables.initBuiltIns(config.courseInfo);
      }

      // 3. Register object states
      if (config.objects && this.states) {
        this.states.registerAll(config.objects);
      }

      // 4. Set up branching rules
      if (config.branching && this.branching) {
        this.branching.addRules(config.branching);
      }

      // 5. Set up question banks
      if (config.questionBanks && this.questionBank) {
        for (const [poolName, questions] of Object.entries(config.questionBanks)) {
          this.questionBank.addPool(poolName, questions);
        }
      }

      // 6. Load audio narration
      if (config.audio && this.audio) {
        if (config.audio.narration) {
          this.audio.loadNarration(config.audio.narration.src, {
            autoplay: config.audio.narration.autoplay || false,
            cuePoints: config.audio.narration.cuePoints || {}
          });
        }
        if (config.audio.backgroundMusic) {
          this.audio.loadBackgroundMusic(config.audio.backgroundMusic.src, {
            volume: config.audio.backgroundMusic.volume || 0.2,
            loop: config.audio.backgroundMusic.loop !== false,
            autoplay: config.audio.backgroundMusic.autoplay || false
          });
        }
      }

      // 7. Register triggers (LAST — they depend on everything else)
      if (config.triggers && this.triggers) {
        this.triggers.registerAll(config.triggers);
      }

      this._initialized = true;
    }

    /**
     * Initialize from an external JSON config file.
     * @param {string} url - Path to the JSON config file
     * @returns {Promise<void>}
     */
    async initFromUrl(url) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const config = await response.json();
        this.init(config);
      } catch (e) {
        console.error('[InteractivityEngine] Failed to load config:', e);
      }
    }

    // -------------------------------------------------------------------------
    // SCORM Integration
    // -------------------------------------------------------------------------

    /**
     * Save engine state to SCORM suspend_data.
     * Combines all subsystem states into a single JSON object.
     * @returns {string} JSON string for cmi.suspend_data
     */
    save() {
      const data = {};

      if (this.variables) data.vars = JSON.parse(this.variables.serialize());
      if (this.states)    data.states = this.states.serialize();
      if (this.branching) data.paths = this.branching.serialize();
      if (this.questionBank) data.qbank = this.questionBank.serialize();

      return JSON.stringify(data);
    }

    /**
     * Restore engine state from SCORM suspend_data.
     * @param {string} jsonString - JSON from cmi.suspend_data
     */
    restore(jsonString) {
      if (!jsonString) return;

      try {
        const data = JSON.parse(jsonString);

        if (data.vars && this.variables)       this.variables.deserialize(JSON.stringify(data.vars));
        if (data.states && this.states)        this.states.deserialize(data.states);
        if (data.paths && this.branching)      this.branching.deserialize(data.paths);
        if (data.qbank && this.questionBank)   this.questionBank.deserialize(data.qbank);

      } catch (e) {
        console.warn('[InteractivityEngine] Failed to restore state:', e.message);
      }
    }

    // -------------------------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------------------------

    /**
     * Destroy all subsystems and clean up event listeners.
     * Call this when navigating away from a slide.
     */
    destroy() {
      if (this.triggers) this.triggers.destroy();
      if (this.states)   this.states.destroy();
      if (this.audio)    this.audio.destroy();
      this._initialized = false;
    }

    // -------------------------------------------------------------------------
    // Internal: Navigation bridge
    // -------------------------------------------------------------------------

    /**
     * Listen for scorm:navigate events and bridge them to SlideController.
     * This connects trigger actions and branching decisions to actual navigation.
     * @private
     */
    _setupNavigationBridge() {
      document.addEventListener('scorm:navigate', (e) => {
        const { target } = e.detail || {};
        if (!target) return;

        // Try to find SlideController on the page
        const controller = window._slideController || null;

        if (target === 'next' && controller) {
          controller.next();
        } else if (target === 'prev' && controller) {
          controller.prev();
        } else if (controller && typeof controller.goTo === 'function') {
          // Target might be a slide index (number) or slide ID (string)
          const index = typeof target === 'number'
            ? target
            : this._resolveSlideIndex(target);

          if (index !== null) {
            controller.goTo(index);
          }
        }
      });
    }

    /**
     * Try to resolve a slide ID to a slide index.
     * Looks for data-slide-id attributes on .slide elements.
     * @private
     */
    _resolveSlideIndex(slideId) {
      const slides = document.querySelectorAll('.slide');
      for (let i = 0; i < slides.length; i++) {
        if (slides[i].getAttribute('data-slide-id') === slideId ||
            slides[i].id === slideId) {
          return i;
        }
      }
      // Try as a numeric index
      const num = parseInt(slideId, 10);
      return isNaN(num) ? null : num;
    }
  }

  // Expose globally
  window.InteractivityEngine = InteractivityEngine;

})();
