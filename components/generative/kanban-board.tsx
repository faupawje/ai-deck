"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronLeft, CheckCircle2, Circle, Clock, Flame } from "lucide-react";
import { Task } from "@/lib/db";

interface KanbanBoardProps {
  projectId: string;
  projectName?: string;
  columns: {
    todo: Task[];
    in_progress: Task[];
    in_review: Task[];
    done: Task[];
  };
  onTaskMoved?: (taskId: string, newStatus: Task["status"]) => void;
}

const COLUMN_CONFIG: Array<{
  id: Task["status"];
  label: string;
  badge: string;
  dot: string;
}> = [
  { id: "todo", label: "To Do", badge: "text-zinc-400 bg-zinc-800/60", dot: "bg-zinc-400" },
  { id: "in_progress", label: "In Progress", badge: "text-blue-400 bg-blue-500/10", dot: "bg-blue-500" },
  { id: "in_review", label: "In Review", badge: "text-amber-400 bg-amber-500/10", dot: "bg-amber-500" },
  { id: "done", label: "Done", badge: "text-emerald-400 bg-emerald-500/10", dot: "bg-emerald-500" },
];

export function KanbanBoard({
  projectId,
  projectName,
  columns: initialColumns,
  onTaskMoved,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState(initialColumns);
  const [movingId, setMovingId] = useState<string | null>(null);

  const moveTask = async (task: Task, direction: "prev" | "next") => {
    const statuses: Task["status"][] = ["todo", "in_progress", "in_review", "done"];
    const currentIndex = statuses.indexOf(task.status);
    const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex < 0 || nextIndex >= statuses.length) return;
    const newStatus = statuses[nextIndex];

    setMovingId(task.id);

    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          status: newStatus,
        }),
      });

      if (res.ok) {
        const { task: updated } = await res.json();

        setColumns((prev) => {
          const newCols = {
            todo: prev.todo.filter((t) => t.id !== task.id),
            in_progress: prev.in_progress.filter((t) => t.id !== task.id),
            in_review: prev.in_review.filter((t) => t.id !== task.id),
            done: prev.done.filter((t) => t.id !== task.id),
          };
          newCols[newStatus] = [...newCols[newStatus], updated];
          return newCols;
        });

        if (onTaskMoved) onTaskMoved(task.id, newStatus);
      }
    } catch (err) {
      console.error("Failed to move task:", err);
    } finally {
      setMovingId(null);
    }
  };

  const getPriorityStyle = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "text-rose-400 border-rose-500/30 bg-rose-500/10";
      case "high":
        return "text-orange-400 border-orange-500/30 bg-orange-500/10";
      case "medium":
        return "text-amber-400 border-amber-500/30 bg-amber-500/10";
      case "low":
      default:
        return "text-blue-400 border-blue-500/30 bg-blue-500/10";
    }
  };

  const totalTasks =
    (columns.todo?.length || 0) +
    (columns.in_progress?.length || 0) +
    (columns.in_review?.length || 0) +
    (columns.done?.length || 0);

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/70 px-4 py-3">
        <div className="flex items-center space-x-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/20 text-purple-400 text-xs font-semibold">
            ☷
          </span>
          <h3 className="text-sm font-medium text-zinc-100">
            {projectName ? `${projectName} Board` : "Project Board"}
          </h3>
        </div>
        <span className="text-xs text-zinc-400 font-medium">
          {totalTasks} total tasks
        </span>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 overflow-x-auto">
        {COLUMN_CONFIG.map((col) => {
          const colTasks = columns[col.id] || [];

          return (
            <div
              key={col.id}
              className="flex flex-col rounded-lg border border-zinc-800/80 bg-zinc-900/30 p-2.5 min-w-[210px]"
            >
              {/* Column Title */}
              <div className="mb-2.5 flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                  <span className="text-xs font-semibold text-zinc-200">
                    {col.label}
                  </span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${col.badge}`}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-2 max-h-80 overflow-y-auto pr-1">
                {colTasks.length === 0 ? (
                  <div className="py-6 text-center text-[11px] text-zinc-600">
                    Empty
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const isMoving = movingId === task.id;
                    const canMoveLeft = col.id !== "todo";
                    const canMoveRight = col.id !== "done";

                    return (
                      <div
                        key={task.id}
                        className={`group relative rounded-md border border-zinc-800 bg-zinc-900/80 p-2.5 shadow-sm transition hover:border-zinc-700 hover:shadow-md ${
                          isMoving ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-medium text-zinc-100 leading-tight">
                            {task.title}
                          </h4>
                          <span
                            className={`rounded border px-1 py-0.2 text-[9px] uppercase tracking-wider font-semibold ${getPriorityStyle(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p className="mt-1 text-[11px] text-zinc-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-2.5 flex items-center justify-between border-t border-zinc-800/50 pt-2 text-[10px] text-zinc-400">
                          <span>{task.assignee || "Unassigned"}</span>

                          <div className="flex items-center gap-1">
                            {canMoveLeft && (
                              <button
                                type="button"
                                title="Move left"
                                onClick={() => moveTask(task, "prev")}
                                className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition"
                              >
                                <ChevronLeft className="h-3 w-3" />
                              </button>
                            )}
                            {canMoveRight && (
                              <button
                                type="button"
                                title="Move right"
                                onClick={() => moveTask(task, "next")}
                                className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition"
                              >
                                <ChevronRight className="h-3 w-3" />
                              </button>
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
        })}
      </div>
    </div>
  );
}
