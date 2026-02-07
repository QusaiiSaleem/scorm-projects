/**
 * BehaviorTracker - Behavioral Data Collection for SCORM E-Learning
 *
 * A production-ready library that collects timing, navigation, assessment,
 * and engagement data within SCORM constraints (especially the 4096-char
 * cmi.suspend_data limit in SCORM 1.2).
 *
 * Features:
 * - Page view tracking with time, scroll depth, and scroll reversals
 * - Quiz behavioral signals: time-to-first-click, answer changes, deliberation
 * - Focus/blur tracking as attention proxy
 * - Idle detection
 * - Bloom's taxonomy performance tracking
 * - Data compression for SCORM 1.2 storage limits
 * - Works with both SCORM 1.2 and 2004
 * - No external dependencies
 *
 * Usage:
 *   const tracker = new BehaviorTracker(scormWrapper);
 *   tracker.startSession();
 *   tracker.trackPageView('sco_01_p1');
 *   tracker.trackQuizAttempt('q1', { ... });
 *   tracker.endSession();
 *
 * Based on research from:
 * - Cognitive load theory (timing as processing depth proxy)
 * - Self-Determination Theory (navigation patterns as motivation indicators)
 * - Levels of processing framework (Craik & Lockhart)
 */

(function(global) {
  'use strict';

  // =========================================================
  // CONFIGURATION
  // =========================================================

  var CONFIG = {
    // Maximum size for cmi.suspend_data (SCORM 1.2 = 4096)
    MAX_SUSPEND_DATA: 4096,

    // How often to auto-save data to SCORM (milliseconds)
    AUTO_SAVE_INTERVAL: 30000,

    // Idle threshold: no interaction for this long = "idle" (ms)
    IDLE_THRESHOLD: 60000,

    // Minimum time on page to count as a "view" (ms)
    MIN_VIEW_TIME: 1000,

    // Schema version for data migration compatibility
    SCHEMA_VERSION: 2,

    // Maximum navigation path entries to store
    MAX_PATH_LENGTH: 50,

    // Maximum focus/blur events to store in detail
    MAX_FOCUS_BLUR_EVENTS: 20,

    // Maximum assessment interactions to store
    MAX_ASSESSMENT_ENTRIES: 30
  };

  // =========================================================
  // BEHAVIOR TRACKER CLASS
  // =========================================================

  /**
   * @constructor
   * @param {object} scormApi - Reference to the SCORM API wrapper
   */
  function BehaviorTracker(scormApi) {
    this.scorm = scormApi;
    this.data = this._createEmptyDataSet();
    this.currentPage = null;
    this.pageStartTime = null;
    this.pageStartFocusedTime = null;
    this.isFocused = true;
    this.lastInteractionTime = Date.now();
    this.autoSaveTimer = null;
    this.scrollTracker = null;
    this.currentQuizState = null;
  }

  // =========================================================
  // SESSION MANAGEMENT
  // =========================================================

  /**
   * Start a new tracking session.
   * Call this when the SCO loads.
   */
  BehaviorTracker.prototype.startSession = function() {
    // Try to restore previous data from SCORM
    this._restoreData();

    // Record session start
    var now = Date.now();
    this.data.timing.sessionStart = now;

    // Generate short session ID
    this.data._sid = this._shortId();

    // Set up event listeners
    this._setupFocusTracking();
    this._setupIdleDetection();
    this._setupScrollTracking();

    // Start auto-save timer
    var self = this;
    this.autoSaveTimer = setInterval(function() {
      self._autoSave();
    }, CONFIG.AUTO_SAVE_INTERVAL);

    return this;
  };

  /**
   * End the current tracking session.
   * Call this when the SCO unloads or the user leaves.
   */
  BehaviorTracker.prototype.endSession = function() {
    // Close current page view if open
    if (this.currentPage) {
      this._closePageView();
    }

    // Record session end
    var now = Date.now();
    var sessionDuration = now - this.data.timing.sessionStart;

    // Add to sessions array
    this.data.timing.sessions.push({
      start: this.data.timing.sessionStart,
      end: now,
      duration: sessionDuration,
      focused: this.data.timing.focusedDuration,
      pagesVisited: this.data.navigation.path.length
    });

    this.data.timing.sessionDuration += sessionDuration;

    // Clean up
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    this._removeEventListeners();

    // Final save
    this.save();
  };

  // =========================================================
  // PAGE VIEW TRACKING
  // =========================================================

  /**
   * Track when a user navigates to a page/section.
   * @param {string} pageId - Unique identifier for the page (e.g., "sco_01_p1")
   */
  BehaviorTracker.prototype.trackPageView = function(pageId) {
    // Close previous page view
    if (this.currentPage) {
      this._closePageView();
    }

    var now = Date.now();

    // Record navigation
    if (this.data.navigation.path.length < CONFIG.MAX_PATH_LENGTH) {
      this.data.navigation.path.push(pageId);
    }

    // Check if this is a revisit
    if (this.data.timing.pages[pageId]) {
      this.data.timing.pages[pageId].views += 1;
      this.data.timing.pages[pageId].lastView = now;

      // Track revisit count
      if (!this.data.navigation.revisits[pageId]) {
        this.data.navigation.revisits[pageId] = 0;
      }
      this.data.navigation.revisits[pageId] += 1;

      // Check if this is a back-navigation
      var path = this.data.navigation.path;
      if (path.length >= 2) {
        var prevPages = path.slice(0, -1);
        if (prevPages.indexOf(pageId) !== -1) {
          this.data.navigation.backNavigations += 1;
        }
      }
    } else {
      // First visit to this page
      this.data.timing.pages[pageId] = {
        views: 1,
        totalTime: 0,
        focusedTime: 0,
        firstView: now,
        lastView: now,
        scrollDepth: 0,
        scrollReversals: 0
      };
    }

    // Start tracking this page
    this.currentPage = pageId;
    this.pageStartTime = now;
    this.pageStartFocusedTime = 0;

    // Reset scroll tracking for this page
    this._resetScrollTracking();
  };

  /**
   * Internal: Close tracking for the current page view.
   */
  BehaviorTracker.prototype._closePageView = function() {
    if (!this.currentPage) return;

    var now = Date.now();
    var elapsed = now - this.pageStartTime;

    // Only count as a meaningful view if over minimum threshold
    if (elapsed >= CONFIG.MIN_VIEW_TIME) {
      var pageData = this.data.timing.pages[this.currentPage];
      if (pageData) {
        pageData.totalTime += elapsed;
        pageData.focusedTime += this.pageStartFocusedTime;

        // Update scroll data
        if (this.scrollTracker) {
          pageData.scrollDepth = Math.max(
            pageData.scrollDepth,
            this.scrollTracker.maxDepth
          );
          pageData.scrollReversals += this.scrollTracker.reversals;
        }
      }
    }

    this.currentPage = null;
    this.pageStartTime = null;
    this.pageStartFocusedTime = null;
  };

  // =========================================================
  // ASSESSMENT TRACKING
  // =========================================================

  /**
   * Start tracking a quiz question attempt.
   * Call this when a question is presented to the learner.
   * @param {string} questionId - Unique question identifier
   * @param {object} metadata - { bloomsLevel, correctOption, type }
   */
  BehaviorTracker.prototype.startQuizQuestion = function(questionId, metadata) {
    this.currentQuizState = {
      questionId: questionId,
      bloomsLevel: metadata.bloomsLevel || 'remember',
      correctOption: metadata.correctOption,
      type: metadata.type || 'choice',
      startTime: Date.now(),
      firstClickTime: null,
      answerChanges: [],
      currentSelection: null,
      hintsUsed: 0
    };
  };

  /**
   * Track when the learner selects/changes a quiz option.
   * Call this each time an option is clicked.
   * @param {number} optionIndex - The index of the selected option
   */
  BehaviorTracker.prototype.trackOptionSelect = function(optionIndex) {
    if (!this.currentQuizState) return;

    var now = Date.now();

    // Track time to first click
    if (this.currentQuizState.firstClickTime === null) {
      this.currentQuizState.firstClickTime = now;
    }

    // Track answer changes
    if (this.currentQuizState.currentSelection !== null &&
        this.currentQuizState.currentSelection !== optionIndex) {
      this.currentQuizState.answerChanges.push({
        from: this.currentQuizState.currentSelection,
        to: optionIndex,
        timestamp: now
      });
    }

    this.currentQuizState.currentSelection = optionIndex;
  };

  /**
   * Track hint usage during a quiz question.
   */
  BehaviorTracker.prototype.trackHintUsed = function() {
    if (!this.currentQuizState) return;
    this.currentQuizState.hintsUsed += 1;

    // Also record as help-seeking event
    this.data.engagement.helpSeekingEvents.push({
      type: 'hint',
      ts: Date.now(),
      question: this.currentQuizState.questionId
    });
  };

  /**
   * Submit the quiz answer and record all behavioral data.
   * Call this when the learner submits their final answer.
   * @param {number} selectedOption - The final selected option index
   * @returns {object} - The recorded attempt data
   */
  BehaviorTracker.prototype.submitQuizAnswer = function(selectedOption) {
    if (!this.currentQuizState) return null;

    var now = Date.now();
    var state = this.currentQuizState;
    var timeToFirstClick = state.firstClickTime
      ? state.firstClickTime - state.startTime
      : now - state.startTime;
    var totalTime = now - state.startTime;
    var deliberationTime = totalTime - timeToFirstClick;
    var isCorrect = selectedOption === state.correctOption;

    // Create the attempt record
    var attempt = {
      timestamp: now,
      timeToFirstClick: timeToFirstClick,
      deliberationTime: deliberationTime,
      totalTime: totalTime,
      selectedOption: selectedOption,
      correctOption: state.correctOption,
      result: isCorrect ? 'correct' : 'incorrect',
      answerChanges: state.answerChanges,
      hintsUsed: state.hintsUsed
    };

    // Store in interactions
    if (!this.data.assessment.interactions[state.questionId]) {
      this.data.assessment.interactions[state.questionId] = {
        type: state.type,
        bloomsLevel: state.bloomsLevel,
        attempts: []
      };
    }
    this.data.assessment.interactions[state.questionId].attempts.push(attempt);

    // Update Bloom's performance
    var bloomsKey = state.bloomsLevel;
    if (this.data.assessment.bloomsPerformance[bloomsKey]) {
      this.data.assessment.bloomsPerformance[bloomsKey].total += 1;
      if (isCorrect) {
        this.data.assessment.bloomsPerformance[bloomsKey].correct += 1;
      }
    }

    // Update option position counts
    var posKey = String(selectedOption);
    if (!this.data.assessment.optionPositionCounts[posKey]) {
      this.data.assessment.optionPositionCounts[posKey] = 0;
    }
    this.data.assessment.optionPositionCounts[posKey] += 1;

    // Detect answer change from correct to incorrect (second-guessing)
    for (var i = 0; i < state.answerChanges.length; i++) {
      var change = state.answerChanges[i];
      if (change.from === state.correctOption && change.to !== state.correctOption) {
        // Learner changed from correct to incorrect - important behavioral signal
        attempt._secondGuessed = true;
      }
    }

    // Clear current quiz state
    this.currentQuizState = null;

    // Auto-save after assessment
    this._autoSave();

    return attempt;
  };

  /**
   * Record a complete quiz/module score.
   * @param {string} scoId - SCO identifier (e.g., "sco_01")
   * @param {number} score - Score as percentage (0-100)
   * @param {number} attempt - Attempt number (1-based)
   */
  BehaviorTracker.prototype.trackScore = function(scoId, score, attempt) {
    this.data.assessment.scoreProgression.push({
      sco: scoId,
      score: score,
      attempt: attempt || 1
    });

    if (attempt > 1) {
      this.data.assessment.retryCount += 1;
    }
  };

  // =========================================================
  // ENGAGEMENT TRACKING
  // =========================================================

  /**
   * Track access to optional content.
   * @param {string} contentId - Identifier for the optional content
   */
  BehaviorTracker.prototype.trackOptionalContent = function(contentId) {
    if (this.data.engagement.optionalContentAccessed.indexOf(contentId) === -1) {
      this.data.engagement.optionalContentAccessed.push(contentId);
    }
  };

  /**
   * Track a help-seeking event (glossary access, content revisit, etc.).
   * @param {string} type - Type of help ('glossary', 'revisit', 'reference')
   * @param {string} target - What they accessed
   */
  BehaviorTracker.prototype.trackHelpSeeking = function(type, target) {
    this.data.engagement.helpSeekingEvents.push({
      type: type,
      ts: Date.now(),
      target: target
    });
  };

  /**
   * Update completion rate for a SCO.
   * @param {string} scoId - SCO identifier
   * @param {number} rate - Completion rate as decimal (0.0 - 1.0)
   */
  BehaviorTracker.prototype.trackCompletion = function(scoId, rate) {
    this.data.engagement.completionRate[scoId] = rate;

    // Recalculate overall
    var rates = [];
    var cr = this.data.engagement.completionRate;
    for (var key in cr) {
      if (key !== 'overall' && cr.hasOwnProperty(key)) {
        rates.push(cr[key]);
      }
    }
    if (rates.length > 0) {
      var sum = 0;
      for (var i = 0; i < rates.length; i++) { sum += rates[i]; }
      this.data.engagement.completionRate.overall = Math.round((sum / rates.length) * 100) / 100;
    }
  };

  /**
   * Track gamification interactions.
   * @param {string} type - 'badgeView', 'progressClick', 'achievementDismiss'
   */
  BehaviorTracker.prototype.trackGamification = function(type) {
    var gi = this.data.engagement.gamificationInteractions;
    switch (type) {
      case 'badgeView':
        gi.badgesViewed += 1;
        break;
      case 'progressClick':
        gi.progressBarClicks += 1;
        break;
      case 'achievementDismiss':
        gi.achievementDismissals += 1;
        break;
    }
  };

  // =========================================================
  // NAVIGATION ANALYSIS
  // =========================================================

  /**
   * Track that a learner revisited content before a quiz.
   * @param {string} scoId - The SCO containing the quiz
   * @param {string} pageId - The page they revisited
   */
  BehaviorTracker.prototype.trackPreQuizRevisit = function(scoId, pageId) {
    if (!this.data.navigation.preQuizRevisits[scoId]) {
      this.data.navigation.preQuizRevisits[scoId] = [];
    }
    if (this.data.navigation.preQuizRevisits[scoId].indexOf(pageId) === -1) {
      this.data.navigation.preQuizRevisits[scoId].push(pageId);
    }
  };

  /**
   * Track prerequisite completion status.
   * @param {string} scoId - The prerequisite SCO
   * @param {boolean} completed - Whether it was completed (true) or skipped (false)
   */
  BehaviorTracker.prototype.trackPrerequisite = function(scoId, completed) {
    var prereqs = this.data.navigation.prerequisiteCompletion;
    if (completed) {
      if (prereqs.completed.indexOf(scoId) === -1) {
        prereqs.completed.push(scoId);
      }
    } else {
      if (prereqs.skipped.indexOf(scoId) === -1) {
        prereqs.skipped.push(scoId);
      }
    }
  };

  /**
   * Calculate and update the linear navigation ratio.
   * A ratio of 1.0 = perfectly linear, 0.0 = completely random.
   */
  BehaviorTracker.prototype._updateLinearRatio = function() {
    var path = this.data.navigation.path;
    if (path.length < 2) {
      this.data.navigation.linearRatio = 1.0;
      return;
    }

    var forwardMoves = 0;
    for (var i = 1; i < path.length; i++) {
      if (path[i] !== path[i - 1]) {
        forwardMoves += 1;
      }
    }

    this.data.navigation.linearRatio = Math.round(
      (forwardMoves / (path.length - 1)) * 100
    ) / 100;
  };

  // =========================================================
  // FOCUS/BLUR TRACKING (Attention Proxy)
  // =========================================================

  BehaviorTracker.prototype._setupFocusTracking = function() {
    var self = this;

    this._onFocus = function() {
      self.isFocused = true;

      // Record event (limited to prevent data bloat)
      if (self.data.engagement.focusBlurEvents.length < CONFIG.MAX_FOCUS_BLUR_EVENTS) {
        self.data.engagement.focusBlurEvents.push({
          type: 'focus',
          ts: Date.now(),
          page: self.currentPage || ''
        });
      }
    };

    this._onBlur = function() {
      var now = Date.now();
      self.isFocused = false;

      // Record event
      if (self.data.engagement.focusBlurEvents.length < CONFIG.MAX_FOCUS_BLUR_EVENTS) {
        self.data.engagement.focusBlurEvents.push({
          type: 'blur',
          ts: now,
          page: self.currentPage || ''
        });
      }

      // Update summary
      self.data.engagement.focusBlurSummary.totalBlurs += 1;
    };

    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        self._onBlur();
      } else {
        self._onFocus();
      }
    });

    window.addEventListener('focus', self._onFocus);
    window.addEventListener('blur', self._onBlur);
  };

  // =========================================================
  // IDLE DETECTION
  // =========================================================

  BehaviorTracker.prototype._setupIdleDetection = function() {
    var self = this;
    var idleTimer = null;
    var idleStart = null;

    function resetIdleTimer() {
      self.lastInteractionTime = Date.now();

      // If we were idle, record the idle period
      if (idleStart !== null) {
        var idleDuration = Date.now() - idleStart;
        if (idleDuration >= CONFIG.IDLE_THRESHOLD) {
          self.data.engagement.idlePeriods.push({
            start: idleStart,
            duration: idleDuration,
            page: self.currentPage || ''
          });
        }
        idleStart = null;
      }

      // Reset the timer
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(function() {
        idleStart = Date.now();
      }, CONFIG.IDLE_THRESHOLD);
    }

    // Track user interactions for idle detection
    this._interactionEvents = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    this._resetIdleTimer = resetIdleTimer;

    for (var i = 0; i < this._interactionEvents.length; i++) {
      document.addEventListener(this._interactionEvents[i], resetIdleTimer, { passive: true });
    }

    // Start the initial timer
    resetIdleTimer();
  };

  // =========================================================
  // SCROLL TRACKING
  // =========================================================

  BehaviorTracker.prototype._setupScrollTracking = function() {
    var self = this;

    this.scrollTracker = {
      maxDepth: 0,
      lastScrollTop: 0,
      reversals: 0,
      lastDirection: null
    };

    this._onScroll = function() {
      if (!self.scrollTracker) return;

      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      var winHeight = window.innerHeight;
      var scrollPercent = Math.round((scrollTop / (docHeight - winHeight)) * 100) || 0;

      // Update max depth
      self.scrollTracker.maxDepth = Math.max(
        self.scrollTracker.maxDepth,
        Math.min(scrollPercent, 100)
      );

      // Detect scroll reversals
      var currentDirection = scrollTop > self.scrollTracker.lastScrollTop ? 'down' : 'up';
      if (self.scrollTracker.lastDirection !== null &&
          currentDirection !== self.scrollTracker.lastDirection) {
        self.scrollTracker.reversals += 1;
      }
      self.scrollTracker.lastDirection = currentDirection;
      self.scrollTracker.lastScrollTop = scrollTop;
    };

    window.addEventListener('scroll', this._onScroll, { passive: true });
  };

  BehaviorTracker.prototype._resetScrollTracking = function() {
    if (this.scrollTracker) {
      this.scrollTracker.maxDepth = 0;
      this.scrollTracker.lastScrollTop = 0;
      this.scrollTracker.reversals = 0;
      this.scrollTracker.lastDirection = null;
    }
  };

  // =========================================================
  // DATA PERSISTENCE (SCORM Storage)
  // =========================================================

  /**
   * Save collected data to SCORM cmi.suspend_data.
   * Automatically compresses to fit within size limits.
   */
  BehaviorTracker.prototype.save = function() {
    if (!this.scorm) return false;

    // Update computed fields before saving
    this._updateLinearRatio();
    this._updateAttentionRatio();
    this._updateFocusBlurSummary();

    // Compress data for storage
    var compressed = this._compressData();
    var jsonString = JSON.stringify(compressed);

    // Check size
    if (jsonString.length > CONFIG.MAX_SUSPEND_DATA) {
      // Progressively reduce data to fit
      compressed = this._reduceData(compressed, jsonString.length);
      jsonString = JSON.stringify(compressed);
    }

    // Store via SCORM API
    try {
      if (typeof this.scorm.setBookmark === 'function') {
        this.scorm.setBookmark(jsonString);
      } else if (typeof this.scorm.setValue === 'function') {
        this.scorm.setValue('cmi.suspend_data', jsonString);
      }

      // Also store interactions via cmi.interactions for detailed quiz data
      this._saveInteractionsToScorm();

      // Commit
      if (typeof this.scorm.commit === 'function') {
        this.scorm.commit();
      }

      return true;
    } catch (e) {
      console.warn('BehaviorTracker: Failed to save to SCORM', e);
      return false;
    }
  };

  /**
   * Restore previously saved data from SCORM.
   */
  BehaviorTracker.prototype._restoreData = function() {
    if (!this.scorm) return;

    try {
      var stored = null;

      if (typeof this.scorm.getBookmark === 'function') {
        stored = this.scorm.getBookmark();
      } else if (typeof this.scorm.getValue === 'function') {
        stored = this.scorm.getValue('cmi.suspend_data');
      }

      if (stored && typeof stored === 'string' && stored.length > 0) {
        var parsed = JSON.parse(stored);
        if (parsed && parsed.v === CONFIG.SCHEMA_VERSION) {
          this.data = this._decompressData(parsed);
        }
      }
    } catch (e) {
      console.warn('BehaviorTracker: Failed to restore data', e);
      // Start fresh if restore fails
      this.data = this._createEmptyDataSet();
    }
  };

  /**
   * Save detailed interaction data to cmi.interactions.
   * Uses the SCORM interactions data model (separate from suspend_data).
   */
  BehaviorTracker.prototype._saveInteractionsToScorm = function() {
    if (!this.scorm || typeof this.scorm.recordInteraction !== 'function') return;

    var interactions = this.data.assessment.interactions;
    var index = 0;

    for (var qId in interactions) {
      if (!interactions.hasOwnProperty(qId)) continue;

      var interaction = interactions[qId];
      var latestAttempt = interaction.attempts[interaction.attempts.length - 1];

      if (latestAttempt && index < CONFIG.MAX_ASSESSMENT_ENTRIES) {
        this.scorm.recordInteraction(index, {
          id: qId,
          type: interaction.type,
          response: String(latestAttempt.selectedOption),
          correct: String(latestAttempt.correctOption),
          result: latestAttempt.result,
          latency: this._formatLatency(latestAttempt.totalTime),
          weighting: 1
        });
        index++;
      }
    }
  };

  // =========================================================
  // DATA COMPRESSION / DECOMPRESSION
  // =========================================================

  /**
   * Compress the full data schema into the compact format for storage.
   * Compact schema key mappings:
   * - v = schema version
   * - s = session ID (short hash)
   * - t = timing (ss=sessionStart, sd=sessionDuration, fd=focusedDuration, p=pages)
   * - t.p.{id} = [viewCount, totalTimeSec, focusedTimeSec, scrollDepthPct, scrollReversals]
   * - n = navigation (p=path, lr=linearRatio, rv=revisits, bn=backNavigations)
   * - a = assessment (q=questions, sp=scoreProgression, bp=bloomsPerformance, op=optionPositionCounts, rc=retryCount)
   * - a.q.{id} = [timeToFirstClickMs, deliberationMs, selectedOption, correctOption, result(0/1), hintsUsed]
   * - e = engagement (ar=attentionRatio, tb=totalBlurs, bd=blurDuration, oc=optionalContent, hs=helpSeeking, cr=completionRate)
   */
  BehaviorTracker.prototype._compressData = function() {
    var d = this.data;
    var compressed = {
      v: CONFIG.SCHEMA_VERSION,
      s: d._sid,
      t: {
        ss: Math.floor(d.timing.sessionStart / 1000),
        sd: Math.round(d.timing.sessionDuration / 1000),
        fd: Math.round(d.timing.focusedDuration / 1000),
        p: {}
      },
      n: {
        p: this._compressPath(d.navigation.path),
        lr: Math.round(d.navigation.linearRatio * 100),
        rv: {},
        bn: d.navigation.backNavigations
      },
      a: {
        q: {},
        sp: d.assessment.scoreProgression.map(function(s) { return s.score; }),
        bp: this._compressBlooms(d.assessment.bloomsPerformance),
        op: [],
        rc: d.assessment.retryCount
      },
      e: {
        ar: Math.round(d.engagement.attentionRatio * 100),
        tb: d.engagement.focusBlurSummary.totalBlurs,
        bd: Math.round(d.engagement.focusBlurSummary.totalBlurDuration / 1000),
        oc: d.engagement.optionalContentAccessed.length,
        hs: d.engagement.helpSeekingEvents.length,
        cr: Math.round((d.engagement.completionRate.overall || 0) * 100)
      }
    };

    // Compress page timing data
    for (var pageId in d.timing.pages) {
      if (!d.timing.pages.hasOwnProperty(pageId)) continue;
      var p = d.timing.pages[pageId];
      var shortPageId = this._shortenPageId(pageId);
      compressed.t.p[shortPageId] = [
        p.views,
        Math.round(p.totalTime / 1000),
        Math.round(p.focusedTime / 1000),
        p.scrollDepth,
        p.scrollReversals
      ];
    }

    // Compress revisit data
    for (var rv in d.navigation.revisits) {
      if (!d.navigation.revisits.hasOwnProperty(rv)) continue;
      var shortRv = this._shortenPageId(rv);
      compressed.n.rv[shortRv] = d.navigation.revisits[rv];
    }

    // Compress assessment data
    for (var qId in d.assessment.interactions) {
      if (!d.assessment.interactions.hasOwnProperty(qId)) continue;
      var interaction = d.assessment.interactions[qId];
      var lastAttempt = interaction.attempts[interaction.attempts.length - 1];
      if (lastAttempt) {
        compressed.a.q[qId] = [
          lastAttempt.timeToFirstClick,
          lastAttempt.deliberationTime,
          lastAttempt.selectedOption,
          lastAttempt.correctOption,
          lastAttempt.result === 'correct' ? 1 : 0,
          lastAttempt.hintsUsed
        ];
      }
    }

    // Compress option position counts
    for (var i = 0; i < 4; i++) {
      compressed.a.op.push(d.assessment.optionPositionCounts[String(i)] || 0);
    }

    return compressed;
  };

  /**
   * Decompress stored data back into the full schema.
   */
  BehaviorTracker.prototype._decompressData = function(compressed) {
    var data = this._createEmptyDataSet();

    if (!compressed || compressed.v !== CONFIG.SCHEMA_VERSION) return data;

    // Restore timing
    data.timing.sessionStart = (compressed.t.ss || 0) * 1000;
    data.timing.sessionDuration = (compressed.t.sd || 0) * 1000;
    data.timing.focusedDuration = (compressed.t.fd || 0) * 1000;

    // Restore page timing
    if (compressed.t.p) {
      for (var shortId in compressed.t.p) {
        if (!compressed.t.p.hasOwnProperty(shortId)) continue;
        var arr = compressed.t.p[shortId];
        data.timing.pages[shortId] = {
          views: arr[0],
          totalTime: arr[1] * 1000,
          focusedTime: arr[2] * 1000,
          firstView: 0,
          lastView: 0,
          scrollDepth: arr[3],
          scrollReversals: arr[4]
        };
      }
    }

    // Restore navigation
    data.navigation.linearRatio = (compressed.n.lr || 0) / 100;
    data.navigation.backNavigations = compressed.n.bn || 0;
    if (compressed.n.rv) {
      data.navigation.revisits = compressed.n.rv;
    }

    // Restore assessment
    if (compressed.a.q) {
      for (var qId in compressed.a.q) {
        if (!compressed.a.q.hasOwnProperty(qId)) continue;
        var qArr = compressed.a.q[qId];
        data.assessment.interactions[qId] = {
          type: 'choice',
          bloomsLevel: 'remember',
          attempts: [{
            timestamp: 0,
            timeToFirstClick: qArr[0],
            deliberationTime: qArr[1],
            selectedOption: qArr[2],
            correctOption: qArr[3],
            result: qArr[4] === 1 ? 'correct' : 'incorrect',
            answerChanges: [],
            hintsUsed: qArr[5]
          }]
        };
      }
    }

    if (compressed.a.sp) {
      data.assessment.scoreProgression = compressed.a.sp.map(function(s, i) {
        return { sco: 'sco_' + i, score: s, attempt: 1 };
      });
    }

    // Restore Bloom's performance
    if (compressed.a.bp && compressed.a.bp.length === 12) {
      var levels = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
      for (var b = 0; b < 6; b++) {
        data.assessment.bloomsPerformance[levels[b]] = {
          correct: compressed.a.bp[b * 2],
          total: compressed.a.bp[b * 2 + 1]
        };
      }
    }

    // Restore option position counts
    if (compressed.a.op) {
      for (var o = 0; o < compressed.a.op.length; o++) {
        data.assessment.optionPositionCounts[String(o)] = compressed.a.op[o];
      }
    }

    data.assessment.retryCount = compressed.a.rc || 0;

    // Restore engagement
    data.engagement.attentionRatio = (compressed.e.ar || 0) / 100;
    data.engagement.focusBlurSummary.totalBlurs = compressed.e.tb || 0;
    data.engagement.focusBlurSummary.totalBlurDuration = (compressed.e.bd || 0) * 1000;

    return data;
  };

  /**
   * Progressively reduce data to fit within size limits.
   * Removes lowest-priority data first.
   */
  BehaviorTracker.prototype._reduceData = function(compressed, currentSize) {
    var target = CONFIG.MAX_SUSPEND_DATA;

    // Priority 1: Truncate navigation path to last 20 entries
    if (currentSize > target && compressed.n.p) {
      if (compressed.n.p.length > 20) {
        compressed.n.p = compressed.n.p.slice(-20);
      }
      currentSize = JSON.stringify(compressed).length;
    }

    // Priority 2: Remove revisit details
    if (currentSize > target) {
      compressed.n.rv = {};
      currentSize = JSON.stringify(compressed).length;
    }

    // Priority 3: Reduce page timing to top 15 most-visited pages
    if (currentSize > target && compressed.t.p) {
      var pages = [];
      for (var p in compressed.t.p) {
        if (compressed.t.p.hasOwnProperty(p)) {
          pages.push({ id: p, views: compressed.t.p[p][0] });
        }
      }
      pages.sort(function(a, b) { return b.views - a.views; });
      var keepPages = {};
      for (var i = 0; i < Math.min(15, pages.length); i++) {
        keepPages[pages[i].id] = compressed.t.p[pages[i].id];
      }
      compressed.t.p = keepPages;
      currentSize = JSON.stringify(compressed).length;
    }

    // Priority 4: Remove navigation path entirely
    if (currentSize > target) {
      compressed.n.p = [];
      currentSize = JSON.stringify(compressed).length;
    }

    // Priority 5: Remove page timing entirely (keep only assessment data)
    if (currentSize > target) {
      compressed.t.p = {};
    }

    return compressed;
  };

  // =========================================================
  // HELPER METHODS
  // =========================================================

  /**
   * Create an empty data set with the full schema structure.
   */
  BehaviorTracker.prototype._createEmptyDataSet = function() {
    return {
      _v: CONFIG.SCHEMA_VERSION,
      _ts: Date.now(),
      _sid: '',

      timing: {
        sessionStart: 0,
        sessionDuration: 0,
        focusedDuration: 0,
        pages: {},
        sessions: []
      },

      navigation: {
        path: [],
        pathType: 'unknown',
        revisits: {},
        preQuizRevisits: {},
        prerequisiteCompletion: {
          completed: [],
          skipped: []
        },
        linearRatio: 1.0,
        backNavigations: 0
      },

      assessment: {
        interactions: {},
        scoreProgression: [],
        bloomsPerformance: {
          remember: { correct: 0, total: 0 },
          understand: { correct: 0, total: 0 },
          apply: { correct: 0, total: 0 },
          analyze: { correct: 0, total: 0 },
          evaluate: { correct: 0, total: 0 },
          create: { correct: 0, total: 0 }
        },
        optionPositionCounts: {},
        retryCount: 0,
        averageRetryInterval: 0
      },

      engagement: {
        focusBlurEvents: [],
        focusBlurSummary: {
          totalBlurs: 0,
          totalBlurDuration: 0,
          averageBlurDuration: 0,
          longestBlur: 0
        },
        attentionRatio: 1.0,
        idlePeriods: [],
        optionalContentAccessed: [],
        helpSeekingEvents: [],
        completionRate: {
          overall: 0
        },
        gamificationInteractions: {
          badgesViewed: 0,
          progressBarClicks: 0,
          achievementDismissals: 0
        }
      }
    };
  };

  /**
   * Update the attention ratio (focused time / total time).
   */
  BehaviorTracker.prototype._updateAttentionRatio = function() {
    var total = this.data.timing.sessionDuration;
    var focused = this.data.timing.focusedDuration;
    if (total > 0) {
      this.data.engagement.attentionRatio = Math.min(focused / total, 1.0);
    }
  };

  /**
   * Update focus/blur summary statistics.
   */
  BehaviorTracker.prototype._updateFocusBlurSummary = function() {
    var events = this.data.engagement.focusBlurEvents;
    var summary = this.data.engagement.focusBlurSummary;

    var totalDuration = 0;
    var longestBlur = 0;
    var blurStart = null;

    for (var i = 0; i < events.length; i++) {
      if (events[i].type === 'blur') {
        blurStart = events[i].ts;
      } else if (events[i].type === 'focus' && blurStart !== null) {
        var duration = events[i].ts - blurStart;
        totalDuration += duration;
        if (duration > longestBlur) longestBlur = duration;
        blurStart = null;
      }
    }

    summary.totalBlurDuration = totalDuration;
    summary.longestBlur = longestBlur;
    summary.averageBlurDuration = summary.totalBlurs > 0
      ? Math.round(totalDuration / summary.totalBlurs)
      : 0;
  };

  /**
   * Generate a short random session ID.
   */
  BehaviorTracker.prototype._shortId = function() {
    return Math.random().toString(36).substr(2, 5);
  };

  /**
   * Shorten a page ID for compact storage.
   * "sco_01_p1" -> "1.1", "sco_02_p3" -> "2.3"
   */
  BehaviorTracker.prototype._shortenPageId = function(pageId) {
    var match = pageId.match(/sco_(\d+)_p(\d+)/);
    if (match) {
      return parseInt(match[1]) + '.' + parseInt(match[2]);
    }
    return pageId.substr(0, 6);
  };

  /**
   * Compress navigation path to page index array.
   */
  BehaviorTracker.prototype._compressPath = function(path) {
    var lookup = {};
    var nextIndex = 0;

    return path.map(function(pageId) {
      if (lookup[pageId] === undefined) {
        lookup[pageId] = nextIndex++;
      }
      return lookup[pageId];
    });
  };

  /**
   * Compress Bloom's performance to paired array.
   * [correct, total, correct, total, ...] for remember through create
   */
  BehaviorTracker.prototype._compressBlooms = function(blooms) {
    var levels = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
    var result = [];
    for (var i = 0; i < levels.length; i++) {
      var level = blooms[levels[i]] || { correct: 0, total: 0 };
      result.push(level.correct, level.total);
    }
    return result;
  };

  /**
   * Format milliseconds as SCORM latency string.
   * SCORM 1.2 format: HH:MM:SS
   */
  BehaviorTracker.prototype._formatLatency = function(ms) {
    var totalSeconds = Math.round(ms / 1000);
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    return (hours < 10 ? '0' : '') + hours + ':' +
           (minutes < 10 ? '0' : '') + minutes + ':' +
           (seconds < 10 ? '0' : '') + seconds;
  };

  /**
   * Auto-save handler.
   */
  BehaviorTracker.prototype._autoSave = function() {
    if (this.currentPage && this.pageStartTime) {
      var elapsed = Date.now() - this.pageStartTime;
      this.data.timing.sessionDuration = elapsed;
      if (this.isFocused) {
        this.data.timing.focusedDuration += CONFIG.AUTO_SAVE_INTERVAL;
      }
    }
    this.save();
  };

  /**
   * Remove all event listeners (for cleanup).
   */
  BehaviorTracker.prototype._removeEventListeners = function() {
    if (this._onScroll) {
      window.removeEventListener('scroll', this._onScroll);
    }
    if (this._interactionEvents && this._resetIdleTimer) {
      for (var i = 0; i < this._interactionEvents.length; i++) {
        document.removeEventListener(this._interactionEvents[i], this._resetIdleTimer);
      }
    }
  };

  // =========================================================
  // DATA EXPORT (For Research Analysis)
  // =========================================================

  /**
   * Export the full data set as a JSON string.
   */
  BehaviorTracker.prototype.exportData = function() {
    this._updateLinearRatio();
    this._updateAttentionRatio();
    this._updateFocusBlurSummary();

    return JSON.stringify(this.data, null, 2);
  };

  /**
   * Export a research-friendly summary report.
   */
  BehaviorTracker.prototype.exportSummary = function() {
    var d = this.data;
    var totalQuestions = 0;
    var totalCorrect = 0;
    var avgTimeToFirstClick = 0;
    var avgDeliberation = 0;
    var questionCount = 0;
    var secondGuessCount = 0;

    for (var qId in d.assessment.interactions) {
      if (!d.assessment.interactions.hasOwnProperty(qId)) continue;
      var attempts = d.assessment.interactions[qId].attempts;
      if (attempts.length > 0) {
        var last = attempts[attempts.length - 1];
        totalQuestions++;
        if (last.result === 'correct') totalCorrect++;
        avgTimeToFirstClick += last.timeToFirstClick;
        avgDeliberation += last.deliberationTime;
        questionCount++;
        if (last._secondGuessed) secondGuessCount++;
      }
    }

    if (questionCount > 0) {
      avgTimeToFirstClick = Math.round(avgTimeToFirstClick / questionCount);
      avgDeliberation = Math.round(avgDeliberation / questionCount);
    }

    return {
      sessionId: d._sid,
      totalSessionTime: Math.round(d.timing.sessionDuration / 1000) + 's',
      focusedTime: Math.round(d.timing.focusedDuration / 1000) + 's',
      attentionRatio: Math.round(d.engagement.attentionRatio * 100) + '%',
      pagesVisited: Object.keys(d.timing.pages).length,
      totalRevisits: d.navigation.backNavigations,
      linearNavigationRatio: Math.round(d.navigation.linearRatio * 100) + '%',
      questionsAttempted: totalQuestions,
      questionsCorrect: totalCorrect,
      accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) + '%' : 'N/A',
      avgTimeToFirstClick: avgTimeToFirstClick + 'ms',
      avgDeliberationTime: avgDeliberation + 'ms',
      secondGuessInstances: secondGuessCount,
      hintsUsed: d.engagement.helpSeekingEvents.filter(function(e) { return e.type === 'hint'; }).length,
      optionalContentExplored: d.engagement.optionalContentAccessed.length,
      retryAttempts: d.assessment.retryCount,
      tabSwitches: d.engagement.focusBlurSummary.totalBlurs,
      overallCompletion: Math.round((d.engagement.completionRate.overall || 0) * 100) + '%',
      bloomsBreakdown: d.assessment.bloomsPerformance
    };
  };

  // =========================================================
  // EXPORT
  // =========================================================

  global.BehaviorTracker = BehaviorTracker;

})(typeof window !== 'undefined' ? window : this);
