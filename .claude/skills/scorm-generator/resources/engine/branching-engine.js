/**
 * SCORM Content Studio — Branching Engine
 * =========================================
 * Conditional navigation system that enables adaptive learning paths,
 * remediation routing, and choose-your-own-adventure style branching.
 *
 * Equivalent to Storyline 360's branching by variable/quiz result —
 * but declarative and more flexible. Works with VariableStore for
 * condition evaluation and SlideController for navigation.
 *
 * Usage:
 *   const branching = new BranchingEngine(variableStore);
 *
 *   // Route learners based on quiz score
 *   branching.addRule('quiz_1', [
 *     { condition: { variable: 'score', operator: '>=', value: 80 }, goTo: 'advanced_module' },
 *     { condition: { variable: 'score', operator: '>=', value: 60 }, goTo: 'review_module' },
 *     { default: true, goTo: 'remediation_module' }
 *   ]);
 *
 *   // Choose-your-own-adventure branching
 *   branching.addRule('scenario_choice', [
 *     { condition: { variable: 'choice', operator: '==', value: 'option_a' }, goTo: 'path_a_start' },
 *     { condition: { variable: 'choice', operator: '==', value: 'option_b' }, goTo: 'path_b_start' }
 *   ]);
 *
 *   // Evaluate and navigate
 *   branching.evaluate('quiz_1'); // navigates to the matching path
 *
 * @version 1.0.0
 */

(function () {
  'use strict';

  /**
   * @class BranchingEngine
   * @description Evaluates conditional rules and triggers navigation
   *              based on variable values, quiz results, or custom conditions.
   */
  class BranchingEngine {
    /**
     * @param {VariableStore} variableStore - Reference to the variable system
     */
    constructor(variableStore) {
      this._variables = variableStore || null;

      /**
       * Branching rules per decision point.
       * Map<decisionPointId, Array<BranchRule>>
       *
       * BranchRule shape:
       * {
       *   condition: { variable, operator, value } | null,
       *   conditions: Array<Condition>,  // for AND/OR logic
       *   conditionLogic: 'AND' | 'OR',
       *   default: boolean,
       *   goTo: string,                  // slide/scene id to navigate to
       *   action: Object                 // optional extra action to execute
       * }
       */
      this._rules = new Map();

      /**
       * Navigation path history for analytics.
       * Array<{ from, to, timestamp, conditions }>
       */
      this._pathHistory = [];

      /**
       * Whether to auto-navigate when evaluate() finds a match.
       * Set to false if you want to evaluate and get the target without navigating.
       * @type {boolean}
       */
      this.autoNavigate = true;
    }

    // -------------------------------------------------------------------------
    // Rule definition
    // -------------------------------------------------------------------------

    /**
     * Add branching rules for a decision point.
     *
     * @param {string} decisionPointId - Identifier for when these rules apply
     *   (typically a slide ID or quiz ID)
     * @param {Array<Object>} rules - Array of branching rules, evaluated in order.
     *   The FIRST matching rule wins (order matters!).
     *
     * @example
     *   branching.addRule('quiz_1', [
     *     { condition: { variable: 'score', operator: '>=', value: 80 }, goTo: 'slide_advanced' },
     *     { condition: { variable: 'score', operator: '>=', value: 60 }, goTo: 'slide_review' },
     *     { default: true, goTo: 'slide_remediation' }
     *   ]);
     */
    addRule(decisionPointId, rules) {
      if (!Array.isArray(rules) || rules.length === 0) {
        console.warn(`[BranchingEngine] Rules for "${decisionPointId}" must be a non-empty array.`);
        return;
      }

      this._rules.set(decisionPointId, rules);
    }

    /**
     * Add multiple rule sets at once.
     * @param {Object} ruleMap - { decisionPointId: Array<rules>, ... }
     */
    addRules(ruleMap) {
      for (const [id, rules] of Object.entries(ruleMap)) {
        this.addRule(id, rules);
      }
    }

    /**
     * Remove rules for a decision point.
     * @param {string} decisionPointId
     */
    removeRule(decisionPointId) {
      this._rules.delete(decisionPointId);
    }

    // -------------------------------------------------------------------------
    // Evaluation
    // -------------------------------------------------------------------------

    /**
     * Evaluate branching rules for a decision point and navigate.
     * Rules are evaluated top-to-bottom; the first match wins.
     *
     * @param {string} decisionPointId
     * @returns {string|null} The target slide/scene ID, or null if no match
     */
    evaluate(decisionPointId) {
      const rules = this._rules.get(decisionPointId);
      if (!rules) {
        console.warn(`[BranchingEngine] No rules for "${decisionPointId}".`);
        return null;
      }

      for (const rule of rules) {
        // Default rule always matches
        if (rule.default) {
          return this._applyBranch(decisionPointId, rule);
        }

        // Evaluate single condition
        if (rule.condition) {
          if (this._evaluateCondition(rule.condition)) {
            return this._applyBranch(decisionPointId, rule);
          }
          continue;
        }

        // Evaluate multiple conditions with AND/OR logic
        if (rule.conditions && rule.conditions.length > 0) {
          const logic = rule.conditionLogic || 'AND';
          const results = rule.conditions.map(c => this._evaluateCondition(c));
          const passed = logic === 'AND'
            ? results.every(r => r)
            : results.some(r => r);

          if (passed) {
            return this._applyBranch(decisionPointId, rule);
          }
        }
      }

      // No rule matched
      return null;
    }

    /**
     * Evaluate without navigating — just return the target.
     * Useful for previewing branching logic or building path visualizations.
     *
     * @param {string} decisionPointId
     * @returns {string|null}
     */
    peek(decisionPointId) {
      const wasAuto = this.autoNavigate;
      this.autoNavigate = false;
      const target = this.evaluate(decisionPointId);
      this.autoNavigate = wasAuto;
      return target;
    }

    // -------------------------------------------------------------------------
    // Remediation helpers
    // -------------------------------------------------------------------------

    /**
     * Create a simple remediation rule: if score < threshold, go to review.
     * This is the most common branching pattern in e-learning.
     *
     * @param {string} quizId - The quiz slide ID
     * @param {string} scoreVariable - Variable name holding the score
     * @param {number} passThreshold - Minimum passing score
     * @param {string} passTarget - Where to go on pass
     * @param {string} failTarget - Where to go on fail (remediation)
     */
    addRemediationRule(quizId, scoreVariable, passThreshold, passTarget, failTarget) {
      this.addRule(quizId, [
        {
          condition: { variable: scoreVariable, operator: '>=', value: passThreshold },
          goTo: passTarget
        },
        {
          default: true,
          goTo: failTarget
        }
      ]);
    }

    /**
     * Create a multi-tier remediation rule with graduated paths.
     *
     * @param {string} quizId
     * @param {string} scoreVariable
     * @param {Array<{ threshold: number, target: string }>} tiers
     *   Must be sorted high-to-low: [{ threshold: 80, target: 'advanced' }, ...]
     * @param {string} defaultTarget - Fallback if no tier matches
     */
    addTieredRule(quizId, scoreVariable, tiers, defaultTarget) {
      const rules = tiers.map(tier => ({
        condition: { variable: scoreVariable, operator: '>=', value: tier.threshold },
        goTo: tier.target
      }));
      rules.push({ default: true, goTo: defaultTarget });
      this.addRule(quizId, rules);
    }

    // -------------------------------------------------------------------------
    // Path analytics
    // -------------------------------------------------------------------------

    /**
     * Get the navigation path history.
     * @returns {Array<Object>} Array of { from, to, timestamp, conditions }
     */
    getPathHistory() {
      return [...this._pathHistory];
    }

    /**
     * Get a summary of all unique paths taken (for analytics).
     * @returns {Array<string>} Path descriptions like "quiz_1 → advanced_module"
     */
    getPathSummary() {
      return this._pathHistory.map(p => `${p.from} → ${p.to}`);
    }

    /**
     * Clear path history.
     */
    clearHistory() {
      this._pathHistory = [];
    }

    // -------------------------------------------------------------------------
    // Serialization
    // -------------------------------------------------------------------------

    /**
     * Serialize path history for SCORM suspend_data.
     * @returns {Array<Object>}
     */
    serialize() {
      return this._pathHistory.map(p => ({
        from: p.from,
        to: p.to,
        ts: p.timestamp
      }));
    }

    /**
     * Restore path history from serialized data.
     * @param {Array<Object>} data
     */
    deserialize(data) {
      if (!Array.isArray(data)) return;
      this._pathHistory = data.map(p => ({
        from: p.from,
        to: p.to,
        timestamp: p.ts || Date.now()
      }));
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    /**
     * Evaluate a single condition against the variable store.
     * @private
     * @param {Object} condition - { variable, operator, value }
     * @returns {boolean}
     */
    _evaluateCondition(condition) {
      if (!this._variables) {
        console.warn('[BranchingEngine] No VariableStore — cannot evaluate conditions.');
        return false;
      }

      const actual = this._variables.get(condition.variable);
      const expected = condition.value;
      const operator = condition.operator;

      // Auto-convert for numeric comparison
      const numActual = typeof actual === 'number' ? actual : Number(actual);
      const numExpected = typeof expected === 'number' ? expected : Number(expected);

      switch (operator) {
        case '==':  return actual == expected;   // eslint-disable-line eqeqeq
        case '===': return actual === expected;
        case '!=':  return actual != expected;   // eslint-disable-line eqeqeq
        case '>':   return numActual > numExpected;
        case '<':   return numActual < numExpected;
        case '>=':  return numActual >= numExpected;
        case '<=':  return numActual <= numExpected;
        case 'is':       return actual === expected;
        case 'isNot':    return actual !== expected;
        case 'contains': return String(actual).includes(String(expected));
        case 'isTrue':   return actual === true || actual === 'true';
        case 'isFalse':  return actual === false || actual === 'false';
        default:
          console.warn(`[BranchingEngine] Unknown operator: "${operator}"`);
          return false;
      }
    }

    /**
     * Apply a matching branch rule — record history and navigate.
     * @private
     * @param {string} decisionPointId
     * @param {Object} rule
     * @returns {string} The target
     */
    _applyBranch(decisionPointId, rule) {
      const target = rule.goTo;

      // Record in path history for analytics
      this._pathHistory.push({
        from: decisionPointId,
        to: target,
        timestamp: Date.now()
      });

      // Execute any additional action attached to the rule
      if (rule.action) {
        document.dispatchEvent(new CustomEvent('scorm:branchAction', {
          detail: rule.action
        }));
      }

      // Navigate if autoNavigate is enabled
      if (this.autoNavigate && target) {
        document.dispatchEvent(new CustomEvent('scorm:navigate', {
          detail: { target }
        }));
      }

      // Dispatch branching event for analytics/logging
      document.dispatchEvent(new CustomEvent('scorm:branch', {
        detail: {
          from: decisionPointId,
          to: target,
          rule: { condition: rule.condition, default: rule.default }
        }
      }));

      return target;
    }
  }

  // Expose globally
  window.BranchingEngine = BranchingEngine;

})();
