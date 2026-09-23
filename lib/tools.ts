import { tool } from "ai";
import { z } from "zod";
import * as db from "./db";

export const createProjectTool = tool({
  description: "Create a new project with a name and optional description.",
  inputSchema: z.object({
    name: z.string().describe("The name of the project"),
    description: z.string().optional().describe("A brief description of the project goals"),
  }),
  execute: async ({ name, description }) => {
    const project = db.createProject({ name, description });
    return {
      success: true,
      project,
      message: `Project "${project.name}" created successfully.`,
    };
  },
});

export const listProjectsTool = tool({
  description: "List all existing projects.",
  inputSchema: z.object({}),
  execute: async () => {
    const projects = db.getAllProjects();
    return {
      projects,
      count: projects.length,
    };
  },
});

export const createTasksTool = tool({
  description: "Create one or more tasks for a specific project. Use this when breaking down requirements or generating a task list.",
  inputSchema: z.object({
    projectId: z.string().describe("The ID of the project to add tasks to"),
    tasks: z.array(
      z.object({
        title: z.string().describe("Clear, actionable title of the task"),
        description: z.string().optional().describe("Details, acceptance criteria, or context"),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium").describe("Priority level"),
        status: z.enum(["todo", "in_progress", "in_review", "done"]).default("todo").describe("Initial task status"),
        sprint: z.string().optional().default("Sprint 1").describe("Sprint name, e.g. 'Sprint 1'"),
        assignee: z.string().optional().default("Unassigned").describe("Name of the person assigned"),
      })
    ).describe("List of tasks to create"),
  }),
  execute: async ({ projectId, tasks }) => {
    const project = db.getProjectById(projectId);
    if (!project) {
      return {
        success: false,
        error: `Project with ID "${projectId}" not found.`,
      };
    }

    const created = db.createTasksBulk(
      tasks.map((t, idx) => ({
        project_id: projectId,
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        sprint: t.sprint,
        assignee: t.assignee,
        sort_order: idx,
      }))
    );

    return {
      success: true,
      projectId,
      projectName: project.name,
      tasks: created,
      count: created.length,
      message: `Created ${created.length} tasks for project "${project.name}".`,
    };
  },
});

export const listTasksTool = tool({
  description: "List tasks for a project, optionally filtering by status or sprint.",
  inputSchema: z.object({
    projectId: z.string().describe("The ID of the project"),
    status: z.enum(["todo", "in_progress", "in_review", "done"]).optional().describe("Filter by task status"),
    sprint: z.string().optional().describe("Filter by sprint"),
  }),
  execute: async ({ projectId, status, sprint }) => {
    const project = db.getProjectById(projectId);
    if (!project) {
      return { success: false, error: `Project not found.` };
    }

    const tasks = db.getTasks(projectId, { status, sprint });
    return {
      success: true,
      projectId,
      projectName: project.name,
      tasks,
      count: tasks.length,
    };
  },
});

export const updateTaskTool = tool({
  description: "Update task properties like status, priority, title, assignee, or sprint.",
  inputSchema: z.object({
    taskId: z.string().describe("The ID of the task to update"),
    status: z.enum(["todo", "in_progress", "in_review", "done"]).optional().describe("New status"),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional().describe("New priority"),
    title: z.string().optional().describe("New title"),
    description: z.string().optional().describe("New description"),
    assignee: z.string().optional().describe("New assignee"),
    sprint: z.string().optional().describe("New sprint"),
  }),
  execute: async ({ taskId, ...updates }) => {
    const updated = db.updateTask(taskId, updates);
    if (!updated) {
      return { success: false, error: `Task "${taskId}" not found.` };
    }
    return {
      success: true,
      task: updated,
      message: `Updated task "${updated.title}".`,
    };
  },
});

export const deleteTaskTool = tool({
  description: "Delete a task by ID.",
  inputSchema: z.object({
    taskId: z.string().describe("The ID of the task to delete"),
  }),
  execute: async ({ taskId }) => {
    const success = db.deleteTask(taskId);
    return {
      success,
      message: success ? `Task "${taskId}" deleted.` : `Task not found.`,
    };
  },
});

export const showBoardTool = tool({
  description: "Display an interactive Kanban board grouped by status (todo, in_progress, in_review, done) for a project.",
  inputSchema: z.object({
    projectId: z.string().describe("The ID of the project to view as a board"),
  }),
  execute: async ({ projectId }) => {
    const project = db.getProjectById(projectId);
    if (!project) {
      return { success: false, error: "Project not found." };
    }

    const tasks = db.getTasks(projectId);
    const columns = {
      todo: tasks.filter((t) => t.status === "todo"),
      in_progress: tasks.filter((t) => t.status === "in_progress"),
      in_review: tasks.filter((t) => t.status === "in_review"),
      done: tasks.filter((t) => t.status === "done"),
    };

    return {
      success: true,
      projectId,
      projectName: project.name,
      columns,
      totalTasks: tasks.length,
    };
  },
});

export const showSummaryTool = tool({
  description: "Display project progress statistics, completion percentages, and priority breakdowns.",
  inputSchema: z.object({
    projectId: z.string().describe("The ID of the project to summarize"),
  }),
  execute: async ({ projectId }) => {
    const summary = db.getProjectSummary(projectId);
    if (!summary) {
      return { success: false, error: "Project not found." };
    }

    return {
      success: true,
      ...summary,
    };
  },
});

export const secretaryBriefingTool = tool({
  description:
    "Generate an executive morning standup & daily briefing for the active project. Scans priority items, stalled tasks, and highlights today's focus.",
  inputSchema: z.object({
    projectId: z.string().describe("The ID of the project to generate a briefing for"),
  }),
  execute: async ({ projectId }) => {
    const project = db.getProjectById(projectId);
    if (!project) return { success: false, error: "Project not found." };

    const tasks = db.getTasks(projectId);
    const summary = db.getProjectSummary(projectId);

    // Focus items for today (urgent or high priority in todo or in_progress)
    const focusToday = tasks
      .filter((t) => (t.priority === "urgent" || t.priority === "high") && t.status !== "done")
      .slice(0, 5);

    // Tasks completed
    const recentlyCompleted = tasks.filter((t) => t.status === "done").slice(0, 5);

    // Potential bottlenecks (unassigned tasks or urgent tasks in review)
    const bottlenecks = tasks.filter(
      (t) => (t.priority === "urgent" && t.assignee === "Unassigned") || (t.status === "in_review" && t.priority === "high")
    );

    return {
      success: true,
      projectId,
      projectName: project.name,
      briefingDate: new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
      completionPercentage: summary?.completionPercentage || 0,
      totalTasks: tasks.length,
      focusToday,
      recentlyCompleted,
      bottlenecks,
      secretaryTip:
        focusToday.length > 3
          ? "You have multiple high-priority items on deck. Recommend tackling the urgent items first before starting new tasks."
          : "Workload looks balanced today. Good time to clear out backlog items!",
    };
  },
});

export const ingestNotesTool = tool({
  description:
    "Ingest and parse raw meeting notes, transcripts, or brain-dump text into structured project tasks and automatically save them.",
  inputSchema: z.object({
    projectId: z.string().describe("The ID of the project to add parsed tasks to"),
    tasks: z.array(
      z.object({
        title: z.string().describe("Clear, actionable task title extracted from notes"),
        description: z.string().optional().describe("Context or notes extracted"),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        sprint: z.string().optional().default("Sprint 1"),
        assignee: z.string().optional().default("Unassigned"),
      })
    ).describe("List of structured tasks extracted from the notes"),
    sourceNotesSummary: z.string().describe("Brief 1-sentence summary of the meeting/notes ingested"),
  }),
  execute: async ({ projectId, tasks, sourceNotesSummary }) => {
    const project = db.getProjectById(projectId);
    if (!project) return { success: false, error: "Project not found." };

    const created = db.createTasksBulk(
      tasks.map((t, idx) => ({
        project_id: projectId,
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: "todo" as const,
        sprint: t.sprint,
        assignee: t.assignee,
        sort_order: idx,
      }))
    );

    return {
      success: true,
      projectId,
      projectName: project.name,
      sourceNotesSummary,
      tasks: created,
      count: created.length,
      message: `Parsed & created ${created.length} actionable tasks from your notes.`,
    };
  },
});

export const auditRisksTool = tool({
  description: "Perform an executive risk and bottleneck audit across the project tasks.",
  inputSchema: z.object({
    projectId: z.string().describe("The ID of the project to audit"),
  }),
  execute: async ({ projectId }) => {
    const project = db.getProjectById(projectId);
    if (!project) return { success: false, error: "Project not found." };

    const tasks = db.getTasks(projectId);
    const unassignedHigh = tasks.filter(
      (t) => (t.priority === "urgent" || t.priority === "high") && t.assignee === "Unassigned" && t.status !== "done"
    );
    const inReviewCount = tasks.filter((t) => t.status === "in_review").length;
    const todoCount = tasks.filter((t) => t.status === "todo").length;
    const doneCount = tasks.filter((t) => t.status === "done").length;

    const riskFlags: Array<{ severity: "low" | "medium" | "high"; title: string; detail: string }> = [];

    if (unassignedHigh.length > 0) {
      riskFlags.push({
        severity: "high",
        title: `${unassignedHigh.length} Unassigned High-Priority Tasks`,
        detail: "Critical tasks are waiting without owners. Recommend immediate assignment.",
      });
    }

    if (inReviewCount >= 4) {
      riskFlags.push({
        severity: "medium",
        title: "Review Bottleneck",
        detail: `${inReviewCount} tasks waiting in review. Blockers may form if reviews lag.`,
      });
    }

    if (todoCount > 15 && doneCount < 3) {
      riskFlags.push({
        severity: "medium",
        title: "Scope Creep Risk",
        detail: "Large influx of To-Do items with low completion velocity.",
      });
    }

    const overallRisk =
      riskFlags.some((f) => f.severity === "high")
        ? "high"
        : riskFlags.length > 0
        ? "medium"
        : "low";

    return {
      success: true,
      projectId,
      projectName: project.name,
      overallRisk,
      riskFlags,
      healthyCount: tasks.filter((t) => t.status === "done").length,
      auditTimestamp: new Date().toLocaleTimeString(),
    };
  },
});

export const draftCharterTool = tool({
  description:
    "Draft, set, or update the Terms of Reference (ToR) / Project Charter. Use this to establish project goals, background, deliverables, and scope boundaries for ANY project domain (software, marketing, research, event, consulting).",
  inputSchema: z.object({
    projectId: z.string().describe("The ID of the project"),
    background: z.string().describe("Problem statement, background context, and motivation for the project"),
    objectives: z.array(z.string()).describe("List of clear, high-level strategic objectives (Why are we doing this?)"),
    deliverables: z
      .array(
        z.object({
          title: z.string().describe("Title of the deliverable output"),
          description: z.string().optional().describe("Detailed description of what is produced"),
          acceptanceCriteria: z.string().optional().describe("Measurable acceptance criteria for completion"),
          status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
        })
      )
      .describe("List of tangible deliverables and outputs"),
    scopeIn: z.array(z.string()).describe("Boundaries: what is explicitly IN-SCOPE"),
    scopeOut: z.array(z.string()).describe("Boundaries: what is explicitly OUT-OF-SCOPE (non-goals to prevent scope creep)"),
    successMetrics: z.array(z.string()).describe("Measurable KPIs or success criteria"),
    targetAudience: z.string().optional().describe("Target beneficiaries, stakeholders, or users"),
    estimatedTimeline: z.string().optional().describe("High-level timeline or key milestone deadlines"),
  }),
  execute: async ({
    projectId,
    background,
    objectives,
    deliverables,
    scopeIn,
    scopeOut,
    successMetrics,
    targetAudience,
    estimatedTimeline,
  }) => {
    const project = db.getProjectById(projectId);
    if (!project) {
      return { success: false, error: `Project "${projectId}" not found.` };
    }

    const charter: db.ProjectCharter = {
      background,
      objectives,
      deliverables,
      scopeIn,
      scopeOut,
      successMetrics,
      targetAudience,
      estimatedTimeline,
    };

    const updated = db.updateProjectCharter(projectId, charter);
    return {
      success: true,
      projectId,
      projectName: project.name,
      charter,
      message: `Project Charter (ToR) for "${project.name}" has been drafted and saved to the database.`,
    };
  },
});

export const showCharterTool = tool({
  description:
    "View the Terms of Reference (ToR) / Project Charter for the current project. Spawns an executive document card displaying goals, deliverables, and scope boundaries.",
  inputSchema: z.object({
    projectId: z.string().describe("The ID of the project"),
  }),
  execute: async ({ projectId }) => {
    const project = db.getProjectById(projectId);
    if (!project) {
      return { success: false, error: `Project "${projectId}" not found.` };
    }

    const charter = db.getProjectCharter(projectId);
    return {
      success: true,
      projectId,
      projectName: project.name,
      hasCharter: !!charter,
      charter: charter || {
        background: `No formal Terms of Reference (ToR) drafted yet for ${project.name}.`,
        objectives: ["Define strategic project goals", "Identify key deliverables"],
        deliverables: [
          {
            title: "Initial Project Baseline",
            description: "Define scope and initial task backlog",
            status: "pending",
          },
        ],
        scopeIn: ["Initial discovery and requirements gathering"],
        scopeOut: ["Unspecified scope expansions"],
        successMetrics: ["Deliverable acceptance by stakeholders"],
        estimatedTimeline: "Q4 2026",
      },
    };
  },
});

export const projectTools = {
  create_project: createProjectTool,
  list_projects: listProjectsTool,
  create_tasks: createTasksTool,
  list_tasks: listTasksTool,
  update_task: updateTaskTool,
  delete_task: deleteTaskTool,
  show_board: showBoardTool,
  show_summary: showSummaryTool,
  secretary_briefing: secretaryBriefingTool,
  ingest_notes: ingestNotesTool,
  audit_risks: auditRisksTool,
  draft_charter: draftCharterTool,
  show_charter: showCharterTool,
};
