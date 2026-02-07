/**
 * SCORM Content Studio — Lightbox System
 * =========================================
 * Full-screen modal overlay for displaying supplementary content:
 * reference material, glossary details, media, or entire sub-slides.
 *
 * Unlike slide layers (which appear inside the slide area), the lightbox
 * covers the ENTIRE player window — similar to Storyline's lightbox slides.
 *
 * Usage:
 *   // Open with HTML content
 *   Lightbox.open('<h2>Glossary</h2><p>API means...</p>');
 *
 *   // Open with options
 *   Lightbox.open(content, {
 *     closeOnBackdrop: true,    // Click outside to close
 *     closeOnEscape: true,      // Escape key closes
 *     onClose: function() {},   // Callback when closed
 *     ariaLabel: 'Glossary'     // Accessible label
 *   });
 *
 *   // Close programmatically
 *   Lightbox.close();
 *
 * @requires player-shell.css (lightbox styles: .lightbox-overlay, .lightbox-panel, etc.)
 */

(function () {
  'use strict';

  /* =========================================================================
     Lightbox SINGLETON
     ========================================================================= */

  var Lightbox = {
    /** @type {Element|null} */
    _overlay: null,

    /** @type {Element|null} - Element that had focus before lightbox opened */
    _previousFocus: null,

    /** @type {Function|null} - Current focus trap key handler */
    _focusTrapHandler: null,

    /** @type {Function|null} - onClose callback */
    _onClose: null,

    /** @type {boolean} */
    _isOpen: false,

    /* -----------------------------------------------------------------------
       OPEN
       ----------------------------------------------------------------------- */

    /**
     * Opens the lightbox with the given HTML content.
     * @param {string} contentHTML - HTML to render inside the lightbox body
     * @param {Object} [options]
     * @param {boolean} [options.closeOnBackdrop=true]
     * @param {boolean} [options.closeOnEscape=true]
     * @param {string}  [options.ariaLabel='Lightbox']
     * @param {Function} [options.onClose]
     */
    open: function (contentHTML, options) {
      if (this._isOpen) {
        this.close();
      }

      options = Object.assign({
        closeOnBackdrop: true,
        closeOnEscape: true,
        ariaLabel: 'Lightbox',
        onClose: null
      }, options || {});

      this._onClose = options.onClose;
      this._previousFocus = document.activeElement;

      // Create overlay if it doesn't exist
      if (!this._overlay) {
        this._createOverlay();
      }

      // Populate content
      var body = this._overlay.querySelector('.lightbox-body');
      if (body) {
        body.innerHTML = contentHTML;
      }

      // Set ARIA attributes
      var panel = this._overlay.querySelector('.lightbox-panel');
      if (panel) {
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('aria-label', options.ariaLabel);
      }

      // Show with animation
      this._overlay.classList.add('visible');
      this._isOpen = true;

      // Bind events
      this._bindEvents(options);

      // Trap focus
      this._trapFocus();

      // Announce to screen readers
      this._announce('Lightbox opened: ' + options.ariaLabel);
    },

    /* -----------------------------------------------------------------------
       CLOSE
       ----------------------------------------------------------------------- */

    /**
     * Closes the lightbox and restores focus.
     */
    close: function () {
      if (!this._isOpen || !this._overlay) return;

      this._overlay.classList.remove('visible');
      this._isOpen = false;

      // Clean up event listeners
      this._unbindEvents();

      // Release focus trap
      this._releaseFocusTrap();

      // Restore focus
      if (this._previousFocus) {
        this._previousFocus.focus({ preventScroll: true });
        this._previousFocus = null;
      }

      // Callback
      if (this._onClose) {
        this._onClose();
        this._onClose = null;
      }

      this._announce('Lightbox closed');
    },

    /* -----------------------------------------------------------------------
       CREATE OVERLAY
       ----------------------------------------------------------------------- */

    /**
     * Creates the lightbox overlay DOM structure.
     * @private
     */
    _createOverlay: function () {
      var overlay = document.createElement('div');
      overlay.className = 'lightbox-overlay';
      overlay.id = 'lightbox-overlay';
      overlay.innerHTML =
        '<div class="lightbox-panel">' +
          '<button class="lightbox-close" aria-label="Close lightbox">&times;</button>' +
          '<div class="lightbox-body"></div>' +
        '</div>';

      document.body.appendChild(overlay);
      this._overlay = overlay;

      // Close button click
      var self = this;
      var closeBtn = overlay.querySelector('.lightbox-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function () {
          self.close();
        });
      }
    },

    /* -----------------------------------------------------------------------
       EVENT BINDING
       ----------------------------------------------------------------------- */

    /**
     * Binds backdrop click and escape key handlers.
     * @private
     * @param {Object} options
     */
    _bindEvents: function (options) {
      var self = this;

      // Backdrop click
      if (options.closeOnBackdrop) {
        this._backdropHandler = function (e) {
          if (e.target === self._overlay) {
            self.close();
          }
        };
        this._overlay.addEventListener('click', this._backdropHandler);
      }

      // Escape key
      if (options.closeOnEscape) {
        this._escapeHandler = function (e) {
          if (e.key === 'Escape') {
            e.stopPropagation();
            self.close();
          }
        };
        document.addEventListener('keydown', this._escapeHandler);
      }
    },

    /**
     * Removes bound event handlers.
     * @private
     */
    _unbindEvents: function () {
      if (this._backdropHandler && this._overlay) {
        this._overlay.removeEventListener('click', this._backdropHandler);
        this._backdropHandler = null;
      }
      if (this._escapeHandler) {
        document.removeEventListener('keydown', this._escapeHandler);
        this._escapeHandler = null;
      }
    },

    /* -----------------------------------------------------------------------
       FOCUS MANAGEMENT
       ----------------------------------------------------------------------- */

    /**
     * Traps Tab focus inside the lightbox panel.
     * @private
     */
    _trapFocus: function () {
      var panel = this._overlay.querySelector('.lightbox-panel');
      if (!panel) return;

      var self = this;

      this._focusTrapHandler = function (e) {
        if (e.key !== 'Tab') return;

        var focusable = panel.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), ' +
          'select:not([disabled]), textarea:not([disabled]), ' +
          '[tabindex]:not([tabindex="-1"])'
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

      panel.addEventListener('keydown', this._focusTrapHandler);

      // Focus the close button
      requestAnimationFrame(function () {
        var closeBtn = panel.querySelector('.lightbox-close');
        if (closeBtn) closeBtn.focus();
      });
    },

    /**
     * Removes the focus trap handler.
     * @private
     */
    _releaseFocusTrap: function () {
      if (this._focusTrapHandler && this._overlay) {
        var panel = this._overlay.querySelector('.lightbox-panel');
        if (panel) {
          panel.removeEventListener('keydown', this._focusTrapHandler);
        }
        this._focusTrapHandler = null;
      }
    },

    /* -----------------------------------------------------------------------
       UTILITIES
       ----------------------------------------------------------------------- */

    /**
     * Announces a message to screen readers via the live region.
     * @private
     * @param {string} message
     */
    _announce: function (message) {
      var announcer = document.getElementById('player-announcer');
      if (announcer) {
        announcer.textContent = '';
        requestAnimationFrame(function () {
          announcer.textContent = message;
        });
      }
    },

    /**
     * Returns whether the lightbox is currently open.
     * @returns {boolean}
     */
    isOpen: function () {
      return this._isOpen;
    }
  };

  /* =========================================================================
     EXPORT
     ========================================================================= */

  window.Lightbox = Lightbox;

})();
