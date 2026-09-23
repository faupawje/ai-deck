"use client";

import React from "react";
import { AlertTriangle, AlertCircle, CheckCircle2, ShieldCheck, Clock } from "lucide-react";
import { PixelSprite } from "../agents/pixel-sprite";

interface RiskReportProps {
  projectId: string;
  projectName: string;
  overallRisk: "low" | "medium" | "high";
  riskFlags: Array<{ severity: "low" | "medium" | "high"; title: string; detail: string }>;
  healthyCount: number;
  auditTimestamp: string;
}

export function RiskReport({
  projectId,
  projectName,
  overallRisk,
  riskFlags,
  healthyCount,
  auditTimestamp,
}: RiskReportProps) {
  const getRiskBadge = () => {
    switch (overallRisk) {
      case "high":
        return {
          label: "High Risk",
          badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          spriteState: "alert" as const,
        };
      case "medium":
        return {
          label: "Medium Risk",
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          spriteState: "alert" as const,
        };
      case "low":
      default:
        return {
          label: "Healthy & On Track",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          spriteState: "celebrating" as const,
        };
    }
  };

  const badge = getRiskBadge();

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl max-w-lg">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-3">
          <PixelSprite archetype="specter" state={badge.spriteState} size="md" />
          <div>
            <h4 className="text-sm font-semibold text-zinc-100">{projectName}</h4>
            <span className="text-[11px] text-zinc-400">Risk & Bottleneck Audit</span>
          </div>
        </div>

        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.badge}`}>
          {badge.label}
        </span>
      </div>

      {/* Flags */}
      <div className="mt-3.5 space-y-2">
        {riskFlags.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
            <span>No critical bottlenecks detected. Workload is balanced smoothly.</span>
          </div>
        ) : (
          riskFlags.map((flag, idx) => (
            <div
              key={idx}
              className={`rounded-lg border p-3 text-xs ${
                flag.severity === "high"
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-200"
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{flag.title}</span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-300 pl-5 leading-relaxed">{flag.detail}</p>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-zinc-800/60">
        <span>{healthyCount} verified completed tasks</span>
        <span>Audited at {auditTimestamp}</span>
      </div>
    </div>
  );
}
