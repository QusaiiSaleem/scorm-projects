/**
 * Gamification Components for SCORM E-Learning
 *
 * Provides points, progress tracking, celebrations, streaks,
 * and growth mindset feedback for learner motivation.
 *
 * No external dependencies. Works with SCORM 1.2 and 2004.
 *
 * Usage:
 *   const gamification = new GamificationEngine(scormWrapper);
 *   gamification.init();
 *   gamification.awardPoints(10, 'Completed section');
 *   gamification.showFeedback('correct');
 *   gamification.celebrate('section');
 *
 * Points System:
 *   - Section complete: 10 pts
 *   - Quiz correct answer: 10 pts
 *   - Streak bonus (3+ correct): 5 pts
 *   - Lesson complete: 25 pts
 *   - Module complete: 50 pts
 *
 * Based on research from:
 *   - Self-Determination Theory (autonomy, competence, relatedness)
 *   - Growth Mindset (Carol Dweck)
 *   - Flow theory (optimal challenge level)
 */

(function(global) {
  'use strict';

  // =========================================================
  // CONFIGURATION
  // =========================================================

  var POINTS = {
    SECTION_COMPLETE: 10,
    QUIZ_CORRECT: 10,
    STREAK_BONUS: 5,
    STREAK_THRESHOLD: 3,
    LESSON_COMPLETE: 25,
    MODULE_COMPLETE: 50
  };

  var FEEDBACK = {
    correct: [
      "Great work! You're building mastery.",
      "Exactly right! Your understanding is growing.",
      "Correct! You're making real progress.",
      "Well done! That shows solid understanding.",
      "Perfect! Keep building on this momentum."
    ],
    incorrect: [
      "Not yet - but you're learning! Here's why...",
      "Almost there! Let's look at this together...",
      "Good effort! The correct answer helps us learn...",
      "This is a tricky one. Here's the key insight...",
      "Not quite, but struggling is part of learning!"
    ],
    retry: [
      "Coming back to try again shows real persistence!",
      "Great growth mindset - trying again is how we improve!",
      "Welcome back! Each attempt strengthens your understanding.",
      "Retrying is a sign of a dedicated learner!"
    ],
    streak: [
      "You're on fire! {count} correct in a row!",
      "Amazing streak! {count} consecutive correct answers!",
      "{count} in a row! You're really mastering this!"
    ],
    sectionComplete: [
      "Section complete! You earned {points} points.",
      "Nice work finishing this section! +{points} points."
    ],
    lessonComplete: [
      "Lesson complete! You've earned {points} points total.",
      "Another lesson mastered! Total: {points} points."
    ],
    moduleComplete: [
      "Module complete! Outstanding work!",
      "You've finished the entire module - impressive dedication!"
    ]
  };

  // =========================================================
  // GAMIFICATION ENGINE CLASS
  // =========================================================

  /**
   * @constructor
   * @param {object} scormApi - Reference to the SCORM API wrapper
   */
  function GamificationEngine(scormApi) {
    this.scorm = scormApi;
    this.state = {
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      sectionsCompleted: 0,
      lessonsCompleted: 0,
      modulesCompleted: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      pointsHistory: []
    };
    this.uiElements = {};
    this.celebrationTimeout = null;
  }

  // =========================================================
  // INITIALIZATION
  // =========================================================

  /**
   * Initialize the gamification system.
   * Restores state from SCORM and renders UI components.
   */
  GamificationEngine.prototype.init = function() {
    this._restoreState();
    this._renderUI();
    return this;
  };

  // =========================================================
  // POINTS SYSTEM
  // =========================================================

  /**
   * Award points to the learner.
   * @param {number} points - Number of points to award
   * @param {string} reason - Reason for the points (for display)
   */
  GamificationEngine.prototype.awardPoints = function(points, reason) {
    this.state.totalPoints += points;
    this.state.pointsHistory.push({
      amount: points,
      reason: reason || '',
      timestamp: Date.now()
    });

    // Keep history manageable
    if (this.state.pointsHistory.length > 50) {
      this.state.pointsHistory = this.state.pointsHistory.slice(-50);
    }

    this._updatePointsDisplay();
    this._showPointsAnimation(points);
    this._saveState();
  };

  /**
   * Record a quiz answer and manage streaks.
   * @param {boolean} isCorrect - Whether the answer was correct
   * @returns {object} - Points awarded and streak info
   */
  GamificationEngine.prototype.recordAnswer = function(isCorrect) {
    this.state.totalAnswers += 1;
    var pointsAwarded = 0;
    var streakBonus = false;

    if (isCorrect) {
      this.state.correctAnswers += 1;
      this.state.currentStreak += 1;

      // Base points for correct answer
      pointsAwarded = POINTS.QUIZ_CORRECT;
      this.awardPoints(POINTS.QUIZ_CORRECT, 'Correct answer');

      // Streak bonus
      if (this.state.currentStreak >= POINTS.STREAK_THRESHOLD &&
          this.state.currentStreak % POINTS.STREAK_THRESHOLD === 0) {
        pointsAwarded += POINTS.STREAK_BONUS;
        this.awardPoints(POINTS.STREAK_BONUS, 'Streak bonus');
        streakBonus = true;
      }

      // Update longest streak
      if (this.state.currentStreak > this.state.longestStreak) {
        this.state.longestStreak = this.state.currentStreak;
      }
    } else {
      // Reset streak on incorrect
      this.state.currentStreak = 0;
    }

    this._updateStreakDisplay();
    this._saveState();

    return {
      pointsAwarded: pointsAwarded,
      currentStreak: this.state.currentStreak,
      streakBonus: streakBonus
    };
  };

  /**
   * Mark a section as complete and award points.
   */
  GamificationEngine.prototype.completeSection = function() {
    this.state.sectionsCompleted += 1;
    this.awardPoints(POINTS.SECTION_COMPLETE, 'Section complete');
  };

  /**
   * Mark a lesson as complete and award points.
   */
  GamificationEngine.prototype.completeLesson = function() {
    this.state.lessonsCompleted += 1;
    this.awardPoints(POINTS.LESSON_COMPLETE, 'Lesson complete');
    this.celebrate('lesson');
  };

  /**
   * Mark a module as complete and award points.
   */
  GamificationEngine.prototype.completeModule = function() {
    this.state.modulesCompleted += 1;
    this.awardPoints(POINTS.MODULE_COMPLETE, 'Module complete');
    this.celebrate('module');
  };

  // =========================================================
  // FEEDBACK SYSTEM
  // =========================================================

  /**
   * Show growth mindset feedback based on result type.
   * @param {string} type - 'correct', 'incorrect', 'retry', 'streak'
   * @param {object} data - Additional data (e.g., { count: 3 } for streaks)
   * @returns {string} - The feedback message shown
   */
  GamificationEngine.prototype.showFeedback = function(type, data) {
    var messages = FEEDBACK[type] || FEEDBACK.correct;
    var message = messages[Math.floor(Math.random() * messages.length)];

    // Replace placeholders
    if (data) {
      if (data.count !== undefined) {
        message = message.replace('{count}', data.count);
      }
      if (data.points !== undefined) {
        message = message.replace('{points}', data.points);
      }
    }

    this._showFeedbackUI(message, type);
    return message;
  };

  /**
   * Get quiz result feedback with positive framing.
   * @param {number} correct - Number correct
   * @param {number} total - Total questions
   * @returns {string} - Positively framed result message
   */
  GamificationEngine.prototype.getScoreFeedback = function(correct, total) {
    var pct = Math.round((correct / total) * 100);
    return 'You got ' + correct + ' out of ' + total + " - that's " + pct + '%!';
  };

  // =========================================================
  // CELEBRATION ANIMATIONS
  // =========================================================

  /**
   * Trigger a celebration animation.
   * @param {string} type - 'section', 'lesson', 'module', 'quiz'
   */
  GamificationEngine.prototype.celebrate = function(type) {
    var container = this._getCelebrationContainer();

    // Clear any existing celebration
    if (this.celebrationTimeout) {
      clearTimeout(this.celebrationTimeout);
    }

    var intensity = type === 'module' ? 'large' : (type === 'lesson' ? 'medium' : 'small');

    // Create celebration element
    var celebration = document.createElement('div');
    celebration.className = 'gamification-celebration gamification-celebration--' + intensity;
    celebration.setAttribute('role', 'status');
    celebration.setAttribute('aria-live', 'polite');
    celebration.innerHTML = this._getCelebrationHTML(type);

    container.appendChild(celebration);

    // Trigger animation
    requestAnimationFrame(function() {
      celebration.classList.add('gamification-celebration--active');
    });

    // Auto-remove after animation
    var self = this;
    this.celebrationTimeout = setTimeout(function() {
      celebration.classList.remove('gamification-celebration--active');
      setTimeout(function() {
        if (celebration.parentNode) {
          celebration.parentNode.removeChild(celebration);
        }
      }, 500);
    }, type === 'module' ? 4000 : 2500);
  };

  // =========================================================
  // PROGRESS TRACKING
  // =========================================================

  /**
   * Update progress at lesson, module, or course level.
   * @param {string} level - 'lesson', 'module', 'course'
   * @param {number} current - Current step/page number (1-based)
   * @param {number} total - Total steps/pages
   */
  GamificationEngine.prototype.updateProgress = function(level, current, total) {
    var pct = Math.round((current / total) * 100);
    var bar = this.uiElements['progress-' + level];
    if (bar) {
      bar.style.width = pct + '%';
      bar.setAttribute('aria-valuenow', pct);

      var label = bar.parentNode.querySelector('.gamification-progress__label');
      if (label) {
        label.textContent = pct + '%';
      }
    }
  };

  // =========================================================
  // UI RENDERING
  // =========================================================

  /**
   * Render all gamification UI components.
   * Call after the page DOM is ready.
   */
  GamificationEngine.prototype._renderUI = function() {
    // Inject styles if not already present
    if (!document.getElementById('gamification-styles')) {
      this._injectStyles();
    }

    // Render points display in header
    this._renderPointsDisplay();

    // Render progress bars
    this._renderProgressBars();
  };

  GamificationEngine.prototype._renderPointsDisplay = function() {
    var header = document.querySelector('.sco-header');
    if (!header) return;

    // Check if already rendered
    if (document.querySelector('.gamification-points')) return;

    var pointsEl = document.createElement('div');
    pointsEl.className = 'gamification-points';
    pointsEl.setAttribute('role', 'status');
    pointsEl.setAttribute('aria-label', 'Points earned');
    pointsEl.innerHTML =
      '<span class="gamification-points__icon" aria-hidden="true">&#9733;</span>' +
      '<span class="gamification-points__value" id="gamification-points-value">' +
        this.state.totalPoints +
      '</span>' +
      '<span class="gamification-points__label">pts</span>';

    header.appendChild(pointsEl);
    this.uiElements.pointsValue = document.getElementById('gamification-points-value');
  };

  GamificationEngine.prototype._renderProgressBars = function() {
    var header = document.querySelector('.sco-header');
    if (!header) return;

    // Check if already rendered
    if (document.querySelector('.gamification-progress-container')) return;

    var container = document.createElement('div');
    container.className = 'gamification-progress-container';
    container.innerHTML =
      '<div class="gamification-progress" data-level="lesson">' +
        '<div class="gamification-progress__bar" ' +
          'role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" ' +
          'aria-label="Lesson progress" id="gamification-progress-lesson">' +
        '</div>' +
        '<span class="gamification-progress__label">0%</span>' +
      '</div>';

    header.appendChild(container);

    this.uiElements['progress-lesson'] = document.getElementById('gamification-progress-lesson');
  };

  GamificationEngine.prototype._updatePointsDisplay = function() {
    if (this.uiElements.pointsValue) {
      this.uiElements.pointsValue.textContent = this.state.totalPoints;
    }
  };

  GamificationEngine.prototype._updateStreakDisplay = function() {
    var streakEl = document.querySelector('.gamification-streak');
    if (this.state.currentStreak >= POINTS.STREAK_THRESHOLD) {
      if (!streakEl) {
        streakEl = document.createElement('div');
        streakEl.className = 'gamification-streak';
        streakEl.setAttribute('role', 'status');
        var header = document.querySelector('.sco-header');
        if (header) header.appendChild(streakEl);
      }
      streakEl.textContent = this.state.currentStreak + ' streak!';
      streakEl.classList.add('gamification-streak--active');
    } else if (streakEl) {
      streakEl.classList.remove('gamification-streak--active');
    }
  };

  GamificationEngine.prototype._showPointsAnimation = function(points) {
    var pointsEl = document.querySelector('.gamification-points');
    if (!pointsEl) return;

    var floater = document.createElement('span');
    floater.className = 'gamification-points__floater';
    floater.textContent = '+' + points;
    floater.setAttribute('aria-hidden', 'true');
    pointsEl.appendChild(floater);

    // Remove after animation
    setTimeout(function() {
      if (floater.parentNode) {
        floater.parentNode.removeChild(floater);
      }
    }, 1500);
  };

  GamificationEngine.prototype._showFeedbackUI = function(message, type) {
    // Remove existing feedback
    var existing = document.querySelector('.gamification-feedback');
    if (existing) existing.parentNode.removeChild(existing);

    var feedback = document.createElement('div');
    feedback.className = 'gamification-feedback gamification-feedback--' + type;
    feedback.setAttribute('role', 'alert');
    feedback.textContent = message;

    var content = document.querySelector('.sco-content') || document.body;
    content.appendChild(feedback);

    // Trigger entrance
    requestAnimationFrame(function() {
      feedback.classList.add('gamification-feedback--visible');
    });

    // Auto-remove
    setTimeout(function() {
      feedback.classList.remove('gamification-feedback--visible');
      setTimeout(function() {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback);
        }
      }, 400);
    }, 3000);
  };

  GamificationEngine.prototype._getCelebrationContainer = function() {
    var container = document.getElementById('gamification-celebration-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'gamification-celebration-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    return container;
  };

  GamificationEngine.prototype._getCelebrationHTML = function(type) {
    if (type === 'module') {
      return '<div class="gamification-celebration__content">' +
        '<div class="gamification-celebration__icon" aria-hidden="true">&#127942;</div>' +
        '<div class="gamification-celebration__text">Module Complete!</div>' +
        '<div class="gamification-celebration__sub">Outstanding work!</div>' +
        '</div>';
    }
    if (type === 'lesson') {
      return '<div class="gamification-celebration__content">' +
        '<div class="gamification-celebration__icon" aria-hidden="true">&#10004;</div>' +
        '<div class="gamification-celebration__text">Lesson Complete!</div>' +
        '</div>';
    }
    return '<div class="gamification-celebration__content">' +
      '<div class="gamification-celebration__icon" aria-hidden="true">&#10004;</div>' +
      '<div class="gamification-celebration__text">Section Complete!</div>' +
      '</div>';
  };

  // =========================================================
  // CSS INJECTION
  // =========================================================

  GamificationEngine.prototype._injectStyles = function() {
    var style = document.createElement('style');
    style.id = 'gamification-styles';
    style.textContent = [
      /* Points display */
      '.gamification-points {',
      '  display: inline-flex; align-items: center; gap: 4px;',
      '  padding: 4px 12px; border-radius: 16px;',
      '  background: var(--accent, #f59e0b); color: white;',
      '  font-weight: 600; font-size: 14px; position: relative;',
      '}',
      '.gamification-points__icon { font-size: 16px; }',
      '.gamification-points__floater {',
      '  position: absolute; top: -8px; right: -4px;',
      '  font-size: 12px; font-weight: 700; color: var(--accent, #f59e0b);',
      '  animation: gamification-float-up 1.2s ease-out forwards;',
      '  pointer-events: none;',
      '}',
      '@keyframes gamification-float-up {',
      '  0% { opacity: 1; transform: translateY(0); }',
      '  100% { opacity: 0; transform: translateY(-24px); }',
      '}',

      /* Progress bars */
      '.gamification-progress-container { margin-top: 8px; }',
      '.gamification-progress {',
      '  height: 6px; background: var(--surface, #f0f0f0);',
      '  border-radius: 3px; position: relative; overflow: hidden;',
      '}',
      '.gamification-progress__bar {',
      '  height: 100%; background: var(--primary, #3b82f6);',
      '  border-radius: 3px; transition: width 0.5s ease;',
      '  width: 0%;',
      '}',
      '.gamification-progress__label {',
      '  position: absolute; right: 4px; top: -2px;',
      '  font-size: 10px; color: var(--text-secondary, #666);',
      '}',

      /* Streak */
      '.gamification-streak {',
      '  display: none; padding: 2px 10px; border-radius: 12px;',
      '  background: var(--warning, #f59e0b); color: white;',
      '  font-size: 12px; font-weight: 600;',
      '  animation: gamification-pulse 0.6s ease;',
      '}',
      '.gamification-streak--active { display: inline-block; }',
      '@keyframes gamification-pulse {',
      '  0% { transform: scale(0.8); }',
      '  50% { transform: scale(1.1); }',
      '  100% { transform: scale(1); }',
      '}',

      /* Feedback */
      '.gamification-feedback {',
      '  padding: 12px 20px; border-radius: 8px; margin: 12px 0;',
      '  font-size: 15px; opacity: 0; transform: translateY(8px);',
      '  transition: opacity 0.3s ease, transform 0.3s ease;',
      '}',
      '.gamification-feedback--visible { opacity: 1; transform: translateY(0); }',
      '.gamification-feedback--correct {',
      '  background: #ecfdf5; color: #065f46; border-left: 4px solid var(--success, #22c55e);',
      '}',
      '.gamification-feedback--incorrect {',
      '  background: #fef2f2; color: #991b1b; border-left: 4px solid var(--error, #ef4444);',
      '}',
      '.gamification-feedback--retry {',
      '  background: #fffbeb; color: #92400e; border-left: 4px solid var(--warning, #f59e0b);',
      '}',
      '.gamification-feedback--streak {',
      '  background: #fef3c7; color: #92400e; border-left: 4px solid #f59e0b;',
      '}',

      /* Celebration overlay */
      '#gamification-celebration-container {',
      '  position: fixed; top: 0; left: 0; right: 0; bottom: 0;',
      '  pointer-events: none; z-index: 10000;',
      '  display: flex; align-items: center; justify-content: center;',
      '}',
      '.gamification-celebration {',
      '  text-align: center; opacity: 0; transform: scale(0.5);',
      '  transition: opacity 0.5s ease, transform 0.5s ease;',
      '}',
      '.gamification-celebration--active { opacity: 1; transform: scale(1); }',
      '.gamification-celebration__content {',
      '  background: white; padding: 32px 48px; border-radius: 16px;',
      '  box-shadow: 0 20px 60px rgba(0,0,0,0.15);',
      '}',
      '.gamification-celebration__icon { font-size: 48px; margin-bottom: 8px; }',
      '.gamification-celebration__text {',
      '  font-size: 24px; font-weight: 700; color: var(--primary, #3b82f6);',
      '}',
      '.gamification-celebration__sub {',
      '  font-size: 16px; color: var(--text-secondary, #666); margin-top: 4px;',
      '}',
      '.gamification-celebration--large .gamification-celebration__content {',
      '  padding: 48px 64px;',
      '}',
      '.gamification-celebration--large .gamification-celebration__icon { font-size: 64px; }',
      '.gamification-celebration--large .gamification-celebration__text { font-size: 32px; }',

      /* Reduced motion support */
      '@media (prefers-reduced-motion: reduce) {',
      '  .gamification-points__floater,',
      '  .gamification-streak,',
      '  .gamification-celebration,',
      '  .gamification-feedback,',
      '  .gamification-progress__bar {',
      '    animation: none !important;',
      '    transition: none !important;',
      '  }',
      '  .gamification-celebration--active { opacity: 1; transform: none; }',
      '  .gamification-feedback--visible { opacity: 1; transform: none; }',
      '}'
    ].join('\n');

    document.head.appendChild(style);
  };

  // =========================================================
  // STATE PERSISTENCE (via SCORM suspend_data)
  // =========================================================

  GamificationEngine.prototype._saveState = function() {
    if (!this.scorm) return;

    // We store gamification state as a compact JSON under a known key
    // This is designed to coexist with BehaviorTracker in suspend_data
    try {
      var existing = '';
      if (typeof this.scorm.getBookmark === 'function') {
        existing = this.scorm.getBookmark() || '';
      } else if (typeof this.scorm.getValue === 'function') {
        existing = this.scorm.getValue('cmi.suspend_data') || '';
      }

      // Parse existing data to preserve BehaviorTracker data
      var allData = {};
      if (existing && existing.length > 0) {
        try {
          allData = JSON.parse(existing);
        } catch (e) {
          allData = {};
        }
      }

      // Add gamification state under 'g' key
      allData.g = {
        tp: this.state.totalPoints,
        cs: this.state.currentStreak,
        ls: this.state.longestStreak,
        sc: this.state.sectionsCompleted,
        lc: this.state.lessonsCompleted,
        mc: this.state.modulesCompleted,
        ca: this.state.correctAnswers,
        ta: this.state.totalAnswers
      };

      var jsonString = JSON.stringify(allData);

      if (typeof this.scorm.setBookmark === 'function') {
        this.scorm.setBookmark(jsonString);
      } else if (typeof this.scorm.setValue === 'function') {
        this.scorm.setValue('cmi.suspend_data', jsonString);
      }

      if (typeof this.scorm.commit === 'function') {
        this.scorm.commit();
      }
    } catch (e) {
      console.warn('GamificationEngine: Failed to save state', e);
    }
  };

  GamificationEngine.prototype._restoreState = function() {
    if (!this.scorm) return;

    try {
      var stored = '';
      if (typeof this.scorm.getBookmark === 'function') {
        stored = this.scorm.getBookmark();
      } else if (typeof this.scorm.getValue === 'function') {
        stored = this.scorm.getValue('cmi.suspend_data');
      }

      if (stored && stored.length > 0) {
        var allData = JSON.parse(stored);
        if (allData && allData.g) {
          var g = allData.g;
          this.state.totalPoints = g.tp || 0;
          this.state.currentStreak = g.cs || 0;
          this.state.longestStreak = g.ls || 0;
          this.state.sectionsCompleted = g.sc || 0;
          this.state.lessonsCompleted = g.lc || 0;
          this.state.modulesCompleted = g.mc || 0;
          this.state.correctAnswers = g.ca || 0;
          this.state.totalAnswers = g.ta || 0;
        }
      }
    } catch (e) {
      console.warn('GamificationEngine: Failed to restore state', e);
    }
  };

  // =========================================================
  // EXPORT
  // =========================================================

  global.GamificationEngine = GamificationEngine;

})(typeof window !== 'undefined' ? window : this);
