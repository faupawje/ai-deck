"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Clock, AlertCircle, User, Calendar, Plus } from "lucide-react";
import { Task } from "@/lib/db";

interface TaskListProps {
  tasks: Task[];
  projectName?: string;
  projectId?: string;
  title?: string;
  onTaskUpdated?: (updatedTask: Task) => void;
}

export function TaskList({
  tasks: initialTasks,
  projectName,
  projectId,
  title,
  onTaskUpdated,
}: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const toggleTaskStatus = async (task: Task) => {
    const nextStatus: Task["status"] = task.status === "done" ? "todo" : "done";
    setUpdatingId(task.id);

    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          status: nextStatus,
        }),
      });

      if (res.ok) {
        const { task: updated } = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
        if (onTaskUpdated) onTaskUpdated(updated);
      }
    } catch (err) {
      console.error("Failed to update task status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "high":
        return "bg-orange-500/15 text-orange-400 border-orange-500/30";
      case "medium":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "low":
      default:
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    }
  };

  const completedCount = tasks.filter((t) => t.status === "done").length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-xl">
      {/* Header */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400 text-xs font-semibold">
              ✓
            </span>
            <h3 className="text-sm font-medium text-zinc-100">
              {title || (projectName ? `${projectName} Tasks` : "Tasks Breakdown")}
            </h3>
          </div>
          <span className="text-xs font-medium text-zinc-400">
            {completedCount}/{tasks.length} done ({progress}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task Rows */}
      <div className="divide-y divide-zinc-800/60 max-h-96 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-500">No tasks in this list.</div>
        ) : (
          tasks.map((task) => {
            const isDone = task.status === "done";
            const isUpdating = updatingId === task.id;

            return (
              <div
                key={task.id}
                className={`group flex items-start gap-3 p-3 transition-colors hover:bg-zinc-900/40 ${
                  isDone ? "opacity-60" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleTaskStatus(task)}
                  disabled={isUpdating}
                  className="mt-0.5 text-zinc-400 transition hover:text-emerald-400 focus:outline-none"
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-zinc-600 hover:text-zinc-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium ${
                        isDone ? "line-through text-zinc-500" : "text-zinc-200"
                      }`}
                    >
                      {task.title}
                    </span>
                    <span
                      className={`inline-flex items-center rounded px-1.5 py-0.2 text-[10px] font-medium border uppercase tracking-wider ${getPriorityBadge(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  {task.description && (
                    <p className="mt-0.5 text-[11px] text-zinc-400 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-zinc-500">
                    {task.assignee && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {task.assignee}
                      </span>
                    )}
                    {task.sprint && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {task.sprint}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
