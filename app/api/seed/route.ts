import { NextResponse } from "next/server";
import { getDb, createProject, createTask, saveMessage, getTasks, getAllProjects } from "@/lib/db";

export async function GET(req: Request) {
  return handleSeed(req);
}

export async function POST(req: Request) {
  return handleSeed(req);
}

async function handleSeed(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shouldReset = searchParams.get("reset") === "true";

    const db = getDb();

    if (shouldReset) {
      db.prepare("DELETE FROM messages").run();
      db.prepare("DELETE FROM tasks").run();
      db.prepare("DELETE FROM projects").run();
    }

    // 1. CyberNexus: Flagship AI Game Engine
    const cyberId = "proj_cybernexus_engine";
    let cyberProject = db.prepare("SELECT * FROM projects WHERE id = ?").get(cyberId);
    if (!cyberProject) {
      db.prepare(`
        INSERT INTO projects (id, name, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(
        cyberId,
        "CyberNexus: AI Game Engine",
        "Real-time neural physics & WebGPU rendering engine with autonomous NPC intelligence and distributed spatial computing.",
        "active"
      );
    }

    // 2. NeoPay: Mobile Fintech Wallet
    const neopayId = "proj_neopay_wallet";
    let neopayProject = db.prepare("SELECT * FROM projects WHERE id = ?").get(neopayId);
    if (!neopayProject) {
      db.prepare(`
        INSERT INTO projects (id, name, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(
        neopayId,
        "NeoPay: Web3 & Fiat Wallet",
        "Biometric tap-to-pay multi-currency wallet with instant cross-border settlement and automated escrow contracts.",
        "active"
      );
    }

    // 3. Quantum: Design System (Completed)
    const quantumId = "proj_quantum_design";
    let quantumProject = db.prepare("SELECT * FROM projects WHERE id = ?").get(quantumId);
    if (!quantumProject) {
      db.prepare(`
        INSERT INTO projects (id, name, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(
        quantumId,
        "Quantum: Retro Pixel Design System",
        "Unified design tokens, Tailwind CSS component library, WCAG AAA accessibility, and pixel-art sprite kit.",
        "completed"
      );
    }

    // 4. Sentinel: Drone Swarm Dispatcher (Paused)
    const sentinelId = "proj_sentinel_swarm";
    let sentinelProject = db.prepare("SELECT * FROM projects WHERE id = ?").get(sentinelId);
    if (!sentinelProject) {
      db.prepare(`
        INSERT INTO projects (id, name, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(
        sentinelId,
        "Sentinel: Drone Swarm Fleet",
        "Mesh network protocols for autonomous multi-drone formation flight and real-time obstacle evasion.",
        "paused"
      );
    }

    // Seed Tasks for CyberNexus if not present
    const existingCyberTasks = getTasks(cyberId);
    if (existingCyberTasks.length === 0) {
      const demoCyberTasks = [
        // Done (Sprint 1)
        {
          id: "task_cn_01",
          project_id: cyberId,
          title: "Implement WebGPU compute shader pipeline",
          description: "Construct zero-copy compute buffers for matrix math on Metal, DirectX 12, and Vulkan backends.",
          status: "done" as const,
          priority: "high" as const,
          sprint: "Sprint 1",
          assignee: "Marcus Chen",
          sort_order: 1,
        },
        {
          id: "task_cn_02",
          project_id: cyberId,
          title: "SQLite local asset cache & metadata store",
          description: "Store compiled SPIR-V shaders and textures in an embedded database for instant hot-reload.",
          status: "done" as const,
          priority: "medium" as const,
          sprint: "Sprint 1",
          assignee: "Devin AI",
          sort_order: 2,
        },
        {
          id: "task_cn_03",
          project_id: cyberId,
          title: "Neural NPC decision tree & behavior state machine",
          description: "Lightweight runtime inference runner for autonomous NPC goal hierarchy and environmental awareness.",
          status: "done" as const,
          priority: "high" as const,
          sprint: "Sprint 1",
          assignee: "Elena Rostova",
          sort_order: 3,
        },
        // In Review (Sprint 2)
        {
          id: "task_cn_04",
          project_id: cyberId,
          title: "Zero-copy memory ring buffer for spatial physics",
          description: "High-frequency lock-free ring buffer feeding rigid body collision data into compute shader. Needs memory safety audit.",
          status: "in_review" as const,
          priority: "urgent" as const,
          sprint: "Sprint 2",
          assignee: "Marcus Chen",
          sort_order: 4,
        },
        {
          id: "task_cn_05",
          project_id: cyberId,
          title: "SPIR-V to WGSL offline cross-compilation tool",
          description: "Pre-compile GLSL/HLSL shaders into WebGPU WGSL at build time with source-map debugging support.",
          status: "in_review" as const,
          priority: "medium" as const,
          sprint: "Sprint 2",
          assignee: "Elena Rostova",
          sort_order: 5,
        },
        // In Progress (Sprint 2)
        {
          id: "task_cn_06",
          project_id: cyberId,
          title: "Autonomous NPC conversational perception layer",
          description: "Hook Gemini 3.6 Flash streaming response into dynamic game subtitle and spatial lip-sync audio generator.",
          status: "in_progress" as const,
          priority: "urgent" as const,
          sprint: "Sprint 2",
          assignee: "Elena Rostova",
          sort_order: 6,
        },
        {
          id: "task_cn_07",
          project_id: cyberId,
          title: "Real-time ray-traced ambient occlusion shaders",
          description: "Screen-space temporal reprojection with adaptive denoising filters running at 120 FPS on 4K displays.",
          status: "in_progress" as const,
          priority: "high" as const,
          sprint: "Sprint 2",
          assignee: "Marcus Chen",
          sort_order: 7,
        },
        {
          id: "task_cn_08",
          project_id: cyberId,
          title: "Bi-directional WebSocket synchronization for physics",
          description: "Client-side prediction and server reconciliation for multi-player collision events at 60 Hz tickrate.",
          status: "in_progress" as const,
          priority: "medium" as const,
          sprint: "Sprint 2",
          assignee: "Kai Tanaka",
          sort_order: 8,
        },
        // Todo (Sprint 2 & 3)
        {
          id: "task_cn_09",
          project_id: cyberId,
          title: "Critical memory leak in particle compute emitter",
          description: "Unbounded VRAM allocation when particle count exceeds 500,000 instances during prolonged emitter run.",
          status: "todo" as const,
          priority: "urgent" as const,
          sprint: "Sprint 2",
          assignee: "Unassigned", // Triggers risk audit!
          sort_order: 9,
        },
        {
          id: "task_cn_10",
          project_id: cyberId,
          title: "Spatial audio occlusion calculation with BVH trees",
          description: "Trace sound rays against bounding volume hierarchies to simulate realistic acoustic reverberation in enclosed rooms.",
          status: "todo" as const,
          priority: "high" as const,
          sprint: "Sprint 3",
          assignee: "Unassigned", // Triggers risk audit!
          sort_order: 10,
        },
        {
          id: "task_cn_11",
          project_id: cyberId,
          title: "Automated regression benchmark suite on GitHub Actions",
          description: "Run headless rendering benchmarks on Linux GPU runners to prevent frame-time regressions over 16.6ms.",
          status: "todo" as const,
          priority: "medium" as const,
          sprint: "Sprint 3",
          assignee: "Sarah Connor",
          sort_order: 11,
        },
        {
          id: "task_cn_12",
          project_id: cyberId,
          title: "Developer documentation for C++ & Rust plugin bindings",
          description: "Comprehensive guide with code examples illustrating how to register custom C ABI native extensions.",
          status: "todo" as const,
          priority: "low" as const,
          sprint: "Sprint 3",
          assignee: "Sarah Connor",
          sort_order: 12,
        },
      ];

      for (const t of demoCyberTasks) {
        db.prepare(`
          INSERT INTO tasks (id, project_id, title, description, status, priority, sprint, assignee, sort_order, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).run(t.id, t.project_id, t.title, t.description, t.status, t.priority, t.sprint, t.assignee, t.sort_order);
      }
    }

    // Seed Tasks for NeoPay
    const existingNeoTasks = getTasks(neopayId);
    if (existingNeoTasks.length === 0) {
      const demoNeoTasks = [
        {
          id: "task_neo_01",
          project_id: neopayId,
          title: "Pass PCI-DSS Level 1 compliance pre-audit",
          description: "Verify end-to-end tokenization and HSM hardware key isolation with third-party auditor.",
          status: "done" as const,
          priority: "urgent" as const,
          sprint: "Sprint 1",
          assignee: "Sarah Connor",
          sort_order: 1,
        },
        {
          id: "task_neo_02",
          project_id: neopayId,
          title: "Apple Pay & Google Pay PassKit integration",
          description: "Provision virtual card tokens directly into native Apple Wallet and Google Wallet securely.",
          status: "in_progress" as const,
          priority: "urgent" as const,
          sprint: "Sprint 1",
          assignee: "Marcus Chen",
          sort_order: 2,
        },
        {
          id: "task_neo_03",
          project_id: neopayId,
          title: "Automate chargeback dispute resolution workflow",
          description: "Trigger automated evidentiary document compilation when a dispute webhook arrives from Stripe/Adyen.",
          status: "todo" as const,
          priority: "high" as const,
          sprint: "Sprint 2",
          assignee: "Kai Tanaka",
          sort_order: 3,
        },
        {
          id: "task_neo_04",
          project_id: neopayId,
          title: "Biometric WebAuthn passkey registration",
          description: "Replace legacy SMS OTP 2FA with FIDO2 hardware passkeys synced across iCloud Keychain and Chrome.",
          status: "todo" as const,
          priority: "medium" as const,
          assignee: "Unassigned",
          sprint: "Sprint 2",
          sort_order: 4,
        },
      ];

      for (const t of demoNeoTasks) {
        db.prepare(`
          INSERT INTO tasks (id, project_id, title, description, status, priority, sprint, assignee, sort_order, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).run(t.id, t.project_id, t.title, t.description, t.status, t.priority, t.sprint, t.assignee, t.sort_order);
      }
    }

    // Seed Tasks for Quantum Design
    const existingQuantumTasks = getTasks(quantumId);
    if (existingQuantumTasks.length === 0) {
      const demoQuantumTasks = [
        {
          id: "task_qd_01",
          project_id: quantumId,
          title: "Design retro pixel sprite sheets (Ember & Specter)",
          description: "Pixel-perfect SVG illustrations with responsive frame animations for idle, thinking, and celebratory states.",
          status: "done" as const,
          priority: "high" as const,
          sprint: "Sprint 1",
          assignee: "Kai Tanaka",
          sort_order: 1,
        },
        {
          id: "task_qd_02",
          project_id: quantumId,
          title: "WCAG 2.2 AAA accessibility & contrast audit",
          description: "Guarantee all text and interactive indicators exceed 7:1 color contrast ratios across dark mode surfaces.",
          status: "done" as const,
          priority: "medium" as const,
          sprint: "Sprint 1",
          assignee: "Sarah Connor",
          sort_order: 2,
        },
        {
          id: "task_qd_03",
          project_id: quantumId,
          title: "Publish npm component package v1.0.0",
          description: "Export TypeScript definitions, ESM bundles, and Tailwind CSS preset configuration.",
          status: "done" as const,
          priority: "low" as const,
          sprint: "Sprint 1",
          assignee: "Devin AI",
          sort_order: 3,
        },
      ];

      for (const t of demoQuantumTasks) {
        db.prepare(`
          INSERT INTO tasks (id, project_id, title, description, status, priority, sprint, assignee, sort_order, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).run(t.id, t.project_id, t.title, t.description, t.status, t.priority, t.sprint, t.assignee, t.sort_order);
      }
    }

    // Seed Sample Messages for CyberNexus showcasing Ember Secretary
    const existingMessages = db.prepare("SELECT count(*) as count FROM messages WHERE project_id = ?").get(cyberId) as { count: number };
    if (existingMessages.count === 0) {
      db.prepare(`
        INSERT INTO messages (id, project_id, role, content, tool_calls_json, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now', '-30 minutes'))
      `).run(
        "msg_demo_01",
        cyberId,
        "user",
        "Ember, prepare today's daily standup briefing for CyberNexus: AI Game Engine",
        null
      );

      const standupBriefingPayload = {
        name: "secretary_briefing",
        result: {
          project: {
            id: cyberId,
            name: "CyberNexus: AI Game Engine",
            totalTasks: 12,
            completionPercentage: 25,
          },
          date: new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" }),
          focusTasks: [
            {
              id: "task_cn_06",
              title: "Autonomous NPC conversational perception layer",
              priority: "urgent",
              assignee: "Elena Rostova",
              sprint: "Sprint 2",
              status: "in_progress",
            },
            {
              id: "task_cn_04",
              title: "Zero-copy memory ring buffer for spatial physics",
              priority: "urgent",
              assignee: "Marcus Chen",
              sprint: "Sprint 2",
              status: "in_review",
            },
            {
              id: "task_cn_07",
              title: "Real-time ray-traced ambient occlusion shaders",
              priority: "high",
              assignee: "Marcus Chen",
              sprint: "Sprint 2",
              status: "in_progress",
            },
          ],
          bottlenecks: [
            "Critical memory leak in particle compute emitter is marked URGENT but has no assignee.",
            "Zero-copy memory ring buffer has been in review; unblocking this is required for the physics stress test.",
          ],
          recentWins: [
            "WebGPU compute shader pipeline successfully verified on Apple Silicon & Vulkan.",
            "Neural NPC decision tree inference engine running at sub-millisecond latency.",
            "Embedded SQLite asset cache hot-reload operational.",
          ],
          secretaryTip: "🔥 Pro tip: Assign Marcus Chen or Devin AI to the particle emitter memory leak before it compounds during multiplayer stress tests.",
        },
      };

      db.prepare(`
        INSERT INTO messages (id, project_id, role, content, tool_calls_json, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now', '-29 minutes'))
      `).run(
        "msg_demo_02",
        cyberId,
        "assistant",
        "🔥 **Good morning!** I have compiled the Daily Standup Briefing for **CyberNexus: AI Game Engine**.\n\nOur momentum is strong with 3 major engine milestones landed, but we have an urgent memory leak in the particle emitter that needs an owner today!",
        JSON.stringify([standupBriefingPayload])
      );
    }

    const allProjects = getAllProjects();
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with rich demo data across all features.",
      projectsCount: allProjects.length,
      projects: allProjects,
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
