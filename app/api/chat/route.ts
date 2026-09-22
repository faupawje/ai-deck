import { google } from "@ai-sdk/google";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  isStepCount,
  createUIMessageStreamResponse,
  toUIMessageStream,
} from "ai";
import { projectTools } from "@/lib/tools";
import { buildSystemPrompt } from "@/lib/system-prompt";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, projectId }: { messages: UIMessage[]; projectId?: string } = await req.json();

    const systemPrompt = buildSystemPrompt(projectId);
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const result = streamText({
      model: google(modelName),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      tools: projectTools,
      stopWhen: isStepCount(5),
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return new Response(
      JSON.stringify({
        error: error?.message || "An error occurred while communicating with Gemini.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
