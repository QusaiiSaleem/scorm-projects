/**
 * SCORM Content Studio — Quiz Engine
 * ====================================
 * Central quiz logic that manages ALL question types, attempt tracking,
 * feedback, review mode, retry, and SCORM interaction reporting.
 *
 * Usage:
 *   const quiz = new QuizEngine({
 *     questions: [...],          // Array of question config objects
 *     maxAttempts: 2,            // Global max attempts per question (1 = no retry)
 *     passingScore: 70,          // Percentage to pass
 *     graded: true,              // false = knowledge check (no SCORM score)
 *     shuffleOptions: false,     // Randomize option order
 *     showCorrectOnFail: true,   // Reveal correct answer after final attempt
 *     onComplete: function(results) { ... },
 *     onQuestionAnswer: function(questionIndex, isCorrect) { ... }
 *   });
 *
 * Question Config format:
 *   {
 *     id: 'q1',
 *     type: 'multiple-choice' | 'multiple-response' | 'true-false' |
 *           'fill-blank' | 'numeric' | 'matching' | 'sequencing',
 *     stem: 'Question text here',
 *     options: [...],            // For choice-based questions
 *     correctAnswer: 'b',       // For single-answer questions
 *     correctAnswers: ['a','c'],// For multi-answer questions
 *     acceptableAnswers: [...], // For fill-blank (up to 10 variations)
 *     caseSensitive: false,     // For fill-blank
 *     exactValue: 42,           // For numeric
 *     tolerance: 0.5,           // For numeric (+/-)
 *     rangeMin: null,           // For numeric range
 *     rangeMax: null,           // For numeric range
 *     points: 10,               // Points value for this question
 *     partialCredit: false,     // For multiple-response
 *     maxAttempts: null,        // Per-question override (null = use global)
 *     feedback: {
 *       correct: 'Great work! You got it.',
 *       incorrect: 'Not quite yet — keep learning!',
 *       tryAgain: 'Almost there — give it another try!',
 *       byChoice: { a: 'Hint for choice A', b: 'Hint for choice B' }
 *     }
 *   }
 */

(function () {
  'use strict';

  // =========================================================================
  // QuizEngine Class
  // =========================================================================

  function QuizEngine(options) {
    options = options || {};

    this.questions = options.questions || [];
    this.maxAttempts = options.maxAttempts || 1;
    this.passingScore = options.passingScore || 70;
    this.graded = options.graded !== false; // default true
    this.shuffleOptions = options.shuffleOptions || false;
    this.showCorrectOnFail = options.showCorrectOnFail !== false; // default true
    this.onComplete = options.onComplete || null;
    this.onQuestionAnswer = options.onQuestionAnswer || null;

    // Internal state
    this.currentQuestionIndex = 0;
    this.questionStates = [];
    this.isReviewMode = false;
    this.isCompleted = false;
    this.startTime = Date.now();

    // Initialize question states
    this._initQuestionStates();

    // Shuffle options if requested
    if (this.shuffleOptions) {
      this._shuffleAllOptions();
    }
  }

  // =========================================================================
  // Initialization
  // =========================================================================

  /**
   * Build internal state for each question: attempts remaining,
   * learner response, correctness, timestamps, etc.
   */
  QuizEngine.prototype._initQuestionStates = function () {
    this.questionStates = [];
    for (var i = 0; i < this.questions.length; i++) {
      var q = this.questions[i];
      this.questionStates.push({
        questionId: q.id,
        attemptsRemaining: q.maxAttempts || this.maxAttempts,
        attemptsUsed: 0,
        learnerResponse: null,
        isCorrect: null,       // null = unanswered, true/false after attempt
        isLocked: false,       // true when no more attempts or answered correctly
        pointsEarned: 0,
        startTime: null,
        endTime: null
      });
    }
  };

  /**
   * Randomize option order for all choice-based questions.
   * Preserves option IDs so correctAnswer mapping still works.
   */
  QuizEngine.prototype._shuffleAllOptions = function () {
    for (var i = 0; i < this.questions.length; i++) {
      var q = this.questions[i];
      if (q.options && q.options.length > 0) {
        q.options = this._shuffleArray(q.options.slice());
      }
    }
  };

  /**
   * Fisher-Yates shuffle (unbiased).
   */
  QuizEngine.prototype._shuffleArray = function (arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  };

  // =========================================================================
  // Answering Questions
  // =========================================================================

  /**
   * Submit an answer for the current question.
   * Returns a result object: { isCorrect, feedback, feedbackType, isLocked, attemptsRemaining }
   *
   * feedbackType: 'correct' | 'incorrect' | 'tryAgain'
   *
   * @param {*} response — The learner's answer. Format depends on question type:
   *   - multiple-choice:    string (option id, e.g. 'b')
   *   - multiple-response:  array of strings (['a', 'c'])
   *   - true-false:         string ('true' or 'false')
   *   - fill-blank:         string (typed text)
   *   - numeric:            number
   *   - matching:           object { 'item1': 'targetA', 'item2': 'targetB' }
   *   - sequencing:         array of item ids in learner's order
   */
  QuizEngine.prototype.submitAnswer = function (response) {
    var index = this.currentQuestionIndex;
    var question = this.questions[index];
    var state = this.questionStates[index];

    // Guard: already locked (answered correctly or out of attempts)
    if (state.isLocked) {
      return {
        isCorrect: state.isCorrect,
        feedback: question.feedback ? question.feedback.correct : '',
        feedbackType: state.isCorrect ? 'correct' : 'incorrect',
        isLocked: true,
        attemptsRemaining: 0
      };
    }

    // Record start time on first attempt
    if (!state.startTime) {
      state.startTime = Date.now();
    }

    // Evaluate correctness
    var isCorrect = this._evaluate(question, response);

    // Update state
    state.attemptsUsed++;
    state.attemptsRemaining--;
    state.learnerResponse = response;
    state.isCorrect = isCorrect;
    state.endTime = Date.now();

    // Determine feedback type
    var feedbackType;
    var feedbackText = '';

    if (isCorrect) {
      feedbackType = 'correct';
      state.isLocked = true;
      state.pointsEarned = this._calculateQuestionPoints(question, response);
      feedbackText = (question.feedback && question.feedback.correct) ||
        'Excellent work! You got it right.';
    } else if (state.attemptsRemaining > 0) {
      feedbackType = 'tryAgain';
      feedbackText = (question.feedback && question.feedback.tryAgain) ||
        'Not yet \u2014 you\'re learning! Give it another try.';
    } else {
      feedbackType = 'incorrect';
      state.isLocked = true;
      state.pointsEarned = 0;
      feedbackText = (question.feedback && question.feedback.incorrect) ||
        'Not quite this time \u2014 but every attempt is a step forward!';
    }

    // Fire per-question callback
    if (this.onQuestionAnswer) {
      this.onQuestionAnswer(index, isCorrect, feedbackType);
    }

    return {
      isCorrect: isCorrect,
      feedback: feedbackText,
      feedbackType: feedbackType,
      isLocked: state.isLocked,
      attemptsRemaining: state.attemptsRemaining,
      pointsEarned: state.pointsEarned
    };
  };

  // =========================================================================
  // Evaluation Logic (per question type)
  // =========================================================================

  /**
   * Route to the correct evaluator based on question.type.
   */
  QuizEngine.prototype._evaluate = function (question, response) {
    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
        return this._evaluateChoice(question, response);

      case 'multiple-response':
        return this._evaluateMultipleResponse(question, response);

      case 'fill-blank':
        return this._evaluateFillBlank(question, response);

      case 'numeric':
        return this._evaluateNumeric(question, response);

      case 'matching':
        return this._evaluateMatching(question, response);

      case 'sequencing':
        return this._evaluateSequencing(question, response);

      default:
        // Fallback: simple string comparison
        return String(response) === String(question.correctAnswer);
    }
  };

  /**
   * Single-select: compare learner response to correctAnswer string.
   */
  QuizEngine.prototype._evaluateChoice = function (question, response) {
    return String(response).toLowerCase() === String(question.correctAnswer).toLowerCase();
  };

  /**
   * Multi-select: learner must select ALL correct AND NONE incorrect.
   */
  QuizEngine.prototype._evaluateMultipleResponse = function (question, response) {
    if (!Array.isArray(response) || !Array.isArray(question.correctAnswers)) {
      return false;
    }

    var correct = question.correctAnswers.slice().sort();
    var learner = response.slice().sort();

    // For exact match (no partial credit by default)
    if (correct.length !== learner.length) return false;
    for (var i = 0; i < correct.length; i++) {
      if (correct[i] !== learner[i]) return false;
    }
    return true;
  };

  /**
   * Fill-in-the-blank: compare against an array of acceptable answers.
   * Supports case-sensitive toggle and whitespace trimming.
   */
  QuizEngine.prototype._evaluateFillBlank = function (question, response) {
    if (typeof response !== 'string') return false;

    var learner = response.trim();
    var caseSensitive = question.caseSensitive || false;
    var acceptable = question.acceptableAnswers || [];

    // Also check correctAnswer as a fallback
    if (question.correctAnswer) {
      acceptable = acceptable.concat([question.correctAnswer]);
    }

    for (var i = 0; i < acceptable.length; i++) {
      var answer = String(acceptable[i]).trim();
      if (caseSensitive) {
        if (learner === answer) return true;
      } else {
        if (learner.toLowerCase() === answer.toLowerCase()) return true;
      }
    }
    return false;
  };

  /**
   * Numeric: check exact value, range, or tolerance.
   */
  QuizEngine.prototype._evaluateNumeric = function (question, response) {
    var num = parseFloat(response);
    if (isNaN(num)) return false;

    // Range check
    if (question.rangeMin != null && question.rangeMax != null) {
      return num >= question.rangeMin && num <= question.rangeMax;
    }

    // Tolerance check
    if (question.exactValue != null) {
      var tolerance = question.tolerance || 0;
      return Math.abs(num - question.exactValue) <= tolerance;
    }

    return false;
  };

  /**
   * Matching: each key in learner's response must map to the correct target.
   * question.correctAnswer = { 'item1': 'targetA', 'item2': 'targetB', ... }
   */
  QuizEngine.prototype._evaluateMatching = function (question, response) {
    if (typeof response !== 'object' || typeof question.correctAnswer !== 'object') {
      return false;
    }

    var correct = question.correctAnswer;
    var keys = Object.keys(correct);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (String(response[key]) !== String(correct[key])) {
        return false;
      }
    }
    return true;
  };

  /**
   * Sequencing: learner's array must match correct order exactly.
   * question.correctAnswer = ['item3', 'item1', 'item2']
   */
  QuizEngine.prototype._evaluateSequencing = function (question, response) {
    if (!Array.isArray(response) || !Array.isArray(question.correctAnswer)) {
      return false;
    }
    if (response.length !== question.correctAnswer.length) return false;

    for (var i = 0; i < response.length; i++) {
      if (String(response[i]) !== String(question.correctAnswer[i])) {
        return false;
      }
    }
    return true;
  };

  // =========================================================================
  // Points & Scoring
  // =========================================================================

  /**
   * Calculate points earned for a single question.
   * Supports partial credit for multiple-response.
   */
  QuizEngine.prototype._calculateQuestionPoints = function (question, response) {
    var maxPoints = question.points || 10;

    // Partial credit for multiple-response
    if (question.type === 'multiple-response' && question.partialCredit) {
      if (!Array.isArray(response) || !Array.isArray(question.correctAnswers)) {
        return 0;
      }
      var correctSet = question.correctAnswers;
      var correctCount = 0;
      var incorrectCount = 0;

      for (var i = 0; i < response.length; i++) {
        if (correctSet.indexOf(response[i]) >= 0) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      }

      // Partial credit formula: (correct - incorrect) / total, min 0
      var partial = Math.max(0, correctCount - incorrectCount) / correctSet.length;
      return Math.round(partial * maxPoints);
    }

    // Binary scoring: full points or zero
    return maxPoints;
  };

  /**
   * Get overall quiz results.
   * Returns: { rawScore, maxScore, scaledScore, percentage, passed, questionResults }
   */
  QuizEngine.prototype.getResults = function () {
    var rawScore = 0;
    var maxScore = 0;
    var questionResults = [];

    for (var i = 0; i < this.questions.length; i++) {
      var q = this.questions[i];
      var state = this.questionStates[i];
      var maxPts = q.points || 10;

      rawScore += state.pointsEarned;
      maxScore += maxPts;

      questionResults.push({
        questionId: q.id,
        type: q.type,
        stem: q.stem,
        isCorrect: state.isCorrect,
        learnerResponse: state.learnerResponse,
        pointsEarned: state.pointsEarned,
        maxPoints: maxPts,
        attemptsUsed: state.attemptsUsed
      });
    }

    var percentage = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;
    var scaledScore = maxScore > 0 ? (rawScore / maxScore) : 0;

    return {
      rawScore: rawScore,
      maxScore: maxScore,
      scaledScore: scaledScore,
      percentage: percentage,
      passed: percentage >= this.passingScore,
      questionCount: this.questions.length,
      correctCount: questionResults.filter(function (r) { return r.isCorrect === true; }).length,
      questionResults: questionResults,
      elapsedTime: Date.now() - this.startTime
    };
  };

  // =========================================================================
  // Navigation
  // =========================================================================

  /**
   * Move to the next question. Returns false if already at the end.
   */
  QuizEngine.prototype.nextQuestion = function () {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      return true;
    }
    return false;
  };

  /**
   * Move to the previous question. Returns false if already at the start.
   */
  QuizEngine.prototype.prevQuestion = function () {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      return true;
    }
    return false;
  };

  /**
   * Jump to a specific question by index.
   */
  QuizEngine.prototype.goToQuestion = function (index) {
    if (index >= 0 && index < this.questions.length) {
      this.currentQuestionIndex = index;
      return true;
    }
    return false;
  };

  /**
   * Get the current question config and state.
   */
  QuizEngine.prototype.getCurrentQuestion = function () {
    return {
      question: this.questions[this.currentQuestionIndex],
      state: this.questionStates[this.currentQuestionIndex],
      index: this.currentQuestionIndex,
      total: this.questions.length
    };
  };

  // =========================================================================
  // Complete Quiz
  // =========================================================================

  /**
   * Mark the quiz as complete. Calculates final score and fires onComplete.
   * Should be called when the learner finishes all questions or clicks "Finish".
   */
  QuizEngine.prototype.complete = function () {
    if (this.isCompleted) return this.getResults();

    this.isCompleted = true;
    var results = this.getResults();

    if (this.onComplete) {
      this.onComplete(results);
    }

    return results;
  };

  // =========================================================================
  // Review Mode
  // =========================================================================

  /**
   * Enter review mode. Locks all questions and resets to question 0.
   * In review mode, the UI should show correct/incorrect indicators
   * and optionally reveal the correct answer.
   */
  QuizEngine.prototype.startReview = function () {
    this.isReviewMode = true;
    this.currentQuestionIndex = 0;

    // Lock all questions (prevent further changes)
    for (var i = 0; i < this.questionStates.length; i++) {
      this.questionStates[i].isLocked = true;
    }
  };

  /**
   * Exit review mode.
   */
  QuizEngine.prototype.endReview = function () {
    this.isReviewMode = false;
  };

  /**
   * Get review data for the current question: the learner's response,
   * whether it was correct, and what the correct answer is.
   */
  QuizEngine.prototype.getReviewData = function () {
    var q = this.questions[this.currentQuestionIndex];
    var state = this.questionStates[this.currentQuestionIndex];

    return {
      question: q,
      state: state,
      correctAnswer: q.correctAnswer || q.correctAnswers || null,
      learnerResponse: state.learnerResponse,
      isCorrect: state.isCorrect,
      showCorrect: this.showCorrectOnFail
    };
  };

  // =========================================================================
  // Retry
  // =========================================================================

  /**
   * Reset all quiz state and restart from question 0.
   * Used by the "Retry Quiz" button on the result slide.
   */
  QuizEngine.prototype.retry = function () {
    this.currentQuestionIndex = 0;
    this.isCompleted = false;
    this.isReviewMode = false;
    this.startTime = Date.now();
    this._initQuestionStates();

    if (this.shuffleOptions) {
      this._shuffleAllOptions();
    }
  };

  // =========================================================================
  // SCORM Interaction Reporting Helpers
  // =========================================================================

  /**
   * Generate SCORM cmi.interactions data for all answered questions.
   * Returns an array of interaction objects ready for SCORM API calls.
   *
   * Each object:
   *   { id, type, description, learner_response, correct_responses, result, latency, weighting }
   *
   * SCORM 1.2 interaction types:
   *   true-false, choice, fill-in, matching, sequencing, numeric, other
   */
  QuizEngine.prototype.getSCORMInteractions = function () {
    var interactions = [];

    for (var i = 0; i < this.questions.length; i++) {
      var q = this.questions[i];
      var state = this.questionStates[i];

      // Skip unanswered questions
      if (state.learnerResponse === null) continue;

      var interaction = {
        id: q.id || ('q' + i),
        type: this._getSCORMType(q.type),
        description: q.stem || '',
        learner_response: this._formatSCORMResponse(q.type, state.learnerResponse),
        correct_responses: this._formatSCORMCorrect(q),
        result: state.isCorrect ? 'correct' : 'wrong',
        latency: this._formatSCORMLatency(state.startTime, state.endTime),
        weighting: q.points || 10
      };

      interactions.push(interaction);
    }

    return interactions;
  };

  /**
   * Map our question types to SCORM interaction types.
   */
  QuizEngine.prototype._getSCORMType = function (type) {
    var map = {
      'multiple-choice': 'choice',
      'multiple-response': 'choice',
      'true-false': 'true-false',
      'fill-blank': 'fill-in',
      'numeric': 'numeric',
      'matching': 'matching',
      'sequencing': 'sequencing'
    };
    return map[type] || 'other';
  };

  /**
   * Format the learner's response for SCORM reporting.
   * SCORM 1.2 uses comma-separated values for multi-select.
   */
  QuizEngine.prototype._formatSCORMResponse = function (type, response) {
    if (response === null || response === undefined) return '';

    switch (type) {
      case 'multiple-response':
        return Array.isArray(response) ? response.join(',') : String(response);

      case 'matching':
        if (typeof response === 'object') {
          var pairs = [];
          var keys = Object.keys(response);
          for (var i = 0; i < keys.length; i++) {
            pairs.push(keys[i] + '.' + response[keys[i]]);
          }
          return pairs.join(',');
        }
        return '';

      case 'sequencing':
        return Array.isArray(response) ? response.join(',') : String(response);

      default:
        return String(response);
    }
  };

  /**
   * Format the correct response pattern for SCORM.
   */
  QuizEngine.prototype._formatSCORMCorrect = function (question) {
    switch (question.type) {
      case 'multiple-response':
        return Array.isArray(question.correctAnswers)
          ? question.correctAnswers.join(',')
          : '';

      case 'fill-blank':
        // Return all acceptable answers separated by commas
        var answers = question.acceptableAnswers || [];
        if (question.correctAnswer) answers = [question.correctAnswer].concat(answers);
        return answers.join(',');

      case 'numeric':
        if (question.rangeMin != null && question.rangeMax != null) {
          return question.rangeMin + ':' + question.rangeMax;
        }
        if (question.exactValue != null) {
          var tol = question.tolerance || 0;
          if (tol > 0) {
            return (question.exactValue - tol) + ':' + (question.exactValue + tol);
          }
          return String(question.exactValue);
        }
        return '';

      case 'matching':
        if (typeof question.correctAnswer === 'object') {
          var pairs = [];
          var keys = Object.keys(question.correctAnswer);
          for (var i = 0; i < keys.length; i++) {
            pairs.push(keys[i] + '.' + question.correctAnswer[keys[i]]);
          }
          return pairs.join(',');
        }
        return '';

      case 'sequencing':
        return Array.isArray(question.correctAnswer)
          ? question.correctAnswer.join(',')
          : '';

      default:
        return String(question.correctAnswer || '');
    }
  };

  /**
   * Format latency as SCORM 1.2 CMITimespan: HH:MM:SS.SS
   */
  QuizEngine.prototype._formatSCORMLatency = function (start, end) {
    if (!start || !end) return '00:00:00';

    var ms = end - start;
    var totalSeconds = Math.floor(ms / 1000);
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    return this._pad(hours) + ':' + this._pad(minutes) + ':' + this._pad(seconds);
  };

  QuizEngine.prototype._pad = function (n) {
    return n < 10 ? '0' + n : String(n);
  };

  // =========================================================================
  // State Serialization (for suspend_data)
  // =========================================================================

  /**
   * Serialize the quiz state into a compact JSON string for SCORM suspend_data.
   * This allows learners to leave and return, resuming where they left off.
   */
  QuizEngine.prototype.serialize = function () {
    var data = {
      ci: this.currentQuestionIndex,  // current index
      done: this.isCompleted,
      st: this.startTime,
      qs: []                          // question states (compact)
    };

    for (var i = 0; i < this.questionStates.length; i++) {
      var s = this.questionStates[i];
      data.qs.push({
        ar: s.attemptsRemaining,
        au: s.attemptsUsed,
        lr: s.learnerResponse,
        ic: s.isCorrect,
        lk: s.isLocked,
        pe: s.pointsEarned
      });
    }

    return JSON.stringify(data);
  };

  /**
   * Restore quiz state from a previously serialized string.
   * Call this after construction to resume a saved quiz.
   */
  QuizEngine.prototype.deserialize = function (jsonString) {
    if (!jsonString) return false;

    try {
      var data = JSON.parse(jsonString);

      this.currentQuestionIndex = data.ci || 0;
      this.isCompleted = data.done || false;
      this.startTime = data.st || Date.now();

      if (data.qs && Array.isArray(data.qs)) {
        for (var i = 0; i < data.qs.length && i < this.questionStates.length; i++) {
          var saved = data.qs[i];
          var state = this.questionStates[i];
          state.attemptsRemaining = saved.ar;
          state.attemptsUsed = saved.au;
          state.learnerResponse = saved.lr;
          state.isCorrect = saved.ic;
          state.isLocked = saved.lk;
          state.pointsEarned = saved.pe;
        }
      }

      return true;
    } catch (e) {
      // If parsing fails, start fresh (never crash on bad data)
      return false;
    }
  };

  // =========================================================================
  // Utility: get question by ID
  // =========================================================================

  QuizEngine.prototype.getQuestionById = function (id) {
    for (var i = 0; i < this.questions.length; i++) {
      if (this.questions[i].id === id) {
        return {
          question: this.questions[i],
          state: this.questionStates[i],
          index: i
        };
      }
    }
    return null;
  };

  // =========================================================================
  // Expose globally
  // =========================================================================

  window.QuizEngine = QuizEngine;

})();
