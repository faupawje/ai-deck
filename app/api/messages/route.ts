import { NextResponse } from "next/server";
import * as db from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    const records = db.getMessages(projectId || null);

    // Convert SQLite MessageRecord into UI messages format
    const uiMessages = records.map((record) => {
      const parts: any[] = [];

      if (record.content) {
        parts.push({
          type: "text",
          text: record.content,
        });
      }

      if (record.tool_calls_json) {
        try {
          const tools = JSON.parse(record.tool_calls_json);
          if (Array.isArray(tools)) {
            for (const tool of tools) {
              parts.push({
                type: `tool-${tool.name}`,
                toolName: tool.name,
                toolCallId: tool.id || `call_${tool.name}_${record.id}`,
                state: "output-available",
                output: tool.result,
              });
            }
          }
        } catch (e) {
          console.error("Failed to parse tool_calls_json:", e);
        }
      }

      return {
        id: record.id,
        role: record.role,
        parts: parts.length > 0 ? parts : [{ type: "text", text: record.content || "" }],
        createdAt: record.created_at,
      };
    });

    return NextResponse.json({ messages: uiMessages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    db.clearMessages(projectId || null);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
