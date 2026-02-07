---
name: scorm
description: Launch the complete SCORM content creation workflow through a structured interview and automated content generation pipeline.
disable-model-invocation: true
argument-hint: "[topic]"
---

# /scorm - SCORM Content Studio Command

Launch the complete SCORM content creation workflow through a structured 7-phase interview process.

---

## Workflow Overview

When the user runs `/scorm`, execute this complete workflow:

### Phase 1: Interview & Requirements
Use the `scorm-interview` agent to conduct the 7-phase deep interview:
1. **Transformation Discovery** - What will learners be able to DO?
2. **Audience & Context** - Who are they? What LMS?
3. **Learning Objectives** - SMART objectives using Bloom's
4. **Content Structure** - Modules, lessons, duration
5. **Assessment Design** - Quizzes, knowledge checks, passing scores
6. **Art Direction** - Colors, typography, visual style
7. **Animation Preferences** - Videos, transitions, motion

Save the specification to: `specs/[course-name]_spec.md`

### Phase 2: Instructional Design
Use the `scorm-instructional-designer` agent to:
- Structure modules and lessons based on Bloom's taxonomy
- Create learning paths with prerequisites
- Design the assessment strategy
- Map content to learning objectives

### Phase 3: Art Direction (with Theme Selection)
Use the `scorm-art-director` agent to:
- **Read available themes** from `themes/` directory first
- Present theme options to user (space-explorer, corporate-clean, bold-gradient, playful-bright, technical-dark)
- Allow user to pick a starter theme + customize, or create fully custom
- Optionally select a brand overlay (eduarabia, nelc)
- Produce THREE output files:
  - `art-direction/[course-name]_style.md` — Visual style guide
  - `art-direction/[course-name]_tokens.json` — Design tokens
  - `art-direction/[course-name]_theme.css` — CSS custom properties

### Phase 4: Visual Asset Generation
Use the `scorm-visual-generator` agent to:
- Generate course thumbnail
- Create module header images
- Design lesson illustrations
- Produce icons and infographics

Output to: `output/[course-name]/shared/assets/images/`

### Phase 5: Animation Creation (if enabled)
Use the `scorm-animation-creator` agent to:
- Render intro/outro videos
- Create text animations
- Build transition effects
- Animate charts and data

Output to: `output/[course-name]/shared/assets/videos/`

### Phase 6: Assessment Building
Use the `scorm-assessment-builder` agent to:
- Create question banks
- Build quiz interactions
- Design knowledge checks
- Set up scoring and feedback

### Phase 7: Content Rendering
Use the `scorm-content-renderer` agent to:
- Generate HTML for each SCO
- Integrate all visual assets
- Add interactivity with JavaScript
- Apply styles and responsive design

Output to: `output/[course-name]/sco_*/`

### Phase 8: SCORM Packaging
Use the `scorm-packager` agent to:
- Generate imsmanifest.xml
- Inventory all resources
- Validate SCORM compliance
- Create final ZIP package

Output: `output/[course-name]/[course-name].zip`

---

## Execution Instructions

When this command is invoked:

1. **Start with greeting:**
   ```
   🎓 Welcome to SCORM Content Studio!

   I'll guide you through creating a professional SCORM package
   for your learning content. This process has 7 phases:

   1. 🎯 Transformation Discovery
   2. 👥 Audience & Context
   3. 📚 Learning Objectives
   4. 📑 Content Structure
   5. ✅ Assessment Design
   6. 🎨 Art Direction & Theme Selection
   7. 🎬 Animation Preferences

   Available themes: space-explorer, corporate-clean, bold-gradient,
   playful-bright, technical-dark (or fully custom)

   Let's begin!
   ```

2. **Run Phase 1 - Interview:**
   Launch the `scorm-interview` agent with the Task tool to conduct the deep interview.

3. **Run Phase 2 - Instructional Design:**
   Launch `scorm-instructional-designer` agent with the interview spec.

4. **Run Phase 3 - Art Direction:**
   Launch `scorm-art-director` agent to establish visual style.

5. **Run Phase 4-8 - Generation:**
   Sequentially launch the remaining agents to generate content.

6. **Complete with summary:**
   ```
   ✅ SCORM Package Complete!

   📦 Package: output/[course-name]/[course-name].zip
   📁 Files: [count] resources packaged
   📊 SCOs: [count] learning objects

   Next steps:
   1. Upload to your LMS (Moodle, Canvas, etc.)
   2. Test in SCORM Cloud (cloud.scorm.com)
   3. Assign to learners!
   ```

---

## Agent Coordination

The agents should be launched in this order, with each receiving output from the previous:

```
scorm-interview
       ↓ (spec.md)
scorm-instructional-designer
       ↓ (learning structure)
scorm-art-director
       ↓ (style guide)
       ├──→ scorm-visual-generator (images)
       └──→ scorm-animation-creator (videos, if enabled)
              ↓
scorm-assessment-builder
       ↓ (quiz content)
scorm-content-renderer
       ↓ (HTML/JS/CSS)
scorm-packager
       ↓
[course-name].zip
```

---

## Quick Start Mode

If user provides course topic immediately, extract what you can and ask only clarifying questions:

**User:** `/scorm` Create a course on workplace safety
**Response:** Start Phase 1 but pre-fill "workplace safety" as the topic, then ask transformation questions.

---

## Error Handling

- If interview is incomplete, save partial spec and ask if user wants to continue later
- If visual generation fails, continue with placeholder images
- If animation is skipped, proceed without video assets
- Always complete manifest and packaging even with partial assets

## State Tracking

After each phase, save progress to `specs/[course-name]_progress.json`:

```json
{
  "courseName": "[course-slug]",
  "startedAt": "[ISO timestamp]",
  "phases": {
    "interview": { "status": "pending", "output": null },
    "design": { "status": "pending", "output": null },
    "art-direction": { "status": "pending", "output": null },
    "visuals": { "status": "pending", "output": null },
    "animation": { "status": "pending", "output": null },
    "assessment": { "status": "pending", "output": null },
    "rendering": { "status": "pending", "output": null },
    "packaging": { "status": "pending", "output": null }
  }
}
```

If a progress file already exists for a course, offer to resume from the last completed phase.

## Phase Confirmation Gates

After completing each phase:
1. Show a summary of what was created
2. Ask: "Ready to proceed to [next phase]? (yes/no/edit)"
3. Allow user to review and edit outputs before continuing
