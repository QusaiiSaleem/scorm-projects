/**
 * SCO 01: Introduction & Learning Objectives
 * ============================================
 * Simple 2-slide SCO: Title cover + Objectives list.
 * Initializes SCORM, manages slide navigation, marks complete on finish.
 */

(function() {
  'use strict';

  // ── SCORM Setup ──────────────────────────────────────────────
  // SCORMWrapper talks to the LMS (Learning Management System).
  // If no LMS is found (e.g., opening in a browser), it runs in standalone mode.
  var scorm = new SCORMWrapper();
  scorm.initialize();

  // Check current status — only set "incomplete" if not already completed
  // (This prevents resetting progress if the learner revisits)
  var currentStatus = scorm.getLessonStatus();
  if (!currentStatus || currentStatus === 'not attempted') {
    scorm.setLessonStatus('incomplete');
    scorm.commit();
  }

  // Track when the learner started this SCO (for session time)
  var startTime = new Date();

  // ── Slide Controller ─────────────────────────────────────────
  // SlideController manages the fixed-slide navigation.
  // It finds all `.slide` elements, shows only the active one,
  // and handles Prev/Next buttons + keyboard arrows + touch swipe.
  var controller = new SlideController({

    // Called every time the slide changes
    onSlideChange: function(index, total) {
      // Play a subtle whoosh sound on slide transition
      if (typeof sounds !== 'undefined') {
        sounds.whoosh();
      }

      // Save bookmark so learner can resume at this slide
      scorm.setBookmark(index.toString());
      scorm.commit();
    },

    // Called when learner clicks "Complete" on the last slide
    onComplete: function() {
      // Calculate how long the learner spent in this SCO
      var duration = Math.floor((new Date() - startTime) / 1000);

      // Tell the LMS this SCO is complete
      scorm.setSessionTime(duration);
      scorm.setLessonStatus('completed');
      scorm.commit();

      // Play celebration sound
      if (typeof sounds !== 'undefined') {
        sounds.celebration();
      }

      // Visual feedback: show a brief "complete" message
      var nextBtn = document.getElementById('nextBtn');
      if (nextBtn) {
        nextBtn.textContent = 'تم ✓';
        nextBtn.disabled = true;
        nextBtn.style.background = 'var(--color-success)';
        nextBtn.style.color = '#fff';
      }
    }
  });

  // ── Resume Support ───────────────────────────────────────────
  // If the learner left mid-way and comes back, resume where they were
  var bookmark = scorm.getBookmark();
  if (bookmark) {
    var resumeIndex = parseInt(bookmark, 10);
    if (!isNaN(resumeIndex) && resumeIndex > 0) {
      controller.resumeFrom(resumeIndex);
    }
  }

  // ── Start Button ─────────────────────────────────────────────
  // The "ابدأ المحاضرة" button on the title slide advances to slide 2
  var startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', function() {
      controller.next();
    });
  }

  // ── Save on Exit ─────────────────────────────────────────────
  // When the learner closes the window, save their position
  window.addEventListener('beforeunload', function() {
    var duration = Math.floor((new Date() - startTime) / 1000);
    scorm.setSessionTime(duration);
    scorm.setBookmark(controller.currentIndex.toString());
    scorm.commit();
  });

})();
