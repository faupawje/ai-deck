# AI-Deck — Issues / TODO

> Ordered by dependency. Work top-to-bottom.

---

## Milestone 1: Foundation

### Issue #1 — Project scaffolding
**Priority:** 🔴 Critical | **Estimate:** 30 min

Set up the Next.js project with all dependencies.

- [x] `npx create-next-app@latest` with App Router + TypeScript + Tailwind
- [x] Install core deps: `ai`, `@ai-sdk/google`, `better-sqlite3`, `zod`, `lucide-react`, `clsx`, `tailwind-merge`
- [x] Install UI deps & utilities (`lib/utils.ts`)
- [x] Install types: `@types/better-sqlite3`
- [x] Create `.env.example` with `GOOGLE_GENERATIVE_AI_API_KEY=`
- [x] Verify dev server / build runs

---

### Issue #2 — SQLite database layer
**Priority:** 🔴 Critical | **Estimate:** 1 hour

Create the database schema and query helpers.

- [x] Create `lib/db.ts` — SQLite connection + auto-create tables
- [x] Schema: `projects` table (id, name, description, status, created_at, updated_at)
- [x] Schema: `tasks` table (id, project_id, title, description, status, priority, sprint, assignee, sort_order, created_at, updated_at)
- [x] Schema: `messages` table (id, project_id, role, content, tool_calls_json, created_at)
- [x] Write CRUD helpers: `createProject()`, `getTasks()`, `createTask()`, `updateTask()`, etc.
- [x] Write a seed / verification test
- [x] Verify: tables created, transactions & indexes functional

**Depends on:** #1

## Milestone 2: AI Chat Core

### Issue #3 — Gemini tool definitions
**Priority:** 🔴 Critical | **Estimate:** 1 hour

Define the tools (function declarations) that Gemini can call to interact with project data.

- [x] Create `lib/tools.ts`
- [x] Tool: `create_project` — creates a new project
- [x] Tool: `list_projects` — returns all projects
- [x] Tool: `create_tasks` — bulk-create tasks for a project
- [x] Tool: `list_tasks` — returns tasks for a project, with optional filters
- [x] Tool: `update_task` — update status/priority/assignee of a task
- [x] Tool: `delete_task` — remove a task
- [x] Tool: `show_board` — returns tasks grouped by status (for Kanban rendering)
- [x] Tool: `show_summary` — returns project stats (total, done, in-progress, overdue)
- [x] Each tool has: description, Zod schema for parameters, execute function that calls db

---

### Issue #4 — Chat API route
**Priority:** 🔴 Critical | **Estimate:** 1.5 hours

Create the streaming chat endpoint that connects Gemini with tools and database.

- [x] Create `app/api/chat/route.ts`
- [x] Use Vercel AI SDK `streamText()` with `google()` provider
- [x] Attach tools from `lib/tools.ts`
- [x] Build system prompt with project context (`lib/system-prompt.ts`)
- [x] Handle `stopWhen: isStepCount(5)` for multi-turn tool calling (AI calls tool → gets result → responds)
- [x] Return streaming UI response via `createUIMessageStreamResponse`
- [x] Create companion API routes `/api/projects` and `/api/tasks` for frontend data access
- [x] Verify production build passes

**Depends on:** #3

## Milestone 3: Chat UI

### Issue #5 — Chat interface
**Priority:** 🔴 Critical | **Estimate:** 2 hours

Build the main chat UI — the primary (and only) screen of the MVP.

- [x] Create `app/page.tsx` — main layout with chat
- [x] Create `components/chat.tsx` — message list + input box
- [x] Use Vercel AI SDK `useChat()` hook connected to `/api/chat`
- [x] Render user messages (right-aligned bubbles)
- [x] Render AI text responses (left-aligned, with markdown)
- [x] Auto-scroll to bottom on new messages
- [x] Loading state while AI is responding
- [x] Project selector sidebar with quick prompts

**Depends on:** #4

---

### Issue #6 — Generative UI: Task List component
**Priority:** 🟡 High | **Estimate:** 1.5 hours

Render AI-generated tasks as an interactive, editable checklist in the chat.

- [x] Create `components/generative/task-list.tsx`
- [x] Render tasks with checkboxes, title, priority badge, assignee
- [x] Status toggle (todo ↔ done) with direct SQLite update via `/api/tasks`
- [x] Progress bar and counts
- [x] Wire into chat: when AI calls `create_tasks` or `list_tasks`, render this component

**Depends on:** #5

---

### Issue #7 — Generative UI: Kanban Board component
**Priority:** 🟡 High | **Estimate:** 2 hours

Render tasks as a Kanban board inside the chat.

- [x] Create `components/generative/kanban-board.tsx`
- [x] Columns: To Do | In Progress | In Review | Done
- [x] Task cards with title, priority, assignee
- [x] Quick move controls between columns with instant SQLite updates
- [x] Wire into chat: when AI calls `show_board`, render this component

**Depends on:** #5

---

### Issue #8 — Generative UI: Project Card component
**Priority:** 🟢 Medium | **Estimate:** 45 min

Render a project summary card when a project is created or queried.

- [x] Create `components/generative/project-card.tsx`
- [x] Show: project name, description, status, created date
- [x] Switch-to-project interactive button
- [x] Wire into chat: when AI calls `create_project` or `list_projects`

**Depends on:** #5

---

### Issue #9 — Generative UI: Summary/Chart component
**Priority:** 🟢 Medium | **Estimate:** 1.5 hours

Render project statistics and progress charts.

- [x] Create `components/generative/summary-chart.tsx`
- [x] Progress bar (tasks done / total)
- [x] Status distribution cards (To Do, In Progress, In Review, Done)
- [x] Priority breakdown indicators
- [x] Wire into chat: when AI calls `show_summary`

**Depends on:** #5

---

## Milestone 4: Polish & Testing

### Issue #10 — System prompt engineering
**Priority:** 🟡 High | **Estimate:** 1 hour

Craft and iterate on the system prompt for optimal AI behavior.

- [x] Create `lib/system-prompt.ts`
- [x] Inject dynamic context: active project name, task count, existing tasks summary
- [x] Instruct AI on when to use each tool vs. plain text
- [x] Handle edge cases: no project selected, empty project, ambiguous requests
- [x] Add clear operational guidelines for generative UI trigger

**Depends on:** #4

---

### Issue #11 — Error handling & edge cases
**Priority:** 🟡 High | **Estimate:** 1 hour

- [x] Handle Gemini API errors gracefully (rate limit, missing API key, network)
- [x] Add missing API key banner and instructions
- [x] Empty states: no projects, no tasks, fresh database
- [x] Loading animations for chat and generative components

**Depends on:** #5

---

### Issue #12 — Conversation persistence
**Priority:** 🟢 Medium | **Estimate:** 1 hour

Save and restore chat history per project.

- [x] Create `messages` table in SQLite schema
- [x] Support project-scoped and workspace-wide conversations

**Depends on:** #5

---

### Issue #13 — Basic styling & UX polish
**Priority:** 🟢 Medium | **Estimate:** 1.5 hours

- [x] Dark mode first-class UI styling
- [x] Responsive layout with collapsible sidebar
- [x] Keyboard shortcuts: Enter to send
- [x] Welcome screen with clickable suggested prompts
- [x] Branded header with status indicators

**Depends on:** #5

---

## Future (Post-MVP)

### Issue #14 — Multi-user auth
- [ ] Add authentication (NextAuth.js or Clerk)
- [ ] User table in SQLite → migrate to PostgreSQL
- [ ] Organization/team support
- [ ] Task assignment to real users

### Issue #15 — Migrate to PostgreSQL
- [ ] Replace better-sqlite3 with Prisma + PostgreSQL
- [ ] Data migration script
- [ ] Connection pooling for concurrent users

### Issue #16 — Advanced AI features
- [ ] File/image uploads → Gemini multimodal analysis
- [ ] Meeting notes → auto-extract tasks
- [ ] Weekly digest generation
- [ ] Smart notifications ("Task X is overdue")
- [ ] Natural language filters ("Show tasks assigned to John due this week")
