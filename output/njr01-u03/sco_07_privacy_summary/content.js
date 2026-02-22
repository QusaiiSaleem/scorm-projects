/**
 * SCO 07: Privacy + Summary + Closing
 * Slider explorer (6 stops) + Dropdown matching (4 concepts) + Summary + Thank you
 */
(function() {
  'use strict';
  var scorm = new SCORMWrapper(); scorm.initialize();
  var cs = scorm.getLessonStatus();
  if (!cs || cs === 'not attempted') { scorm.setLessonStatus('incomplete'); scorm.commit(); }
  var startTime = new Date();

  // ── Slider Explorer (6 stops) ────────────────────────────────
  var activeStep = null;
  window.showStep = function(n) {
    // Hide all panels
    var empty = document.getElementById('sp-empty');
    if (empty) empty.style.display = 'none';
    var panels = document.querySelectorAll('.step-panel');
    for (var i = 0; i < panels.length; i++) panels[i].style.display = 'none';

    // Deactivate all step buttons
    for (var j = 1; j <= 6; j++) {
      var btn = document.getElementById('step-' + j);
      if (btn) { btn.style.background = 'var(--color-surface)'; }
    }

    // Show selected panel
    var panel = document.getElementById('sp-' + n);
    if (panel) {
      panel.style.display = 'block';
      panel.style.opacity = '0'; panel.style.transform = 'translateY(8px)';
      setTimeout(function() { panel.style.transition = 'opacity 300ms ease, transform 300ms ease'; panel.style.opacity = '1'; panel.style.transform = 'translateY(0)'; }, 10);
    }

    // Activate button
    var activeBtn = document.getElementById('step-' + n);
    if (activeBtn) {
      activeBtn.style.background = n <= 3 ? 'var(--color-warning)' : 'var(--color-success)';
      activeBtn.style.color = '#fff';
    }

    activeStep = n;
    if (typeof sounds !== 'undefined') sounds.pop();
  };

  // ── Dropdown Matching ────────────────────────────────────────
  var matchChecked = false;
  window.checkMatchReady = function() {
    if (matchChecked) return;
    var selects = document.querySelectorAll('.match-dropdown');
    var allFilled = true;
    for (var i = 0; i < selects.length; i++) {
      if (!selects[i].value) { allFilled = false; break; }
    }
    var btn = document.getElementById('checkMatchBtn');
    if (btn) { btn.disabled = !allFilled; btn.style.opacity = allFilled ? '1' : '0.5'; }
  };

  window.checkMatching = function() {
    if (matchChecked) return;
    matchChecked = true;
    var selects = document.querySelectorAll('.match-dropdown');
    var allCorrect = true;
    var correct = 0;

    for (var i = 0; i < selects.length; i++) {
      var s = selects[i];
      var isCorrect = s.value === s.getAttribute('data-correct');
      s.disabled = true;
      if (isCorrect) {
        s.style.borderColor = 'var(--color-success)';
        s.style.background = 'var(--color-success-light)';
        correct++;
      } else {
        allCorrect = false;
        s.style.borderColor = 'var(--color-error)';
        s.style.background = 'var(--color-error-light)';
      }
    }

    var fb = document.getElementById('match-feedback');
    var btn = document.getElementById('checkMatchBtn');
    if (allCorrect) {
      if (fb) { fb.style.display = 'block'; fb.className = 'feedback feedback-correct'; fb.innerHTML = '✓ ممتاز! جميع المطابقات صحيحة!'; }
      if (typeof sounds !== 'undefined') sounds.success();
      if (typeof ConfettiSystem !== 'undefined') { var c = new ConfettiSystem(); c.fire(); }
    } else {
      if (fb) { fb.style.display = 'block'; fb.className = 'feedback feedback-growth'; fb.innerHTML = '💡 أحسنت! ' + correct + ' من 4 إجابات صحيحة. الخضراء صحيحة والحمراء تحتاج مراجعة.'; }
      if (typeof sounds !== 'undefined') sounds.error();
    }
    if (btn) btn.style.display = 'none';
    scorm.commit();
  };

  // ── Slide Controller ─────────────────────────────────────────
  var controller = new SlideController({
    onSlideChange: function(i) { if (typeof sounds !== 'undefined') sounds.whoosh(); scorm.setBookmark(i.toString()); scorm.commit(); },
    onComplete: function() {
      var d = Math.floor((new Date() - startTime) / 1000);
      scorm.setSessionTime(d); scorm.setLessonStatus('completed'); scorm.commit();
      if (typeof sounds !== 'undefined') sounds.celebration();
      if (typeof ConfettiSystem !== 'undefined') { var c = new ConfettiSystem(); c.fire({ intensity: 'big' }); }
      var b = document.getElementById('nextBtn');
      if (b) { b.textContent = 'تم ✓'; b.disabled = true; b.style.background = 'var(--color-success)'; b.style.color = '#fff'; }
    }
  });
  var bm = scorm.getBookmark(); if (bm) { var ri = parseInt(bm, 10); if (!isNaN(ri) && ri > 0) controller.resumeFrom(ri); }
  window.addEventListener('beforeunload', function() { scorm.setSessionTime(Math.floor((new Date() - startTime) / 1000)); scorm.setBookmark(controller.currentIndex.toString()); scorm.commit(); });
})();
