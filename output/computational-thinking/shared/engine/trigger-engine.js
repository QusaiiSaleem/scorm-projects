/**
 * SCORM Content Studio — Trigger Engine
 * =======================================
 * Declarative event-driven action system — the "programming logic"
 * of interactive courses. Equivalent to Storyline 360's Trigger system.
 *
 * Every trigger follows the pattern:
 *   WHEN [event] on [target]  →  DO [action] on [actionTarget]  →  IF [conditions]
 *
 * Triggers can be defined in JavaScript config or via HTML data attributes:
 *
 *   // JavaScript config (full power)
 *   triggers.register({
 *     event: 'click',
 *     eventTarget: '#btn1',
 *     action: 'showLayer',
 *     actionParams: { layer: '#detail-layer' },
 *     conditions: [{ type: 'variable', subject: 'score', operator: '>=', value: 80 }],
 *     elseAction: { action: 'showLayer', params: { layer: '#try-again' } }
 *   });
 *
 *   // HTML data attributes (simple triggers)
 *   <button data-trigger="click"
 *           data-action="showLayer"
 *           data-action-target="#feedback">Show Feedback</button>
 *
 * Supported events: click, hover, hoverOff, keyPress, slideStart, slideEnd,
 *   timelineStart, timelineEnd, timelineCuePoint, variableChange, stateChange,
 *   dragDrop, layerShow, layerHide, mediaEnd, focusIn, focusOut, custom
 *
 * Supported actions: jumpToSlide, nextSlide, prevSlide, showLayer, hideLayer,
 *   hideAllLayers, toggleLayer, changeState, toggleState, setVariable,
 *   adjustVariable, toggleVariable, playMedia, pauseMedia, stopMedia,
 *   showElement, hideElement, toggleElement, enableElement, disableElement,
 *   setFocus, executeFunction, completeCourse, custom
 *
 * @version 1.0.0
 */

(function () {
  'use strict';

  /**
   * @class TriggerEngine
   * @description Declarative event→action→condition system.
   *              Binds DOM events, evaluates conditions, and executes actions.
   */
  class TriggerEngine {
    /**
     * @param {Object} systems - References to other engine systems
     * @param {StateManager} [systems.states] - State manager instance
     * @param {VariableStore} [systems.variables] - Variable store instance
     * @param {Object} [systems.layers] - Layer manager instance (Phase 3)
     * @param {Object} [systems.audio] - Audio player instance
     */
    constructor(systems = {}) {
      this._states = systems.states || null;
      this._variables = systems.variables || null;
      this._layers = systems.layers || null;
      this._audio = systems.audio || null;

      /**
       * All registered triggers with their bound handlers.
       * @type {Array<Object>}
       */
      this._triggers = [];

      /**
       * Counter for generating unique trigger IDs.
       * @type {number}
       */
      this._nextId = 0;

      /**
       * Bound event handler references for cleanup.
       * Map<triggerId, { element, event, handler, cleanup? }>
       */
      this._boundHandlers = new Map();

      // Auto-scan for data-attribute triggers in the DOM
      this._scanDataAttributes();
    }

    // -------------------------------------------------------------------------
    // Registration
    // -------------------------------------------------------------------------

    /**
     * Register a single trigger.
     *
     * @param {Object} config
     * @param {string} config.event - When to fire (click, hover, variableChange, etc.)
     * @param {string} [config.eventTarget] - CSS selector or element id for the event source
     * @param {Object} [config.eventParams] - Additional event parameters (key, variable, etc.)
     * @param {string} config.action - What to do (showLayer, changeState, setVariable, etc.)
     * @param {Object} [config.actionParams] - Parameters for the action
     * @param {Array}  [config.conditions] - Conditions that must be true
     * @param {string} [config.conditionLogic='AND'] - 'AND' or 'OR'
     * @param {Object} [config.elseAction] - Alternative action if conditions are false
     * @param {number} [config.priority] - Execution order (lower = first)
     * @returns {string} The trigger ID
     */
    register(config) {
      const id = `trigger_${this._nextId++}`;

      const trigger = {
        id,
        event: config.event,
        eventTarget: config.eventTarget || null,
        eventParams: config.eventParams || {},
        action: config.action,
        actionParams: config.actionParams || {},
        conditions: config.conditions || [],
        conditionLogic: config.conditionLogic || 'AND',
        elseAction: config.elseAction || null,
        priority: config.priority !== undefined ? config.priority : this._triggers.length,
        enabled: true
      };

      this._triggers.push(trigger);
      this._bindEvent(trigger);

      return id;
    }

    /**
     * Register multiple triggers at once.
     * @param {Array<Object>} configs
     * @returns {string[]} Array of trigger IDs
     */
    registerAll(configs) {
      if (!Array.isArray(configs)) return [];
      return configs.map(c => this.register(c));
    }

    /**
     * Enable or disable a trigger by ID.
     * @param {string} triggerId
     * @param {boolean} enabled
     */
    setEnabled(triggerId, enabled) {
      const trigger = this._triggers.find(t => t.id === triggerId);
      if (trigger) trigger.enabled = enabled;
    }

    /**
     * Remove a trigger and its event binding.
     * @param {string} triggerId
     */
    remove(triggerId) {
      const idx = this._triggers.findIndex(t => t.id === triggerId);
      if (idx !== -1) {
        this._unbindEvent(triggerId);
        this._triggers.splice(idx, 1);
      }
    }

    // -------------------------------------------------------------------------
    // Action executors
    // -------------------------------------------------------------------------

    /**
     * Execute an action with parameters.
     * This is the central dispatch — all actions route through here.
     *
     * @param {string} action - Action name
     * @param {Object} params - Action parameters
     */
    executeAction(action, params = {}) {
      switch (action) {

        // --- Navigation actions ---

        case 'jumpToSlide':
          this._dispatchNav({ target: params.slideId || params.target });
          break;

        case 'nextSlide':
          this._dispatchNav({ target: 'next' });
          break;

        case 'prevSlide':
          this._dispatchNav({ target: 'prev' });
          break;

        case 'jumpToScene':
          this._dispatchNav({ target: params.sceneId, type: 'scene' });
          break;

        // --- Layer actions ---

        case 'showLayer':
          if (this._layers) {
            this._layers.show(this._resolveSelector(params.layer));
          } else {
            // Fallback: toggle visibility directly
            this._showElement(params.layer);
          }
          break;

        case 'hideLayer':
          if (this._layers) {
            this._layers.hide(this._resolveSelector(params.layer));
          } else {
            this._hideElement(params.layer);
          }
          break;

        case 'hideAllLayers':
          if (this._layers) {
            this._layers.hideAll();
          }
          break;

        case 'toggleLayer':
          if (this._layers) {
            const layerId = this._resolveSelector(params.layer);
            if (this._layers.isVisible(layerId)) {
              this._layers.hide(layerId);
            } else {
              this._layers.show(layerId);
            }
          }
          break;

        // --- State actions ---

        case 'changeState':
          if (this._states) {
            this._states.setState(
              this._resolveSelector(params.target),
              params.state
            );
          }
          break;

        case 'toggleState':
          if (this._states) {
            this._states.toggleState(
              this._resolveSelector(params.target),
              params.stateA,
              params.stateB
            );
          }
          break;

        // --- Variable actions ---

        case 'setVariable':
          if (this._variables) {
            this._variables.set(params.variable, params.value);
          }
          break;

        case 'adjustVariable':
          if (this._variables) {
            this._variables.adjust(params.variable, params.value);
          }
          break;

        case 'toggleVariable':
          if (this._variables) {
            this._variables.toggle(params.variable);
          }
          break;

        // --- Media actions ---

        case 'playMedia':
          if (this._audio && params.target) {
            this._audio.play(this._resolveSelector(params.target));
          } else {
            this._mediaAction(params.target, 'play');
          }
          break;

        case 'pauseMedia':
          if (this._audio && params.target) {
            this._audio.pause();
          } else {
            this._mediaAction(params.target, 'pause');
          }
          break;

        case 'stopMedia':
          if (this._audio && params.target) {
            this._audio.stop();
          } else {
            this._mediaAction(params.target, 'stop');
          }
          break;

        // --- UI actions ---

        case 'showElement':
          this._showElement(params.target);
          break;

        case 'hideElement':
          this._hideElement(params.target);
          break;

        case 'toggleElement':
          this._toggleElement(params.target);
          break;

        case 'enableElement':
          this._setElementEnabled(params.target, true);
          break;

        case 'disableElement':
          this._setElementEnabled(params.target, false);
          break;

        case 'setFocus':
          this._focusElement(params.target);
          break;

        // --- Custom/advanced actions ---

        case 'executeFunction':
          this._safeExec(params.fn, params.args);
          break;

        case 'completeCourse':
          document.dispatchEvent(new CustomEvent('scorm:complete'));
          break;

        case 'custom':
          // Dispatch a custom event that course-specific code can handle
          document.dispatchEvent(new CustomEvent('scorm:customAction', {
            detail: params
          }));
          break;

        default:
          console.warn(`[TriggerEngine] Unknown action: "${action}"`);
      }
    }

    // -------------------------------------------------------------------------
    // Condition evaluator
    // -------------------------------------------------------------------------

    /**
     * Evaluate a set of conditions with AND/OR logic.
     *
     * @param {Array<Object>} conditions - Array of condition objects
     * @param {string} logic - 'AND' or 'OR'
     * @returns {boolean} Whether conditions are satisfied
     *
     * Condition object:
     * {
     *   type: 'variable' | 'state' | 'element' | 'window',
     *   subject: string,     // variable name, object id, or CSS selector
     *   operator: string,    // ==, !=, >, <, >=, <=, is, isNot, contains, etc.
     *   value: *             // expected value
     * }
     *
     * Nested conditions (AND/OR groups):
     * {
     *   operator: 'AND' | 'OR',
     *   conditions: [ ...nested condition objects... ]
     * }
     */
    evaluateConditions(conditions, logic = 'AND') {
      if (!conditions || conditions.length === 0) return true;

      const results = conditions.map(cond => {
        // Handle nested condition groups
        if (cond.operator === 'AND' || cond.operator === 'OR') {
          return this.evaluateConditions(cond.conditions, cond.operator);
        }

        return this._evaluateSingleCondition(cond);
      });

      return logic === 'AND'
        ? results.every(r => r)
        : results.some(r => r);
    }

    // -------------------------------------------------------------------------
    // Data attribute scanning
    // -------------------------------------------------------------------------

    /**
     * Scan the DOM for elements with data-trigger attributes
     * and auto-register them as triggers.
     *
     * Supported attributes:
     *   data-trigger="click"              - The event
     *   data-action="showLayer"           - The action
     *   data-action-target="#feedback"    - Target for the action
     *   data-action-param-*="value"      - Additional action params
     *   data-condition-var="score"        - Condition variable
     *   data-condition-op=">="           - Condition operator
     *   data-condition-val="80"          - Condition value
     *
     * @private
     */
    _scanDataAttributes() {
      const elements = document.querySelectorAll('[data-trigger]');
      elements.forEach(el => {
        const event = el.getAttribute('data-trigger');
        const action = el.getAttribute('data-action');
        if (!event || !action) return;

        // Build action params from data-action-param-* attributes
        const actionParams = {};
        const targetAttr = el.getAttribute('data-action-target');
        if (targetAttr) {
          // Determine the param name based on action type
          if (action.includes('Layer')) actionParams.layer = targetAttr;
          else if (action.includes('State')) actionParams.target = targetAttr;
          else if (action.includes('Variable')) actionParams.variable = targetAttr;
          else actionParams.target = targetAttr;
        }

        // Collect extra params from data-action-param-* attributes
        for (const attr of el.attributes) {
          if (attr.name.startsWith('data-action-param-')) {
            const paramName = attr.name.replace('data-action-param-', '');
            actionParams[paramName] = attr.value;
          }
        }

        // Build conditions if present
        const conditions = [];
        const condVar = el.getAttribute('data-condition-var');
        if (condVar) {
          conditions.push({
            type: 'variable',
            subject: condVar,
            operator: el.getAttribute('data-condition-op') || '==',
            value: el.getAttribute('data-condition-val')
          });
        }

        this.register({
          event,
          eventTarget: `#${el.id}` || null,
          action,
          actionParams,
          conditions
        });
      });
    }

    // -------------------------------------------------------------------------
    // Internal: Event binding
    // -------------------------------------------------------------------------

    /**
     * Bind a trigger's event to the DOM.
     * @private
     */
    _bindEvent(trigger) {
      const handler = (e) => {
        if (!trigger.enabled) return;

        // Evaluate conditions
        const conditionsMet = this.evaluateConditions(
          trigger.conditions,
          trigger.conditionLogic
        );

        if (conditionsMet) {
          this.executeAction(trigger.action, trigger.actionParams);
        } else if (trigger.elseAction) {
          this.executeAction(trigger.elseAction.action, trigger.elseAction.params || {});
        }
      };

      const { event, eventTarget, eventParams } = trigger;

      switch (event) {
        // --- DOM events (need an element target) ---
        case 'click': {
          const el = this._getElement(eventTarget);
          if (el) {
            el.addEventListener('click', handler);
            this._boundHandlers.set(trigger.id, { element: el, event: 'click', handler });
          }
          break;
        }

        case 'hover':
        case 'mouseenter': {
          const el = this._getElement(eventTarget);
          if (el) {
            el.addEventListener('mouseenter', handler);
            this._boundHandlers.set(trigger.id, { element: el, event: 'mouseenter', handler });
          }
          break;
        }

        case 'hoverOff':
        case 'mouseleave': {
          const el = this._getElement(eventTarget);
          if (el) {
            el.addEventListener('mouseleave', handler);
            this._boundHandlers.set(trigger.id, { element: el, event: 'mouseleave', handler });
          }
          break;
        }

        case 'focusIn': {
          const el = this._getElement(eventTarget);
          if (el) {
            el.addEventListener('focusin', handler);
            this._boundHandlers.set(trigger.id, { element: el, event: 'focusin', handler });
          }
          break;
        }

        case 'focusOut': {
          const el = this._getElement(eventTarget);
          if (el) {
            el.addEventListener('focusout', handler);
            this._boundHandlers.set(trigger.id, { element: el, event: 'focusout', handler });
          }
          break;
        }

        // --- Keyboard event ---
        case 'keyPress': {
          const keyHandler = (e) => {
            if (eventParams.key && e.key !== eventParams.key) return;
            if (eventParams.code && e.code !== eventParams.code) return;
            handler(e);
          };
          document.addEventListener('keydown', keyHandler);
          this._boundHandlers.set(trigger.id, {
            element: document,
            event: 'keydown',
            handler: keyHandler
          });
          break;
        }

        // --- Slide lifecycle events ---
        case 'slideStart': {
          // Fire immediately if page already loaded, otherwise on load
          if (document.readyState === 'complete') {
            // Defer to next tick so all triggers are registered first
            setTimeout(handler, 0);
          } else {
            window.addEventListener('load', handler, { once: true });
            this._boundHandlers.set(trigger.id, {
              element: window,
              event: 'load',
              handler
            });
          }
          break;
        }

        case 'slideEnd': {
          // Listen for the navigation event that signals leaving the slide
          const slideEndHandler = () => handler();
          document.addEventListener('scorm:slideEnd', slideEndHandler);
          this._boundHandlers.set(trigger.id, {
            element: document,
            event: 'scorm:slideEnd',
            handler: slideEndHandler
          });
          break;
        }

        // --- Variable change event ---
        case 'variableChange': {
          const varHandler = (e) => {
            // If a specific variable is targeted, only fire for that one
            if (eventParams.variable && e.detail.name !== eventParams.variable) return;
            handler(e);
          };
          document.addEventListener('scorm:variableChange', varHandler);
          this._boundHandlers.set(trigger.id, {
            element: document,
            event: 'scorm:variableChange',
            handler: varHandler
          });
          break;
        }

        // --- State change event ---
        case 'stateChange': {
          const stateHandler = (e) => {
            // Filter by target object and/or specific state
            if (eventParams.target && e.detail.objectId !== this._resolveSelector(eventParams.target)) return;
            if (eventParams.state && e.detail.stateName !== eventParams.state) return;
            handler(e);
          };
          document.addEventListener('scorm:stateChange', stateHandler);
          this._boundHandlers.set(trigger.id, {
            element: document,
            event: 'scorm:stateChange',
            handler: stateHandler
          });
          break;
        }

        // --- Layer events ---
        case 'layerShow': {
          const layerShowHandler = (e) => {
            if (eventParams.layer && e.detail.layerId !== this._resolveSelector(eventParams.layer)) return;
            handler(e);
          };
          document.addEventListener('scorm:layerShow', layerShowHandler);
          this._boundHandlers.set(trigger.id, {
            element: document,
            event: 'scorm:layerShow',
            handler: layerShowHandler
          });
          break;
        }

        case 'layerHide': {
          const layerHideHandler = (e) => {
            if (eventParams.layer && e.detail.layerId !== this._resolveSelector(eventParams.layer)) return;
            handler(e);
          };
          document.addEventListener('scorm:layerHide', layerHideHandler);
          this._boundHandlers.set(trigger.id, {
            element: document,
            event: 'scorm:layerHide',
            handler: layerHideHandler
          });
          break;
        }

        // --- Media events ---
        case 'mediaEnd': {
          const mediaEl = this._getElement(eventTarget || eventParams.target);
          if (mediaEl) {
            mediaEl.addEventListener('ended', handler);
            this._boundHandlers.set(trigger.id, {
              element: mediaEl,
              event: 'ended',
              handler
            });
          }
          break;
        }

        // --- Drag-drop events ---
        case 'dragDrop': {
          const dragDropHandler = (e) => {
            if (eventParams.target && e.detail.dropTarget !== eventParams.target) return;
            handler(e);
          };
          document.addEventListener('scorm:dragDrop', dragDropHandler);
          this._boundHandlers.set(trigger.id, {
            element: document,
            event: 'scorm:dragDrop',
            handler: dragDropHandler
          });
          break;
        }

        // --- Timeline events (for future integration) ---
        case 'timelineStart':
        case 'timelineEnd':
        case 'timelineCuePoint': {
          const tlEventName = `scorm:${event}`;
          const tlHandler = (e) => {
            if (eventParams.timeline && e.detail.timelineId !== eventParams.timeline) return;
            if (event === 'timelineCuePoint' && eventParams.cuePoint && e.detail.cuePoint !== eventParams.cuePoint) return;
            handler(e);
          };
          document.addEventListener(tlEventName, tlHandler);
          this._boundHandlers.set(trigger.id, {
            element: document,
            event: tlEventName,
            handler: tlHandler
          });
          break;
        }

        // --- Custom events ---
        case 'custom': {
          const customName = eventParams.eventName || 'scorm:custom';
          const customHandler = (e) => handler(e);
          document.addEventListener(customName, customHandler);
          this._boundHandlers.set(trigger.id, {
            element: document,
            event: customName,
            handler: customHandler
          });
          break;
        }

        default:
          console.warn(`[TriggerEngine] Unknown event type: "${event}"`);
      }
    }

    /**
     * Unbind a trigger's event handler.
     * @private
     */
    _unbindEvent(triggerId) {
      const binding = this._boundHandlers.get(triggerId);
      if (binding) {
        binding.element.removeEventListener(binding.event, binding.handler);
        this._boundHandlers.delete(triggerId);
      }
    }

    // -------------------------------------------------------------------------
    // Internal: Condition evaluation
    // -------------------------------------------------------------------------

    /**
     * Evaluate a single condition.
     * @private
     */
    _evaluateSingleCondition(cond) {
      let actualValue;

      switch (cond.type) {
        case 'variable':
          actualValue = this._variables ? this._variables.get(cond.subject) : undefined;
          break;

        case 'state':
          actualValue = this._states ? this._states.getState(cond.subject) : null;
          break;

        case 'element': {
          const el = this._getElement(cond.subject);
          if (!el) return false;
          // Check element properties
          if (cond.property === 'visible') actualValue = el.offsetParent !== null;
          else if (cond.property === 'checked') actualValue = el.checked;
          else if (cond.property === 'value') actualValue = el.value;
          else if (cond.property === 'class') actualValue = el.classList.contains(cond.value);
          break;
        }

        case 'window':
          if (cond.property === 'width') actualValue = window.innerWidth;
          else if (cond.property === 'height') actualValue = window.innerHeight;
          break;

        default:
          // Default: treat subject as a variable name
          actualValue = this._variables ? this._variables.get(cond.subject) : undefined;
      }

      return this._compare(actualValue, cond.operator, cond.value);
    }

    /**
     * Compare two values using the specified operator.
     * @private
     */
    _compare(actual, operator, expected) {
      // Auto-convert expected value to match actual type for numeric comparisons
      if (typeof actual === 'number' && typeof expected === 'string') {
        expected = Number(expected);
      }

      switch (operator) {
        case '==':  return actual == expected;  // eslint-disable-line eqeqeq
        case '===': return actual === expected;
        case '!=':  return actual != expected;  // eslint-disable-line eqeqeq
        case '!==': return actual !== expected;
        case '>':   return Number(actual) > Number(expected);
        case '<':   return Number(actual) < Number(expected);
        case '>=':  return Number(actual) >= Number(expected);
        case '<=':  return Number(actual) <= Number(expected);
        case 'is':  return actual === expected;
        case 'isNot': return actual !== expected;
        case 'contains':   return String(actual).includes(String(expected));
        case 'startsWith': return String(actual).startsWith(String(expected));
        case 'endsWith':   return String(actual).endsWith(String(expected));
        case 'isTrue':     return actual === true || actual === 'true';
        case 'isFalse':    return actual === false || actual === 'false';
        case 'isEmpty':    return !actual || actual === '' || actual === 0;
        case 'isNotEmpty': return !!actual && actual !== '' && actual !== 0;
        default:
          console.warn(`[TriggerEngine] Unknown operator: "${operator}"`);
          return false;
      }
    }

    // -------------------------------------------------------------------------
    // Internal: Action helpers
    // -------------------------------------------------------------------------

    /** Dispatch a navigation event for SlideController to handle. @private */
    _dispatchNav(detail) {
      document.dispatchEvent(new CustomEvent('scorm:navigate', { detail }));
    }

    /** Show an element by selector. @private */
    _showElement(selector) {
      const el = this._getElement(selector);
      if (el) {
        el.style.display = '';
        el.style.visibility = '';
        el.removeAttribute('aria-hidden');
      }
    }

    /** Hide an element by selector. @private */
    _hideElement(selector) {
      const el = this._getElement(selector);
      if (el) {
        el.style.display = 'none';
        el.setAttribute('aria-hidden', 'true');
      }
    }

    /** Toggle element visibility. @private */
    _toggleElement(selector) {
      const el = this._getElement(selector);
      if (!el) return;
      if (el.style.display === 'none' || el.getAttribute('aria-hidden') === 'true') {
        this._showElement(selector);
      } else {
        this._hideElement(selector);
      }
    }

    /** Enable or disable an element. @private */
    _setElementEnabled(selector, enabled) {
      const el = this._getElement(selector);
      if (!el) return;
      if (enabled) {
        el.removeAttribute('disabled');
        el.removeAttribute('aria-disabled');
        el.style.pointerEvents = '';
      } else {
        el.setAttribute('disabled', '');
        el.setAttribute('aria-disabled', 'true');
        el.style.pointerEvents = 'none';
      }
    }

    /** Focus an element. @private */
    _focusElement(selector) {
      const el = this._getElement(selector);
      if (el && el.focus) el.focus();
    }

    /** Control a media element. @private */
    _mediaAction(selector, action) {
      const el = this._getElement(selector);
      if (!el) return;
      switch (action) {
        case 'play': if (el.play) el.play().catch(() => {}); break;
        case 'pause': if (el.pause) el.pause(); break;
        case 'stop':
          if (el.pause) el.pause();
          if ('currentTime' in el) el.currentTime = 0;
          break;
      }
    }

    /**
     * Safely execute a named function.
     * Avoids eval() — only calls functions registered on window or passed by name.
     * @private
     */
    _safeExec(fnName, args) {
      if (typeof fnName === 'function') {
        try { fnName(args); } catch (e) {
          console.error('[TriggerEngine] Function execution error:', e);
        }
        return;
      }
      if (typeof fnName === 'string' && typeof window[fnName] === 'function') {
        try { window[fnName](args); } catch (e) {
          console.error(`[TriggerEngine] Error executing "${fnName}":`, e);
        }
      }
    }

    // -------------------------------------------------------------------------
    // Internal: DOM helpers
    // -------------------------------------------------------------------------

    /**
     * Get a DOM element from a selector string or element ID.
     * Supports: '#elementId', '.class', CSS selectors, or bare IDs.
     * @private
     */
    _getElement(selector) {
      if (!selector) return null;
      if (selector instanceof HTMLElement) return selector;

      // If it looks like a CSS selector (starts with . # [ or contains space)
      if (/^[.#\[]/.test(selector) || selector.includes(' ')) {
        return document.querySelector(selector);
      }

      // Otherwise treat as an element ID
      return document.getElementById(selector);
    }

    /**
     * Resolve a selector to just an ID string (strip leading #).
     * Used for systems that expect plain IDs, not CSS selectors.
     * @private
     */
    _resolveSelector(selector) {
      if (!selector) return '';
      return selector.startsWith('#') ? selector.slice(1) : selector;
    }

    // -------------------------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------------------------

    /**
     * Remove all triggers and event bindings.
     * Call this when navigating away from a slide.
     */
    destroy() {
      for (const [triggerId] of this._boundHandlers) {
        this._unbindEvent(triggerId);
      }
      this._triggers = [];
      this._boundHandlers.clear();
      this._nextId = 0;
    }
  }

  // Expose globally
  window.TriggerEngine = TriggerEngine;

})();
