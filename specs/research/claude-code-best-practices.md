# Claude Code Best Practices Research for SCORM Content Studio

> Research findings to optimize the SCORM Content Studio project setup using Claude Code best practices from official documentation, Anthropic engineering guides, and community patterns.

---

## Table of Contents

1. [Agent Architecture](#1-agent-architecture)
2. [Skill Architecture](#2-skill-architecture)
3. [Command Design](#3-command-design)
4. [Settings Optimization](#4-settings-optimization)
5. [Project Organization](#5-project-organization)
6. [Team Coordination](#6-team-coordination)
7. [CLAUDE.md Optimization](#7-claudemd-optimization)
8. [Specific Recommendations for SCORM Content Studio](#8-specific-recommendations-for-scorm-content-studio)

---

## 1. Agent Architecture

### Current State Analysis

The project has 8 agents in `.claude/agents/`:
- `scorm-interview.md` - Requirements gatherer
- `scorm-instructional-designer.md` - Learning architect
- `scorm-art-director.md` - Visual strategist
- `scorm-visual-generator.md` - AI image creation
- `scorm-animation-creator.md` - Motion design
- `scorm-assessment-builder.md` - Quiz design
- `scorm-content-renderer.md` - HTML/CSS/JS developer
- `scorm-packager.md` - SCORM packaging

### Critical Finding: Missing YAML Frontmatter

**All 8 agent files are missing YAML frontmatter.** This is the single most important finding. According to official Claude Code documentation, agent files MUST have YAML frontmatter with at minimum `name` and `description` fields. Without frontmatter, Claude Code cannot properly:

1. Identify and register the agents
2. Know when to automatically delegate to them
3. Restrict their tool access
4. Route tasks to the right model

**Required frontmatter fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier, lowercase + hyphens (e.g., `scorm-interview`) |
| `description` | Yes | When Claude should delegate to this agent. Key for auto-delegation |
| `tools` | No | Allowlist of tools the agent can use |
| `disallowedTools` | No | Denylist of tools to remove from inherited set |
| `model` | No | Which model to use: `sonnet`, `opus`, `haiku`, or `inherit` |
| `permissionMode` | No | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, or `plan` |
| `skills` | No | Skills to preload into the agent's context |
| `hooks` | No | Lifecycle hooks scoped to this agent |
| `memory` | No | Persistent memory scope: `user`, `project`, or `local` |

**Example: What the interview agent should look like:**

```yaml
---
name: scorm-interview
description: Conducts structured 7-phase deep interviews for SCORM content creation. Use when gathering requirements for a new course, running the /scorm command, or when user wants to create learning content.
tools: Read, Write, Glob, Grep
model: inherit
skills:
  - course-builder
---

# SCORM Interview Agent

You are a learning experience designer...
[rest of existing content]
```

### Agent Design Best Practices

#### 1. Write Detailed Descriptions

The `description` field is what Claude uses to decide when to delegate. Include:
- **What the agent does** (core capability)
- **When to use it** (triggers and contexts)
- **Keywords** that match user language

Bad: `"Interviews users for SCORM"`
Good: `"Conducts structured 7-phase deep interviews for SCORM content creation. Use when gathering requirements for a new course, running the /scorm command, or when user wants to create e-learning content. Covers transformation discovery, audience analysis, learning objectives, content structure, assessment design, art direction, and animation preferences."`

#### 2. Limit Tool Access Per Agent

Each agent should have only the tools it needs. This improves security and focus:

| Agent | Recommended Tools |
|-------|-------------------|
| `scorm-interview` | `Read, Write, Glob` (read-only + save spec) |
| `scorm-instructional-designer` | `Read, Write, Glob, Grep` |
| `scorm-art-director` | `Read, Write, Glob` |
| `scorm-visual-generator` | `Read, Write, Glob, Bash` (needs Bash for image generation) |
| `scorm-animation-creator` | `Read, Write, Glob, Bash` (needs Bash for Remotion) |
| `scorm-assessment-builder` | `Read, Write, Glob` |
| `scorm-content-renderer` | `Read, Write, Glob, Grep` |
| `scorm-packager` | `Read, Write, Glob, Bash` (needs Bash for zip) |

#### 3. Choose Models Strategically

Not every agent needs the most powerful model:

| Agent | Recommended Model | Rationale |
|-------|-------------------|-----------|
| `scorm-interview` | `inherit` | Needs conversational intelligence |
| `scorm-instructional-designer` | `inherit` | Complex design decisions |
| `scorm-art-director` | `sonnet` | Creative but structured output |
| `scorm-visual-generator` | `sonnet` | Prompt construction is structured |
| `scorm-animation-creator` | `sonnet` | Code generation is structured |
| `scorm-assessment-builder` | `sonnet` | Question generation is structured |
| `scorm-content-renderer` | `inherit` | Complex HTML/JS generation |
| `scorm-packager` | `haiku` | Mostly mechanical tasks (manifest, zip) |

#### 4. Preload Skills into Agents

Use the `skills` field to inject relevant skill content directly. This avoids agents needing to discover and load skills at runtime:

```yaml
# scorm-visual-generator should preload nano-banana-pro
skills:
  - nano-banana-pro

# scorm-animation-creator should preload remotion-best-practices
skills:
  - remotion-best-practices

# scorm-content-renderer should preload scorm-generator
skills:
  - scorm-generator

# scorm-packager should preload scorm-generator
skills:
  - scorm-generator
```

#### 5. Agent Communication Patterns

Agents in Claude Code cannot directly communicate with each other (unlike Agent Teams). They communicate through **files on disk**:

```
Interview Agent → writes → specs/course_spec.md
                                    ↓
Instructional Designer → reads → specs/course_spec.md
                       → writes → specs/course_structure.md
                                    ↓
Art Director → reads → specs/course_spec.md
             → writes → art-direction/course_style.md
                                    ↓
Visual Generator → reads → art-direction/course_style.md
                 → writes → output/course/shared/assets/
```

This file-based handoff pattern is correct and should be formalized. Each agent should:
- Explicitly document what it reads (inputs)
- Explicitly document what it writes (outputs)
- Include input validation (check that required files exist before starting)

#### 6. Error Handling and Fallback Strategies

Each agent should include explicit error handling in its system prompt:

```markdown
## Error Handling

If you encounter errors:
1. **Missing input files**: Report which files are missing and what information is needed
2. **Tool failures**: Log the error, attempt an alternative approach, continue with what's possible
3. **Partial completion**: Save what you have, document what's incomplete, suggest next steps
4. **Never fail silently**: Always report issues back to the main conversation
```

#### 7. Enable Persistent Memory for Key Agents

Agents that learn from experience should have persistent memory:

```yaml
---
name: scorm-content-renderer
memory: project
---
```

This creates `.claude/agent-memory/scorm-content-renderer/` where the agent can store:
- Common patterns that work well
- CSS tricks for specific LMS platforms
- Accessibility patterns it discovers
- Issues encountered and solutions

---

## 2. Skill Architecture

### Current State Analysis

The project has 4 skills:
- `scorm-generator/` - SCORM API, manifest templates, packaging
- `course-builder/` - Instructional design methodology
- `nano-banana-pro/` - AI image generation
- `remotion-best-practices/` - Animation patterns

### Critical Finding: Missing YAML Frontmatter in Skills

**All 4 SKILL.md files are missing YAML frontmatter.** Like agents, skills REQUIRE frontmatter for proper discovery and invocation.

**Required frontmatter:**

```yaml
---
name: scorm-generator
description: SCORM packaging standards, API wrappers, manifest templates, and HTML/CSS/JS templates for creating LMS-compatible e-learning content. Use when building SCORM packages, creating lesson pages, quiz interfaces, or packaging content for LMS delivery.
---
```

### Skill Frontmatter Best Practices

#### 1. Description is the Discovery Mechanism

The `description` field is the ONLY thing Claude reads to decide if a skill is relevant. Everything about "when to use" MUST be in the description, not in the body. The body is only loaded after the skill is triggered.

**Current Problem**: Skills have "Triggers" and "When to Use" sections in the body, but Claude never sees these until the skill is already loaded. Move trigger information to the `description`.

#### 2. Recommended Frontmatter for Each Skill

```yaml
# scorm-generator/SKILL.md
---
name: scorm-generator
description: SCORM packaging standards, API wrappers, manifest templates, and content templates for creating LMS-ready e-learning packages. Use when generating imsmanifest.xml, creating lesson HTML pages, building quiz interfaces, packaging ZIP files, or implementing SCORM 1.2/2004 API calls. Includes templates for multiple-choice, true-false, fill-blank, and matching interactions.
---

# course-builder/SKILL.md
---
name: course-builder
description: Instructional design methodology using transformation-first backward design, Bloom's taxonomy, Gagne's Nine Events, and adult learning principles. Use when structuring courses, writing learning objectives, designing assessments, mapping content to cognitive levels, or creating curriculum for MENA/Arabic audiences with RTL support.
---

# nano-banana-pro/SKILL.md
---
name: nano-banana-pro
description: AI-powered image generation for e-learning content including course thumbnails, module headers, lesson illustrations, infographics, and icons. Use when generating visual assets, constructing image prompts, applying style presets, or creating placeholder images. Supports professional, illustration, isometric, minimal, vibrant, technical, and friendly style presets.
---

# remotion-best-practices/SKILL.md
---
name: remotion-best-practices
description: Animation and video creation patterns using Remotion framework for e-learning content. Use when creating intro/outro videos, text animations (typewriter, word reveal, highlight), scene transitions (fade, slide, wipe, zoom), chart animations, or CSS animation fallbacks. Includes timing guidelines, easing functions, and stagger patterns.
---
```

#### 3. Control Skill Invocation

Consider which skills should be user-invocable vs model-invocable:

| Skill | Model-invocable | User-invocable | Rationale |
|-------|-----------------|----------------|-----------|
| `scorm-generator` | Yes | No | Background knowledge, not a user action |
| `course-builder` | Yes | No | Background knowledge, not a user action |
| `nano-banana-pro` | Yes | Yes (`/nano-banana-pro`) | User might want to generate images directly |
| `remotion-best-practices` | Yes | No | Background knowledge |

For skills that should only be model-invoked:
```yaml
user-invocable: false
```

#### 4. Skill Size Management

Official recommendation: **Keep SKILL.md under 500 lines.** Move detailed reference to separate files.

**Current sizes (approximate):**
- `scorm-generator/SKILL.md`: ~104 lines (OK)
- `course-builder/SKILL.md`: ~174 lines (OK)
- `nano-banana-pro/SKILL.md`: ~178 lines (OK)
- `remotion-best-practices/SKILL.md`: ~319 lines (OK)

All skills are within the limit, which is good.

#### 5. Skill Resource Organization

The current resource structure is well-organized. The pattern of:
```
skill-name/
├── SKILL.md              # Main instructions
├── resources/            # Reusable code/assets
├── templates/            # File templates
├── scripts/              # Executable scripts
└── references/           # Detailed documentation
└── rules/                # Specific guidelines
```

This follows the recommended "progressive disclosure" pattern where SKILL.md stays concise and references deeper content only when needed.

#### 6. Reference Files from SKILL.md

Skills should explicitly reference their supporting files so Claude knows what's available:

```markdown
## Additional Resources

- For HTML templates, see the `templates/` directory
- For the SCORM API wrapper implementation, see `resources/scorm-api.js`
- For base CSS styles, see `resources/styles.css`
- For detailed curriculum design methodology, see `references/curriculum-design.md`
```

---

## 3. Command Design

### Current State Analysis

The project has one command: `.claude/commands/scorm.md` which orchestrates the entire 8-phase workflow.

### Critical Finding: Commands Are Now Skills

According to 2026 Claude Code documentation, **custom slash commands have been merged into skills.** Files in `.claude/commands/` still work, but skills are recommended since they support additional features like:
- Supporting files
- Frontmatter configuration
- Invocation control
- Subagent execution

The `/scorm` command should either:
1. Stay as a command (it works) and add frontmatter
2. Migrate to a skill at `.claude/skills/scorm/SKILL.md` for full capability

### Recommended: Add Frontmatter to /scorm Command

```yaml
---
name: scorm
description: Launch the complete SCORM content creation workflow through a structured interview and automated content generation pipeline.
disable-model-invocation: true
argument-hint: "[topic]"
---
```

Key decisions:
- **`disable-model-invocation: true`**: The user should explicitly start this workflow with `/scorm`. Claude shouldn't auto-trigger it.
- **`argument-hint: "[topic]"`**: Shows the user they can optionally provide a topic (Quick Start Mode).

### Phase Management Improvements

The current command attempts to orchestrate all 8 phases sequentially, which can be fragile. Recommendations:

#### 1. Add State Tracking

The command should track which phases are complete so it can resume if interrupted:

```markdown
## State Tracking

After each phase, save progress to `specs/[course-name]_progress.json`:

```json
{
  "courseName": "workplace-safety",
  "startedAt": "2026-02-06T10:00:00Z",
  "phases": {
    "interview": { "status": "complete", "output": "specs/workplace-safety_spec.md" },
    "design": { "status": "complete", "output": "specs/workplace-safety_structure.md" },
    "art-direction": { "status": "in-progress", "output": null },
    "visuals": { "status": "pending" },
    "animation": { "status": "skipped", "reason": "user opted out" },
    "assessment": { "status": "pending" },
    "rendering": { "status": "pending" },
    "packaging": { "status": "pending" }
  }
}
```

#### 2. Add Phase Confirmation Gates

Between phases, confirm with the user before proceeding:

```markdown
After completing each phase:
1. Show a summary of what was created
2. Ask: "Ready to proceed to [next phase]? (yes/no/edit)"
3. Allow user to review and edit outputs before continuing
```

#### 3. Support Parallel Phases

After art direction is complete, visual generation and animation creation can run in parallel (they don't depend on each other):

```
                    ┌→ scorm-visual-generator (images)
scorm-art-director ─┤
                    └→ scorm-animation-creator (videos)
```

This is already documented in the command but should be explicitly coded as parallel subagent invocations.

---

## 4. Settings Optimization

### Current Settings Analysis

```json
{
  "permissions": {
    "allow": [
      "Read", "Write", "Glob", "Grep", "AskUserQuestion", "Task",
      "Bash(python3 .claude/skills/nano-banana-pro/scripts/*)",
      "Bash(npx remotion *)",
      "Bash(zip -r *)",
      "Bash(mkdir -p *)",
      "Bash(cp *)",
      "Bash(ls *)",
      "Bash(cat *)"
    ]
  }
}
```

### Recommendations

#### 1. Add Missing Permission Patterns

The current settings are missing some useful permissions:

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Write",
      "Edit",
      "Glob",
      "Grep",
      "AskUserQuestion",
      "Task",
      "Skill",
      "Bash(python3 .claude/skills/nano-banana-pro/scripts/*)",
      "Bash(npx remotion *)",
      "Bash(zip -r *)",
      "Bash(mkdir -p *)",
      "Bash(cp *)",
      "Bash(ls *)",
      "Bash(mv *)",
      "Bash(rm output/*/shared/assets/images/placeholder*)",
      "Bash(node *)",
      "Bash(python3 *)",
      "Bash(open *)"
    ]
  }
}
```

Key additions:
- **`Edit`**: Currently missing. Needed for editing existing files
- **`Skill`**: Allow Claude to invoke skills
- **`Bash(mv *)`**: For moving/renaming files during packaging
- **`Bash(node *)`**: For running Node.js scripts
- **`Bash(python3 *)`**: Broader Python permission (current pattern is too narrow)
- **`Bash(open *)`**: For opening preview in browser

#### 2. Consider Using settings.local.json

Create `.claude/settings.local.json` for user-specific settings that shouldn't be committed:

```json
{
  "permissions": {
    "allow": [
      "Bash(open *)"
    ]
  }
}
```

#### 3. Hook Configurations

Add hooks to improve the workflow:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'File written: $TOOL_INPUT_PATH'"
          }
        ]
      }
    ],
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude Code needs attention\" with title \"SCORM Studio\"'"
          }
        ]
      }
    ]
  }
}
```

The Notification hook is particularly useful for long-running asset generation phases.

#### 4. MCP Server Integrations

Consider adding MCP servers that could enhance the pipeline:

| MCP Server | Use Case |
|------------|----------|
| `@anthropic/mcp-server-filesystem` | Enhanced file operations |
| `@anthropic/mcp-server-puppeteer` | Browser preview of generated HTML |
| Image generation API | Replace placeholder images with real AI-generated ones |
| `supabase` (already configured) | Could store course specs and progress in a database |

---

## 5. Project Organization

### Current Structure Analysis

```
scorm-projects/
├── CLAUDE.md                    # Project instructions
├── .claude/
│   ├── settings.json            # Permissions
│   ├── commands/scorm.md        # /scorm command
│   ├── skills/                  # 4 skills
│   │   ├── scorm-generator/
│   │   ├── course-builder/
│   │   ├── nano-banana-pro/
│   │   └── remotion-best-practices/
│   └── agents/                  # 8 agents
├── output/                      # Generated packages
├── specs/                       # Course specifications
└── art-direction/               # Visual style guides
```

### Recommended Improvements

#### 1. Add `.claude/agent-memory/` Directory

Enable persistent memory for agents that benefit from learning:

```
.claude/
└── agent-memory/
    ├── scorm-content-renderer/
    │   └── MEMORY.md
    └── scorm-packager/
        └── MEMORY.md
```

#### 2. Add a Templates/Examples Directory

```
scorm-projects/
├── examples/
│   ├── sample_spec.md           # Example specification
│   ├── sample_structure.md      # Example learning structure
│   └── sample_style.md          # Example style guide
```

This gives agents concrete examples of expected output format.

#### 3. Add Quality Reference from Existing Output

The project already has generated output (blockchain-journey, moon-phases, newton-first-law). Reference the best one as a quality benchmark:

```
specs/
├── quality-reference/
│   └── moon-phases_reference.md   # "This is what good output looks like"
```

#### 4. Consider a Plans Directory

```
.claude/
└── plans/
    └── active-plan.md    # Current work plan for context persistence
```

Plans stored on disk survive `/clear` and `/compact`, maintaining project roadmap even when context is refreshed.

---

## 6. Team Coordination

### When to Use Agent Teams vs Subagents

| Approach | Best For | SCORM Studio Use |
|----------|----------|------------------|
| **Subagents** | Independent tasks, quick focused work | Most phases (interview, design, etc.) |
| **Agent Teams** | Parallel work with inter-agent communication | Visual + Animation generation, Content + Assessment building |

### Recommended Pipeline Architecture

The SCORM pipeline has both sequential and parallel phases:

```
SEQUENTIAL PHASE (Subagents)
─────────────────────────────
1. Interview Agent (subagent)
      ↓ spec.md
2. Instructional Designer (subagent)
      ↓ structure.md
3. Art Director (subagent)
      ↓ style.md

PARALLEL PHASE (Agent Team or parallel subagents)
────────────────────────────────────────────────
4a. Visual Generator ──┐
4b. Animation Creator ─┤── (can run simultaneously)
4c. Assessment Builder ─┘

SEQUENTIAL PHASE (Subagents)
─────────────────────────────
5. Content Renderer (subagent, needs all above outputs)
      ↓ HTML/CSS/JS
6. Packager (subagent)
      ↓ ZIP
```

### Task Dependency Management

For the parallel phase, use the Task system:

```
Task 1: Generate visual assets (blocked by: art direction)
Task 2: Create animations (blocked by: art direction)
Task 3: Build assessments (blocked by: instructional design)
Task 4: Render content (blocked by: Tasks 1, 2, 3)
Task 5: Package SCORM (blocked by: Task 4)
```

### Parallel Execution Strategy

For phases 4a-4c, there are two approaches:

**Option A: Parallel Subagents (Simpler)**
```
Use three subagents to work simultaneously:
1. Visual Generator to create images
2. Animation Creator to create videos
3. Assessment Builder to create quizzes
```

**Option B: Agent Team (More Coordinated)**
Use an Agent Team when the parallel workers need to communicate, e.g., the assessment builder needs to know what visuals are available.

For SCORM Studio, Option A (parallel subagents) is likely sufficient since these agents work independently on different output directories.

---

## 7. CLAUDE.md Optimization

### Current CLAUDE.md Analysis

The current CLAUDE.md is **247 lines** and is well-structured with:
- Project overview
- Team description (agents and skills)
- Workflow diagram
- Interview phases
- Output structure
- Technical standards
- Testing instructions

### Recommendations

#### 1. Keep CLAUDE.md Concise (Under 500 lines)

The current file is within limits. However, much of the content (interview phases, output structure, SCORM technical standards) is duplicated in the agent and skill files. CLAUDE.md should focus on:
- **What**: High-level project description
- **Why**: Purpose and goals
- **How**: Key commands and workflow
- **Where**: File locations and conventions

Detailed domain knowledge belongs in skills and agent prompts.

#### 2. Add Key Commands Section

```markdown
## Key Commands

| Command | Description |
|---------|-------------|
| `/scorm` | Start the full SCORM creation workflow |
| `/scorm [topic]` | Quick start with a topic |
```

#### 3. Add Conventions Section

```markdown
## Conventions

- Course specifications: `specs/[course-slug]_spec.md`
- Learning structures: `specs/[course-slug]_structure.md`
- Style guides: `art-direction/[course-slug]_style.md`
- Output: `output/[course-slug]/`
- File naming: lowercase, hyphens, no spaces
- SCORM version: Default to 1.2 unless user requests 2004
```

#### 4. Remove Duplicated Content

Consider moving these sections out of CLAUDE.md (they exist in agent/skill files):
- Detailed interview phases (already in `scorm-interview` agent)
- SCORM API details (already in `scorm-generator` skill)
- Output structure details (already in agents)

Replace with brief pointers:
```markdown
## Interview Process
See the `scorm-interview` agent for the full 7-phase interview methodology.
For instructional design principles, see the `course-builder` skill.
```

#### 5. Add Quality Standards Section

```markdown
## Quality Standards
- WCAG 2.1 AA accessibility compliance
- Responsive design (mobile-first)
- Cross-browser compatibility
- Self-contained packages (no external dependencies)
- Valid XML manifests with proper namespaces
```

---

## 8. Specific Recommendations for SCORM Content Studio

### Priority 1: Add Frontmatter to All Agents (Critical)

This is the most impactful change. Without frontmatter, agents cannot be properly discovered or delegated to by Claude. Each agent needs:

```yaml
---
name: [agent-name]
description: [detailed description of capabilities and triggers]
tools: [appropriate tool list]
model: [appropriate model]
skills: [relevant skills to preload]
---
```

### Priority 2: Add Frontmatter to All Skills (Critical)

Same issue - skills need frontmatter for discovery:

```yaml
---
name: [skill-name]
description: [what it does AND when to use it - this is the discovery mechanism]
---
```

### Priority 3: Add Frontmatter to /scorm Command (Important)

```yaml
---
name: scorm
description: Launch the SCORM content creation workflow
disable-model-invocation: true
argument-hint: "[topic]"
---
```

### Priority 4: Update Settings (Important)

Add missing tool permissions (`Edit`, `Skill`) and consider notification hooks.

### Priority 5: Add State Tracking (Enhancement)

Implement progress tracking so the workflow can resume if interrupted.

### Priority 6: Enable Agent Memory (Enhancement)

Add persistent memory for content-renderer and packager agents.

### Priority 7: Optimize CLAUDE.md (Enhancement)

Remove duplicated content, add conventions section, keep it concise.

---

## Research Sources

- [Claude Code: Best practices for agentic coding (Anthropic)](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Extend Claude with skills - Official Docs](https://code.claude.com/docs/en/skills)
- [Create custom subagents - Official Docs](https://code.claude.com/docs/en/sub-agents)
- [Hooks reference - Official Docs](https://code.claude.com/docs/en/hooks)
- [Skill authoring best practices - Official Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Agent Skills deep dive (Lee Han Chung)](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)
- [Using CLAUDE.MD files (Anthropic Blog)](https://claude.com/blog/using-claude-md-files)
- [Best practices for Claude Code subagents (PubNub)](https://www.pubnub.com/blog/best-practices-for-claude-code-sub-agents/)
- [Subagent Pipelines Part II (PubNub)](https://www.pubnub.com/blog/best-practices-claude-code-subagents-part-two-from-prompts-to-pipelines/)
- [Writing a good CLAUDE.md (HumanLayer)](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- [The Complete Guide to CLAUDE.md (Builder.io)](https://www.builder.io/blog/claude-md-guide)
- [Claude Code Customization Guide (alexop.dev)](https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/)
- [Orchestrate teams of Claude Code sessions - Official Docs](https://code.claude.com/docs/en/agent-teams)
- [Equipping agents for the real world with Agent Skills (Anthropic)](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Best Practices for Claude Code - Official Docs](https://code.claude.com/docs/en/best-practices)
- [How I Use Every Claude Code Feature (blog.sshh.io)](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)
- [Optimizing Agentic Coding (AIMultiple)](https://research.aimultiple.com/agentic-coding/)
- [Claude Code Hooks Mastery (GitHub)](https://github.com/disler/claude-code-hooks-mastery)
- [Claude Code Hooks Guide (DataCamp)](https://www.datacamp.com/tutorial/claude-code-hooks)

---

## Summary of Findings

### What's Working Well
1. **Skill resource organization** - Templates, scripts, references are well-structured
2. **Skill content quality** - Skills contain rich, actionable domain knowledge
3. **Agent specialization** - Clear separation of concerns across 8 agents
4. **Workflow design** - The sequential pipeline with parallel phases is sound
5. **Template quality** - HTML templates are accessible, responsive, well-structured
6. **SCORM API wrapper** - Solid implementation covering both 1.2 and 2004

### What Needs Immediate Attention
1. **Missing frontmatter on ALL agents** - Agents cannot be properly discovered or delegated to
2. **Missing frontmatter on ALL skills** - Skills cannot be properly triggered by Claude
3. **Missing `Edit` permission** in settings.json
4. **Missing `Skill` permission** in settings.json
5. **No state/progress tracking** - Workflow can't resume if interrupted

### What Would Make It Great
1. **Preload skills into agents** via the `skills` frontmatter field
2. **Model routing** per agent based on task complexity
3. **Persistent agent memory** for content renderer and packager
4. **Notification hooks** for long-running phases
5. **Phase confirmation gates** between workflow stages
6. **Quality reference examples** from best existing output
7. **CLAUDE.md de-duplication** to keep context efficient
