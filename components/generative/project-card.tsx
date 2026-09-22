"use client";

import React from "react";
import { FolderKanban, ArrowRight, CheckCircle2, PauseCircle, Clock } from "lucide-react";
import { Project } from "@/lib/db";

interface ProjectCardProps {
  project: Project;
  isActive?: boolean;
  onSelectProject?: (project: Project) => void;
  onShowBoard?: (projectId: string) => void;
}

export function ProjectCard({
  project,
  isActive,
  onSelectProject,
  onShowBoard,
}: ProjectCardProps) {
  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </span>
        );
      case "paused":
        return (
          <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
            <PauseCircle className="h-3 w-3" />
            Paused
          </span>
        );
      case "active":
      default:
        return (
          <span className="flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-400">
            <Clock className="h-3 w-3" />
            Active
          </span>
        );
    }
  };

  return (
    <div className="my-2.5 max-w-md overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-lg transition hover:border-zinc-700">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <FolderKanban className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-100">{project.name}</h4>
            <span className="text-[11px] text-zinc-500 font-mono">{project.id}</span>
          </div>
        </div>

        {getStatusBadge(project.status)}
      </div>

      {project.description && (
        <p className="mt-2.5 text-xs text-zinc-400 leading-relaxed">
          {project.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3">
        <span className="text-[10px] text-zinc-500">
          Created {new Date(project.created_at).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-2">
          {onSelectProject && (
            <button
              type="button"
              onClick={() => onSelectProject(project)}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              }`}
            >
              {isActive ? "Active Project" : "Switch To"}
              <ArrowRight className="h-3 w-3 ml-0.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
