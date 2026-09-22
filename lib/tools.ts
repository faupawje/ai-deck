import { tool } from "ai";
import { z } from "zod";
import * as db from "./db";

export const createProjectTool = tool({
  description: "Create a new project with a name and optional description.",
  parameters: z.object({
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
  parameters: z.object({}),
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
  parameters: z.object({
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
  parameters: z.object({
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
  parameters: z.object({
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
  parameters: z.object({
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
  parameters: z.object({
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
  parameters: z.object({
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

export const projectTools = {
  create_project: createProjectTool,
  list_projects: listProjectsTool,
  create_tasks: createTasksTool,
  list_tasks: listTasksTool,
  update_task: updateTaskTool,
  delete_task: deleteTaskTool,
  show_board: showBoardTool,
  show_summary: showSummaryTool,
};
