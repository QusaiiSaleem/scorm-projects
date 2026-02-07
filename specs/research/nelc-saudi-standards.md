# NELC Saudi E-Learning Content Standards
## Research Findings for SCORM Content Studio

**Research Date:** 2026-02-06
**Sources:** NELC official website (nelc.gov.sa), FutureX platform, Saudipedia, NELC Implementing Rules 2025
**Purpose:** Document all NELC standards relevant to SCORM HTML/CSS/JS content generation

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technical Quality Standards](#2-technical-quality-standards)
3. [Content Quality Standards](#3-content-quality-standards)
4. [Instructional Design Standards](#4-instructional-design-standards)
5. [Accessibility Standards](#5-accessibility-standards)
6. [Interactivity Standards](#6-interactivity-standards)
7. [SCORM/xAPI Compliance](#7-scormxapi-compliance)
8. [Arabic-Specific Requirements](#8-arabic-specific-requirements)
9. [Assessment Standards](#9-assessment-standards)
10. [Certification & Licensing](#10-certification--licensing)
11. [Implementation Guidance for SCORM Packages](#11-implementation-guidance-for-scorm-packages)
12. [Research Limitations](#12-research-limitations)

---

## 1. Overview

### About NELC

The **National eLearning Center (NeLC)** was established by Saudi Council of Ministers Decision No. 35 in 1439 H (2018) as an independent entity for regulating e-learning and ensuring its quality throughout the Kingdom of Saudi Arabia. NELC operates under the broader Saudi Vision 2030 framework.

### Regulatory Authority

NELC has authority to:
- Issue licenses for e-learning programs and providers
- Set standards and regulations for e-learning quality
- Accredit technical and digital solutions providers
- Operate the National eLearning Platform (FutureX)
- Measure national e-learning performance via the National Digital Learning Indicator

### Standards Framework Structure

NELC's quality framework is organized into **5 primary domains**:
1. **Leadership** (القيادة) - Strategic vision and governance
2. **Technology** (التقنية) - Technical infrastructure and platforms
3. **Qualification & Support** (التأهيل والدعم) - Training and support systems
4. **Design** (التصميم) - Instructional and content design
5. **Interaction** (التفاعل) - Learner engagement and activities

### Quality Assurance Competency Framework

The NELC eLearning Quality Assurance (eLQA) certification covers:
- **6 Domains**
- **19 Competencies**
- **59 Indicators**

Domains: Digital Literacy, Leadership, Pedagogy, Assessment, Communication & Collaboration, Professional Learning

---

## 2. Technical Quality Standards

### 2.1 Video Quality Standards

| Standard | Requirement | Priority |
|----------|-------------|----------|
| Video Resolution | Modern technology for cameras ensuring image quality and clarity | **Mandatory** |
| Video Duration | Maximum 10 minutes per video clip to deliver one or more educational objectives | **Mandatory** |
| Video Summaries | Each educational unit in a video must conclude with a summary of learning objectives | **Mandatory** |
| Design Consistency | Consistent visual design across all video content in a course | **Mandatory** |
| Visual Effects | Modern technology for visual effects that guarantee quality and clarity | **Recommended** |
| Video Encoding | Web-friendly format (MP4/H.264 recommended per international SCORM best practices) | **Mandatory** |

**SCORM Implementation Guidance:**
- Use MP4 format with H.264 encoding for maximum browser compatibility
- Target 1920x1080 (1080p) resolution as the baseline for quality
- Optimize bitrate for balance between quality and download speed (2500-5000 kbps recommended)
- Keep individual video files under 10 minutes as per NELC requirements
- Include summary screens at the end of each video segment
- Consider providing multiple quality options for varied bandwidth environments

### 2.2 Audio Quality Standards

| Standard | Requirement | Priority |
|----------|-------------|----------|
| Audio Clarity | Audio must be clear and audible | **Mandatory** |
| Noise-Free | Audio recordings must be free from distracting noise | **Mandatory** |
| Consistent Levels | Audio must be at a consistent level across all video/audio segments | **Mandatory** |
| Professional Quality | Modern recording technology ensuring sound quality | **Mandatory** |

**SCORM Implementation Guidance:**
- Use AAC audio codec within MP4 containers
- Sample rate: 44.1 kHz or 48 kHz
- Bitrate: Minimum 128 kbps for speech, 256 kbps for music/rich audio
- Normalize audio levels across all SCOs (target -14 LUFS to -16 LUFS)
- Include audio transcripts for accessibility

### 2.3 Visual and Media Quality Standards

| Standard | Requirement | Priority |
|----------|-------------|----------|
| Image Quality | High-quality software and media with technical excellence | **Mandatory** |
| Font Quality | Fonts with appropriate sizes, colors, and formatting to facilitate reading | **Mandatory** |
| Reduced Eye Strain | Designs must reduce visual strain and fatigue | **Mandatory** |
| Consistent Design | Unified and consistent design structure for all courses in a program | **Mandatory** |
| Page Design | Uniform unit structure and page design to prevent learner distraction | **Mandatory** |
| Cognitive Load | Avoid designs that cause cognitive strain | **Mandatory** |

**SCORM Implementation Guidance:**
- Images: PNG for graphics/screenshots, WebP/JPEG for photographs
- Minimum image resolution: 72 DPI for screen, high-res assets at 2x for retina displays
- Font sizes: Minimum 16px for body text, 14px minimum for any readable text
- Color contrast: Minimum 4.5:1 ratio for normal text (WCAG AA)
- Consistent CSS design system across all SCOs
- Shared stylesheet in `/shared/styles.css`

### 2.4 Platform & Infrastructure Standards

| Standard | Requirement | Priority |
|----------|-------------|----------|
| HTTPS Protocol | Secure websites must use HTTPS encryption | **Mandatory** |
| Cross-Device Access | Content accessible on personal computers, tablets, and phones | **Mandatory** |
| Search Functionality | LMS must provide search functionality | **Mandatory** |
| Equitable Access | Tools ensure equity of materials access across all systems | **Mandatory** |
| Single Sign-On | SSO functionality required for authentication | **Mandatory** |
| Identity Verification | Identity verification for online system users | **Mandatory** |
| System Interoperability | Technical infrastructure must support system interoperability | **Mandatory** |
| FutureX Integration | Technical integration with National eLearning Platform (FutureX) | **Mandatory** (for Saudi entities) |

**SCORM Implementation Guidance:**
- Use responsive design (CSS media queries) for mobile/tablet/desktop
- Ensure all content works without server dependencies (self-contained SCOs)
- SCORM API handles LMS communication; content must be portable
- Test on Chrome, Firefox, Safari, Edge
- All resources loaded over HTTPS when hosted on LMS

---

## 3. Content Quality Standards

### 3.1 Content Integrity & Accuracy

| Standard | Requirement | Priority |
|----------|-------------|----------|
| Content Accuracy | Verified measures to ensure quality, integrity, and validity of instructional resources | **Mandatory** |
| Content Currency | All online content must be up-to-date | **Mandatory** |
| National Law Compliance | Content must comply with national law and program learning objectives | **Mandatory** |
| Intellectual Property | Content must be reviewed to ensure freedom from IP violations | **Mandatory** |
| Academic Integrity | Policy for academic integrity including concept, violations, and procedures | **Mandatory** |
| Content Chunking | Content divided into small chunks to reduce cognitive load | **Mandatory** |
| Reusability | Content must be reusable to achieve educational objectives | **Recommended** |

### 3.2 Cultural & Social Alignment

| Standard | Requirement | Priority |
|----------|-------------|----------|
| Religious Alignment | Content must align with Islamic religious values | **Mandatory** |
| Cultural Appropriateness | Content must align with Saudi cultural values | **Mandatory** |
| Political Alignment | Content must align with KSA political framework | **Mandatory** |
| Social Values | Content must align with social values of the Kingdom | **Mandatory** |

**SCORM Implementation Guidance:**
- Review all generated content, images, and examples for cultural sensitivity
- Ensure no content conflicts with Islamic principles
- Use culturally appropriate imagery (dress, social norms, etc.)
- Date formats should follow Hijri calendar alongside Gregorian
- Currency references should use SAR (Saudi Riyal) where applicable
- Include metadata with content creation/update dates in each SCO
- Add version tracking in `data.json` files

### 3.3 AI & Data Standards

| Standard | Requirement | Priority |
|----------|-------------|----------|
| AI Ethics | Adherence to AI principles, policies, and ethics issued by regulatory authorities | **Mandatory** |
| AI Disclosure | All staff must be informed about AI policies | **Mandatory** |
| Data Privacy | Clear policies for collecting, storing, processing, disposing of, and destroying data | **Mandatory** |
| Data Protection | Ensure data privacy, protection, and controlled access | **Mandatory** |

**SCORM Implementation Guidance:**
- If using AI-generated content, include appropriate attribution
- SCORM `cmi.suspend_data` should not store personally identifiable information
- Use `cmi.interactions` for quiz data tracking (anonymized within SCORM spec)
- Document AI usage in course metadata

---

## 4. Instructional Design Standards

### 4.1 Learning Objectives

| Standard | Requirement | Priority |
|----------|-------------|----------|
| Clear Objectives | Clear learning objectives must be defined for all digital content | **Mandatory** |
| Objective Alignment | Content, activities, and assessments must align with stated objectives | **Mandatory** |
| Bloom's Taxonomy | Objectives should follow measurable verb frameworks (Bloom's) | **Recommended** |
| Module Structure | Each course module structured into meaningful, grade-level/age-appropriate chunks | **Mandatory** |
| Student Potential | Content offers differentiated tasks to maximize each student's potential | **Mandatory** |

### 4.2 Content Structure & Design

| Standard | Requirement | Priority |
|----------|-------------|----------|
| Standardized Structure | Follow standardized, consistent design and structure for all units and pages | **Mandatory** |
| Universal Design for Learning | Adherence to UDL (Universal Design for Learning) principles | **Mandatory** |
| Student-Centered | Student-centered instruction considered during course development | **Mandatory** |
| Content Chunking | Break content into small chunks to reduce cognitive load and facilitate learning | **Mandatory** |
| Learner Engagement | Content designed to facilitate learning and enhance learner engagement | **Mandatory** |
| Grading Criteria | Clear grading criteria (rubrics) aligned with all course elements | **Mandatory** |

### 4.3 Assessment Design

| Standard | Requirement | Priority |
|----------|-------------|----------|
| Blended Assessments | Appropriate mix of blended learning assessments | **Mandatory** |
| Outcome Measurement | Assessments measure student success relative to course outcomes | **Mandatory** |
| Aligned Elements | All course elements aligned: goal, content, activities, assessments | **Mandatory** |
| Summative + Formative | Both formative and summative assessments included | **Mandatory** |

**SCORM Implementation Guidance:**
- Display learning objectives at the start of each SCO (`sco_*/index.html`)
- Include objectives in `data.json` for each SCO
- Structure content in 15-20 minute modules maximum
- Implement progress tracking via SCORM `cmi.core.lesson_location`
- Use `cmi.objectives` for objective-level tracking
- Assessment SCOs should use `cmi.interactions` for item-level reporting
- Include rubric/criteria display before assessments

---

## 5. Accessibility Standards

### 5.1 WCAG & Universal Design

| Standard | Requirement | Priority |
|----------|-------------|----------|
| WCAG Compliance | Adherence to Web Content Accessibility Guidelines (WCAG) | **Mandatory** |
| Universal Design | All materials conform to universal design principles | **Mandatory** |
| Equal Access | All students must have access to the same information and interactions | **Mandatory** |
| Usability Testing | Usability tests must be conducted based on WCAG recommendations | **Mandatory** |
| Copyright Compliance | Content adheres to copyright law and fair use guidelines | **Mandatory** |

### 5.2 Disability Access

| Standard | Requirement | Priority |
|----------|-------------|----------|
| Disability Accommodations | Materials easily accessed by students with disabilities | **Mandatory** |
| Alternative Strategies | Alternative instructional strategies and/or accommodations provided | **Mandatory** |
| Comprehensive Design | Comprehensive design for learners with disabilities | **Mandatory** |
| Assistive Technology | Support for screen readers, color contrast, text magnification | **Mandatory** |
| Specialized Tools | Specialized programs, applications, or tools to facilitate access | **Recommended** |

**SCORM Implementation Guidance:**
- WCAG 2.1 AA compliance minimum for all HTML content
- Semantic HTML5 (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`)
- ARIA labels on all interactive elements
- Alt text for all images (`alt` attributes)
- Keyboard navigation support (tab order, focus indicators)
- Color contrast: 4.5:1 minimum for normal text, 3:1 for large text
- Text resizable to 200% without loss of content
- Captions/transcripts for all audio/video content
- Skip navigation links
- Focus management for dynamic content
- No content dependent solely on color, shape, or position
- Form labels and error identification
- Screen reader testing with NVDA/VoiceOver

---

## 6. Interactivity Standards

### 6.1 Activity Requirements

| Standard | Requirement | Priority |
|----------|-------------|----------|
| Diverse Activities | Minimum 2 types of learning activities per course | **Mandatory** |
| Activity Types | Include: discussions, collaborative assignments, educational games, simulations, case studies, etc. | **Mandatory** |
| Learner Engagement | Activities must enhance learner interaction with content, instructor, and peers | **Mandatory** |
| Higher-Order Thinking | Promote student interaction that fosters analysis, synthesis, and/or evaluation | **Mandatory** |
| Safe Environment | Maintain a safe and positive learning environment encouraging participation | **Mandatory** |
| Student Collaboration | Promote student-student interaction in online groups | **Recommended** |

### 6.2 Interaction Types Required

NELC mandates at least 2 of the following interaction types:
1. **Discussions** - Learner-to-learner and learner-to-instructor dialogue
2. **Collaborative Assignments** - Group-based activities
3. **Educational Games** - Gamified learning experiences
4. **Simulations** - Interactive scenario-based learning
5. **Case Studies** - Real-world problem analysis
6. **Drag-and-Drop** - Interactive sorting/matching activities
7. **Knowledge Checks** - In-content formative assessments

**SCORM Implementation Guidance:**
- Include interactive elements in every lesson SCO (not just quizzes)
- Implement at least 2 different interaction types per module:
  - Click-to-reveal / accordion panels
  - Drag-and-drop matching exercises
  - Interactive scenarios with branching
  - Knowledge check questions (not graded)
  - Hotspot image interactions
  - Flip cards for vocabulary/definitions
  - Timeline/process interactions
- Track interaction completion via `cmi.interactions`
- Use `cmi.suspend_data` to save interaction state for resume
- Report interaction results to LMS for analytics

---

## 7. SCORM/xAPI Compliance

### 7.1 Standards Referenced by NELC

NELC requires alignment with **international instructional design standards** and **established eLearning standards**. While NELC does not prescribe a specific SCORM version, the following are the recommended technical standards:

| Standard | Requirement | Priority |
|----------|-------------|----------|
| International Standards | Align with international instructional design standards | **Mandatory** |
| Best Practices | Deploy established eLearning standards and best practices | **Mandatory** |
| Interoperability | System interoperability for technical infrastructure | **Mandatory** |
| FutureX Integration | Integration with National eLearning Platform | **Mandatory** (Saudi entities) |
| Data Tracking | Track learner progress and completion | **Mandatory** |
| Content Portability | Content must be packaged for LMS deployment | **Mandatory** |

### 7.2 Recommended SCORM Implementation

Based on NELC's interoperability requirements and Saudi LMS landscape:

**SCORM 1.2** (Maximum Compatibility):
- `LMSInitialize()` / `LMSFinish()`
- `LMSGetValue()` / `LMSSetValue()` / `LMSCommit()`
- `cmi.core.lesson_status` (passed/completed/failed/incomplete/browsed/not attempted)
- `cmi.core.score.raw` / `cmi.core.score.min` / `cmi.core.score.max`
- `cmi.suspend_data` (bookmarking, max 4096 chars)
- `cmi.core.lesson_location` (bookmark position)
- `cmi.interactions` (quiz response tracking)

**SCORM 2004 3rd/4th Edition** (Advanced Sequencing):
- `Initialize()` / `Terminate()`
- `GetValue()` / `SetValue()` / `Commit()`
- `cmi.completion_status` + `cmi.success_status`
- `cmi.score.scaled` (0.0 to 1.0)
- `cmi.suspend_data` (max 64000 chars)
- `cmi.location` (bookmark)
- `cmi.objectives` (per-objective tracking)
- `cmi.interactions` (detailed response tracking)
- Sequencing and navigation for guided learning paths

### 7.3 Required Data Tracking

| Data Point | SCORM 1.2 | SCORM 2004 | Purpose |
|------------|-----------|------------|---------|
| Lesson Status | `cmi.core.lesson_status` | `cmi.completion_status` | Completion tracking |
| Score | `cmi.core.score.raw` | `cmi.score.scaled` | Assessment results |
| Bookmarking | `cmi.suspend_data` | `cmi.suspend_data` | Resume capability |
| Time Spent | `cmi.core.session_time` | `cmi.session_time` | Engagement analytics |
| Interactions | `cmi.interactions.n.*` | `cmi.interactions.n.*` | Quiz item tracking |
| Objectives | N/A | `cmi.objectives.n.*` | Per-objective mastery |

---

## 8. Arabic-Specific Requirements

### 8.1 Language & Text Direction

| Standard | Requirement | Priority |
|----------|-------------|----------|
| Arabic Support | First-class Arabic language support | **Mandatory** |
| RTL Layout | Right-to-left text direction for Arabic content | **Mandatory** |
| Bilingual Support | Arabic/English parallel content where applicable | **Recommended** |
| Cultural Context | MENA region considerations in content design | **Mandatory** |

### 8.2 Typography & Fonts

| Standard | Requirement | Priority |
|----------|-------------|----------|
| Arabic Fonts | High-quality Arabic fonts that facilitate reading | **Mandatory** |
| Font Sizes | Appropriate sizes for Arabic text (typically larger than Latin) | **Mandatory** |
| Font Colors | Colors and formatting that reduce eye strain | **Mandatory** |
| Readability | Design choices specifically optimized for Arabic readability | **Mandatory** |

**SCORM Implementation Guidance:**

**RTL Layout:**
```css
/* Base RTL support */
html[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

/* Bidirectional text handling */
.bidi-text {
  unicode-bidi: embed;
}
```

**Recommended Arabic Fonts:**
- **Noto Kufi Arabic** - Modern, clean, excellent for headings
- **Cairo** - Versatile, good for body text and UI
- **Tajawal** - Clean and readable, works well at small sizes
- **IBM Plex Arabic** - Professional, pairs well with IBM Plex Sans
- **Almarai** - Google Font, excellent screen readability

**Font Size Guidelines for Arabic:**
- Body text: Minimum 18px (Arabic text requires slightly larger size than Latin)
- Headings: 24px-36px
- Captions/small text: Minimum 14px
- Line height: 1.6-1.8 for Arabic text (more generous than Latin)

**Number Formatting:**
- Support both Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) and Western Arabic numerals (0123456789)
- Use locale-aware number formatting
- Calendar: Support both Hijri and Gregorian dates

**CSS Implementation:**
```css
/* Arabic font stack */
body[lang="ar"] {
  font-family: 'Cairo', 'Noto Kufi Arabic', 'Tajawal', sans-serif;
  font-size: 18px;
  line-height: 1.7;
  direction: rtl;
  text-align: right;
}

/* English fallback within Arabic content */
.en-text {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  direction: ltr;
  unicode-bidi: embed;
}
```

---

## 9. Assessment Standards

### 9.1 Assessment Requirements

| Standard | Requirement | Priority |
|----------|-------------|----------|
| Mixed Assessment Types | Include appropriate mix of blended learning assessments | **Mandatory** |
| Outcome Alignment | Assessments must measure success relative to course outcomes | **Mandatory** |
| Clear Rubrics | Clear grading criteria (rubrics) for all assessments | **Mandatory** |
| Element Alignment | Goals, content, activities, and assessments must be aligned | **Mandatory** |
| Formative Assessments | Include knowledge checks during content delivery | **Mandatory** |
| Summative Assessments | Include module-end and course-end evaluations | **Mandatory** |
| Academic Integrity | Policy addressing integrity, violations, and procedures | **Mandatory** |
| Identity Verification | Measures to prevent identity fraud in assessments | **Mandatory** |

### 9.2 Assessment Types Recommended

1. **Knowledge Checks** - Quick formative assessments after each lesson
2. **Module Quizzes** - Summative assessment at module completion
3. **Case Studies** - Applied analysis for higher-order thinking
4. **Practical Exercises** - Hands-on application of skills
5. **Capstone Projects** - Comprehensive transformation assessment
6. **Self-Assessment** - Reflective learning activities
7. **Peer Assessment** - Collaborative evaluation (where applicable)

### 9.3 Scoring & Reporting

| Standard | Requirement | Priority |
|----------|-------------|----------|
| Pass/Fail Criteria | Define clear passing scores | **Mandatory** |
| Remediation Paths | Provide paths for learners who don't pass | **Recommended** |
| Feedback | Provide meaningful feedback on assessment responses | **Mandatory** |
| Item Analysis | Track individual question responses for analytics | **Recommended** |

**SCORM Implementation Guidance:**
- Implement formative knowledge checks (2-3 questions) after each lesson SCO
- Module quiz SCOs with 5-10 questions covering module objectives
- Use `cmi.interactions` to report each question:
  - `cmi.interactions.n.id` - Question identifier
  - `cmi.interactions.n.type` - choice/true-false/fill-in/matching/sequencing
  - `cmi.interactions.n.correct_responses` - Correct answer
  - `cmi.interactions.n.student_response` - Student's answer
  - `cmi.interactions.n.result` - correct/wrong
  - `cmi.interactions.n.weighting` - Point value
  - `cmi.interactions.n.latency` - Time taken
- Report scores via `cmi.core.score.raw` (SCORM 1.2) or `cmi.score.scaled` (SCORM 2004)
- Include remediation: redirect to content SCO if quiz score < passing threshold
- Show correct answers with explanations after submission

---

## 10. Certification & Licensing

### 10.1 NELC Licensing Requirements

| Requirement | Description | Priority |
|-------------|-------------|----------|
| Program License | All e-learning programs in Saudi Arabia require NELC license | **Mandatory** |
| Provider Accreditation | Technical/digital solution providers must be accredited by NELC | **Mandatory** |
| FutureX Platform | Programs must be registered on the National eLearning Platform | **Mandatory** |
| Standards Compliance | Programs must fulfill NELC standards and requirements | **Mandatory** |
| Periodic Evaluation | Providers evaluated periodically according to NELC standards | **Mandatory** |
| Processing Time | License requests processed within 5 working days | **Information** |

### 10.2 Content Provider Qualification

Through the FutureX platform, content developers must:
1. Meet NELC-approved instructional design standards
2. Align with international instructional design standards
3. Demonstrate technical capability for digital content production
4. Be registered as qualified producers by NELC

### 10.3 Quality Assurance Professional Certification

NELC offers professional certificates in e-Learning Quality Assurance:
- **Foundation Level (eLQA-F)** - Basic quality assurance competencies
- **Advanced Level (eLQA-A)** - Advanced quality assurance expertise

These cover 6 domains, 19 competencies, and 59 indicators.

---

## 11. Implementation Guidance for SCORM Packages

### 11.1 NELC-Compliant SCORM Package Checklist

#### Technical Quality
- [ ] Video format: MP4/H.264, max 10 minutes per clip
- [ ] Audio: Clear, noise-free, consistent levels across all SCOs
- [ ] Images: High quality, appropriate resolution for screen display
- [ ] Fonts: Readable sizes (min 16px body, min 18px Arabic)
- [ ] Color contrast: WCAG AA minimum (4.5:1 ratio)
- [ ] Responsive design: Works on desktop, tablet, mobile
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge
- [ ] HTTPS-ready: No mixed content issues
- [ ] Self-contained: No external server dependencies

#### Content Quality
- [ ] Content reviewed for accuracy and currency
- [ ] Intellectual property compliance verified
- [ ] Cultural alignment with Saudi/Islamic values
- [ ] Content chunked into small, manageable segments
- [ ] Consistent design across all course SCOs
- [ ] AI usage disclosed if applicable
- [ ] Data handling compliant with privacy policies

#### Instructional Design
- [ ] Clear learning objectives at start of each SCO
- [ ] Bloom's taxonomy verbs for measurable outcomes
- [ ] Content aligned with objectives
- [ ] Activities aligned with objectives
- [ ] Assessments aligned with objectives
- [ ] Universal Design for Learning (UDL) principles applied
- [ ] Student-centered design approach

#### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Semantic HTML5 structure
- [ ] ARIA labels on interactive elements
- [ ] Alt text on all images
- [ ] Keyboard navigation fully functional
- [ ] Screen reader compatible
- [ ] Captions/transcripts for audio/video
- [ ] Focus management for dynamic content
- [ ] Skip navigation links

#### Interactivity
- [ ] Minimum 2 different interaction types per module
- [ ] Knowledge checks within content (not just end quizzes)
- [ ] Interactive elements foster higher-order thinking
- [ ] Activities appropriate for target audience
- [ ] Interaction state saved in `cmi.suspend_data`

#### Arabic/RTL Support
- [ ] RTL layout for Arabic content (`dir="rtl"`)
- [ ] Arabic-optimized font stack loaded
- [ ] Font sizes appropriate for Arabic (18px+ body)
- [ ] Line height adequate for Arabic (1.6-1.8)
- [ ] Bidirectional text support where mixed
- [ ] Hijri/Gregorian calendar options
- [ ] Arabic-Indic numeral support

#### SCORM Compliance
- [ ] Valid `imsmanifest.xml` with proper namespaces
- [ ] SCORM API wrapper functional (Initialize, GetValue, SetValue, Commit, Terminate)
- [ ] Lesson status reported (completion tracking)
- [ ] Score reported for assessment SCOs
- [ ] Bookmark/resume via `suspend_data`
- [ ] Session time tracked
- [ ] Individual interactions reported for quizzes
- [ ] Tested on ADL SCORM Test Suite or SCORM Cloud

#### Assessment
- [ ] Formative knowledge checks after each lesson
- [ ] Summative module quizzes
- [ ] Clear passing criteria defined
- [ ] Meaningful feedback on responses
- [ ] Remediation paths for failed assessments
- [ ] Academic integrity measures
- [ ] Rubrics/criteria shown before assessments

### 11.2 Recommended File Structure for NELC Compliance

```
output/
└── [course-name]/
    ├── imsmanifest.xml              # SCORM manifest (valid XML, proper namespaces)
    ├── metadata.json                # Course metadata including NELC compliance info
    ├── shared/
    │   ├── scorm-api.js             # SCORM API wrapper (1.2 + 2004 support)
    │   ├── styles.css               # Global styles (WCAG AA, RTL support)
    │   ├── rtl.css                  # Arabic RTL-specific overrides
    │   ├── accessibility.css        # Accessibility enhancements
    │   ├── interactions.js          # Shared interaction components
    │   ├── assessment-engine.js     # Quiz/assessment framework
    │   └── assets/
    │       ├── fonts/               # Arabic + Latin font files
    │       ├── images/              # Optimized images with alt text data
    │       └── videos/              # MP4/H.264, max 10 min each
    ├── sco_01_introduction/
    │   ├── index.html               # Semantic HTML5, ARIA, skip-nav
    │   ├── content.js               # Lesson logic + interaction tracking
    │   └── data.json                # Objectives, content, metadata
    ├── sco_02_lesson_1/
    │   ├── index.html
    │   ├── content.js
    │   ├── interactions.json        # Interactive element definitions
    │   └── data.json
    ├── sco_03_knowledge_check_1/    # Formative assessment
    │   ├── index.html
    │   ├── quiz.js
    │   └── data.json
    ├── sco_04_lesson_2/
    ├── sco_05_module_quiz/          # Summative assessment
    │   ├── index.html
    │   ├── quiz.js
    │   └── data.json
    └── [course-name].zip            # Final SCORM package
```

---

## 12. Research Limitations

### What NELC Publishes Publicly vs. What Requires Direct Access

1. **Publicly Available:**
   - Excellence standards framework (5 domains)
   - Implementing rules (general articles)
   - Licensing requirements
   - Quality assurance certification details
   - General content quality principles

2. **Not Publicly Detailed (Requires NELC Partnership/FutureX Access):**
   - Exact video resolution specifications (e.g., minimum 1080p vs 720p)
   - Exact audio bitrate requirements
   - Specific file size limits
   - Detailed SCORM manifest requirements
   - Specific xAPI statement specifications
   - Detailed rubric for content evaluation scoring
   - FutureX platform technical integration specifications

3. **Recommendations Based on Industry Standards:**
   Where NELC references "international standards" without specific numbers, this document uses widely-accepted industry benchmarks (SCORM best practices, WCAG 2.1 AA, QM standards) as implementation guidance.

### Sources Consulted

- [NELC Official Website](https://nelc.gov.sa/en) - Primary source
- [NELC E-Learning Standards Database](https://nelc.gov.sa/en/resources/standards-e-learning) - Standards listing
- [NELC Excellence Standards](https://nelc.gov.sa/en/regulations-and-standards/elearning-excellence-standards) - Quality framework
- [NELC Implementing Rules 2025](https://nelc.gov.sa/en/regulations-and-standards/elearning-executive-rules) - Regulations
- [NELC E-Learning Regulation](https://nelc.gov.sa/en/regulations-and-standards/elearning-regulation) - Legal framework
- [NELC Content Development (FutureX)](https://nelc.gov.sa/en/services/futurex/25) - Content standards
- [NELC Provider Accreditation](https://nelc.gov.sa/en/node/2967) - Provider requirements
- [NELC Digital Content Standards PDF (2025)](https://nelc.gov.sa/sites/default/files/2025-01/Standards%20for%20developing%20digital%20educational%20content.pdf) - Technical reference (access limited)
- [Saudipedia - NELC](https://saudipedia.com/en/article/1655/government-and-politics/education-and-training/national-elearning-center-nelc) - Overview
- [FutureX Platform](https://futurex.sa/en/services) - National platform details

---

## Summary of Key NELC Requirements for SCORM Content Studio

### Mandatory Requirements (Must Have)

1. **Video max 10 minutes** per clip with summary at end
2. **Audio free from noise**, consistent levels
3. **WCAG 2.1 AA** accessibility compliance
4. **Arabic RTL support** with appropriate fonts (18px+ body)
5. **Minimum 2 interaction types** per module
6. **Clear learning objectives** at start of each unit
7. **Aligned assessments** measuring stated outcomes
8. **Cultural alignment** with Saudi/Islamic values
9. **Content chunking** to reduce cognitive load
10. **Consistent design** across all course units
11. **Cross-device responsive** design (desktop, tablet, mobile)
12. **IP compliance** - all content free from violations
13. **Academic integrity** measures in assessments
14. **Data privacy** compliance in tracking
15. **HTTPS-ready** content

### Recommended Requirements (Should Have)

1. **Bilingual Arabic/English** content support
2. **Hijri calendar** alongside Gregorian
3. **Multiple assessment types** (formative + summative)
4. **Remediation paths** for failed learners
5. **Reusable content** architecture
6. **Student-to-student** collaboration features
7. **AI usage disclosure** where applicable
8. **xAPI support** alongside SCORM for richer analytics
