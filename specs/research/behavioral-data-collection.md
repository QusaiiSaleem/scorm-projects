# Behavioral Data Collection System for SCORM E-Learning

> Research document for designing a comprehensive behavioral analytics layer within SCORM constraints.
> Part of the SCORM Quality Upgrade initiative.

---

## Table of Contents

1. [Interdisciplinary Research Framework](#1-interdisciplinary-research-framework)
2. [Data Categories & Behavioral Indicators](#2-data-categories--behavioral-indicators)
3. [Complete Data Schema](#3-complete-data-schema)
4. [JavaScript Data Collection Library](#4-javascript-data-collection-library)
5. [SCORM Storage Strategy](#5-scorm-storage-strategy)
6. [Handling cmi.suspend_data Size Limits](#6-handling-cmisuspend_data-size-limits)
7. [Data Dictionary](#7-data-dictionary)
8. [Privacy & Ethics Considerations](#8-privacy--ethics-considerations)
9. [Research Analysis Export](#9-research-analysis-export)
10. [Integration Guide](#10-integration-guide)

---

## 1. Interdisciplinary Research Framework

### 1.1 Neuroscience Lens: Cognitive Load & Attention

**What we can measure through behavior:**

| Behavioral Signal | Neuroscience Interpretation | Data Point |
|---|---|---|
| Long pauses on content (>15s) | Deep processing / working memory engagement | `timing.pageViewDuration` |
| Rapid page skipping (<3s per page) | Cognitive overload OR disengagement | `timing.pageViewDuration` |
| Tab switching during content | Attention fragmentation / mind-wandering | `engagement.focusBlurEvents` |
| Returning to earlier sections | Schema reconstruction / knowledge gap detection | `navigation.revisitPatterns` |
| Time on quiz questions varies widely | Alternating between fluent retrieval and effortful recall | `assessment.questionTimings` |
| Scrolling back and forth on same page | Working memory capacity limits reached | `interaction.scrollReversals` |

**Key insight from cognitive neuroscience:** The "desirable difficulty" principle (Bjork & Bjork, 2011) suggests that some struggle is beneficial. We should distinguish between *productive struggle* (moderate pause times, deliberate revisiting) and *unproductive frustration* (very long pauses, erratic navigation, tab-switching). The data collection system captures both so analysts can differentiate.

### 1.2 Behavioral Economics Lens: Choice & Decision Patterns

**What choices reveal about learning:**

| Choice Pattern | Behavioral Economics Interpretation | Data Point |
|---|---|---|
| Always choosing first option in quizzes | Satisficing (accepting "good enough" rather than optimizing) | `assessment.optionPositionPatterns` |
| Changing answers from correct to incorrect | Loss aversion / overthinking (second-guessing bias) | `assessment.answerChangePatterns` |
| Skipping optional content | Cognitive miser behavior / effort minimization | `engagement.optionalContentInteraction` |
| Linear vs. exploratory navigation | Risk-aversion (linear) vs. curiosity-seeking (exploratory) | `navigation.pathType` |
| Time between retry attempts | Discounting (immediate retry) vs. reflection (delayed retry) | `assessment.retryIntervals` |

**Key insight from behavioral economics:** The "present bias" — learners tend to minimize immediate effort at the cost of long-term understanding. Tracking how learners make choices (not just what they choose) reveals whether they are engaging deeply or taking shortcuts.

### 1.3 Developmental Psychology Lens: Readiness & Scaffolding

**What engagement patterns indicate:**

| Engagement Pattern | Developmental Interpretation | Data Point |
|---|---|---|
| Consistently failing at a Bloom's level | Zone of Proximal Development (ZPD) boundary reached | `assessment.bloomsLevelScores` |
| Help-seeking increasing over time | Metacognitive awareness developing OR frustration | `engagement.helpSeekingFrequency` |
| Hint usage patterns | Scaffolding dependency level | `assessment.hintUsagePatterns` |
| Improvement curves across modules | Developmental progression rate | `assessment.scoreProgression` |
| Prerequisites skipped vs. completed | Self-assessment accuracy (Dunning-Kruger indicator) | `navigation.prerequisiteCompletion` |

**Key insight from developmental psychology:** Vygotsky's ZPD concept means the most productive learning happens just beyond current ability. If a learner consistently fails at "Apply" level questions but passes "Understand" level, the content may need adaptive scaffolding. Our data collection captures Bloom's level performance to enable this analysis.

### 1.4 Cognitive Psychology Lens: Depth of Processing

**What timing data reveals:**

| Timing Pattern | Cognitive Interpretation | Data Point |
|---|---|---|
| Consistent 2-4x reading speed on content | Elaborative encoding (deep processing) | `timing.readingSpeedRatio` |
| Quick first-click on quiz (< 2s) | Pattern recognition / automaticity (mastery) | `assessment.timeToFirstClick` |
| Long deliberation on quiz (> 30s) | Effortful retrieval / uncertainty | `assessment.questionTimings` |
| Re-reading content before quiz | Metacognitive strategy: "I know I don't know" | `navigation.preQuizRevisits` |
| Spacing effect in return visits | Distributed practice (highly effective) | `timing.sessionPatterns` |

**Key insight from cognitive psychology:** Craik & Lockhart's "levels of processing" framework tells us that deeper processing leads to better retention. Time-on-task is a proxy for processing depth, but only when combined with other signals (not just staring at the screen — we also need focus/blur data and interaction data to triangulate).

### 1.5 Social Psychology Lens: Motivation & Self-Regulation

**What interaction data reveals about motivation:**

| Interaction Pattern | Social Psychology Interpretation | Data Point |
|---|---|---|
| Completing course in one session | High intrinsic motivation / flow state | `timing.sessionPatterns` |
| Frequent short sessions | Extrinsic motivation / compliance-driven | `timing.sessionPatterns` |
| Exploring all optional content | Mastery goal orientation | `engagement.optionalContentInteraction` |
| Minimum-effort path to completion | Performance goal orientation | `navigation.pathEfficiency` |
| Returning after failure to retry | Resilience / growth mindset indicator | `assessment.postFailureReturn` |
| Abandoning after failure | Fixed mindset / learned helplessness risk | `assessment.abandonmentAfterFailure` |

**Key insight from social psychology:** Deci & Ryan's Self-Determination Theory identifies three needs: autonomy, competence, and relatedness. Our data can proxy for autonomy (navigation choice patterns), competence (assessment performance trajectory), and relatedness (social feature engagement, if present). This helps designers identify when courses fail to meet these psychological needs.

---

## 2. Data Categories & Behavioral Indicators

### 2.1 Timing Data

Timing is the most information-rich behavioral signal we can collect within SCORM constraints. Every timing measurement should be taken with `performance.now()` for sub-millisecond accuracy.

#### Page/Section Timing
- **Time per page/section**: How long the learner spends on each content page
- **Reading speed ratio**: Actual time vs. estimated reading time for the content length
- **Pause duration patterns**: Periods of no interaction while page is focused (indicates deep thinking vs. distraction)
- **Scroll-to-bottom time**: How quickly they scroll through content (skim vs. read)

#### Session Timing
- **Session start/end timestamps**: When they begin and end each learning session
- **Total session duration**: Continuous time in the course
- **Return interval patterns**: Time between sessions (spacing effect indicator)
- **Time of day patterns**: When they prefer to learn (morning/evening)

#### Assessment Timing
- **Time per question**: How long they spend on each quiz question
- **Time to first interaction**: How quickly they click/select after question appears
- **Deliberation time**: Time between reading question and committing answer
- **Review time**: Time spent reviewing feedback after answering

### 2.2 Interaction Data

#### Click & Navigation
- **Click frequency per page**: Engagement density measure
- **Navigation path sequence**: Ordered list of all pages/sections visited
- **Linear vs. non-linear ratio**: Percentage of forward-only navigation vs. jumping around
- **Back-button usage**: How often they return to previous content
- **Content revisit count per section**: Which sections needed re-reading

#### Scroll Behavior
- **Maximum scroll depth per page**: How far down they scrolled
- **Scroll speed patterns**: Fast scanning vs. slow reading
- **Scroll reversals**: Going back up to re-read (comprehension difficulty indicator)
- **Time at each scroll position**: Where they lingered (heat map data)

#### Help-Seeking
- **Hint request frequency**: How often they ask for hints during assessments
- **Glossary/reference access**: Use of supplementary materials
- **Content replay frequency**: Rewatching videos or re-reading sections
- **External resource indicators**: Tab-switching patterns (proxy for seeking outside help)

### 2.3 Assessment Behavioral Data

#### Answer Patterns
- **Answer selection sequence**: The order in which they consider/select options
- **Answer changes**: Instances where they changed their selected answer before submitting
- **Change direction**: Changed from correct to incorrect (second-guessing) vs. incorrect to correct (reflection)
- **Option elimination behavior**: Selecting and deselecting options before final choice
- **Position bias**: Tendency to pick options in certain positions (A, B, C, D)

#### Performance Trajectory
- **Score progression across modules**: Improvement or decline over time
- **Error type patterns**: Which types of questions they consistently miss
- **Bloom's level performance**: Scores segmented by cognitive level
- **Retry behavior**: How many times they retry failed assessments
- **Improvement between attempts**: Score delta on retry

#### Confidence Indicators
- **Quick correct answers**: High confidence + correct = mastery
- **Quick incorrect answers**: Overconfidence / misconception
- **Slow correct answers**: Effortful recall but knowledge exists
- **Slow incorrect answers**: Knowledge gap identified
- **Answer change from correct to incorrect**: Lack of confidence in correct knowledge

### 2.4 Engagement Indicators

#### Attention Proxies
- **Tab focus/blur events**: How often and how long they leave the course tab
- **Total focused time vs. elapsed time**: "Attention ratio" — what percentage of session time was actually focused
- **Idle detection**: Periods with no mouse/keyboard/scroll activity while tab is focused
- **Device orientation changes** (mobile): May indicate distraction or repositioning

#### Completion Patterns
- **Content completion rate per section**: Percentage of each section actually viewed
- **Assessment attempt rate**: How many assessments they start vs. complete
- **Course completion velocity**: How quickly they move through the entire course
- **Drop-off points**: Where learners abandon the course

#### Voluntary Engagement
- **Optional content access**: Whether they explore non-required materials
- **Extended reading**: Spending significantly more time than minimum required
- **Multiple session returns**: Coming back to completed content for review
- **Gamification interaction**: Engagement with badges, progress bars, achievements

### 2.5 Learning Path Data

#### Sequence Analysis
- **Module completion order**: Did they follow the recommended sequence?
- **Prerequisites completed vs. skipped**: Self-assessment accuracy
- **Forward/backward navigation ratio**: Exploration style
- **Time to unlock next module**: Pacing through prerequisites

#### Knowledge Retention
- **Score comparison across attempts**: Knowledge decay or growth
- **Return visits to completed content**: Self-initiated review
- **Assessment performance on spaced questions**: Retention over time
- **Error pattern persistence**: Same mistakes repeated = persistent misconception

---

## 3. Complete Data Schema

### 3.1 Core Schema (JSON)

```json
{
  "_v": 2,
  "_ts": 1706000000,
  "_sid": "abc123",

  "timing": {
    "sessionStart": 1706000000,
    "sessionDuration": 0,
    "focusedDuration": 0,
    "pages": {
      "sco_01_p1": {
        "views": 1,
        "totalTime": 45200,
        "focusedTime": 42100,
        "firstView": 1706000010,
        "lastView": 1706000055,
        "scrollDepth": 100,
        "scrollReversals": 2
      }
    },
    "sessions": [
      {
        "start": 1706000000,
        "end": 1706002400,
        "duration": 2400000,
        "focused": 2100000,
        "pagesVisited": 12
      }
    ]
  },

  "navigation": {
    "path": ["intro", "sco_01_p1", "sco_01_p2", "sco_01_p1", "sco_01_quiz"],
    "pathType": "mixed",
    "revisits": {
      "sco_01_p1": 2,
      "sco_02_p3": 1
    },
    "preQuizRevisits": {
      "sco_01": ["sco_01_p1"],
      "sco_02": []
    },
    "prerequisiteCompletion": {
      "completed": ["sco_01"],
      "skipped": []
    },
    "linearRatio": 0.78,
    "backNavigations": 3
  },

  "assessment": {
    "interactions": {
      "q_sco01_1": {
        "type": "choice",
        "bloomsLevel": "understand",
        "attempts": [
          {
            "timestamp": 1706001200,
            "timeToFirstClick": 3200,
            "deliberationTime": 8500,
            "totalTime": 12000,
            "selectedOption": 1,
            "correctOption": 2,
            "result": "incorrect",
            "answerChanges": [
              { "from": 2, "to": 1, "timestamp": 1706001210 }
            ],
            "hintsUsed": 0
          },
          {
            "timestamp": 1706001500,
            "timeToFirstClick": 1800,
            "deliberationTime": 5000,
            "totalTime": 7200,
            "selectedOption": 2,
            "correctOption": 2,
            "result": "correct",
            "answerChanges": [],
            "hintsUsed": 1
          }
        ]
      }
    },
    "scoreProgression": [
      { "sco": "sco_01", "score": 60, "attempt": 1 },
      { "sco": "sco_01", "score": 80, "attempt": 2 },
      { "sco": "sco_02", "score": 90, "attempt": 1 }
    ],
    "bloomsPerformance": {
      "remember": { "correct": 5, "total": 6 },
      "understand": { "correct": 3, "total": 5 },
      "apply": { "correct": 2, "total": 4 },
      "analyze": { "correct": 1, "total": 3 },
      "evaluate": { "correct": 0, "total": 1 },
      "create": { "correct": 0, "total": 0 }
    },
    "optionPositionCounts": {
      "0": 3, "1": 5, "2": 4, "3": 2
    },
    "retryCount": 2,
    "averageRetryInterval": 180000
  },

  "engagement": {
    "focusBlurEvents": [
      { "type": "blur", "ts": 1706000500, "page": "sco_01_p2" },
      { "type": "focus", "ts": 1706000520, "page": "sco_01_p2" }
    ],
    "focusBlurSummary": {
      "totalBlurs": 5,
      "totalBlurDuration": 120000,
      "averageBlurDuration": 24000,
      "longestBlur": 45000
    },
    "attentionRatio": 0.87,
    "idlePeriods": [
      { "start": 1706001800, "duration": 30000, "page": "sco_02_p1" }
    ],
    "optionalContentAccessed": ["glossary_sco01", "bonus_reading_sco02"],
    "helpSeekingEvents": [
      { "type": "hint", "ts": 1706001200, "question": "q_sco01_1" },
      { "type": "revisit", "ts": 1706001250, "target": "sco_01_p1" }
    ],
    "completionRate": {
      "sco_01": 1.0,
      "sco_02": 0.75,
      "overall": 0.85
    },
    "gamificationInteractions": {
      "badgesViewed": 3,
      "progressBarClicks": 2,
      "achievementDismissals": 0
    }
  }
}
```

### 3.2 Compact Schema for SCORM 1.2 (Fits within 4096 chars)

Since SCORM 1.2's `cmi.suspend_data` is limited to 4096 characters, we need a heavily compressed format. This compact schema uses short keys, arrays instead of objects, and only stores the most analytically valuable data.

```json
{
  "v": 2,
  "s": "a1b",
  "t": {
    "ss": 1706000000,
    "sd": 2400,
    "fd": 2100,
    "p": {
      "s1p1": [1, 45, 42, 100, 2],
      "s1p2": [1, 30, 28, 85, 0],
      "s2p1": [2, 60, 55, 100, 3]
    }
  },
  "n": {
    "p": [0, 1, 2, 1, 3, 4, 5],
    "lr": 78,
    "rv": { "1": 2, "5": 1 },
    "bn": 3
  },
  "a": {
    "q": {
      "1": [3200, 8500, 1, 2, 0, 0],
      "2": [1800, 5000, 2, 2, 1, 1],
      "3": [2500, 6000, 0, 0, 1, 0]
    },
    "sp": [60, 80, 90],
    "bp": [5, 6, 3, 5, 2, 4, 1, 3, 0, 1],
    "op": [3, 5, 4, 2],
    "rc": 2
  },
  "e": {
    "ar": 87,
    "tb": 5,
    "bd": 120,
    "oc": 2,
    "hs": 3,
    "cr": 85
  }
}
```

**Compact schema key mappings:**

- `v` = schema version
- `s` = session ID (short hash)
- `t` = timing (`ss`=session start, `sd`=session duration in seconds, `fd`=focused duration, `p`=pages)
- `t.p.{id}` = `[viewCount, totalTimeSec, focusedTimeSec, scrollDepthPct, scrollReversals]`
- `n` = navigation (`p`=path as page index array, `lr`=linear ratio pct, `rv`=revisits, `bn`=back navigations)
- `a` = assessment (`q`=questions, `sp`=score progression, `bp`=blooms performance pairs, `op`=option position counts, `rc`=retry count)
- `a.q.{id}` = `[timeToFirstClickMs, deliberationMs, selectedOption, correctOption, result(0/1), hintsUsed]`
- `a.bp` = paired array `[correct, total, correct, total, ...]` for remember through create
- `e` = engagement (`ar`=attention ratio pct, `tb`=total blurs, `bd`=blur duration sec, `oc`=optional content count, `hs`=help seeking events, `cr`=completion rate pct)

### 3.3 Schema Size Analysis

| Schema Component | Estimated Size | Priority |
|---|---|---|
| Timing (per page, 20 pages) | ~800 chars | High |
| Navigation path (30 entries) | ~200 chars | High |
| Assessment (15 questions) | ~900 chars | Critical |
| Engagement summary | ~200 chars | Medium |
| Metadata & structure | ~150 chars | Required |
| **Total estimate** | **~2,250 chars** | |
| **Available in SCORM 1.2** | **4,096 chars** | |
| **Buffer remaining** | **~1,846 chars** | |

This leaves comfortable headroom for courses up to ~30 pages and ~25 questions.

---

## 4. JavaScript Data Collection Library

### 4.1 BehaviorTracker Core Library

```javascript
/**
 * BehaviorTracker - Behavioral Data Collection for SCORM E-Learning
 *
 * Collects timing, navigation, assessment, and engagement data
 * within SCORM constraints (especially the 4096-char suspend_data limit).
 *
 * Usage:
 *   const tracker = new BehaviorTracker(scormWrapper);
 *   tracker.startSession();
 *   tracker.trackPageView('sco_01_p1');
 *   tracker.trackQuizAttempt('q1', { ... });
 *   tracker.endSession();
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
   * This measures how "sequential" the learner's path is.
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
      // A "forward" move is when the current page ID sorts after the previous
      // This is a simplification; in practice, you'd compare against expected order
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
      // Use setBookmark if available (from existing SCORMWrapper)
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
   * This uses the SCORM interactions data model for quiz data,
   * which is separate from suspend_data and not size-limited in the same way.
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
        // Store via SCORM cmi.interactions
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
      // Short key for page
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

    // Priority 1: Remove navigation path (it's useful but can be reconstructed from other data)
    if (currentSize > target && compressed.n.p) {
      // Truncate to last 20 entries
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
    // If format doesn't match, use a hash
    return pageId.substr(0, 6);
  };

  /**
   * Compress navigation path to page index array.
   */
  BehaviorTracker.prototype._compressPath = function(path) {
    // Create a lookup of unique pages
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
   * SCORM 1.2: HH:MM:SS.SS
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
    // Update running timers before save
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
   * Use this for research export / download.
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
```

### 4.2 Integration Example

Here is how to integrate BehaviorTracker with the existing SCORM content pattern (based on the blockchain-journey-enhanced app.js pattern):

```javascript
// In the main app initialization
const App = {
  tracker: null,

  init() {
    // Initialize SCORM first (existing pattern)
    // ... existing SCORM init code ...

    // Initialize behavioral tracking
    this.tracker = new BehaviorTracker(window.SCORM || null);
    this.tracker.startSession();

    // Track initial page view
    this.tracker.trackPageView('intro');

    // ... rest of existing init code ...
  },

  // When navigating between slides/sections:
  showSlide(slideId) {
    // Track the page view
    if (this.tracker) {
      this.tracker.trackPageView(slideId);
    }

    // ... existing slide rendering code ...
  },

  // When presenting a quiz question:
  showStation(stationId) {
    // ... existing station rendering ...

    // Start tracking the quiz question
    var station = this.courseData.stations.find(function(s) { return s.id === stationId; });
    if (this.tracker && station) {
      this.tracker.startQuizQuestion('station_' + stationId, {
        bloomsLevel: 'understand', // set per-question
        correctOption: station.quiz.correct,
        type: 'choice'
      });
    }
  },

  // When a quiz option is selected:
  selectQuizOption(option) {
    var selectedIndex = parseInt(option.dataset.index);

    // Track the option selection
    if (this.tracker) {
      this.tracker.trackOptionSelect(selectedIndex);
    }

    // ... existing selection logic ...

    // When submitting (after delay):
    if (this.tracker) {
      this.tracker.submitQuizAnswer(selectedIndex);
    }
  },

  // On course completion:
  renderCompletionSlide() {
    if (this.tracker) {
      this.tracker.trackCompletion('overall', 1.0);
      this.tracker.endSession();
    }
    // ... existing completion rendering ...
  }
};

// Handle page unload
window.addEventListener('beforeunload', function() {
  if (App.tracker) {
    App.tracker.endSession();
  }
});
```

---

## 5. SCORM Storage Strategy

### 5.1 Storage Architecture

The system uses a **dual-storage strategy** to maximize data capture within SCORM constraints:

```
┌─────────────────────────────────────────────────────────────┐
│                    SCORM DATA MODEL                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  cmi.suspend_data (4096 chars in SCORM 1.2)                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Compressed behavioral data (JSON)                   │    │
│  │  - Timing summaries per page                         │    │
│  │  - Navigation path & patterns                        │    │
│  │  - Assessment behavioral signals                     │    │
│  │  - Engagement metrics                                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  cmi.interactions.n.* (one per question)                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Standard SCORM interaction records                   │    │
│  │  - Question ID, type, response, result               │    │
│  │  - Latency (response time)                           │    │
│  │  - Correct response pattern                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  cmi.core.score.* / cmi.core.lesson_status                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Standard completion & score data                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  cmi.core.session_time                                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Total session time (calculated from tracking data)  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 What Goes Where

| Data Type | Storage Location | Reason |
|---|---|---|
| Behavioral timing data | `cmi.suspend_data` | Custom data, no standard field |
| Navigation patterns | `cmi.suspend_data` | Custom data, no standard field |
| Engagement metrics | `cmi.suspend_data` | Custom data, no standard field |
| Quiz responses | `cmi.interactions.n.*` | Standard SCORM field, LMS can report on it |
| Response latency | `cmi.interactions.n.latency` | Standard SCORM field |
| Quiz behavioral detail | `cmi.suspend_data` | Time-to-first-click etc. not in standard |
| Overall score | `cmi.core.score.raw` | Standard SCORM field |
| Completion status | `cmi.core.lesson_status` | Standard SCORM field |
| Session time | `cmi.core.session_time` | Standard SCORM field |

### 5.3 SCORM 2004 Extended Strategy

SCORM 2004 provides larger suspend_data (64,000 chars minimum) and additional data elements:

| SCORM 2004 Element | Use for Behavioral Data |
|---|---|
| `cmi.suspend_data` (64KB+) | Full uncompressed behavioral data |
| `cmi.interactions.n.description` | Bloom's level, behavioral flags |
| `cmi.interactions.n.timestamp` | Precise interaction timing |
| `cmi.objectives.n.*` | Per-objective behavioral metrics |
| `cmi.comments_from_learner.n.*` | Learner self-assessment data |

---

## 6. Handling cmi.suspend_data Size Limits

### 6.1 The Challenge

SCORM 1.2 specifies a **minimum** of 4096 characters for `cmi.suspend_data`. Some LMS platforms support more, but you cannot rely on it.

### 6.2 Multi-Layer Compression Strategy

```
Layer 1: Schema Design
  - Short keys (1-2 chars instead of descriptive names)
  - Arrays instead of objects where order is fixed
  - Integer percentages instead of decimal ratios
  - Seconds instead of milliseconds (less digits)
  - Page ID shortening ("sco_01_p1" -> "1.1")

Layer 2: Data Prioritization
  - Assessment behavioral data = CRITICAL (never dropped)
  - Timing summaries = HIGH (reduced before dropped)
  - Navigation path = MEDIUM (truncated then dropped)
  - Detailed event logs = LOW (stored only in memory)

Layer 3: Progressive Reduction
  If data exceeds 4096 chars:
    1. Truncate navigation path to last 20 entries (-200 chars)
    2. Remove revisit details (-100 chars)
    3. Keep only top 15 pages by view count (-300 chars)
    4. Remove navigation path entirely (-200 chars)
    5. Remove page timing (keep only assessment) (-800 chars)

Layer 4: Overflow to cmi.interactions
  - Quiz behavioral data is also stored in cmi.interactions
  - This provides redundancy for the most important data
  - cmi.interactions has a separate size limit (usually generous)
```

### 6.3 Size Budget Breakdown

For a typical course with 20 pages and 15 quiz questions:

```
Component               | Full Size | Compact Size | Priority
------------------------|-----------|--------------|----------
Schema metadata (v,s)   |    50     |     20       | Required
Timing: 20 pages        |  1200     |    400       | High
Timing: sessions        |   300     |      0*      | Low
Navigation: path (30)   |   600     |    150       | Medium
Navigation: metrics     |   200     |     80       | High
Assessment: 15 questions|  2400     |    600       | Critical
Assessment: blooms      |   200     |     50       | High
Assessment: summary     |   150     |     40       | High
Engagement: summary     |   300     |     80       | Medium
                        |-----------|--------------|
TOTAL                   |  5400     |   1420       |
Budget                  |  4096     |   4096       |
Headroom                | OVER by   |   2676       |
                        |  1304     |  remaining   |
```

*Sessions data is reconstructable from page timing and is not stored in compact format.

### 6.4 LMS Compatibility Notes

| LMS | suspend_data Limit | Notes |
|---|---|---|
| Moodle | 4096 (1.2) / 64000 (2004) | Strict enforcement |
| Canvas | 4096 (1.2) | Reliable |
| Blackboard | 4096+ | Often supports more |
| SCORM Cloud | 64000+ | Very generous |
| Cornerstone | 4096 | Strict |
| SAP SuccessFactors | 4096 (1.2) | Strict |

**Recommendation:** Always design for the 4096 minimum. The compact schema above fits comfortably at ~1,400 chars for a 20-page, 15-question course.

---

## 7. Data Dictionary

### 7.1 Timing Data Fields

| Field | Type | Description | Research Use |
|---|---|---|---|
| `timing.sessionStart` | timestamp (ms) | Unix timestamp of session start | Session analysis, time-of-day patterns |
| `timing.sessionDuration` | integer (ms) | Total elapsed time for all sessions | Effort measurement |
| `timing.focusedDuration` | integer (ms) | Time with tab focused | Active engagement time |
| `timing.pages.{id}.views` | integer | Number of times page was viewed | Revisit patterns, difficulty indicators |
| `timing.pages.{id}.totalTime` | integer (ms) | Total time spent on page across all views | Content engagement depth |
| `timing.pages.{id}.focusedTime` | integer (ms) | Time on page while tab was focused | True reading/engagement time |
| `timing.pages.{id}.scrollDepth` | integer (0-100) | Maximum scroll depth reached (%) | Content consumption completeness |
| `timing.pages.{id}.scrollReversals` | integer | Times scroll direction changed | Comprehension difficulty indicator |
| `timing.sessions[].start` | timestamp (ms) | Session start time | Spacing effect analysis |
| `timing.sessions[].end` | timestamp (ms) | Session end time | Session length patterns |
| `timing.sessions[].duration` | integer (ms) | Session duration | Engagement stamina |
| `timing.sessions[].focused` | integer (ms) | Focused time within session | Session quality |
| `timing.sessions[].pagesVisited` | integer | Pages visited in this session | Session productivity |

### 7.2 Navigation Data Fields

| Field | Type | Description | Research Use |
|---|---|---|---|
| `navigation.path` | string[] | Ordered list of all page IDs visited | Path analysis, learning strategy identification |
| `navigation.pathType` | string | "linear", "exploratory", or "mixed" | Learning style indicator |
| `navigation.revisits.{pageId}` | integer | How many extra times page was visited | Difficulty/interest hotspots |
| `navigation.preQuizRevisits.{scoId}` | string[] | Pages revisited before taking quiz | Metacognitive strategy indicator |
| `navigation.prerequisiteCompletion.completed` | string[] | Prerequisites learner completed | Self-regulation quality |
| `navigation.prerequisiteCompletion.skipped` | string[] | Prerequisites learner skipped | Dunning-Kruger indicator |
| `navigation.linearRatio` | float (0-1) | Ratio of forward navigation to total | Learning approach style |
| `navigation.backNavigations` | integer | Number of backward navigation actions | Review behavior, comprehension difficulty |

### 7.3 Assessment Data Fields

| Field | Type | Description | Research Use |
|---|---|---|---|
| `assessment.interactions.{qId}.type` | string | Question type ("choice", "true-false", etc.) | Analysis grouping |
| `assessment.interactions.{qId}.bloomsLevel` | string | Cognitive level from Bloom's taxonomy | ZPD identification, difficulty mapping |
| `assessment.interactions.{qId}.attempts[].timestamp` | timestamp | When the attempt occurred | Temporal analysis |
| `assessment.interactions.{qId}.attempts[].timeToFirstClick` | integer (ms) | Time from question display to first option click | Confidence/automaticity indicator |
| `assessment.interactions.{qId}.attempts[].deliberationTime` | integer (ms) | Time between first click and submission | Decision-making depth |
| `assessment.interactions.{qId}.attempts[].totalTime` | integer (ms) | Total time on question | Overall engagement |
| `assessment.interactions.{qId}.attempts[].selectedOption` | integer | Which option was selected | Response analysis |
| `assessment.interactions.{qId}.attempts[].correctOption` | integer | Which option was correct | Comparison analysis |
| `assessment.interactions.{qId}.attempts[].result` | string | "correct" or "incorrect" | Performance tracking |
| `assessment.interactions.{qId}.attempts[].answerChanges` | array | List of {from, to, timestamp} changes | Second-guessing analysis |
| `assessment.interactions.{qId}.attempts[].hintsUsed` | integer | Number of hints requested | Help-seeking behavior |
| `assessment.scoreProgression[]` | object[] | Array of {sco, score, attempt} | Learning curve analysis |
| `assessment.bloomsPerformance.{level}` | object | {correct, total} per Bloom's level | Cognitive level mastery mapping |
| `assessment.optionPositionCounts.{position}` | integer | How often each position was selected | Position bias detection |
| `assessment.retryCount` | integer | Total retry attempts across all quizzes | Persistence/resilience |
| `assessment.averageRetryInterval` | integer (ms) | Average time between retry attempts | Reflection vs. impulsive retry |

### 7.4 Engagement Data Fields

| Field | Type | Description | Research Use |
|---|---|---|---|
| `engagement.focusBlurEvents[]` | object[] | Array of {type, ts, page} | Attention flow analysis |
| `engagement.focusBlurSummary.totalBlurs` | integer | Total tab-away events | Distraction frequency |
| `engagement.focusBlurSummary.totalBlurDuration` | integer (ms) | Total time away from tab | Attention loss measurement |
| `engagement.focusBlurSummary.averageBlurDuration` | integer (ms) | Average off-tab duration | Distraction pattern |
| `engagement.focusBlurSummary.longestBlur` | integer (ms) | Longest single off-tab period | Major distraction indicator |
| `engagement.attentionRatio` | float (0-1) | focusedDuration / sessionDuration | Core attention metric |
| `engagement.idlePeriods[]` | object[] | Array of {start, duration, page} | Cognitive pause analysis |
| `engagement.optionalContentAccessed` | string[] | IDs of optional content viewed | Intrinsic motivation indicator |
| `engagement.helpSeekingEvents[]` | object[] | Array of {type, ts, target/question} | Metacognitive strategy analysis |
| `engagement.completionRate.{scoId}` | float (0-1) | Completion rate per SCO | Engagement depth per section |
| `engagement.completionRate.overall` | float (0-1) | Overall course completion | Macro engagement metric |
| `engagement.gamificationInteractions.badgesViewed` | integer | Times badges were viewed | Reward motivation indicator |
| `engagement.gamificationInteractions.progressBarClicks` | integer | Times progress bar was clicked | Goal-orientation indicator |
| `engagement.gamificationInteractions.achievementDismissals` | integer | Times achievements were dismissed | Engagement quality signal |

---

## 8. Privacy & Ethics Considerations

### 8.1 Data Minimization Principles

Following the Yunus + Novogratz lens: "Are we seeing beneficiaries as full humans or just data points?"

**What we collect:**
- Behavioral patterns (timing, navigation, clicks)
- Assessment performance and behavioral signals
- Engagement indicators (focus, scroll, optional content)

**What we deliberately DO NOT collect:**
- No personally identifiable information (PII)
- No learner names, emails, or demographics
- No screen recordings or screenshots
- No microphone or camera data
- No external browsing history
- No GPS/location data
- No clipboard content
- No keystroke logging (only event counts)

### 8.2 Ethical Guidelines

1. **Transparency**: Learners should be informed that behavioral data is collected for improving learning experiences
2. **Purpose limitation**: Data is used only for learning analytics and content improvement
3. **No surveillance**: This is not employee monitoring; it is learning optimization
4. **Aggregation**: Individual data should be aggregated for research; individual tracking should be opt-in
5. **Right to forget**: Data should be deletable via course restart
6. **No punitive use**: Behavioral data should never be used for disciplinary actions

### 8.3 Consent Implementation

```javascript
// Optional: Add a consent mechanism
BehaviorTracker.prototype.requestConsent = function(callback) {
  // Show a simple notice (not a blocking modal)
  var notice = document.createElement('div');
  notice.className = 'bt-consent-notice';
  notice.innerHTML =
    '<p>This course collects learning behavior data to improve your experience. ' +
    'No personal information is collected.</p>' +
    '<button class="bt-consent-accept">Continue</button>';

  notice.querySelector('.bt-consent-accept').addEventListener('click', function() {
    notice.remove();
    if (callback) callback(true);
  });

  document.body.appendChild(notice);
};
```

---

## 9. Research Analysis Export

### 9.1 Export Formats

The BehaviorTracker provides two export methods:

**Full Export** (`tracker.exportData()`): Complete JSON data set for detailed analysis. Suitable for importing into R, Python (pandas), or specialized learning analytics tools.

**Summary Export** (`tracker.exportSummary()`): Pre-computed metrics ready for dashboards or quick analysis. Returns a flat object with human-readable values.

### 9.2 Research Questions This Data Can Answer

| Research Question | Data Points Used | Analysis Method |
|---|---|---|
| "Does cognitive load vary by content type?" | Page timing, scroll reversals, idle periods | Compare timing patterns across page types |
| "Are learners using effective study strategies?" | Pre-quiz revisits, navigation path, retry intervals | Classify strategies: rote, elaborative, metacognitive |
| "Which content sections cause the most difficulty?" | Page revisits, time-on-page, scroll depth | Identify outlier pages by multiple metrics |
| "Do learners second-guess correct answers?" | Answer change patterns, time-to-first-click | Correlate answer changes with final correctness |
| "What predicts course completion?" | Attention ratio, session patterns, score progression | Regression analysis on engagement vs. completion |
| "At which Bloom's level do learners struggle?" | Bloom's performance breakdown | Performance by cognitive level |
| "Is the assessment difficulty appropriate?" | Time per question, hint usage, retry rates | Item difficulty analysis |
| "Do learners exhibit satisficing behavior?" | Option position counts, time-to-first-click, navigation efficiency | Behavioral economics analysis |
| "What is the optimal session length?" | Session duration vs. score progression | Correlate session patterns with performance gains |
| "Does spaced practice improve retention?" | Return intervals, score on revisited content | Compare spaced vs. massed practice outcomes |

### 9.3 Recommended Analysis Tools

- **Python + pandas + matplotlib**: General-purpose analysis and visualization
- **R + ggplot2**: Statistical analysis and publication-quality charts
- **Learning Locker / xAPI**: If converting to xAPI format for standardized analytics
- **Tableau / Power BI**: Dashboard visualization for stakeholders
- **SPSS / JASP**: Statistical testing for research papers

---

## 10. Integration Guide

### 10.1 Adding to an Existing SCORM Package

1. Include the `behavior-tracker.js` file in your SCO's HTML:

```html
<script src="shared/js/behavior-tracker.js"></script>
```

2. Initialize after the SCORM API is ready:

```javascript
window.addEventListener('load', function() {
  // Assuming SCORM is already initialized
  var tracker = new BehaviorTracker(window.SCORM);
  tracker.startSession();

  // Make globally accessible
  window.behaviorTracker = tracker;
});
```

3. Add tracking calls to your existing event handlers (see Integration Example in section 4.2).

4. Ensure cleanup on page unload:

```javascript
window.addEventListener('beforeunload', function() {
  if (window.behaviorTracker) {
    window.behaviorTracker.endSession();
  }
});
```

### 10.2 Performance Considerations

- **Auto-save interval**: 30 seconds (configurable). Each save serializes and compresses data, which takes ~1-2ms on modern devices
- **Event listeners**: All scroll and interaction listeners use `{ passive: true }` to avoid blocking the main thread
- **Memory footprint**: The data object typically uses 5-15KB of memory, negligible for any device
- **CPU impact**: Less than 0.1% of CPU time on continuous monitoring
- **No network requests**: All data is stored locally in the SCORM data model

### 10.3 Testing

To test the behavioral tracker without an LMS:

```javascript
// Create a mock SCORM API for standalone testing
var mockSCORM = {
  suspendData: '',
  setBookmark: function(data) { this.suspendData = data; return true; },
  getBookmark: function() { return this.suspendData; },
  commit: function() { return true; },
  recordInteraction: function() { return true; },
  setValue: function() { return true; },
  getValue: function() { return ''; }
};

var tracker = new BehaviorTracker(mockSCORM);
tracker.startSession();

// Simulate user behavior
tracker.trackPageView('sco_01_p1');
// ... wait ...
tracker.trackPageView('sco_01_p2');

// View collected data
console.log(tracker.exportSummary());
console.log(tracker.exportData());
```

### 10.4 Compatibility with Existing SCORM Packages

The BehaviorTracker is designed to **coexist** with existing SCORM data usage. Key considerations:

1. **suspend_data sharing**: If your course already uses `cmi.suspend_data` for bookmarking (as the blockchain-journey course does), you'll need to namespace the data. Store both the bookmark and behavioral data as separate keys in a single JSON object:

```javascript
// Combined storage approach
var combinedData = {
  bookmark: { currentSlide: 'station-3', completedStations: [1, 2] },
  behavior: compressedBehavioralData
};
SCORM.setBookmark(JSON.stringify(combinedData));
```

2. **cmi.interactions**: The tracker appends to existing interactions. It reads `cmi.interactions._count` to find the next available index, avoiding conflicts.

3. **No modification to existing APIs**: The tracker reads from the SCORM wrapper but does not modify its behavior. All existing `setLessonStatus`, `setScore`, etc. continue to work normally.

---

## Appendix A: Behavioral Signal Interpretation Guide

### Quick Reference: What the Numbers Mean

| Metric | Low Value Means | High Value Means | Typical Range |
|---|---|---|---|
| Attention Ratio | Frequent distractions, low engagement | Deep focus, high engagement | 0.65 - 0.95 |
| Linear Navigation Ratio | Exploratory/struggling learner | Sequential/compliant learner | 0.50 - 0.95 |
| Time to First Click (quiz) | Quick recognition / guessing | Careful reading / uncertainty | 1,000 - 15,000 ms |
| Deliberation Time | Confident / impulsive | Thoughtful / uncertain | 2,000 - 30,000 ms |
| Scroll Reversals per page | Easy content / skimming | Difficult content / re-reading | 0 - 5 |
| Answer Changes | Decisive learner | Uncertain / second-guessing | 0 - 3 per quiz |
| Help Seeking Events | Self-sufficient / avoidant | Metacognitively aware | 0 - 10 per session |
| Optional Content Access | Minimum effort | Curious / mastery-oriented | 0 - all available |
| Retry Count | First-attempt mastery | Persistent / struggling | 0 - 3 |

### Behavioral Profiles

**Profile: "The Efficient Learner"**
- High linear ratio, moderate timing, high accuracy, low revisits
- Interprets content quickly and demonstrates competence

**Profile: "The Deep Processor"**
- High time on pages, many scroll reversals, pre-quiz revisits, high attention ratio
- Takes time but achieves thorough understanding

**Profile: "The Struggling Learner"**
- High revisit counts, low attention ratio, long deliberation, answer changes
- Needs additional support or prerequisite review

**Profile: "The Disengaged Learner"**
- Low attention ratio, minimal time on pages, low scroll depth, fast quiz times
- May be completing for compliance rather than learning

**Profile: "The Explorer"**
- Low linear ratio, optional content accessed, high page view counts
- Curious and self-directed, may not follow intended sequence

---

## Appendix B: SCORM Data Model Reference

### SCORM 1.2 Elements Used

| Element | Type | Size Limit | Our Usage |
|---|---|---|---|
| `cmi.suspend_data` | string | 4096 chars | Compressed behavioral data |
| `cmi.interactions.n.id` | string | 255 chars | Question identifier |
| `cmi.interactions.n.type` | string | enum | "choice", "true-false", etc. |
| `cmi.interactions.n.student_response` | string | 255 chars | Selected option |
| `cmi.interactions.n.correct_responses.0.pattern` | string | 255 chars | Correct option |
| `cmi.interactions.n.result` | string | enum | "correct", "incorrect" |
| `cmi.interactions.n.latency` | time | HH:MM:SS | Response time |
| `cmi.interactions.n.time` | time | HH:MM:SS | Timestamp |
| `cmi.core.score.raw` | decimal | - | Final score |
| `cmi.core.lesson_status` | string | enum | Completion status |
| `cmi.core.session_time` | time | HH:MM:SS.SS | Session duration |

### SCORM 2004 Additional Elements

| Element | Type | Our Usage |
|---|---|---|
| `cmi.interactions.n.description` | string | Bloom's level + behavioral flags |
| `cmi.interactions.n.timestamp` | time(second,10,0) | ISO 8601 timestamp |
| `cmi.objectives.n.score.scaled` | real(-1..1) | Per-objective behavioral score |
| `cmi.objectives.n.description` | string | Objective metadata |
