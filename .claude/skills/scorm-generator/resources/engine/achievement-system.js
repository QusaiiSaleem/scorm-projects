/* ==========================================================================
   SCORM Content Studio — Achievement / Badge System
   ============================================================================
   Unlockable achievements with notification popups and a badge gallery.
   Persists earned badge IDs in cmi.suspend_data via JSON.

   Usage:
     const achievements = new AchievementSystem();
     achievements.unlock('first_lesson');
     achievements.onQuizPass(score, maxScore);
     achievements.onLessonComplete();
     achievements.onStreakUpdate(5);
     achievements.renderGallery(containerElement);

   Integrates with SoundEffects (window.SoundEffects) and
   Confetti (window.Confetti) when available.
   ========================================================================== */

'use strict';

class AchievementSystem {
  constructor() {
    /** @type {Set<string>} IDs of earned achievements */
    this._earned = new Set();

    /** @type {Object<string, Object>} Badge definitions */
    this.badges = {
      first_lesson: {
        id: 'first_lesson',
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '\uD83D\uDC63'
      },
      perfect_quiz: {
        id: 'perfect_quiz',
        title: 'Perfect Score',
        description: 'Get 100% on a quiz',
        icon: '\uD83C\uDFC6'
      },
      speed_demon: {
        id: 'speed_demon',
        title: 'Speed Demon',
        description: 'Finish in under 60% of expected time',
        icon: '\u26A1'
      },
      explorer: {
        id: 'explorer',
        title: 'Explorer',
        description: 'Visit all optional content',
        icon: '\uD83E\uDDED'
      },
      streak_3: {
        id: 'streak_3',
        title: 'Hat Trick',
        description: '3 correct answers in a row',
        icon: '\uD83D\uDD25'
      },
      streak_5: {
        id: 'streak_5',
        title: 'On Fire',
        description: '5 correct answers in a row',
        icon: '\uD83D\uDE80'
      },
      streak_10: {
        id: 'streak_10',
        title: 'Unstoppable',
        description: '10 correct answers in a row',
        icon: '\uD83C\uDF1F'
      },
      completionist: {
        id: 'completionist',
        title: 'Completionist',
        description: 'Finish the entire course',
        icon: '\uD83C\uDF93'
      }
    };

    this._loadFromSuspendData();
    this._injectStyles();
  }

  /* ------------------------------------------------------------------
     Public API
     ------------------------------------------------------------------ */

  /**
   * Unlock an achievement by ID. Shows notification if newly earned.
   * @param {string} achievementId
   * @returns {boolean} true if newly unlocked, false if already earned
   */
  unlock(achievementId) {
    if (this._earned.has(achievementId)) return false;
    var badge = this.badges[achievementId];
    if (!badge) return false;

    this._earned.add(achievementId);
    this._saveToSuspendData();
    this._showNotification(badge);
    this._playSound();
    return true;
  }

  /**
   * Call when a quiz is passed. Checks for perfect_quiz achievement.
   * @param {number} score
   * @param {number} maxScore
   */
  onQuizPass(score, maxScore) {
    if (score === maxScore) {
      this.unlock('perfect_quiz');
    }
  }

  /**
   * Call when a lesson is completed.
   * @param {number} [elapsedMs] - Actual time taken
   * @param {number} [expectedMs] - Expected time for the lesson
   */
  onLessonComplete(elapsedMs, expectedMs) {
    this.unlock('first_lesson');
    if (elapsedMs && expectedMs && elapsedMs < expectedMs * 0.6) {
      this.unlock('speed_demon');
    }
  }

  /**
   * Call when the learner's correct-answer streak updates.
   * @param {number} count - Current streak count
   */
  onStreakUpdate(count) {
    if (count >= 3) this.unlock('streak_3');
    if (count >= 5) this.unlock('streak_5');
    if (count >= 10) this.unlock('streak_10');
  }

  /**
   * Call when the entire course is completed.
   */
  onCourseComplete() {
    this.unlock('completionist');
  }

  /**
   * Call when all optional content has been visited.
   */
  onAllOptionalVisited() {
    this.unlock('explorer');
  }

  /**
   * Check whether a specific achievement has been earned.
   * @param {string} achievementId
   * @returns {boolean}
   */
  isEarned(achievementId) {
    return this._earned.has(achievementId);
  }

  /**
   * Render a badge gallery grid into a container element.
   * Earned badges show full color; locked badges are greyed out.
   * @param {HTMLElement} container
   */
  renderGallery(container) {
    container.innerHTML = '';
    container.classList.add('achievement-gallery');

    var self = this;
    Object.keys(this.badges).forEach(function (id) {
      var badge = self.badges[id];
      var earned = self._earned.has(id);

      var card = document.createElement('div');
      card.className = 'achievement-card' + (earned ? ' earned' : ' locked');
      card.setAttribute('role', 'listitem');

      var icon = document.createElement('div');
      icon.className = 'achievement-icon';
      icon.textContent = earned ? badge.icon : '\uD83D\uDD12';
      icon.setAttribute('aria-hidden', 'true');

      var title = document.createElement('div');
      title.className = 'achievement-title';
      title.textContent = earned ? badge.title : '???';

      var desc = document.createElement('div');
      desc.className = 'achievement-desc';
      desc.textContent = earned ? badge.description : 'Keep learning to unlock';

      card.appendChild(icon);
      card.appendChild(title);
      card.appendChild(desc);
      container.appendChild(card);
    });
  }

  /* ------------------------------------------------------------------
     Persistence — cmi.suspend_data
     ------------------------------------------------------------------ */

  /** @private */
  _loadFromSuspendData() {
    try {
      if (typeof window.API !== 'undefined' && window.API.LMSGetValue) {
        var raw = window.API.LMSGetValue('cmi.suspend_data');
        if (raw) {
          var data = JSON.parse(raw);
          if (data && Array.isArray(data.achievements)) {
            for (var i = 0; i < data.achievements.length; i++) {
              this._earned.add(data.achievements[i]);
            }
          }
        }
      }
    } catch (e) {
      /* suspend_data may be empty or malformed — safe to ignore */
    }
  }

  /** @private */
  _saveToSuspendData() {
    try {
      if (typeof window.API !== 'undefined' && window.API.LMSGetValue) {
        var raw = window.API.LMSGetValue('cmi.suspend_data');
        var data = {};
        if (raw) {
          try { data = JSON.parse(raw); } catch (e) { data = {}; }
        }
        data.achievements = Array.from(this._earned);
        window.API.LMSSetValue('cmi.suspend_data', JSON.stringify(data));
        window.API.LMSCommit('');
      }
    } catch (e) {
      /* LMS may not be available in preview mode — safe to ignore */
    }
  }

  /* ------------------------------------------------------------------
     Notification Popup
     ------------------------------------------------------------------ */

  /** @private */
  _showNotification(badge) {
    var popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.setAttribute('role', 'alert');
    popup.innerHTML =
      '<span class="achievement-popup-icon" aria-hidden="true">' + badge.icon + '</span>' +
      '<div class="achievement-popup-text">' +
        '<strong>' + badge.title + '</strong>' +
        '<span>' + badge.description + '</span>' +
      '</div>';

    document.body.appendChild(popup);

    /* Trigger entrance animation on next frame */
    requestAnimationFrame(function () {
      popup.classList.add('show');
    });

    /* Auto-dismiss after 4 seconds */
    setTimeout(function () {
      popup.classList.remove('show');
      setTimeout(function () {
        if (popup.parentNode) popup.parentNode.removeChild(popup);
      }, 400);
    }, 4000);
  }

  /** @private Play celebration sound if SoundEffects is available */
  _playSound() {
    if (window.SoundEffects) {
      try {
        var sfx = new SoundEffects();
        sfx.playSound('celebration');
      } catch (e) { /* sound not critical */ }
    }
  }

  /* ------------------------------------------------------------------
     Inject Styles (self-contained — no external CSS needed)
     ------------------------------------------------------------------ */

  /** @private */
  _injectStyles() {
    if (document.getElementById('achievement-system-styles')) return;

    var style = document.createElement('style');
    style.id = 'achievement-system-styles';
    style.textContent = [
      /* --- Notification popup --- */
      '.achievement-popup {',
      '  position: fixed; top: 16px; right: 16px; z-index: 10000;',
      '  display: flex; align-items: center; gap: 12px;',
      '  background: var(--color-surface-elevated, #fff);',
      '  border: 1px solid var(--color-border, #e2e8f0);',
      '  border-radius: 12px; padding: 12px 20px;',
      '  box-shadow: 0 8px 32px rgba(0,0,0,0.12);',
      '  transform: translateX(120%);',
      '  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);',
      '  max-width: 320px;',
      '}',
      '.achievement-popup.show { transform: translateX(0); }',
      '.achievement-popup-icon { font-size: 2rem; line-height: 1; }',
      '.achievement-popup-text { display: flex; flex-direction: column; gap: 2px; }',
      '.achievement-popup-text strong {',
      '  font-size: 0.95rem; color: var(--color-text, #1e293b);',
      '}',
      '.achievement-popup-text span {',
      '  font-size: 0.8rem; color: var(--color-text-secondary, #64748b);',
      '}',

      /* --- Gallery --- */
      '.achievement-gallery {',
      '  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));',
      '  gap: 12px; padding: 8px 0;',
      '}',
      '.achievement-card {',
      '  display: flex; flex-direction: column; align-items: center;',
      '  text-align: center; padding: 16px 8px;',
      '  border-radius: 12px; border: 1px solid var(--color-border, #e2e8f0);',
      '  background: var(--color-surface, #f8fafc);',
      '  transition: transform 0.2s ease, box-shadow 0.2s ease;',
      '}',
      '.achievement-card.earned:hover {',
      '  transform: translateY(-2px);',
      '  box-shadow: 0 4px 12px rgba(0,0,0,0.08);',
      '}',
      '.achievement-card.locked {',
      '  opacity: 0.5; filter: grayscale(1);',
      '}',
      '.achievement-icon { font-size: 2rem; margin-bottom: 8px; }',
      '.achievement-title {',
      '  font-weight: 600; font-size: 0.85rem;',
      '  color: var(--color-text, #1e293b);',
      '}',
      '.achievement-desc {',
      '  font-size: 0.75rem; color: var(--color-text-secondary, #64748b);',
      '  margin-top: 4px;',
      '}',

      /* --- Reduced motion --- */
      '@media (prefers-reduced-motion: reduce) {',
      '  .achievement-popup { transition: none; }',
      '  .achievement-card.earned:hover { transform: none; }',
      '}'
    ].join('\n');

    document.head.appendChild(style);
  }
}

/* Export for SCORM iframe compatibility */
window.AchievementSystem = AchievementSystem;
