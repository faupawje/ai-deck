"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Send,
  Sparkles,
  FolderKanban,
  Kanban,
  CheckSquare,
  BarChart3,
  Bot,
  User as UserIcon,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Project } from "@/lib/db";
import { TaskList } from "./generative/task-list";
import { KanbanBoard } from "./generative/kanban-board";
import { ProjectCard } from "./generative/project-card";
import { SummaryChart } from "./generative/summary-chart";
import { SecretaryBriefing } from "./generative/secretary-briefing";
import { RiskReport } from "./generative/risk-report";
import { MarkdownRenderer } from "./markdown-renderer";
import { PixelSprite } from "./agents/pixel-sprite";

export function Chat() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch projects list
  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        if (data.projects?.length > 0 && !activeProject) {
          setActiveProject(data.projects[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        projectId: activeProject?.id || null,
      },
    }),
  });

  const [input, setInput] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || status === "submitted" || status === "streaming") return;

    const userText = input;
    setInput("");
    await sendMessage({
      text: userText,
    });
    fetchProjects();
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const handleCreateQuickProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName }),
      });
      if (res.ok) {
        const { project } = await res.json();
        setProjects((prev) => [project, ...prev]);
        setActiveProject(project);
        setNewProjectName("");
        setIsCreatingProject(false);
      }
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 border-r border-zinc-800/80 bg-zinc-950/80 p-4 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-2.5 px-2 py-2 mb-4">
            <PixelSprite archetype="ember" state={isLoading ? "thinking" : "idle"} size="md" />
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                AI-Deck
                <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-amber-400 uppercase font-mono">
                  Ember Agent
                </span>
              </h1>
              <p className="text-[10px] text-zinc-400">Project Secretary Familiar</p>
            </div>
          </div>

          {/* Project Switcher */}
          <div className="mb-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Projects
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingProject(!isCreatingProject)}
                className="text-zinc-400 hover:text-zinc-100 transition"
                title="Create Project"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {isCreatingProject && (
              <form onSubmit={handleCreateQuickProject} className="mb-3 px-2">
                <input
                  type="text"
                  placeholder="Project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  autoFocus
                  className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </form>
            )}

            <div className="space-y-1 max-h-60 overflow-y-auto">
              {projects.length === 0 ? (
                <div className="px-2 py-3 text-xs text-zinc-500">
                  No projects yet. Ask Ember to create one!
                </div>
              ) : (
                projects.map((proj) => {
                  const isSelected = activeProject?.id === proj.id;
                  return (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => setActiveProject(proj)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                        isSelected
                          ? "bg-zinc-800 text-white shadow-sm"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FolderKanban
                          className={`h-3.5 w-3.5 flex-shrink-0 ${
                            isSelected ? "text-amber-400" : "text-zinc-500"
                          }`}
                        />
                        <span className="truncate">{proj.name}</span>
                      </div>
                      {isSelected && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Secretary Actions */}
          <div className="mt-4 px-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Secretary Actions
            </span>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    activeProject
                      ? `Ember, give me today's daily standup briefing for ${activeProject.name}`
                      : "Ember, prepare today's daily standup briefing"
                  )
                }
                className="w-full text-left p-2 rounded-md border border-amber-500/20 bg-amber-500/5 text-[11px] text-amber-200 hover:bg-amber-500/15 hover:border-amber-500/40 transition flex items-center gap-2"
              >
                <PixelSprite archetype="ember" state="idle" size="xs" />
                <span className="font-medium">Daily Standup Briefing</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    activeProject
                      ? `Perform a risk and bottleneck audit for ${activeProject.name}`
                      : "Audit project risks and bottlenecks"
                  )
                }
                className="w-full text-left p-2 rounded-md border border-cyan-500/20 bg-cyan-500/5 text-[11px] text-cyan-200 hover:bg-cyan-500/15 hover:border-cyan-500/40 transition flex items-center gap-2"
              >
                <PixelSprite archetype="specter" state="idle" size="xs" />
                <span className="font-medium">Audit Risks & Blockers</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    activeProject
                      ? `Show me the Kanban board for ${activeProject.name}`
                      : "Show me the project board"
                  )
                }
                className="w-full text-left p-2 rounded-md border border-zinc-800/80 bg-zinc-900/40 text-[11px] text-zinc-300 hover:bg-zinc-800/80 hover:border-zinc-700 transition flex items-center gap-2"
              >
                <Kanban className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                <span>Show Kanban board</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    activeProject
                      ? `Show progress and metrics summary for ${activeProject.name}`
                      : "Summarize our project progress"
                  )
                }
                className="w-full text-left p-2 rounded-md border border-zinc-800/80 bg-zinc-900/40 text-[11px] text-zinc-300 hover:bg-zinc-800/80 hover:border-zinc-700 transition flex items-center gap-2"
              >
                <BarChart3 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                <span>Show progress stats</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-2 pt-3 pb-2 border-t border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-between">
          <span className="font-mono text-[10px]">Ember (Gemini 3.6)</span>
          <button
            type="button"
            onClick={fetchProjects}
            title="Refresh database"
            className="hover:text-zinc-300 transition p-1"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950">
        {/* Header Bar */}
        <header className="h-14 border-b border-zinc-800/80 px-4 md:px-6 flex items-center justify-between bg-zinc-950/60 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <PixelSprite archetype="ember" state={isLoading ? "thinking" : "idle"} size="sm" />
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                {activeProject ? activeProject.name : "All Projects"}
                {activeProject && (
                  <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] font-mono text-zinc-400">
                    {activeProject.id}
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeProject && (
              <button
                type="button"
                onClick={() => {
                  sendMessage({
                    text: `Ember, prepare today's daily standup briefing for ${activeProject.name}`,
                  });
                }}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50 transition shadow-sm"
              >
                <PixelSprite archetype="ember" state="idle" size="xs" />
                <span>Daily Standup</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Secretary Ready</span>
            </div>
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto py-12">
              <div className="mb-4">
                <PixelSprite archetype="ember" state="idle" size="xl" />
              </div>
              <h3 className="text-base font-bold text-zinc-100 mb-1">
                Meet Ember, Your Project Secretary
              </h3>
              <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                An autonomous familiar who keeps project momentum blazing. Run standups,
                ingest messy meeting notes into tasks, and audit bottlenecks.
              </p>

              <div className="grid grid-cols-1 gap-2 w-full text-left">
                {[
                  "Ember, prepare today's daily standup briefing",
                  "Ingest these notes into tasks: 'Setup database schema, wire payment webhook, review auth flow'",
                  "Perform a risk and bottleneck audit",
                  "Show the current Kanban board",
                ].map((hint, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickPrompt(hint)}
                    className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/80 transition text-left flex items-center justify-between"
                  >
                    <span>→ {hint}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 max-w-3xl ${
                    isUser ? "ml-auto justify-end" : "mr-auto justify-start"
                  }`}
                >
                  {!isUser && (
                    <div className="flex-shrink-0 mt-1">
                      <PixelSprite archetype="ember" state="idle" size="sm" />
                    </div>
                  )}

                  <div className={`space-y-3 min-w-0 ${isUser ? "text-right" : ""}`}>
                    {/* Render Parts */}
                    {message.parts.map((part, pIdx) => {
                      // Text parts
                      if (part.type === "text") {
                        if (isUser) {
                          return (
                            <div
                              key={pIdx}
                              className="inline-block rounded-2xl px-4 py-2.5 text-xs md:text-sm leading-relaxed bg-indigo-600 text-white shadow-md text-left"
                            >
                              {part.text}
                            </div>
                          );
                        }

                        return (
                          <div
                            key={pIdx}
                            className="rounded-2xl px-4 py-3 bg-zinc-900 text-zinc-200 border border-zinc-800/90 shadow-md text-left max-w-2xl"
                          >
                            <MarkdownRenderer content={part.text} />
                          </div>
                        );
                      }

                      // Helper to identify tool name and output across all AI SDK representations
                      let toolName = "";
                      if (typeof part.type === "string" && part.type.startsWith("tool-")) {
                        toolName = part.type.replace("tool-", "");
                      } else if ((part as any).toolName) {
                        toolName = (part as any).toolName;
                      }

                      const rawPart = part as any;
                      const output = rawPart.output ?? rawPart.result ?? null;
                      const isAvailable = rawPart.state === "output-available" || output !== null;

                      // Generative UI: create_tasks or list_tasks
                      if (toolName === "create_tasks" || toolName === "list_tasks") {
                        if (isAvailable && output) {
                          return (
                            <div key={pIdx} className="text-left w-full">
                              <TaskList
                                tasks={output.tasks || []}
                                projectName={output.projectName}
                                projectId={output.projectId}
                                onTaskUpdated={() => fetchProjects()}
                              />
                            </div>
                          );
                        }
                        return (
                          <div
                            key={pIdx}
                            className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-400 flex items-center gap-2 text-left"
                          >
                            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
                            <span>Processing tasks...</span>
                          </div>
                        );
                      }

                      // Generative UI: show_board
                      if (toolName === "show_board") {
                        if (isAvailable && output) {
                          return (
                            <div key={pIdx} className="text-left w-full">
                              <KanbanBoard
                                projectId={output.projectId}
                                projectName={output.projectName}
                                columns={
                                  output.columns || {
                                    todo: [],
                                    in_progress: [],
                                    in_review: [],
                                    done: [],
                                  }
                                }
                                onTaskMoved={() => fetchProjects()}
                              />
                            </div>
                          );
                        }
                        return (
                          <div
                            key={pIdx}
                            className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-400 flex items-center gap-2 text-left"
                          >
                            <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
                            <span>Loading Kanban board...</span>
                          </div>
                        );
                      }

                      // Generative UI: create_project or list_projects
                      if (toolName === "create_project" || toolName === "list_projects") {
                        if (isAvailable && output) {
                          if (output.project) {
                            return (
                              <div key={pIdx} className="text-left">
                                <ProjectCard
                                  project={output.project}
                                  isActive={activeProject?.id === output.project.id}
                                  onSelectProject={(p) => {
                                    setActiveProject(p);
                                    fetchProjects();
                                  }}
                                />
                              </div>
                            );
                          }
                          if (output.projects && Array.isArray(output.projects)) {
                            return (
                              <div key={pIdx} className="space-y-2 text-left">
                                {output.projects.map((p: Project) => (
                                  <ProjectCard
                                    key={p.id}
                                    project={p}
                                    isActive={activeProject?.id === p.id}
                                    onSelectProject={(proj) => {
                                      setActiveProject(proj);
                                      fetchProjects();
                                    }}
                                  />
                                ))}
                              </div>
                            );
                          }
                        }
                      }

                      // Generative UI: show_summary
                      if (toolName === "show_summary") {
                        if (isAvailable && output) {
                          return (
                            <div key={pIdx} className="text-left">
                              <SummaryChart
                                project={output.project}
                                total={output.total}
                                counts={output.counts}
                                priorityCounts={output.priorityCounts}
                                completionPercentage={output.completionPercentage}
                              />
                            </div>
                          );
                        }
                        return (
                          <div
                            key={pIdx}
                            className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-400 flex items-center gap-2 text-left"
                          >
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                            <span>Calculating metrics...</span>
                          </div>
                        );
                      }

                      // Generative UI: secretary_briefing
                      if (toolName === "secretary_briefing") {
                        if (isAvailable && output) {
                          return (
                            <div key={pIdx} className="text-left w-full">
                              <SecretaryBriefing
                                projectId={output.projectId}
                                projectName={output.projectName}
                                briefingDate={output.briefingDate}
                                completionPercentage={output.completionPercentage}
                                totalTasks={output.totalTasks}
                                focusToday={output.focusToday || []}
                                recentlyCompleted={output.recentlyCompleted || []}
                                bottlenecks={output.bottlenecks || []}
                                secretaryTip={output.secretaryTip}
                                onTaskToggled={() => fetchProjects()}
                              />
                            </div>
                          );
                        }
                        return (
                          <div
                            key={pIdx}
                            className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300 flex items-center gap-2.5 text-left"
                          >
                            <PixelSprite archetype="ember" state="thinking" size="xs" />
                            <span>Ember is preparing your daily standup briefing...</span>
                          </div>
                        );
                      }

                      // Generative UI: audit_risks
                      if (toolName === "audit_risks") {
                        if (isAvailable && output) {
                          return (
                            <div key={pIdx} className="text-left w-full">
                              <RiskReport
                                projectId={output.projectId}
                                projectName={output.projectName}
                                overallRisk={output.overallRisk}
                                riskFlags={output.riskFlags || []}
                                healthyCount={output.healthyCount || 0}
                                auditTimestamp={output.auditTimestamp}
                              />
                            </div>
                          );
                        }
                        return (
                          <div
                            key={pIdx}
                            className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-cyan-300 flex items-center gap-2.5 text-left"
                          >
                            <PixelSprite archetype="specter" state="thinking" size="xs" />
                            <span>Specter is scanning for risks & bottlenecks...</span>
                          </div>
                        );
                      }

                      // Generative UI: ingest_notes
                      if (toolName === "ingest_notes") {
                        if (isAvailable && output) {
                          return (
                            <div key={pIdx} className="text-left w-full">
                              <TaskList
                                title={`Ingested Notes: ${output.sourceNotesSummary || "Extracted Tasks"}`}
                                tasks={output.tasks || []}
                                projectName={output.projectName}
                                projectId={output.projectId}
                                onTaskUpdated={() => fetchProjects()}
                              />
                            </div>
                          );
                        }
                        return (
                          <div
                            key={pIdx}
                            className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-400 flex items-center gap-2 text-left"
                          >
                            <PixelSprite archetype="ember" state="thinking" size="xs" />
                            <span>Parsing notes into actionable tasks...</span>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>

                  {isUser && (
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 mt-1">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex gap-3 mr-auto items-center text-xs text-zinc-400">
              <PixelSprite archetype="ember" state="thinking" size="sm" />
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 max-w-xl mx-auto flex items-start gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 font-bold flex-shrink-0">
                !
              </span>
              <div className="space-y-1">
                <p className="font-semibold text-rose-200">Notice:</p>
                <p className="leading-relaxed">
                  {error.message || "Failed to communicate with AI server. Please check your GOOGLE_GENERATIVE_AI_API_KEY in .env.local"}
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
          <form
            onSubmit={handleSend}
            className="max-w-3xl mx-auto flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 p-1.5 shadow-2xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeProject
                  ? `Message AI about "${activeProject.name}" (e.g. "show board", "add 3 tasks")...`
                  : "Message AI to create projects or plan tasks..."
              }
              className="flex-1 bg-transparent px-3 py-2 text-xs md:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
