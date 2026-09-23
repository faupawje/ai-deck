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
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return new Response(
        JSON.stringify({
          error:
            "Missing Gemini API Key. Please add your GOOGLE_GENERATIVE_AI_API_KEY in .env.local and restart the server.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { messages, projectId }: { messages: UIMessage[]; projectId?: string } = await req.json();

    const systemPrompt = buildSystemPrompt(projectId);
    const modelName = process.env.GEMINI_MODEL || "gemini-3.7-flash";

    const result = streamText({
      model: google(modelName),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      tools: projectTools,
      stopWhen: isStepCount(5),
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        onError: (err) => {
          console.error("STREAM ERROR CAUGHT IN toUIMessageStream:", err);
          return err instanceof Error ? err.message : String(err);
        },
      }),
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
