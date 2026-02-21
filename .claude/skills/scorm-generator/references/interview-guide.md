# Requirements Interview Guide

Structured 7-phase interview methodology for SCORM content creation.

## Core Principle: Transformation-First

> "Start with the transformation, work backwards to the starting point."

Don't start with content. Start with WHO the learner becomes and WHAT they can DO after the course.

---

## The 7 Interview Phases

### Phase 1: Transformation Discovery

**Key Questions:**
1. "What will learners be able to DO after completing this course that they cannot do now?"
2. "How will learners demonstrate this new capability?"
3. "What does success look like 30 days after course completion?"
4. "What problem does this solve for the learner or organization?"

**Dig Deeper:**
- What specific skills are required for this transformation?
- What knowledge enables those skills?
- What attitudes or mindsets need to shift?

**Output:** Clear transformation statement in format:
> "Learners will transform from [CURRENT STATE] to [DESIRED STATE] by developing [SKILLS] and applying [KNOWLEDGE]."

---

### Phase 2: Audience & Context

**Key Questions:**
1. "Who is the target audience? (Role, experience level, demographics)"
2. "What do they already know about this topic?"
3. "What is the organizational context? (Compliance, onboarding, skill development)"
4. "What devices and LMS will they use?"

**Additional Context:**
- Learning preferences (visual, reading, hands-on)
- Time availability for learning
- Motivation level (required vs. elective)
- Language requirements (English, Arabic, bilingual)

**MENA/Arabic Considerations:**
- Is RTL layout needed?
- Arabic or English primary?
- Regional examples or context?
- Prayer time/schedule considerations?

**Technical:**
- SCORM version preference? (1.2 for compatibility, 2004 for advanced features)
- LMS platform? (Moodle, Canvas, Blackboard, custom)

---

### Phase 3: Learning Objectives

**Use SMART Objective Formula:**
> "By the end of this [lesson/module], you will be able to [VERB] [WHAT] [CONDITION]."

**Apply Bloom's Taxonomy:**

| Level | Question to Ask | Example Verbs |
|-------|-----------------|---------------|
| Remember | "What facts must they recall?" | List, name, identify |
| Understand | "What concepts must they explain?" | Describe, summarize, explain |
| Apply | "What must they do with this knowledge?" | Use, implement, demonstrate |
| Analyze | "What must they compare or break down?" | Compare, contrast, debug |
| Evaluate | "What must they judge or critique?" | Assess, evaluate, recommend |
| Create | "What must they design or build?" | Design, develop, create |

**For Each Module, Establish:**
- 1 terminal objective (main outcome)
- 2-4 enabling objectives (sub-skills)
- Measurable success criteria

---

### Phase 4: Content Structure

**Recommended Structure:**
- 3-6 modules per course
- 3-7 lessons per module
- 5-10 minutes per lesson
- 2-6 hours total course

**Questions:**
1. "What are the main topics or sections?"
2. "What is the logical sequence?"
3. "Are there any prerequisites between topics?"
4. "What is the ideal total duration?"

**For Each Module:**
- Module title and description
- List of lessons within
- Content types (video, text, interactive, animation)
- Estimated duration

---

### Phase 5: Assessment Design

**Assessment Strategy Questions:**
1. "How will learners prove they've achieved the transformation?"
2. "What is the minimum passing score?"
3. "Should learners be able to retry failed assessments?"
4. "Is there a final capstone or project?"

**Checkpoint Strategy:**
- After each lesson: Quick knowledge check (1-3 questions)
- After each module: Quiz (5-10 questions)
- End of course: Capstone project or comprehensive test

**Question Types Available:**
- Multiple choice (single or multiple answer)
- True/False
- Fill in the blank
- Drag and drop matching
- Hotspot (click on image)

**For Quizzes:**
- Number of questions
- Time limit (if any)
- Randomization (questions and/or answers)
- Feedback for correct/incorrect

---

### Phase 6: Art Direction

**Visual Style Questions:**
1. "Do you have brand guidelines or colors to match?"
2. "What visual style fits? (Professional, playful, technical, minimal)"
3. "Any existing images or assets to incorporate?"
4. "What mood should the visuals convey?"

**Establish:**
- **Primary color** (main brand/theme color)
- **Secondary color** (supporting color)
- **Accent color** (buttons, highlights)
- **Typography** (heading font, body font)
- **Visual style** (photography, illustration, icons, abstract)

**Assets to Generate:**
- Course thumbnail (1280x720 recommended)
- Module header images
- Lesson illustrations
- Icons for concepts
- Infographics for complex topics

---

### Phase 7: Animation Preferences

**Questions:**
1. "Would you like animated intro/outro videos?"
2. "Should text animate on screen?"
3. "Are there charts or data to visualize?"
4. "What transition style between sections?"

**Options:**
- **Intro videos:** Yes/No, duration (5-15 seconds)
- **Text animations:** Typewriter, word highlight, fade in, none
- **Transitions:** Fade, slide, wipe, zoom, none
- **Chart animations:** For data visualization
- **Audio:** Background music, voiceover, none

**Accessibility:**
- Captions for videos?
- Audio descriptions?
- Reduced motion option?

---

## Interview Flow Tips

1. **Be conversational** - This is a dialogue, not a form
2. **Probe for specifics** - "Tell me more about that..."
3. **Summarize and confirm** - "So what I'm hearing is..."
4. **Offer examples** - Help them envision possibilities
5. **Note gaps** - Flag when information is missing

---

## Output Format

After completing all phases, create a specification document:

```markdown
# Course Specification: [Course Name]

## 1. Transformation
[Transformation statement]

## 2. Audience
- Target: [audience description]
- Prior knowledge: [what they know]
- Context: [organizational context]
- Devices: [device requirements]
- LMS: [LMS platform]
- SCORM Version: [1.2 or 2004]
- Language: [primary language, RTL needs]

## 3. Learning Objectives
### Module 1: [Title]
- Terminal: [main objective]
- Enabling:
  - [objective 1]
  - [objective 2]
[Repeat for all modules]

## 4. Content Structure
| Module | Lessons | Duration | Content Types |
|--------|---------|----------|---------------|
| [name] | [count] | [time]   | [types]       |

## 5. Assessment Strategy
- Knowledge checks: [frequency]
- Module quizzes: [questions, passing score]
- Final assessment: [type, passing score]
- Retries: [allowed/not]

## 6. Visual Style
- Primary: [color hex]
- Secondary: [color hex]
- Accent: [color hex]
- Typography: [fonts]
- Style: [visual approach]
- Mood: [description]

## 7. Animation
- Intro video: [yes/no, style]
- Text animations: [type]
- Transitions: [type]
- Charts: [yes/no]
- Accessibility: [requirements]

## 8. Assets Needed
- [ ] Course thumbnail
- [ ] Module headers (x[count])
- [ ] Lesson illustrations (x[count])
- [ ] Icons (x[count])
- [ ] Infographics (x[count])
```

Save this to: `specs/[course-name-slug]_spec.md`

---

## Example Interview Start

```
Phase 1: Transformation Discovery

Let's start with the most important question:

When someone completes this course, what will they be able to DO
that they couldn't do before?

Think about specific, observable actions - not just "understand X"
but "be able to X in situation Y."
```
