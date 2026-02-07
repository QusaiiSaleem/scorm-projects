# Learning Structure: Computational Thinking (Chapter 1)

## Course Overview

- **Course Title:** Computational Thinking -- Chapter 1 (التفكير الحاسوبي -- الوحدة الأولى)
- **Total Duration:** ~2.5 hours (150 minutes)
- **SCOs:** 18
- **Modules:** 3 logical groups (Orientation, Core Concepts, Application & Assessment)
- **Assessments:** 2 formal (Pre-test, Post-test) + 7 interactive activity SCOs with embedded checks
- **SCORM Version:** 1.2
- **LMS Target:** Moodle
- **Theme:** Technical Dark (code editor aesthetic)
- **Language:** Bilingual Arabic (primary) / English (technical terms)

---

## Learning Objectives -- Bloom's Taxonomy Mapping

### Course-Level Terminal Objectives (Chapter 1)

| # | Objective (English) | Objective (Arabic) | Bloom's Level |
|---|--------------------|--------------------|---------------|
| TO-1 | Apply computational thinking principles to break down complex problems | تطبيق مبادئ التفكير الحاسوبي لتحليل المسائل المعقدة | Apply |
| TO-2 | Use logical and algorithmic thinking to design solutions | استخدام التفكير المنطقي والخوارزمي لتصميم الحلول | Apply |
| TO-3 | Control algorithm execution through iteration and selection | التحكم في تنفيذ الخوارزميات باستخدام التكرار والاختيار | Apply |
| TO-4 | Examine and evaluate algorithms for correctness | فحص وتقييم الخوارزميات للتحقق من صحتها | Evaluate |

### Enabling Objectives per SCO

| SCO | Enabling Objective | Bloom's Level | Supports TO |
|-----|-------------------|---------------|-------------|
| 01 | Identify the learning objectives for Chapter 1 | Remember | All |
| 02 | Describe the learning path and how topics connect | Understand | All |
| 03 | Recall prior knowledge related to problem-solving and logic | Remember | All (diagnostic) |
| 04 | Explain what computational thinking is and its four pillars | Understand | TO-1 |
| 05 | Reference computational thinking definitions and frameworks (PDF) | Remember | TO-1 |
| 06 | Describe logical thinking and its role in CT (via video) | Understand | TO-2 |
| 07 | Differentiate between the four pillars of computational thinking | Analyze | TO-1 |
| 08 | Apply logical reasoning to evaluate statements and arguments | Apply | TO-2 |
| 09 | Construct simple algorithms using step-by-step instructions | Apply | TO-2 |
| 10 | Explain how iteration and selection control algorithm flow | Understand | TO-3 |
| 11 | Reference iteration and selection patterns (PDF) | Remember | TO-3 |
| 12 | Demonstrate iteration by tracing loops through examples | Apply | TO-3 |
| 13 | Demonstrate selection by tracing conditional branches | Apply | TO-3 |
| 14 | Trace a complete algorithm using iteration and selection together | Apply | TO-3, TO-4 |
| 15 | Evaluate common algorithmic mistakes and edge cases | Evaluate | TO-4 |
| 16 | Examine an algorithm for correctness and propose fixes | Evaluate | TO-4 |
| 17 | Summarize the key concepts of computational thinking | Understand | All |
| 18 | Demonstrate mastery of all Chapter 1 objectives | Apply/Evaluate | All |

---

## Module Structure

### Module A: Orientation (SCOs 01-03)
**Purpose:** Set expectations, map the journey, diagnose prior knowledge.

### Module B: Core Concepts (SCOs 04-09)
**Purpose:** Build foundational understanding of CT, logical thinking, and algorithmic thinking.

### Module C: Algorithm Control & Application (SCOs 10-18)
**Purpose:** Apply iteration and selection, evaluate algorithms, prove mastery.

---

## Detailed SCO Specifications

---

### SCO 01: Learning Objectives Infographic

**SCO ID:** `sco_01_objectives`
**Type:** Infographic (انفوجرافيك)
**Duration:** 3 minutes
**Enabling Objective:** Identify the learning objectives for Chapter 1
**Bloom's Level:** Remember

**Content Structure (Gagne's Events):**

1. **Gain Attention** (20 sec)
   - Terminal-style boot sequence animation: "Loading: Computational Thinking v1.0..."
   - Dark screen with green cursor blinking, then objectives "compile" onto screen

2. **Inform Objectives** (20 sec)
   - "By the end of this chapter, you will be able to..." statement
   - Four terminal objectives displayed as a code block with syntax highlighting

3. **Stimulate Recall** (30 sec)
   - "Have you ever solved a puzzle step by step?" connecting everyday logic to CT

4. **Present Content** (1.5 min)
   - Visual infographic showing all 4 terminal objectives
   - Each objective has an icon, a brief description, and the Bloom's verb highlighted
   - Color-coded by module grouping (Core Concepts = cyan, Algorithm Control = orange)

5. **Enhance Retention** (30 sec)
   - "Keep these objectives in mind as you progress -- they are your compass."
   - Preview of what is coming next (Learning Map)

**Content Types Used:**
- [x] Text content (objective statements)
- [x] Image/Infographic (visual objective cards)
- [ ] Video/Animation
- [x] Interactive element (click-to-reveal objective details)
- [ ] Quiz/Assessment

**Interactive Components:**
- `labeled-graphic` -- objectives displayed as labeled nodes in a circuit-board diagram
- `click-reveal` -- click each objective to see its detailed description

**Assets Required:**
- [ ] Circuit-board background SVG
- [ ] 4 objective icons (decomposition, logic, algorithm, evaluation)
- [ ] Arabic/English bilingual text for all objectives

---

### SCO 02: Learning Map Infographic

**SCO ID:** `sco_02_learning_map`
**Type:** Infographic (انفوجرافيك)
**Duration:** 3 minutes
**Enabling Objective:** Describe the learning path and how topics connect
**Bloom's Level:** Understand

**Content Structure (Gagne's Events):**

1. **Gain Attention** (20 sec)
   - Animated map "rendering" on screen like a GPS route loading

2. **Inform Objectives** (15 sec)
   - "Here is your learning journey for Chapter 1"

3. **Present Content** (2 min)
   - Interactive journey map showing all 18 SCOs as stops on a path
   - Three module zones with color coding
   - Estimated time per section
   - Content type icons (video, quiz, activity, lecture)

4. **Provide Guidance** (30 sec)
   - Navigation tips: how to move between SCOs in Moodle
   - Grading policy: Pre-test is diagnostic (ungraded), Post-test is 70% pass
   - Points system explanation

5. **Enhance Retention** (15 sec)
   - "Bookmark this map -- you can return to it anytime."

**Content Types Used:**
- [x] Text content
- [x] Image/Infographic (journey map)
- [ ] Video/Animation
- [x] Interactive element (clickable map nodes)
- [ ] Quiz/Assessment

**Interactive Components:**
- `progress-journey` -- the 18-stop journey map visualization
- `tabs` -- "Overview | Grading | Tips" information tabs

**Assets Required:**
- [ ] Journey map SVG/CSS illustration
- [ ] Content type icons (6 types)
- [ ] Module zone color scheme

---

### SCO 03: Diagnostic Pre-test

**SCO ID:** `sco_03_pretest`
**Type:** Pre-test (اختبار قبلي)
**Duration:** 10 minutes
**Enabling Objective:** Recall prior knowledge related to problem-solving and logic
**Bloom's Level:** Remember

**Content Structure (Gagne's Events):**

1. **Gain Attention** (15 sec)
   - "Let's see what you already know -- no pressure, this is just for you."

2. **Inform Objectives** (15 sec)
   - "This diagnostic test helps us understand your starting point."
   - Clearly state: NOT graded, no impact on final score

3. **Present Content** (8 min)
   - 10 diagnostic questions covering all 4 terminal objectives

4. **Provide Feedback** (1 min)
   - Summary of areas of strength and areas to focus on
   - Growth mindset message: "Whatever your score, this chapter will help you grow."

5. **Enhance Retention** (30 sec)
   - "Now you know where you stand. Let's begin building your skills!"

**Question Plan:**

| # | Objective Tested | Bloom's | Type | Topic | Difficulty |
|---|-----------------|---------|------|-------|------------|
| 1 | TO-1 | Remember | MCQ | Define computational thinking | Easy |
| 2 | TO-1 | Remember | TF | CT pillars identification | Easy |
| 3 | TO-1 | Understand | MCQ | Decomposition example | Easy |
| 4 | TO-2 | Remember | MCQ | Define logical thinking | Easy |
| 5 | TO-2 | Understand | MCQ | Identify a valid logical argument | Medium |
| 6 | TO-2 | Remember | Matching | Match CT concepts to definitions | Medium |
| 7 | TO-3 | Remember | MCQ | Define iteration | Easy |
| 8 | TO-3 | Remember | MCQ | Define selection | Easy |
| 9 | TO-3 | Understand | MCQ | Identify loop vs. condition in pseudocode | Medium |
| 10 | TO-4 | Understand | MCQ | Spot an error in a simple algorithm | Medium |

**SCORM Tracking:**
- `cmi.core.score.raw` -- raw score (0-100)
- `cmi.core.lesson_status` -- "completed" (always, regardless of score)
- `cmi.interactions.n.*` -- each question response
- Score is diagnostic only -- does NOT count toward final grade

**Interactive Components:**
- `per-choice-feedback` -- MCQ with per-option feedback explaining why each choice is right/wrong
- `matching-dropdown` -- for the matching question (Q6)

---

### SCO 04: Interactive Lecture -- Computational Thinking

**SCO ID:** `sco_04_lecture_ct`
**Type:** Interactive Lecture (محاضرة تفاعلية)
**Duration:** 12 minutes
**Enabling Objective:** Explain what computational thinking is and its four pillars
**Bloom's Level:** Understand

**Content Structure (Gagne's Events):**

1. **Gain Attention** (30 sec)
   - Scenario: "Imagine you need to organize 10,000 books in a library. Where do you start?"
   - Terminal animation: problem statement appearing line by line

2. **Inform Objectives** (20 sec)
   - "By the end of this lesson, you will be able to explain what computational thinking is and identify its four pillars."

3. **Stimulate Recall** (1 min)
   - "Think about the last time you solved a complex problem. What steps did you take?"
   - Connect everyday problem-solving to formal CT

4. **Present Content** (6 min)
   - **Slide 1:** What is Computational Thinking? (definition + origin -- Jeanette Wing)
   - **Slide 2:** The Four Pillars overview
   - **Slide 3:** Decomposition -- breaking problems into parts
   - **Slide 4:** Pattern Recognition -- finding similarities
   - **Slide 5:** Abstraction -- focusing on what matters
   - **Slide 6:** Algorithmic Thinking -- step-by-step solutions
   - Content type: Text + diagrams + code-styled callouts

5. **Provide Guidance** (2 min)
   - Real-world examples for each pillar
   - "Why This Matters" block: how software engineers use CT daily
   - Analogies: CT is like a chef's recipe process

6. **Elicit Performance** (1 min)
   - Embedded knowledge check: "Which pillar involves ignoring irrelevant details?"

7. **Provide Feedback** (30 sec)
   - Immediate feedback on knowledge check with explanation

8. **Enhance Retention** (1 min)
   - Visual summary card of the four pillars
   - "Next: Download the PDF reference for these concepts"

**Content Types Used:**
- [x] Text content (definitions, explanations)
- [x] Image/Infographic (four pillars diagram)
- [ ] Video/Animation
- [x] Interactive element (click-to-reveal pillar details, knowledge check)
- [x] Quiz/Assessment (embedded knowledge check, 2 questions)

**Interactive Components:**
- `tabs` -- one tab per pillar with definition + example
- `flip-card` -- front = pillar name, back = real-world example
- `click-reveal` -- "See the example" reveals a scenario
- `per-choice-feedback` -- embedded knowledge check MCQ

**Assets Required:**
- [ ] Four pillars diagram (decomposition, pattern recognition, abstraction, algorithmic thinking)
- [ ] Real-world scenario illustrations (3-4)
- [ ] Jeanette Wing attribution callout

---

### SCO 05: PDF Lecture -- Computational Thinking

**SCO ID:** `sco_05_pdf_ct`
**Type:** PDF Lecture (محاضرة PDF)
**Duration:** 5 minutes
**Enabling Objective:** Reference computational thinking definitions and frameworks
**Bloom's Level:** Remember

**Content Structure:**

1. **Present Content** (4 min)
   - Embedded PDF viewer showing the CT reference document
   - Downloadable PDF link
   - Key sections: definitions, the four pillars, examples, further reading

2. **Enhance Retention** (1 min)
   - "Save this PDF for future reference. It covers everything from the interactive lecture."
   - Link to next SCO: Motion Video on Logical Thinking

**Content Types Used:**
- [x] Text content (PDF companion text)
- [x] Image/Infographic (PDF document)
- [ ] Video/Animation
- [x] Interactive element (PDF viewer with zoom/download)
- [ ] Quiz/Assessment

**Interactive Components:**
- `scroll-panel` -- embedded PDF-style scrollable content viewer
- `button-set` -- download PDF button

**Assets Required:**
- [ ] CT reference PDF document (Arabic/English bilingual)
- [ ] Download icon SVG

---

### SCO 06: Motion Video -- Logical Thinking

**SCO ID:** `sco_06_video_logical`
**Type:** Motion Video (فيديو موشن)
**Duration:** 8 minutes (video: 6 min + interaction: 2 min)
**Enabling Objective:** Describe logical thinking and its role in CT
**Bloom's Level:** Understand

**Content Structure (Gagne's Events):**

1. **Gain Attention** (built into video)
   - Video opens with: "Is this argument valid? All cats are animals. Fluffy is a cat. Therefore..."

2. **Inform Objectives** (video, 15 sec)
   - "After watching, you will be able to describe how logical thinking powers computational thinking."

3. **Present Content** (5 min video)
   - Motion graphics explaining:
     - What is logical thinking?
     - Types of logic: deductive, inductive
     - Logical operators: AND, OR, NOT
     - How logic connects to programming (if/then)
   - Arabic narration with English subtitles
   - Max 6 minutes (NELC compliant -- under 10 min)

4. **Elicit Performance** (1.5 min, post-video)
   - 2 quick knowledge check questions about the video content
   - "Based on what you just watched..."

5. **Provide Feedback** (30 sec)
   - Feedback on knowledge check responses

**Content Types Used:**
- [x] Text content (subtitles, post-video summary)
- [ ] Image/Infographic
- [x] Video/Animation (motion graphics explainer, max 6 min)
- [x] Interactive element (video player controls, post-video check)
- [x] Quiz/Assessment (2-question knowledge check)

**Interactive Components:**
- Video player (HTML5 `<video>` with custom controls)
- `per-choice-feedback` -- post-video knowledge check

**Assets Required:**
- [ ] Motion video MP4 (max 6 min, H.264)
- [ ] Arabic audio track
- [ ] English + Arabic subtitle files (VTT)
- [ ] Video thumbnail image

**NELC Compliance Notes:**
- Video under 10 minutes
- Objective summary at video end
- Subtitles in both languages

---

### SCO 07: Interactive Activity -- What is Computational Thinking?

**SCO ID:** `sco_07_activity_ct`
**Type:** Interactive Activity (نشاط تفاعلي)
**Duration:** 8 minutes
**Enabling Objective:** Differentiate between the four pillars of computational thinking
**Bloom's Level:** Analyze

**Content Structure (Gagne's Events):**

1. **Gain Attention** (30 sec)
   - "You have learned the four pillars. Now, can you APPLY them?"
   - Challenge framing: "Sort real-world scenarios into their correct CT pillar"

2. **Inform Objectives** (15 sec)
   - "In this activity, you will classify problems by which CT pillar they use."

3. **Stimulate Recall** (30 sec)
   - Quick visual recap: the four pillars with one-word definitions

4. **Present Content / Elicit Performance** (5 min)
   - **Activity 1: Drag-and-Drop Categorization** (3 min)
     - 8 real-world scenarios presented as cards
     - 4 category zones (Decomposition, Pattern Recognition, Abstraction, Algorithmic Thinking)
     - Learner drags each scenario to the correct pillar
     - Examples:
       - "Breaking a recipe into steps" -> Decomposition
       - "Noticing that all login forms look similar" -> Pattern Recognition
       - "Ignoring font color when comparing text content" -> Abstraction
       - "Writing step-by-step directions to your house" -> Algorithmic Thinking

   - **Activity 2: Flip Card Matching** (2 min)
     - 8 flip cards (4 pairs): pillar name on front, description on back
     - Learner flips to match pillar with its correct description
     - Memory-style matching game

5. **Provide Feedback** (1 min)
   - Immediate feedback on each drag-drop placement
   - Score summary: "You correctly classified X/8 scenarios"
   - Growth mindset: "Every mistake teaches you something new about CT"

6. **Enhance Retention** (30 sec)
   - "You can now distinguish the four pillars. Next: let's practice logical thinking!"

**Content Types Used:**
- [x] Text content (scenario descriptions)
- [x] Image/Infographic (pillar category icons)
- [ ] Video/Animation
- [x] Interactive element (drag-drop + flip cards)
- [x] Quiz/Assessment (scored activity)

**Recommended Interactive Components:**
- `drag-drop` -- 8 scenario cards dragged to 4 pillar zones
- `memory-match` -- match pillar names to descriptions (4 pairs)
- `callout` -- "Why This Matters" block connecting CT to real CS careers

**Gamification:**
- 10 points per correct drag-drop placement (80 max)
- 20 points per correct memory match (80 max)
- Bonus: 50 points for completing both activities with 100% accuracy
- Celebration animation on full completion

**Assets Required:**
- [ ] 4 pillar zone icons (styled as IDE panels)
- [ ] 8 scenario card texts (bilingual)
- [ ] Memory match card graphics

---

### SCO 08: Interactive Activity -- Logical Thinking

**SCO ID:** `sco_08_activity_logic`
**Type:** Interactive Activity (نشاط تفاعلي)
**Duration:** 8 minutes
**Enabling Objective:** Apply logical reasoning to evaluate statements and arguments
**Bloom's Level:** Apply

**Content Structure (Gagne's Events):**

1. **Gain Attention** (30 sec)
   - "Detective mode: ON. Can you spot which arguments are logically valid?"
   - Terminal-style prompt: `> evaluate --logic "argument.txt"`

2. **Inform Objectives** (15 sec)
   - "You will practice evaluating logical arguments and using logical operators."

3. **Stimulate Recall** (30 sec)
   - Quick recap: deductive logic, AND/OR/NOT from the video

4. **Present Content / Elicit Performance** (5.5 min)
   - **Activity 1: Truth Table Builder** (2.5 min)
     - Interactive truth table for AND, OR, NOT
     - Learner fills in missing values
     - Styled as a code terminal output
     - Auto-checks each cell

   - **Activity 2: Argument Validator** (3 min)
     - 6 logical arguments presented
     - Learner classifies each as "Valid" or "Invalid"
     - Uses branching scenario format:
       - "All programmers use logic. Ahmed is a programmer. Therefore, Ahmed uses logic." -> Valid
       - "All cats are animals. Rex is an animal. Therefore, Rex is a cat." -> Invalid
     - Detailed explanation after each answer

5. **Provide Feedback** (1 min)
   - Score and explanation for incorrect answers
   - "A common trap is affirming the consequent -- watch out for this!"

6. **Enhance Retention** (30 sec)
   - Key takeaway card: "Valid logic follows structure, not just truth of statements"
   - Connection to next activity: algorithmic thinking

**Content Types Used:**
- [x] Text content (logical arguments)
- [x] Image/Infographic (truth table visualization)
- [ ] Video/Animation
- [x] Interactive element (truth table builder + argument validator)
- [x] Quiz/Assessment (embedded scoring)

**Recommended Interactive Components:**
- `fill-blank` -- truth table with blank cells to fill (styled as a code terminal)
- `branching-scenario` -- present argument, learner chooses Valid/Invalid, gets feedback
- `per-choice-feedback` -- for argument validation with detailed explanations per choice
- `callout` -- key logical fallacy warnings

**Gamification:**
- 15 points per correct truth table cell (90 max for 6 cells)
- 20 points per correct argument evaluation (120 max for 6 arguments)
- Streak bonus: 3+ correct in a row = 50 bonus points

**Assets Required:**
- [ ] Truth table template (AND, OR, NOT)
- [ ] 6 logical argument texts (bilingual)
- [ ] Logical fallacy reference card

---

### SCO 09: Interactive Activity -- Algorithmic Thinking

**SCO ID:** `sco_09_activity_algo`
**Type:** Interactive Activity (نشاط تفاعلي)
**Duration:** 10 minutes
**Enabling Objective:** Construct simple algorithms using step-by-step instructions
**Bloom's Level:** Apply

**Content Structure (Gagne's Events):**

1. **Gain Attention** (30 sec)
   - "Can you write an algorithm to make a cup of tea? It is harder than you think..."
   - Show a humorous "bad algorithm" example: robot taking instructions too literally

2. **Inform Objectives** (15 sec)
   - "You will build algorithms by arranging steps in the correct order."

3. **Stimulate Recall** (30 sec)
   - "An algorithm is a precise, step-by-step procedure. Remember the four pillars?"

4. **Present Content / Elicit Performance** (7 min)
   - **Activity 1: Step Sequencing** (3 min)
     - Given a problem: "How to search for a word in a dictionary"
     - 8 scrambled steps provided
     - Learner drags steps into the correct order
     - Algorithm: Open dictionary -> Estimate letter position -> Turn to page -> Check if word is before/after -> Adjust -> Repeat until found -> Read definition -> Close dictionary

   - **Activity 2: Algorithm Builder** (4 min)
     - Word bank of algorithm components (actions, conditions, loops)
     - Learner constructs a simple algorithm from available pieces
     - Problem: "Find the largest number in a list"
     - Components: "Set max = first number", "For each number in list", "If number > max", "Set max = number", "Return max"
     - Code-playground style: drag components into a code editor panel

5. **Provide Feedback** (1.5 min)
   - Step-by-step comparison showing correct order vs. learner's order
   - Explanation of WHY order matters (each step depends on the previous)

6. **Enhance Retention** (30 sec)
   - "You just wrote your first algorithms! Next: how do we control their execution?"

**Content Types Used:**
- [x] Text content (problem statements, step descriptions)
- [x] Image/Infographic (algorithm flowchart)
- [ ] Video/Animation
- [x] Interactive element (sequence sort + word bank algorithm builder)
- [x] Quiz/Assessment (scored correctness)

**Recommended Interactive Components:**
- `sequence-sort` -- drag 8 steps into correct order for dictionary search algorithm
- `word-bank` -- drag algorithm components into code editor to build "find max" algorithm
- `labeled-graphic` -- show the completed algorithm as a flowchart after correct assembly
- `callout` -- "Pro Tip: Test your algorithm with edge cases"

**Gamification:**
- 10 points per step in correct position (80 max for sequence sort)
- 15 points per correct component placement (75 max for algorithm builder)
- Perfect order bonus: 50 points each activity (100 max bonus)
- Code compilation celebration animation for correct algorithm

**Assets Required:**
- [ ] Dictionary search step cards (8 steps, bilingual)
- [ ] "Find max" algorithm components (5 pieces)
- [ ] Flowchart illustration of completed algorithm
- [ ] Code editor styling (monospace font, line numbers, syntax colors)

---

### SCO 10: Interactive Lecture -- Controlling Algorithm Execution

**SCO ID:** `sco_10_lecture_control`
**Type:** Interactive Lecture (محاضرة تفاعلية)
**Duration:** 12 minutes
**Enabling Objective:** Explain how iteration and selection control algorithm flow
**Bloom's Level:** Understand

**Content Structure (Gagne's Events):**

1. **Gain Attention** (30 sec)
   - "What if your algorithm needs to repeat something 1000 times? Or make a decision?"
   - Animation: a robot at a fork in the road (selection) and a runner on a track (iteration)

2. **Inform Objectives** (20 sec)
   - "You will learn how iteration (loops) and selection (conditions) control algorithm flow."

3. **Stimulate Recall** (1 min)
   - Recall from SCO 09: "You built algorithms with sequential steps. But what about branching and repeating?"

4. **Present Content** (6 min)
   - **Slide 1:** Introduction to control flow (sequential -> branching -> looping)
   - **Slide 2:** Selection (if/else) -- definition, syntax, flowchart
   - **Slide 3:** Selection examples (even/odd check, grade classification)
   - **Slide 4:** Iteration (for, while) -- definition, syntax, flowchart
   - **Slide 5:** Iteration examples (counting, summing, searching)
   - **Slide 6:** Combining iteration + selection (filter a list, find max with conditions)

5. **Provide Guidance** (2 min)
   - Comparison table: when to use iteration vs. selection
   - Common patterns: "Process each item" (iteration), "Choose a path" (selection)
   - Flowchart templates

6. **Elicit Performance** (1.5 min)
   - Embedded knowledge check: 3 questions
     - "Which control structure repeats a block of code?" (Iteration)
     - "What does an if/else statement do?" (Selection)
     - Trace a simple pseudocode snippet with a loop

7. **Provide Feedback** (30 sec)
   - Explanations for each knowledge check answer

8. **Enhance Retention** (30 sec)
   - Visual summary: flowchart showing all three flow types (sequential, selection, iteration)
   - "Next: download the reference PDF, then practice these with activities!"

**Content Types Used:**
- [x] Text content (definitions, pseudocode examples)
- [x] Image/Infographic (flowcharts, comparison table)
- [ ] Video/Animation
- [x] Interactive element (tabs, click-reveal, knowledge check)
- [x] Quiz/Assessment (3-question knowledge check)

**Interactive Components:**
- `accordion` -- expand/collapse sections for each control flow type
- `tabs` -- "Selection | Iteration | Combined" with examples in each
- `per-choice-feedback` -- embedded knowledge check
- `flip-card` -- front: pseudocode snippet, back: flowchart equivalent

**Assets Required:**
- [ ] Control flow flowcharts (sequential, selection, iteration)
- [ ] Pseudocode examples (styled as code blocks)
- [ ] Comparison table graphic

---

### SCO 11: PDF Lecture -- Controlling Algorithm Execution

**SCO ID:** `sco_11_pdf_control`
**Type:** PDF Lecture (محاضرة PDF)
**Duration:** 5 minutes
**Enabling Objective:** Reference iteration and selection patterns
**Bloom's Level:** Remember

**Content Structure:**

1. **Present Content** (4 min)
   - Embedded PDF viewer with iteration/selection reference material
   - Pseudocode syntax reference
   - Flowchart symbol guide
   - Common patterns cheat sheet

2. **Enhance Retention** (1 min)
   - "Keep this PDF handy -- you will need it for the upcoming activities."

**Content Types Used:**
- [x] Text content
- [x] Image/Infographic (PDF document)
- [ ] Video/Animation
- [x] Interactive element (PDF viewer)
- [ ] Quiz/Assessment

**Interactive Components:**
- `scroll-panel` -- PDF-style scrollable content
- `button-set` -- download button

**Assets Required:**
- [ ] Control flow reference PDF (bilingual)

---

### SCO 12: Interactive Activity -- Iteration

**SCO ID:** `sco_12_activity_iteration`
**Type:** Interactive Activity (نشاط تفاعلي)
**Duration:** 8 minutes
**Enabling Objective:** Demonstrate iteration by tracing loops through examples
**Bloom's Level:** Apply

**Content Structure (Gagne's Events):**

1. **Gain Attention** (30 sec)
   - "How many times does this loop run? Let's trace through it together."
   - Animated cursor stepping through a loop

2. **Inform Objectives** (15 sec)
   - "You will trace loops step by step and predict their output."

3. **Stimulate Recall** (30 sec)
   - Recall from SCO 10: "Iteration repeats a block. FOR loops count, WHILE loops check a condition."

4. **Present Content / Elicit Performance** (5.5 min)
   - **Activity 1: Loop Tracer** (3 min)
     - Pseudocode for loop displayed in code editor style
     - Variable tracking table below (i, sum, output)
     - Learner fills in each row of the trace table as the loop iterates
     - Example: `FOR i = 1 TO 5: sum = sum + i`
     - Trace: i=1, sum=1 | i=2, sum=3 | i=3, sum=6 | i=4, sum=10 | i=5, sum=15

   - **Activity 2: Loop Output Predictor** (2.5 min)
     - 4 pseudocode snippets with loops
     - Learner predicts the final output (numeric entry)
     - Immediate feedback with step-by-step trace explanation

5. **Provide Feedback** (1 min)
   - Animated trace walkthrough for any incorrect answers
   - "Trace tables are a programmer's best friend for debugging!"

6. **Enhance Retention** (30 sec)
   - "You can now trace loops like a pro. Next: selection (if/else) activities!"

**Content Types Used:**
- [x] Text content (pseudocode, explanations)
- [x] Image/Infographic (trace table)
- [ ] Video/Animation
- [x] Interactive element (fill-in trace table + numeric prediction)
- [x] Quiz/Assessment (scored responses)

**Recommended Interactive Components:**
- `fill-blank` -- trace table with blank cells for variable values at each iteration step
- `numeric-entry` -- predict the final output of a loop
- `slider` -- "How many times does this loop execute?" (slide to correct count)
- `callout` -- "Common Mistake: Off-by-one errors in loop bounds"

**Gamification:**
- 10 points per correct trace table cell
- 25 points per correct output prediction
- Speed bonus: complete Activity 1 under 2 minutes = 30 bonus points
- Streak tracking across all 4 prediction questions

**Assets Required:**
- [ ] 1 detailed pseudocode loop example (for trace table)
- [ ] 4 pseudocode loop snippets (for output prediction)
- [ ] Trace table template graphic
- [ ] Step-by-step trace animation frames

---

### SCO 13: Interactive Activity -- Selection

**SCO ID:** `sco_13_activity_selection`
**Type:** Interactive Activity (نشاط تفاعلي)
**Duration:** 8 minutes
**Enabling Objective:** Demonstrate selection by tracing conditional branches
**Bloom's Level:** Apply

**Content Structure (Gagne's Events):**

1. **Gain Attention** (30 sec)
   - "Your algorithm reaches a fork in the road. Which path does it take?"
   - Visual: flowchart with a diamond decision node glowing

2. **Inform Objectives** (15 sec)
   - "You will trace if/else branches and predict which path the algorithm follows."

3. **Stimulate Recall** (30 sec)
   - "Selection means the algorithm CHOOSES based on a condition: true or false."

4. **Present Content / Elicit Performance** (5.5 min)
   - **Activity 1: Decision Tree Tracer** (3 min)
     - Interactive decision tree visualization
     - Given input values, learner clicks the correct branch at each decision point
     - Example: Grade classification (score >= 90 -> "A", >= 80 -> "B", >= 70 -> "C", else -> "F")
     - Learner traces with score = 85: root -> ">=90? No" -> ">=80? Yes" -> Output: "B"

   - **Activity 2: Condition Evaluator** (2.5 min)
     - 6 conditions presented with variable values
     - Learner evaluates each as TRUE or FALSE
     - Examples:
       - `x = 5, y = 3: x > y AND y > 0` -> TRUE
       - `age = 17: age >= 18 OR age < 0` -> FALSE
     - Styled as a terminal evaluating boolean expressions

5. **Provide Feedback** (1 min)
   - Highlight the correct path on the decision tree
   - Step-by-step condition evaluation breakdown

6. **Enhance Retention** (30 sec)
   - "Selection + Iteration = powerful algorithm control. Next: see them work together!"

**Content Types Used:**
- [x] Text content (conditions, variable values)
- [x] Image/Infographic (decision tree flowchart)
- [ ] Video/Animation
- [x] Interactive element (decision tree + condition evaluator)
- [x] Quiz/Assessment (scored responses)

**Recommended Interactive Components:**
- `decision-sim` -- interactive decision tree where learner clicks branch paths
- `per-choice-feedback` -- TRUE/FALSE evaluation for each condition
- `hotspot` -- click the correct branch on a flowchart image
- `callout` -- "Remember: AND requires BOTH true, OR requires just ONE true"

**Gamification:**
- 20 points per correct branch selection in decision tree
- 15 points per correct condition evaluation (90 max for 6 conditions)
- Perfect score bonus: 50 points
- Celebration on completing both activities

**Assets Required:**
- [ ] Grade classification decision tree SVG
- [ ] 6 condition evaluation cards (bilingual)
- [ ] Boolean logic reference card

---

### SCO 14: Interactive Activity -- Example Algorithm

**SCO ID:** `sco_14_activity_example`
**Type:** Interactive Activity (نشاط تفاعلي)
**Duration:** 10 minutes
**Enabling Objective:** Trace a complete algorithm using iteration and selection together
**Bloom's Level:** Apply

**Content Structure (Gagne's Events):**

1. **Gain Attention** (30 sec)
   - "Everything comes together now. Can you trace a FULL algorithm with loops AND conditions?"
   - Code editor animation: algorithm loading line by line

2. **Inform Objectives** (15 sec)
   - "You will trace a complete algorithm that combines iteration and selection, predicting its output."

3. **Stimulate Recall** (30 sec)
   - Quick recap cards: "Iteration = repeat | Selection = choose | Together = power"

4. **Present Content / Elicit Performance** (7 min)
   - **Activity 1: Full Algorithm Trace** (4 min)
     - Algorithm: "Find all even numbers in a list and sum them"
     - Pseudocode displayed in code editor panel:
       ```
       list = [3, 8, 1, 6, 5, 2]
       sum = 0
       FOR each number in list:
           IF number is even:
               sum = sum + number
       PRINT sum
       ```
     - Interactive trace table: learner fills in `number`, `is even?`, `sum` for each iteration
     - 6 rows (one per list item)
     - Expected final answer: sum = 16

   - **Activity 2: Algorithm Prediction Challenge** (3 min)
     - 3 short algorithms with both loops and conditions
     - Learner predicts the output for each (numeric entry or MCQ)
     - Increasing difficulty: Easy -> Medium -> Hard

5. **Provide Feedback** (1.5 min)
   - Animated step-through of the algorithm showing each line executing
   - Highlight which lines are iteration vs. selection
   - "You traced a real algorithm! This is what debugging looks like."

6. **Enhance Retention** (30 sec)
   - "You now understand how algorithms work. But what about when they go WRONG?"
   - Teaser for SCO 15: Gotchas

**Content Types Used:**
- [x] Text content (pseudocode, problem statement)
- [x] Image/Infographic (trace table, algorithm flowchart)
- [ ] Video/Animation
- [x] Interactive element (trace table builder + prediction challenges)
- [x] Quiz/Assessment (scored responses)

**Recommended Interactive Components:**
- `fill-blank` -- trace table with blanks for variable values at each step
- `numeric-entry` -- predict final output of each algorithm
- `sequence-sort` -- arrange execution order of mixed iteration/selection steps
- `labeled-graphic` -- annotated flowchart of the completed algorithm showing data flow

**Gamification:**
- 10 points per correct trace table cell (60 max for 6 iterations x ~1 key cell each... actual: ~18 cells total = 180 max)
- 30 points per correct algorithm prediction (90 max for 3 predictions)
- "Algorithm Master" badge for perfect score on Activity 1
- Confetti celebration on completing the full trace correctly

**Assets Required:**
- [ ] "Even sum" algorithm pseudocode and flowchart
- [ ] 3 algorithm prediction challenges (increasing difficulty)
- [ ] Trace table template (6 rows)
- [ ] Step-by-step execution animation

---

### SCO 15: Discussion Activity -- Gotchas

**SCO ID:** `sco_15_discussion_gotchas`
**Type:** Discussion Activity (نشاط - نقاش)
**Duration:** 8 minutes
**Enabling Objective:** Evaluate common algorithmic mistakes and edge cases
**Bloom's Level:** Evaluate

**Content Structure (Gagne's Events):**

1. **Gain Attention** (30 sec)
   - "These algorithms LOOK correct... but they are not. Can you find the bugs?"
   - Terminal style: red error messages flashing

2. **Inform Objectives** (15 sec)
   - "You will identify common algorithmic mistakes (gotchas) and explain why they fail."

3. **Stimulate Recall** (30 sec)
   - "You have traced correct algorithms. Now use that skill to find ERRORS."

4. **Present Content / Elicit Performance** (5.5 min)
   - **Gotcha 1: Infinite Loop** (1.5 min)
     - Pseudocode with a `WHILE` loop that never terminates
     - Learner identifies: "What is wrong?" (MCQ + explanation)
     - Answer: loop condition never becomes false

   - **Gotcha 2: Off-by-One Error** (1.5 min)
     - Loop that processes one too many or one too few items
     - Learner spots the boundary error

   - **Gotcha 3: Wrong Condition Logic** (1.5 min)
     - If/else with inverted condition (using AND instead of OR)
     - Learner evaluates and corrects

   - **Reflection Prompt** (1 min)
     - "Describe a situation where a small algorithmic error could cause a big real-world problem."
     - Text input field for learner reflection
     - Prompt to share in Moodle discussion forum

5. **Provide Feedback** (1 min)
   - Expert explanations for each gotcha
   - "These are the EXACT bugs professional developers encounter daily"

6. **Enhance Retention** (30 sec)
   - Gotcha checklist: "Before running any algorithm, check for these 3 common issues"
   - Link to Moodle discussion forum for peer sharing

**Content Types Used:**
- [x] Text content (pseudocode with bugs, explanations)
- [x] Image/Infographic (bug identification callouts)
- [ ] Video/Animation
- [x] Interactive element (bug identification + reflection)
- [x] Quiz/Assessment (gotcha identification)

**Recommended Interactive Components:**
- `branching-scenario` -- present buggy code, learner chooses what the bug is, gets consequences
- `per-choice-feedback` -- MCQ for each gotcha with detailed wrong-answer explanations
- `text-response` -- free-text reflection prompt (saved to suspend_data)
- `interactive-checklist` -- "Algorithm Review Checklist" learner can check off before submitting code
- `callout` -- expert tips styled as terminal warning messages

**Gamification:**
- 25 points per correctly identified bug (75 max)
- 15 points for submitting a reflection response
- "Bug Hunter" badge for identifying all 3 gotchas correctly

**Assets Required:**
- [ ] 3 buggy pseudocode examples
- [ ] Bug identification answer explanations
- [ ] Moodle forum link configuration
- [ ] Algorithm review checklist items

---

### SCO 16: Assignment -- Examine an Algorithm

**SCO ID:** `sco_16_assignment`
**Type:** Assignment (واجب)
**Duration:** 5 minutes (in-SCO) + external work time
**Enabling Objective:** Examine an algorithm for correctness and propose fixes
**Bloom's Level:** Evaluate

**Content Structure:**

1. **Present Content** (3 min)
   - Assignment brief with clear rubric
   - Algorithm to examine (provided as pseudocode + flowchart)
   - The algorithm has 2-3 intentional errors
   - Task: (1) Identify each error, (2) Explain why it is wrong, (3) Propose a fix

2. **Provide Guidance** (1.5 min)
   - Rubric displayed:
     - Error identification: 40%
     - Explanation quality: 30%
     - Fix correctness: 30%
   - Example of a good submission vs. weak submission
   - Deadline and submission instructions

3. **Enhance Retention** (30 sec)
   - "Submit your work via Moodle. Use the checklist from the Gotchas activity!"
   - Link to Moodle assignment submission

**Content Types Used:**
- [x] Text content (assignment brief, rubric)
- [x] Image/Infographic (algorithm flowchart)
- [ ] Video/Animation
- [x] Interactive element (downloadable template, rubric viewer)
- [ ] Quiz/Assessment

**Interactive Components:**
- `accordion` -- expand sections: "Task | Rubric | Submission Guide | Example"
- `interactive-checklist` -- pre-submission checklist
- `button-set` -- "Download Template" and "Submit on Moodle" buttons

**Assets Required:**
- [ ] Assignment algorithm pseudocode (with intentional errors)
- [ ] Flowchart of the algorithm
- [ ] Rubric document
- [ ] Submission template (downloadable)

---

### SCO 17: Module Summary

**SCO ID:** `sco_17_summary`
**Type:** Summary (ملخص)
**Duration:** 4 minutes
**Enabling Objective:** Summarize the key concepts of computational thinking
**Bloom's Level:** Understand

**Content Structure (Gagne's Events):**

1. **Gain Attention** (20 sec)
   - "Let's review everything you have learned in Chapter 1."
   - Terminal: `> compile --summary chapter1.md`

2. **Present Content** (2.5 min)
   - Visual recap organized by module:
     - **CT Fundamentals:** 4 pillars (decomposition, pattern recognition, abstraction, algorithmic thinking)
     - **Logical Thinking:** deductive/inductive, AND/OR/NOT, valid arguments
     - **Algorithmic Thinking:** step-by-step, sequencing, precision
     - **Control Flow:** iteration (loops), selection (if/else), combining both
     - **Evaluation:** tracing algorithms, finding bugs, gotchas
   - Each concept shown as a compact card with icon + one-line summary

3. **Enhance Retention** (1 min)
   - Key vocabulary list (bilingual)
   - "What to review before the post-test" recommendations
   - Connection to Chapter 2 preview: "Next, you will learn about..."

4. **Motivational Close** (30 sec)
   - Points summary: how many points earned so far
   - Badges earned review
   - "You are ready for the post-test. Good luck!"

**Content Types Used:**
- [x] Text content (summary, vocabulary)
- [x] Image/Infographic (concept recap cards)
- [ ] Video/Animation
- [x] Interactive element (expandable cards, badge showcase)
- [ ] Quiz/Assessment

**Interactive Components:**
- `flip-card` -- concept cards (front: term, back: definition + example)
- `accordion` -- expandable module summaries
- `progress-journey` -- completed journey map showing all green checkmarks
- `callout` -- "Ready for the post-test?" prompt

**Assets Required:**
- [ ] Summary concept cards (bilingual)
- [ ] Vocabulary list
- [ ] Chapter 2 preview teaser

---

### SCO 18: Post-test

**SCO ID:** `sco_18_posttest`
**Type:** Post-test (اختبار بعدي)
**Duration:** 15 minutes
**Enabling Objective:** Demonstrate mastery of all Chapter 1 objectives
**Bloom's Level:** Apply / Evaluate

**Content Structure (Gagne's Events):**

1. **Gain Attention** (15 sec)
   - "Final challenge! Show what you have learned in Chapter 1."

2. **Inform Objectives** (15 sec)
   - "This test covers all Chapter 1 objectives. You need 70% to pass."
   - Display: 15 questions, estimated 15 minutes, 70% passing score

3. **Assess Performance** (13 min)
   - 15 questions covering all 4 terminal objectives

4. **Provide Feedback** (1.5 min)
   - Score summary with breakdown by objective area
   - Growth mindset message based on score
   - Remediation links for weak areas

5. **Enhance Retention** (30 sec)
   - Certificate of completion (if passed)
   - "Congratulations! You have completed Chapter 1 of Computational Thinking."
   - Link to Chapter 2

**Question Plan:**

| # | Objective | Bloom's | Type | Topic | Difficulty |
|---|----------|---------|------|-------|------------|
| 1 | TO-1 | Remember | MCQ | Define computational thinking | Easy |
| 2 | TO-1 | Understand | MCQ | Identify correct decomposition example | Easy |
| 3 | TO-1 | Analyze | Matching | Match CT pillars to scenarios | Medium |
| 4 | TO-1 | Analyze | MCQ | Which pillar does this scenario use? | Medium |
| 5 | TO-2 | Remember | TF | Logical thinking definition | Easy |
| 6 | TO-2 | Apply | MCQ | Evaluate a logical argument | Medium |
| 7 | TO-2 | Apply | MCQ | Truth table evaluation (AND/OR) | Medium |
| 8 | TO-2 | Apply | Ordering | Order algorithm steps correctly | Medium |
| 9 | TO-3 | Understand | MCQ | Purpose of iteration | Easy |
| 10 | TO-3 | Apply | Fill-blank | Predict loop output | Hard |
| 11 | TO-3 | Apply | MCQ | Trace an if/else branch | Medium |
| 12 | TO-3 | Apply | MCQ | Combined iteration + selection output | Hard |
| 13 | TO-4 | Evaluate | MCQ | Identify bug in pseudocode | Hard |
| 14 | TO-4 | Evaluate | MCQ | Which fix corrects the infinite loop? | Hard |
| 15 | TO-4 | Evaluate | MCQ | Edge case identification | Hard |

**Assessment Coverage by Objective:**

| Objective | Questions | Weight |
|-----------|-----------|--------|
| TO-1 (CT Principles) | Q1-Q4 | 27% |
| TO-2 (Logical/Algorithmic) | Q5-Q8 | 27% |
| TO-3 (Iteration/Selection) | Q9-Q12 | 27% |
| TO-4 (Evaluate Algorithms) | Q13-Q15 | 20% |

**SCORM Tracking:**
- `cmi.core.score.raw` -- raw score (0-100)
- `cmi.core.score.min` -- 0
- `cmi.core.score.max` -- 100
- `cmi.core.lesson_status` -- "passed" (>= 70) or "failed" (< 70)
- `cmi.interactions.n.*` -- each question response
- Retries: Allowed (configurable in Moodle)

**Interactive Components:**
- `per-choice-feedback` -- MCQ with per-option feedback
- `matching-dropdown` -- matching questions
- `sequence-sort` -- ordering questions
- `fill-blank` -- fill-in-the-blank for loop output prediction
- `numeric-entry` -- for computational answers

---

## Gagne's Nine Events -- SCO Type Mapping

This table shows how each SCO type maps to Gagne's Nine Events of Instruction. Not every event applies to every type, but critical events are marked.

| Gagne Event | Infographic | Pre/Post-test | Interactive Lecture | PDF Lecture | Motion Video | Interactive Activity | Discussion | Assignment | Summary |
|-------------|:-----------:|:-------------:|:------------------:|:-----------:|:------------:|:-------------------:|:----------:|:----------:|:-------:|
| 1. Gain Attention | Strong | Light | Strong | -- | Strong | Strong | Strong | -- | Light |
| 2. Inform Objectives | Strong | Strong | Strong | -- | Strong | Strong | Strong | Strong | -- |
| 3. Stimulate Recall | Light | -- | Strong | -- | Light | Strong | Strong | Light | Strong |
| 4. Present Content | Strong | -- | Strong | Strong | Strong | Light | Light | Strong | Strong |
| 5. Provide Guidance | Light | -- | Strong | Light | Light | Light | Light | Strong | Light |
| 6. Elicit Performance | -- | Strong | Light | -- | -- | Strong | Strong | Strong | -- |
| 7. Provide Feedback | -- | Strong | Light | -- | -- | Strong | Light | -- | -- |
| 8. Assess Performance | -- | Strong | Light | -- | Light | Strong | Light | Strong | -- |
| 9. Enhance Retention | Light | Light | Strong | Light | Light | Strong | Strong | Light | Strong |

**Legend:** Strong = primary purpose of this event in this SCO type | Light = present but secondary | -- = not applicable

---

## Content Flow and Prerequisites

### Visual Learning Path

```
MODULE A: ORIENTATION
=====================

┌──────────────────┐
│  SCO 01          │
│  Objectives      │
│  (Infographic)   │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  SCO 02          │
│  Learning Map    │
│  (Infographic)   │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  SCO 03          │
│  Pre-test        │
│  (Diagnostic)    │
└────────┬─────────┘
         │
         v
MODULE B: CORE CONCEPTS
=======================

┌──────────────────┐     ┌──────────────────┐
│  SCO 04          │     │  SCO 05          │
│  CT Lecture      │────>│  CT PDF          │
│  (Interactive)   │     │  (Reference)     │
└────────┬─────────┘     └──────────────────┘
         │
         v
┌──────────────────┐
│  SCO 06          │
│  Logical Thinking│
│  (Motion Video)  │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  SCO 07          │
│  CT Activity     │  <-- Practices SCO 04 content
│  (Interactive)   │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  SCO 08          │
│  Logic Activity  │  <-- Practices SCO 06 content
│  (Interactive)   │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  SCO 09          │
│  Algorithm Act.  │  <-- Bridges Core -> Control
│  (Interactive)   │
└────────┬─────────┘
         │
         v
MODULE C: ALGORITHM CONTROL & APPLICATION
==========================================

┌──────────────────┐     ┌──────────────────┐
│  SCO 10          │     │  SCO 11          │
│  Control Lecture │────>│  Control PDF     │
│  (Interactive)   │     │  (Reference)     │
└────────┬─────────┘     └──────────────────┘
         │
         v
┌──────────────────┐
│  SCO 12          │
│  Iteration Act.  │  <-- Practices loops
│  (Interactive)   │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  SCO 13          │
│  Selection Act.  │  <-- Practices if/else
│  (Interactive)   │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  SCO 14          │
│  Example Algo.   │  <-- Combines iteration + selection
│  (Interactive)   │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  SCO 15          │
│  Gotchas Disc.   │  <-- Evaluation & critical thinking
│  (Discussion)    │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  SCO 16          │
│  Assignment      │  <-- Apply evaluation skills
│  (External)      │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  SCO 17          │
│  Summary         │  <-- Review before test
│  (Recap)         │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  SCO 18          │
│  Post-test       │  <-- Prove mastery
│  (Summative)     │
└──────────────────┘
```

### Prerequisite Rules

| SCO | Hard Prerequisite | Soft Prerequisite (Recommended) |
|-----|-------------------|---------------------------------|
| 01 | None | None |
| 02 | SCO 01 completed | None |
| 03 | SCO 02 completed | None |
| 04 | SCO 03 completed | None |
| 05 | None | SCO 04 (companion PDF) |
| 06 | SCO 04 completed | None |
| 07 | SCO 04 completed | SCO 06 |
| 08 | SCO 06 completed | SCO 07 |
| 09 | SCO 04 completed | SCO 08 |
| 10 | SCO 09 completed | None |
| 11 | None | SCO 10 (companion PDF) |
| 12 | SCO 10 completed | None |
| 13 | SCO 10 completed | SCO 12 |
| 14 | SCO 12 + SCO 13 completed | None |
| 15 | SCO 14 completed | None |
| 16 | SCO 15 completed | None |
| 17 | SCO 16 completed | None |
| 18 | SCO 17 completed | All previous SCOs |

**Note:** SCORM 1.2 does not have native sequencing. Prerequisites will be enforced by Moodle's "Activity Completion" settings, which allow configuring "Restrict Access" based on prior activity completion.

---

## Assessment Alignment Matrix

This matrix shows how every assessment item maps to learning objectives, ensuring complete alignment (QM Standard 3.1).

### Pre-test (SCO 03) to Objective Mapping

| Question | Objective | Bloom's | What It Measures |
|----------|----------|---------|------------------|
| Q1 | TO-1 | Remember | Can they define CT before instruction? |
| Q2 | TO-1 | Remember | Do they know the pillars exist? |
| Q3 | TO-1 | Understand | Can they recognize decomposition? |
| Q4 | TO-2 | Remember | Can they define logical thinking? |
| Q5 | TO-2 | Understand | Can they spot valid logic? |
| Q6 | TO-2 | Remember | Can they match terms to definitions? |
| Q7 | TO-3 | Remember | Do they know what iteration is? |
| Q8 | TO-3 | Remember | Do they know what selection is? |
| Q9 | TO-3 | Understand | Can they read basic pseudocode? |
| Q10 | TO-4 | Understand | Can they spot an obvious error? |

### Post-test (SCO 18) to Objective Mapping

| Question | Objective | Bloom's | What It Proves |
|----------|----------|---------|----------------|
| Q1 | TO-1 | Remember | Define CT correctly |
| Q2 | TO-1 | Understand | Recognize decomposition in context |
| Q3 | TO-1 | Analyze | Classify scenarios by pillar |
| Q4 | TO-1 | Analyze | Identify correct pillar for a scenario |
| Q5 | TO-2 | Remember | Define logical thinking |
| Q6 | TO-2 | Apply | Evaluate a logical argument's validity |
| Q7 | TO-2 | Apply | Complete a truth table correctly |
| Q8 | TO-2 | Apply | Order algorithm steps |
| Q9 | TO-3 | Understand | Explain purpose of iteration |
| Q10 | TO-3 | Apply | Predict loop output (computation) |
| Q11 | TO-3 | Apply | Trace conditional branch |
| Q12 | TO-3 | Apply | Trace combined iteration + selection |
| Q13 | TO-4 | Evaluate | Find bug in pseudocode |
| Q14 | TO-4 | Evaluate | Select correct fix for infinite loop |
| Q15 | TO-4 | Evaluate | Identify edge case that breaks algorithm |

### Bloom's Level Progression: Pre-test vs. Post-test

| Bloom's Level | Pre-test Questions | Post-test Questions |
|---------------|-------------------|---------------------|
| Remember | 6 (60%) | 2 (13%) |
| Understand | 4 (40%) | 2 (13%) |
| Apply | 0 (0%) | 6 (40%) |
| Analyze | 0 (0%) | 2 (13%) |
| Evaluate | 0 (0%) | 3 (20%) |

This progression is intentional: the pre-test measures **baseline knowledge** (lower Bloom's levels), while the post-test measures **achieved competence** (higher Bloom's levels). The gap between pre-test and post-test scores demonstrates the transformation.

### Interactive Activity SCOs -- Internal Assessment

Each interactive activity SCO contains embedded assessments that are scored for gamification but not formally graded:

| SCO | Activity | Questions/Tasks | Max Points |
|-----|----------|----------------|------------|
| 07 | CT Pillar Classification | 8 drag-drop + 4 memory matches | 210 |
| 08 | Logic Evaluation | 6 truth table cells + 6 arguments | 260 |
| 09 | Algorithm Building | 8 sequencing + 5 components | 305 |
| 12 | Loop Tracing | ~18 trace cells + 4 predictions | ~310 |
| 13 | Selection Tracing | Decision tree + 6 conditions | ~220 |
| 14 | Full Algorithm Trace | ~18 trace cells + 3 predictions | ~270 |
| 15 | Bug Identification | 3 gotchas + reflection | 90 |

---

## Gamification Strategy

### Points Allocation by SCO Type

| SCO Type | Points per SCO | Source |
|----------|---------------|--------|
| Infographic (01, 02) | 20 each | 20 for completion |
| Pre-test (03) | 50 | 50 for completion (not score-dependent) |
| Interactive Lecture (04, 10) | 40 each | 20 completion + 20 for knowledge check |
| PDF Lecture (05, 11) | 15 each | 15 for viewing/downloading |
| Motion Video (06) | 30 | 20 completion + 10 for post-video check |
| Interactive Activity (07-09, 12-14) | 200-310 each | Per-task points as detailed above |
| Discussion (15) | 90 | 75 bug-finding + 15 reflection |
| Assignment (16) | 30 | 30 for accessing and downloading |
| Summary (17) | 25 | 25 for completion |
| Post-test (18) | 500 | 200 pass + 300 perfect score |

### Total Points Available: ~2,500 points

### Achievement Badges

| Badge | Criteria | Points Bonus |
|-------|----------|--------------|
| "Explorer" | Complete SCO 01 + 02 | 25 |
| "Self-Aware" | Complete pre-test | 25 |
| "CT Scholar" | Complete all Module B SCOs | 100 |
| "Logic Master" | Perfect score on SCO 08 | 50 |
| "Algorithm Architect" | Perfect score on SCO 09 | 50 |
| "Loop Guru" | Perfect score on SCO 12 | 50 |
| "Decision Pro" | Perfect score on SCO 13 | 50 |
| "Full Stack Tracer" | Perfect score on SCO 14 | 75 |
| "Bug Hunter" | Identify all 3 gotchas in SCO 15 | 50 |
| "Chapter Champion" | Pass post-test with 70%+ | 100 |
| "Perfectionist" | Pass post-test with 100% | 200 |
| "Streak Legend" | Achieve 10+ correct answers in a row (any SCO) | 100 |
| "Speed Demon" | Complete SCO 12 Activity 1 under 2 minutes | 30 |

### Celebration Triggers

| Trigger | Animation | Message |
|---------|-----------|---------|
| Complete any SCO | Points float animation | "+X points!" |
| Earn a badge | Badge reveal + confetti | "Achievement Unlocked: [Badge Name]" |
| 3-streak | Streak flame glow | "3 in a row! Keep it up!" |
| 5-streak | Enhanced flame + bonus | "5 in a row! Streak bonus: +100 points!" |
| 10-streak | Full confetti burst | "INCREDIBLE! 10 in a row! +250 bonus!" |
| Pass post-test | Full celebration overlay + confetti | "Congratulations! Chapter 1 Complete!" |
| Perfect post-test | Extended celebration + special badge | "PERFECT SCORE! You are a CT Master!" |

### Growth Mindset Messaging

All feedback follows growth mindset principles:

| Situation | Message Style | Example |
|-----------|--------------|---------|
| Correct answer | Effort-focused praise | "Your practice is paying off!" |
| Incorrect (1st try) | Normalizing + guidance | "Not quite -- this is how learning works. Here's a hint..." |
| Incorrect (2nd try) | Encouragement + strategy | "Try a different approach. Review the trace table method." |
| Incorrect (3rd try) | Full explanation | "Here's the answer and WHY -- understanding 'why' matters more than being right." |
| Quiz fail (<70%) | Growth frame + action | "You scored X%. That tells us what to review. Try these SCOs again: [links]" |
| Quiz pass (70-89%) | Celebration + improvement | "You passed! To master this, review the hard questions." |
| Quiz pass (90%+) | Full celebration | "Outstanding! You truly understand computational thinking!" |

---

## QM Essential Standards Mapping

The 15 Essential QM Standards and how this course structure addresses each one.

| # | QM Standard | How This Course Meets It | SCO(s) |
|---|------------|--------------------------|--------|
| **1.1** | Clear getting-started instructions | SCO 01 (Objectives) and SCO 02 (Learning Map) provide a complete orientation with navigation tips, grading policy, and course structure | 01, 02 |
| **1.2** | Course purpose and structure introduced | SCO 02 displays the full 18-SCO journey map with module groupings, time estimates, and content type icons | 02 |
| **2.1** | Course objectives are measurable | 4 terminal objectives use Bloom's verbs: "Apply," "Use," "Control," "Examine and evaluate" | 01 |
| **2.2** | Module objectives are measurable and consistent | Each SCO has a specific enabling objective with a measurable Bloom's verb, mapped to terminal objectives | All |
| **2.3** | Objectives stated clearly from learner perspective | Every SCO opens with "By the end of this lesson, you will be able to..." phrasing | All |
| **2.4** | Relationship between objectives, activities, assessments is clear | SCO 02 Learning Map shows the connection; assessment alignment matrix ensures every question maps to an objective | 02, 03, 18 |
| **3.1** | Assessments measure stated objectives | Pre-test and post-test questions are mapped to specific terminal objectives (see Assessment Alignment Matrix) | 03, 18 |
| **3.2** | Grading policy clearly stated at start | SCO 02 states: Pre-test = diagnostic (ungraded), Activities = points (engagement), Post-test = 70% pass (graded) | 02 |
| **3.3** | Specific evaluation criteria provided | Post-test shows question count, time limit, passing score. Assignment (SCO 16) includes detailed rubric | 16, 18 |
| **4.1** | Materials support learning objectives | Every SCO's content directly supports its enabling objective (see Enabling Objectives table) | All |
| **4.2** | Relationship between materials and activities explained | Interactive lectures (SCOs 04, 10) explicitly connect to their companion activities (SCOs 07-09, 12-14) | 04, 07-09, 10, 12-14 |
| **5.1** | Activities promote objective achievement | 7 interactive activity SCOs provide hands-on practice of specific objectives | 07-09, 12-15 |
| **5.2** | Activities support active learning | Drag-drop, sequence sorting, trace tables, decision trees, algorithm building, bug hunting -- all require active participation | 07-09, 12-15 |
| **6.1** | Technology supports learning objectives | Interactive components chosen specifically for each learning task (e.g., `sequence-sort` for algorithm ordering, `decision-sim` for selection tracing) | All |
| **8.1** | Navigation facilitates ease of use | Consistent navigation across all 18 SCOs, progress bar, skip navigation links, keyboard support, RTL layout | All |

---

## NELC Compliance Checklist

### Domain 1: Technical Quality

| # | Requirement | Status | Implementation |
|---|------------|--------|----------------|
| 1 | Video format MP4/H.264, max 10 min | COMPLIANT | SCO 06 video = 6 min, MP4/H.264 |
| 2 | Audio: clear, consistent levels | COMPLIANT | Motion video audio professionally mixed; no other audio |
| 3 | Images: high quality, appropriate resolution | COMPLIANT | All images 1280x720 or 800x450, optimized for screen |
| 4 | Fonts: min 16px body, min 18px Arabic | COMPLIANT | Arabic body text = 18px, Cairo font; English = 16px |
| 5 | Color contrast WCAG AA (4.5:1) | COMPLIANT | Technical Dark theme uses high-contrast syntax colors on dark bg |
| 6 | Responsive design (desktop, tablet, mobile) | COMPLIANT | CSS grid/flexbox responsive layout, touch-friendly targets |
| 7 | Cross-browser (Chrome, Firefox, Safari, Edge) | COMPLIANT | Standard HTML5/CSS3/ES6, no proprietary APIs |
| 8 | HTTPS-ready (no mixed content) | COMPLIANT | All assets bundled locally, no external requests |
| 9 | Self-contained (no external dependencies) | COMPLIANT | Fonts, JS, CSS, images all included in package |

### Domain 2: Content Quality

| # | Requirement | Status | Implementation |
|---|------------|--------|----------------|
| 10 | Content reviewed for accuracy | COMPLIANT | CT concepts from established CS education frameworks |
| 11 | IP compliance verified | COMPLIANT | All content original or properly attributed |
| 12 | Cultural alignment (Saudi/Islamic values) | COMPLIANT | Culturally neutral examples; Arabic-first design; no inappropriate content |
| 13 | Content chunked (manageable segments) | COMPLIANT | 18 SCOs of 3-15 min each; slides within lectures |
| 14 | Consistent design across SCOs | COMPLIANT | Technical Dark theme applied uniformly; base.css + theme.css |
| 15 | AI usage disclosed | COMPLIANT | Disclosure in course metadata if AI-generated content used |
| 16 | Data privacy compliance | COMPLIANT | BehaviorTracker collects no PII; privacy notice in SCO 02 |

### Domain 3: Instructional Design

| # | Requirement | Status | Implementation |
|---|------------|--------|----------------|
| 17 | Clear objectives at start of each SCO | COMPLIANT | Every SCO opens with objective statement |
| 18 | Bloom's taxonomy verbs | COMPLIANT | All 18 enabling objectives use measurable Bloom's verbs |
| 19 | Content aligned with objectives | COMPLIANT | See QM Alignment Matrix above |
| 20 | Activities aligned with objectives | COMPLIANT | Each activity SCO targets a specific enabling objective |
| 21 | Assessments aligned with objectives | COMPLIANT | Pre-test and post-test questions mapped to terminal objectives |
| 22 | UDL principles applied | COMPLIANT | Multiple representation types (text, video, interactive, PDF) |
| 23 | Student-centered design | COMPLIANT | Active learning, self-paced, immediate feedback, gamification |

### Domain 4: Accessibility

| # | Requirement | Status | Implementation |
|---|------------|--------|----------------|
| 24 | WCAG 2.1 AA compliance | COMPLIANT | Semantic HTML, contrast ratios, focus management |
| 25 | Semantic HTML5 | COMPLIANT | Proper heading hierarchy, landmark roles, lists |
| 26 | ARIA labels on interactive elements | COMPLIANT | All drag-drop, buttons, quizzes have ARIA attributes |
| 27 | Alt text on all images | COMPLIANT | Every image has descriptive alt text |
| 28 | Keyboard navigation | COMPLIANT | Tab order, focus indicators, enter/space activation |
| 29 | Screen reader compatible | COMPLIANT | ARIA live regions for dynamic content, role attributes |
| 30 | Captions/transcripts for video | COMPLIANT | SCO 06 has Arabic + English VTT subtitle files |
| 31 | Focus management for dynamic content | COMPLIANT | Focus moves to feedback after quiz submission |
| 32 | Skip navigation links | COMPLIANT | "Skip to main content" link on every SCO |

### Domain 5: Interactivity

| # | Requirement | Status | Implementation |
|---|------------|--------|----------------|
| 33 | Min 2 interaction types per module | EXCEEDS | Module B: drag-drop, flip-cards, memory-match, fill-blank, branching-scenario, sequence-sort, word-bank, numeric-entry (8+ types). Module C: fill-blank, numeric-entry, decision-sim, hotspot, branching-scenario, text-response, checklist, sequence-sort (8+ types) |
| 34 | Knowledge checks within content | COMPLIANT | Lectures (04, 10) have embedded 2-3 question checks; video (06) has post-video check |
| 35 | Interactions foster higher-order thinking | COMPLIANT | Activities target Apply/Analyze/Evaluate levels of Bloom's |
| 36 | Activities appropriate for audience | COMPLIANT | University CS/IT students; computational thinking content; code-editor aesthetic |
| 37 | Interaction state saved | COMPLIANT | All states saved to `cmi.suspend_data` via JSON |

### Domain 6: Arabic/RTL Support

| # | Requirement | Status | Implementation |
|---|------------|--------|----------------|
| 38 | RTL layout (`dir="rtl"`) | COMPLIANT | All SCOs use `<html dir="rtl" lang="ar">` |
| 39 | Arabic font stack loaded | COMPLIANT | Cairo, Noto Kufi Arabic, Tajawal bundled locally |
| 40 | Font sizes (18px+ Arabic body) | COMPLIANT | Arabic body = 18px, headings = 24-36px |
| 41 | Line height (1.6-1.8) | COMPLIANT | Arabic line-height = 1.7 |
| 42 | Bidirectional text support | COMPLIANT | `.en-text` class with `direction: ltr; unicode-bidi: embed` |
| 43 | Arabic-Indic numeral support | COMPLIANT | Optional CSS for Arabic-Indic numerals |

### Domain 7: SCORM Compliance

| # | Requirement | Status | Implementation |
|---|------------|--------|----------------|
| 44 | Valid imsmanifest.xml | COMPLIANT | Proper namespaces, 18 SCO items, metadata |
| 45 | SCORM API functional | COMPLIANT | Initialize, GetValue, SetValue, Commit, Finish |
| 46 | Lesson status reported | COMPLIANT | `cmi.core.lesson_status` = completed/passed/failed |
| 47 | Score reported (assessments) | COMPLIANT | `cmi.core.score.raw/min/max` for SCOs 03, 18 |
| 48 | Bookmark/resume via suspend_data | COMPLIANT | JSON in `cmi.suspend_data` for progress, points, badges |
| 49 | Session time tracked | COMPLIANT | `cmi.core.session_time` via scorm-api.js |
| 50 | Individual interactions reported | COMPLIANT | `cmi.interactions.n.*` for all quiz questions |
| 51 | Tested on SCORM Cloud | PENDING | Must be tested before delivery |

### Domain 8: Assessment

| # | Requirement | Status | Implementation |
|---|------------|--------|----------------|
| 52 | Formative checks after lessons | COMPLIANT | Embedded checks in SCOs 04, 06, 10; activity SCOs 07-09, 12-15 |
| 53 | Summative quiz (post-test) | COMPLIANT | SCO 18: 15 questions, 70% pass, score tracked |
| 54 | Clear passing criteria | COMPLIANT | 70% displayed before test begins |
| 55 | Meaningful feedback | COMPLIANT | Per-choice feedback on all quiz items |
| 56 | Remediation paths | COMPLIANT | Post-test results link to specific SCOs for weak areas |
| 57 | Academic integrity | COMPLIANT | Question pool randomization; time tracking per question |
| 58 | Rubrics/criteria shown | COMPLIANT | Assignment (SCO 16) rubric displayed; post-test criteria shown |
| 59 | Pre-test diagnostic | COMPLIANT | SCO 03: 10 questions, ungraded, measures baseline |

**NELC Compliance Score: 58/59 met (1 pending: SCORM Cloud testing)**

---

## Content Type Distribution

| Type | SCO Count | Percentage | Duration |
|------|-----------|------------|----------|
| Infographic | 2 | 11% | 6 min |
| Pre/Post-test | 2 | 11% | 25 min |
| Interactive Lecture | 2 | 11% | 24 min |
| PDF Lecture | 2 | 11% | 10 min |
| Motion Video | 1 | 6% | 8 min |
| Interactive Activity | 6 | 33% | 52 min |
| Discussion Activity | 1 | 6% | 8 min |
| Assignment | 1 | 6% | 5 min |
| Summary | 1 | 6% | 4 min |
| **Total** | **18** | **100%** | **~142 min** |

### Content Modality Distribution

| Modality | Presence |
|----------|----------|
| Text/Reading | 16 of 18 SCOs (89%) |
| Visual/Graphic | 14 of 18 SCOs (78%) |
| Video/Animation | 1 of 18 SCOs (6%) |
| Interactive/Hands-on | 12 of 18 SCOs (67%) |
| Assessment/Quiz | 9 of 18 SCOs (50%) |
| Downloadable Reference | 3 of 18 SCOs (17%) |

---

## Interactive Component Library Usage Summary

This table maps every interactive component used across all 18 SCOs, referencing the 42-component library.

| Component | Used In SCO(s) | Purpose |
|-----------|---------------|---------|
| `labeled-graphic` | 01, 09, 14 | Objectives circuit board; algorithm flowcharts |
| `click-reveal` | 01, 04 | Reveal objective details; reveal examples |
| `progress-journey` | 02, 17 | 18-stop learning journey map |
| `tabs` | 02, 04, 10 | Info tabs; pillar tabs; control flow tabs |
| `per-choice-feedback` | 03, 04, 06, 08, 13, 15, 18 | MCQ with per-option explanations |
| `matching-dropdown` | 03, 18 | Match concepts to definitions |
| `scroll-panel` | 05, 11 | PDF-style content viewer |
| `button-set` | 05, 11, 16 | Download buttons |
| `flip-card` | 04, 07, 17 | Pillar front/back; concept review cards |
| `drag-drop` | 07 | Categorize scenarios by CT pillar |
| `memory-match` | 07 | Match pillar names to descriptions |
| `callout` | 07, 08, 09, 12, 13, 15 | "Why This Matters" and tip blocks |
| `fill-blank` | 08, 12, 14, 18 | Truth tables; trace tables; loop output |
| `branching-scenario` | 08, 15 | Argument validator; buggy code scenarios |
| `sequence-sort` | 09, 14, 18 | Order algorithm steps |
| `word-bank` | 09 | Build algorithm from components |
| `numeric-entry` | 12, 14, 18 | Predict loop/algorithm output |
| `slider` | 12 | "How many iterations?" |
| `decision-sim` | 13 | Interactive decision tree tracer |
| `hotspot` | 13 | Click correct branch on flowchart |
| `text-response` | 15 | Free-text reflection |
| `interactive-checklist` | 15, 16 | Algorithm review + pre-submission checklist |
| `accordion` | 10, 16, 17 | Expandable sections |

**Components Used:** 23 of 42 available (55%)

---

## Accessibility Notes

All 18 SCOs must implement:

1. **Semantic HTML:** Proper `<h1>` through `<h4>` hierarchy; `<main>`, `<nav>`, `<section>` landmarks
2. **Skip Navigation:** `<a href="#main-content" class="skip-link">Skip to main content</a>` on every page
3. **Alt Text:** All images, icons, and decorative SVGs have appropriate `alt` attributes
4. **Video Accessibility:** SCO 06 includes VTT captions (Arabic + English) and transcript
5. **Keyboard Navigation:** All interactive components support Tab, Enter, Space, Arrow keys
6. **Focus Management:** Focus moves to feedback after quiz submission; trapped in modals
7. **Color Independence:** No information conveyed by color alone; icons + text labels used
8. **ARIA Attributes:** `role`, `aria-label`, `aria-live` regions for dynamic quiz feedback
9. **RTL Layout:** `dir="rtl"` and `lang="ar"` on `<html>` element; bidirectional text support
10. **Font Sizing:** Arabic 18px minimum body text; scalable with `rem` units; readable at 200% zoom
11. **Reduced Motion:** `@media (prefers-reduced-motion: reduce)` disables all animations
12. **High Contrast:** Technical Dark theme meets 4.5:1 minimum contrast ratio

---

## Behavioral Data Collection Plan

| Data Point | Collected In | SCORM Field | Purpose |
|------------|-------------|-------------|---------|
| SCO completion time | All SCOs | `cmi.core.session_time` | Engagement analytics |
| Lesson status | All SCOs | `cmi.core.lesson_status` | Completion tracking |
| Score (raw) | SCOs 03, 18 | `cmi.core.score.raw` | Assessment results |
| Bookmark/resume | All SCOs | `cmi.suspend_data` | Resume capability |
| Quiz interactions | SCOs 03, 18 | `cmi.interactions.n.*` | Item-level analysis |
| Points earned | All SCOs | `cmi.suspend_data` (JSON) | Gamification state |
| Badges earned | All SCOs | `cmi.suspend_data` (JSON) | Achievement tracking |
| Streak data | Activity SCOs | `cmi.suspend_data` (JSON) | Engagement patterns |
| Scroll depth | Lectures, PDF | BehaviorTracker | Content engagement |
| Time per question | SCOs 03, 18 | BehaviorTracker | Deliberation time |
| Interaction clicks | Activity SCOs | BehaviorTracker | Engagement depth |
| Retry count | Activity SCOs | BehaviorTracker | Difficulty analysis |

---

## SCO Manifest Summary

For imsmanifest.xml generation, here are all 18 SCOs with their identifiers:

| # | SCO ID | Title (English) | Title (Arabic) | Type |
|---|--------|----------------|----------------|------|
| 01 | `sco_01_objectives` | Learning Objectives | الاهداف التعليمية | Infographic |
| 02 | `sco_02_learning_map` | Learning Map | خارطة التعلم | Infographic |
| 03 | `sco_03_pretest` | Diagnostic Pre-test | الاختبار القبلي | Pre-test |
| 04 | `sco_04_lecture_ct` | Computational Thinking | التفكير الحاسوبي | Interactive Lecture |
| 05 | `sco_05_pdf_ct` | CT Reference (PDF) | مرجع التفكير الحاسوبي | PDF Lecture |
| 06 | `sco_06_video_logical` | Logical Thinking (Video) | التفكير المنطقي | Motion Video |
| 07 | `sco_07_activity_ct` | CT Pillars Activity | نشاط أركان التفكير الحاسوبي | Interactive Activity |
| 08 | `sco_08_activity_logic` | Logical Thinking Activity | نشاط التفكير المنطقي | Interactive Activity |
| 09 | `sco_09_activity_algo` | Algorithmic Thinking Activity | نشاط التفكير الخوارزمي | Interactive Activity |
| 10 | `sco_10_lecture_control` | Controlling Algorithm Execution | التحكم في تنفيذ الخوارزميات | Interactive Lecture |
| 11 | `sco_11_pdf_control` | Control Flow Reference (PDF) | مرجع تدفق التحكم | PDF Lecture |
| 12 | `sco_12_activity_iteration` | Iteration Activity | نشاط التكرار | Interactive Activity |
| 13 | `sco_13_activity_selection` | Selection Activity | نشاط الاختيار | Interactive Activity |
| 14 | `sco_14_activity_example` | Example Algorithm Activity | نشاط مثال خوارزمي | Interactive Activity |
| 15 | `sco_15_discussion_gotchas` | Gotchas Discussion | نقاش الأخطاء الشائعة | Discussion Activity |
| 16 | `sco_16_assignment` | Examine an Algorithm | فحص خوارزمية | Assignment |
| 17 | `sco_17_summary` | Module Summary | ملخص الوحدة | Summary |
| 18 | `sco_18_posttest` | Post-test | الاختبار البعدي | Post-test |
