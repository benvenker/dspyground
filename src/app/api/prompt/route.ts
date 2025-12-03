import {
  clearConfigCache,
  getDataDirectory,
  loadUserConfig,
} from "@/lib/config-loader";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

// GET: Read the prompt from config (read-only)
export async function GET() {
  try {
    const config = await loadUserConfig();
    const dataDir = getDataDirectory();
    const overridePath = path.join(dataDir, "system-prompt.txt");
    let prompt = config.systemPrompt;

    if (fs.existsSync(overridePath)) {
      const override = fs.readFileSync(overridePath, "utf-8").trim();
      if (override) {
        prompt = override;
      }
    }

    prompt = prompt || "You are a helpful AI assistant.";

    return new Response(JSON.stringify({ prompt }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error reading prompt:", error);
    return new Response(JSON.stringify({ error: "Failed to load prompt" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST: Save prompt override to data directory
export async function POST(req: Request) {
  try {
    const { prompt } = (await req.json()) as { prompt?: string };
    const cleanPrompt = (prompt || "").trim();

    if (!cleanPrompt) {
      return new Response(
        JSON.stringify({ error: "Prompt cannot be empty" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const dataDir = getDataDirectory();
    const filePath = path.join(dataDir, "system-prompt.txt");

    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(filePath, cleanPrompt, "utf-8");
    clearConfigCache();

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving prompt:", error);
    return new Response(JSON.stringify({ error: "Failed to save prompt" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
