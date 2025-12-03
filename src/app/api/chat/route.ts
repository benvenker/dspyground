import {
  getSystemPromptFromFile,
  loadUserConfig,
} from "@/lib/config-loader";
import {
  convertToModelMessages,
  stepCountIs,
  streamObject,
  streamText,
} from "ai";
import "@/lib/ai-provider";
import "dotenv/config";

export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();

  // Check for parameters in URL
  const url = new URL(req.url);
  const useStructuredOutput = url.searchParams.get("structured") === "true";
  const modelId =
    url.searchParams.get("model") || "openai/gpt-4o-mini";

  // Load user config
  const config = await loadUserConfig();

  // Get system prompt from config
  const systemPrompt =
    getSystemPromptFromFile() || config.systemPrompt || undefined;

  // Validate schema is defined when structured output is enabled
  if (useStructuredOutput && !config.schema) {
    return new Response(
      JSON.stringify({
        error:
          "Structured output is enabled but no schema is defined. Please define a Zod schema in dspyground.config.ts",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // If structured output is requested, use streamObject
  if (useStructuredOutput) {
    // Use schema from config (already validated above)
    const schema = config.schema!; // Non-null assertion safe here due to validation above

    // Get messages array - required for both structured and non-structured
    const messages = body.messages || [];

    // Filter out any malformed messages and ensure content exists
    // Convert UI messages (which include role/content) into provider format
    const extractText = (content: any): string => {
      if (typeof content === "string") return content;
      if (Array.isArray(content)) {
        return content
          .map((item) => {
            if (typeof item === "string") return item;
            if (item && typeof item === "object" && "text" in item)
              return String((item as any).text ?? "");
            if (item && typeof item === "object" && "content" in item)
              return String((item as any).content ?? "");
            return "";
          })
          .join("\n");
      }
      if (content && typeof content === "object") {
        if ("text" in content) return String((content as any).text ?? "");
        if ("content" in content) return String((content as any).content ?? "");
      }
      return "";
    };

    let validMessages = (messages || [])
      .filter((msg: any) => msg && msg.role)
      .map((msg: any) => {
        const raw = msg.content ?? msg.parts ?? msg.text ?? msg.message ?? "";
        const text = extractText(raw);
        const trimmed = text.trim();
        return trimmed
          ? {
              role: msg.role,
              content: [{ type: "text", text: trimmed }],
            }
          : null;
      })
      .filter(Boolean);

    // Fallback: if no valid messages, but a prompt/body was sent, add it as a single user message
    if (validMessages.length === 0) {
      const rawPrompt =
        body.prompt ||
        body.input ||
        body.message ||
        body.text ||
        "";
      const trimmed = typeof rawPrompt === "string" ? rawPrompt.trim() : "";
      if (trimmed) {
        validMessages = [
          {
            role: "user",
            content: [{ type: "text", text: trimmed }],
          },
        ];
      }
    }

    if (validMessages.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No valid messages provided",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      const objectResult = streamObject({
        model: modelId,
        schema: schema,
        system: systemPrompt,
        messages: validMessages as any,
      });

      // ai@5.0.44 exposes toTextStreamResponse() for streamObject results
      return objectResult.toTextStreamResponse();
    } catch (error) {
      console.error("❌ Error in structured output:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to generate structured output",
          details: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // Otherwise use regular streamText with messages array
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const result = streamText({
    model: modelId,
    tools: config.tools || {},
    system: systemPrompt,
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
