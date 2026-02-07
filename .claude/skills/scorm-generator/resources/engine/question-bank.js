/**
 * SCORM Content Studio — Question Bank
 * ======================================
 * Manages pools of questions with random draw, answer shuffling,
 * duplicate prevention across attempts, and seeded randomization.
 *
 * Equivalent to Storyline 360's Question Banks feature — define a
 * pool, draw N random questions, shuffle answer order, and ensure
 * reproducibility with seeded random for the same learner.
 *
 * Usage:
 *   const bank = new QuestionBank();
 *
 *   // Define a pool of questions
 *   bank.addPool('module-1-quiz', [
 *     { id: 'q1', stem: 'What is 2+2?', options: [...], correct: 'c' },
 *     { id: 'q2', stem: 'What color?',   options: [...], correct: 'a' },
 *     { id: 'q3', stem: 'Capital of?',   options: [...], correct: 'b' },
 *     { id: 'q4', stem: 'Year of?',      options: [...], correct: 'd' },
 *     { id: 'q5', stem: 'Who said?',     options: [...], correct: 'a' }
 *   ]);
 *
 *   // Draw 3 random questions with shuffled answers
 *   const quiz = bank.draw('module-1-quiz', 3, { shuffle: true });
 *
 *   // On retry, get different questions (no duplicates from last attempt)
 *   const retryQuiz = bank.draw('module-1-quiz', 3, { avoidPrevious: true });
 *
 * @version 1.0.0
 */

(function () {
  'use strict';

  /**
   * @class QuestionBank
   * @description Manages question pools with randomization, shuffling,
   *              and attempt tracking for assessment integrity.
   */
  class QuestionBank {
    constructor() {
      /**
       * Question pools.
       * Map<poolName, Array<QuestionDef>>
       *
       * QuestionDef shape:
       * {
       *   id: string,
       *   stem: string,
       *   type: string,  // 'mc', 'tf', 'multi', 'fill', 'numeric', etc.
       *   options: Array<{ id: string, text: string }>,
       *   correct: string|string[],  // correct option id(s)
       *   feedback: { correct: string, incorrect: string },
       *   points: number,
       *   tags: string[]  // optional categories for weighted draws
       * }
       */
      this._pools = new Map();

      /**
       * History of previously drawn question IDs per pool.
       * Used for avoidPrevious logic across attempts.
       * Map<poolName, Set<string>>
       */
      this._history = new Map();

      /**
       * Random seed for reproducible draws.
       * Same learner gets the same set on retry if seed is set.
       * @type {number|null}
       */
      this._seed = null;
    }

    // -------------------------------------------------------------------------
    // Pool management
    // -------------------------------------------------------------------------

    /**
     * Add a question pool.
     * @param {string} poolName - Unique name for this pool
     * @param {Array<Object>} questions - Array of question definitions
     */
    addPool(poolName, questions) {
      if (!Array.isArray(questions) || questions.length === 0) {
        console.warn(`[QuestionBank] Pool "${poolName}" must have at least one question.`);
        return;
      }

      // Validate each question has at minimum an id and stem
      const validated = questions.filter(q => {
        if (!q.id || !q.stem) {
          console.warn('[QuestionBank] Skipping question missing id or stem:', q);
          return false;
        }
        return true;
      });

      this._pools.set(poolName, validated);
      // Initialize empty history for this pool
      if (!this._history.has(poolName)) {
        this._history.set(poolName, new Set());
      }
    }

    /**
     * Get the total number of questions in a pool.
     * @param {string} poolName
     * @returns {number}
     */
    getPoolSize(poolName) {
      const pool = this._pools.get(poolName);
      return pool ? pool.length : 0;
    }

    /**
     * Get all pool names.
     * @returns {string[]}
     */
    getPoolNames() {
      return Array.from(this._pools.keys());
    }

    // -------------------------------------------------------------------------
    // Random draw
    // -------------------------------------------------------------------------

    /**
     * Draw N random questions from a pool.
     *
     * @param {string} poolName - Which pool to draw from
     * @param {number} count - How many questions to draw
     * @param {Object} [options]
     * @param {boolean} [options.shuffle=false] - Shuffle answer order within each question
     * @param {boolean} [options.avoidPrevious=false] - Avoid questions drawn in the last attempt
     * @param {number} [options.seed] - Seed for reproducible random (e.g., learner ID hash)
     * @param {string[]} [options.tags] - Only draw questions with these tags
     * @returns {Array<Object>} Array of question objects with shuffled options (if enabled)
     */
    draw(poolName, count, options = {}) {
      const pool = this._pools.get(poolName);
      if (!pool) {
        console.warn(`[QuestionBank] Pool "${poolName}" not found.`);
        return [];
      }

      // Set seed for this draw if provided
      if (options.seed !== undefined) {
        this._seed = options.seed;
      }

      // Filter by tags if specified
      let candidates = pool;
      if (options.tags && options.tags.length > 0) {
        candidates = pool.filter(q =>
          q.tags && q.tags.some(t => options.tags.includes(t))
        );
      }

      // Filter out previously drawn questions if requested
      if (options.avoidPrevious) {
        const history = this._history.get(poolName) || new Set();
        const filtered = candidates.filter(q => !history.has(q.id));

        // If we filtered too many, fall back to full pool
        // (this prevents infinite loops when pool is small)
        if (filtered.length >= count) {
          candidates = filtered;
        }
      }

      // Clamp count to available questions
      const drawCount = Math.min(count, candidates.length);

      // Shuffle candidates and take the first N
      const shuffled = this._shuffleArray([...candidates]);
      const drawn = shuffled.slice(0, drawCount);

      // Record this draw in history
      const history = this._history.get(poolName) || new Set();
      // Clear previous history and record new draw
      history.clear();
      drawn.forEach(q => history.add(q.id));
      this._history.set(poolName, history);

      // Deep-copy and optionally shuffle answer options
      const result = drawn.map(q => {
        const copy = JSON.parse(JSON.stringify(q));
        if (options.shuffle && copy.options && copy.options.length > 1) {
          copy.options = this._shuffleArray(copy.options);
        }
        return copy;
      });

      return result;
    }

    /**
     * Get all questions from a pool (no randomization).
     * Useful for review mode.
     * @param {string} poolName
     * @returns {Array<Object>}
     */
    getAll(poolName) {
      const pool = this._pools.get(poolName);
      if (!pool) return [];
      return JSON.parse(JSON.stringify(pool));
    }

    // -------------------------------------------------------------------------
    // Seeded random
    // -------------------------------------------------------------------------

    /**
     * Set a seed for reproducible random draws.
     * Same seed = same question order. Useful for giving the same
     * learner the same quiz on retry.
     *
     * @param {number|string} seed - A number or string to hash
     */
    setSeed(seed) {
      if (typeof seed === 'string') {
        // Simple string hash
        this._seed = this._hashString(seed);
      } else {
        this._seed = seed;
      }
    }

    /**
     * Clear the seed (return to true random).
     */
    clearSeed() {
      this._seed = null;
    }

    // -------------------------------------------------------------------------
    // History management
    // -------------------------------------------------------------------------

    /**
     * Clear draw history for a pool (allow all questions again).
     * @param {string} poolName
     */
    clearHistory(poolName) {
      if (this._history.has(poolName)) {
        this._history.get(poolName).clear();
      }
    }

    /**
     * Clear all draw history across all pools.
     */
    clearAllHistory() {
      for (const [, history] of this._history) {
        history.clear();
      }
    }

    // -------------------------------------------------------------------------
    // Serialization
    // -------------------------------------------------------------------------

    /**
     * Serialize draw history for SCORM suspend_data.
     * @returns {Object} { poolName: [questionId, ...], ... }
     */
    serialize() {
      const data = {};
      for (const [poolName, history] of this._history) {
        if (history.size > 0) {
          data[poolName] = Array.from(history);
        }
      }
      return data;
    }

    /**
     * Restore draw history from serialized data.
     * @param {Object} data - { poolName: [questionId, ...], ... }
     */
    deserialize(data) {
      if (!data || typeof data !== 'object') return;

      for (const [poolName, ids] of Object.entries(data)) {
        if (Array.isArray(ids)) {
          this._history.set(poolName, new Set(ids));
        }
      }
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    /**
     * Shuffle an array using Fisher-Yates algorithm.
     * Uses seeded random if a seed is set, otherwise Math.random().
     * @private
     * @param {Array} array
     * @returns {Array} A new shuffled array
     */
    _shuffleArray(array) {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(this._random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    /**
     * Generate a random number between 0 and 1.
     * If a seed is set, uses a seeded PRNG (mulberry32).
     * Otherwise uses Math.random().
     * @private
     * @returns {number}
     */
    _random() {
      if (this._seed !== null) {
        // Mulberry32 — a fast, good-quality 32-bit PRNG
        this._seed = (this._seed + 0x6D2B79F5) | 0;
        let t = Math.imul(this._seed ^ (this._seed >>> 15), 1 | this._seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      }
      return Math.random();
    }

    /**
     * Simple string hash for seeding.
     * @private
     * @param {string} str
     * @returns {number}
     */
    _hashString(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash | 0; // Convert to 32-bit integer
      }
      return Math.abs(hash);
    }
  }

  // Expose globally
  window.QuestionBank = QuestionBank;

})();
