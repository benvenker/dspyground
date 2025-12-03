import fs from "fs";
import path from "path";
import { z } from "zod";

// Load the system prompt from the data directory if present
const systemPrompt = (() => {
  try {
    const promptPath = path.join(process.cwd(), "data", "system-prompt.txt");
    if (fs.existsSync(promptPath)) {
      const text = fs.readFileSync(promptPath, "utf-8");
      if (text.trim()) return text;
    }
  } catch {
    /* fall through to default */
  }
  return "You are a helpful AI assistant.";
})();

export default {
  systemPrompt,

  // Structured output schema (used only when the UI toggle is on)
  schema: z.object({
    reply: z
      .string()
      .describe(
        "Final tweet-length reply (<=280 chars) written in the target writer's voice."
      ),
    tone_notes: z
      .string()
      .describe("1–2 short reasons this matches the voice/tone."),
    risk_flags: z
      .array(
        z.enum(["off-voice", "too-formal", "too-long", "factual-risk", "other"])
      )
      .describe("Flags for evaluator/judge to penalize."),
  }),

  preferences: {
    selectedModel: "anthropic/claude-haiku-4.5",
    useStructuredOutput: false, // toggle in UI if you want the schema enforced
    optimizationModel: "anthropic/claude-haiku-4.5",
    reflectionModel: "anthropic/claude-opus-4.5",
    batchSize: 3,
    numRollouts: 10,
    selectedMetrics: ["tone", "accuracy"],
    optimizeStructuredOutput: false,
  },
};
