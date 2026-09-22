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

- [ ] Create `lib/db.ts` — SQLite connection + auto-create tables
- [ ] Schema: `projects` table (id, name, description, status, created_at, updated_at)
- [ ] Schema: `tasks` table (id, project_id, title, description, status, priority, sprint, assignee, sort_order, created_at, updated_at)
- [ ] Schema: `messages` table (id, project_id, role, content, tool_calls_json, created_at)
- [ ] Write CRUD helpers: `createProject()`, `getTasks()`, `createTask()`, `updateTask()`, etc.
- [ ] Write a seed script for test data (optional)
- [ ] Verify: import db in a test route, confirm tables are created

---

## Milestone 2: AI Chat Core

### Issue #3 — Gemini tool definitions
**Priority:** 🔴 Critical | **Estimate:** 1 hour

Define the tools (function declarations) that Gemini can call to interact with project data.

- [ ] Create `lib/tools.ts`
- [ ] Tool: `create_project` — creates a new project
- [ ] Tool: `list_projects` — returns all projects
- [ ] Tool: `create_tasks` — bulk-create tasks for a project
- [ ] Tool: `list_tasks` — returns tasks for a project, with optional filters
- [ ] Tool: `update_task` — update status/priority/assignee of a task
- [ ] Tool: `delete_task` — remove a task
- [ ] Tool: `show_board` — returns tasks grouped by status (for Kanban rendering)
- [ ] Tool: `show_summary` — returns project stats (total, done, in-progress, overdue)
- [ ] Each tool has: description, Zod schema for parameters, execute function that calls db

---

### Issue #4 — Chat API route
**Priority:** 🔴 Critical | **Estimate:** 1.5 hours

Create the streaming chat endpoint that connects Gemini with tools and database.

- [ ] Create `app/api/chat/route.ts`
- [ ] Use Vercel AI SDK `streamText()` with `google()` provider
- [ ] Attach tools from `lib/tools.ts`
- [ ] Build system prompt with project context (current project, task counts, etc.)
- [ ] Handle `maxSteps` for multi-turn tool calling (AI calls tool → gets result → responds)
- [ ] Return streaming response
- [ ] Test with curl or simple fetch

---

## Milestone 3: Chat UI

### Issue #5 — Chat interface
**Priority:** 🔴 Critical | **Estimate:** 2 hours

Build the main chat UI — the primary (and only) screen of the MVP.

- [ ] Create `app/page.tsx` — main layout with chat
- [ ] Create `components/chat.tsx` — message list + input box
- [ ] Use Vercel AI SDK `useChat()` hook connected to `/api/chat`
- [ ] Render user messages (right-aligned bubbles)
- [ ] Render AI text responses (left-aligned, with markdown)
- [ ] Auto-scroll to bottom on new messages
- [ ] Loading state while AI is responding
- [ ] Project selector sidebar or dropdown (to switch active project)

---

### Issue #6 — Generative UI: Task List component
**Priority:** 🟡 High | **Estimate:** 1.5 hours

Render AI-generated tasks as an interactive, editable checklist in the chat.

- [ ] Create `components/generative/task-list.tsx`
- [ ] Render tasks with checkboxes, title, priority badge, assignee
- [ ] "Save All" button — persists AI-suggested tasks to SQLite
- [ ] Inline edit — click task title to rename
- [ ] Delete button per task
- [ ] Status toggle (todo → in progress → done)
- [ ] Wire into chat: when AI calls `create_tasks` or `list_tasks`, render this component

---

### Issue #7 — Generative UI: Kanban Board component
**Priority:** 🟡 High | **Estimate:** 2 hours

Render tasks as a Kanban board inside the chat.

- [ ] Create `components/generative/kanban-board.tsx`
- [ ] Columns: To Do | In Progress | In Review | Done
- [ ] Task cards with title, priority, assignee avatar
- [ ] Drag-and-drop between columns (use `@hello-pangea/dnd` or similar)
- [ ] On drop → update task status in SQLite via API call
- [ ] Wire into chat: when AI calls `show_board`, render this component

---

### Issue #8 — Generative UI: Project Card component
**Priority:** 🟢 Medium | **Estimate:** 45 min

Render a project summary card when a project is created or queried.

- [ ] Create `components/generative/project-card.tsx`
- [ ] Show: project name, description, status, task count, created date
- [ ] Editable fields (name, description)
- [ ] Save button to persist changes
- [ ] Wire into chat: when AI calls `create_project` or `list_projects`

---

### Issue #9 — Generative UI: Summary/Chart component
**Priority:** 🟢 Medium | **Estimate:** 1.5 hours

Render project statistics and progress charts.

- [ ] Create `components/generative/summary-chart.tsx`
- [ ] Progress bar (tasks done / total)
- [ ] Pie chart: task distribution by status (Recharts)
- [ ] Bar chart: tasks by priority
- [ ] Sprint burndown (if sprint data exists)
- [ ] Wire into chat: when AI calls `show_summary`

---

## Milestone 4: Polish & Testing

### Issue #10 — System prompt engineering
**Priority:** 🟡 High | **Estimate:** 1 hour

Craft and iterate on the system prompt for optimal AI behavior.

- [ ] Create `lib/system-prompt.ts`
- [ ] Inject dynamic context: active project name, task count, member list
- [ ] Instruct AI on when to use each tool vs. plain text
- [ ] Handle edge cases: no project selected, empty project, ambiguous requests
- [ ] Test with various user inputs and verify tool selection accuracy
- [ ] Add examples/few-shot prompts if needed

---

### Issue #11 — Error handling & edge cases
**Priority:** 🟡 High | **Estimate:** 1 hour

- [ ] Handle Gemini API errors gracefully (rate limit, auth, network)
- [ ] Handle malformed tool call responses (fallback to text)
- [ ] Handle SQLite errors (constraint violations, etc.)
- [ ] Empty states: no projects, no tasks, fresh database
- [ ] Loading skeletons for generative components
- [ ] Toast notifications for success/error on CRUD actions

---

### Issue #12 — Conversation persistence
**Priority:** 🟢 Medium | **Estimate:** 1 hour

Save and restore chat history per project.

- [ ] Save each message to `messages` table after send/receive
- [ ] Load previous messages when switching to a project
- [ ] Option to clear conversation history
- [ ] Limit context window: send only last N messages to Gemini to manage token usage

---

### Issue #13 — Basic styling & UX polish
**Priority:** 🟢 Medium | **Estimate:** 1.5 hours

- [ ] Dark mode support
- [ ] Responsive layout (mobile-friendly chat)
- [ ] Keyboard shortcuts: Enter to send, Shift+Enter for newline
- [ ] Welcome screen with suggested prompts ("Create a project", "Show my tasks")
- [ ] App icon / branding

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
