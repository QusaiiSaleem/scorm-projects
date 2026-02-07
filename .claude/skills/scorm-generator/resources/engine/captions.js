/**
 * SCORM Content Studio — Closed Captions System
 * ================================================
 * Parses WebVTT (.vtt) files and displays timed captions synced to
 * audio or video playback. Supports multiple languages, font size
 * settings, and RTL text for Arabic captions.
 *
 * Usage:
 *   const captions = new CaptionManager({
 *     container: document.querySelector('.player-content'),
 *     tracks: [
 *       { src: 'captions-en.vtt', lang: 'en', label: 'English', default: true },
 *       { src: 'captions-ar.vtt', lang: 'ar', label: 'Arabic' }
 *     ],
 *     fontSize: 'medium',        // 'small' | 'medium' | 'large'
 *     bgOpacity: 'default',      // 'default' | 'semi' | 'solid'
 *     visible: true              // Initial visibility state
 *   });
 *
 *   // Sync captions with an audio/video element
 *   captions.syncWith(audioElement);
 *
 *   // Or manually set the time (e.g., from a custom timeline)
 *   captions.setTime(12.5);  // seconds
 *
 *   // Toggle visibility
 *   captions.toggle();
 *
 *   // Switch language
 *   captions.setLanguage('ar');
 *
 * WebVTT format supported:
 *   WEBVTT
 *
 *   00:00:01.000 --> 00:00:04.000
 *   Welcome to this lesson.
 *
 *   00:00:05.000 --> 00:00:09.000
 *   Today we will learn about...
 *
 * @requires player-shell.css (caption styles: .caption-container, .caption-text)
 */

(function () {
  'use strict';

  /* =========================================================================
     CaptionManager CLASS
     ========================================================================= */

  /**
   * Manages loading, parsing, and displaying WebVTT captions.
   * @constructor
   * @param {Object} config
   * @param {Element}  config.container - The element to render captions inside
   * @param {Array}    config.tracks - Array of { src, lang, label, default }
   * @param {string}   [config.fontSize='medium'] - 'small' | 'medium' | 'large'
   * @param {string}   [config.bgOpacity='default'] - 'default' | 'semi' | 'solid'
   * @param {boolean}  [config.visible=true] - Whether captions start visible
   */
  function CaptionManager(config) {
    config = config || {};

    this.container = config.container || document.querySelector('.player-content') || document.body;
    this.tracks = config.tracks || [];
    this.fontSize = config.fontSize || 'medium';
    this.bgOpacity = config.bgOpacity || 'default';
    this.visible = config.visible !== false;

    /** @type {string} - Current language code */
    this.currentLang = '';

    /** @type {Map<string, Array>} - Map of lang code to parsed cue array */
    this._parsedTracks = new Map();

    /** @type {Element|null} - The caption display container */
    this._captionEl = null;

    /** @type {Element|null} - The text element inside the container */
    this._textEl = null;

    /** @type {number} - Current playback time in seconds */
    this._currentTime = 0;

    /** @type {HTMLMediaElement|null} - Synced media element */
    this._mediaElement = null;

    /** @type {number|null} - requestAnimationFrame ID for sync loop */
    this._animFrameId = null;

    // Build the caption DOM
    this._createDOM();

    // Load default track
    this._loadDefaultTrack();

    // Expose singleton
    CaptionManager.instance = this;
  }

  /* =========================================================================
     DOM CREATION
     ========================================================================= */

  /**
   * Creates the caption container and text elements.
   * @private
   */
  CaptionManager.prototype._createDOM = function () {
    // Create container
    this._captionEl = document.createElement('div');
    this._captionEl.className = 'caption-container';
    if (!this.visible) {
      this._captionEl.classList.add('hidden');
    }

    // Create text display
    this._textEl = document.createElement('div');
    this._textEl.className = 'caption-text';
    this._textEl.setAttribute('role', 'log');
    this._textEl.setAttribute('aria-live', 'off');
    this._textEl.setAttribute('aria-label', 'Captions');

    // Apply font size class
    if (this.fontSize !== 'medium') {
      this._textEl.classList.add('size-' + this.fontSize);
    }

    // Apply background opacity class
    if (this.bgOpacity === 'semi') {
      this._textEl.classList.add('bg-semi');
    } else if (this.bgOpacity === 'solid') {
      this._textEl.classList.add('bg-solid');
    }

    this._captionEl.appendChild(this._textEl);
    this.container.appendChild(this._captionEl);
  };

  /* =========================================================================
     TRACK LOADING
     ========================================================================= */

  /**
   * Loads the default track (or the first track).
   * @private
   */
  CaptionManager.prototype._loadDefaultTrack = function () {
    if (!this.tracks.length) return;

    var defaultTrack = this.tracks.find(function (t) { return t.default; }) || this.tracks[0];
    this.setLanguage(defaultTrack.lang);
  };

  /**
   * Sets the current caption language and loads its VTT file.
   * @param {string} langCode - e.g. 'en', 'ar'
   */
  CaptionManager.prototype.setLanguage = function (langCode) {
    this.currentLang = langCode;

    // Check if already parsed
    if (this._parsedTracks.has(langCode)) {
      this._updateDisplay();
      return;
    }

    // Find the track
    var track = this.tracks.find(function (t) { return t.lang === langCode; });
    if (!track) return;

    // Load and parse the VTT file
    var self = this;
    this._loadVTT(track.src, function (cues) {
      self._parsedTracks.set(langCode, cues);
      self._updateDisplay();
    });

    // Apply RTL for Arabic/Hebrew/Persian
    var rtlLangs = ['ar', 'he', 'fa', 'ur'];
    if (rtlLangs.indexOf(langCode) !== -1) {
      this._textEl.setAttribute('dir', 'rtl');
      this._textEl.setAttribute('lang', langCode);
    } else {
      this._textEl.setAttribute('dir', 'ltr');
      this._textEl.setAttribute('lang', langCode);
    }
  };

  /**
   * Loads and parses a WebVTT file.
   * @private
   * @param {string} url - Path to the .vtt file
   * @param {Function} callback - Called with array of parsed cues
   */
  CaptionManager.prototype._loadVTT = function (url, callback) {
    var xhr = new XMLHttpRequest();
    var self = this;

    xhr.open('GET', url, true);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        var cues = self._parseVTT(xhr.responseText);
        callback(cues);
      } else {
        console.warn('CaptionManager: Failed to load VTT file:', url, xhr.status);
        callback([]);
      }
    };
    xhr.onerror = function () {
      console.warn('CaptionManager: Network error loading VTT file:', url);
      callback([]);
    };
    xhr.send();
  };

  /* =========================================================================
     VTT PARSING
     ========================================================================= */

  /**
   * Parses a WebVTT string into an array of cue objects.
   * Each cue: { start: seconds, end: seconds, text: string }
   *
   * Supports the core WebVTT format:
   *   WEBVTT
   *   [blank line]
   *   [optional cue identifier]
   *   HH:MM:SS.mmm --> HH:MM:SS.mmm
   *   Caption text (can be multi-line)
   *
   * @private
   * @param {string} vttString
   * @returns {Array<{start: number, end: number, text: string}>}
   */
  CaptionManager.prototype._parseVTT = function (vttString) {
    var cues = [];
    // Normalize line endings
    var text = vttString.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Split into blocks separated by blank lines
    var blocks = text.split(/\n\n+/);

    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i].trim();
      if (!block || block === 'WEBVTT' || block.indexOf('WEBVTT') === 0) continue;

      // Find the timestamp line (contains "-->")
      var lines = block.split('\n');
      var timestampLineIndex = -1;

      for (var j = 0; j < lines.length; j++) {
        if (lines[j].indexOf('-->') !== -1) {
          timestampLineIndex = j;
          break;
        }
      }

      if (timestampLineIndex === -1) continue;

      // Parse timestamps
      var timeParts = lines[timestampLineIndex].split('-->');
      if (timeParts.length !== 2) continue;

      var start = this._parseTimestamp(timeParts[0].trim());
      var end = this._parseTimestamp(timeParts[1].trim().split(' ')[0]); // Remove position settings

      if (start === null || end === null) continue;

      // The remaining lines are the caption text
      var captionText = lines.slice(timestampLineIndex + 1).join('\n').trim();

      // Strip basic HTML tags except <i>, <b>, <u>
      captionText = captionText
        .replace(/<(?!\/?(i|b|u|em|strong)\b)[^>]*>/gi, '')
        .trim();

      if (captionText) {
        cues.push({ start: start, end: end, text: captionText });
      }
    }

    // Sort by start time
    cues.sort(function (a, b) { return a.start - b.start; });

    return cues;
  };

  /**
   * Parses a VTT timestamp string to seconds.
   * Accepts "HH:MM:SS.mmm" or "MM:SS.mmm"
   * @private
   * @param {string} timestamp
   * @returns {number|null}
   */
  CaptionManager.prototype._parseTimestamp = function (timestamp) {
    // Match HH:MM:SS.mmm or MM:SS.mmm
    var match = timestamp.match(/(?:(\d{1,2}):)?(\d{2}):(\d{2})\.(\d{3})/);
    if (!match) return null;

    var hours = parseInt(match[1] || '0', 10);
    var minutes = parseInt(match[2], 10);
    var seconds = parseInt(match[3], 10);
    var millis = parseInt(match[4], 10);

    return hours * 3600 + minutes * 60 + seconds + millis / 1000;
  };

  /* =========================================================================
     MEDIA SYNC
     ========================================================================= */

  /**
   * Syncs caption display with an audio or video element.
   * @param {HTMLMediaElement} mediaElement
   */
  CaptionManager.prototype.syncWith = function (mediaElement) {
    this.unsync();
    this._mediaElement = mediaElement;

    var self = this;

    // Use timeupdate event for sync
    this._timeUpdateHandler = function () {
      self.setTime(mediaElement.currentTime);
    };

    mediaElement.addEventListener('timeupdate', this._timeUpdateHandler);

    // Also start a rAF loop for smoother updates
    this._startSyncLoop();
  };

  /**
   * Stops syncing with any media element.
   */
  CaptionManager.prototype.unsync = function () {
    if (this._mediaElement && this._timeUpdateHandler) {
      this._mediaElement.removeEventListener('timeupdate', this._timeUpdateHandler);
      this._timeUpdateHandler = null;
    }
    this._mediaElement = null;
    this._stopSyncLoop();
  };

  /**
   * Starts a requestAnimationFrame loop for smooth caption sync.
   * @private
   */
  CaptionManager.prototype._startSyncLoop = function () {
    var self = this;
    function loop() {
      if (self._mediaElement && !self._mediaElement.paused) {
        self.setTime(self._mediaElement.currentTime);
      }
      self._animFrameId = requestAnimationFrame(loop);
    }
    this._animFrameId = requestAnimationFrame(loop);
  };

  /**
   * Stops the rAF sync loop.
   * @private
   */
  CaptionManager.prototype._stopSyncLoop = function () {
    if (this._animFrameId) {
      cancelAnimationFrame(this._animFrameId);
      this._animFrameId = null;
    }
  };

  /* =========================================================================
     TIME & DISPLAY
     ========================================================================= */

  /**
   * Sets the current time and updates the displayed caption.
   * @param {number} timeInSeconds
   */
  CaptionManager.prototype.setTime = function (timeInSeconds) {
    this._currentTime = timeInSeconds;
    this._updateDisplay();
  };

  /**
   * Finds and displays the caption cue for the current time.
   * @private
   */
  CaptionManager.prototype._updateDisplay = function () {
    if (!this._textEl) return;

    var cues = this._parsedTracks.get(this.currentLang);
    if (!cues || !cues.length) {
      this._textEl.textContent = '';
      return;
    }

    // Find the active cue for the current time
    var activeCue = null;
    for (var i = 0; i < cues.length; i++) {
      if (this._currentTime >= cues[i].start && this._currentTime < cues[i].end) {
        activeCue = cues[i];
        break;
      }
    }

    // Update display
    if (activeCue) {
      // Use innerHTML to preserve allowed formatting tags (<i>, <b>, <u>)
      if (this._textEl.innerHTML !== activeCue.text) {
        this._textEl.innerHTML = activeCue.text;
      }
      this._captionEl.classList.remove('hidden');
    } else {
      if (this._textEl.textContent !== '') {
        this._textEl.textContent = '';
      }
    }
  };

  /* =========================================================================
     VISIBILITY
     ========================================================================= */

  /**
   * Shows the caption display.
   */
  CaptionManager.prototype.show = function () {
    this.visible = true;
    if (this._captionEl) {
      this._captionEl.classList.remove('hidden');
    }
    this._announce('Captions on');
  };

  /**
   * Hides the caption display.
   */
  CaptionManager.prototype.hide = function () {
    this.visible = false;
    if (this._captionEl) {
      this._captionEl.classList.add('hidden');
    }
    this._announce('Captions off');
  };

  /**
   * Toggles caption visibility.
   */
  CaptionManager.prototype.toggle = function () {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  };

  /* =========================================================================
     FONT SIZE & BACKGROUND
     ========================================================================= */

  /**
   * Sets the caption font size.
   * @param {string} size - 'small' | 'medium' | 'large'
   */
  CaptionManager.prototype.setFontSize = function (size) {
    this.fontSize = size;
    if (!this._textEl) return;

    this._textEl.classList.remove('size-small', 'size-large');
    if (size !== 'medium') {
      this._textEl.classList.add('size-' + size);
    }
  };

  /**
   * Sets the caption background opacity.
   * @param {string} opacity - 'default' | 'semi' | 'solid'
   */
  CaptionManager.prototype.setBgOpacity = function (opacity) {
    this.bgOpacity = opacity;
    if (!this._textEl) return;

    this._textEl.classList.remove('bg-semi', 'bg-solid');
    if (opacity === 'semi') {
      this._textEl.classList.add('bg-semi');
    } else if (opacity === 'solid') {
      this._textEl.classList.add('bg-solid');
    }
  };

  /* =========================================================================
     UTILITIES
     ========================================================================= */

  /**
   * Announces a message via the player's screen reader live region.
   * @private
   * @param {string} message
   */
  CaptionManager.prototype._announce = function (message) {
    var announcer = document.getElementById('player-announcer');
    if (announcer) {
      announcer.textContent = '';
      requestAnimationFrame(function () {
        announcer.textContent = message;
      });
    }
  };

  /**
   * Returns the available track languages.
   * @returns {Array<{lang: string, label: string}>}
   */
  CaptionManager.prototype.getAvailableLanguages = function () {
    return this.tracks.map(function (t) {
      return { lang: t.lang, label: t.label };
    });
  };

  /**
   * Returns the currently active language code.
   * @returns {string}
   */
  CaptionManager.prototype.getCurrentLanguage = function () {
    return this.currentLang;
  };

  /**
   * Cleans up the caption manager (removes DOM, stops sync).
   */
  CaptionManager.prototype.dispose = function () {
    this.unsync();
    if (this._captionEl && this._captionEl.parentNode) {
      this._captionEl.parentNode.removeChild(this._captionEl);
    }
    this._captionEl = null;
    this._textEl = null;
    this._parsedTracks.clear();
    CaptionManager.instance = null;
  };

  /* =========================================================================
     EXPORT
     ========================================================================= */

  /** @type {CaptionManager|null} - Singleton reference */
  CaptionManager.instance = null;

  window.CaptionManager = CaptionManager;

})();
