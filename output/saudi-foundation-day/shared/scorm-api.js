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
      return true;
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
      if (!status || status === 'not attempted') {
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

    if (this.version === '2004') {
      this.setValue(prefix + '.learner_response', data.response);
      this.setValue(prefix + '.correct_responses.0.pattern', data.correct);
    } else {
      this.setValue(prefix + '.student_response', data.response);
      this.setValue(prefix + '.correct_responses.0.pattern', data.correct);
    }

    this.setValue(prefix + '.result', data.result);

    if (data.latency) {
      this.setValue(prefix + '.latency', data.latency);
    }

    if (data.weighting) {
      this.setValue(prefix + '.weighting', data.weighting);
    }

    return true;
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
