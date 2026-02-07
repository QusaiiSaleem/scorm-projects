# Quality Matters (QM) E-Learning Quality Standards Research

> **Research Date**: 2026-02-06
> **Source**: Quality Matters (qualitymatters.org) — Seventh Edition Higher Education Rubric
> **Purpose**: Extract actionable quality standards for SCORM content generation
> **Scope**: All 8 General Standards and 44 Specific Review Standards

---

## Table of Contents

1. [Overview](#overview)
2. [Standard 1: Course Overview and Introduction](#standard-1-course-overview-and-introduction)
3. [Standard 2: Learning Objectives (Competencies)](#standard-2-learning-objectives-competencies)
4. [Standard 3: Assessment and Measurement](#standard-3-assessment-and-measurement)
5. [Standard 4: Instructional Materials](#standard-4-instructional-materials)
6. [Standard 5: Learning Activities and Learner Interaction](#standard-5-learning-activities-and-learner-interaction)
7. [Standard 6: Course Technology](#standard-6-course-technology)
8. [Standard 7: Learner Support](#standard-7-learner-support)
9. [Standard 8: Accessibility and Usability](#standard-8-accessibility-and-usability)
10. [Alignment Framework](#alignment-framework)
11. [SCORM-Specific Implementation Guide](#scorm-specific-implementation-guide)
12. [Quality Checklist for SCORM Packages](#quality-checklist-for-scorm-packages)

---

## Overview

### What is Quality Matters?

Quality Matters (QM) is a nationally recognized, research-based quality assurance program for online and blended learning. The QM Higher Education Rubric (Seventh Edition) provides **8 General Standards** and **44 Specific Review Standards** used to evaluate course design quality.

### Scoring System

| Point Value | Designation | Requirement |
|-------------|-------------|-------------|
| 3 points | **Essential** | MUST be met for QM certification |
| 2 points | **Very Important** | Strongly recommended |
| 1 point | **Important** | Recommended |

- **Maximum score**: 101 points
- **Certification threshold**: 85% (approximately 86/101 points)
- **All Essential (3-point) standards must be met** regardless of total score

### The Alignment Principle

The central concept of QM is **Alignment** — critical course components must work together:

```
Learning Objectives (2.1, 2.2)
        ↕
Assessment & Measurement (3.1)
        ↕
Instructional Materials (4.1)
        ↕
Learning Activities & Interaction (5.1)
        ↕
Course Technology (6.1)
```

All five alignment standards (marked with ★ below) are Essential (3 points each).

---

## Standard 1: Course Overview and Introduction

> **General Standard**: "The overall design of the course is made clear to the learner at the beginning of the course."

The course overview and introduction set the tone, let learners know what to expect, and provide guidance to help them succeed from the start.

### Specific Review Standards

| # | Standard Text | Points | Priority |
|---|--------------|--------|----------|
| **1.1** | Instructions make clear how to get started and where to find various course components | 3 | Essential |
| **1.2** | Learners are introduced to the purpose and structure of the course | 3 | Essential |
| **1.3** | Communication guidelines for the course are clearly stated | 2 | Very Important |
| **1.4** | Course and institutional policies with which the learner is expected to comply are clearly stated, or a link to current policies is provided | 2 | Very Important |
| **1.5** | Minimum technology requirements for the course are clearly stated, and information on how to obtain the technologies is provided | 2 | Very Important |
| **1.6** | Technical skills and digital information literacy skills expected of the learner are clearly stated | 1 | Important |
| **1.7** | Required prior knowledge in the discipline and/or any required competencies are clearly stated | 1 | Important |
| **1.8** | The self-introduction by the instructor is welcoming and is available in the course site | 1 | Important |
| **1.9** | Learners have the opportunity to introduce themselves | 1 | Important |

### Why This Matters for Learner Outcomes

- Reduces anxiety and confusion when starting a new course
- Sets clear expectations so learners can plan their time
- Establishes a welcoming, inclusive learning environment
- Prevents technical barriers from blocking learning progress

### SCORM Implementation

**For SRS 1.1 (Getting Started)**:
```html
<!-- Welcome/Start page as first SCO -->
<div class="course-start">
  <h1>Welcome to [Course Name]</h1>
  <div class="getting-started">
    <h2>How to Navigate This Course</h2>
    <ol>
      <li>Complete each lesson in order using the navigation arrows</li>
      <li>Each module ends with a knowledge check</li>
      <li>Your progress is saved automatically</li>
      <li>You can resume from where you left off</li>
    </ol>
  </div>
  <div class="course-map">
    <!-- Visual course map showing all modules -->
    <h2>Course Map</h2>
    <!-- Interactive or static visual showing module progression -->
  </div>
</div>
```

**For SRS 1.2 (Purpose & Structure)**:
```html
<div class="course-overview">
  <h2>Course Purpose</h2>
  <p>By the end of this course, you will be able to [transformation statement]</p>

  <h2>Course Structure</h2>
  <div class="module-overview">
    <div class="module-card">
      <h3>Module 1: [Title]</h3>
      <p>Duration: ~20 minutes</p>
      <p>Topics: [list of lesson topics]</p>
    </div>
    <!-- Repeat for each module -->
  </div>

  <h2>Estimated Completion Time</h2>
  <p>Total: [X] hours across [Y] modules</p>
</div>
```

**For SRS 1.5 (Technology Requirements)**:
```html
<div class="tech-requirements">
  <h2>Technical Requirements</h2>
  <ul>
    <li>Modern web browser (Chrome, Firefox, Safari, or Edge)</li>
    <li>JavaScript must be enabled</li>
    <li>Audio capability for multimedia content</li>
    <li>Minimum screen resolution: 1024x768</li>
  </ul>
</div>
```

### Concrete Example

A SCORM course on "Workplace Safety" would include:
- **SCO_01_welcome**: Welcome page with instructor video, course map showing 4 modules, estimated 2-hour completion time, navigation tutorial
- Clear statement: "This course covers OSHA workplace safety requirements. By the end, you will be able to identify 10 common workplace hazards and implement corrective actions."
- Prerequisites listed: "No prior safety training required. Basic computer skills needed."

---

## Standard 2: Learning Objectives (Competencies)

> **General Standard**: "Learning objectives or competencies describe what learners will be able to do upon successfully completing the course."

### Specific Review Standards

| # | Standard Text | Points | Priority |
|---|--------------|--------|----------|
| **2.1** ★ | The course learning objectives describe outcomes that are measurable | 3 | Essential (Alignment) |
| **2.2** ★ | The module/unit-level learning objectives describe outcomes that are measurable and consistent with course-level objectives | 3 | Essential (Alignment) |
| **2.3** | Learning objectives are stated clearly, are written from the learner's perspective, and are prominently located in the course | 3 | Essential |
| **2.4** | The relationship between learning objectives, learning activities, and assessments is made clear | 3 | Essential |
| **2.5** | The learning objectives are suited to the level of the course | 2 | Very Important |

### Why This Matters for Learner Outcomes

- Measurable objectives help learners understand exactly what they need to achieve
- Module-level objectives break the learning journey into achievable milestones
- Clear objectives allow learners to self-assess their progress
- Proper alignment ensures every activity contributes to the learning goal

### SCORM Implementation

**For SRS 2.1 & 2.2 (Measurable Objectives)**:
```html
<!-- Course-level objectives on welcome/overview SCO -->
<div class="course-objectives">
  <h2>Course Learning Objectives</h2>
  <p>By the end of this course, you will be able to:</p>
  <ol>
    <li><strong>Identify</strong> the five key principles of [topic]</li>
    <li><strong>Apply</strong> [skill] to real-world scenarios</li>
    <li><strong>Evaluate</strong> [concept] using established criteria</li>
  </ol>
</div>

<!-- Module-level objectives at start of each module SCO -->
<div class="module-objectives">
  <h2>Module 2 Learning Objectives</h2>
  <p>By the end of this module, you will be able to:</p>
  <ol>
    <li><strong>Define</strong> [specific term] in your own words</li>
    <li><strong>Demonstrate</strong> how to [specific skill]</li>
  </ol>
  <div class="objective-alignment">
    <p><em>These objectives support Course Objectives #1 and #2</em></p>
  </div>
</div>
```

**For SRS 2.3 (Prominent Placement)**:
```javascript
// Show objectives at the start of every lesson SCO
function displayLessonObjectives(objectives) {
  const container = document.getElementById('lesson-objectives');
  container.innerHTML = `
    <div class="objectives-banner" role="region" aria-label="Learning Objectives">
      <h2>What You'll Learn</h2>
      <ul>
        ${objectives.map(obj => `<li>${obj}</li>`).join('')}
      </ul>
    </div>
  `;
}
```

**For SRS 2.4 (Alignment Visibility)**:
```html
<!-- Alignment map visible to learners -->
<div class="alignment-map">
  <h2>How This Module Works</h2>
  <table>
    <thead>
      <tr>
        <th>Objective</th>
        <th>Activities</th>
        <th>Assessment</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Define key terms</td>
        <td>Lesson 2.1 reading + flashcard activity</td>
        <td>Quiz questions 1-5</td>
      </tr>
      <tr>
        <td>Apply the process</td>
        <td>Interactive simulation in Lesson 2.3</td>
        <td>Scenario-based quiz questions 6-10</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Bloom's Taxonomy Verb Guide for Objectives

| Level | Measurable Verbs | Use For |
|-------|-----------------|---------|
| **Remember** | List, define, identify, recall, name | Foundation/introductory lessons |
| **Understand** | Explain, describe, summarize, paraphrase | Concept explanation lessons |
| **Apply** | Use, implement, demonstrate, solve | Practice and skill-building |
| **Analyze** | Compare, contrast, differentiate, debug | Advanced/critical thinking |
| **Evaluate** | Assess, critique, justify, recommend | Case studies, decision-making |
| **Create** | Design, develop, construct, produce | Capstone projects, synthesis |

### Concrete Example

**Course**: "Introduction to Data Privacy"
- **Course Objective**: "By the end of this course, you will be able to **implement** a data privacy compliance plan for your organization."
- **Module 1 Objective**: "By the end of this module, you will be able to **identify** the three main data privacy regulations (GDPR, CCPA, HIPAA)."
- **Module 2 Objective**: "By the end of this module, you will be able to **compare** the requirements of GDPR and CCPA."
- **Module 3 Objective**: "By the end of this module, you will be able to **create** a basic data privacy assessment checklist."

---

## Standard 3: Assessment and Measurement

> **General Standard**: "Assessments are integral to the learning process and are designed to evaluate learner progress in achieving the stated learning objectives or competencies."

### Specific Review Standards

| # | Standard Text | Points | Priority |
|---|--------------|--------|----------|
| **3.1** ★ | The assessments measure the stated learning objectives or competencies | 3 | Essential (Alignment) |
| **3.2** | The course grading policy is stated clearly at the beginning of the course | 3 | Essential |
| **3.3** | Specific and descriptive criteria are provided for the evaluation of learners' work, and their connection to the course grading policy is clearly explained | 3 | Essential |
| **3.4** | The assessments used are sequenced, varied, and suited to the level of the course | 2 | Very Important |
| **3.5** | The course provides learners with multiple opportunities to track their learning progress | 2 | Very Important |
| **3.6** | The assessments provide guidance to the learner about how to uphold academic integrity | 1 | Important (New in 7th Ed.) |

### Why This Matters for Learner Outcomes

- Aligned assessments validate that real learning occurred
- Clear grading criteria reduce ambiguity and anxiety
- Multiple assessment types accommodate different learning styles
- Progress tracking builds motivation and self-regulation
- Academic integrity guidance builds trust in the assessment process

### SCORM Implementation

**For SRS 3.1 (Aligned Assessments)**:
```javascript
// Quiz question structure with objective alignment metadata
const quizData = {
  moduleId: "module_02",
  questions: [
    {
      id: "q1",
      objectiveAligned: "Identify the three main data privacy regulations",
      bloomsLevel: "remember",
      type: "multiple-choice",
      stem: "Which of the following is NOT a major data privacy regulation?",
      options: [
        { id: "a", text: "GDPR", correct: false },
        { id: "b", text: "CCPA", correct: false },
        { id: "c", text: "OSHA", correct: true },
        { id: "d", text: "HIPAA", correct: false }
      ],
      feedback: {
        correct: "Correct! OSHA is a workplace safety standard, not a data privacy regulation.",
        incorrect: "Not quite. OSHA deals with workplace safety. The three main privacy regulations are GDPR, CCPA, and HIPAA."
      }
    }
  ]
};

// Report score to SCORM LMS
function reportScore(score, maxScore) {
  // SCORM 1.2
  API.LMSSetValue("cmi.core.score.raw", score);
  API.LMSSetValue("cmi.core.score.max", maxScore);
  API.LMSSetValue("cmi.core.score.min", "0");

  // Set completion based on passing threshold
  const passingScore = 0.7; // 70%
  if (score / maxScore >= passingScore) {
    API.LMSSetValue("cmi.core.lesson_status", "passed");
  } else {
    API.LMSSetValue("cmi.core.lesson_status", "failed");
  }
  API.LMSCommit("");
}
```

**For SRS 3.2 (Grading Policy)**:
```html
<div class="grading-policy">
  <h2>How You'll Be Graded</h2>
  <table>
    <thead>
      <tr>
        <th>Assessment Type</th>
        <th>Weight</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Knowledge Checks</td>
        <td>30%</td>
        <td>Quick checks after each lesson (unlimited attempts)</td>
      </tr>
      <tr>
        <td>Module Quizzes</td>
        <td>40%</td>
        <td>End-of-module assessments (2 attempts allowed)</td>
      </tr>
      <tr>
        <td>Final Assessment</td>
        <td>30%</td>
        <td>Comprehensive final quiz (1 attempt)</td>
      </tr>
    </tbody>
  </table>
  <p><strong>Passing Score:</strong> 70% overall to receive completion certificate</p>
</div>
```

**For SRS 3.3 (Evaluation Criteria)**:
```html
<!-- Before each assessment, show clear criteria -->
<div class="assessment-criteria">
  <h3>Assessment Criteria</h3>
  <p>This quiz contains 10 questions testing your understanding of Module 2.</p>
  <ul>
    <li>Questions 1-5: Multiple choice (1 point each)</li>
    <li>Questions 6-8: True/False (1 point each)</li>
    <li>Questions 9-10: Scenario-based (2 points each)</li>
  </ul>
  <p><strong>Total: 12 points | Passing: 8 points (67%)</strong></p>
  <p><strong>Time limit:</strong> 15 minutes</p>
  <p><strong>Attempts:</strong> 2 allowed; highest score recorded</p>
</div>
```

**For SRS 3.5 (Progress Tracking)**:
```javascript
// Progress bar component
function updateProgressTracker() {
  const progress = {
    modulesCompleted: 2,
    totalModules: 5,
    lessonsCompleted: 7,
    totalLessons: 15,
    averageQuizScore: 85,
    overallCompletion: 47
  };

  document.getElementById('progress-tracker').innerHTML = `
    <div class="progress-dashboard" role="region" aria-label="Your Progress">
      <h2>Your Progress</h2>
      <div class="progress-bar">
        <div class="fill" style="width: ${progress.overallCompletion}%"
             role="progressbar"
             aria-valuenow="${progress.overallCompletion}"
             aria-valuemin="0"
             aria-valuemax="100">
          ${progress.overallCompletion}% Complete
        </div>
      </div>
      <div class="progress-details">
        <p>Modules: ${progress.modulesCompleted}/${progress.totalModules}</p>
        <p>Lessons: ${progress.lessonsCompleted}/${progress.totalLessons}</p>
        <p>Average Quiz Score: ${progress.averageQuizScore}%</p>
      </div>
    </div>
  `;
}
```

### Concrete Example

A Module 2 quiz for "Data Privacy" would:
- Open with grading criteria (points, passing score, attempts)
- Include 5 multiple-choice questions aligned to "Identify regulations" objective
- Include 3 scenario-based questions aligned to "Compare requirements" objective
- Provide immediate feedback with explanations for each answer
- Show a results summary with score and objective-level performance
- Report results to SCORM LMS via `cmi.core.score.raw` and `cmi.interactions`

---

## Standard 4: Instructional Materials

> **General Standard**: "Instructional materials enable learners to achieve stated learning objectives or competencies."

### Specific Review Standards

| # | Standard Text | Points | Priority |
|---|--------------|--------|----------|
| **4.1** ★ | The instructional materials contribute to the achievement of the stated learning objectives or competencies | 3 | Essential (Alignment) |
| **4.2** | The relationship between the use of instructional materials and the learning activities is clearly explained | 3 | Essential |
| **4.3** | The course models academic integrity by providing both source references and permissions for use of instructional materials | 2 | Very Important |
| **4.4** | The instructional materials represent up-to-date theory and practice in the discipline | 2 | Very Important |
| **4.5** | A variety of instructional materials is used in the course | 2 | Very Important |

### Why This Matters for Learner Outcomes

- Materials directly aligned to objectives ensure focused, efficient learning
- Variety accommodates different learning preferences and styles
- Current materials ensure learners get relevant, applicable knowledge
- Proper citations model good academic practice

### SCORM Implementation

**For SRS 4.1 (Aligned Materials)**:
```html
<!-- Each content section explicitly links to an objective -->
<section class="lesson-content" data-objective="identify-regulations">
  <div class="objective-link">
    <span class="badge">Objective: Identify the three main data privacy regulations</span>
  </div>
  <h2>Understanding GDPR</h2>
  <p>The General Data Protection Regulation (GDPR) is...</p>
  <!-- Content that directly supports the objective -->
</section>
```

**For SRS 4.5 (Variety of Materials)**:
```html
<!-- Mix of content types within a single lesson -->
<div class="lesson-content">
  <!-- Text content -->
  <section class="reading-section">
    <h2>Key Concepts</h2>
    <p>...</p>
  </section>

  <!-- Infographic -->
  <section class="visual-section">
    <h2>GDPR at a Glance</h2>
    <img src="assets/images/gdpr-infographic.png"
         alt="Infographic showing GDPR key requirements: data subject rights,
              lawful basis for processing, and breach notification timeline">
  </section>

  <!-- Video -->
  <section class="video-section">
    <h2>Expert Interview</h2>
    <video controls>
      <source src="assets/videos/expert-interview.mp4" type="video/mp4">
      <track kind="captions" src="assets/captions/expert-interview.vtt"
             srclang="en" label="English">
    </video>
    <a href="assets/transcripts/expert-interview.txt">Full Transcript</a>
  </section>

  <!-- Interactive element -->
  <section class="interactive-section">
    <h2>Try It: Regulation Matcher</h2>
    <div class="drag-drop-activity" role="application" aria-label="Match regulations to descriptions">
      <!-- Drag-and-drop matching activity -->
    </div>
  </section>
</div>
```

### Content Variety Checklist

For each module, include at least 3 of the following:
- [ ] Text/reading content
- [ ] Images, diagrams, or infographics
- [ ] Video or animation
- [ ] Audio narration or podcast
- [ ] Interactive activity (drag-drop, click-to-reveal, sorting)
- [ ] Real-world case study or scenario
- [ ] Downloadable reference material (job aid, checklist)

### Concrete Example

Module 2: "Comparing Privacy Regulations" includes:
1. **Text**: Written comparison of GDPR vs CCPA vs HIPAA
2. **Infographic**: Visual side-by-side comparison chart
3. **Video**: 5-minute expert explanation with captions
4. **Interactive**: Drag-and-drop activity matching requirements to regulations
5. **Case Study**: Real breach scenario with analysis questions

---

## Standard 5: Learning Activities and Learner Interaction

> **General Standard**: "Learning activities facilitate and support learner interaction and engagement."

### Specific Review Standards

| # | Standard Text | Points | Priority |
|---|--------------|--------|----------|
| **5.1** ★ | The learning activities promote the achievement of the stated learning objectives or competencies | 3 | Essential (Alignment) |
| **5.2** | Learning activities provide opportunities for interaction that support active learning | 3 | Essential |
| **5.3** | The instructor's plan for interacting with learners during the course is clearly stated | 2 | Very Important |
| **5.4** | The requirements for learner interaction are clearly stated | 2 | Very Important |

### Why This Matters for Learner Outcomes

- Active learning (doing, not just reading) dramatically improves retention
- Interaction prevents passive consumption of content
- Clear expectations help learners engage meaningfully
- Multiple interaction types support different learner preferences

### Three Types of Interaction (QM Framework)

1. **Learner-to-Content**: Interactive elements within lessons
2. **Learner-to-Instructor**: Feedback mechanisms, guided practice
3. **Learner-to-Learner**: Collaborative activities (limited in self-paced SCORM)

### SCORM Implementation

**For SRS 5.1 & 5.2 (Active Learning Activities)**:
```html
<!-- Click-to-reveal interaction -->
<div class="interaction-reveal" role="group" aria-label="Click to reveal key concepts">
  <h3>Key Privacy Principles</h3>
  <p>Click each principle to learn more:</p>

  <div class="reveal-cards">
    <button class="reveal-card"
            aria-expanded="false"
            aria-controls="principle-1-detail"
            onclick="toggleReveal(this)">
      <h4>Data Minimization</h4>
      <div id="principle-1-detail" class="card-detail" hidden>
        <p>Collect only the data you actually need for the stated purpose.</p>
        <p><strong>Example:</strong> A newsletter signup should only ask for email,
           not phone number, address, and date of birth.</p>
      </div>
    </button>
    <!-- More cards -->
  </div>
</div>

<!-- Scenario-based interaction -->
<div class="scenario" role="group" aria-label="Practice scenario">
  <h3>Scenario: The Data Breach</h3>
  <div class="scenario-setup">
    <p>Your company discovers that a database containing 10,000 customer
       records was accessed by an unauthorized party 48 hours ago.</p>
    <p><strong>Under GDPR, what is your first required action?</strong></p>
  </div>
  <div class="scenario-choices">
    <button onclick="checkAnswer('notify-authority', this)">
      Notify the supervisory authority within 72 hours
    </button>
    <button onclick="checkAnswer('notify-customers', this)">
      Email all affected customers immediately
    </button>
    <button onclick="checkAnswer('investigate', this)">
      Complete internal investigation before any notification
    </button>
    <button onclick="checkAnswer('delete-data', this)">
      Delete the compromised database
    </button>
  </div>
  <div id="scenario-feedback" class="feedback" role="alert" aria-live="polite"></div>
</div>
```

**For SRS 5.2 (Interactive Knowledge Checks)**:
```javascript
// Embedded knowledge check (not graded, for learning)
function createKnowledgeCheck(question, options, correctIndex, explanation) {
  return `
    <div class="knowledge-check" role="group" aria-label="Knowledge Check">
      <h3>Check Your Understanding</h3>
      <p class="question">${question}</p>
      <div class="options" role="radiogroup">
        ${options.map((opt, i) => `
          <label class="option">
            <input type="radio" name="kc" value="${i}"
                   onchange="checkKnowledge(${i}, ${correctIndex}, '${explanation}')">
            <span>${opt}</span>
          </label>
        `).join('')}
      </div>
      <div id="kc-feedback" class="feedback" role="alert" aria-live="polite"></div>
      <p class="note"><em>This is a practice check — it does not affect your grade.</em></p>
    </div>
  `;
}
```

### Concrete Example

A lesson on "GDPR Breach Notification" includes:
1. **Reading** the notification requirements (learner-to-content)
2. **Click-to-reveal** cards exploring each requirement detail
3. **Scenario activity** where learner makes decisions about a simulated breach
4. **Knowledge check** with immediate feedback (ungraded)
5. **Downloadable checklist** as a job aid for real-world use

---

## Standard 6: Course Technology

> **General Standard**: "Course technologies support learners' achievement of course objectives or competencies."

### Specific Review Standards

| # | Standard Text | Points | Priority |
|---|--------------|--------|----------|
| **6.1** ★ | The tools used in the course support the learning objectives or competencies | 3 | Essential (Alignment) |
| **6.2** | Course tools promote learner engagement and active learning | 2 | Very Important |
| **6.3** | A variety of technology is used in the course | 1 | Important |
| **6.4** | The course provides learners with information on protecting their data and privacy | 1 | Important |

### Why This Matters for Learner Outcomes

- Technology should enhance learning, not complicate it
- Variety in tools keeps learners engaged
- Privacy awareness is increasingly important in digital learning
- Tools must be accessible and not create barriers

### SCORM Implementation

**For SRS 6.1 (Technology Supports Objectives)**:
```html
<!-- Technology purpose statement in course overview -->
<div class="technology-overview">
  <h2>Technologies Used in This Course</h2>
  <table>
    <thead>
      <tr>
        <th>Technology</th>
        <th>Purpose</th>
        <th>How It Helps You Learn</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Interactive Simulations</td>
        <td>Practice applying concepts</td>
        <td>Supports Objective: "Apply privacy principles to real scenarios"</td>
      </tr>
      <tr>
        <td>Knowledge Check Quizzes</td>
        <td>Test your understanding</td>
        <td>Supports Objective: "Identify key regulations"</td>
      </tr>
      <tr>
        <td>Video Content</td>
        <td>Expert explanations</td>
        <td>Supports Objective: "Explain privacy concepts"</td>
      </tr>
    </tbody>
  </table>
</div>
```

**For SRS 6.4 (Privacy Information)**:
```html
<div class="privacy-notice">
  <h2>Your Data & Privacy</h2>
  <p>This course tracks the following information through your LMS:</p>
  <ul>
    <li>Lesson completion status</li>
    <li>Quiz scores</li>
    <li>Time spent on each lesson</li>
    <li>Bookmarking position (to resume where you left off)</li>
  </ul>
  <p>This data is used solely for tracking your learning progress and is managed
     by your organization's LMS administrator.</p>
  <p>No personal data is collected beyond what your LMS requires.</p>
</div>
```

### SCORM-Specific Technology Considerations

For self-contained SCORM packages:
- All assets must be bundled (no external server dependencies)
- JavaScript interactions must work offline within the LMS
- No third-party tracking scripts or cookies
- SCORM API handles all data communication with the LMS
- Test in multiple LMS environments (Moodle, Canvas, Blackboard, SCORM Cloud)

---

## Standard 7: Learner Support

> **General Standard**: "The course facilitates learner access to institutional support services essential to learner success."

### Specific Review Standards

| # | Standard Text | Points | Priority |
|---|--------------|--------|----------|
| **7.1** | The course instructions articulate or link to a clear description of the technical support offered and how to obtain it | 2 | Very Important |
| **7.2** | Course instructions articulate or link to the institution's accessibility policies and accommodation services | 2 | Very Important |
| **7.3** | Course instructions articulate or link to the institution's academic support services and resources that can help learners succeed | 1 | Important |
| **7.4** | Course instructions articulate or link to the institution's student services and resources that can help learners succeed | 1 | Important |

### Why This Matters for Learner Outcomes

- Learners need to know where to get help before they get stuck
- Accessibility support ensures equitable access
- Academic resources (tutoring, writing help) prevent frustration
- Proactive support reduces dropout rates

### SCORM Implementation

**For SRS 7.1-7.4 (Support Resources)**:
```html
<!-- Help/Support page - typically in course overview or as persistent link -->
<div class="support-resources">
  <h2>Need Help?</h2>

  <!-- Technical Support -->
  <div class="support-section">
    <h3>Technical Support</h3>
    <p>If you experience technical difficulties with this course:</p>
    <ul>
      <li>Contact your LMS administrator</li>
      <li>Try refreshing the page or clearing your browser cache</li>
      <li>Ensure JavaScript is enabled in your browser</li>
      <li>Try a different browser (Chrome, Firefox, Safari, or Edge)</li>
    </ul>
  </div>

  <!-- Accessibility -->
  <div class="support-section">
    <h3>Accessibility</h3>
    <p>This course is designed to meet WCAG 2.1 AA standards.</p>
    <p>If you need accommodations, please contact your organization's
       accessibility coordinator.</p>
    <p>All videos include captions. Transcripts are available for download.</p>
  </div>

  <!-- Content Help -->
  <div class="support-section">
    <h3>Content Questions</h3>
    <p>For questions about the course content, contact the course administrator
       at [configurable email/link].</p>
  </div>
</div>
```

**Persistent Help Button (Always Available)**:
```javascript
// Add a help button that persists across all SCOs
function addHelpButton() {
  const helpBtn = document.createElement('button');
  helpBtn.className = 'help-button';
  helpBtn.setAttribute('aria-label', 'Get Help');
  helpBtn.innerHTML = '?';
  helpBtn.onclick = function() {
    document.getElementById('help-panel').classList.toggle('open');
  };
  document.body.appendChild(helpBtn);
}
```

```css
.help-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  font-size: 1.25rem;
  font-weight: bold;
  border: none;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
```

---

## Standard 8: Accessibility and Usability

> **General Standard**: "The course design reflects a commitment to accessibility and usability for all learners."

### Specific Review Standards

| # | Standard Text | Points | Priority |
|---|--------------|--------|----------|
| **8.1** | Course navigation facilitates ease of use | 3 | Essential |
| **8.2** | The course design facilitates readability | 2 | Very Important |
| **8.3** | Text in the course is accessible | 2 | Very Important |
| **8.4** | Images in the course are accessible | 2 | Very Important |
| **8.5** | Video and audio content in the course is accessible | 2 | Very Important |
| **8.6** | Multimedia in the course is easy to use | 1 | Important |
| **8.7** | Vendor accessibility statements are provided for the technologies used in the course | 1 | Important |

### Why This Matters for Learner Outcomes

- Accessibility ensures ALL learners can engage with the course
- Good usability reduces cognitive load, helping learners focus on content
- Legal requirements (ADA, Section 508, WCAG) must be met
- Universal design benefits all learners, not just those with disabilities

### SCORM Implementation

**For SRS 8.1 (Navigation)**:
```html
<!-- Consistent, accessible navigation structure -->
<nav class="course-nav" role="navigation" aria-label="Course navigation">
  <button id="prev-btn" onclick="navigatePrev()" aria-label="Previous page">
    Previous
  </button>

  <div class="page-indicator" role="status" aria-live="polite">
    Page <span id="current-page">3</span> of <span id="total-pages">8</span>
  </div>

  <button id="next-btn" onclick="navigateNext()" aria-label="Next page">
    Next
  </button>
</nav>

<!-- Skip navigation link -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- Consistent page structure -->
<main id="main-content" role="main">
  <header class="lesson-header">
    <h1>Lesson Title</h1>
    <p class="lesson-meta">Module 2 | Lesson 3 of 5 | ~10 minutes</p>
  </header>
  <div class="lesson-body">
    <!-- Content here -->
  </div>
</main>
```

**For SRS 8.2 (Readability)**:
```css
/* Readability-focused CSS */
:root {
  /* Typography */
  --font-body: 'Segoe UI', system-ui, -apple-system, sans-serif;
  --font-heading: 'Segoe UI', system-ui, -apple-system, sans-serif;
  --font-size-base: 1rem;      /* 16px minimum */
  --font-size-lg: 1.125rem;    /* 18px for body text */
  --line-height: 1.6;          /* Optimal for readability */

  /* Colors - WCAG AA contrast ratios */
  --text-color: #1a1a1a;       /* 15.3:1 on white */
  --bg-color: #ffffff;
  --link-color: #0056b3;       /* 7.1:1 on white */
  --heading-color: #0d0d0d;
}

body {
  font-family: var(--font-body);
  font-size: var(--font-size-lg);
  line-height: var(--line-height);
  color: var(--text-color);
  background: var(--bg-color);
  max-width: 800px;             /* Optimal line length */
  margin: 0 auto;
  padding: 2rem;
}

h1, h2, h3 {
  font-family: var(--font-heading);
  color: var(--heading-color);
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

p {
  margin-bottom: 1rem;
  max-width: 70ch;              /* ~70 characters per line */
}

/* No purely decorative elements that distract from content */
```

**For SRS 8.3 (Text Accessibility)**:
```html
<!-- Proper heading hierarchy -->
<h1>Module Title</h1>
  <h2>Section Title</h2>
    <h3>Subsection Title</h3>

<!-- Accessible tables -->
<table>
  <caption>Comparison of GDPR and CCPA Requirements</caption>
  <thead>
    <tr>
      <th scope="col">Feature</th>
      <th scope="col">GDPR</th>
      <th scope="col">CCPA</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Scope</th>
      <td>EU residents' data</td>
      <td>California residents' data</td>
    </tr>
  </tbody>
</table>

<!-- Meaningful link text (not "click here") -->
<a href="assets/docs/gdpr-summary.pdf">Download the GDPR Summary Guide (PDF, 2.1 MB)</a>
```

**For SRS 8.4 (Image Accessibility)**:
```html
<!-- Descriptive alt text for informational images -->
<img src="assets/images/gdpr-timeline.png"
     alt="Timeline showing GDPR compliance milestones:
          Day 1 - Breach discovered,
          Within 72 hours - Notify supervisory authority,
          Without undue delay - Notify affected individuals if high risk">

<!-- Decorative images marked as such -->
<img src="assets/images/divider.png" alt="" role="presentation">

<!-- Complex images with long descriptions -->
<figure>
  <img src="assets/images/data-flow-diagram.png"
       alt="Data flow diagram showing how personal data moves through the organization"
       aria-describedby="data-flow-desc">
  <figcaption id="data-flow-desc">
    Personal data enters through web forms, flows to the CRM database,
    is processed by the analytics engine, and can be exported via API.
    Each stage has access controls and logging.
  </figcaption>
</figure>
```

**For SRS 8.5 (Video/Audio Accessibility)**:
```html
<!-- Accessible video with captions and transcript -->
<div class="video-container">
  <video controls preload="metadata">
    <source src="assets/videos/intro.mp4" type="video/mp4">
    <track kind="captions" src="assets/captions/intro.vtt"
           srclang="en" label="English Captions" default>
    <track kind="captions" src="assets/captions/intro-ar.vtt"
           srclang="ar" label="Arabic Captions">
    Your browser does not support the video element.
  </video>
  <div class="video-alternatives">
    <a href="assets/transcripts/intro.html">Read Full Transcript</a>
    <a href="assets/audio/intro-described.mp3">Audio Description Version</a>
  </div>
</div>
```

**For SRS 8.6 (Multimedia Usability)**:
```javascript
// Keep videos under 20 minutes or provide chapter markers
const videoChapters = [
  { time: 0, title: "Introduction" },
  { time: 120, title: "What is GDPR?" },
  { time: 360, title: "Key Requirements" },
  { time: 540, title: "Compliance Steps" },
  { time: 720, title: "Summary" }
];

// Remove autoplay — let learner control playback
// Provide playback speed control
// Ensure video player has keyboard controls
```

### WCAG 2.1 AA Quick Reference for SCORM

| Requirement | Implementation |
|------------|----------------|
| Color contrast | Text: 4.5:1 ratio minimum; Large text: 3:1 |
| Keyboard navigation | All interactive elements reachable via Tab key |
| Focus indicators | Visible focus ring on all focusable elements |
| Alt text | All informational images have descriptive alt text |
| Captions | All video content has synchronized captions |
| Headings | Proper heading hierarchy (h1 > h2 > h3, no skipping) |
| Link text | Descriptive (not "click here" or "read more") |
| Form labels | All form inputs have associated labels |
| Error messages | Clear, specific error messages with instructions |
| Resize | Content readable at 200% zoom without horizontal scroll |

---

## Alignment Framework

### What is Alignment?

Alignment is the QM principle that the five core components of a course must work together seamlessly:

```
┌──────────────────────────────────────────────────────────────┐
│                    ALIGNMENT CHAIN                            │
│                                                              │
│  Learning Objectives (SRS 2.1, 2.2)                         │
│       │                                                      │
│       ├──→ Assessments (SRS 3.1)                            │
│       │      "Do assessments measure the objectives?"        │
│       │                                                      │
│       ├──→ Instructional Materials (SRS 4.1)                │
│       │      "Do materials support achieving objectives?"    │
│       │                                                      │
│       ├──→ Learning Activities (SRS 5.1)                    │
│       │      "Do activities help learners practice?"         │
│       │                                                      │
│       └──→ Course Technology (SRS 6.1)                      │
│              "Does technology enable the learning?"          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Alignment Map Example

| Objective | Material | Activity | Assessment | Technology |
|-----------|----------|----------|------------|------------|
| Identify 3 privacy regulations | Reading: "Regulation Overview" + Infographic | Click-to-reveal cards | Quiz Q1-5 (multiple choice) | HTML interactive cards |
| Compare GDPR and CCPA | Video: Expert comparison + Comparison table | Drag-drop matching activity | Quiz Q6-8 (scenario-based) | JavaScript drag-drop |
| Create a privacy checklist | Downloadable template + Case study | Guided practice with template | Final assessment: checklist creation | Fillable HTML form |

### How to Verify Alignment in SCORM Content

Every SCO (Shareable Content Object) should have:
1. **Stated objective(s)** at the top of the page
2. **Content** that directly supports those objectives
3. **Activities** that let learners practice the objective
4. **Assessment** items that measure the objective
5. **Metadata** linking all components (in `data.json`)

```json
{
  "sco_id": "sco_04_quiz_module2",
  "type": "assessment",
  "objectives_assessed": ["obj_2_1", "obj_2_2"],
  "aligned_materials": ["sco_02_lesson_2a", "sco_03_lesson_2b"],
  "aligned_activities": ["drag-drop-matcher", "scenario-breach"],
  "passing_score": 70,
  "max_score": 100
}
```

---

## SCORM-Specific Implementation Guide

### How QM Standards Map to SCORM Components

| QM Standard | SCORM Implementation |
|-------------|---------------------|
| 1.1 Getting Started | First SCO = welcome/orientation page |
| 1.2 Purpose & Structure | Course map/overview in first SCO |
| 2.1-2.2 Objectives | Objectives displayed at start of each SCO |
| 3.1 Aligned Assessments | Quiz SCOs with `cmi.interactions` tracking |
| 3.2 Grading Policy | Clearly stated in overview SCO |
| 3.5 Progress Tracking | `cmi.completion_status` + visual progress bar |
| 4.5 Material Variety | Mix of text, images, video, interactions per SCO |
| 5.1-5.2 Active Learning | Interactive HTML/JS elements within lesson SCOs |
| 6.1 Technology Supports Learning | All tech choices justified by objectives |
| 7.1 Technical Support | Help section in overview + persistent help button |
| 8.1 Navigation | Consistent nav, skip links, keyboard support |
| 8.3-8.5 Accessible Content | Alt text, captions, proper HTML structure |

### SCORM Data Model Usage for QM Compliance

```javascript
// Track completion (Standard 3.5 - Progress Tracking)
API.LMSSetValue("cmi.core.lesson_status", "completed");

// Track scores (Standard 3.1 - Assessment)
API.LMSSetValue("cmi.core.score.raw", "85");
API.LMSSetValue("cmi.core.score.max", "100");
API.LMSSetValue("cmi.core.score.min", "0");

// Track individual quiz responses (Standard 3.3 - Evaluation Criteria)
API.LMSSetValue("cmi.interactions.0.id", "q1_identify_gdpr");
API.LMSSetValue("cmi.interactions.0.type", "choice");
API.LMSSetValue("cmi.interactions.0.student_response", "a");
API.LMSSetValue("cmi.interactions.0.correct_responses.0.pattern", "c");
API.LMSSetValue("cmi.interactions.0.result", "wrong");
API.LMSSetValue("cmi.interactions.0.objectives.0.id", "obj_identify_regulations");

// Bookmarking for resume (Standard 8.1 - Navigation)
API.LMSSetValue("cmi.core.lesson_location", "page_3");
API.LMSSetValue("cmi.suspend_data", JSON.stringify({
  currentPage: 3,
  completedSections: ["intro", "section1", "section2"],
  knowledgeCheckResults: { kc1: true, kc2: false }
}));

API.LMSCommit("");
```

### Self-Contained SCO Requirements

Every SCO must be self-contained per SCORM standards. For QM compliance, each SCO should include:

1. **Stated objectives** (Standard 2.3)
2. **Consistent navigation** (Standard 8.1)
3. **Accessible content** (Standards 8.2-8.5)
4. **SCORM API initialization** for tracking
5. **Error handling** for LMS communication failures

```javascript
// SCO initialization template
(function() {
  'use strict';

  // Find SCORM API
  var API = findAPI(window);

  if (API) {
    API.LMSInitialize("");

    // Resume from bookmark if available
    var bookmark = API.LMSGetValue("cmi.core.lesson_location");
    if (bookmark) {
      navigateToPage(bookmark);
    }

    // Set status to incomplete on entry
    var status = API.LMSGetValue("cmi.core.lesson_status");
    if (status === "not attempted") {
      API.LMSSetValue("cmi.core.lesson_status", "incomplete");
      API.LMSCommit("");
    }
  }

  // Handle page unload
  window.addEventListener('beforeunload', function() {
    if (API) {
      API.LMSSetValue("cmi.core.lesson_location", getCurrentPage());
      API.LMSCommit("");
      API.LMSFinish("");
    }
  });
})();
```

---

## Quality Checklist for SCORM Packages

Use this checklist to verify QM compliance before packaging:

### Standard 1: Course Overview and Introduction
- [ ] Welcome/start page clearly shows how to begin and navigate
- [ ] Course purpose and transformation statement clearly stated
- [ ] Course structure (modules, lessons, estimated time) is visible
- [ ] Technology requirements listed (browser, JavaScript, screen size)
- [ ] Prerequisites clearly stated (or "none required")

### Standard 2: Learning Objectives
- [ ] Course-level objectives use measurable Bloom's verbs
- [ ] Module-level objectives are measurable and map to course objectives
- [ ] Objectives are displayed prominently at the start of each lesson/module
- [ ] Alignment between objectives, activities, and assessments is visible

### Standard 3: Assessment and Measurement
- [ ] Quiz questions directly measure stated objectives
- [ ] Grading policy is clearly stated in course overview
- [ ] Each assessment shows criteria (points, passing score, attempts)
- [ ] Multiple assessment types are used (MCQ, true/false, scenario, matching)
- [ ] Learners can track their progress (progress bar, score summary)
- [ ] Immediate feedback provided for each quiz response

### Standard 4: Instructional Materials
- [ ] All content directly supports stated learning objectives
- [ ] Relationship between materials and activities is explained
- [ ] Content is current and accurate
- [ ] At least 3 content types per module (text, image, video, interactive)
- [ ] Sources are cited where applicable

### Standard 5: Learning Activities and Interaction
- [ ] Interactive activities support each learning objective
- [ ] Activities promote active learning (not just passive reading)
- [ ] At least one interaction per lesson (click-to-reveal, drag-drop, scenario)
- [ ] Knowledge checks (ungraded) embedded in lessons

### Standard 6: Course Technology
- [ ] All technology choices support learning objectives
- [ ] Interactive elements are engaging and functional
- [ ] Course is fully self-contained (no external dependencies)
- [ ] Privacy notice included about data tracking

### Standard 7: Learner Support
- [ ] Technical support information provided
- [ ] Accessibility statement included
- [ ] Help resources accessible from all pages (persistent help button)
- [ ] Troubleshooting tips available (refresh, clear cache, try other browser)

### Standard 8: Accessibility and Usability
- [ ] Consistent navigation across all SCOs
- [ ] Skip navigation link present
- [ ] Keyboard navigation works for all interactive elements
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for text)
- [ ] All images have descriptive alt text
- [ ] All videos have captions and transcripts
- [ ] Proper heading hierarchy (h1 > h2 > h3)
- [ ] Font size is at least 16px for body text
- [ ] Line height is at least 1.5
- [ ] Maximum line width ~70 characters
- [ ] Focus indicators visible on all interactive elements
- [ ] No content relies solely on color to convey meaning
- [ ] Content is readable at 200% zoom
- [ ] Form elements have associated labels
- [ ] Error messages are clear and actionable
- [ ] ARIA roles and attributes used where appropriate

---

## Summary of All 44 Specific Review Standards (7th Edition)

### Essential Standards (3 Points) — Must Be Met

| # | Standard | Category |
|---|---------|----------|
| 1.1 | Clear getting-started instructions | Overview |
| 1.2 | Course purpose and structure introduced | Overview |
| 2.1 | Course objectives are measurable | Objectives (Alignment) |
| 2.2 | Module objectives are measurable and consistent | Objectives (Alignment) |
| 2.3 | Objectives stated clearly from learner perspective | Objectives |
| 2.4 | Relationship between objectives, activities, assessments is clear | Objectives |
| 3.1 | Assessments measure stated objectives | Assessment (Alignment) |
| 3.2 | Grading policy clearly stated at start | Assessment |
| 3.3 | Specific evaluation criteria provided | Assessment |
| 4.1 | Materials support learning objectives | Materials (Alignment) |
| 4.2 | Relationship between materials and activities explained | Materials |
| 5.1 | Activities promote objective achievement | Activities (Alignment) |
| 5.2 | Activities support active learning | Activities |
| 6.1 | Technology supports learning objectives | Technology (Alignment) |
| 8.1 | Navigation facilitates ease of use | Accessibility |

### Very Important Standards (2 Points)

| # | Standard | Category |
|---|---------|----------|
| 1.3 | Communication guidelines clearly stated | Overview |
| 1.4 | Course/institutional policies stated or linked | Overview |
| 1.5 | Technology requirements clearly stated | Overview |
| 2.5 | Objectives suited to course level | Objectives |
| 3.4 | Assessments are sequenced, varied, and suited to level | Assessment |
| 3.5 | Multiple opportunities to track learning progress | Assessment |
| 4.3 | Academic integrity modeled via citations | Materials |
| 4.4 | Materials represent up-to-date practice | Materials |
| 4.5 | Variety of instructional materials used | Materials |
| 5.3 | Instructor interaction plan clearly stated | Activities |
| 5.4 | Learner interaction requirements clearly stated | Activities |
| 6.2 | Tools promote engagement and active learning | Technology |
| 7.1 | Technical support information provided | Support |
| 7.2 | Accessibility policies and accommodation services linked | Support |
| 8.2 | Course design facilitates readability | Accessibility |
| 8.3 | Text in the course is accessible | Accessibility |
| 8.4 | Images in the course are accessible | Accessibility |
| 8.5 | Video and audio content is accessible | Accessibility |

### Important Standards (1 Point)

| # | Standard | Category |
|---|---------|----------|
| 1.6 | Technical skills expected of learner stated | Overview |
| 1.7 | Required prior knowledge stated | Overview |
| 1.8 | Welcoming instructor self-introduction | Overview |
| 1.9 | Learners can introduce themselves | Overview |
| 3.6 | Academic integrity guidance for assessments | Assessment |
| 6.3 | Variety of technology used | Technology |
| 6.4 | Data privacy information provided | Technology |
| 7.3 | Academic support services linked | Support |
| 7.4 | Student services and resources linked | Support |
| 8.6 | Multimedia is easy to use | Accessibility |
| 8.7 | Vendor accessibility statements provided | Accessibility |

---

## Sources

- [Quality Matters Official Website](https://www.qualitymatters.org/)
- [QM Higher Education Rubric, Seventh Edition](https://www.qualitymatters.org/qa-resources/rubric-standards/higher-ed-rubric)
- [QM Rubric Standards Overview](https://www.qualitymatters.org/qa-resources/rubric-standards)
- [QM Standards at Penn State](https://qualitymatters.psu.edu/qm-standards/)
- [QM Standard 8: Accessibility and Usability](https://faculty.risepoint.com/anatomy-of-a-quality-course/qm-standard-8/)
- [Understanding the QM Rubric - 24/7 Teach](https://247teach.org/blog-for-instructional-design/understanding-the-quality-matters-rubric-a-comprehensive-guide-for-higher-education-and-corporate-learning)
- [QM 7th Edition Changes - Oregon State](https://blogs.oregonstate.edu/inspire/2023/07/10/quality-matters-rubric-7th-edition-whats-new/)
- [QM 7th Edition Changes - FGCU](https://www.fgcu.edu/digitallearning/digital-learning-blog/2023-10-27-qm-7thed-rubric)
- [IU Online Course Quality Checklist](https://teachingonline.iu.edu/quality-matters/quality-checklist.html)
- [QM Sixth Edition Standards PDF](https://www.qualitymatters.org/sites/default/files/PDFs/QM-Higher-Ed-Sixth-Edition-Specific-Review-Standards-Accessible.pdf)

---

*Note: The full annotated QM Rubric is proprietary to Quality Matters, Inc. This research document synthesizes publicly available information from QM's own publications, university implementations, and educational resources. The specific standard texts are reconstructed from publicly available university pages and QM's non-annotated standards documents. For the complete annotated rubric with detailed guidance notes, a QM membership or training participation is required.*
