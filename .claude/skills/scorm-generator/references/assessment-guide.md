# Assessment Design Guide

Reference guide for designing quizzes, knowledge checks, and evaluations.

## Critical Rule: Factual Accuracy (NON-NEGOTIABLE)

All quiz answers, explanations, feedback, and scientific simulations
**MUST be 100% factually verified**. No shortcuts.

- Every correct answer must actually be correct
- Every "incorrect" option must actually be incorrect
- Explanations must cite accurate facts
- Scientific simulations must use real calculations
- If accuracy cannot be verified, flag it for human review

**Wrong answers in a quiz destroy learner trust and teach misinformation.**

---

## Assessment Design Principles

### Alignment with Objectives

Every question must:
1. Align with a specific learning objective
2. Test at the appropriate Bloom's level
3. Reflect real-world application
4. Be unambiguous and fair

**WHY alignment matters:** A quiz that tests facts when the objective says "apply"
teaches learners that memorization is enough. This misalignment is the #1 reason
corporate training fails — people pass tests but can't perform on the job. Each
question should simulate the real-world task the learner needs to perform.

### Bloom's Level to Question Type Mapping

| Bloom's Level | Question Types | Example Verbs |
|---------------|----------------|---------------|
| Remember | Multiple choice, True/False | Identify, list, name |
| Understand | Multiple choice, Matching | Explain, describe, summarize |
| Apply | Scenario MC, Fill-blank | Use, demonstrate, solve |
| Analyze | Scenario MC, Hotspot | Compare, contrast, debug |
| Evaluate | Scenario MC, Ranking | Assess, recommend, justify |
| Create | Open response, Project | Design, develop, propose |

---

## Assessment Types

### Knowledge Checks (Within Lessons)
- 1-3 questions
- Low stakes (no score tracking)
- Immediate feedback
- Purpose: Reinforce learning

**WHY knowledge checks work:** They interrupt the "passive reading" pattern and force
active recall. Research shows testing enhances learning more than re-reading (the
"testing effect"). Immediate feedback corrects misconceptions before they solidify.

### Module Quizzes
- 5-10 questions
- Track score in SCORM
- Minimum passing score
- Can retry (if enabled)
- Purpose: Confirm module mastery

**WHY module quizzes use retries:** Allowing retries with feedback creates a "mastery loop"
— the learner sees what they got wrong, reviews the material, and tries again. This is
growth mindset in action. The goal is learning, not gatekeeping.

### Final Assessment
- Comprehensive coverage
- Track score and completion
- Higher passing threshold
- Limited retries
- Purpose: Prove transformation

**WHY the final assessment is harder:** It proves the learning transformation happened.
If it's too easy, the certificate means nothing. If it's too hard, it demoralizes.
The sweet spot: questions that require applying knowledge to novel scenarios — not
repeating the exact examples from the course.

---

## Question Type Templates

### 1. Multiple Choice (Single Answer)

```json
{
  "type": "multiple-choice",
  "id": "q_m1_l1_01",
  "stem": "What is the primary purpose of...",
  "options": [
    {"id": "a", "text": "Option A", "correct": false},
    {"id": "b", "text": "Option B", "correct": true},
    {"id": "c", "text": "Option C", "correct": false},
    {"id": "d", "text": "Option D", "correct": false}
  ],
  "feedback": {
    "correct": "Correct! Option B is right because...",
    "incorrect": "Not quite. The correct answer is B because..."
  },
  "objective": "M1.L1.O1",
  "blooms": "understand",
  "difficulty": "medium"
}
```

### 2. True/False

```json
{
  "type": "true-false",
  "id": "q_m1_l1_02",
  "stem": "Statement to evaluate...",
  "correct": true,
  "feedback": {
    "correct": "Correct! This is true because...",
    "incorrect": "This is actually true because..."
  }
}
```

### 3. Fill in the Blank

```json
{
  "type": "fill-blank",
  "id": "q_m2_l1_01",
  "stem": "The process of ___ involves...",
  "blanks": [
    {
      "position": 1,
      "answers": ["correct answer", "alternate spelling"],
      "caseSensitive": false
    }
  ]
}
```

### 4. Matching (Drag and Drop)

```json
{
  "type": "matching",
  "id": "q_m2_quiz_01",
  "stem": "Match each term with its definition:",
  "items": [
    {"id": "1", "term": "Term A"},
    {"id": "2", "term": "Term B"}
  ],
  "targets": [
    {"id": "a", "definition": "Definition 1", "matchTo": "1"},
    {"id": "b", "definition": "Definition 2", "matchTo": "2"}
  ]
}
```

---

## Output Structure

Save question banks to: `output/[course-name]/content/questions.json`

The questions.json file should contain all questions organized by module and lesson, using the JSON templates above.

---

## Behavioral Data Collection in Assessments

Track these behavioral signals for every quiz:
- **Time per question**: Record start/end timestamps
- **Answer changes**: Track when learner changes their answer (second-guessing indicator)
- **Time to first click**: How quickly they select an option (confidence indicator)
- **Hint usage**: Track if/when hints are requested
- **Option position patterns**: Detect if learner always picks first/last option

Report all interactions via SCORM cmi.interactions:
```javascript
// For each question answered
API.LMSSetValue("cmi.interactions.N.id", questionId);
API.LMSSetValue("cmi.interactions.N.type", "choice");
API.LMSSetValue("cmi.interactions.N.student_response", selectedOption);
API.LMSSetValue("cmi.interactions.N.correct_responses.0.pattern", correctOption);
API.LMSSetValue("cmi.interactions.N.result", isCorrect ? "correct" : "wrong");
API.LMSSetValue("cmi.interactions.N.latency", formatTime(timeSpent));
```

---

## Gamification in Assessments

- Award points for correct answers (10pts) and bonus for streaks (3+ correct = 5pt bonus)
- Show encouraging growth mindset feedback:
  - Correct: "Great work! You're building mastery."
  - Incorrect: "Not yet - but you're learning! Here's why..."
  - Retry: "Coming back to try again shows real persistence!"
- Celebrate quiz completion with animation
- Show score with positive framing: "You got 7 out of 10 - that's 70%!"
