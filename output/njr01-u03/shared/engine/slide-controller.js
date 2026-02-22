/**
 * SCORM Content Studio — Slide Controller
 * =========================================
 * Manages fixed-slide navigation (Storyline-like behavior).
 * Each .slide element inside .sco-content is one "screen".
 * Only the .active slide is visible. Prev/Next buttons navigate between slides.
 *
 * Usage:
 *   const controller = new SlideController({
 *     onSlideChange: function(index, total) { ... },
 *     onComplete: function() { ... }
 *   });
 *
 * HTML structure expected:
 *   <div class="sco-container">
 *     <header class="nav-bar">...</header>
 *     <main class="sco-content">
 *       <div class="slide" data-slide="0">...</div>
 *       <div class="slide" data-slide="1">...</div>
 *       <div class="slide" data-slide="2">...</div>
 *     </main>
 *     <nav class="sco-nav">
 *       <button class="btn-prev" id="prevBtn">Previous</button>
 *       <span class="page-indicator" id="pageIndicator">1 / 3</span>
 *       <button class="btn-next" id="nextBtn">Next</button>
 *     </nav>
 *   </div>
 */

(function() {
  'use strict';

  function SlideController(options) {
    options = options || {};

    this.slides = document.querySelectorAll('.slide');
    this.currentIndex = 0;
    this.totalSlides = this.slides.length;
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.pageIndicator = document.getElementById('pageIndicator');
    this.progressFill = document.querySelector('.progress-fill');
    this.onSlideChange = options.onSlideChange || null;
    this.onComplete = options.onComplete || null;
    this.animating = false;

    // Initialize
    if (this.totalSlides > 0) {
      this._showSlide(this.currentIndex, false);
      this._bindEvents();
      this._updateUI();
    }
  }

  SlideController.prototype._showSlide = function(index, animate) {
    var self = this;

    // Hide all slides
    for (var i = 0; i < this.slides.length; i++) {
      if (i !== index) {
        this.slides[i].classList.remove('active', 'animate-in');
        this.slides[i].style.display = 'none';
      }
    }

    // Show target slide
    var targetSlide = this.slides[index];
    targetSlide.style.display = 'flex';
    targetSlide.classList.add('active');

    if (animate) {
      targetSlide.classList.add('animate-in');
      // Remove animation class after it completes
      setTimeout(function() {
        targetSlide.classList.remove('animate-in');
      }, 400);
    }

    // Scroll to top within the slide (in case it has internal scroll)
    targetSlide.scrollTop = 0;

    // Auto-detect if content needs top alignment
    var inner = targetSlide.querySelector('.slide-inner');
    if (inner) {
      // If content is taller than ~70% of viewport, align top
      if (inner.scrollHeight > targetSlide.clientHeight * 0.7) {
        inner.classList.add('align-top');
      } else {
        inner.classList.remove('align-top');
      }
    }
  };

  SlideController.prototype._updateUI = function() {
    // Update page indicator
    if (this.pageIndicator) {
      this.pageIndicator.textContent =
        (this.currentIndex + 1) + ' / ' + this.totalSlides;
    }

    // Update progress bar
    if (this.progressFill) {
      var progress = ((this.currentIndex + 1) / this.totalSlides) * 100;
      this.progressFill.style.width = progress + '%';
    }

    // Update prev button
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentIndex === 0;
    }

    // Update next button text on last slide
    if (this.nextBtn) {
      if (this.currentIndex === this.totalSlides - 1) {
        // Check if there's a data attribute for complete text
        this.nextBtn.textContent =
          this.nextBtn.getAttribute('data-complete-text') || 'Complete';
      } else {
        this.nextBtn.textContent =
          this.nextBtn.getAttribute('data-next-text') || 'Next';
      }
      this.nextBtn.disabled = false;
    }

    // Callback
    if (this.onSlideChange) {
      this.onSlideChange(this.currentIndex, this.totalSlides);
    }
  };

  SlideController.prototype.next = function() {
    if (this.animating) return;

    if (this.currentIndex < this.totalSlides - 1) {
      this.currentIndex++;
      this._showSlide(this.currentIndex, true);
      this._updateUI();
    } else {
      // Last slide — trigger completion
      if (this.onComplete) {
        this.onComplete();
      }
    }
  };

  SlideController.prototype.prev = function() {
    if (this.animating) return;

    if (this.currentIndex > 0) {
      this.currentIndex--;
      this._showSlide(this.currentIndex, true);
      this._updateUI();
    }
  };

  SlideController.prototype.goTo = function(index) {
    if (index >= 0 && index < this.totalSlides && index !== this.currentIndex) {
      this.currentIndex = index;
      this._showSlide(this.currentIndex, true);
      this._updateUI();
    }
  };

  SlideController.prototype._bindEvents = function() {
    var self = this;

    // Button clicks
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', function() { self.prev(); });
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', function() { self.next(); });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        self.next();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        self.prev();
      }
    });

    // Swipe support (touch)
    var touchStartX = 0;
    var touchStartY = 0;
    var contentArea = document.querySelector('.sco-content');

    if (contentArea) {
      contentArea.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      contentArea.addEventListener('touchend', function(e) {
        var deltaX = e.changedTouches[0].clientX - touchStartX;
        var deltaY = e.changedTouches[0].clientY - touchStartY;

        // Only detect horizontal swipes (not vertical scroll within slide)
        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
          var isRTL = document.documentElement.dir === 'rtl';

          if (deltaX < 0) {
            // Swipe left
            isRTL ? self.prev() : self.next();
          } else {
            // Swipe right
            isRTL ? self.next() : self.prev();
          }
        }
      }, { passive: true });
    }
  };

  // Resume support: go to a specific slide (from bookmark)
  SlideController.prototype.resumeFrom = function(index) {
    if (index >= 0 && index < this.totalSlides) {
      this.currentIndex = index;
      this._showSlide(this.currentIndex, false);
      this._updateUI();
    }
  };

  // Expose globally
  window.SlideController = SlideController;

})();
