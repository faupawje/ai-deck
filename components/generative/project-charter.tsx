"use client";

import React, { useState } from "react";
import {
  FileText,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { ProjectCharter } from "@/lib/db";
import { PixelSprite } from "../agents/pixel-sprite";

interface ProjectCharterProps {
  projectId: string;
  projectName: string;
  charter: ProjectCharter;
}

export function ProjectCharterCard({
  projectId,
  projectName,
  charter,
}: ProjectCharterProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "deliverables" | "scope">("overview");

  return (
    <div className="w-full max-w-2xl rounded-xl border border-amber-500/30 bg-zinc-900/90 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Header Banner */}
      <div className="border-b border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PixelSprite archetype="ember" state="idle" size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-amber-400" />
                  Project Charter (ToR)
                </h3>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[9px] font-semibold text-amber-300 font-mono uppercase tracking-wider">
                  Terms of Reference
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Strategic baseline for <span className="text-zinc-200 font-medium">{projectName}</span>
              </p>
            </div>
          </div>

          {charter.estimatedTimeline && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
              <Clock className="h-3.5 w-3.5" />
              <span>{charter.estimatedTimeline}</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-800/80">
          {[
            { id: "overview", label: "Objectives & KPIs" },
            { id: "deliverables", label: `Deliverables (${charter.deliverables?.length || 0})` },
            { id: "scope", label: "Scope Boundaries" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                activeTab === tab.id
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 space-y-4">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Background Callout */}
            <div className="rounded-lg bg-zinc-950/60 border border-zinc-800 p-3.5">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Background & Problem Statement
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {charter.background || "No background details provided."}
              </p>
            </div>

            {/* Strategic Objectives */}
            <div>
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Target className="h-3.5 w-3.5" />
                Strategic Objectives (Why we are building this)
              </span>
              <div className="grid grid-cols-1 gap-2">
                {charter.objectives?.map((obj, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 text-xs text-zinc-200"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5 leading-normal">{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Metrics / KPIs */}
            {charter.successMetrics && charter.successMetrics.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Award className="h-3.5 w-3.5" />
                  Measurable Success Criteria (KPIs)
                </span>
                <div className="flex flex-wrap gap-2">
                  {charter.successMetrics.map((kpi, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{kpi}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DELIVERABLES */}
        {activeTab === "deliverables" && (
          <div className="space-y-2.5">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Tangible Project Outputs & Acceptance Criteria
            </span>

            {charter.deliverables?.map((del, idx) => {
              const isDone = del.status === "completed";
              const inProgress = del.status === "in_progress";

              return (
                <div
                  key={idx}
                  className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      ) : inProgress ? (
                        <span className="h-3 w-3 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                      ) : (
                        <span className="h-3 w-3 rounded-full border border-zinc-600 flex-shrink-0" />
                      )}
                      <h4 className={`text-xs font-semibold ${isDone ? "text-zinc-400 line-through" : "text-zinc-200"}`}>
                        {del.title}
                      </h4>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                        isDone
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : inProgress
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {del.status || "pending"}
                    </span>
                  </div>

                  {del.description && (
                    <p className="text-[11px] text-zinc-400 pl-6 leading-relaxed">
                      {del.description}
                    </p>
                  )}

                  {del.acceptanceCriteria && (
                    <div className="mt-1 pl-6 pt-1.5 border-t border-zinc-900 text-[10px] text-zinc-500 flex items-center gap-1.5">
                      <strong className="text-zinc-400 font-medium">Acceptance:</strong>
                      <span>{del.acceptanceCriteria}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: SCOPE BOUNDARIES */}
        {activeTab === "scope" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* In-Scope */}
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/10 p-3.5 space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Explicitly In-Scope
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {charter.scopeIn?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Out-of-Scope (Non-Goals) */}
            <div className="rounded-lg border border-rose-500/20 bg-rose-950/10 p-3.5 space-y-2">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5" />
                Non-Goals (Out of Scope)
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-400">
                {charter.scopeOut?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">×</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950/40 text-[10px] text-zinc-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>Ember audits tasks against these deliverables to prevent scope creep</span>
        </span>
        {charter.targetAudience && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>Audience: {charter.targetAudience}</span>
          </span>
        )}
      </div>
    </div>
  );
}
