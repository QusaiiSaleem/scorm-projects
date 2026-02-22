/**
 * SCO 06: Communication — Content + Comparison + IoT/5G cards + MCQ Quiz
 * Correct answer: ب (simple bar chart with clear title)
 */
(function() {
  'use strict';
  var scorm = new SCORMWrapper(); scorm.initialize();
  var cs = scorm.getLessonStatus();
  if (!cs || cs === 'not attempted') { scorm.setLessonStatus('incomplete'); scorm.commit(); }
  var startTime = new Date();

  // ── Quiz (correct = ب) ───────────────────────────────────────
  var sel3 = null, correct3 = 'b', attempts3 = 2, answered3 = false;
  window.selectOption3 = function(el) {
    if (answered3) return;
    var opts = document.querySelectorAll('#quiz3-options .quiz-option');
    for (var i = 0; i < opts.length; i++) { opts[i].classList.remove('selected'); opts[i].setAttribute('aria-checked','false'); }
    el.classList.add('selected'); el.setAttribute('aria-checked','true');
    sel3 = el.getAttribute('data-option');
    var btn = document.getElementById('checkBtn3'); if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    if (typeof sounds !== 'undefined') sounds.click();
  };
  window.checkAnswer3 = function() {
    if (!sel3 || answered3) return;
    attempts3--;
    var isC = sel3 === correct3;
    var fb = document.getElementById('quiz3-feedback');
    var btn = document.getElementById('checkBtn3');
    var opts = document.querySelectorAll('#quiz3-options .quiz-option');
    if (isC) {
      answered3 = true;
      for (var i = 0; i < opts.length; i++) { if (opts[i].getAttribute('data-option')===correct3) opts[i].classList.add('correct'); opts[i].style.pointerEvents='none'; }
      if (fb) { fb.style.display='block'; fb.className='feedback feedback-correct'; fb.innerHTML='✓ أحسنت! المخطط البسيط مع عنوان واضح هو أفضل طريقة للتواصل'; }
      if (btn) btn.style.display='none';
      if (typeof sounds !== 'undefined') sounds.success();
      if (typeof ConfettiSystem !== 'undefined') { var c = new ConfettiSystem(); c.fire(); }
    } else {
      for (var j=0;j<opts.length;j++){if(opts[j].getAttribute('data-option')===sel3){opts[j].classList.add('incorrect');(function(e){setTimeout(function(){e.classList.remove('incorrect','selected');},1500);})(opts[j]);}}
      if (typeof sounds !== 'undefined') sounds.error();
      if (attempts3 > 0) {
        if (fb) { fb.style.display='block'; fb.className='feedback feedback-growth'; fb.innerHTML='💡 ليس بعد — تذكر: البساطة والوضوح مفتاح التواصل الفعال!'; }
        sel3 = null; if (btn) { btn.disabled=true; btn.style.opacity='0.5'; }
      } else {
        answered3 = true;
        for (var k=0;k<opts.length;k++){if(opts[k].getAttribute('data-option')===correct3)opts[k].classList.add('correct');opts[k].style.pointerEvents='none';}
        if (fb) { fb.style.display='block'; fb.className='feedback feedback-incorrect'; fb.innerHTML='الإجابة الصحيحة: <strong>ب</strong> — مخطط أعمدة بسيط مع عنوان واضح.'; }
        if (btn) btn.style.display='none';
      }
    }
    scorm.commit();
  };

  var controller = new SlideController({
    onSlideChange: function(i) { if (typeof sounds !== 'undefined') sounds.whoosh(); scorm.setBookmark(i.toString()); scorm.commit(); },
    onComplete: function() { var d=Math.floor((new Date()-startTime)/1000); scorm.setSessionTime(d); scorm.setLessonStatus('completed'); scorm.commit();
      if (typeof sounds !== 'undefined') sounds.celebration();
      var b=document.getElementById('nextBtn'); if(b){b.textContent='تم ✓';b.disabled=true;b.style.background='var(--color-success)';b.style.color='#fff';} }
  });
  var bm=scorm.getBookmark(); if(bm){var ri=parseInt(bm,10);if(!isNaN(ri)&&ri>0)controller.resumeFrom(ri);}
  window.addEventListener('beforeunload',function(){scorm.setSessionTime(Math.floor((new Date()-startTime)/1000));scorm.setBookmark(controller.currentIndex.toString());scorm.commit();});
})();
