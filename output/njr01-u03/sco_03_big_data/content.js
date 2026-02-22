/**
 * SCO 03: Big Data
 * ==================
 * 5 slides: Section divider → Content → 3V Cards → MCQ Quiz → Live Examples
 *
 * Quiz: "Which is an example of Velocity?"
 * Correct answer: ب (real-time credit card fraud detection)
 * Points: 10 | Attempts: 2
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

  // ── Quiz State ───────────────────────────────────────────────
  var selectedOption = null;   // which option the learner picked ('a', 'b', 'c', 'd')
  var correctAnswer = 'b';    // ب is the correct answer
  var attemptsLeft = 2;       // learner gets 2 tries
  var quizAnswered = false;   // has the quiz been answered correctly?

  // Called when learner clicks a quiz option
  window.selectOption = function(element) {
    if (quizAnswered) return; // don't allow changes after correct answer

    // Remove 'selected' from all options
    var options = document.querySelectorAll('.quiz-option');
    for (var i = 0; i < options.length; i++) {
      options[i].classList.remove('selected');
      options[i].setAttribute('aria-checked', 'false');
    }

    // Mark the clicked option as selected
    element.classList.add('selected');
    element.setAttribute('aria-checked', 'true');
    selectedOption = element.getAttribute('data-option');

    // Enable the check button
    var checkBtn = document.getElementById('checkBtn');
    if (checkBtn) {
      checkBtn.disabled = false;
      checkBtn.style.opacity = '1';
    }

    // Play click sound
    if (typeof sounds !== 'undefined') {
      sounds.click();
    }
  };

  // Called when learner clicks "تحقق من الإجابة"
  window.checkAnswer = function() {
    if (!selectedOption || quizAnswered) return;

    attemptsLeft--;
    var isCorrect = (selectedOption === correctAnswer);
    var feedbackEl = document.getElementById('quiz-feedback');
    var checkBtn = document.getElementById('checkBtn');

    // Find the selected option element
    var options = document.querySelectorAll('.quiz-option');

    if (isCorrect) {
      // ── Correct Answer ────────────────────────────
      quizAnswered = true;

      // Mark the correct option green
      for (var i = 0; i < options.length; i++) {
        var opt = options[i].getAttribute('data-option');
        if (opt === correctAnswer) {
          options[i].classList.add('correct');
        }
        // Disable all options
        options[i].style.pointerEvents = 'none';
      }

      // Show success feedback
      if (feedbackEl) {
        feedbackEl.style.display = 'block';
        feedbackEl.className = 'feedback feedback-correct';
        feedbackEl.innerHTML = '✓ أحسنت! الإجابة صحيحة — معالجة المعاملات لحظياً هي مثال على السرعة';
      }

      // Hide check button
      if (checkBtn) checkBtn.style.display = 'none';

      // Sound + confetti
      if (typeof sounds !== 'undefined') sounds.success();
      if (typeof ConfettiSystem !== 'undefined') {
        var confetti = new ConfettiSystem();
        confetti.fire();
      }

      // Record SCORM interaction
      scorm.recordInteraction(0, {
        id: 'q1_velocity',
        type: 'choice',
        response: selectedOption,
        correct: correctAnswer,
        result: 'correct'
      });

    } else {
      // ── Incorrect Answer ──────────────────────────
      // Mark the selected option red
      for (var j = 0; j < options.length; j++) {
        if (options[j].getAttribute('data-option') === selectedOption) {
          options[j].classList.add('incorrect');
          // Remove incorrect styling after a moment so they can try again
          (function(el) {
            setTimeout(function() { el.classList.remove('incorrect', 'selected'); }, 1500);
          })(options[j]);
        }
      }

      // Sound
      if (typeof sounds !== 'undefined') sounds.error();

      // Record incorrect attempt
      scorm.recordInteraction(0, {
        id: 'q1_velocity',
        type: 'choice',
        response: selectedOption,
        correct: correctAnswer,
        result: 'incorrect'
      });

      if (attemptsLeft > 0) {
        // Still has attempts — show growth mindset feedback
        if (feedbackEl) {
          feedbackEl.style.display = 'block';
          feedbackEl.className = 'feedback feedback-growth';
          feedbackEl.innerHTML = '💡 ليس بعد — فكّر في الخاصية المتعلقة بسرعة إنشاء البيانات. لديك محاولة أخرى!';
        }
        selectedOption = null;
        if (checkBtn) {
          checkBtn.disabled = true;
          checkBtn.style.opacity = '0.5';
        }
      } else {
        // No more attempts — show correct answer
        quizAnswered = true;
        for (var k = 0; k < options.length; k++) {
          var optVal = options[k].getAttribute('data-option');
          if (optVal === correctAnswer) {
            options[k].classList.add('correct');
          }
          options[k].style.pointerEvents = 'none';
        }

        if (feedbackEl) {
          feedbackEl.style.display = 'block';
          feedbackEl.className = 'feedback feedback-incorrect';
          feedbackEl.innerHTML = 'الإجابة الصحيحة هي: <strong>ب</strong> — معالجة المعاملات لحظياً مثال على السرعة (Velocity)';
        }
        if (checkBtn) checkBtn.style.display = 'none';
      }
    }

    scorm.commit();
  };

  // ── Slide Controller ─────────────────────────────────────────
  var controller = new SlideController({
    onSlideChange: function(index, total) {
      if (typeof sounds !== 'undefined') sounds.whoosh();
      scorm.setBookmark(index.toString());
      scorm.commit();
    },
    onComplete: function() {
      var duration = Math.floor((new Date() - startTime) / 1000);
      scorm.setSessionTime(duration);
      scorm.setLessonStatus('completed');
      scorm.commit();
      if (typeof sounds !== 'undefined') sounds.celebration();
      var nextBtn = document.getElementById('nextBtn');
      if (nextBtn) {
        nextBtn.textContent = 'تم ✓';
        nextBtn.disabled = true;
        nextBtn.style.background = 'var(--color-success)';
        nextBtn.style.color = '#fff';
      }
    }
  });

  // ── Resume ───────────────────────────────────────────────────
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
