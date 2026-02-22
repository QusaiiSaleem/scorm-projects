/**
 * SCO 04: Data Importance — 4 field cards + Drag & Drop matching
 * Correct mapping: 1→الأعمال, 2→الصحة, 3→المدن الذكية, 4→البحث العلمي
 */
(function() {
  'use strict';
  var scorm = new SCORMWrapper();
  scorm.initialize();
  var currentStatus = scorm.getLessonStatus();
  if (!currentStatus || currentStatus === 'not attempted') { scorm.setLessonStatus('incomplete'); scorm.commit(); }
  var startTime = new Date();

  // ── Drag & Drop State ──────────────────────────────────────
  var draggedItem = null;
  var placements = {}; // zone -> answer
  var dragChecked = false;

  window.dragStart = function(e) {
    if (dragChecked) return;
    draggedItem = e.target.closest('.drag-item');
    e.dataTransfer.setData('text/plain', draggedItem.getAttribute('data-answer'));
    draggedItem.style.opacity = '0.5';
  };

  window.dragOver = function(e) {
    if (dragChecked) return;
    e.preventDefault();
    e.currentTarget.classList.add('over');
  };

  window.dragLeave = function(e) {
    e.currentTarget.classList.remove('over');
  };

  window.dropItem = function(e) {
    e.preventDefault();
    if (dragChecked) return;
    var zone = e.currentTarget;
    zone.classList.remove('over');
    var zoneId = zone.getAttribute('data-zone');
    var answer = e.dataTransfer.getData('text/plain');

    // Remove placeholder text
    var placeholder = zone.querySelector('.drop-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    // Remove any previously dropped item in this zone
    var existing = zone.querySelector('.dropped-item');
    if (existing) {
      // Return it to source
      document.getElementById('drag-source').appendChild(existing.originalItem);
      existing.originalItem.style.opacity = '1';
      existing.originalItem.style.display = '';
      existing.remove();
      delete placements[zoneId];
    }

    // Create dropped visual
    var droppedEl = document.createElement('span');
    droppedEl.className = 'dropped-item';
    droppedEl.style.cssText = 'flex:1;padding:6px 12px;background:var(--color-info-light);border-radius:6px;font-size:var(--text-caption);text-align:center;';
    droppedEl.textContent = draggedItem.textContent.replace('☰', '').trim();
    droppedEl.originalItem = draggedItem;
    zone.appendChild(droppedEl);

    // Hide the original drag item
    draggedItem.style.display = 'none';
    placements[zoneId] = answer;

    if (typeof sounds !== 'undefined') sounds.pop();

    // Enable check button if all 4 placed
    if (Object.keys(placements).length === 4) {
      var btn = document.getElementById('checkDragBtn');
      if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    }
  };

  // Touch support for drag & drop
  (function() {
    var touchDragging = null;
    var touchClone = null;

    document.addEventListener('touchstart', function(e) {
      var item = e.target.closest('.drag-item');
      if (!item || dragChecked) return;
      touchDragging = item;
      touchClone = item.cloneNode(true);
      touchClone.style.cssText = 'position:fixed;pointer-events:none;opacity:0.8;z-index:1000;transform:scale(1.05);';
      document.body.appendChild(touchClone);
      var t = e.touches[0];
      touchClone.style.left = (t.clientX - 60) + 'px';
      touchClone.style.top = (t.clientY - 20) + 'px';
    }, {passive: true});

    document.addEventListener('touchmove', function(e) {
      if (!touchClone) return;
      var t = e.touches[0];
      touchClone.style.left = (t.clientX - 60) + 'px';
      touchClone.style.top = (t.clientY - 20) + 'px';
    }, {passive: true});

    document.addEventListener('touchend', function(e) {
      if (!touchDragging || !touchClone) return;
      touchClone.remove(); touchClone = null;
      var t = e.changedTouches[0];
      var el = document.elementFromPoint(t.clientX, t.clientY);
      var zone = el ? el.closest('.drop-zone') : null;
      if (zone) {
        var fakeEvent = { preventDefault: function(){}, currentTarget: zone,
          dataTransfer: { getData: function() { return touchDragging.getAttribute('data-answer'); } } };
        draggedItem = touchDragging;
        window.dropItem(fakeEvent);
      }
      touchDragging = null;
    }, {passive: true});
  })();

  window.checkDragDrop = function() {
    dragChecked = true;
    var allCorrect = true;
    var zones = document.querySelectorAll('.drop-zone');
    for (var i = 0; i < zones.length; i++) {
      var zoneId = zones[i].getAttribute('data-zone');
      var isCorrect = placements[zoneId] === zoneId;
      zones[i].classList.add(isCorrect ? 'correct' : '');
      if (!isCorrect) {
        allCorrect = false;
        zones[i].style.borderColor = 'var(--color-error)';
        zones[i].style.borderStyle = 'solid';
        zones[i].style.background = 'var(--color-error-light)';
      }
    }
    var feedbackEl = document.getElementById('drag-feedback');
    var checkBtn = document.getElementById('checkDragBtn');
    if (allCorrect) {
      if (feedbackEl) { feedbackEl.style.display = 'block'; feedbackEl.className = 'feedback feedback-correct'; feedbackEl.innerHTML = '✓ أحسنت! جميع الإجابات صحيحة'; }
      if (typeof sounds !== 'undefined') sounds.success();
      if (typeof ConfettiSystem !== 'undefined') { var c = new ConfettiSystem(); c.fire(); }
    } else {
      if (feedbackEl) { feedbackEl.style.display = 'block'; feedbackEl.className = 'feedback feedback-growth'; feedbackEl.innerHTML = '💡 بعض الإجابات تحتاج مراجعة — الإطارات الحمراء تحتاج تصحيح'; }
      if (typeof sounds !== 'undefined') sounds.error();
    }
    if (checkBtn) checkBtn.style.display = 'none';
    scorm.commit();
  };

  // ── Slide Controller ─────────────────────────────────────────
  var controller = new SlideController({
    onSlideChange: function(index) { if (typeof sounds !== 'undefined') sounds.whoosh(); scorm.setBookmark(index.toString()); scorm.commit(); },
    onComplete: function() {
      var duration = Math.floor((new Date() - startTime) / 1000);
      scorm.setSessionTime(duration); scorm.setLessonStatus('completed'); scorm.commit();
      if (typeof sounds !== 'undefined') sounds.celebration();
      var btn = document.getElementById('nextBtn');
      if (btn) { btn.textContent = 'تم ✓'; btn.disabled = true; btn.style.background = 'var(--color-success)'; btn.style.color = '#fff'; }
    }
  });
  var bm = scorm.getBookmark();
  if (bm) { var ri = parseInt(bm, 10); if (!isNaN(ri) && ri > 0) controller.resumeFrom(ri); }
  window.addEventListener('beforeunload', function() { scorm.setSessionTime(Math.floor((new Date() - startTime) / 1000)); scorm.setBookmark(controller.currentIndex.toString()); scorm.commit(); });
})();
