/**
 * SCORM API Wrapper
 * Provides unified interface for SCORM 1.2 and SCORM 2004
 * Auto-detects API version and handles all communication with LMS
 */

(function(global) {
  'use strict';

  /**
   * SCORMWrapper - Universal SCORM API handler
   */
  function SCORMWrapper() {
    this.api = null;
    this.version = null;
    this.initialized = false;
    this.terminated = false;
  }

  /**
   * Find the SCORM API in the window hierarchy
   */
  SCORMWrapper.prototype.findAPI = function(win) {
    var attempts = 0;
    var maxAttempts = 500;

    while (win && attempts < maxAttempts) {
      // SCORM 2004
      if (win.API_1484_11) {
        this.version = '2004';
        return win.API_1484_11;
      }
      // SCORM 1.2
      if (win.API) {
        this.version = '1.2';
        return win.API;
      }

      // Move up the window hierarchy
      if (win.parent === win) {
        break;
      }
      win = win.parent;
      attempts++;
    }

    // Check opener
    if (window.opener) {
      return this.findAPI(window.opener);
    }

    return null;
  };

  /**
   * Get the SCORM API
   */
  SCORMWrapper.prototype.getAPI = function() {
    if (!this.api) {
      this.api = this.findAPI(window);
    }
    return this.api;
  };

  /**
   * Initialize SCORM session
   */
  SCORMWrapper.prototype.initialize = function() {
    if (this.initialized) {
      return true;
    }

    var api = this.getAPI();
    if (!api) {
      console.warn('SCORM API not found. Running in standalone mode.');
      this.initialized = true; // Allow content to work without LMS
      return false;            // ...and tell the caller there is no session (RTE 3.1.6)
    }

    var result;
    if (this.version === '2004') {
      result = api.Initialize('');
    } else {
      result = api.LMSInitialize('');
    }

    this.initialized = (result === 'true' || result === true);

    if (this.initialized) {
      // Set initial status if not already set
      var status = this.getLessonStatus();
      // SCORM 2004 RTE 4.2.4: a fresh attempt reads "unknown", not "not attempted".
      if (!status || status === 'not attempted' || status === 'unknown') {
        this.setLessonStatus('incomplete');
        this.commit();
      }
    }

    return this.initialized;
  };

  /**
   * Terminate SCORM session
   */
  SCORMWrapper.prototype.terminate = function() {
    if (this.terminated || !this.initialized) {
      return true;
    }

    var api = this.getAPI();
    if (!api) {
      return true;
    }

    var result;
    if (this.version === '2004') {
      result = api.Terminate('');
    } else {
      result = api.LMSFinish('');
    }

    this.terminated = (result === 'true' || result === true);
    return this.terminated;
  };

  /**
   * Get a value from LMS
   */
  SCORMWrapper.prototype.getValue = function(element) {
    var api = this.getAPI();
    if (!api) {
      return '';
    }

    if (this.version === '2004') {
      return api.GetValue(element);
    } else {
      return api.LMSGetValue(element);
    }
  };

  /**
   * Set a value in LMS
   */
  SCORMWrapper.prototype.setValue = function(element, value) {
    var api = this.getAPI();
    if (!api) {
      return true;
    }

    var result;
    if (this.version === '2004') {
      result = api.SetValue(element, value);
    } else {
      result = api.LMSSetValue(element, value);
    }

    return result === 'true' || result === true;
  };

  /**
   * Commit data to LMS
   */
  SCORMWrapper.prototype.commit = function() {
    var api = this.getAPI();
    if (!api) {
      return true;
    }

    var result;
    if (this.version === '2004') {
      result = api.Commit('');
    } else {
      result = api.LMSCommit('');
    }

    return result === 'true' || result === true;
  };

  /**
   * Get last error
   */
  SCORMWrapper.prototype.getLastError = function() {
    var api = this.getAPI();
    if (!api) {
      return 0;
    }

    if (this.version === '2004') {
      return api.GetLastError();
    } else {
      return api.LMSGetLastError();
    }
  };

  /**
   * Get error description
   */
  SCORMWrapper.prototype.getErrorString = function(errorCode) {
    var api = this.getAPI();
    if (!api) {
      return '';
    }

    if (this.version === '2004') {
      return api.GetErrorString(errorCode);
    } else {
      return api.LMSGetErrorString(errorCode);
    }
  };

  // ============================================
  // Convenience Methods
  // ============================================

  /**
   * Get lesson status
   */
  SCORMWrapper.prototype.getLessonStatus = function() {
    if (this.version === '2004') {
      var completion = this.getValue('cmi.completion_status');
      var success = this.getValue('cmi.success_status');
      if (success === 'passed' || success === 'failed') {
        return success;
      }
      return completion;
    } else {
      return this.getValue('cmi.core.lesson_status');
    }
  };

  /**
   * Set lesson status
   * @param {string} status - 'incomplete', 'completed', 'passed', 'failed'
   */
  SCORMWrapper.prototype.setLessonStatus = function(status) {
    if (this.version === '2004') {
      if (status === 'passed' || status === 'failed') {
        this.setValue('cmi.success_status', status);
        this.setValue('cmi.completion_status', 'completed');
      } else if (status === 'completed' || status === 'incomplete') {
        this.setValue('cmi.completion_status', status);
      }
    } else {
      this.setValue('cmi.core.lesson_status', status);
    }
    return true;
  };

  /**
   * Set score
   * @param {number} score - Raw score value
   * @param {number} max - Maximum possible score (default 100)
   * @param {number} min - Minimum possible score (default 0)
   */
  SCORMWrapper.prototype.setScore = function(score, max, min) {
    max = max || 100;
    min = min || 0;

    if (this.version === '2004') {
      var scaled = (score - min) / (max - min);
      this.setValue('cmi.score.scaled', scaled.toFixed(2));
      this.setValue('cmi.score.raw', score);
      this.setValue('cmi.score.max', max);
      this.setValue('cmi.score.min', min);
    } else {
      this.setValue('cmi.core.score.raw', score);
      this.setValue('cmi.core.score.max', max);
      this.setValue('cmi.core.score.min', min);
    }
    return true;
  };

  /**
   * Get score
   */
  SCORMWrapper.prototype.getScore = function() {
    if (this.version === '2004') {
      return parseFloat(this.getValue('cmi.score.raw')) || 0;
    } else {
      return parseFloat(this.getValue('cmi.core.score.raw')) || 0;
    }
  };

  /**
   * Set session time
   * @param {number} seconds - Time in seconds
   */
  SCORMWrapper.prototype.setSessionTime = function(seconds) {
    var timeString;

    if (this.version === '2004') {
      // ISO 8601 duration format: PT#H#M#S
      var hours = Math.floor(seconds / 3600);
      var minutes = Math.floor((seconds % 3600) / 60);
      var secs = seconds % 60;
      timeString = 'PT' + hours + 'H' + minutes + 'M' + secs + 'S';
      this.setValue('cmi.session_time', timeString);
    } else {
      // SCORM 1.2 format: HH:MM:SS.SS
      var h = Math.floor(seconds / 3600);
      var m = Math.floor((seconds % 3600) / 60);
      var s = seconds % 60;
      timeString = this.padZero(h) + ':' + this.padZero(m) + ':' + this.padZero(s);
      this.setValue('cmi.core.session_time', timeString);
    }
    return true;
  };

  /**
   * Get/Set bookmark (suspend_data)
   */
  SCORMWrapper.prototype.getBookmark = function() {
    return this.getValue('cmi.suspend_data');
  };

  SCORMWrapper.prototype.setBookmark = function(data) {
    return this.setValue('cmi.suspend_data', data);
  };

  /** Exit mode (SCORM 1.2 RTE 3.4 cmi.core.exit; 2004 RTE 4.2.8 cmi.exit): "" when completed, "suspend" otherwise. */
  SCORMWrapper.prototype.setExit = function(completed) {
    return this.setValue(this.version === '2004' ? 'cmi.exit' : 'cmi.core.exit', completed ? '' : 'suspend');
  };
  /** The bookmark (1.2 cmi.core.lesson_location; 2004 RTE 4.2.14 cmi.location). */
  SCORMWrapper.prototype.setLocation = function(location) {
    return this.setValue(this.version === '2004' ? 'cmi.location' : 'cmi.core.lesson_location', location);
  };
  SCORMWrapper.prototype.getLocation = function() {
    return this.getValue(this.version === '2004' ? 'cmi.location' : 'cmi.core.lesson_location');
  };
  /** Has this attempt been finished? 2004 RTE 4.2.4: completion_status alone says so
   *  (success is a separate answer); 1.2: lesson_status completed or passed. */
  SCORMWrapper.prototype.isFinished = function() {
    if (this.version === '2004') { return this.getValue('cmi.completion_status') === 'completed'; }
    var s = this.getValue('cmi.core.lesson_status');
    return s === 'completed' || s === 'passed';
  };
  /** 2004 RTE 4.2.18 cmi.progress_measure, 0..1. SCORM 1.2 has no such element. */
  SCORMWrapper.prototype.setProgress = function(fraction) {
    if (this.version !== '2004') { return true; }
    var f = Math.max(0, Math.min(1, Number(fraction) || 0));
    return this.setValue('cmi.progress_measure', String(Math.round(f * 10000) / 10000));
  };
  /** The language a 2004 description is tagged with (RTE 4.1.1.7 localized_string_type: "{lang=xx}" prefix). */
  SCORMWrapper.prototype.language = 'en';

  /**
   * Get learner name
   */
  SCORMWrapper.prototype.getLearnerName = function() {
    if (this.version === '2004') {
      return this.getValue('cmi.learner_name');
    } else {
      return this.getValue('cmi.core.student_name');
    }
  };

  /**
   * Get learner ID
   */
  SCORMWrapper.prototype.getLearnerId = function() {
    if (this.version === '2004') {
      return this.getValue('cmi.learner_id');
    } else {
      return this.getValue('cmi.core.student_id');
    }
  };

  /**
   * Record an interaction (quiz question)
   * @param {number} index - Interaction index
   * @param {object} data - Interaction data
   */
  SCORMWrapper.prototype.recordInteraction = function(index, data) {
    var prefix = 'cmi.interactions.' + index;
    this.setValue(prefix + '.id', data.id || 'interaction_' + index);
    this.setValue(prefix + '.type', data.type || 'choice');
    var hasCorrect = data.correct !== undefined && data.correct !== null;
    if (this.version === '2004') {
      // SCORM 2004 RTE 4.2.9: the engine formats values for 1.2 (RTE 3.4:
      // comma-joined choices, a.x pairs, min:max ranges, HH:MM:SS latency,
      // "wrong"); here the same facts are re-spelled -- [,] [.] [:]
      // delimiters, "incorrect", a timeinterval latency, one pattern per
      // fill-in alternative, a numeric pattern always as a range (equal
      // endpoints for one value), and the description with its language.
      var t = data.type || 'choice';
      this.setValue(prefix + '.learner_response', SCORMWrapper.to2004Response(t, data.response, 'scorm2004'));
      if (hasCorrect) {
        var patterns = SCORMWrapper.to2004Patterns(t, data.correct, 'scorm2004');
        for (var p = 0; p < patterns.length; p++) {
          this.setValue(prefix + '.correct_responses.' + p + '.pattern', patterns[p]);
        }
      }
      if (data.description) {
        this.setValue(prefix + '.description', '{lang=' + this.language + '}' + String(data.description).slice(0, 250));
      }
      this.setValue(prefix + '.result', data.result === 'wrong' ? 'incorrect' : data.result);
      if (data.latency) { this.setValue(prefix + '.latency', SCORMWrapper.toTimeinterval(data.latency)); }
    } else {
      this.setValue(prefix + '.student_response', data.response);
      if (hasCorrect) {
        this.setValue(prefix + '.correct_responses.0.pattern', data.correct);
      }
      this.setValue(prefix + '.result', data.result);
      if (data.latency) {
        this.setValue(prefix + '.latency', data.latency);
      }
    }
    if (data.weighting) {
      this.setValue(prefix + '.weighting', data.weighting);
    }
    return true;
  };

  /**
   * 1.2 -> 2004 / xAPI response spelling (SCORM 2004 RTE 4.2.9; xAPI Data
   * 2.4.4.1 uses the same bracketed delimiters). `flavor` is 'scorm2004' or
   * 'xapi'; they differ in one place: a single numeric value is a range with
   * equal endpoints on 2004 and may be bare on xAPI. Shared with cmi5-wire.js.
   */
  SCORMWrapper.to2004Response = function(type, value, flavor) {
    var s = value === undefined || value === null ? '' : String(value);
    if (type === 'choice' || type === 'sequencing') { return s.split(',').filter(Boolean).join('[,]'); }
    if (type === 'matching') { return s.split(',').filter(Boolean).map(function (pair) { return pair.replace('.', '[.]'); }).join('[,]'); }
    return s;
  };
  SCORMWrapper.to2004Patterns = function(type, value, flavor) {
    var s = value === undefined || value === null ? '' : String(value);
    if (type === 'fill-in') { return s.split(',').filter(Boolean); }
    if (type === 'numeric') {
      if (s.indexOf(':') > -1) { return [s.replace(':', '[:]')]; }
      return [flavor === 'xapi' || s === '' ? s : s + '[:]' + s];
    }
    return [SCORMWrapper.to2004Response(type, s, flavor)];
  };
  /** HH:MM:SS(.ff) -> PT#H#M#S (2004 RTE timeinterval, second); already ISO? returned as is. */
  SCORMWrapper.toTimeinterval = function(value) {
    var s = String(value);
    if (s.charAt(0) === 'P') { return s; }
    var m = /^(\d+):(\d+):(\d+(?:\.\d+)?)$/.exec(s);
    if (!m) { return 'PT0S'; }
    var h = Number(m[1]), mi = Number(m[2]), se = Number(m[3]);
    var out = 'PT' + (h ? h + 'H' : '') + (mi ? mi + 'M' : '');
    if (se || (!h && !mi)) { out += String(se) + 'S'; }
    return out;
  };

  // ============================================
  // Utility Methods
  // ============================================

  SCORMWrapper.prototype.padZero = function(num) {
    return (num < 10 ? '0' : '') + num;
  };

  SCORMWrapper.prototype.isAvailable = function() {
    return this.getAPI() !== null;
  };

  SCORMWrapper.prototype.getVersion = function() {
    this.getAPI();
    return this.version;
  };

  // Export
  global.SCORMWrapper = SCORMWrapper;

})(typeof window !== 'undefined' ? window : this);
