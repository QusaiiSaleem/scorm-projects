# Gamification Components Reference

> Extracted from gamification and motivation research.
> Ready-to-use HTML/CSS/JS patterns for SCORM courses.

---

## Implementation Priority Matrix

### Tier 1: Must-Have (implement in every course)

| Pattern | Effort | Impact | Why Priority |
|---------|--------|--------|--------------|
| Progress bars | Low | High | Most basic motivator; enables all other tracking |
| Micro-interactions | Low | Medium | Makes everything feel polished and responsive |
| Growth mindset messaging | Low | High | Changes how failures are perceived; zero UI cost |
| "Why This Matters" blocks | Low | High | Frames relevance; prevents "why am I learning this?" |
| Smart defaults | Low | Medium | Guides behavior with zero extra UX |

### Tier 2: Should-Have (engagement-focused courses)

| Pattern | Effort | Impact | Why Priority |
|---------|--------|--------|--------------|
| Points system | Medium | High | Core gamification loop; enables badges and streaks |
| Badges/achievements | Medium | High | Collection mechanic drives completion |
| Streaks | Medium | High | Loss aversion + consistency = retention |
| Celebration animations | Medium | Medium | Emotional anchoring for milestones |
| Curiosity gaps | Medium | High | Drives forward momentum |
| "Just one more" hooks | Low | High | Increases session length |

### Tier 3: Nice-to-Have (premium/gamified courses)

| Pattern | Effort | Impact | Why Priority |
|---------|--------|--------|--------------|
| Unlockable content | Medium | Medium | Creates discovery; may frustrate some learners |
| Adaptive difficulty | High | High | Flow state optimization; needs question pools |
| Narrative/story | High | High | Deep engagement; requires content planning |
| Journey map visualization | Medium | Medium | Beautiful but cosmetic |
| Spaced repetition | High | High | Best retention tool; needs review infrastructure |
| Autonomy/choice paths | High | Medium | Multiple content formats needed |

### Tier 4: Contextual (based on specific course needs)

| Pattern | Effort | Impact | Why Priority |
|---------|--------|--------|--------------|
| Social proof | Low | Medium | Static data is fine; real data is better |
| Commitment devices | Low | Medium | Works well for multi-day courses |
| Implementation intentions | Low | Low-Med | Best for self-paced courses over weeks |
| Loss aversion nudges | Medium | Medium | Can feel manipulative if overused |
| Anchoring in assessments | Low | Medium | Subtle but effective |

---

## Tier 1 Components (Must-Have)

### Progress Bars

```html
<div class="progress-container">
  <div class="progress-level">
    <span class="progress-label">Course Progress</span>
    <div class="progress-bar">
      <div class="progress-fill" id="course-progress" style="width: 0%">
        <span class="progress-text">0%</span>
      </div>
    </div>
  </div>
  <div class="progress-level">
    <span class="progress-label">This Module</span>
    <div class="progress-bar progress-bar-sm">
      <div class="progress-fill module-fill" id="module-progress" style="width: 0%"></div>
    </div>
  </div>
</div>
```

```css
.progress-container {
  padding: 12px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  margin-top: 4px;
}

.progress-bar-sm { height: 6px; }

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 6px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  min-width: 0;
}

.progress-text {
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
}

.module-fill {
  background: linear-gradient(90deg, #2196F3, #03A9F4);
}
```

```javascript
const ProgressTracker = {
  totalLessons: 0,
  completedLessons: 0,
  currentModule: { total: 0, completed: 0 },

  init(courseStructure) {
    this.totalLessons = courseStructure.totalLessons;
    const saved = ScormAPI.getValue('cmi.suspend_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.completedLessons = data.completedLessons || 0;
      } catch (e) {}
    }
    this.updateBars();
  },

  completeLesson(lessonId) {
    this.completedLessons++;
    this.currentModule.completed++;
    this.updateBars();
    this.checkMilestones();
    const progress = this.completedLessons / this.totalLessons;
    ScormAPI.setValue('cmi.progress_measure', progress.toFixed(2));
    this.save();
  },

  updateBars() {
    const coursePercent = Math.round(
      (this.completedLessons / this.totalLessons) * 100
    );
    const courseBar = document.getElementById('course-progress');
    if (courseBar) {
      courseBar.style.width = coursePercent + '%';
      courseBar.querySelector('.progress-text').textContent = coursePercent + '%';
    }
    if (this.currentModule.total > 0) {
      const modulePercent = Math.round(
        (this.currentModule.completed / this.currentModule.total) * 100
      );
      const moduleBar = document.getElementById('module-progress');
      if (moduleBar) moduleBar.style.width = modulePercent + '%';
    }
  },

  checkMilestones() {
    const percent = (this.completedLessons / this.totalLessons) * 100;
    if (percent >= 25) this.showMilestone('25% Complete! Great start!');
    if (percent >= 50) this.showMilestone('Halfway there! Keep going!');
    if (percent >= 75) this.showMilestone('75% done! Almost there!');
    if (percent >= 100) this.showMilestone('Course Complete! Congratulations!');
  },

  showMilestone(message) {
    CelebrationManager.show(message);
  },

  save() {
    const existing = ScormAPI.getValue('cmi.suspend_data');
    let data = {};
    try { data = JSON.parse(existing); } catch (e) { data = {}; }
    data.completedLessons = this.completedLessons;
    ScormAPI.setValue('cmi.suspend_data', JSON.stringify(data));
    ScormAPI.commit();
  }
};
```

### Micro-Interactions

```css
/* Button micro-interaction */
.btn-interactive {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: #2196F3;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  overflow: hidden;
}

.btn-interactive:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.btn-interactive:active {
  transform: translateY(1px) scale(0.98);
  box-shadow: none;
}

/* Answer choice selection */
.answer-choice {
  padding: 14px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.answer-choice:hover {
  border-color: #90CAF9;
  background: #e3f2fd;
}

.answer-choice.selected {
  border-color: #2196F3;
  background: #bbdefb;
  font-weight: 600;
}

.answer-choice.correct {
  border-color: #4CAF50;
  background: #c8e6c9;
  animation: correctPulse 0.5s ease;
}

.answer-choice.incorrect {
  border-color: #f44336;
  background: #ffcdd2;
  animation: incorrectShake 0.4s ease;
}

@keyframes correctPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

@keyframes incorrectShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}
```

### Growth Mindset Messaging

```javascript
const FeedbackMessages = {
  correct: [
    "Excellent! Your understanding is growing!",
    "That's right! You're building real expertise here.",
    "Correct! Your effort is paying off.",
    "Well done! That was a challenging one.",
    "You got it! You're making strong progress.",
  ],

  incorrect: [
    "Not quite -- but this is exactly how learning happens. Let's look at why.",
    "That's a common misconception. Understanding why helps you master this.",
    "Almost there! Let's break this down together.",
    "The fact that you're trying is what matters. Here's a hint...",
    "This is a tricky one. Even experts needed practice with this concept.",
  ],

  retry: [
    "Take another look -- you've got this!",
    "Think about it from a different angle.",
    "Review the material above and try again. Every attempt builds understanding.",
  ],

  getCorrectMessage(streakCount) {
    if (streakCount >= 5) return "Incredible streak! You're truly mastering this!";
    if (streakCount >= 3) return "Three in a row! Your skills are sharpening!";
    return this.correct[Math.floor(Math.random() * this.correct.length)];
  },

  getIncorrectMessage(attemptNumber) {
    if (attemptNumber === 1) {
      return this.incorrect[Math.floor(Math.random() * this.incorrect.length)];
    }
    if (attemptNumber === 2) {
      return "Let's try a different approach. " +
             this.retry[Math.floor(Math.random() * this.retry.length)];
    }
    return "Here's the explanation -- understanding 'why' is more important than getting it right the first time.";
  }
};
```

### "Why This Matters" Block

```html
<div class="relevance-block">
  <div class="relevance-icon">&#127919;</div>
  <div class="relevance-content">
    <h3>Why This Matters</h3>
    <p>After this lesson, you'll be able to <strong>[specific real-world skill]</strong>.
       Here's how professionals use this every day:</p>
    <div class="real-world-example">
      <blockquote>
        "In my role as [job title], I use this concept when..."
      </blockquote>
      <cite>-- Professional Name, Role</cite>
    </div>
  </div>
</div>
```

```css
.relevance-block {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border-radius: 12px;
  margin-bottom: 24px;
}

.relevance-icon { font-size: 2rem; flex-shrink: 0; }

.real-world-example {
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
}

.real-world-example blockquote {
  font-style: italic;
  margin: 0;
  padding: 0;
  border: none;
}
```

### Smart Defaults

```html
<!-- Default: Review before quiz (nudges preparation) -->
<div class="quiz-start-panel">
  <h3>Ready for the Quiz?</h3>
  <div class="quiz-options">
    <button class="quiz-option primary" onclick="startReview()">
      Review Key Concepts First
      <small>Recommended -- takes 2 minutes</small>
    </button>
    <button class="quiz-option secondary" onclick="startQuiz()">
      Start Quiz Now
    </button>
  </div>
</div>
```

```css
.quiz-option.primary {
  padding: 16px 24px;
  background: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.quiz-option.secondary {
  padding: 12px 20px;
  background: transparent;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.9rem;
  cursor: pointer;
}
```

---

## Tier 2 Components (Should-Have)

### Points System

```html
<div id="points-display" class="points-badge">
  <span class="points-icon">&#9733;</span>
  <span id="points-count">0</span>
  <span class="points-label">points</span>
</div>
```

```css
.points-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: transform 0.2s ease;
}

.points-badge.animate {
  animation: pointsPop 0.4s ease;
}

@keyframes pointsPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
```

```javascript
const PointsManager = {
  points: 0,

  init() {
    const saved = ScormAPI.getValue('cmi.suspend_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.points = data.points || 0;
      } catch (e) { this.points = 0; }
    }
    this.updateDisplay();
  },

  award(amount, reason) {
    this.points += amount;
    this.updateDisplay();
    this.showPointsAnimation(amount, reason);
    this.save();
  },

  updateDisplay() {
    const el = document.getElementById('points-count');
    if (el) el.textContent = this.points;
  },

  showPointsAnimation(amount, reason) {
    const badge = document.getElementById('points-display');
    badge.classList.add('animate');
    setTimeout(() => badge.classList.remove('animate'), 400);

    const floater = document.createElement('div');
    floater.className = 'points-floater';
    floater.textContent = '+' + amount + ' ' + (reason || '');
    document.body.appendChild(floater);
    setTimeout(() => floater.remove(), 1500);
  },

  save() {
    const existing = ScormAPI.getValue('cmi.suspend_data');
    let data = {};
    try { data = JSON.parse(existing); } catch (e) { data = {}; }
    data.points = this.points;
    ScormAPI.setValue('cmi.suspend_data', JSON.stringify(data));
    ScormAPI.commit();
  }
};
```

**Points allocation guide:**

| Activity | Points |
|----------|--------|
| Complete a lesson page | 10 |
| Answer knowledge check correctly | 25 |
| Answer on first attempt | 50 (bonus) |
| Complete a module | 100 |
| Pass a quiz (>80%) | 200 |
| Perfect quiz score | 500 |

### Streaks

```html
<div class="streak-display" id="streak-display">
  <span class="streak-flame">&#128293;</span>
  <span class="streak-count" id="streak-count">0</span>
  <span class="streak-label">streak</span>
</div>
```

```css
.streak-display {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: #fff3e0;
  border: 2px solid #ff9800;
  border-radius: 20px;
  font-weight: 700;
  color: #e65100;
}

.streak-display.active {
  animation: streakGlow 1.5s ease infinite;
}

@keyframes streakGlow {
  0%, 100% { box-shadow: 0 0 4px rgba(255, 152, 0, 0.3); }
  50% { box-shadow: 0 0 16px rgba(255, 152, 0, 0.6); }
}
```

```javascript
const StreakTracker = {
  currentStreak: 0,
  bestStreak: 0,

  init() {
    const saved = ScormAPI.getValue('cmi.suspend_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.currentStreak = data.streak?.current || 0;
        this.bestStreak = data.streak?.best || 0;
      } catch (e) {}
    }
    this.updateDisplay();
  },

  correct() {
    this.currentStreak++;
    if (this.currentStreak > this.bestStreak) {
      this.bestStreak = this.currentStreak;
    }
    this.updateDisplay();
    if (this.currentStreak === 3) PointsManager.award(50, 'streak bonus');
    if (this.currentStreak === 5) PointsManager.award(100, 'streak bonus');
    if (this.currentStreak === 10) PointsManager.award(250, 'streak bonus');
    this.save();
  },

  incorrect() {
    this.currentStreak = 0;
    this.updateDisplay();
    this.save();
  },

  updateDisplay() {
    const countEl = document.getElementById('streak-count');
    const displayEl = document.getElementById('streak-display');
    if (countEl) countEl.textContent = this.currentStreak;
    if (displayEl) displayEl.classList.toggle('active', this.currentStreak >= 3);
  },

  save() {
    const existing = ScormAPI.getValue('cmi.suspend_data');
    let data = {};
    try { data = JSON.parse(existing); } catch (e) { data = {}; }
    data.streak = { current: this.currentStreak, best: this.bestStreak };
    ScormAPI.setValue('cmi.suspend_data', JSON.stringify(data));
    ScormAPI.commit();
  }
};
```

### Celebration Animations

```javascript
const CelebrationManager = {
  show(message, type) {
    if (type === 'confetti') this.showConfetti();
    this.showMessage(message);
  },

  showConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    container.setAttribute('aria-hidden', 'true');
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#2196F3',
                     '#4CAF50', '#ff9800', '#ffeb3b'];
    for (let i = 0; i < 50; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 2 + 's';
      piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
      piece.style.width = (Math.random() * 8 + 4) + 'px';
      piece.style.height = (Math.random() * 8 + 4) + 'px';
      container.appendChild(piece);
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 4000);
  },

  showMessage(message) {
    const overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';
    overlay.innerHTML =
      '<div class="celebration-card">' +
        '<div class="celebration-icon">&#127881;</div>' +
        '<div class="celebration-text">' + message + '</div>' +
        '<button class="celebration-dismiss" onclick="this.closest(\'.celebration-overlay\').remove()">' +
          'Continue' +
        '</button>' +
      '</div>';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 10);
  }
};
```

```css
.confetti-container {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  top: -10px;
  border-radius: 2px;
  animation: confettiFall linear forwards;
}

@keyframes confettiFall {
  0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}

.celebration-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10000;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.celebration-overlay.show { opacity: 1; }

.celebration-card {
  background: #fff;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: celebrationBounce 0.5s ease;
}

@keyframes celebrationBounce {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.celebration-icon { font-size: 3rem; margin-bottom: 16px; }
.celebration-text { font-size: 1.3rem; font-weight: 700; color: #333; margin-bottom: 20px; }

.celebration-dismiss {
  padding: 10px 32px;
  background: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}
```

---

## Psychological Frameworks Reference

### Self-Determination Theory (SDT)
Three innate needs drive motivation:
- **Autonomy** -- Let learners choose lesson order, skip known content
- **Competence** -- Progressive difficulty, clear feedback, mastery indicators
- **Relatedness** -- Narrative characters, real-world scenarios, social proof

### Flow State (Csikszentmihalyi)
Challenge must slightly exceed current skill level:
- Too easy = boredom
- Too hard = anxiety
- Sweet spot = Zone of Proximal Development

### Self-Efficacy (Bandura)
Build confidence through:
- Start with easy wins
- Show progress explicitly
- Celebrate achievements
- Frame failures as learning opportunities

---

*Source: Nafez Substack, academic research on SDT, gamification best practices 2024-2025*
