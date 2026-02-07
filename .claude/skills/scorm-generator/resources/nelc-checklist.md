# NELC Saudi E-Learning Compliance Checklist

> Extracted from NELC (National eLearning Center) standards research.
> Use this checklist when building SCORM packages for Saudi Arabia / MENA region.

---

## Technical Quality

- [ ] Video format: MP4/H.264, max 10 minutes per clip
- [ ] Audio: Clear, noise-free, consistent levels across all SCOs
- [ ] Images: High quality, appropriate resolution for screen display
- [ ] Fonts: Readable sizes (min 16px body, min 18px Arabic)
- [ ] Color contrast: WCAG AA minimum (4.5:1 ratio)
- [ ] Responsive design: Works on desktop, tablet, mobile
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge
- [ ] HTTPS-ready: No mixed content issues
- [ ] Self-contained: No external server dependencies

## Content Quality

- [ ] Content reviewed for accuracy and currency
- [ ] Intellectual property compliance verified
- [ ] Cultural alignment with Saudi/Islamic values
- [ ] Content chunked into small, manageable segments
- [ ] Consistent design across all course SCOs
- [ ] AI usage disclosed if applicable
- [ ] Data handling compliant with privacy policies

## Instructional Design

- [ ] Clear learning objectives at start of each SCO
- [ ] Bloom's taxonomy verbs for measurable outcomes
- [ ] Content aligned with objectives
- [ ] Activities aligned with objectives
- [ ] Assessments aligned with objectives
- [ ] Universal Design for Learning (UDL) principles applied
- [ ] Student-centered design approach

## Accessibility

- [ ] WCAG 2.1 AA compliance
- [ ] Semantic HTML5 structure
- [ ] ARIA labels on interactive elements
- [ ] Alt text on all images
- [ ] Keyboard navigation fully functional
- [ ] Screen reader compatible
- [ ] Captions/transcripts for audio/video
- [ ] Focus management for dynamic content
- [ ] Skip navigation links

## Interactivity

- [ ] Minimum 2 different interaction types per module
- [ ] Knowledge checks within content (not just end quizzes)
- [ ] Interactive elements foster higher-order thinking
- [ ] Activities appropriate for target audience
- [ ] Interaction state saved in `cmi.suspend_data`

## Arabic/RTL Support

- [ ] RTL layout for Arabic content (`dir="rtl"`)
- [ ] Arabic-optimized font stack loaded
- [ ] Font sizes appropriate for Arabic (18px+ body)
- [ ] Line height adequate for Arabic (1.6-1.8)
- [ ] Bidirectional text support where mixed
- [ ] Hijri/Gregorian calendar options
- [ ] Arabic-Indic numeral support

## SCORM Compliance

- [ ] Valid `imsmanifest.xml` with proper namespaces
- [ ] SCORM API wrapper functional (Initialize, GetValue, SetValue, Commit, Terminate)
- [ ] Lesson status reported (completion tracking)
- [ ] Score reported for assessment SCOs
- [ ] Bookmark/resume via `suspend_data`
- [ ] Session time tracked
- [ ] Individual interactions reported for quizzes
- [ ] Tested on ADL SCORM Test Suite or SCORM Cloud

## Assessment

- [ ] Formative knowledge checks after each lesson
- [ ] Summative module quizzes
- [ ] Clear passing criteria defined
- [ ] Meaningful feedback on responses
- [ ] Remediation paths for failed assessments
- [ ] Academic integrity measures
- [ ] Rubrics/criteria shown before assessments

---

## NELC Standards Framework

NELC's quality framework is organized into **5 primary domains**:

1. **Leadership** -- Strategic vision and governance
2. **Technology** -- Technical infrastructure and platforms
3. **Qualification & Support** -- Training and support systems
4. **Design** -- Instructional and content design
5. **Interaction** -- Learner engagement and activities

## Key Mandatory Requirements

1. Video max 10 minutes per clip with summary at end
2. Audio free from noise, consistent levels
3. WCAG 2.1 AA accessibility compliance
4. Arabic RTL support with appropriate fonts (18px+ body)
5. Minimum 2 interaction types per module
6. Clear learning objectives at start of each unit
7. Aligned assessments measuring stated outcomes
8. Cultural alignment with Saudi/Islamic values
9. Content chunking to reduce cognitive load
10. Consistent design across all course units
11. Cross-device responsive design (desktop, tablet, mobile)
12. IP compliance -- all content free from violations
13. Academic integrity measures in assessments
14. Data privacy compliance in tracking
15. HTTPS-ready content

## Arabic Typography Guide

### Recommended Fonts
- **Noto Kufi Arabic** -- Modern, clean, excellent for headings
- **Cairo** -- Versatile, good for body text and UI
- **Tajawal** -- Clean and readable, works well at small sizes
- **IBM Plex Arabic** -- Professional, pairs well with IBM Plex Sans
- **Almarai** -- Google Font, excellent screen readability

### Font Size Guidelines
- Body text: Minimum 18px (Arabic requires larger size than Latin)
- Headings: 24px-36px
- Captions/small text: Minimum 14px
- Line height: 1.6-1.8 for Arabic text

### CSS Implementation

```css
/* Arabic font stack */
body[lang="ar"] {
  font-family: 'Cairo', 'Noto Kufi Arabic', 'Tajawal', sans-serif;
  font-size: 18px;
  line-height: 1.7;
  direction: rtl;
  text-align: right;
}

/* Base RTL support */
html[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

/* English text within Arabic content */
.en-text {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  direction: ltr;
  unicode-bidi: embed;
}
```

## SCORM Data Tracking Requirements

| Data Point | SCORM 1.2 | SCORM 2004 | Purpose |
|------------|-----------|------------|---------|
| Lesson Status | `cmi.core.lesson_status` | `cmi.completion_status` | Completion tracking |
| Score | `cmi.core.score.raw` | `cmi.score.scaled` | Assessment results |
| Bookmarking | `cmi.suspend_data` | `cmi.suspend_data` | Resume capability |
| Time Spent | `cmi.core.session_time` | `cmi.session_time` | Engagement analytics |
| Interactions | `cmi.interactions.n.*` | `cmi.interactions.n.*` | Quiz item tracking |
| Objectives | N/A | `cmi.objectives.n.*` | Per-objective mastery |

## Recommended File Structure

```
output/[course-name]/
  imsmanifest.xml              # SCORM manifest
  metadata.json                # NELC compliance info
  shared/
    scorm-api.js               # SCORM API wrapper
    styles.css                 # Global styles (WCAG AA, RTL)
    rtl.css                    # Arabic RTL overrides
    accessibility.css          # Accessibility enhancements
    interactions.js            # Shared interaction components
    assessment-engine.js       # Quiz/assessment framework
    assets/
      fonts/                   # Arabic + Latin font files
      images/                  # Optimized images
      videos/                  # MP4/H.264, max 10 min each
  sco_01_introduction/
    index.html                 # Semantic HTML5, ARIA, skip-nav
    content.js
    data.json                  # Objectives, content, metadata
  sco_02_lesson_1/
  sco_03_knowledge_check_1/    # Formative assessment
  sco_04_lesson_2/
  sco_05_module_quiz/          # Summative assessment
```

---

*Source: NELC official website (nelc.gov.sa), FutureX platform, NELC Implementing Rules 2025*
