# AI-Assisted Translation Practice Tool (HUFLIT) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, responsive, full-stack AI-Assisted Translation Practice Web Application for HUFLIT English-Vietnamese and Vietnamese-English translation students, featuring 31 functions across Student, Teacher, Admin, and Research portals, powered by Next.js, Prisma, PostgreSQL, structured MQM AI evaluation, and comprehensive research analytics.

**Architecture:** Next.js 14 App Router full-stack web application with modular domain features (`auth`, `learning`, `evaluation`, `post-editing`, `memory`, `research`, `admin`), Prisma ORM over PostgreSQL, async AI job evaluation queue with pluggable AI Provider architecture (Mock + Live OpenAI/Gemini providers), server-side RBAC and data access layer, and an accessible, responsive Tailwind CSS UI.

**Tech Stack:** Next.js 14 (App Router), React 18/19, TypeScript, Tailwind CSS, Lucide React, PostgreSQL 16, Prisma ORM, Jose/Bcrypt authentication, BullMQ/In-process queue, Zod validation, Vitest for testing, Docker Compose.

**Spec:** User Master Product Blueprint v1.0 (PRD + SRS + Technical Design + AI Agent Implementation Instructions).

## Global Constraints

- Four explicit roles: `STUDENT`, `TEACHER`, `RESEARCHER`, `ADMIN`. Server and DB access authorization enforced on every route.
- Human-first principle: Student translates first, original translation is immutable, AI feedback provided only after submit.
- Multi-directional: English to Vietnamese and Vietnamese to English translation practice across CEFR B1, B2, C1.
- MQM standard subset: Accuracy, Fluency, Terminology, Style/Register with configurable severity weights (Minor=1, Major=5, Critical=10, Neutral=0).
- Unicode-safe span highlighting with fallback to segment/document level when unanchored.
- Configurable Training Mode clipboard policy: `OFF`, `WARN`, `BLOCK_IN_EDITOR`.
- Research data integrity: Versioned prompts and rubrics, immutable attempt histories, pseudonymous codes, SUS standardized scoring formula, CSV formula-injection sanitized export with UTF-8 BOM.
- Clear separation between Mock and Live AI providers; no fake data stored as real research findings.

## Review Focus

1. **Attempt Immutability & Concurrency:** Ensure multiple submits or network retries do not overwrite the original translation version (idempotency & version 1 lock).
2. **Unicode Span Matching:** Ensure Vietnamese accented characters (diacritics) and multi-byte runes do not cause offset drift or slice corruptions when highlighting `targetQuote`.
3. **RBAC Resource Authorization:** Ensure students cannot access other students' attempts or hidden system prompts via URL ID manipulation; teachers cannot access unassigned studies; researchers cannot view de-anonymized PII without proper consent.
4. **AI Evaluation Failure Handling:** Worker failures, timeout, or provider downtime must transition state to `FEEDBACK_FAILED` with retry capability rather than hanging indefinitely.
5. **CSV Injection & UTF-8 Encoding:** Exported CSVs must escape formula triggers (`=`, `+`, `-`, `@`) and include UTF-8 BOM for Vietnamese Excel compatibility.

---

## Phase 1: Foundation & Infrastructure

### Task 1.1: Project Setup & Dependencies
- [x] Initialize Next.js TypeScript project with Tailwind CSS, Lucide icons, and core libraries.
- [x] Configure `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, and `.gitignore`.
- [x] Install Prisma, Zod, bcryptjs, jsonwebtoken/jose, and test dependencies (vitest).
- [x] Create Docker Compose configuration for PostgreSQL 16 and Redis.
- [x] Verify local database startup via `docker compose up -d postgres`.

### Task 1.2: Database Modeling (Prisma Schema)
- [x] Create `prisma/schema.prisma` with all 29 entities:
  - Users, Roles, Sessions
  - Genres, CEFR levels
  - SourceTexts, SourceTextVersions, CriteriaConfigs, TextSelectionAssessments
  - TranslationTasks, TranslationAttempts, TranslationVersions
  - FeedbackRuns, ErrorAnnotations, PromptVersions, MQMRubricVersions
  - TranslationMemoryEntries
  - ResearchStudies, Participants, Groups, Memberships, Tests, TestAttempts, HumanEvaluations, Surveys, SurveyResponses
  - AIUsageRecords, ExportJobs, AuditLogs
- [x] Run Prisma generate and push migration to PostgreSQL.

### Task 1.3: Authentication & Role-Based Access Control (RBAC)
- [x] Implement password hashing and JWT/session management in `src/lib/auth.ts`.
- [x] Implement middleware and authorization guards in `src/lib/rbac.ts` enforcing permissions for `STUDENT`, `TEACHER`, `RESEARCHER`, `ADMIN`.
- [x] Build Auth API endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`.
- [x] Create public UI pages: Landing page (`/`), Login (`/login`), Register (`/register`).

### Task 1.4: Database Seeding & Mock Data
- [x] Write `prisma/seed.ts` creating:
  - Default users for all 4 roles (student@huflit.edu.vn, teacher@huflit.edu.vn, researcher@huflit.edu.vn, admin@huflit.edu.vn)
  - Standard CEFR levels (B1, B2, C1)
  - Text genres (General, Academic, Business, Tourism, Media/News, Technical, Literary)
  - 8 draft text selection criteria
  - Default MQM Rubric version v1.0
  - Default Hidden Prompt version v1.0
  - Sample bilingual source texts and translation tasks (En->Vi and Vi->En)
  - Sample Translation Memory entries
  - Sample Research Study and SUS Survey template
- [x] Run seed script and verify database contents.

---

## Phase 2: Learning Core & Translation Workspace

### Task 2.1: Source Text & Task Management (Teacher/Admin API & Service)
- [x] Implement Source Text CRUD service and API (`/api/teacher/source-texts`).
- [x] Implement Translation Task CRUD service and API (`/api/teacher/tasks`).
- [x] Implement versioning for Source Texts and immutability rules.

### Task 2.2: Practice Bank & Selection (Student Portal)
- [x] Implement Practice Bank API (`/api/tasks`) with filtering by CEFR, language direction, genre, and search keywords.
- [x] Build Practice Bank UI (`/student/practice`) with filter bar, difficulty badges, and task preview cards.
- [x] Implement CEFR and Genre selector components.

### Task 2.3: Translation Workspace & Editor (F06, F07, F08)
- [x] Create Attempt lifecycle service (`/api/attempts`): Start, Draft save, Submit.
- [x] Build Translation Workspace UI (`/student/practice/[taskId]`):
  - Left panel: Source text, CEFR, language direction, genre, instructions.
  - Right panel: Translation editor with live word and character counters, timer.
  - Autosave mechanism with visual status indicators (Saved, Saving, Offline).
  - Clipboard policy enforcement: `OFF`, `WARN`, `BLOCK_IN_EDITOR`.
  - Submit confirmation modal, preventing empty submissions and double-submits.
- [x] Ensure Attempt status transitions to `SUBMITTED` and original translation becomes immutable version 1.

### Task 2.4: Translation History & Student Dashboard (F02, F15)
- [x] Implement history endpoint (`/api/me/history`) and statistics aggregator (`/api/me/progress`).
- [x] Build Student Dashboard (`/student/dashboard`) with recent translations, statistics cards, and continue practice prompt.
- [x] Build Translation History UI (`/student/history`) with attempt details, timestamps, and filterable list.

---

## Phase 3: AI Evaluation Engine, MQM & Post-Editing

### Task 3.1: AI Provider Architecture & Evaluation Worker
- [x] Define `AIProvider` interface with structured input/output contracts.
- [x] Implement `MockAIProvider` with deterministic, educational MQM evaluation for test/offline use.
- [x] Implement `LiveAIProvider` (Gemini / OpenAI compatible) supporting structured output and prompt injection defense.
- [x] Implement Async Evaluation Job Runner (`src/lib/queue/evaluationQueue.ts`) with retry and timeout logic.

### Task 3.2: MQM Structured Output, Unicode Span Matching & Scoring Engine
- [x] Implement Zod schema for AI evaluation output validation (`overallComment`, `strengths`, `errors`, `suggestedTranslations`, `learningTips`).
- [x] Implement Unicode-safe span matching algorithm in `src/lib/spanMatcher.ts` resolving `targetQuote` and `occurrenceIndex` to character offsets with fallback unanchored status.
- [x] Implement configurable MQM scoring formula in `src/lib/scoring.ts`:
  `score = clamp(100 - 100 * weightedPenalty / max(sourceWordCount, 20), 0, 100)`.

### Task 3.3: MQM Feedback Display & Error Highlighting (F09, F10, F11, F12)
- [x] Build AI Feedback View (`/student/attempts/[attemptId]/feedback`):
  - Segmented feedback tabs: Overview, Errors list, Suggestions, Full Comparison.
  - Interactive MQM Highlighting on the student's translation text:
    - Red for Accuracy, Orange for Fluency, Purple for Terminology, Blue for Style.
    - Accessible badges and icons alongside colors.
    - Clickable error spans triggering error explanation drawer/popover.
  - Error explanation card displaying source evidence, severity, explanation, and suggestion.
  - Loading, error, and retry states for evaluation processing.

### Task 3.4: Post-editing Mode & Translation Comparison (F13, F14)
- [x] Implement Post-editing API (`/api/attempts/[id]/revisions`) to create versioned revisions (Kind: `POST_EDIT`).
- [x] Build Post-editing UI (`/student/attempts/[attemptId]/edit`):
  - Read-only original translation side-by-side with interactive revision editor.
  - Integrated suggestions checklist where students can accept, tweak, or reject suggestions.
  - Visual Diff Viewer comparing original vs revised text.
  - Optional re-evaluation trigger respecting `maxReevaluations`.
  - Finish lesson action transitioning attempt to `COMPLETED`.

### Task 3.5: Progress Tracking & Analytics (F16)
- [x] Implement `/student/progress` page with:
  - Error distribution breakdown chart (by MQM category and severity).
  - Score progression over time.
  - Revision improvement metrics (original vs revised length, error reductions).

---

## Phase 4: Teacher & Admin Portals

### Task 4.1: Admin Dashboard & System Overview (F17)
- [x] Implement `/admin/dashboard` showing total students, teachers, tasks, attempts, AI usage, error rates, and system status.
- [x] Implement Audit Logging system (`/api/admin/audit-logs`) tracking sensitive administrative actions.

### Task 4.2: Text Selection Criteria & CEFR Management (F19, F20)
- [x] Build UI and API for 8 text selection criteria evaluation and versioning (`/admin/criteria`, `/teacher/source-texts/[id]/assess`).
- [x] Build CEFR level classification management (`/admin/levels`).

### Task 4.3: Prompt & Rubric Configuration (F22, F23)
- [x] Implement Prompt Management UI & API (`/admin/prompts`):
  - View prompt versions, create drafts, test against sample text, activate, and rollback.
- [x] Implement MQM Rubric Configuration UI & API (`/admin/mqm`):
  - Manage categories, subtypes, severity weights, and rubric versions.

### Task 4.4: Student & Teacher Management (F24)
- [x] Build Student Management UI (`/teacher/students`, `/admin/users`):
  - User search, status toggling (active/suspended), progress inspection, and class/group assignment.

### Task 4.5: Translation Memory Management (F25)
- [x] Implement Translation Memory API & UI (`/admin/translation-memory`):
  - Search bilingual segments, approve/reject student translation candidates, inspect provenance and domain metadata.

---

## Phase 5: Research Portal & Scientific Tools

### Task 5.1: Research Study & Participant Setup (F26)
- [x] Implement Research Studies API & UI (`/research/studies`):
  - Study protocol setup, participant enrollment, pseudonymous code assignment, informed consent tracking.
  - Experimental group setup (AI-Assisted vs Control group conditions).

### Task 5.2: Pre-test & Post-test Management (F26)
- [x] Build Pre-test/Post-test workflow (`/research/tests`):
  - Assign specific tasks as pre/post tests with locked conditions (e.g. AI disabled for baseline, enabled for training).
  - Human evaluation interface for blinded teacher scoring.

### Task 5.3: Translation Corpus & Comparative Analysis (F27, F28, F29)
- [x] Build Research Corpus Browser (`/research/corpus`):
  - Aligned view of source text, original student translation, AI feedback annotations, and post-edited revisions.
  - Filter by CEFR, genre, and error types with pseudonymized exporter.
  - Build Comparative Analysis & Learning Analytics (`/research/comparison`, `/research/analytics`):
  - Comparison of Pre vs Post scores, error density per 100 words, and experimental vs control group metrics.

### Task 5.4: SUS Questionnaire Module (F30)
- [x] Implement System Usability Scale (SUS) survey engine (`/student/surveys/[surveyId]`, `/research/sus`):
  - Standard 10-item SUS questionnaire with 1-5 Likert scale.
  - Standard scoring algorithm: odd items `(score - 1)`, even items `(5 - score)`, sum multiplied by `2.5`.
  - Aggregated SUS reporting with mean score, percentile, and usability grade.

### Task 5.5: Research Data Export Engine (F31)
- [x] Implement secure CSV/XLSX export service (`/api/research/exports`):
  - Export options: Attempts, Error Annotations, Pre/Post comparison, SUS responses.
  - UTF-8 with BOM for proper Vietnamese character rendering in Excel.
  - Formula injection defense (sanitizing `=`, `+`, `-`, `@` leading characters).
  - Pseudonymized export toggle masking personal identity data.
  - Export audit logging.

---

## Phase 6: Production Readiness, Testing & Documentation

### Task 6.1: Automated Unit & Integration Tests
- [x] Test scoring formula and edge cases in `tests/unit/scoring.test.ts`.
- [x] Test Unicode span matching algorithm in `tests/unit/spanMatcher.test.ts`.
- [x] Test SUS calculation in `tests/unit/sus.test.ts`.
- [x] Test CSV export sanitization in `tests/unit/exportSanitizer.test.ts`.
- [x] Test RBAC and authorization guards in `tests/unit/rbac.test.ts`.
- [x] Test AI Structured Output validation in `tests/unit/aiSchema.test.ts`.

### Task 6.2: Comprehensive Documentation
- [x] `README.md`: System overview, setup guide, demo credentials, architecture summary.
- [x] `docs/architecture.md`: System architecture, component diagrams, workflows.
- [x] `docs/api.md`: Complete API specification for Student, Teacher, Admin, and Research.
- [x] `docs/database.md`: Database ERD and entity dictionary.
- [x] `docs/research.md`: Research protocol, SUS methodology, and data export dictionary.
- [x] `docs/decisions.md`: Architectural decisions and items pending HUFLIT research committee confirmation.
- [x] `docs/deployment.md`: Docker and production deployment instructions.

### Task 6.3: Verification & Acceptance
- [x] Execute test suite with Vitest and verify all pass.
- [x] Run Next.js production build (`npm run build`) and verify zero type/lint errors.
- [x] Verify complete end-to-end flows for all 4 roles.
