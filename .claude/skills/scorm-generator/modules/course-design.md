# Course Design Module

Instructional design methodology for the SCORM pipeline — transformation-first backward design,
Bloom's taxonomy, Gagne's Nine Events, and adult learning principles.

# Course Builder Skill

Instructional design methodology for creating transformation-focused online courses using backward design and adult learning principles.

## Core Philosophy

### Transformation-First Design
> "Start with the transformation, work backwards to the starting point."

Don't start with content. Start with WHO the learner becomes and WHAT they can DO after the course.

## The Transformation Framework

### 1. Define the Transformation
```
Before: [Current state - what they can't do]
After:  [Desired state - what they CAN do]
Proof:  [How they demonstrate the transformation]
```

### 2. Work Backwards
```
Transformation
     ↑
  Skills needed
     ↑
  Knowledge required
     ↑
  Starting point
```

## SMART Learning Objectives

### Formula
```
"By the end of this [lesson/module], you will be able to [VERB] [WHAT] [CONDITION]."
```

### Examples
- ❌ "Understand project management" (vague)
- ✓ "Create a project timeline using Gantt charts for a 3-month project" (specific)

## Bloom's Taxonomy Integration

| Level | Verbs | Assessment Type |
|-------|-------|-----------------|
| **Remember** | List, name, identify, recall | Quiz, flashcards |
| **Understand** | Explain, describe, summarize | Written response |
| **Apply** | Use, implement, demonstrate | Practice activity |
| **Analyze** | Compare, contrast, examine | Case study |
| **Evaluate** | Judge, assess, recommend | Critique exercise |
| **Create** | Design, develop, produce | Project |

## Course Structure Guidelines

### Recommended Structure
- **Course Duration:** 2-6 hours total
- **Modules:** 3-6 per course
- **Lessons:** 3-7 per module
- **Lesson Duration:** 5-10 minutes each

### Module Template
```
Module [N]: [Title]
├── Lesson 1: Foundation concept
├── Lesson 2: Core technique
├── Lesson 3: Practice/example
├── Lesson 4: Advanced application
└── Module Quiz
```

## Assessment Strategy

### Checkpoint Frequency
- **After each lesson:** Quick knowledge check (1-3 questions)
- **After each module:** Module quiz (5-10 questions)
- **End of course:** Capstone project or comprehensive assessment

### Question Alignment
Every question should:
1. Map to a specific learning objective
2. Test at the appropriate Bloom's level
3. Provide meaningful feedback

## Adult Learning Principles (Andragogy)

### Key Principles
1. **Self-direction** - Adults want control over their learning
2. **Experience** - Build on what they already know
3. **Relevance** - Connect to real work/life situations
4. **Problem-centered** - Focus on solving actual problems
5. **Internal motivation** - Show personal benefits

### Application
- Use real-world examples
- Acknowledge prior experience
- Allow learner choice when possible
- Focus on practical application
- Show "what's in it for me"

## Gagné's Nine Events of Instruction

Apply these events within each lesson:

1. **Gain attention** - Hook, question, surprising fact
2. **Inform objectives** - State what they'll learn
3. **Stimulate recall** - Connect to prior knowledge
4. **Present content** - Core instruction
5. **Provide guidance** - Examples, tips, best practices
6. **Elicit performance** - Practice activity
7. **Provide feedback** - Correct/incorrect, explanation
8. **Assess performance** - Knowledge check
9. **Enhance retention** - Summary, next steps, resources

## MENA/Arabic Considerations

### Language
- RTL text direction for Arabic
- Use Arabic fonts (Noto Kufi Arabic, Cairo, Tajawal)
- Consider bilingual content (Arabic + English)

### Cultural Context
- Use regionally appropriate examples
- Consider prayer time scheduling
- Respect cultural norms in imagery
- Account for weekend differences (Fri-Sat in many MENA countries)

### Technical
- Support for Arabic numerals (٠١٢٣٤٥٦٧٨٩) or Western (0123456789)
- Right-to-left UI layouts
- Arabic-compatible fonts in PDFs/certificates

## Content Types

### Primary Content
- **Text** - Explanatory content, instructions
- **Video** - Demonstrations, lectures
- **Images** - Diagrams, infographics, examples
- **Interactive** - Simulations, exercises

### Supporting Content
- **Downloadables** - Templates, checklists, guides
- **Transcripts** - For videos (accessibility)
- **Resources** - Further reading, tools, references

## Quality Checklist

Before publishing, verify:

### Content Quality
- [ ] Clear learning objectives
- [ ] Logical content sequence
- [ ] Appropriate difficulty progression
- [ ] Real-world relevance
- [ ] Engaging examples

### Assessment Quality
- [ ] Questions aligned to objectives
- [ ] Appropriate Bloom's levels
- [ ] Meaningful feedback
- [ ] Fair passing criteria

### Technical Quality
- [ ] Works on mobile devices
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Fast loading times
- [ ] Cross-browser compatible

### Learner Experience
- [ ] Clear navigation
- [ ] Progress visibility
- [ ] Achievable in stated time
- [ ] Motivating and engaging

## Quality Matters Alignment Framework

The central QM principle: five core components must align:

```
Learning Objectives (QM 2.1, 2.2)
    ↕
Assessments (QM 3.1) — "Do assessments measure the objectives?"
    ↕
Instructional Materials (QM 4.1) — "Do materials support objectives?"
    ↕
Learning Activities (QM 5.1) — "Do activities help learners practice?"
    ↕
Course Technology (QM 6.1) — "Does technology enable the learning?"
```

### Every Module Must Include
- Course/module objectives displayed prominently (QM 2.3)
- Grading policy clearly stated (QM 3.2)
- At least 3 content types (text, visual, interactive) (QM 4.5)
- At least 1 interactive activity per lesson (QM 5.2)
- Knowledge checks embedded in lessons (ungraded)
- Module quiz with scoring (graded)

### Alignment Map Template
For each module, create an alignment map:

| Objective | Material | Activity | Assessment | Technology |
|-----------|----------|----------|------------|------------|
| [verb] [what] | [content type] | [interaction type] | [question type] | [HTML/JS element] |

## Gamification Integration Points

Build gamification into the learning structure:
- **Points**: Award for section completion (10pts), knowledge check (20pts), quiz (50pts)
- **Progress**: Visual journey map showing module progression
- **Feedback**: Growth mindset messaging after assessments
- **Challenge**: Adaptive difficulty based on performance
- **Narrative**: Optional story thread connecting modules

## Behavioral Data Design

When designing the learning structure, plan what behavioral data to collect:
- **Per lesson**: Time on page, scroll depth, interaction clicks, revisit count
- **Per quiz**: Time per question, answer changes, hint usage, deliberation time
- **Per module**: Completion time, score progression, retry patterns
- **Per course**: Session patterns, total time, engagement profile

## Reference Files

| File | Description |
|------|-------------|
| `references/curriculum-design.md` | Curriculum design patterns and templates |
| `references/interview-guide.md` | 7-phase interview methodology with question templates |
| `references/assessment-guide.md` | Assessment design, question bank JSON formats, behavioral tracking |

## Instructional Design Workflow

This section captures the workflow for transforming a course specification into a detailed learning structure document.

### Applying Gagne's Nine Events Within Each Lesson

Each lesson follows a timed structure based on Gagne's Nine Events:

| Event | Duration | Description |
|-------|----------|-------------|
| 1. Hook (Gain attention) | 30 sec | Attention-getter: question, scenario, surprising fact |
| 2. Objective Statement (Inform objectives) | 30 sec | "By the end of this lesson, you will..." |
| 3. Prior Knowledge Connection (Stimulate recall) | 1 min | What to recall from previous experience |
| 4. Core Content (Present content) | 5-7 min | Sections with mixed content types (text, video, interactive) |
| 5. Guided Example (Provide guidance) | 2 min | Worked example with tips |
| 6. Practice Activity (Elicit performance) | 2 min | Learner does the activity |
| 7. Knowledge Check (Provide feedback + Assess) | 1 min | 1-3 questions with immediate feedback |
| 8-9. Summary (Enhance retention) | embedded | Next steps, key takeaways |

### Learning Structure Output Format

The instructional design phase produces `specs/[course-name]_structure.md` containing:

- **Course overview**: Total duration, module count, lesson count, assessment count, SCORM version
- **Per module**: Duration, terminal objective, prerequisites, and detailed lesson breakdowns
- **Per lesson**: SCO ID, duration, objective, Bloom's level, content structure (using Gagne's events), content types checklist, assets required
- **Quiz plans**: Question-by-question mapping to objectives with Bloom's level, question type, and difficulty
- **Final assessment**: Comprehensive coverage table showing questions-per-module and weight percentages
- **Learning path diagram**: ASCII flowchart showing SCO sequencing
- **Content type distribution**: Table showing balance across text, video, interactive, and assessments

### SCO Naming Conventions

Use this format for SCO (Shareable Content Object) identifiers:

```
sco_01_introduction     - Course intro
sco_02_m1_lesson1       - Module 1, Lesson 1
sco_03_m1_lesson2       - Module 1, Lesson 2
sco_04_m1_quiz          - Module 1 Quiz
...
sco_XX_final            - Final Assessment
```

Sequential numbering across the entire course (not per-module).

### Duration Guidelines

| Content Type | Duration |
|--------------|----------|
| Text lesson | 3-5 min reading |
| Video lesson | 5-10 min (NELC max: 10 min per clip) |
| Interactive activity | 2-5 min |
| Knowledge check | 1-2 min |
| Module quiz | 5-10 min |
| Final assessment | 15-30 min |

### Checkpoint Rules

**Knowledge Checks (within lessons):**
- 1-3 questions, low stakes (no SCORM score tracking)
- Immediate feedback, purpose is reinforcement

**Module Quizzes (end of module):**
- 5-10 questions, score tracked in SCORM
- Minimum passing score required, retries configurable
- Purpose: Confirm module mastery

**Final Assessment (end of course):**
- Comprehensive coverage across all modules
- Score and completion tracked in SCORM
- Higher passing threshold, limited retries
- Purpose: Prove the transformation happened

### Sequencing Rules (SCORM 2004)

- Module 1 must complete before Module 2
- Quiz required after each module
- Final requires all modules complete
- Passing score unlocks next module

### Output Location

Save the learning structure to: `specs/[course-name]_structure.md`

This document is consumed by:
- Assessment Builder (quiz structure and question plans)
- Content Renderer (SCO creation and page layout)
- SCORM Packager (manifest organization and sequencing)
