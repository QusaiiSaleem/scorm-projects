/**
 * SCORM Content Studio — State Engine
 * =====================================
 * Manages visual states for interactive objects — equivalent to
 * Storyline 360's Object States system.
 *
 * Every registered object can have multiple named states (Normal, Hover,
 * Selected, Visited, Disabled, Hidden, plus unlimited custom states).
 * Auto-states (Hover, Down) fire without triggers. Visited is permanent.
 * Button sets give radio-button mutual exclusion.
 *
 * State changes are applied via data-state attribute + CSS classes,
 * keeping all visual logic in CSS where it belongs.
 *
 * Usage:
 *   const states = new StateManager();
 *   states.register('btn1', {
 *     normal:   { classes: ['btn-normal'] },
 *     hover:    { classes: ['btn-hover'], auto: true },
 *     selected: { classes: ['btn-selected'] },
 *     visited:  { classes: ['btn-visited'], permanent: true },
 *     disabled: { classes: ['btn-disabled'], interactive: false }
 *   }, { buttonSet: 'quiz-options' });
 *
 *   states.setState('btn1', 'selected');
 *   states.getState('btn1'); // 'selected'
 *
 * CSS targeting:
 *   [data-state="selected"] { border-color: var(--color-primary); }
 *   [data-state="disabled"] { opacity: 0.4; pointer-events: none; }
 *
 * @version 1.0.0
 */

(function () {
  'use strict';

  /**
   * @class StateManager
   * @description Manages visual states for DOM objects with auto-states,
   *              button sets, CSS class application, and SCORM serialization.
   */
  class StateManager {
    constructor() {
      /**
       * Registered objects.
       * Map<objectId, {
       *   element: HTMLElement,
       *   currentState: string,
       *   previousState: string|null,
       *   states: Object,
       *   autoStates: boolean,
       *   visited: boolean,
       *   buttonSet: string|null
       * }>
       */
      this._objects = new Map();

      /**
       * Button sets for radio-group behavior.
       * Map<setName, Set<objectId>>
       */
      this._buttonSets = new Map();

      /**
       * State change listeners.
       * Array<{ event: string, callback: Function }>
       */
      this._listeners = [];

      /**
       * Bound event handler references (for cleanup).
       * Map<objectId, Array<{ element, event, handler }>>
       */
      this._boundHandlers = new Map();
    }

    // -------------------------------------------------------------------------
    // Registration
    // -------------------------------------------------------------------------

    /**
     * Register an object with its available states.
     *
     * @param {string} objectId - DOM element id
     * @param {Object} states - State definitions:
     *   {
     *     stateName: {
     *       classes: string[],      // CSS classes to apply
     *       styles: Object,         // Inline styles (use sparingly)
     *       content: string,        // Replace innerHTML (use sparingly)
     *       auto: boolean,          // Auto-triggered (hover/down)
     *       permanent: boolean,     // Cannot be undone (visited)
     *       interactive: boolean    // false = non-interactive (disabled)
     *     }
     *   }
     * @param {Object} [options]
     * @param {string} [options.buttonSet] - Name of radio-group
     * @param {string} [options.initialState='normal'] - Starting state
     * @param {boolean} [options.autoStates=true] - Enable hover/down auto-states
     */
    register(objectId, states = {}, options = {}) {
      const el = document.getElementById(objectId);
      if (!el) {
        console.warn(`[StateManager] Element #${objectId} not found.`);
        return;
      }

      // "normal" state always exists — it's the baseline
      const allStates = {
        normal: { classes: [], interactive: true },
        ...states
      };

      const obj = {
        element: el,
        currentState: 'normal',
        previousState: null,
        states: allStates,
        autoStates: options.autoStates !== false,
        visited: false,
        buttonSet: options.buttonSet || null
      };

      this._objects.set(objectId, obj);

      // Register in button set if specified
      if (options.buttonSet) {
        if (!this._buttonSets.has(options.buttonSet)) {
          this._buttonSets.set(options.buttonSet, new Set());
        }
        this._buttonSets.get(options.buttonSet).add(objectId);
        el.setAttribute('data-button-set', options.buttonSet);
      }

      // Bind auto-state event handlers (hover, down, visited)
      if (obj.autoStates) {
        this._bindAutoStates(objectId);
      }

      // Make element keyboard-accessible if it's interactive
      if (!el.getAttribute('tabindex') && !el.matches('button, a, input, select, textarea')) {
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
      }

      // Apply initial state
      const initial = options.initialState || 'normal';
      this._applyState(objectId, initial);
      obj.currentState = initial;
    }

    /**
     * Register multiple objects at once from a config map.
     *
     * @param {Object} objectConfigs - { objectId: { states, buttonSet, initialState, autoStates } }
     */
    registerAll(objectConfigs) {
      for (const [objectId, config] of Object.entries(objectConfigs)) {
        this.register(objectId, config.states || {}, {
          buttonSet: config.buttonSet,
          initialState: config.initialState,
          autoStates: config.autoStates
        });
      }
    }

    // -------------------------------------------------------------------------
    // State changes
    // -------------------------------------------------------------------------

    /**
     * Change an object's state.
     * Handles special states (hidden, disabled) and button set exclusion.
     *
     * @param {string} objectId
     * @param {string} stateName
     */
    setState(objectId, stateName) {
      const obj = this._objects.get(objectId);
      if (!obj) {
        console.warn(`[StateManager] Object "${objectId}" not registered.`);
        return;
      }

      // If the object is disabled, only allow 'normal' or 'hidden' to override
      if (obj.currentState === 'disabled' && stateName !== 'normal' && stateName !== 'hidden') {
        return;
      }

      // If the object has a permanent state (visited), don't allow going back to normal
      if (obj.visited && stateName === 'normal') {
        // Stay on visited instead
        if (obj.states.visited) {
          stateName = 'visited';
        }
      }

      // Handle button set exclusion — deselect siblings before selecting
      if (stateName === 'selected' && obj.buttonSet) {
        this._deselectButtonSetSiblings(objectId, obj.buttonSet);
      }

      // Record state transition
      obj.previousState = obj.currentState;
      obj.currentState = stateName;

      // Apply the visual state
      this._applyState(objectId, stateName);

      // Emit state change event for trigger engine
      this._emit('stateChange', {
        objectId,
        stateName,
        previousState: obj.previousState
      });

      // Dispatch CustomEvent on the document for decoupled systems
      document.dispatchEvent(new CustomEvent('scorm:stateChange', {
        detail: { objectId, stateName, previousState: obj.previousState }
      }));
    }

    /**
     * Toggle between two states.
     * If the object is in stateA, switch to stateB, and vice versa.
     *
     * @param {string} objectId
     * @param {string} stateA
     * @param {string} stateB
     */
    toggleState(objectId, stateA, stateB) {
      const obj = this._objects.get(objectId);
      if (!obj) return;
      const next = obj.currentState === stateA ? stateB : stateA;
      this.setState(objectId, next);
    }

    /**
     * Get the current state of an object.
     * @param {string} objectId
     * @returns {string|null}
     */
    getState(objectId) {
      const obj = this._objects.get(objectId);
      return obj ? obj.currentState : null;
    }

    /**
     * Check if an object has been visited (clicked at least once).
     * @param {string} objectId
     * @returns {boolean}
     */
    isVisited(objectId) {
      const obj = this._objects.get(objectId);
      return obj ? obj.visited : false;
    }

    /**
     * Check if an object is in the disabled state.
     * @param {string} objectId
     * @returns {boolean}
     */
    isDisabled(objectId) {
      const obj = this._objects.get(objectId);
      return obj ? obj.currentState === 'disabled' : false;
    }

    /**
     * Check if an object is hidden.
     * @param {string} objectId
     * @returns {boolean}
     */
    isHidden(objectId) {
      const obj = this._objects.get(objectId);
      return obj ? obj.currentState === 'hidden' : false;
    }

    // -------------------------------------------------------------------------
    // Listeners
    // -------------------------------------------------------------------------

    /**
     * Listen for state change events.
     * @param {string} eventName - Currently only 'stateChange'
     * @param {Function} callback - Receives { objectId, stateName, previousState }
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
    // Serialization (SCORM bookmarking)
    // -------------------------------------------------------------------------

    /**
     * Serialize the current state of all objects for suspend_data.
     * Only saves non-normal states to keep the payload compact.
     * @returns {Object} { objectId: stateName, ... }
     */
    serialize() {
      const data = {};
      for (const [objectId, obj] of this._objects) {
        // Only save states that differ from 'normal' (to minimize data)
        if (obj.currentState !== 'normal') {
          data[objectId] = obj.currentState;
        }
        // Always save visited flag if true
        if (obj.visited) {
          data[`${objectId}__visited`] = true;
        }
      }
      return data;
    }

    /**
     * Restore object states from serialized data.
     * @param {Object} data - { objectId: stateName, ... }
     */
    deserialize(data) {
      if (!data || typeof data !== 'object') return;

      for (const [key, value] of Object.entries(data)) {
        // Handle visited flags
        if (key.endsWith('__visited')) {
          const objectId = key.replace('__visited', '');
          const obj = this._objects.get(objectId);
          if (obj) obj.visited = true;
          continue;
        }

        // Restore state
        if (this._objects.has(key)) {
          this.setState(key, value);
        }
      }
    }

    // -------------------------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------------------------

    /**
     * Unregister an object and remove its event listeners.
     * @param {string} objectId
     */
    unregister(objectId) {
      this._removeAutoStates(objectId);
      this._objects.delete(objectId);

      // Remove from button sets
      for (const [setName, members] of this._buttonSets) {
        members.delete(objectId);
        if (members.size === 0) this._buttonSets.delete(setName);
      }
    }

    /**
     * Unregister all objects and clean up all listeners.
     * Call this when navigating away from a slide.
     */
    destroy() {
      for (const [objectId] of this._objects) {
        this._removeAutoStates(objectId);
      }
      this._objects.clear();
      this._buttonSets.clear();
      this._listeners = [];
      this._boundHandlers.clear();
    }

    // -------------------------------------------------------------------------
    // Internal: State application
    // -------------------------------------------------------------------------

    /**
     * Apply a state's visual changes to the DOM element.
     * Uses data-state attribute for CSS targeting and adds/removes classes.
     * @private
     */
    _applyState(objectId, stateName) {
      const obj = this._objects.get(objectId);
      if (!obj) return;

      const el = obj.element;
      const stateConfig = obj.states[stateName] || {};

      // 1. Remove ALL state classes from every defined state
      for (const [, sCfg] of Object.entries(obj.states)) {
        if (sCfg.classes && sCfg.classes.length > 0) {
          sCfg.classes.forEach(cls => el.classList.remove(cls));
        }
      }

      // 2. Apply new state classes
      if (stateConfig.classes && stateConfig.classes.length > 0) {
        stateConfig.classes.forEach(cls => el.classList.add(cls));
      }

      // 3. Apply inline styles if specified (use sparingly — prefer CSS classes)
      if (stateConfig.styles) {
        Object.assign(el.style, stateConfig.styles);
      }

      // 4. Replace content if specified
      if (stateConfig.content !== undefined) {
        el.innerHTML = stateConfig.content;
      }

      // 5. Set the data-state attribute (the primary CSS hook)
      el.setAttribute('data-state', stateName);

      // 6. Handle special built-in state behaviors
      switch (stateName) {
        case 'hidden':
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.setAttribute('aria-hidden', 'true');
          el.setAttribute('tabindex', '-1');
          break;

        case 'disabled':
          el.style.pointerEvents = 'none';
          el.setAttribute('aria-disabled', 'true');
          // Don't hide — disabled elements are visible but non-interactive
          break;

        default:
          // Restore from hidden
          if (obj.previousState === 'hidden') {
            el.style.display = '';
            el.style.visibility = '';
            el.removeAttribute('aria-hidden');
            // Restore tabindex for interactive elements
            if (!el.matches('button, a, input, select, textarea')) {
              el.setAttribute('tabindex', '0');
            } else {
              el.removeAttribute('tabindex');
            }
          }
          // Restore from disabled
          if (obj.previousState === 'disabled') {
            el.style.pointerEvents = '';
            el.removeAttribute('aria-disabled');
          }
          break;
      }
    }

    // -------------------------------------------------------------------------
    // Internal: Auto-states (hover, down, visited)
    // -------------------------------------------------------------------------

    /**
     * Bind automatic state handlers: hover, down (mousedown), visited (click).
     * These fire without explicit triggers, matching Storyline behavior.
     * @private
     */
    _bindAutoStates(objectId) {
      const obj = this._objects.get(objectId);
      const el = obj.element;
      const handlers = [];

      // --- Hover state (auto on mouseenter, revert on mouseleave) ---
      if (obj.states.hover) {
        const onEnter = () => {
          if (obj.currentState === 'disabled' || obj.currentState === 'hidden') return;
          el.classList.add(...(obj.states.hover.classes || ['state--hover']));
        };
        const onLeave = () => {
          el.classList.remove(...(obj.states.hover.classes || ['state--hover']));
          // Also remove down state on leave
          if (obj.states.down) {
            el.classList.remove(...(obj.states.down.classes || ['state--down']));
          }
        };

        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
        // Focus events for keyboard users
        el.addEventListener('focus', onEnter);
        el.addEventListener('blur', onLeave);
        handlers.push(
          { element: el, event: 'mouseenter', handler: onEnter },
          { element: el, event: 'mouseleave', handler: onLeave },
          { element: el, event: 'focus', handler: onEnter },
          { element: el, event: 'blur', handler: onLeave }
        );
      }

      // --- Down state (auto on mousedown, revert on mouseup) ---
      if (obj.states.down) {
        const onDown = () => {
          if (obj.currentState === 'disabled' || obj.currentState === 'hidden') return;
          el.classList.add(...(obj.states.down.classes || ['state--down']));
        };
        const onUp = () => {
          el.classList.remove(...(obj.states.down.classes || ['state--down']));
        };

        el.addEventListener('mousedown', onDown);
        el.addEventListener('mouseup', onUp);
        handlers.push(
          { element: el, event: 'mousedown', handler: onDown },
          { element: el, event: 'mouseup', handler: onUp }
        );
      }

      // --- Visited state (permanent on first click) ---
      const onClick = () => {
        if (obj.currentState === 'disabled' || obj.currentState === 'hidden') return;
        if (!obj.visited) {
          obj.visited = true;
          // If a visited state is defined, apply it
          if (obj.states.visited) {
            this.setState(objectId, 'visited');
          }
        }
      };
      el.addEventListener('click', onClick);
      handlers.push({ element: el, event: 'click', handler: onClick });

      // Also handle keyboard activation (Enter/Space for role="button")
      const onKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
          el.click(); // Propagate to other click handlers
        }
      };
      el.addEventListener('keydown', onKeyDown);
      handlers.push({ element: el, event: 'keydown', handler: onKeyDown });

      this._boundHandlers.set(objectId, handlers);
    }

    /**
     * Remove auto-state event listeners for an object.
     * @private
     */
    _removeAutoStates(objectId) {
      const handlers = this._boundHandlers.get(objectId);
      if (handlers) {
        handlers.forEach(({ element, event, handler }) => {
          element.removeEventListener(event, handler);
        });
        this._boundHandlers.delete(objectId);
      }
    }

    // -------------------------------------------------------------------------
    // Internal: Button sets
    // -------------------------------------------------------------------------

    /**
     * Deselect all siblings in a button set (radio-group behavior).
     * When one member is selected, all others return to normal.
     * @private
     */
    _deselectButtonSetSiblings(objectId, setName) {
      const members = this._buttonSets.get(setName);
      if (!members) return;

      for (const memberId of members) {
        if (memberId === objectId) continue;
        const member = this._objects.get(memberId);
        if (member && member.currentState === 'selected') {
          // Go back to visited if was visited, otherwise normal
          const fallback = member.visited && member.states.visited ? 'visited' : 'normal';
          this.setState(memberId, fallback);
        }
      }
    }

    // -------------------------------------------------------------------------
    // Internal: Event emission
    // -------------------------------------------------------------------------

    /** @private */
    _emit(eventName, detail) {
      this._listeners
        .filter(l => l.event === eventName)
        .forEach(l => {
          try { l.callback(detail); } catch (e) {
            console.error('[StateManager] Listener error:', e);
          }
        });
    }
  }

  // Expose globally
  window.StateManager = StateManager;

})();
