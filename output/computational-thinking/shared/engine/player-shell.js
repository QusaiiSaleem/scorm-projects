/**
 * SCORM Content Studio — Player Shell Controller
 * =================================================
 * Wraps the existing SlideController with a Storyline-like player chrome:
 * topbar, sidebar (menu/glossary/resources/notes), and bottom controls.
 *
 * The player shell is OPTIONAL — courses that don't include player-shell.css
 * and player-shell.js will work exactly as before with the basic layout.
 *
 * Usage:
 *   const player = new PlayerShell({
 *     title: 'My Course',
 *     theme: 'dark',             // 'light' | 'dark'
 *     sidebar: true,
 *     sidebarPosition: 'left',   // 'left' | 'right'
 *     panels: ['menu', 'glossary', 'resources', 'notes'],
 *     navMode: 'free',           // 'free' | 'restricted' | 'locked'
 *     menu: [
 *       { title: 'Module 1', items: [
 *         { title: 'Introduction', slideIndex: 0 },
 *         { title: 'Key Concepts', slideIndex: 1 }
 *       ]},
 *     ],
 *     glossary: [
 *       { term: 'API', definition: 'Application Programming Interface' }
 *     ],
 *     resources: [
 *       { title: 'Study Guide', url: 'assets/guide.pdf', icon: 'doc' }
 *     ],
 *     notes: {
 *       0: 'Welcome to the course...',
 *       3: 'Key takeaway: ...'
 *     },
 *     onSlideChange: function(index, total) {},
 *     onComplete: function() {}
 *   });
 *
 * @requires SlideController (slide-controller.js)
 * @requires player-shell.css
 */

(function () {
  'use strict';

  /* =========================================================================
     NAV MODE CONSTANTS
     ========================================================================= */

  /** @enum {string} Navigation mode constants */
  var NAV_MODE = {
    FREE: 'free',           // Any slide accessible via menu
    RESTRICTED: 'restricted', // Only visited + next slide
    LOCKED: 'locked'        // Must complete current before moving
  };

  /* =========================================================================
     BREAKPOINT CONSTANTS
     ========================================================================= */

  var BREAKPOINT_TABLET = 1024;
  var BREAKPOINT_PHONE = 600;

  /* =========================================================================
     PlayerShell CLASS
     ========================================================================= */

  /**
   * Creates the player shell chrome and wires it to SlideController.
   * @constructor
   * @param {Object} config - Player configuration object
   */
  function PlayerShell(config) {
    config = config || {};

    // --- Configuration ---
    this.title = config.title || 'Course';
    this.theme = config.theme || 'light';
    this.sidebar = config.sidebar !== false;
    this.sidebarPosition = config.sidebarPosition || 'left';
    this.panels = config.panels || ['menu'];
    this.navMode = config.navMode || NAV_MODE.FREE;
    this.menuData = config.menu || [];
    this.glossaryData = config.glossary || [];
    this.resourcesData = config.resources || [];
    this.notesData = config.notes || {};
    this.onSlideChange = config.onSlideChange || null;
    this.onComplete = config.onComplete || null;

    // --- State ---
    this.sidebarOpen = false;
    this.activePanel = this.panels[0] || 'menu';
    this.visitedSlides = new Set();
    this.currentIndex = 0;
    this.totalSlides = 0;

    // --- DOM references (populated by _init) ---
    this.shell = null;
    this.slideController = null;

    // --- Build the player ---
    this._init();
  }

  /* =========================================================================
     INITIALIZATION
     ========================================================================= */

  /**
   * Finds or wraps the DOM, creates SlideController, binds events.
   * @private
   */
  PlayerShell.prototype._init = function () {
    // The .player-shell wrapper should already exist in the HTML.
    // If it doesn't, we wrap the existing .sco-container.
    this.shell = document.querySelector('.player-shell');

    if (!this.shell) {
      this._wrapExistingDOM();
    }

    // Apply theme
    this.shell.setAttribute('data-player-theme', this.theme);

    // Apply sidebar position
    if (this.sidebarPosition === 'right') {
      document.documentElement.setAttribute('dir',
        document.documentElement.getAttribute('dir') || 'ltr');
      // For right sidebar we reverse the grid columns
      this.shell.style.gridTemplateColumns = '1fr ' +
        getComputedStyle(this.shell).getPropertyValue('--player-sidebar-width');
      this.shell.style.gridTemplateAreas =
        '"topbar topbar" "content sidebar" "controls controls"';
    }

    // Cache DOM references
    this._cacheDOMRefs();

    // Populate sidebar panels
    this._renderMenu();
    this._renderGlossary();
    this._renderResources();
    this._renderNotes(0);

    // Show initial panel
    this._switchPanel(this.activePanel);

    // Create SlideController
    var self = this;
    this.slideController = new window.SlideController({
      onSlideChange: function (index, total) {
        self._onSlideChanged(index, total);
      },
      onComplete: function () {
        if (self.onComplete) self.onComplete();
      }
    });

    this.totalSlides = this.slideController.totalSlides;
    this.visitedSlides.add(0);

    // Bind events
    this._bindEvents();
    this._bindKeyboardShortcuts();
    this._handleResize();
    this._updateUI();

    // Screen reader announcement
    this._announce('Course loaded: ' + this.title);
  };

  /**
   * If no .player-shell exists, dynamically wrap the page DOM.
   * This allows the player to work with existing SCO HTML.
   * @private
   */
  PlayerShell.prototype._wrapExistingDOM = function () {
    var sco = document.querySelector('.sco-container');
    if (!sco) return;

    // Create shell wrapper
    var shell = document.createElement('div');
    shell.className = 'player-shell';
    if (!this.sidebar) {
      shell.setAttribute('data-sidebar', 'none');
    }

    // Topbar
    shell.innerHTML =
      '<a href="#player-main-content" class="skip-nav">Skip to content</a>' +
      '<header class="player-topbar" role="banner">' +
        '<button class="player-hamburger" aria-label="Toggle menu" aria-expanded="false">&#9776;</button>' +
        '<div class="player-logo"></div>' +
        '<h1 class="player-title">' + this._escapeHTML(this.title) + '</h1>' +
        '<nav class="player-tabs" aria-label="Player tabs"></nav>' +
      '</header>' +
      '<div class="player-sidebar-backdrop"></div>' +
      '<aside class="player-sidebar" role="navigation" aria-label="Course sidebar">' +
        '<button class="sidebar-close" aria-label="Close sidebar">&times;</button>' +
        '<div class="sidebar-header"></div>' +
        '<div class="sidebar-panel" id="menu-panel" data-panel="menu" role="region" aria-label="Course menu"></div>' +
        '<div class="sidebar-panel" id="glossary-panel" data-panel="glossary" role="region" aria-label="Glossary"></div>' +
        '<div class="sidebar-panel" id="resources-panel" data-panel="resources" role="region" aria-label="Resources"></div>' +
        '<div class="sidebar-panel" id="notes-panel" data-panel="notes" role="region" aria-label="Notes"></div>' +
      '</aside>' +
      '<main class="player-content" id="player-main-content" role="main"></main>' +
      '<footer class="player-controls" role="toolbar" aria-label="Player controls">' +
        '<button class="btn-prev ctrl-btn" id="prevBtn" aria-label="Previous slide">' +
          '<span class="btn-icon">&lsaquo;</span> <span class="btn-label">Previous</span>' +
        '</button>' +
        '<div class="player-progress">' +
          '<span class="page-indicator" id="pageIndicator"></span>' +
          '<div class="progress-track"><div class="progress-fill"></div></div>' +
        '</div>' +
        '<button class="ctrl-btn btn-captions" aria-label="Toggle captions" title="Toggle captions">CC</button>' +
        '<button class="btn-next ctrl-btn" id="nextBtn" aria-label="Next slide">' +
          '<span class="btn-label">Next</span> <span class="btn-icon">&rsaquo;</span>' +
        '</button>' +
      '</footer>';

    // Move the existing sco-container inside the player content area
    var contentArea = shell.querySelector('.player-content');
    sco.parentNode.insertBefore(shell, sco);
    contentArea.appendChild(sco);

    this.shell = shell;
  };

  /**
   * Cache frequently accessed DOM elements.
   * @private
   */
  PlayerShell.prototype._cacheDOMRefs = function () {
    this.dom = {
      topbar: this.shell.querySelector('.player-topbar'),
      title: this.shell.querySelector('.player-title'),
      tabs: this.shell.querySelector('.player-tabs'),
      hamburger: this.shell.querySelector('.player-hamburger'),
      sidebar: this.shell.querySelector('.player-sidebar'),
      sidebarClose: this.shell.querySelector('.sidebar-close'),
      sidebarHeader: this.shell.querySelector('.sidebar-header'),
      backdrop: this.shell.querySelector('.player-sidebar-backdrop'),
      content: this.shell.querySelector('.player-content'),
      controls: this.shell.querySelector('.player-controls'),
      prevBtn: this.shell.querySelector('.btn-prev'),
      nextBtn: this.shell.querySelector('.btn-next'),
      pageIndicator: this.shell.querySelector('.page-indicator'),
      progressFill: this.shell.querySelector('.progress-fill'),
      captionsBtn: this.shell.querySelector('.btn-captions'),
      menuPanel: this.shell.querySelector('#menu-panel'),
      glossaryPanel: this.shell.querySelector('#glossary-panel'),
      resourcesPanel: this.shell.querySelector('#resources-panel'),
      notesPanel: this.shell.querySelector('#notes-panel'),
      announcer: null
    };

    // Create live region for screen reader announcements
    var announcer = document.createElement('div');
    announcer.id = 'player-announcer';
    announcer.className = 'sr-only';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    this.shell.appendChild(announcer);
    this.dom.announcer = announcer;

    // Build topbar tabs
    this._renderTopbarTabs();

    // Build sidebar tabs
    this._renderSidebarTabs();
  };

  /* =========================================================================
     RENDERING — TOPBAR & SIDEBAR TABS
     ========================================================================= */

  /**
   * Creates buttons in the topbar for each enabled panel.
   * @private
   */
  PlayerShell.prototype._renderTopbarTabs = function () {
    if (!this.dom.tabs) return;
    this.dom.tabs.innerHTML = '';

    var self = this;
    this.panels.forEach(function (panel) {
      var btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.setAttribute('data-panel', panel);
      btn.textContent = self._panelLabel(panel);
      btn.addEventListener('click', function () {
        self._switchPanel(panel);
        // On mobile, also open sidebar
        if (self._isMobile()) {
          self.openSidebar();
        }
      });
      self.dom.tabs.appendChild(btn);
    });
  };

  /**
   * Creates tab buttons inside the sidebar header.
   * @private
   */
  PlayerShell.prototype._renderSidebarTabs = function () {
    if (!this.dom.sidebarHeader) return;
    this.dom.sidebarHeader.innerHTML = '';

    var self = this;
    this.panels.forEach(function (panel) {
      var btn = document.createElement('button');
      btn.className = 'sidebar-tab';
      btn.setAttribute('data-panel', panel);
      btn.textContent = self._panelLabel(panel);
      btn.addEventListener('click', function () {
        self._switchPanel(panel);
      });
      self.dom.sidebarHeader.appendChild(btn);
    });
  };

  /**
   * Returns a human-readable label for a panel ID.
   * @private
   * @param {string} panel
   * @returns {string}
   */
  PlayerShell.prototype._panelLabel = function (panel) {
    var labels = {
      menu: 'Menu',
      glossary: 'Glossary',
      resources: 'Resources',
      notes: 'Notes'
    };
    return labels[panel] || panel;
  };

  /* =========================================================================
     RENDERING — MENU
     ========================================================================= */

  /**
   * Builds the course menu from config data.
   * @private
   */
  PlayerShell.prototype._renderMenu = function () {
    var container = this.dom.menuPanel;
    if (!container) return;

    if (!this.menuData.length) {
      // Auto-generate menu from slides
      this._autoGenerateMenu();
      return;
    }

    var nav = document.createElement('nav');
    nav.className = 'course-menu';
    nav.setAttribute('aria-label', 'Course menu');

    var self = this;
    this.menuData.forEach(function (section) {
      var sectionEl = document.createElement('div');
      sectionEl.className = 'menu-section';

      // Section title
      var titleEl = document.createElement('div');
      titleEl.className = 'menu-section-title';
      titleEl.textContent = section.title;
      sectionEl.appendChild(titleEl);

      // Section items
      if (section.items) {
        section.items.forEach(function (item) {
          var btn = document.createElement('button');
          btn.className = 'menu-item';
          btn.setAttribute('data-slide-index', item.slideIndex);
          btn.textContent = item.title;
          btn.addEventListener('click', function () {
            self._navigateToSlide(item.slideIndex);
          });
          sectionEl.appendChild(btn);
        });
      }

      nav.appendChild(sectionEl);
    });

    container.appendChild(nav);
  };

  /**
   * Auto-generates a flat menu when no menu data is provided.
   * Each slide becomes a menu item.
   * @private
   */
  PlayerShell.prototype._autoGenerateMenu = function () {
    var container = this.dom.menuPanel;
    var slides = document.querySelectorAll('.slide');
    if (!slides.length) return;

    var nav = document.createElement('nav');
    nav.className = 'course-menu';
    nav.setAttribute('aria-label', 'Course menu');

    var self = this;
    var section = document.createElement('div');
    section.className = 'menu-section';

    for (var i = 0; i < slides.length; i++) {
      (function (index) {
        var slide = slides[index];
        var title = slide.getAttribute('data-title') ||
          (slide.querySelector('h1, h2, h3') || {}).textContent ||
          'Slide ' + (index + 1);

        var btn = document.createElement('button');
        btn.className = 'menu-item';
        btn.setAttribute('data-slide-index', index);
        btn.textContent = title;
        btn.addEventListener('click', function () {
          self._navigateToSlide(index);
        });
        section.appendChild(btn);
      })(i);
    }

    nav.appendChild(section);
    container.appendChild(nav);
  };

  /* =========================================================================
     RENDERING — GLOSSARY
     ========================================================================= */

  /**
   * Builds the glossary panel with search.
   * @private
   */
  PlayerShell.prototype._renderGlossary = function () {
    var container = this.dom.glossaryPanel;
    if (!container || !this.glossaryData.length) return;

    // Search input
    var search = document.createElement('input');
    search.type = 'search';
    search.className = 'glossary-search';
    search.placeholder = 'Search glossary...';
    search.setAttribute('aria-label', 'Search glossary');
    container.appendChild(search);

    // Terms list
    var list = document.createElement('dl');
    list.className = 'glossary-list';

    // Sort alphabetically
    var sorted = this.glossaryData.slice().sort(function (a, b) {
      return a.term.localeCompare(b.term);
    });

    sorted.forEach(function (entry) {
      var termGroup = document.createElement('div');
      termGroup.className = 'glossary-term';

      var dt = document.createElement('dt');
      dt.textContent = entry.term;
      termGroup.appendChild(dt);

      var dd = document.createElement('dd');
      dd.textContent = entry.definition;
      termGroup.appendChild(dd);

      list.appendChild(termGroup);
    });

    container.appendChild(list);

    // Search filter
    search.addEventListener('input', function () {
      var query = search.value.toLowerCase();
      var terms = list.querySelectorAll('.glossary-term');
      terms.forEach(function (t) {
        var text = t.textContent.toLowerCase();
        t.style.display = text.includes(query) ? '' : 'none';
      });
    });
  };

  /* =========================================================================
     RENDERING — RESOURCES
     ========================================================================= */

  /**
   * Builds the resources panel with download links.
   * @private
   */
  PlayerShell.prototype._renderResources = function () {
    var container = this.dom.resourcesPanel;
    if (!container || !this.resourcesData.length) return;

    var list = document.createElement('ul');
    list.className = 'resources-list';

    this.resourcesData.forEach(function (res) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.className = 'resource-item';
      a.href = res.url || '#';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

      var icon = document.createElement('span');
      icon.className = 'resource-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = res.icon === 'link' ? '\u{1F517}' : '\u{1F4C4}';
      a.appendChild(icon);

      var title = document.createElement('span');
      title.textContent = res.title || res.url;
      a.appendChild(title);

      li.appendChild(a);
      list.appendChild(li);
    });

    container.appendChild(list);
  };

  /* =========================================================================
     RENDERING — NOTES
     ========================================================================= */

  /**
   * Updates the notes panel for the current slide.
   * @private
   * @param {number} slideIndex
   */
  PlayerShell.prototype._renderNotes = function (slideIndex) {
    var container = this.dom.notesPanel;
    if (!container) return;

    container.innerHTML = '';
    var note = this.notesData[slideIndex];

    if (note) {
      var div = document.createElement('div');
      div.className = 'notes-content';
      div.textContent = note;
      container.appendChild(div);
    } else {
      var empty = document.createElement('div');
      empty.className = 'notes-empty';
      empty.textContent = 'No notes for this slide.';
      container.appendChild(empty);
    }
  };

  /* =========================================================================
     PANEL SWITCHING
     ========================================================================= */

  /**
   * Switches the visible sidebar panel and updates tab states.
   * @private
   * @param {string} panelId - 'menu' | 'glossary' | 'resources' | 'notes'
   */
  PlayerShell.prototype._switchPanel = function (panelId) {
    this.activePanel = panelId;

    // Update sidebar panels
    var panels = this.shell.querySelectorAll('.sidebar-panel');
    panels.forEach(function (p) {
      p.classList.toggle('active', p.getAttribute('data-panel') === panelId);
    });

    // Update topbar tab buttons
    var topTabs = this.shell.querySelectorAll('.player-tabs .tab-btn');
    topTabs.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-panel') === panelId);
    });

    // Update sidebar tab buttons
    var sideTabs = this.shell.querySelectorAll('.sidebar-header .sidebar-tab');
    sideTabs.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-panel') === panelId);
    });
  };

  /* =========================================================================
     SIDEBAR OPEN / CLOSE
     ========================================================================= */

  /**
   * Opens the sidebar (used on mobile/tablet).
   */
  PlayerShell.prototype.openSidebar = function () {
    this.sidebarOpen = true;
    this.dom.sidebar.classList.add('open');
    if (this.dom.backdrop) {
      this.dom.backdrop.classList.add('visible');
    }
    if (this.dom.hamburger) {
      this.dom.hamburger.setAttribute('aria-expanded', 'true');
    }
    // Trap focus inside sidebar on mobile
    if (this._isMobile()) {
      this._trapFocusInSidebar();
    }
    this._announce('Sidebar opened');
  };

  /**
   * Closes the sidebar.
   */
  PlayerShell.prototype.closeSidebar = function () {
    this.sidebarOpen = false;
    this.dom.sidebar.classList.remove('open');
    if (this.dom.backdrop) {
      this.dom.backdrop.classList.remove('visible');
    }
    if (this.dom.hamburger) {
      this.dom.hamburger.setAttribute('aria-expanded', 'false');
      this.dom.hamburger.focus();
    }
    this._releaseFocusTrap();
    this._announce('Sidebar closed');
  };

  /**
   * Toggles sidebar open/closed.
   */
  PlayerShell.prototype.toggleSidebar = function () {
    if (this.sidebarOpen) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  };

  /* =========================================================================
     NAVIGATION
     ========================================================================= */

  /**
   * Navigate to a specific slide via the menu, respecting nav mode.
   * @private
   * @param {number} index
   */
  PlayerShell.prototype._navigateToSlide = function (index) {
    if (!this._canNavigateTo(index)) return;

    if (this.slideController) {
      this.slideController.goTo(index);
    }

    // Close sidebar on mobile after navigation
    if (this._isMobile() && this.sidebarOpen) {
      this.closeSidebar();
    }
  };

  /**
   * Checks if a slide is accessible based on the current nav mode.
   * @private
   * @param {number} index
   * @returns {boolean}
   */
  PlayerShell.prototype._canNavigateTo = function (index) {
    switch (this.navMode) {
      case NAV_MODE.FREE:
        return true;

      case NAV_MODE.RESTRICTED:
        // Can visit any previously visited slide, or the next unvisited one
        return this.visitedSlides.has(index) || index <= this._highestVisited() + 1;

      case NAV_MODE.LOCKED:
        // Can only go to current or previously visited slides
        return this.visitedSlides.has(index);

      default:
        return true;
    }
  };

  /**
   * Returns the highest visited slide index.
   * @private
   * @returns {number}
   */
  PlayerShell.prototype._highestVisited = function () {
    var max = 0;
    this.visitedSlides.forEach(function (idx) {
      if (idx > max) max = idx;
    });
    return max;
  };

  /* =========================================================================
     SLIDE CHANGE CALLBACK
     ========================================================================= */

  /**
   * Called by SlideController whenever the active slide changes.
   * @private
   * @param {number} index
   * @param {number} total
   */
  PlayerShell.prototype._onSlideChanged = function (index, total) {
    this.currentIndex = index;
    this.totalSlides = total;
    this.visitedSlides.add(index);

    this._updateUI();
    this._updateMenuHighlight();
    this._renderNotes(index);

    // Announce slide change
    var slideTitle = this._getCurrentSlideTitle();
    this._announce('Slide ' + (index + 1) + ' of ' + total +
      (slideTitle ? ': ' + slideTitle : ''));

    // Move focus to slide content
    this._focusSlideContent();

    // External callback
    if (this.onSlideChange) {
      this.onSlideChange(index, total);
    }
  };

  /* =========================================================================
     UI UPDATES
     ========================================================================= */

  /**
   * Updates page indicator, progress bar, and button states.
   * @private
   */
  PlayerShell.prototype._updateUI = function () {
    // Page indicator
    if (this.dom.pageIndicator) {
      this.dom.pageIndicator.textContent =
        (this.currentIndex + 1) + ' / ' + this.totalSlides;
    }

    // Progress bar
    if (this.dom.progressFill && this.totalSlides > 0) {
      var pct = ((this.currentIndex + 1) / this.totalSlides) * 100;
      this.dom.progressFill.style.width = pct + '%';
    }

    // Prev/Next button states
    if (this.dom.prevBtn) {
      this.dom.prevBtn.disabled = this.currentIndex === 0;
    }
    if (this.dom.nextBtn) {
      var isLast = this.currentIndex === this.totalSlides - 1;
      var label = this.dom.nextBtn.querySelector('.btn-label');
      if (label) {
        label.textContent = isLast ? 'Complete' : 'Next';
      }
    }
  };

  /**
   * Highlights the current slide in the course menu.
   * @private
   */
  PlayerShell.prototype._updateMenuHighlight = function () {
    var items = this.shell.querySelectorAll('.menu-item');
    var self = this;

    items.forEach(function (item) {
      var idx = parseInt(item.getAttribute('data-slide-index'), 10);

      // Active state
      item.classList.toggle('active', idx === self.currentIndex);

      // Visited state
      item.classList.toggle('visited', self.visitedSlides.has(idx) && idx !== self.currentIndex);

      // Locked state (for restricted/locked nav modes)
      if (self.navMode !== NAV_MODE.FREE) {
        item.classList.toggle('locked', !self._canNavigateTo(idx));
      } else {
        item.classList.remove('locked');
      }
    });
  };

  /* =========================================================================
     EVENT BINDING
     ========================================================================= */

  /**
   * Binds click, resize, and touch events.
   * @private
   */
  PlayerShell.prototype._bindEvents = function () {
    var self = this;

    // Hamburger toggle
    if (this.dom.hamburger) {
      this.dom.hamburger.addEventListener('click', function () {
        self.toggleSidebar();
      });
    }

    // Sidebar close button
    if (this.dom.sidebarClose) {
      this.dom.sidebarClose.addEventListener('click', function () {
        self.closeSidebar();
      });
    }

    // Backdrop click closes sidebar
    if (this.dom.backdrop) {
      this.dom.backdrop.addEventListener('click', function () {
        self.closeSidebar();
      });
    }

    // Prev/Next buttons in player controls
    if (this.dom.prevBtn) {
      this.dom.prevBtn.addEventListener('click', function () {
        if (self.slideController) self.slideController.prev();
      });
    }
    if (this.dom.nextBtn) {
      this.dom.nextBtn.addEventListener('click', function () {
        if (self.slideController) self.slideController.next();
      });
    }

    // Captions toggle
    if (this.dom.captionsBtn) {
      this.dom.captionsBtn.addEventListener('click', function () {
        if (window.CaptionManager && window.CaptionManager.instance) {
          window.CaptionManager.instance.toggle();
          self.dom.captionsBtn.classList.toggle('active');
        }
      });
    }

    // Swipe to open/close sidebar on mobile
    this._bindSidebarSwipe();

    // Window resize
    window.addEventListener('resize', function () {
      self._handleResize();
    });
  };

  /**
   * Binds swipe gesture to open/close sidebar on mobile.
   * @private
   */
  PlayerShell.prototype._bindSidebarSwipe = function () {
    var self = this;
    var startX = 0;
    var startY = 0;
    var edgeThreshold = 30; // px from edge to trigger

    document.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
      var endX = e.changedTouches[0].clientX;
      var endY = e.changedTouches[0].clientY;
      var dx = endX - startX;
      var dy = endY - startY;

      // Only horizontal swipes
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;

      var isRTL = document.documentElement.dir === 'rtl';

      if (!self.sidebarOpen) {
        // Swipe from left edge (or right edge in RTL) to open
        var fromStartEdge = isRTL
          ? startX > window.innerWidth - edgeThreshold
          : startX < edgeThreshold;
        var swipeInward = isRTL ? dx < 0 : dx > 0;

        if (fromStartEdge && swipeInward && self._isMobile()) {
          self.openSidebar();
        }
      } else {
        // Swipe outward to close
        var swipeOutward = isRTL ? dx > 0 : dx < 0;
        if (swipeOutward) {
          self.closeSidebar();
        }
      }
    }, { passive: true });
  };

  /* =========================================================================
     KEYBOARD SHORTCUTS
     ========================================================================= */

  /**
   * Binds Ctrl+Alt keyboard shortcuts matching Storyline's pattern.
   * @private
   */
  PlayerShell.prototype._bindKeyboardShortcuts = function () {
    var self = this;

    document.addEventListener('keydown', function (e) {
      // Ctrl+Alt shortcuts (Storyline-compatible)
      if (e.ctrlKey && e.altKey) {
        switch (e.key.toLowerCase()) {
          case '.':
            e.preventDefault();
            if (self.slideController) self.slideController.next();
            break;
          case ',':
            e.preventDefault();
            if (self.slideController) self.slideController.prev();
            break;
          case 'm':
            e.preventDefault();
            self.toggleSidebar();
            break;
          case 'c':
            e.preventDefault();
            if (self.dom.captionsBtn) self.dom.captionsBtn.click();
            break;
        }
      }

      // Escape closes sidebar or lightbox
      if (e.key === 'Escape') {
        if (self.sidebarOpen) {
          self.closeSidebar();
        }
      }

      // Shift+? shows keyboard help
      if (e.shiftKey && e.key === '?') {
        self._showKeyboardHelp();
      }
    });
  };

  /**
   * Displays a brief keyboard shortcuts reference.
   * @private
   */
  PlayerShell.prototype._showKeyboardHelp = function () {
    // Use the lightbox system if available
    if (window.Lightbox) {
      window.Lightbox.open(
        '<h2>Keyboard Shortcuts</h2>' +
        '<table style="width:100%;border-collapse:collapse;font-size:14px;">' +
          '<tr><td style="padding:6px;"><kbd>Ctrl+Alt+.</kbd></td><td>Next slide</td></tr>' +
          '<tr><td style="padding:6px;"><kbd>Ctrl+Alt+,</kbd></td><td>Previous slide</td></tr>' +
          '<tr><td style="padding:6px;"><kbd>Ctrl+Alt+M</kbd></td><td>Toggle menu</td></tr>' +
          '<tr><td style="padding:6px;"><kbd>Ctrl+Alt+C</kbd></td><td>Toggle captions</td></tr>' +
          '<tr><td style="padding:6px;"><kbd>Escape</kbd></td><td>Close sidebar/modal</td></tr>' +
          '<tr><td style="padding:6px;"><kbd>Shift+?</kbd></td><td>Show shortcuts</td></tr>' +
        '</table>'
      );
    } else {
      this._announce(
        'Keyboard shortcuts: Ctrl+Alt+Period for next, Ctrl+Alt+Comma for previous, ' +
        'Ctrl+Alt+M to toggle menu, Ctrl+Alt+C for captions, Escape to close panels.'
      );
    }
  };

  /* =========================================================================
     ACCESSIBILITY
     ========================================================================= */

  /**
   * Announces a message to screen readers via the live region.
   * @private
   * @param {string} message
   */
  PlayerShell.prototype._announce = function (message) {
    if (this.dom.announcer) {
      this.dom.announcer.textContent = '';
      var announcer = this.dom.announcer;
      requestAnimationFrame(function () {
        announcer.textContent = message;
      });
    }
  };

  /**
   * Moves focus to the current slide's first content element.
   * @private
   */
  PlayerShell.prototype._focusSlideContent = function () {
    var activeSlide = document.querySelector('.slide.active');
    if (!activeSlide) return;

    var firstFocusable = activeSlide.querySelector(
      'h1, h2, h3, [tabindex="0"], a, button, input, select, textarea'
    );

    if (firstFocusable) {
      requestAnimationFrame(function () {
        firstFocusable.focus({ preventScroll: true });
      });
    }
  };

  /**
   * Traps focus inside the sidebar when it's open as an overlay.
   * @private
   */
  PlayerShell.prototype._trapFocusInSidebar = function () {
    var sidebar = this.dom.sidebar;
    if (!sidebar) return;

    this._focusTrapHandler = function (e) {
      if (e.key !== 'Tab') return;

      var focusable = sidebar.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    sidebar.addEventListener('keydown', this._focusTrapHandler);

    // Focus first focusable in sidebar
    var firstBtn = sidebar.querySelector('button, [href], input');
    if (firstBtn) firstBtn.focus();
  };

  /**
   * Removes the focus trap from the sidebar.
   * @private
   */
  PlayerShell.prototype._releaseFocusTrap = function () {
    if (this._focusTrapHandler && this.dom.sidebar) {
      this.dom.sidebar.removeEventListener('keydown', this._focusTrapHandler);
      this._focusTrapHandler = null;
    }
  };

  /* =========================================================================
     RESPONSIVE HANDLING
     ========================================================================= */

  /**
   * Adjusts layout based on window width.
   * @private
   */
  PlayerShell.prototype._handleResize = function () {
    var width = window.innerWidth;

    if (width <= BREAKPOINT_TABLET) {
      // Sidebar becomes overlay — close it if switching from desktop
      if (!this._isMobile() && this.sidebarOpen) {
        this.closeSidebar();
      }
    }
  };

  /**
   * Returns true if current viewport is tablet or smaller.
   * @private
   * @returns {boolean}
   */
  PlayerShell.prototype._isMobile = function () {
    return window.innerWidth <= BREAKPOINT_TABLET;
  };

  /* =========================================================================
     UTILITY
     ========================================================================= */

  /**
   * Gets the title of the current active slide.
   * @private
   * @returns {string}
   */
  PlayerShell.prototype._getCurrentSlideTitle = function () {
    var activeSlide = document.querySelector('.slide.active');
    if (!activeSlide) return '';

    var heading = activeSlide.querySelector('h1, h2, h3');
    return heading ? heading.textContent.trim() : '';
  };

  /**
   * Escapes HTML characters in a string for safe insertion.
   * @private
   * @param {string} str
   * @returns {string}
   */
  PlayerShell.prototype._escapeHTML = function (str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  /* =========================================================================
     PUBLIC API
     ========================================================================= */

  /**
   * Sets the navigation mode.
   * @param {string} mode - 'free' | 'restricted' | 'locked'
   */
  PlayerShell.prototype.setNavMode = function (mode) {
    this.navMode = mode;
    this._updateMenuHighlight();
  };

  /**
   * Navigates to a specific slide (public API).
   * @param {number} index
   */
  PlayerShell.prototype.goTo = function (index) {
    this._navigateToSlide(index);
  };

  /**
   * Returns the current slide index.
   * @returns {number}
   */
  PlayerShell.prototype.getCurrentIndex = function () {
    return this.currentIndex;
  };

  /**
   * Returns the set of visited slide indices.
   * @returns {Set<number>}
   */
  PlayerShell.prototype.getVisitedSlides = function () {
    return new Set(this.visitedSlides);
  };

  /* =========================================================================
     EXPORT
     ========================================================================= */

  window.PlayerShell = PlayerShell;

})();
