# Quality Matters (QM) Checklist for SCORM Packages

> Extracted from QM Higher Education Rubric, Seventh Edition.
> Use this checklist to verify QM compliance before packaging.

---

## Standard 1: Course Overview and Introduction

- [ ] Welcome/start page clearly shows how to begin and navigate
- [ ] Course purpose and transformation statement clearly stated
- [ ] Course structure (modules, lessons, estimated time) is visible
- [ ] Technology requirements listed (browser, JavaScript, screen size)
- [ ] Prerequisites clearly stated (or "none required")

## Standard 2: Learning Objectives

- [ ] Course-level objectives use measurable Bloom's verbs
- [ ] Module-level objectives are measurable and map to course objectives
- [ ] Objectives are displayed prominently at the start of each lesson/module
- [ ] Alignment between objectives, activities, and assessments is visible

## Standard 3: Assessment and Measurement

- [ ] Quiz questions directly measure stated objectives
- [ ] Grading policy is clearly stated in course overview
- [ ] Each assessment shows criteria (points, passing score, attempts)
- [ ] Multiple assessment types are used (MCQ, true/false, scenario, matching)
- [ ] Learners can track their progress (progress bar, score summary)
- [ ] Immediate feedback provided for each quiz response

## Standard 4: Instructional Materials

- [ ] All content directly supports stated learning objectives
- [ ] Relationship between materials and activities is explained
- [ ] Content is current and accurate
- [ ] At least 3 content types per module (text, image, video, interactive)
- [ ] Sources are cited where applicable

## Standard 5: Learning Activities and Interaction

- [ ] Interactive activities support each learning objective
- [ ] Activities promote active learning (not just passive reading)
- [ ] At least one interaction per lesson (click-to-reveal, drag-drop, scenario)
- [ ] Knowledge checks (ungraded) embedded in lessons

## Standard 6: Course Technology

- [ ] All technology choices support learning objectives
- [ ] Interactive elements are engaging and functional
- [ ] Course is fully self-contained (no external dependencies)
- [ ] Privacy notice included about data tracking

## Standard 7: Learner Support

- [ ] Technical support information provided
- [ ] Accessibility statement included
- [ ] Help resources accessible from all pages (persistent help button)
- [ ] Troubleshooting tips available (refresh, clear cache, try other browser)

## Standard 8: Accessibility and Usability

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

## QM Alignment Framework

The central QM concept is **Alignment** -- all five core components must work together:

```
Learning Objectives (SRS 2.1, 2.2)
        |
        +---> Assessments (SRS 3.1)
        |       "Do assessments measure the objectives?"
        |
        +---> Instructional Materials (SRS 4.1)
        |       "Do materials support achieving objectives?"
        |
        +---> Learning Activities (SRS 5.1)
        |       "Do activities help learners practice?"
        |
        +---> Course Technology (SRS 6.1)
                "Does technology enable the learning?"
```

## SCORM Data Model for QM Compliance

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

## Essential Standards (3 Points) -- Must Be Met

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

## Bloom's Taxonomy Verb Guide

| Level | Measurable Verbs | Use For |
|-------|-----------------|---------|
| **Remember** | List, define, identify, recall, name | Foundation/introductory lessons |
| **Understand** | Explain, describe, summarize, paraphrase | Concept explanation lessons |
| **Apply** | Use, implement, demonstrate, solve | Practice and skill-building |
| **Analyze** | Compare, contrast, differentiate, debug | Advanced/critical thinking |
| **Evaluate** | Assess, critique, justify, recommend | Case studies, decision-making |
| **Create** | Design, develop, construct, produce | Capstone projects, synthesis |

---

*Source: Quality Matters Higher Education Rubric, Seventh Edition (qualitymatters.org)*
