"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, AlertTriangle, Sparkles, Flame, ArrowRight, ShieldCheck } from "lucide-react";
import { Task } from "@/lib/db";
import { PixelSprite } from "../agents/pixel-sprite";

interface SecretaryBriefingProps {
  projectId: string;
  projectName: string;
  briefingDate: string;
  completionPercentage: number;
  totalTasks: number;
  focusToday: Task[];
  recentlyCompleted: Task[];
  bottlenecks: Task[];
  secretaryTip: string;
  onTaskToggled?: () => void;
  onOpenBoard?: () => void;
}

export function SecretaryBriefing({
  projectId,
  projectName,
  briefingDate,
  completionPercentage,
  totalTasks,
  focusToday: initialFocus,
  recentlyCompleted,
  bottlenecks,
  secretaryTip,
  onTaskToggled,
  onOpenBoard,
}: SecretaryBriefingProps) {
  const [focusTasks, setFocusTasks] = useState(initialFocus);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const toggleTask = async (task: Task) => {
    setUpdatingId(task.id);
    const nextStatus = task.status === "done" ? "todo" : "done";

    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, status: nextStatus }),
      });

      if (res.ok) {
        setFocusTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
        );
        if (onTaskToggled) onTaskToggled();
      }
    } catch (err) {
      console.error("Failed to update task:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-amber-500/30 bg-zinc-950 shadow-2xl max-w-xl">
      {/* Secretary Header */}
      <div className="border-b border-zinc-800 bg-gradient-to-r from-amber-950/40 via-zinc-900/60 to-zinc-950 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PixelSprite archetype="ember" state="idle" size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100">Daily Standup Briefing</h3>
                <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.2 text-[10px] font-semibold text-amber-300 font-mono">
                  {briefingDate}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Prepared by <span className="text-amber-400 font-medium">Ember</span> for {projectName}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-emerald-400">{completionPercentage}%</span>
            <span className="block text-[9px] text-zinc-500 uppercase tracking-wider">Velocity</span>
          </div>
        </div>

        {/* Secretary Tip Callout */}
        {secretaryTip && (
          <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-[11px] text-amber-200 flex items-start gap-2 leading-relaxed">
            <Flame className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>{secretaryTip}</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Core Focus Today */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              Focus Today ({focusTasks.length})
            </span>
          </div>

          {focusTasks.length === 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 text-center text-xs text-zinc-500">
              No urgent focus tasks on deck. You're clear to tackle the backlog!
            </div>
          ) : (
            <div className="space-y-1.5">
              {focusTasks.map((t) => {
                const isDone = t.status === "done";
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleTask(t)}
                        disabled={updatingId === t.id}
                        className="text-zinc-500 hover:text-emerald-400 transition"
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-zinc-600" />
                        )}
                      </button>
                      <span
                        className={`text-xs truncate ${
                          isDone ? "line-through text-zinc-500" : "text-zinc-200 font-medium"
                        }`}
                      >
                        {t.title}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold border ${
                        t.priority === "urgent"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : "bg-orange-500/10 text-orange-400 border-orange-500/30"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottlenecks Watchout */}
        {bottlenecks && bottlenecks.length > 0 && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              Watchouts ({bottlenecks.length})
            </span>
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-2.5 text-xs text-rose-200 space-y-1">
              {bottlenecks.map((b) => (
                <div key={b.id} className="flex items-center justify-between text-[11px]">
                  <span className="truncate">• {b.title}</span>
                  <span className="text-rose-400/80 font-mono text-[10px]">{b.assignee}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Wins */}
        {recentlyCompleted && recentlyCompleted.length > 0 && (
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Recent Wins ({recentlyCompleted.length})
            </span>
            <div className="space-y-1 text-xs text-zinc-400">
              {recentlyCompleted.slice(0, 3).map((w) => (
                <div key={w.id} className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                  <span className="line-through truncate text-zinc-400">{w.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
