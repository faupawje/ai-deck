import { NextResponse } from "next/server";
import { getDb, createProject, createTask, saveMessage, getTasks, getAllProjects } from "@/lib/db";

export async function GET(req: Request) {
  return handleSeed(req);
}

export async function POST(req: Request) {
  return handleSeed(req);
}

async function handleSeed(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shouldReset = searchParams.get("reset") === "true";

    const db = getDb();

    if (shouldReset) {
      db.prepare("DELETE FROM messages").run();
      db.prepare("DELETE FROM tasks").run();
      db.prepare("DELETE FROM projects").run();
    }

    // 1. Primary Flagship: AI-Deck Itself!
    const aideckId = "proj_aideck_platform";
    let aideckProject = db.prepare("SELECT * FROM projects WHERE id = ?").get(aideckId);
    if (!aideckProject) {
      db.prepare(`
        INSERT INTO projects (id, name, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(
        aideckId,
        "AI-Deck: AI Project Management Platform",
        "Autonomous project secretary with generative UI cards and animated pixel-art familiars backed by Gemini 3.6 Flash and SQLite.",
        "active"
      );
    }

    // 2. Accio-Style Workflow Automation (Secondary Active)
    const accioId = "proj_workflow_automation";
    let accioProject = db.prepare("SELECT * FROM projects WHERE id = ?").get(accioId);
    if (!accioProject) {
      db.prepare(`
        INSERT INTO projects (id, name, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(
        accioId,
        "Workflow Automation & Slack Dispatcher",
        "Autonomous triggers that export daily standup summaries and blocker audits to company Slack channels.",
        "active"
      );
    }

    // 3. Vercel AI SDK v7 Upgrade (Completed Milestone)
    const sdkUpgradeId = "proj_sdk_upgrade";
    let sdkProject = db.prepare("SELECT * FROM projects WHERE id = ?").get(sdkUpgradeId);
    if (!sdkProject) {
      db.prepare(`
        INSERT INTO projects (id, name, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(
        sdkUpgradeId,
        "Vercel AI SDK v7 Migration",
        "Migrated tool schema from jsonSchema/parameters to inputSchema and upgraded streaming primitives.",
        "completed"
      );
    }

    // Tasks for AI-Deck Platform
    const existingAiDeckTasks = getTasks(aideckId);
    if (existingAiDeckTasks.length === 0) {
      const realTasks = [
        // Sprint 1: Foundation (Done)
        {
          id: "task_01",
          project_id: aideckId,
          title: "#1 Scaffolding Next.js 16 + Tailwind CSS v4",
          description: "Initialize Turbopack, React 19, Lucide icons, and Tailwind v4 configuration.",
          status: "done" as const,
          priority: "high" as const,
          sprint: "Sprint 1 - Foundation",
          assignee: "faupawje",
          sort_order: 1,
        },
        {
          id: "task_02",
          project_id: aideckId,
          title: "#2 SQLite database layer (better-sqlite3)",
          description: "Setup projects, tasks, and messages tables with WAL journal mode and foreign keys.",
          status: "done" as const,
          priority: "high" as const,
          sprint: "Sprint 1 - Foundation",
          assignee: "faupawje",
          sort_order: 2,
        },
        {
          id: "task_03",
          project_id: aideckId,
          title: "#3 Gemini tool definitions & schema",
          description: "Define tools for create_project, create_tasks, update_task, delete_task, and show_board.",
          status: "done" as const,
          priority: "high" as const,
          sprint: "Sprint 1 - Foundation",
          assignee: "faupawje",
          sort_order: 3,
        },
        {
          id: "task_04",
          project_id: aideckId,
          title: "#4 Next.js chat streaming API route",
          description: "Setup streamText with Gemini 3.6 Flash and createUIMessageStreamResponse.",
          status: "done" as const,
          priority: "high" as const,
          sprint: "Sprint 1 - Foundation",
          assignee: "faupawje",
          sort_order: 4,
        },

        // Sprint 2: Generative UI & Familiars (Done)
        {
          id: "task_07",
          project_id: aideckId,
          title: "#7 Interactive Kanban board generative UI",
          description: "4-column agile board component with real-time status change buttons connected to SQLite.",
          status: "done" as const,
          priority: "high" as const,
          sprint: "Sprint 2 - Generative UI",
          assignee: "faupawje",
          sort_order: 5,
        },
        {
          id: "task_06",
          project_id: aideckId,
          title: "#6 Task list generative UI with interactive checkboxes",
          description: "Compact checklist component with instant SQLite status toggle for agile sprint tracking.",
          status: "done" as const,
          priority: "medium" as const,
          sprint: "Sprint 2 - Generative UI",
          assignee: "faupawje",
          sort_order: 6,
        },
        {
          id: "task_17",
          project_id: aideckId,
          title: "#17 Animated pixel sprite system (Ember & Specter)",
          description: "Pixel-art fantasy familiars in pure SVG with idle, thinking, celebrating, and alert animations.",
          status: "done" as const,
          priority: "high" as const,
          sprint: "Sprint 2 - Generative UI",
          assignee: "faupawje",
          sort_order: 7,
        },
        {
          id: "task_18",
          project_id: aideckId,
          title: "#18 Project Secretary agent companion tools",
          description: "Autonomous secretary_briefing, audit_risks, and ingest_notes tools with Ember persona.",
          status: "done" as const,
          priority: "high" as const,
          sprint: "Sprint 2 - Generative UI",
          assignee: "faupawje",
          sort_order: 8,
        },
        {
          id: "task_19",
          project_id: aideckId,
          title: "#19 Secretary daily standup briefing UI card",
          description: "Generative briefing card rendering focus tasks, recent sprint wins, bottlenecks, and tips.",
          status: "done" as const,
          priority: "high" as const,
          sprint: "Sprint 2 - Generative UI",
          assignee: "faupawje",
          sort_order: 9,
        },

        // Sprint 3: Polish & Persona (In Review / In Progress)
        {
          id: "task_10",
          project_id: aideckId,
          title: "#10 System prompt engineering & Ember persona tuning",
          description: "Guide Gemini to proactively render interactive UI cards instead of walls of plain text.",
          status: "in_review" as const,
          priority: "high" as const,
          sprint: "Sprint 3 - Polish",
          assignee: "faupawje",
          sort_order: 10,
        },
        {
          id: "task_11",
          project_id: aideckId,
          title: "#11 Error handling & Gemini model deprecation fallback",
          description: "Migrated from deprecated gemini-2.5/2.0-flash to verified gemini-3.6-flash API endpoint.",
          status: "in_review" as const,
          priority: "medium" as const,
          sprint: "Sprint 3 - Polish",
          assignee: "faupawje",
          sort_order: 11,
        },
        {
          id: "task_13",
          project_id: aideckId,
          title: "#13 Onboarding mental model & showcase cards",
          description: "Explain how users collaborate with Ember and clarify the chat-driven workspace paradigm.",
          status: "in_progress" as const,
          priority: "urgent" as const,
          sprint: "Sprint 3 - Polish",
          assignee: "faupawje",
          sort_order: 12,
        },

        // Sprint 4: Future Roadmap (Todo - intentional risks for Specter audit!)
        {
          id: "task_14",
          project_id: aideckId,
          title: "#14 Multi-user auth & workspace permissions",
          description: "Role-based access control (Admin, Member, Viewer) with session management and user isolation.",
          status: "todo" as const,
          priority: "urgent" as const,
          sprint: "Sprint 4 - Roadmap",
          assignee: "Unassigned", // Triggers risk auditor!
          sort_order: 13,
        },
        {
          id: "task_15",
          project_id: aideckId,
          title: "#15 Migrate SQLite to PostgreSQL with Drizzle ORM",
          description: "Production database migration strategy for high-concurrency cloud deployments on Supabase/Neon.",
          status: "todo" as const,
          priority: "high" as const,
          sprint: "Sprint 4 - Roadmap",
          assignee: "Unassigned", // Triggers risk auditor!
          sort_order: 14,
        },
        {
          id: "task_16",
          project_id: aideckId,
          title: "#16 Advanced autonomous agent delegation & webhook exports",
          description: "Multi-agent coordination between Specter (QA auditor) and Ember (Secretary) with Slack webhooks.",
          status: "todo" as const,
          priority: "medium" as const,
          sprint: "Sprint 4 - Roadmap",
          assignee: "faupawje",
          sort_order: 15,
        },
      ];

      for (const t of realTasks) {
        db.prepare(`
          INSERT INTO tasks (id, project_id, title, description, status, priority, sprint, assignee, sort_order, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).run(t.id, t.project_id, t.title, t.description, t.status, t.priority, t.sprint, t.assignee, t.sort_order);
      }
    }

    // Tasks for Accio Workflow project
    const existingAccioTasks = getTasks(accioId);
    if (existingAccioTasks.length === 0) {
      const accioTasks = [
        {
          id: "task_ac_01",
          project_id: accioId,
          title: "Setup Slack Incoming Webhook configuration",
          description: "Allow users to paste a webhook URL for automated 9:00 AM daily standup broadcasts.",
          status: "done" as const,
          priority: "high" as const,
          sprint: "Sprint 1",
          assignee: "faupawje",
          sort_order: 1,
        },
        {
          id: "task_ac_02",
          project_id: accioId,
          title: "Format generative briefing cards into Slack Block Kit",
          description: "Convert Ember standup data into rich interactive Slack message payloads with buttons.",
          status: "in_progress" as const,
          priority: "urgent" as const,
          sprint: "Sprint 1",
          assignee: "faupawje",
          sort_order: 2,
        },
        {
          id: "task_ac_03",
          project_id: accioId,
          title: "Automate cron trigger for standup generation",
          description: "Trigger secretary_briefing tool automatically on weekdays without manual prompt.",
          status: "todo" as const,
          priority: "medium" as const,
          sprint: "Sprint 2",
          assignee: "Unassigned",
          sort_order: 3,
        },
      ];

      for (const t of accioTasks) {
        db.prepare(`
          INSERT INTO tasks (id, project_id, title, description, status, priority, sprint, assignee, sort_order, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).run(t.id, t.project_id, t.title, t.description, t.status, t.priority, t.sprint, t.assignee, t.sort_order);
      }
    }

    // Tasks for SDK Upgrade
    const existingSdkTasks = getTasks(sdkUpgradeId);
    if (existingSdkTasks.length === 0) {
      const sdkTasks = [
        {
          id: "task_sdk_01",
          project_id: sdkUpgradeId,
          title: "Migrate parameters to inputSchema in lib/tools.ts",
          description: "Conform to Vercel AI SDK v7 Zod schema expectations for tool declarations.",
          status: "done" as const,
          priority: "high" as const,
          sprint: "Sprint 1",
          assignee: "faupawje",
          sort_order: 1,
        },
        {
          id: "task_sdk_02",
          project_id: sdkUpgradeId,
          title: "Implement toUIMessageStream & createUIMessageStreamResponse",
          description: "Update /api/chat route to stream UI-compatible chunks for React 19.",
          status: "done" as const,
          priority: "high" as const,
          sprint: "Sprint 1",
          assignee: "faupawje",
          sort_order: 2,
        },
      ];

      for (const t of sdkTasks) {
        db.prepare(`
          INSERT INTO tasks (id, project_id, title, description, status, priority, sprint, assignee, sort_order, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).run(t.id, t.project_id, t.title, t.description, t.status, t.priority, t.sprint, t.assignee, t.sort_order);
      }
    }

    const allProjects = getAllProjects();
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with AI-Deck's own real development milestones and issues.",
      projectsCount: allProjects.length,
      projects: allProjects,
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
