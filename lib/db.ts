import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Ensure database file location
const dbPath = path.join(process.cwd(), "ai-deck.db");

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(dbPath);
    dbInstance.pragma("journal_mode = WAL");
    dbInstance.pragma("foreign_keys = ON");
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'in_review', 'done')),
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
      sprint TEXT DEFAULT 'Sprint 1',
      assignee TEXT DEFAULT 'Unassigned',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      tool_calls_json TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
  `);
}

// Data Types
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sprint: string;
  assignee: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MessageRecord {
  id: string;
  project_id: string | null;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls_json?: string | null;
  created_at: string;
}

// ---------------- Project Queries ----------------

export function getAllProjects(): Project[] {
  const db = getDb();
  return db.prepare("SELECT * FROM projects ORDER BY updated_at DESC").all() as Project[];
}

export function getProjectById(id: string): Project | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as Project | undefined;
}

export function createProject(data: { id?: string; name: string; description?: string; status?: Project['status'] }): Project {
  const db = getDb();
  const id = data.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const description = data.description || '';
  const status = data.status || 'active';

  db.prepare(`
    INSERT INTO projects (id, name, description, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(id, data.name, description, status);

  return getProjectById(id)!;
}

export function updateProject(id: string, updates: Partial<Pick<Project, 'name' | 'description' | 'status'>>): Project | undefined {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push("name = ?");
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    fields.push("description = ?");
    values.push(updates.description);
  }
  if (updates.status !== undefined) {
    fields.push("status = ?");
    values.push(updates.status);
  }

  if (fields.length === 0) return getProjectById(id);

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);

  db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getProjectById(id);
}

export function deleteProject(id: string): boolean {
  const db = getDb();
  const res = db.prepare("DELETE FROM projects WHERE id = ?").run(id);
  return res.changes > 0;
}

// ---------------- Task Queries ----------------

export function getTasks(projectId: string, filter?: { status?: Task['status']; sprint?: string }): Task[] {
  const db = getDb();
  let query = "SELECT * FROM tasks WHERE project_id = ?";
  const params: any[] = [projectId];

  if (filter?.status) {
    query += " AND status = ?";
    params.push(filter.status);
  }
  if (filter?.sprint) {
    query += " AND sprint = ?";
    params.push(filter.sprint);
  }

  query += " ORDER BY sort_order ASC, created_at ASC";
  return db.prepare(query).all(...params) as Task[];
}

export function getTaskById(id: string): Task | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as Task | undefined;
}

export function createTask(data: {
  id?: string;
  project_id: string;
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  sprint?: string;
  assignee?: string;
  sort_order?: number;
}): Task {
  const db = getDb();
  const id = data.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const description = data.description || '';
  const status = data.status || 'todo';
  const priority = data.priority || 'medium';
  const sprint = data.sprint || 'Sprint 1';
  const assignee = data.assignee || 'Unassigned';
  const sort_order = data.sort_order ?? 0;

  db.prepare(`
    INSERT INTO tasks (id, project_id, title, description, status, priority, sprint, assignee, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(id, data.project_id, data.title, description, status, priority, sprint, assignee, sort_order);

  return getTaskById(id)!;
}

export function createTasksBulk(tasks: Array<{
  id?: string;
  project_id: string;
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  sprint?: string;
  assignee?: string;
  sort_order?: number;
}>): Task[] {
  const db = getDb();
  const insertStmt = db.prepare(`
    INSERT INTO tasks (id, project_id, title, description, status, priority, sprint, assignee, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  const createdTasks: Task[] = [];

  const runTransaction = db.transaction((taskList) => {
    for (const data of taskList) {
      const id = data.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const description = data.description || '';
      const status = data.status || 'todo';
      const priority = data.priority || 'medium';
      const sprint = data.sprint || 'Sprint 1';
      const assignee = data.assignee || 'Unassigned';
      const sort_order = data.sort_order ?? 0;

      insertStmt.run(id, data.project_id, data.title, description, status, priority, sprint, assignee, sort_order);
      createdTasks.push({
        id,
        project_id: data.project_id,
        title: data.title,
        description,
        status,
        priority,
        sprint,
        assignee,
        sort_order,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  });

  runTransaction(tasks);
  return createdTasks;
}

export function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'project_id' | 'created_at' | 'updated_at'>>): Task | undefined {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  const allowedFields = ['title', 'description', 'status', 'priority', 'sprint', 'assignee', 'sort_order'] as const;
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(updates[field]);
    }
  }

  if (fields.length === 0) return getTaskById(id);

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);

  db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getTaskById(id);
}

export function deleteTask(id: string): boolean {
  const db = getDb();
  const res = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return res.changes > 0;
}

// ---------------- Summary / Stats Queries ----------------

export function getProjectSummary(projectId: string) {
  const db = getDb();
  const project = getProjectById(projectId);
  if (!project) return null;

  const tasks = getTasks(projectId);
  const total = tasks.length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  const in_progress = tasks.filter(t => t.status === 'in_progress').length;
  const in_review = tasks.filter(t => t.status === 'in_review').length;
  const done = tasks.filter(t => t.status === 'done').length;

  const priorityCounts = {
    urgent: tasks.filter(t => t.priority === 'urgent').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  return {
    project,
    total,
    counts: { todo, in_progress, in_review, done },
    priorityCounts,
    completionPercentage: total > 0 ? Math.round((done / total) * 100) : 0,
  };
}

// ---------------- Message Queries ----------------

export function getMessages(projectId: string | null): MessageRecord[] {
  const db = getDb();
  if (projectId) {
    return db.prepare("SELECT * FROM messages WHERE project_id = ? ORDER BY created_at ASC").all(projectId) as MessageRecord[];
  }
  return db.prepare("SELECT * FROM messages WHERE project_id IS NULL ORDER BY created_at ASC").all() as MessageRecord[];
}

export function saveMessage(data: {
  id?: string;
  project_id: string | null;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls_json?: string;
}): MessageRecord {
  const db = getDb();
  const id = data.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const tool_calls_json = data.tool_calls_json || null;

  db.prepare(`
    INSERT INTO messages (id, project_id, role, content, tool_calls_json, created_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(id, data.project_id, data.role, data.content, tool_calls_json);

  return db.prepare("SELECT * FROM messages WHERE id = ?").get(id) as MessageRecord;
}
