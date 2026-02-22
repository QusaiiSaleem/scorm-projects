/**
 * SCO 05: Data Quality — Click-to-reveal (4 dims) + Comparison + MCQ Quiz
 * Correct answer: د (التوقيت / Timeliness)
 */
(function() {
  'use strict';
  var scorm = new SCORMWrapper(); scorm.initialize();
  var cs = scorm.getLessonStatus();
  if (!cs || cs === 'not attempted') { scorm.setLessonStatus('incomplete'); scorm.commit(); }
  var startTime = new Date();

  // ── Click-to-Reveal (4 quality dimensions) ───────────────────
  var qVisited = {1:false,2:false,3:false,4:false};
  window.showQualityPanel = function(n) {
    document.getElementById('qp-empty').style.display = 'none';
    for (var i = 1; i <= 4; i++) {
      var p = document.getElementById('qp-' + i);
      var t = document.getElementById('qt-' + i);
      if (p) p.style.display = 'none';
      if (t) { t.classList.remove('active'); t.setAttribute('aria-selected','false'); }
    }
    var panel = document.getElementById('qp-' + n);
    var tab = document.getElementById('qt-' + n);
    if (panel) { panel.style.display = 'block'; panel.style.opacity = '0'; panel.style.transform = 'translateY(8px)';
      setTimeout(function() { panel.style.transition = 'opacity 300ms ease, transform 300ms ease'; panel.style.opacity = '1'; panel.style.transform = 'translateY(0)'; }, 10); }
    if (tab) { tab.classList.add('active'); tab.setAttribute('aria-selected','true'); tab.classList.add('visited'); }
    qVisited[n] = true;
    if (typeof sounds !== 'undefined') sounds.pop();
    var count = 0; for (var k in qVisited) if (qVisited[k]) count++;
    var tracker = document.getElementById('quality-tracker'); var countEl = document.getElementById('q-explored');
    if (tracker && countEl) { tracker.style.display = 'block'; countEl.textContent = count;
      if (count === 4) { tracker.style.color = 'var(--color-success)'; tracker.innerHTML = '✓ أحسنت! تم استكشاف جميع الأبعاد'; if (typeof sounds !== 'undefined') sounds.success(); }
    }
  };

  // ── Quiz (correct = د / Timeliness) ──────────────────────────
  var sel2 = null, correct2 = 'd', attempts2 = 2, answered2 = false;
  window.selectOption2 = function(el) {
    if (answered2) return;
    var opts = document.querySelectorAll('#quiz2-options .quiz-option');
    for (var i = 0; i < opts.length; i++) { opts[i].classList.remove('selected'); opts[i].setAttribute('aria-checked','false'); }
    el.classList.add('selected'); el.setAttribute('aria-checked','true');
    sel2 = el.getAttribute('data-option');
    var btn = document.getElementById('checkBtn2'); if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    if (typeof sounds !== 'undefined') sounds.click();
  };
  window.checkAnswer2 = function() {
    if (!sel2 || answered2) return;
    attempts2--;
    var isC = sel2 === correct2;
    var fb = document.getElementById('quiz2-feedback');
    var btn = document.getElementById('checkBtn2');
    var opts = document.querySelectorAll('#quiz2-options .quiz-option');
    if (isC) {
      answered2 = true;
      for (var i = 0; i < opts.length; i++) { if (opts[i].getAttribute('data-option')===correct2) opts[i].classList.add('correct'); opts[i].style.pointerEvents='none'; }
      if (fb) { fb.style.display='block'; fb.className='feedback feedback-correct'; fb.innerHTML='✓ أحسنت! التوقيت هو البعد المتأثر — استخدام بيانات قديمة للتخطيط الحالي'; }
      if (btn) btn.style.display='none';
      if (typeof sounds !== 'undefined') sounds.success();
      if (typeof ConfettiSystem !== 'undefined') { var c = new ConfettiSystem(); c.fire(); }
    } else {
      for (var j=0;j<opts.length;j++) { if(opts[j].getAttribute('data-option')===sel2){opts[j].classList.add('incorrect');(function(e){setTimeout(function(){e.classList.remove('incorrect','selected');},1500);})(opts[j]);} }
      if (typeof sounds !== 'undefined') sounds.error();
      if (attempts2 > 0) {
        if (fb) { fb.style.display='block'; fb.className='feedback feedback-growth'; fb.innerHTML='💡 ليس بعد — فكّر: ما المشكلة في استخدام بيانات قديمة؟ لديك محاولة أخرى!'; }
        sel2 = null; if (btn) { btn.disabled=true; btn.style.opacity='0.5'; }
      } else {
        answered2 = true;
        for (var k=0;k<opts.length;k++){if(opts[k].getAttribute('data-option')===correct2)opts[k].classList.add('correct');opts[k].style.pointerEvents='none';}
        if (fb) { fb.style.display='block'; fb.className='feedback feedback-incorrect'; fb.innerHTML='الإجابة الصحيحة: <strong>د — التوقيت</strong>. البيانات القديمة قد تكون مضللة للتخطيط الحالي.'; }
        if (btn) btn.style.display='none';
      }
    }
    scorm.commit();
  };

  // ── Slide Controller ─────────────────────────────────────────
  var controller = new SlideController({
    onSlideChange: function(i) { if (typeof sounds !== 'undefined') sounds.whoosh(); scorm.setBookmark(i.toString()); scorm.commit(); },
    onComplete: function() { var d=Math.floor((new Date()-startTime)/1000); scorm.setSessionTime(d); scorm.setLessonStatus('completed'); scorm.commit();
      if (typeof sounds !== 'undefined') sounds.celebration();
      var b=document.getElementById('nextBtn'); if(b){b.textContent='تم ✓';b.disabled=true;b.style.background='var(--color-success)';b.style.color='#fff';} }
  });
  var bm=scorm.getBookmark(); if(bm){var ri=parseInt(bm,10);if(!isNaN(ri)&&ri>0)controller.resumeFrom(ri);}
  window.addEventListener('beforeunload',function(){scorm.setSessionTime(Math.floor((new Date()-startTime)/1000));scorm.setBookmark(controller.currentIndex.toString());scorm.commit();});
})();
