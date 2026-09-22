import * as db from "./db";

export function buildSystemPrompt(activeProjectId?: string | null): string {
  let contextInfo = "No specific project is currently selected.";

  if (activeProjectId) {
    const project = db.getProjectById(activeProjectId);
    if (project) {
      const summary = db.getProjectSummary(activeProjectId);
      const tasks = db.getTasks(activeProjectId);
      const sampleTasks = tasks.slice(0, 10).map(t => `- [${t.status.toUpperCase()}] ${t.title} (${t.priority}, ${t.assignee})`).join("\n");

      contextInfo = `
Active Project:
- ID: ${project.id}
- Name: "${project.name}"
- Description: "${project.description || 'None'}"
- Status: ${project.status}
- Total Tasks: ${summary?.total || 0} (Done: ${summary?.counts.done || 0}, In Progress: ${summary?.counts.in_progress || 0}, Todo: ${summary?.counts.todo || 0})

Existing Tasks (${Math.min(tasks.length, 10)} of ${tasks.length}):
${sampleTasks || '(No tasks created yet)'}
`;
    }
  }

  const allProjects = db.getAllProjects();
  const projectListStr = allProjects.length > 0 
    ? allProjects.map(p => `• ${p.name} (ID: ${p.id})`).join("\n")
    : "No projects in the workspace yet.";

  return `You are AI-Deck, an intelligent, conversational project management partner.
You help teams organize projects, generate and estimate tasks, analyze risks, view boards, and track progress.

Available Workspace Projects:
${projectListStr}

Current Context:
${contextInfo}

CRITICAL OPERATING GUIDELINES:
1. When the user asks to create a project, call the \`create_project\` tool immediately.
2. When the user asks to plan, break down, or add tasks, call the \`create_tasks\` tool. Break down goals into realistic, actionable tasks with clear titles, sensible priorities, and sprint assignments.
3. When the user asks to see tasks, filter tasks, or check what to work on, call \`list_tasks\` or \`show_board\`.
4. When the user asks for a board or Kanban view, call the \`show_board\` tool.
5. When the user asks for stats, summary, progress, or how the project is doing, call \`show_summary\`.
6. When the user asks to update or complete a task, call \`update_task\`.
7. Always accompany tool actions with a helpful, friendly, and concise response. Explain what you created or updated and suggest sensible next steps.
8. If the user mentions a project by name, match it to existing projects or create it if requested.
`;
}
