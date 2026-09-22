"use client";

import React from "react";
import { BarChart3, CheckCircle2, Clock, AlertTriangle, Flame } from "lucide-react";
import { Project } from "@/lib/db";

interface SummaryChartProps {
  project: Project;
  total: number;
  counts: {
    todo: number;
    in_progress: number;
    in_review: number;
    done: number;
  };
  priorityCounts: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  completionPercentage: number;
}

export function SummaryChart({
  project,
  total,
  counts,
  priorityCounts,
  completionPercentage,
}: SummaryChartProps) {
  return (
    <div className="my-3 max-w-lg overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-100">{project.name}</h4>
            <span className="text-[11px] text-zinc-400">Progress & Metrics</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-emerald-400">
            {completionPercentage}%
          </div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
            Completed
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3.5 space-y-1.5">
        <div className="flex justify-between text-xs text-zinc-400">
          <span>Overall Progress</span>
          <span>
            {counts.done} of {total} tasks done
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Status Breakdown Grid */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/50 p-2 text-center">
          <div className="text-sm font-bold text-zinc-300">{counts.todo}</div>
          <span className="text-[10px] text-zinc-500">To Do</span>
        </div>
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/50 p-2 text-center">
          <div className="text-sm font-bold text-blue-400">{counts.in_progress}</div>
          <span className="text-[10px] text-zinc-500">In Progress</span>
        </div>
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/50 p-2 text-center">
          <div className="text-sm font-bold text-amber-400">{counts.in_review}</div>
          <span className="text-[10px] text-zinc-500">In Review</span>
        </div>
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/50 p-2 text-center">
          <div className="text-sm font-bold text-emerald-400">{counts.done}</div>
          <span className="text-[10px] text-zinc-500">Done</span>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="mt-4 rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-2.5">
        <span className="text-[11px] font-medium text-zinc-400">
          Priority Distribution
        </span>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 text-rose-400">
            <Flame className="h-3 w-3" />
            <span>Urgent: {priorityCounts.urgent}</span>
          </div>
          <div className="flex items-center gap-1 text-orange-400">
            <AlertTriangle className="h-3 w-3" />
            <span>High: {priorityCounts.high}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            <span>Med: {priorityCounts.medium}</span>
          </div>
          <div className="flex items-center gap-1 text-blue-400">
            <span>Low: {priorityCounts.low}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
