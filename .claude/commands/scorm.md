---
name: scorm
description: Launch the complete SCORM content creation workflow through a structured interview and automated content generation pipeline.
disable-model-invocation: true
argument-hint: "[topic]"
---

# /scorm — SCORM Content Studio

Launch the complete 8-phase SCORM pipeline. All work happens in the main conversation.
Read `.claude/skills/scorm-generator/SKILL.md` for the full pipeline hub.

---

## When This Command Runs

1. **Read the hub skill first:**
   Read `.claude/skills/scorm-generator/SKILL.md` to understand the 8-phase pipeline and which module to read at each phase.

2. **Start with greeting:**
   ```
   Welcome to SCORM Content Studio!

   I'll guide you through creating a professional SCORM package.
   This process has 8 phases:

   1. Interview — Understand the learning transformation
   2. Instructional Design — Structure modules and lessons
   3. Art Direction — Define visual identity
   4. Visual Generation — Create images and icons
   5. Animation — Create intro/outro videos (optional)
   6. Assessment — Design quizzes and knowledge checks
   7. Content Rendering — Build HTML/CSS/JS pages
   8. Packaging — Create LMS-ready ZIP

   Let's begin!
   ```

3. **Execute phases in order:**
   Follow the pipeline in SKILL.md. At each phase, read the referenced module/resource file.

---

## Phase Routing (from hub SKILL.md)

| Phase | Read This File | Output |
|-------|---------------|--------|
| 1. Interview | `modules/course-design.md` + `references/interview-guide.md` | `specs/[course]_spec.md` |
| 2. Design | `modules/course-design.md` | `specs/[course]_structure.md` |
| 3. Art Direction | `modules/art-direction.md` + `resources/theme-dna.md` | `art-direction/[course]_*` |
| 4. Visuals | `modules/visual-generation.md` | `output/[course]/shared/assets/images/` |
| 5. Animation | `create-animated-video` skill (separate) | `output/[course]/shared/assets/videos/` |
| 6. Assessment | `references/assessment-guide.md` | `output/[course]/content/questions.json` |
| 7. Rendering | `resources/rendering-guide.md` | `output/[course]/sco_*/` |
| 8. Packaging | `resources/packaging-guide.md` | `output/[course].zip` |

All file paths are relative to `.claude/skills/scorm-generator/`.

---

## Pipeline Flow

```
Sequential:  Phase 1 → Phase 2 → Phase 3
Parallel OK: Phase 4 + Phase 5 + Phase 6
Sequential:  Phase 7 → Phase 8
```

---

## Quick Start Mode

If user provides a topic (e.g., `/scorm workplace safety`), pre-fill the topic and start Phase 1 by asking transformation questions directly.

---

## Phase Confirmation Gates

After each phase:
1. Show a summary of what was created
2. Ask: "Ready for the next phase?"
3. Allow review and edits before continuing

---

## State Tracking

Save progress to `specs/[course-slug]_progress.json` after each phase:

```json
{
  "courseName": "[course-slug]",
  "currentPhase": 3,
  "phases": {
    "interview": "completed",
    "design": "completed",
    "art-direction": "in-progress",
    "visuals": "pending",
    "animation": "pending",
    "assessment": "pending",
    "rendering": "pending",
    "packaging": "pending"
  }
}
```

If a progress file already exists, offer to resume from the last completed phase.

---

## Error Handling

- If interview is incomplete, save partial spec and offer to continue later
- If visual generation fails, continue with placeholder images
- If animation is skipped, proceed without video assets
- Always complete manifest and packaging even with partial assets
