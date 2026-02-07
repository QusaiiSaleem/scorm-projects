# Learning Structure: Digital Mindset & Technology Innovation Practices
# الذهنية الرقمية وممارسات الابتكار التقني

**Project Code:** NJR01-U02
**Course Slug:** njr01-u02-digital-mindset
**Date:** 2026-02-07
**Designer:** Instructional Designer Agent

---

## Course Overview

- **Total Duration:** ~2.5 hours (150 minutes)
- **Modules:** 3 content modules + introduction + activities
- **SCOs:** 7 total
- **Assessments:** 2 (pre-test + post-test) + 3 interactive activities
- **SCORM Version:** 1.2
- **Target LMS:** Moodle
- **Language:** Arabic (RTL) with English technical terms
- **Layout:** Fixed slides (16:9, 1280x720)
- **Bloom's Progression:** Remember → Understand → Apply → Analyze → Evaluate → Create

---

## SCO Architecture & Learning Path

```
┌──────────────────────┐
│    SCO 01: مقدمة      │
│   Introduction        │
│   (5 min)             │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│   SCO 02: اختبار قبلي │
│   Pre-Test            │
│   (5 min)             │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  SCO 03: أساسيات       │
│  Module 1: Innovation │
│  (35 min)             │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  SCO 04: عقلية        │
│  Module 2: Mindset    │
│  (40 min)             │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  SCO 05: سوق          │
│  Module 3: Market     │
│  (35 min)             │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  SCO 06: أنشطة        │
│  Activities           │
│  (20 min)             │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  SCO 07: اختبار بعدي  │
│  Post-Test            │
│  (10 min)             │
└──────────────────────┘
```

### Sequencing Rules (SCORM 1.2)
- Linear progression: SCOs must be completed in order
- Pre-test (SCO 02) has no passing requirement (diagnostic only)
- Content SCOs (03-05) track completion status
- Activities SCO (06) requires all 3 modules complete
- Post-test (SCO 07) requires 70% to pass
- Each SCO reports: completion_status, score (where applicable), session_time

---

## Bloom's Taxonomy Progression Map

```
SCO 01-02:  ░░░░░░░░░░░░░░░░  (Baseline — no Bloom's target)
SCO 03:     ████░░░░░░░░░░░░  Remember + Understand (Obj 1, 2)
SCO 04:     ░░████████░░░░░░  Understand + Apply (Obj 3, 4, 5)
SCO 05:     ░░░░░░████████░░  Analyze + Evaluate (Obj 6, 7)
SCO 06:     ░░░░████████████  Apply + Analyze + Create (Obj 4, 5, 6, 7, 8)
SCO 07:     ████████████████  All levels assessed (Obj 1-8)
```

---

## Detailed SCO Structures

---

### SCO 01: مقدمة الوحدة (Unit Introduction)

**SCO ID:** `sco_01_introduction`
**Type:** Introduction
**Duration:** 5 minutes (3-4 slides)
**Prerequisites:** None

#### Slide Plan

| Slide | Content | Component | Duration |
|-------|---------|-----------|----------|
| 1 | Welcome + course title + Najran University branding | Hero slide with animated text | 30 sec |
| 2 | Transformation statement: "بعد هذه الوحدة، ستتمكن من..." (After this unit, you will be able to...) + 8 learning objectives displayed as cards | **flip-card** — front: objective number + icon, back: full objective text (Arabic + English term) | 2 min |
| 3 | Learning map: visual journey of the 3 modules showing progression from foundations → mindset → market | **progress-journey** — interactive map showing all 7 SCOs with icons, learners can hover/click to preview each stop | 1.5 min |
| 4 | How to navigate: gamification explanation (points, badges, progress), slide controls, getting help | **tabs** — Tab 1: Navigation controls, Tab 2: Gamification system, Tab 3: Tips for success | 1 min |

#### Gagne's Nine Events
| Event | Implementation |
|-------|---------------|
| 1. Gain attention | Opening question: "هل فكرت يومًا كيف تحوّل فكرة إلى مشروع ناجح؟" (Have you ever thought about how to turn an idea into a successful project?) |
| 2. Inform objectives | 8 objectives displayed via flip-cards |
| 3. Stimulate recall | Connect to their CS studies — they already solve problems with code, now they'll solve them with innovation |
| 4-9 | N/A for introduction SCO |

#### Interactive Components Used
1. **flip-card** — Learning objectives (front: icon + number, back: full text)
2. **progress-journey** — Course learning map
3. **tabs** — Navigation guide

#### Gamification
- +10 points for completing introduction
- First milestone unlocked: "بداية الرحلة" (Journey Begins)

---

### SCO 02: الاختبار القبلي (Pre-Test)

**SCO ID:** `sco_02_pretest`
**Type:** Assessment (Diagnostic)
**Duration:** 5 minutes (1-2 slides)
**Prerequisites:** SCO 01 complete
**Passing Score:** None (diagnostic — all answers recorded but no pass/fail)

#### Question Plan

| # | Objective Tested | Bloom's | Type | Topic | Difficulty |
|---|-----------------|---------|------|-------|------------|
| 1 | Obj 1 | Remember | MCQ (4 choices) | Innovation definition & elements | Easy |
| 2 | Obj 1 | Remember | True/False | Brainstorming as only idea generation method | Easy |
| 3 | Obj 3 | Understand | MCQ (4 choices) | Design Thinking first phase | Medium |
| 4 | Obj 2 | Remember | True/False | Entrepreneurship requires only money | Easy |
| 5 | Obj 6 | Understand | MCQ (4 choices) | Technology-Market Fit purpose | Medium |

#### Design Notes
- Present all 5 questions in a quiz format (one question per slide or grouped)
- Show completion message after — no score feedback (to avoid anchoring bias)
- Record answers to cmi.interactions for pre/post comparison
- Growth mindset message: "هذا اختبار تشخيصي فقط — لا توجد إجابات خاطئة في البداية!" (This is diagnostic only — there are no wrong answers at the start!)

#### Gamification
- +5 points for completing pre-test (regardless of score)
- Badge: "نقطة البداية" (Starting Point)

---

### SCO 03: أساسيات الابتكار (Foundations of Innovation)

**SCO ID:** `sco_03_innovation_foundations`
**Type:** Lesson (Module 1)
**Duration:** 35 minutes (~12-14 slides)
**Prerequisites:** SCO 02 complete
**Objectives Covered:** Obj 1 (Remember), Obj 2 (Understand), Obj 4 (Apply — intro to SCAMPER)
**Bloom's Levels:** Remember, Understand, Apply

#### Content Sections

**Section A: What is Innovation? (ما هو الابتكار؟)**
Duration: ~12 minutes (4-5 slides)

| Slide | Gagne's Event | Content | Component | Duration |
|-------|--------------|---------|-----------|----------|
| 1 | 1. Gain attention | Hook: "كل شيء حولك بدأ بفكرة..." (Everything around you started as an idea...) — show 3 Saudi innovations (Absher, Noon, Careem) with before/after | **content-carousel** — swipe through 3 innovation stories with images | 1.5 min |
| 2 | 2. Inform objectives | "بنهاية هذا الدرس ستتمكن من تعريف الابتكار وعناصره الثلاثة" + Obj 1 & 2 displayed | Text slide with objective badges | 30 sec |
| 3 | 3. Stimulate recall | "في دراستك للبرمجة، أنت تبتكر حلولًا يوميًا..." Connect innovation to coding | Callout box | 30 sec |
| 4 | 4. Present content | Innovation definition + 3 dimensions: (1) New solutions, (2) Improving existing products/services, (3) Using new techniques | **tabs** — 3 tabs, each dimension with example and visual | 3 min |
| 5 | 5. Provide guidance | Real-world examples for each dimension mapped to Saudi context | **markers** — an infographic image with 3 clickable markers revealing examples | 2 min |
| 6 | 6. Elicit performance | Quick reflection: "اختر مثالًا من حياتك..." (Choose an example from your life...) | Text prompt (no grading) | 1 min |
| 7 | 8. Assess | Knowledge check: "Which of the following is NOT one of the 3 dimensions of innovation?" | **per-choice-feedback** MCQ — each wrong answer explains why | 1.5 min |

**Section B: Idea Generation & Brainstorming (توليد الأفكار والعصف الذهني)**
Duration: ~8 minutes (3 slides)

| Slide | Gagne's Event | Content | Component | Duration |
|-------|--------------|---------|-----------|----------|
| 8 | 4. Present content | Brainstorming techniques overview: Free association, Mind maps | **accordion** — expand each technique to see definition + example + when to use | 3 min |
| 9 | 4. Present content | Mind map visual example: central topic → branches | **labeled-graphic** — interactive mind map where learners click branches to see how ideas connect | 2.5 min |
| 10 | 8. Assess | Knowledge check: "ما هي التقنية الأنسب لتنظيم الأفكار بصريًا؟" (Which technique is best for organizing ideas visually?) | MCQ with feedback | 1.5 min |

**Section C: SCAMPER Method (طريقة سكامبر)**
Duration: ~10 minutes (3-4 slides)

| Slide | Gagne's Event | Content | Component | Duration |
|-------|--------------|---------|-----------|----------|
| 11 | 4. Present content | SCAMPER acronym breakdown: S-C-A-M-P-E-R with Arabic + English for each letter | **flip-card** — 7 cards, front: letter + Arabic name, back: definition + example applied to "improving a university app" | 4 min |
| 12 | 5. Provide guidance | Worked example: Apply SCAMPER to improve a food delivery app | **timeline** — 7 steps showing each SCAMPER technique applied in sequence | 3 min |
| 13 | 6. Elicit performance | Practice: "Apply one SCAMPER technique to improve your university's website" | Interactive prompt with **button-set** to choose which technique, then reveal sample answer | 2 min |
| 14 | 8. Assess | Knowledge check: "SCAMPER stands for...?" — match letters to meanings | **matching-dropdown** — 7 dropdowns matching each letter to its meaning | 1.5 min |

**Section D: Entrepreneurship (ريادة الأعمال)**
Duration: ~8 minutes (3 slides)

| Slide | Gagne's Event | Content | Component | Duration |
|-------|--------------|---------|-----------|----------|
| 15 | 4. Present content | Definition: Transforming ideas into successful projects. Mindset: problem-solving, creativity, flexibility | **callout** boxes highlighting 3 mindset traits + text content | 2.5 min |
| 16 | 5. Provide guidance | Saudi entrepreneur examples (Vision 2030 context) — entrepreneurs who identified opportunities and took risks | **click-reveal** — 3 entrepreneur profiles, click to reveal their story | 3 min |
| 17 | 8. Assess | Knowledge check: "أي من التالي يصف ريادة الأعمال بشكل أفضل؟" (Which best describes entrepreneurship?) | **per-choice-feedback** MCQ | 1.5 min |

**Slide 18: Module Summary & Transition**
| Slide | Gagne's Event | Content | Component | Duration |
|-------|--------------|---------|-----------|----------|
| 18 | 9. Enhance retention | Key takeaways: Innovation (3 dimensions) + Idea generation (brainstorming, SCAMPER) + Entrepreneurship (mindset) | Summary card + transition to Module 2 | 1 min |

#### Interactive Components Summary (SCO 03)
1. **content-carousel** — Innovation stories
2. **tabs** — 3 dimensions of innovation
3. **markers** — Real-world examples infographic
4. **per-choice-feedback** — Knowledge check (innovation)
5. **accordion** — Brainstorming techniques
6. **labeled-graphic** — Mind map exploration
7. **flip-card** — SCAMPER acronym
8. **timeline** — SCAMPER worked example
9. **button-set** — SCAMPER practice
10. **matching-dropdown** — SCAMPER knowledge check
11. **click-reveal** — Entrepreneur profiles
12. **per-choice-feedback** — Entrepreneurship knowledge check

#### Gamification (SCO 03)
- +5 points per knowledge check answered correctly (4 checks = max 20 pts)
- +15 points for completing the module
- Progress bar: Module 1 of 3 complete (33%)
- Celebration animation on module completion
- Badge: "مبتكر مبتدئ" (Beginner Innovator)

---

### SCO 04: عقلية الابتكار التقني والتفكير التصميمي (Technology Innovation Mindset & Design Thinking)

**SCO ID:** `sco_04_innovation_mindset`
**Type:** Lesson (Module 2)
**Duration:** 40 minutes (~14-16 slides)
**Prerequisites:** SCO 03 complete
**Objectives Covered:** Obj 3 (Understand), Obj 4 (Apply), Obj 5 (Apply)
**Bloom's Levels:** Understand, Apply

#### Content Sections

**Section A: The Three Requirements (المتطلبات الثلاثة)**
Duration: ~8 minutes (3 slides)

| Slide | Gagne's Event | Content | Component | Duration |
|-------|--------------|---------|-----------|----------|
| 1 | 1. Gain attention | Hook: "لماذا تنجح شركات مثل Google وApple بينما تفشل أخرى؟" (Why do companies like Google and Apple succeed while others fail?) | Question slide with compelling visuals | 1 min |
| 2 | 2. Inform objectives | Objectives 3, 4, 5 displayed | Text slide with objective badges | 30 sec |
| 3 | 4. Present content | Technology Innovation Mindset overview: not limited to tech companies. Three requirements: (1) Design Thinking, (2) Agility & Adaptability, (3) Technology-Market Fit | **hotspot** — central diagram with 3 interconnected circles; click each to reveal its description and why it matters | 3 min |
| 4 | 3. Stimulate recall | Connect to Module 1: "تعلمنا أن الابتكار يحتاج أفكارًا... الآن سنتعلم كيف نحولها إلى واقع" (We learned innovation needs ideas... now we learn how to make them reality) | Callout bridge slide | 1 min |

**Section B: Design Thinking Deep Dive (التفكير التصميمي بالتفصيل)**
Duration: ~20 minutes (7-8 slides)

| Slide | Gagne's Event | Content | Component | Duration |
|-------|--------------|---------|-----------|----------|
| 5 | 4. Present content | Design Thinking overview: human-centered innovation, used by Google, Apple, leading companies | Text + visual of the 5-phase cycle diagram | 2 min |
| 6 | 4. Present content | Phase 1 & 2: Empathize (التعاطف) + Define (عرّف) — observation, interviews, user testing; clarifying the problem | **tabs** — Tab 1: Empathize (definition, methods, example), Tab 2: Define (definition, methods, example) | 3 min |
| 7 | 4. Present content | Phase 3: Ideate (التفكير) — brainstorm multiple solutions, no bad ideas, quantity over quality | Text content + connection back to SCAMPER from Module 1 | 2 min |
| 8 | 4. Present content | Phase 4 & 5: Prototype (النموذج الأولي) + Test (الاختبار) — build simple models, evaluate and improve | **tabs** — Tab 1: Prototype (types, examples), Tab 2: Test (methods, iteration) | 3 min |
| 9 | 5. Provide guidance | Worked example: Apply Design Thinking to improve university course registration | **timeline** — 5 steps showing each phase applied to the registration problem with specific outputs at each stage | 4 min |
| 10 | 6. Elicit performance | Mini-activity: "Put the 5 phases in correct order" | **sequence-sort** — drag the 5 phases into correct order | 2.5 min |
| 11 | 7. Provide feedback | Correct order revealed with explanation of why order matters (empathy MUST come first) | Feedback slide with correct sequence highlighted | 1 min |
| 12 | 8. Assess | Knowledge check: "ما المرحلة الأولى في التفكير التصميمي؟" (What is the first phase?) + "لماذا تأتي مرحلة التعاطف أولًا؟" (Why does empathy come first?) | **per-choice-feedback** MCQ — 2 questions | 2 min |

**Section C: Agility & Adaptability (المرونة والقدرة على التكيف)**
Duration: ~10 minutes (4 slides)

| Slide | Gagne's Event | Content | Component | Duration |
|-------|--------------|---------|-----------|----------|
| 13 | 4. Present content | Agility vs. Adaptability: definitions, differences, examples | **flip-card** — 2 cards: front "المرونة" / "القدرة على التكيف", back: definition, example, when each matters | 3 min |
| 14 | 4. Present content | Identifying business opportunities: market demand, solving real problems, key factors (customer needs, feasibility, scalability) | **accordion** — 3 sections: Market Demand, Problem-Solution Fit, Scalability | 3 min |
| 15 | 6. Elicit performance | Scenario: A tech startup faces a sudden market shift. What would agility look like? What about adaptability? | **branching-scenario** — choose agile response vs. adaptive response, see outcomes of each | 2.5 min |
| 16 | 8. Assess | Knowledge check: "الفرق بين المرونة والقدرة على التكيف هو..." (The difference between agility and adaptability is...) | True/False with feedback | 1.5 min |

**Slide 17: Module Summary**
| Slide | Gagne's Event | Content | Component | Duration |
|-------|--------------|---------|-----------|----------|
| 17 | 9. Enhance retention | Summary: 3 Requirements → Design Thinking (5 phases) → Agility vs. Adaptability → Business Opportunities | Summary card + transition to Module 3 | 1 min |

#### Interactive Components Summary (SCO 04)
1. **hotspot** — Three requirements diagram
2. **tabs** — Design Thinking phases (Empathize + Define)
3. **tabs** — Design Thinking phases (Prototype + Test)
4. **timeline** — Design Thinking worked example
5. **sequence-sort** — Order the 5 phases
6. **per-choice-feedback** — Design Thinking knowledge check
7. **flip-card** — Agility vs. Adaptability
8. **accordion** — Business opportunity factors
9. **branching-scenario** — Agility/Adaptability scenario
10. True/False quiz (standard quiz engine)

#### Gamification (SCO 04)
- +5 points per knowledge check correct (3 checks = max 15 pts)
- +10 points for sequence-sort correct on first try
- +15 points for completing the module
- Progress bar: Module 2 of 3 complete (67%)
- Celebration animation on module completion
- Badge: "مفكر تصميمي" (Design Thinker)

---

### SCO 05: من الفكرة إلى السوق (From Idea to Market)

**SCO ID:** `sco_05_idea_to_market`
**Type:** Lesson (Module 3)
**Duration:** 35 minutes (~12-14 slides)
**Prerequisites:** SCO 04 complete
**Objectives Covered:** Obj 6 (Analyze), Obj 7 (Evaluate), Obj 8 (Create — introduction)
**Bloom's Levels:** Analyze, Evaluate, Create

#### Content Sections

**Section A: Technology-Market Fit (ملاءمة التكنولوجيا للسوق)**
Duration: ~15 minutes (5-6 slides)

| Slide | Gagne's Event | Content | Component | Duration |
|-------|--------------|---------|-----------|----------|
| 1 | 1. Gain attention | Hook: "70% من المنتجات الرقمية تفشل... ما السر؟" (70% of digital products fail... what's the secret?) — compelling statistic | Question slide with dramatic visual | 1 min |
| 2 | 2. Inform objectives | Objectives 6, 7, 8 displayed | Text with objective badges | 30 sec |
| 3 | 3. Stimulate recall | "في الوحدة السابقة تعلمنا التفكير التصميمي... الآن نتعلم كيف نختبر فكرتنا في السوق" (Previously we learned Design Thinking... now we learn to test our idea in the market) | Callout bridge | 30 sec |
| 4 | 4. Present content | Technology-Market Fit: definition, why it matters, technology must align with user needs | Text content with visual diagram showing product ↔ market alignment | 2 min |
| 5 | 4. Present content | Understanding market needs: research methods, competition analysis, customer feedback loops | **accordion** — 3 sections: Market Research, Competition Analysis, Customer Feedback | 3 min |
| 6 | 5. Provide guidance | Case study: A Saudi app that achieved market fit vs. one that didn't | **click-reveal** — 2 case studies side by side, click to reveal analysis of why one succeeded and one failed | 3 min |
| 7 | 8. Assess | Knowledge check: "لماذا تفشل معظم المنتجات الرقمية؟" (Why do most digital products fail?) | **per-choice-feedback** MCQ | 1.5 min |

**Section B: Prototyping & Experimentation (النماذج الأولية والتجريب)**
Duration: ~10 minutes (3-4 slides)

| Slide | Gagne's Event | Content | Component | Duration |
|-------|--------------|---------|-----------|----------|
| 8 | 4. Present content | Prototype types: Paper (sketches), Digital (interactive mockups), Physical (product models) | **flip-card** — 3 cards: front shows prototype type name + icon, back shows definition + when to use + example image | 3 min |
| 9 | 4. Present content | Iterative process: Build → Test → Refine → Repeat. A/B Testing: comparing two options | **timeline** — 4-step iteration cycle + A/B testing visual comparison | 3 min |
| 10 | 6. Elicit performance | "أي نوع من النماذج الأولية ستختار لـ...؟" (Which prototype type would you choose for...?) — 3 scenarios | **button-set** — 3 scenarios with 3 choices each, immediate feedback | 2.5 min |
| 11 | 8. Assess | Knowledge check: Identify correct prototype type for a given scenario | MCQ with feedback | 1.5 min |

**Section C: Building an Entrepreneurial Mindset (بناء عقلية ريادية)**
Duration: ~10 minutes (4 slides)

| Slide | Gagne's Event | Content | Component | Duration |
|-------|--------------|---------|-----------|----------|
| 12 | 4. Present content | Entrepreneurial mindset principles: failure as learning, openness to feedback, continuous curiosity | **markers** — central "mindset" graphic with 4 clickable markers: growth mindset, feedback loops, curiosity, resilience | 3 min |
| 13 | 4. Present content | Tools: Lean Startup methodology, Business Model Canvas (BMC) | **tabs** — Tab 1: Lean Startup (Build-Measure-Learn cycle), Tab 2: BMC (9 building blocks overview) | 3 min |
| 14 | 4. Present content | Overcoming challenges: resistance to change, fear of failure. Solutions: encourage experimentation, foster openness | **callout** boxes with challenge/solution pairs | 2 min |
| 15 | 8. Assess | Knowledge check: "أي من الأدوات التالية يستخدم نموذج البناء-القياس-التعلم؟" (Which tool uses the Build-Measure-Learn model?) | True/False + MCQ with feedback | 1.5 min |

**Slide 16: Course Summary**
| Slide | Gagne's Event | Content | Component | Duration |
|-------|--------------|---------|-----------|----------|
| 16 | 9. Enhance retention | Full course summary: Module 1 (Innovation + SCAMPER) → Module 2 (Design Thinking + Agility) → Module 3 (Market Fit + Prototyping + Mindset). Transition to activities. | Summary card with all key terms | 1.5 min |

#### Interactive Components Summary (SCO 05)
1. **accordion** — Market needs methods
2. **click-reveal** — Success/failure case studies
3. **per-choice-feedback** — Market fit knowledge check
4. **flip-card** — Prototype types
5. **timeline** — Iteration cycle + A/B testing
6. **button-set** — Prototype selection practice
7. **markers** — Entrepreneurial mindset graphic
8. **tabs** — Lean Startup + BMC tools
9. **callout** — Challenge/solution pairs
10. MCQ/TF quiz (standard quiz engine)

#### Gamification (SCO 05)
- +5 points per knowledge check correct (3 checks = max 15 pts)
- +15 points for completing the module
- Progress bar: Module 3 of 3 complete (100%)
- Major celebration animation: all content modules done
- Badge: "رائد أعمال رقمي" (Digital Entrepreneur)

---

### SCO 06: الأنشطة التفاعلية (Interactive Activities)

**SCO ID:** `sco_06_activities`
**Type:** Activity (Application & Synthesis)
**Duration:** 20 minutes (~8-10 slides)
**Prerequisites:** SCOs 03, 04, 05 complete
**Objectives Covered:** Obj 4 (Apply), Obj 5 (Apply), Obj 6 (Analyze), Obj 7 (Evaluate), Obj 8 (Create)
**Bloom's Levels:** Apply, Analyze, Evaluate, Create

#### Activity 1: Design Thinking Sort (ترتيب التفكير التصميمي)
Duration: ~6 minutes (2-3 slides)

| Slide | Content | Component | Duration |
|-------|---------|-----------|----------|
| 1 | Activity introduction: "رتب مراحل التفكير التصميمي ثم طابق كل مرحلة مع وصفها" (Order the Design Thinking phases, then match each to its description) | Instruction slide | 30 sec |
| 2 | Part A: Drag the 5 phases into correct order | **sequence-sort** — 5 draggable items: التعاطف، عرّف، التفكير، النموذج الأولي، الاختبار | 2.5 min |
| 3 | Part B: Match each phase to its description | **drag-drop** — 5 phases on left, 5 descriptions on right, drag to match | 3 min |

**Assessment:** +10 points for correct order, +10 points for correct matching. Immediate feedback with explanations.

#### Activity 2: Market Fit Scenario (سيناريو ملاءمة السوق)
Duration: ~7 minutes (3-4 slides)

| Slide | Content | Component | Duration |
|-------|---------|-----------|----------|
| 4 | Scenario setup: "أحمد طور تطبيقًا لإدارة المهام..." (Ahmad developed a task management app...) — introduce fictional Saudi tech product with details | Story slide with character | 1 min |
| 5 | Question 1: "من الجمهور المستهدف لهذا التطبيق؟" (Who is the target audience?) + Question 2: "أي نوع نموذج أولي يجب أن يبدأ به؟" (What prototype type should he start with?) | **branching-scenario** — choose audience → see market analysis, choose prototype → see feedback | 3 min |
| 6 | Question 3: "هل حقق التطبيق ملاءمة السوق؟ لماذا؟" (Did the app achieve market fit? Why?) | **per-choice-feedback** MCQ — 4 options with detailed analysis for each choice | 1.5 min |
| 7 | Question 4: "اقترح تحسينًا باستخدام اختبار A/B" (Suggest an A/B test improvement) | **button-set** — choose from 3 A/B test proposals, see predicted outcomes | 1.5 min |

**Assessment:** +5 points per correct answer (4 questions = max 20 pts). Scenario-based feedback.

#### Activity 3: Entrepreneurial Mindset Classification (تصنيف العقلية الريادية)
Duration: ~7 minutes (2-3 slides)

| Slide | Content | Component | Duration |
|-------|---------|-----------|----------|
| 8 | Activity introduction: "صنّف السلوكيات التالية..." (Classify the following behaviors into those that support vs. hinder an entrepreneurial mindset) | Instruction slide | 30 sec |
| 9 | Sort 12 behavior cards into two categories: "يدعم العقلية الريادية" (Supports) vs. "يعيق العقلية الريادية" (Hinders) | **drag-drop** — 12 cards to sort into 2 zones. Behaviors include: embracing failure, avoiding risk, seeking feedback, resisting change, continuous learning, waiting for perfection, networking, working alone, etc. | 5 min |
| 10 | Results + explanation: Why each behavior supports or hinders, with growth mindset messaging | Feedback slide with explanations per item | 1.5 min |

**Assessment:** +2 points per correct classification (12 items = max 24 pts). Growth mindset feedback: "رائع! كل سلوك تتعلمه يقربك من العقلية الريادية" (Great! Each behavior you learn brings you closer to the entrepreneurial mindset)

#### Interactive Components Summary (SCO 06)
1. **sequence-sort** — Design Thinking phase ordering
2. **drag-drop** — Phase-to-description matching
3. **branching-scenario** — Market fit analysis
4. **per-choice-feedback** — Market fit evaluation
5. **button-set** — A/B test proposal
6. **drag-drop** — Mindset classification (supports vs. hinders)

#### Gamification (SCO 06)
- Points per activity (see above): max 54 pts total
- Streak bonus: +10 if all 3 activities completed without mistakes
- Badge: "مبتكر متمرس" (Skilled Innovator)
- Celebration animation after each activity completion

---

### SCO 07: الاختبار البعدي (Post-Test)

**SCO ID:** `sco_07_posttest`
**Type:** Assessment (Summative)
**Duration:** 10 minutes (~10-12 slides)
**Prerequisites:** SCO 06 complete
**Passing Score:** 70% (7 out of 10 correct)
**Retries Allowed:** Yes (2 attempts)

#### Question Plan

| # | Objective | Bloom's | Type | Topic | Difficulty | Slide |
|---|-----------|---------|------|-------|------------|-------|
| 1 | Obj 1 | Understand | MCQ (4) | Innovation definition & 3 elements | Easy | 1 |
| 2 | Obj 1 | Remember | MCQ (4) | SCAMPER letters and meanings | Easy | 2 |
| 3 | Obj 2 | Understand | True/False | Entrepreneurship characteristics | Easy | 3 |
| 4 | Obj 3 | Understand | MCQ (4) | 3 requirements of innovation mindset | Medium | 4 |
| 5 | Obj 4, 5 | Apply | MCQ (4) | Design Thinking phases — correct order | Medium | 5 |
| 6 | Obj 3 | Analyze | True/False | Agility vs. Adaptability distinction | Medium | 6 |
| 7 | Obj 6 | Analyze | MCQ (4) | Technology-Market Fit scenario analysis | Hard | 7 |
| 8 | Obj 5 | Apply | MCQ (4) | Prototype type selection for scenario | Medium | 8 |
| 9 | Obj 2 | Understand | True/False | Lean Startup & BMC tools | Easy | 9 |
| 10 | Obj 7 | Evaluate | MCQ (4) | Overcoming innovation challenges — best strategy | Hard | 10 |

#### Objective Coverage Matrix

| Objective | Questions | Weight |
|-----------|-----------|--------|
| Obj 1: Innovation elements + brainstorming | Q1, Q2 | 20% |
| Obj 2: Entrepreneurship + innovation | Q3, Q9 | 20% |
| Obj 3: Design Thinking phases | Q4, Q6 | 20% |
| Obj 4: SCAMPER method | (covered via Q2) | — |
| Obj 5: Design Thinking prototype | Q5, Q8 | 20% |
| Obj 6: Technology-Market Fit | Q7 | 10% |
| Obj 7: Evaluate opportunities | Q10 | 10% |
| Obj 8: Design solution | (assessed in SCO 06 activities) | — |

#### Design Notes
- One question per slide for focus
- No going back to change answers (prevents cheating)
- Immediate feedback after each question (show correct + explanation)
- Growth mindset messaging for wrong answers: "ليس بعد — أنت تتعلم!" (Not yet — you're learning!)
- Final results slide: score, pass/fail, certificate message
- Compare pre-test vs. post-test: show growth

#### Gamification (SCO 07)
- +5 points per correct answer (max 50 pts)
- Streak bonus: +5 for every 3 correct in a row
- Pass (70%+): +25 bonus points + major celebration
- Perfect score (100%): +50 bonus points + special badge "خبير الابتكار" (Innovation Expert)
- Badge for passing: "متعلم معتمد" (Certified Learner)

---

## Assessment Alignment Map (Full Course)

| Objective | Bloom's | Pre-Test | Module KCs | Activities | Post-Test |
|-----------|---------|----------|------------|------------|-----------|
| Obj 1: Innovation elements | Remember | Q1, Q2 | SCO 03: KC1, KC2 | — | Q1, Q2 |
| Obj 2: Entrepreneurship | Understand | Q4 | SCO 03: KC4 | — | Q3, Q9 |
| Obj 3: Design Thinking phases | Understand | Q3 | SCO 04: KC1, KC2 | — | Q4, Q6 |
| Obj 4: SCAMPER method | Apply | — | SCO 03: KC3 | Activity 1 | Q2 |
| Obj 5: Build prototype | Apply | — | SCO 04: KC1 (seq-sort) | Activity 1 | Q5, Q8 |
| Obj 6: Tech-Market Fit | Analyze | Q5 | SCO 05: KC1 | Activity 2 | Q7 |
| Obj 7: Evaluate opportunities | Evaluate | — | SCO 05: KC3 | Activity 2 | Q10 |
| Obj 8: Design solution | Create | — | — | Activity 2, 3 | — |

KC = Knowledge Check within the module lesson

---

## Content Type Distribution

| Content Type | Count | Percentage |
|-------------|-------|------------|
| Text/instructional content | ~40 slides | 50% |
| Interactive components | 38 instances | 30% |
| Assessment questions | 27 items | 15% |
| Media/visuals (diagrams, graphics) | ~15 items | 5% |

### Interactive Component Usage Across Course

| Component | Count | Where Used |
|-----------|-------|------------|
| **flip-card** | 3 | SCO 01 (objectives), SCO 03 (SCAMPER), SCO 04 (agility vs adaptability), SCO 05 (prototypes) |
| **tabs** | 4 | SCO 01 (navigation), SCO 03 (innovation dimensions), SCO 04 (DT phases x2), SCO 05 (tools) |
| **progress-journey** | 1 | SCO 01 (learning map) |
| **content-carousel** | 1 | SCO 03 (innovation stories) |
| **markers** | 2 | SCO 03 (examples infographic), SCO 05 (mindset graphic) |
| **accordion** | 2 | SCO 03 (brainstorming techniques), SCO 04 (business opportunities) |
| **labeled-graphic** | 1 | SCO 03 (mind map) |
| **timeline** | 2 | SCO 03 (SCAMPER example), SCO 05 (iteration cycle) |
| **matching-dropdown** | 1 | SCO 03 (SCAMPER matching) |
| **button-set** | 2 | SCO 03 (SCAMPER practice), SCO 05 (prototype selection), SCO 06 (A/B test) |
| **click-reveal** | 2 | SCO 03 (entrepreneur profiles), SCO 05 (case studies) |
| **per-choice-feedback** | 4 | SCO 03 (KC x2), SCO 04 (DT KC), SCO 05 (market fit KC), SCO 06 (scenario) |
| **hotspot** | 1 | SCO 04 (3 requirements diagram) |
| **sequence-sort** | 2 | SCO 04 (DT phase ordering), SCO 06 (Activity 1) |
| **branching-scenario** | 2 | SCO 04 (agility/adaptability), SCO 06 (market fit) |
| **drag-drop** | 2 | SCO 06 (phase matching, mindset classification) |
| **callout** | 2 | SCO 03, SCO 05 |

**Total interactive component instances:** 34
**Unique component types used:** 17 out of 42 available

---

## NELC Compliance Checklist

| Requirement | Implementation | Status |
|------------|----------------|--------|
| Min 2 interaction types per module | SCO 03: 12 components, SCO 04: 10, SCO 05: 10 | PASS |
| Video max 10 min per segment | No video content (all interactive HTML) | PASS |
| Arabic RTL with 18px+ body text | dir="rtl" lang="ar", Cairo font 18px body | PASS |
| Self-contained package | All fonts/assets bundled locally | PASS |
| WCAG 2.1 AA accessibility | Semantic HTML, alt text, keyboard nav, ARIA | PASS |
| Measurable objectives at every level | 8 objectives mapped to Bloom's levels | PASS |
| Assessment alignment | Pre/post tests + activities cover all objectives | PASS |

---

## Quality Matters Essential Standards Alignment

| QM Standard | Implementation |
|-------------|----------------|
| 1.2: Introduction with getting started | SCO 01: Welcome + navigation guide |
| 2.1: Measurable learning objectives | 8 objectives with Bloom's taxonomy levels |
| 2.2: Module-level objectives | Each SCO has specific objectives listed |
| 3.1: Assessments measure objectives | Alignment map shows full coverage |
| 3.3: Assessment timing/purpose clear | Pre-test (diagnostic), KCs (formative), Post-test (summative) |
| 4.1: Instructional materials aligned | Content directly supports each objective |
| 5.1: Learning activities promote engagement | 17 unique interactive component types, 34 instances |
| 6.1: Tools support objectives | SCAMPER, Design Thinking, BMC — all explained and practiced |
| 8.1: Accessibility (ADA) | WCAG 2.1 AA, keyboard nav, semantic HTML |

---

## Gamification Summary

### Point System

| Action | Points |
|--------|--------|
| Complete introduction | 10 |
| Complete pre-test | 5 |
| Knowledge check correct | 5 each |
| Module completion | 15 each |
| Activity 1 (Design Thinking Sort) | max 20 |
| Activity 2 (Market Fit Scenario) | max 20 |
| Activity 3 (Mindset Classification) | max 24 |
| Post-test correct answer | 5 each |
| Post-test pass bonus | 25 |
| Streak bonuses | 5-10 various |

**Maximum possible points:** ~250 points

### Badge Progression

| Badge | Arabic | Earned When |
|-------|--------|-------------|
| Journey Begins | بداية الرحلة | SCO 01 complete |
| Starting Point | نقطة البداية | SCO 02 complete |
| Beginner Innovator | مبتكر مبتدئ | SCO 03 complete |
| Design Thinker | مفكر تصميمي | SCO 04 complete |
| Digital Entrepreneur | رائد أعمال رقمي | SCO 05 complete |
| Skilled Innovator | مبتكر متمرس | SCO 06 complete |
| Certified Learner | متعلم معتمد | SCO 07 pass (70%+) |
| Innovation Expert | خبير الابتكار | SCO 07 perfect (100%) |

### Progress Visualization
- Per-SCO progress bar within each lesson
- Course-level progress journey (visible in SCO 01 map, updated throughout)
- Module completion milestones at 33%, 67%, 100%
- Points counter in header (animated increment)

---

## Accessibility Notes

- All images require descriptive alt text in Arabic
- Interactive components must be keyboard navigable (Tab, Enter, Space, Arrow keys)
- Color is never the sole indicator (always paired with icons or text)
- Minimum contrast ratio 4.5:1 for all text
- Focus indicators visible on all interactive elements
- Skip navigation links in every SCO
- ARIA roles and labels on all custom components
- Screen reader compatible quiz questions
- prefers-reduced-motion: disable celebration animations
- Touch targets minimum 44x44px for mobile LMS access

---

## File Naming Convention

| SCO | Folder Name | Main File |
|-----|-------------|-----------|
| SCO 01 | `sco_01_introduction/` | `index.html` |
| SCO 02 | `sco_02_pretest/` | `index.html` |
| SCO 03 | `sco_03_innovation_foundations/` | `index.html` |
| SCO 04 | `sco_04_innovation_mindset/` | `index.html` |
| SCO 05 | `sco_05_idea_to_market/` | `index.html` |
| SCO 06 | `sco_06_activities/` | `index.html` |
| SCO 07 | `sco_07_posttest/` | `index.html` |

---

## Handoff Notes for Downstream Agents

### For Content Renderer
- Each SCO's slide plan above gives exact slide-by-slide content
- Component names match the 42-component library filenames (e.g., `flip-card` = `flip-card.html`)
- All text content is bilingual: Arabic primary, English technical terms in parentheses
- Fixed 16:9 slide layout — do NOT make scrollable pages
- Use slide-controller.js for all navigation
- quiz-engine.js for SCO 02, SCO 07, and knowledge checks within SCO 03-05

### For Assessment Builder
- Pre-test: 5 questions (diagnostic, no pass/fail)
- Post-test: 10 questions (70% pass, 2 retries)
- Knowledge checks: 3-4 per content SCO (formative, within lesson flow)
- Activities: 3 graded activities in SCO 06
- All questions must have Arabic text + growth mindset feedback
- Report scores via cmi.core.score and answers via cmi.interactions

### For Art Director
- Corporate Clean theme with Najran University navy (#003366) + gold accent
- Arabic RTL: Noto Kufi Arabic headings, Cairo body (18px+)
- Fixed slides 1280x720
- Premium CSS utilities available: .shadow-md, .glass, .elastic-click, .hover-lift
- Celebration animations for achievements (confetti.js)
- Sound effects for correct/incorrect answers (sound-effects.js)

### For SCORM Packager
- 7 SCOs in linear sequence
- SCORM 1.2 for Moodle compatibility
- Each SCO reports: completion_status, score (assessments), session_time
- Pre-test: always "completed" regardless of score
- Content SCOs: "completed" when last slide reached
- Activities: "completed" when all 3 activities attempted
- Post-test: "passed"/"failed" based on 70% threshold
