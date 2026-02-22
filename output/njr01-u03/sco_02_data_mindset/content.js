/**
 * SCO 02: Data Mindset Introduction
 * ====================================
 * 3 slides: Section divider → Content (bullets) → Click-to-Reveal (3 tabs)
 *
 * The click-to-reveal interaction tracks which tabs the learner explored.
 * All 3 must be visited before the SCO can be marked complete.
 */

(function() {
  'use strict';

  // ── SCORM Setup ──────────────────────────────────────────────
  var scorm = new SCORMWrapper();
  scorm.initialize();

  var currentStatus = scorm.getLessonStatus();
  if (!currentStatus || currentStatus === 'not attempted') {
    scorm.setLessonStatus('incomplete');
    scorm.commit();
  }

  var startTime = new Date();

  // ── Click-to-Reveal State ────────────────────────────────────
  // Track which of the 3 tabs have been visited
  var visitedTabs = { 1: false, 2: false, 3: false };
  var activePanel = null; // currently open panel number (1, 2, or 3)

  // This function is called from onclick in the HTML
  // It shows the panel for the clicked tab and marks it as visited
  window.showRevealPanel = function(panelNumber) {

    // Hide the empty state
    var emptyPanel = document.getElementById('panel-empty');
    if (emptyPanel) emptyPanel.style.display = 'none';

    // Hide all panels first
    for (var i = 1; i <= 3; i++) {
      var panel = document.getElementById('panel-' + i);
      var tab = document.getElementById('tab-' + i);
      if (panel) panel.style.display = 'none';
      if (tab) {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
      }
    }

    // Show the selected panel
    var selectedPanel = document.getElementById('panel-' + panelNumber);
    var selectedTab = document.getElementById('tab-' + panelNumber);
    if (selectedPanel) {
      selectedPanel.style.display = 'block';
      // Fade-in animation
      selectedPanel.style.opacity = '0';
      selectedPanel.style.transform = 'translateY(8px)';
      setTimeout(function() {
        selectedPanel.style.transition = 'opacity 300ms ease, transform 300ms ease';
        selectedPanel.style.opacity = '1';
        selectedPanel.style.transform = 'translateY(0)';
      }, 10);
    }
    if (selectedTab) {
      selectedTab.classList.add('active');
      selectedTab.setAttribute('aria-selected', 'true');
    }

    // Mark this tab as visited (change style to show it's been explored)
    visitedTabs[panelNumber] = true;
    if (selectedTab) selectedTab.classList.add('visited');

    // Play click sound
    if (typeof sounds !== 'undefined') {
      sounds.pop();
    }

    activePanel = panelNumber;

    // Update the exploration tracker
    updateExploreTracker();
  };

  // Count how many tabs have been explored and update the UI
  function updateExploreTracker() {
    var count = 0;
    for (var key in visitedTabs) {
      if (visitedTabs[key]) count++;
    }

    var tracker = document.getElementById('explore-tracker');
    var countEl = document.getElementById('explored-count');
    if (tracker && countEl) {
      tracker.style.display = 'block';
      countEl.textContent = count;

      // If all 3 explored, show success styling
      if (count === 3) {
        tracker.style.color = 'var(--color-success)';
        tracker.innerHTML = '✓ أحسنت! تم استكشاف جميع العناصر';

        // Play success sound
        if (typeof sounds !== 'undefined') {
          sounds.success();
        }
      }
    }
  }

  // ── Slide Controller ─────────────────────────────────────────
  var controller = new SlideController({
    onSlideChange: function(index, total) {
      if (typeof sounds !== 'undefined') {
        sounds.whoosh();
      }
      scorm.setBookmark(index.toString());
      scorm.commit();
    },

    onComplete: function() {
      var duration = Math.floor((new Date() - startTime) / 1000);
      scorm.setSessionTime(duration);
      scorm.setLessonStatus('completed');
      scorm.commit();

      if (typeof sounds !== 'undefined') {
        sounds.celebration();
      }

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
  var bookmark = scorm.getBookmark();
  if (bookmark) {
    var resumeIndex = parseInt(bookmark, 10);
    if (!isNaN(resumeIndex) && resumeIndex > 0) {
      controller.resumeFrom(resumeIndex);
    }
  }

  // ── Save on Exit ─────────────────────────────────────────────
  window.addEventListener('beforeunload', function() {
    var duration = Math.floor((new Date() - startTime) / 1000);
    scorm.setSessionTime(duration);
    scorm.setBookmark(controller.currentIndex.toString());
    scorm.commit();
  });

})();
