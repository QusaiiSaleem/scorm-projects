/**
 * SCORM Content Studio — Layer System
 * ======================================
 * Manages overlay layers on the current slide — similar to Storyline's
 * slide layers for feedback, click-to-reveal, modals, and detail panels.
 *
 * A "layer" is a panel that appears ON TOP of the current slide content.
 * It can block interaction with the base slide, trap keyboard focus,
 * and auto-close when another layer opens.
 *
 * Usage:
 *   const layers = new LayerManager();
 *
 *   // Show a layer
 *   layers.show('feedback-correct', {
 *     preventBaseClick: true,
 *     hideOtherLayers: true,
 *     closeOnBackdropClick: true,
 *     transition: 'fade',       // 'fade' | 'slide-up' | 'slide-down' | 'scale'
 *     onShow: function() {},
 *     onHide: function() {}
 *   });
 *
 *   // Hide a specific layer
 *   layers.hide('feedback-correct');
 *
 *   // Hide all layers
 *   layers.hideAll();
 *
 * Expected HTML structure:
 *   <div class="slide active">
 *     <!-- Base slide content -->
 *     <div class="slide-layer-overlay" id="layer-feedback-correct" data-layer="feedback-correct">
 *       <div class="slide-layer">
 *         <button class="slide-layer-close" aria-label="Close">&times;</button>
 *         <div class="layer-content">
 *           <h3>Correct!</h3>
 *           <p>Great job.</p>
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 *
 * Layers can also be created dynamically via layers.create().
 *
 * @requires player-shell.css (layer styles)
 */

(function () {
  'use strict';

  /* =========================================================================
     TRANSITION CONSTANTS
     ========================================================================= */

  var TRANSITIONS = {
    FADE: 'fade',
    SLIDE_UP: 'slide-up',
    SLIDE_DOWN: 'slide-down',
    SCALE: 'scale'
  };

  /* =========================================================================
     LayerManager CLASS
     ========================================================================= */

  /**
   * Manages show/hide lifecycle of slide layers.
   * @constructor
   * @param {Object} [options]
   * @param {Element} [options.container] - The element containing layers
   *   (defaults to the active slide or .player-content)
   */
  function LayerManager(options) {
    options = options || {};
    this.container = options.container ||
      document.querySelector('.player-content') ||
      document.body;

    /** @type {Map<string, Object>} - Map of layerId to config */
    this.layers = new Map();

    /** @type {string|null} - Currently visible layer ID */
    this.activeLayerId = null;

    /** @type {Element|null} - Element that had focus before layer opened */
    this._previousFocus = null;

    /** @type {Function|null} - Current focus trap handler */
    this._focusTrapHandler = null;

    // Auto-register any existing layer elements in the DOM
    this._discoverLayers();
  }

  /* =========================================================================
     LAYER DISCOVERY
     ========================================================================= */

  /**
   * Finds all .slide-layer-overlay elements and registers them.
   * @private
   */
  LayerManager.prototype._discoverLayers = function () {
    var overlays = document.querySelectorAll('.slide-layer-overlay');
    var self = this;

    overlays.forEach(function (overlay) {
      var id = overlay.getAttribute('data-layer') || overlay.id;
      if (id) {
        self.layers.set(id, { element: overlay, options: {} });
        self._bindLayerClose(overlay, id);
      }
    });
  };

  /**
   * Binds close button and backdrop click for a layer element.
   * @private
   * @param {Element} overlay
   * @param {string} layerId
   */
  LayerManager.prototype._bindLayerClose = function (overlay, layerId) {
    var self = this;

    // Close button
    var closeBtn = overlay.querySelector('.slide-layer-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        self.hide(layerId);
      });
    }

    // Escape key
    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        self.hide(layerId);
      }
    });
  };

  /* =========================================================================
     SHOW LAYER
     ========================================================================= */

  /**
   * Shows a layer by its ID.
   * @param {string} layerId - The layer identifier
   * @param {Object} [options]
   * @param {boolean} [options.preventBaseClick=true] - Block clicks on base slide
   * @param {boolean} [options.hideOtherLayers=true] - Hide other layers first
   * @param {boolean} [options.closeOnBackdropClick=true] - Click backdrop to close
   * @param {string}  [options.transition='fade'] - Transition type
   * @param {Function} [options.onShow] - Called after layer is shown
   * @param {Function} [options.onHide] - Called after layer is hidden
   */
  LayerManager.prototype.show = function (layerId, options) {
    options = Object.assign({
      preventBaseClick: true,
      hideOtherLayers: true,
      closeOnBackdropClick: true,
      transition: TRANSITIONS.FADE,
      onShow: null,
      onHide: null
    }, options || {});

    // Hide other layers first (if configured)
    if (options.hideOtherLayers) {
      this.hideAll();
    }

    // Find the layer element
    var layerData = this.layers.get(layerId);
    if (!layerData) {
      // Layer not in DOM yet — check if there's an element with this ID
      var el = document.querySelector('[data-layer="' + layerId + '"]') ||
               document.getElementById('layer-' + layerId);
      if (!el) return;
      layerData = { element: el, options: {} };
      this.layers.set(layerId, layerData);
      this._bindLayerClose(el, layerId);
    }

    var overlay = layerData.element;
    layerData.options = options;

    // Store the element that currently has focus (to restore later)
    this._previousFocus = document.activeElement;

    // Apply transition class
    this._applyTransition(overlay, options.transition);

    // Show the layer
    overlay.classList.add('visible');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    // Backdrop click
    if (options.closeOnBackdropClick) {
      this._setupBackdropClick(overlay, layerId);
    }

    // Focus trap
    this._trapFocus(overlay);

    // Track active layer
    this.activeLayerId = layerId;

    // Callback
    if (options.onShow) {
      options.onShow();
    }

    // Dispatch custom event
    this._dispatchEvent('layershow', { layerId: layerId });

    // Screen reader announcement
    this._announce('Dialog opened');
  };

  /* =========================================================================
     HIDE LAYER
     ========================================================================= */

  /**
   * Hides a specific layer.
   * @param {string} layerId
   */
  LayerManager.prototype.hide = function (layerId) {
    var layerData = this.layers.get(layerId);
    if (!layerData) return;

    var overlay = layerData.element;
    overlay.classList.remove('visible');
    overlay.removeAttribute('aria-modal');

    // Release focus trap
    this._releaseFocusTrap();

    // Restore focus to the element that triggered the layer
    if (this._previousFocus) {
      this._previousFocus.focus({ preventScroll: true });
      this._previousFocus = null;
    }

    // Clear active layer
    if (this.activeLayerId === layerId) {
      this.activeLayerId = null;
    }

    // Callback
    if (layerData.options.onHide) {
      layerData.options.onHide();
    }

    // Dispatch custom event
    this._dispatchEvent('layerhide', { layerId: layerId });

    this._announce('Dialog closed');
  };

  /**
   * Hides all visible layers.
   */
  LayerManager.prototype.hideAll = function () {
    var self = this;
    this.layers.forEach(function (data, id) {
      if (data.element.classList.contains('visible')) {
        self.hide(id);
      }
    });
  };

  /* =========================================================================
     CREATE LAYER (DYNAMIC)
     ========================================================================= */

  /**
   * Creates a new layer element dynamically and adds it to the DOM.
   * @param {string} layerId - Unique identifier
   * @param {string} contentHTML - Inner HTML for the layer content
   * @param {Object} [options] - Same as show() options
   * @returns {Element} The created overlay element
   */
  LayerManager.prototype.create = function (layerId, contentHTML, options) {
    // Remove existing layer with same ID if present
    this.destroy(layerId);

    // Build the overlay structure
    var overlay = document.createElement('div');
    overlay.className = 'slide-layer-overlay';
    overlay.setAttribute('data-layer', layerId);
    overlay.id = 'layer-' + layerId;
    overlay.innerHTML =
      '<div class="slide-layer">' +
        '<button class="slide-layer-close" aria-label="Close">&times;</button>' +
        '<div class="layer-content">' + contentHTML + '</div>' +
      '</div>';

    // Attach to the active slide or the content area
    var activeSlide = document.querySelector('.slide.active');
    var target = activeSlide || this.container;
    target.appendChild(overlay);

    // Register and bind
    this.layers.set(layerId, { element: overlay, options: {} });
    this._bindLayerClose(overlay, layerId);

    // Optionally show immediately
    if (options) {
      this.show(layerId, options);
    }

    return overlay;
  };

  /**
   * Removes a dynamically created layer from the DOM.
   * @param {string} layerId
   */
  LayerManager.prototype.destroy = function (layerId) {
    var layerData = this.layers.get(layerId);
    if (!layerData) return;

    // Hide first (to clean up focus trap, etc.)
    if (layerData.element.classList.contains('visible')) {
      this.hide(layerId);
    }

    // Remove from DOM
    if (layerData.element.parentNode) {
      layerData.element.parentNode.removeChild(layerData.element);
    }

    this.layers.delete(layerId);
  };

  /* =========================================================================
     FEEDBACK LAYER HELPERS
     ========================================================================= */

  /**
   * Shows a "correct" feedback layer.
   * @param {string} message
   * @param {Object} [options]
   */
  LayerManager.prototype.showCorrectFeedback = function (message, options) {
    this.create('feedback-correct',
      '<div class="feedback-correct">' +
        '<span aria-hidden="true" style="font-size:24px;">&#10004;</span>' +
        '<div>' + this._escapeHTML(message) + '</div>' +
      '</div>',
      Object.assign({
        preventBaseClick: true,
        closeOnBackdropClick: true,
        transition: TRANSITIONS.SCALE
      }, options || {})
    );
  };

  /**
   * Shows an "incorrect / try again" feedback layer.
   * @param {string} message
   * @param {Object} [options]
   */
  LayerManager.prototype.showIncorrectFeedback = function (message, options) {
    this.create('feedback-incorrect',
      '<div class="feedback-incorrect">' +
        '<span aria-hidden="true" style="font-size:24px;">&#9733;</span>' +
        '<div>' + this._escapeHTML(message) + '</div>' +
      '</div>',
      Object.assign({
        preventBaseClick: true,
        closeOnBackdropClick: true,
        transition: TRANSITIONS.SCALE
      }, options || {})
    );
  };

  /**
   * Shows a generic information layer.
   * @param {string} title
   * @param {string} bodyHTML - Can contain HTML
   * @param {Object} [options]
   */
  LayerManager.prototype.showInfo = function (title, bodyHTML, options) {
    this.create('info-layer',
      '<h3>' + this._escapeHTML(title) + '</h3>' +
      '<div>' + bodyHTML + '</div>',
      Object.assign({
        preventBaseClick: true,
        closeOnBackdropClick: true,
        transition: TRANSITIONS.FADE
      }, options || {})
    );
  };

  /* =========================================================================
     TRANSITIONS
     ========================================================================= */

  /**
   * Applies transition styles to the layer's inner panel.
   * @private
   * @param {Element} overlay
   * @param {string} transition
   */
  LayerManager.prototype._applyTransition = function (overlay, transition) {
    var panel = overlay.querySelector('.slide-layer');
    if (!panel) return;

    // Reset transform
    panel.style.transform = '';
    panel.style.transition = 'transform 0.25s ease, opacity 0.25s ease';

    switch (transition) {
      case TRANSITIONS.SLIDE_UP:
        panel.style.transform = 'translateY(30px)';
        requestAnimationFrame(function () {
          panel.style.transform = 'translateY(0)';
        });
        break;

      case TRANSITIONS.SLIDE_DOWN:
        panel.style.transform = 'translateY(-30px)';
        requestAnimationFrame(function () {
          panel.style.transform = 'translateY(0)';
        });
        break;

      case TRANSITIONS.SCALE:
        panel.style.transform = 'scale(0.9)';
        requestAnimationFrame(function () {
          panel.style.transform = 'scale(1)';
        });
        break;

      case TRANSITIONS.FADE:
      default:
        // CSS handles the fade via opacity on .visible
        panel.style.transform = 'scale(1)';
        break;
    }
  };

  /* =========================================================================
     FOCUS MANAGEMENT
     ========================================================================= */

  /**
   * Traps keyboard focus inside a layer element.
   * @private
   * @param {Element} overlay
   */
  LayerManager.prototype._trapFocus = function (overlay) {
    var self = this;
    var layerPanel = overlay.querySelector('.slide-layer') || overlay;

    this._focusTrapHandler = function (e) {
      if (e.key !== 'Tab') return;

      var focusable = layerPanel.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
        'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    overlay.addEventListener('keydown', this._focusTrapHandler);

    // Focus the close button or first focusable element
    requestAnimationFrame(function () {
      var closeBtn = layerPanel.querySelector('.slide-layer-close');
      var firstFocusable = layerPanel.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (closeBtn) {
        closeBtn.focus();
      } else if (firstFocusable) {
        firstFocusable.focus();
      }
    });
  };

  /**
   * Removes the focus trap handler.
   * @private
   */
  LayerManager.prototype._releaseFocusTrap = function () {
    if (this._focusTrapHandler) {
      // Remove from all overlays (safe to call even if not attached)
      this.layers.forEach(function (data) {
        data.element.removeEventListener('keydown', this._focusTrapHandler);
      }.bind(this));
      this._focusTrapHandler = null;
    }
  };

  /* =========================================================================
     BACKDROP CLICK
     ========================================================================= */

  /**
   * Closes the layer when the user clicks the overlay backdrop
   * (but NOT the inner panel).
   * @private
   * @param {Element} overlay
   * @param {string} layerId
   */
  LayerManager.prototype._setupBackdropClick = function (overlay, layerId) {
    var self = this;

    // Use a named handler so we can potentially remove it
    overlay._backdropHandler = function (e) {
      // Only close if clicking on the overlay itself, not the panel inside
      if (e.target === overlay) {
        self.hide(layerId);
      }
    };

    overlay.addEventListener('click', overlay._backdropHandler);
  };

  /* =========================================================================
     UTILITIES
     ========================================================================= */

  /**
   * Dispatches a custom event from the document.
   * @private
   * @param {string} eventName
   * @param {Object} detail
   */
  LayerManager.prototype._dispatchEvent = function (eventName, detail) {
    document.dispatchEvent(new CustomEvent(eventName, { detail: detail }));
  };

  /**
   * Announces a message to screen readers.
   * @private
   * @param {string} message
   */
  LayerManager.prototype._announce = function (message) {
    var announcer = document.getElementById('player-announcer');
    if (announcer) {
      announcer.textContent = '';
      requestAnimationFrame(function () {
        announcer.textContent = message;
      });
    }
  };

  /**
   * Escapes HTML characters.
   * @private
   * @param {string} str
   * @returns {string}
   */
  LayerManager.prototype._escapeHTML = function (str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  /**
   * Returns whether any layer is currently visible.
   * @returns {boolean}
   */
  LayerManager.prototype.isAnyVisible = function () {
    return this.activeLayerId !== null;
  };

  /**
   * Returns the ID of the currently active layer, or null.
   * @returns {string|null}
   */
  LayerManager.prototype.getActiveLayerId = function () {
    return this.activeLayerId;
  };

  /* =========================================================================
     EXPORT
     ========================================================================= */

  window.LayerManager = LayerManager;

})();
