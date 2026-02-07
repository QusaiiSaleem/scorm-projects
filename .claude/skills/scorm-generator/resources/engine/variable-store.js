/**
 * SCORM Content Studio — Variable Store
 * =======================================
 * Reactive variable system with type enforcement, change listeners,
 * DOM text replacement, and SCORM suspend_data serialization.
 *
 * Equivalent to Storyline 360's Variables system — three types
 * (boolean, number, text), project-wide scope, built-in system
 * variables, and %variableName% references in content.
 *
 * Usage:
 *   const vars = new VariableStore();
 *   vars.define('score', 'number', 0);
 *   vars.define('name', 'text', 'Learner');
 *   vars.set('score', 85);
 *   vars.adjust('score', 10); // now 95
 *   vars.onChange('score', (detail) => console.log(detail.newValue));
 *
 * DOM references:
 *   <span data-var="score">0</span>
 *   <span data-var-template="Your score: %score% / %total%">...</span>
 *
 * @version 1.0.0
 */

(function () {
  'use strict';

  /**
   * @class VariableStore
   * @description Manages typed variables with reactive change notifications
   *              and automatic DOM text replacement.
   */
  class VariableStore {
    constructor() {
      /**
       * User-defined variables.
       * Map<string, { type: string, value: *, defaultValue: *, scope: string }>
       */
      this._variables = new Map();

      /**
       * Read-only built-in system variables (e.g. Project.SlideCount).
       * These cannot be set by user triggers — only updated internally.
       * @type {Object<string, *>}
       */
      this._builtIn = {};

      /**
       * Change listeners per variable name.
       * Map<string, Array<Function>>
       */
      this._listeners = new Map();

      /**
       * Wildcard listeners that fire on ANY variable change.
       * @type {Array<Function>}
       */
      this._globalListeners = [];
    }

    // -------------------------------------------------------------------------
    // Define & configure
    // -------------------------------------------------------------------------

    /**
     * Define a new user variable.
     * @param {string} name - Variable name (no spaces, camelCase recommended)
     * @param {'boolean'|'number'|'text'} type - Variable type
     * @param {*} [defaultValue] - Initial value (auto-derived from type if omitted)
     * @param {Object} [options]
     * @param {'project'|'slide'} [options.scope='project'] - Persistence scope
     */
    define(name, type, defaultValue, options = {}) {
      const typeDefaults = { boolean: false, number: 0, text: '' };

      if (!typeDefaults.hasOwnProperty(type)) {
        console.warn(`[VariableStore] Unknown type "${type}" for "${name}". Use boolean, number, or text.`);
        return;
      }

      const resolvedDefault = defaultValue !== undefined ? defaultValue : typeDefaults[type];

      this._variables.set(name, {
        type,
        value: this._coerce(type, resolvedDefault),
        defaultValue: this._coerce(type, resolvedDefault),
        scope: options.scope || 'project'
      });

      // Push initial value into the DOM so references render on load
      this._updateDOMReferences(name, this._variables.get(name).value);
    }

    /**
     * Define multiple variables at once from a config object.
     * Convenient for slide config initialization.
     *
     * @param {Object} defs - { varName: { type, default, scope? }, ... }
     *
     * @example
     *   vars.defineAll({
     *     score:    { type: 'number',  default: 0 },
     *     passed:   { type: 'boolean', default: false },
     *     feedback: { type: 'text',    default: '' }
     *   });
     */
    defineAll(defs) {
      for (const [name, cfg] of Object.entries(defs)) {
        this.define(name, cfg.type, cfg.default, { scope: cfg.scope });
      }
    }

    // -------------------------------------------------------------------------
    // Read
    // -------------------------------------------------------------------------

    /**
     * Get a variable's current value.
     * Checks user variables first, then built-in system variables.
     * @param {string} name
     * @returns {*} The value, or undefined if not found
     */
    get(name) {
      const userVar = this._variables.get(name);
      if (userVar) return userVar.value;
      if (this._builtIn.hasOwnProperty(name)) return this._builtIn[name];
      return undefined;
    }

    /**
     * Check if a variable exists (user or built-in).
     * @param {string} name
     * @returns {boolean}
     */
    has(name) {
      return this._variables.has(name) || this._builtIn.hasOwnProperty(name);
    }

    /**
     * Get the type of a user variable.
     * @param {string} name
     * @returns {'boolean'|'number'|'text'|null}
     */
    getType(name) {
      const v = this._variables.get(name);
      return v ? v.type : null;
    }

    // -------------------------------------------------------------------------
    // Write
    // -------------------------------------------------------------------------

    /**
     * Set a variable's value. Fires change listeners if value actually changed.
     * @param {string} name
     * @param {*} value
     */
    set(name, value) {
      const variable = this._variables.get(name);
      if (!variable) {
        console.warn(`[VariableStore] Variable "${name}" not defined. Call define() first.`);
        return;
      }

      const oldValue = variable.value;
      variable.value = this._coerce(variable.type, value);

      // Only notify if the value actually changed
      if (oldValue !== variable.value) {
        this._notify(name, variable.value, oldValue);
        this._updateDOMReferences(name, variable.value);
        this._dispatchEvent(name, variable.value, oldValue);
      }
    }

    /**
     * Add a numeric amount to a number variable.
     * For text variables, concatenates the string.
     * @param {string} name
     * @param {number|string} amount
     */
    adjust(name, amount) {
      const variable = this._variables.get(name);
      if (!variable) return;

      if (variable.type === 'number') {
        this.set(name, variable.value + Number(amount));
      } else if (variable.type === 'text') {
        this.set(name, variable.value + String(amount));
      } else if (variable.type === 'boolean') {
        // Toggle for booleans when "adjusted"
        this.set(name, !variable.value);
      }
    }

    /**
     * Toggle a boolean variable.
     * @param {string} name
     */
    toggle(name) {
      const variable = this._variables.get(name);
      if (!variable || variable.type !== 'boolean') return;
      this.set(name, !variable.value);
    }

    /**
     * Reset a single variable to its default value.
     * @param {string} name
     */
    reset(name) {
      const variable = this._variables.get(name);
      if (variable) {
        this.set(name, variable.defaultValue);
      }
    }

    /**
     * Reset all user variables to their defaults.
     * Useful when retrying a quiz or restarting a module.
     */
    resetAll() {
      for (const [name] of this._variables) {
        this.reset(name);
      }
    }

    /**
     * Reset only slide-scoped variables (called on slide change).
     * Project-scoped variables persist.
     */
    resetSlideVariables() {
      for (const [name, variable] of this._variables) {
        if (variable.scope === 'slide') {
          this.set(name, variable.defaultValue);
        }
      }
    }

    // -------------------------------------------------------------------------
    // Built-in system variables
    // -------------------------------------------------------------------------

    /**
     * Update a built-in system variable (read-only from user perspective).
     * These are set by the engine, not by user triggers.
     *
     * @param {string} name - e.g. 'Project.SlideCount', 'Slide.Number'
     * @param {*} value
     */
    updateBuiltIn(name, value) {
      const oldValue = this._builtIn[name];
      this._builtIn[name] = value;

      if (oldValue !== value) {
        this._updateDOMReferences(name, value);
        this._dispatchEvent(name, value, oldValue);
      }
    }

    /**
     * Set up standard built-in variables based on course structure.
     * Called once during initialization.
     *
     * @param {Object} courseInfo
     * @param {number} courseInfo.totalSlides
     * @param {number} courseInfo.currentSlide
     */
    initBuiltIns(courseInfo = {}) {
      this._builtIn['Project.TotalSlides'] = courseInfo.totalSlides || 0;
      this._builtIn['Project.SlideNumber'] = courseInfo.currentSlide || 1;
      this._builtIn['Project.SlidesViewed'] = 1;
      this._builtIn['Project.CompletionPercentage'] = 0;
      this._builtIn['Slide.Number'] = courseInfo.currentSlide || 1;
      this._builtIn['Project.ElapsedTime'] = 0;
    }

    // -------------------------------------------------------------------------
    // Listeners
    // -------------------------------------------------------------------------

    /**
     * Listen for changes to a specific variable.
     * @param {string} name - Variable name
     * @param {Function} callback - Receives { name, newValue, oldValue }
     * @returns {Function} Unsubscribe function
     */
    onChange(name, callback) {
      if (!this._listeners.has(name)) {
        this._listeners.set(name, []);
      }
      this._listeners.get(name).push(callback);

      // Return unsubscribe function for clean-up
      return () => {
        const list = this._listeners.get(name);
        if (list) {
          const idx = list.indexOf(callback);
          if (idx !== -1) list.splice(idx, 1);
        }
      };
    }

    /**
     * Listen for changes to ANY variable.
     * @param {Function} callback - Receives { name, newValue, oldValue }
     * @returns {Function} Unsubscribe function
     */
    onAnyChange(callback) {
      this._globalListeners.push(callback);
      return () => {
        const idx = this._globalListeners.indexOf(callback);
        if (idx !== -1) this._globalListeners.splice(idx, 1);
      };
    }

    // -------------------------------------------------------------------------
    // Serialization (SCORM suspend_data)
    // -------------------------------------------------------------------------

    /**
     * Serialize all project-scoped user variables to a JSON string.
     * Compact: only stores name→value pairs (types and defaults are in config).
     * @returns {string} JSON string for SCORM suspend_data
     */
    serialize() {
      const data = {};
      for (const [name, variable] of this._variables) {
        // Only persist project-scoped variables
        if (variable.scope !== 'slide') {
          data[name] = variable.value;
        }
      }
      return JSON.stringify(data);
    }

    /**
     * Restore variables from a SCORM suspend_data JSON string.
     * Wraps JSON.parse in try-catch (SCORM suspend_data can be corrupted).
     * @param {string} jsonString
     */
    deserialize(jsonString) {
      if (!jsonString) return;

      try {
        const data = JSON.parse(jsonString);
        for (const [name, value] of Object.entries(data)) {
          if (this._variables.has(name)) {
            this.set(name, value);
          }
        }
      } catch (e) {
        console.warn('[VariableStore] Failed to deserialize suspend_data:', e.message);
      }
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    /**
     * Coerce a value to the correct type.
     * Prevents type mismatches from corrupting the store.
     * @private
     */
    _coerce(type, value) {
      switch (type) {
        case 'boolean': return Boolean(value);
        case 'number': {
          const n = Number(value);
          return isNaN(n) ? 0 : n;
        }
        case 'text': return String(value);
        default: return value;
      }
    }

    /**
     * Notify per-variable and global listeners of a change.
     * @private
     */
    _notify(name, newValue, oldValue) {
      const detail = { name, newValue, oldValue };

      // Per-variable listeners
      const callbacks = this._listeners.get(name);
      if (callbacks) {
        callbacks.forEach(cb => {
          try { cb(detail); } catch (e) {
            console.error(`[VariableStore] Listener error for "${name}":`, e);
          }
        });
      }

      // Global listeners
      this._globalListeners.forEach(cb => {
        try { cb(detail); } catch (e) {
          console.error('[VariableStore] Global listener error:', e);
        }
      });
    }

    /**
     * Dispatch a CustomEvent on the document so the trigger engine
     * and other systems can listen without a direct reference.
     * @private
     */
    _dispatchEvent(name, newValue, oldValue) {
      document.dispatchEvent(new CustomEvent('scorm:variableChange', {
        detail: { name, newValue, oldValue }
      }));
    }

    /**
     * Update DOM elements that display variable values.
     *
     * Supports two patterns:
     *
     * 1. Simple reference:
     *    <span data-var="score">0</span>
     *    → textContent is replaced with the variable's current value
     *
     * 2. Template reference (multiple variables in one element):
     *    <span data-var-template="Score: %score% / %total%">...</span>
     *    → Each %name% is replaced with the live value
     *
     * @private
     */
    _updateDOMReferences(name, value) {
      // Pattern 1: simple data-var="variableName"
      const simpleRefs = document.querySelectorAll(`[data-var="${name}"]`);
      simpleRefs.forEach(el => {
        el.textContent = value;
      });

      // Pattern 2: template data-var-template="... %variableName% ..."
      // We need to scan all template elements and re-evaluate their full template
      const templateRefs = document.querySelectorAll('[data-var-template]');
      templateRefs.forEach(el => {
        const template = el.getAttribute('data-var-template');
        // Only process if this template references the changed variable
        if (template.indexOf(`%${name}%`) === -1) return;

        let output = template;
        // Replace ALL variable references in the template
        const varPattern = /%([^%]+)%/g;
        let match;
        while ((match = varPattern.exec(template)) !== null) {
          const varName = match[1];
          const varValue = this.get(varName);
          if (varValue !== undefined) {
            output = output.replace(new RegExp(`%${varName}%`, 'g'), varValue);
          }
        }
        el.textContent = output;
      });
    }
  }

  // Expose globally
  window.VariableStore = VariableStore;

})();
