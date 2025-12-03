export const runtime = "nodejs";

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "OPENROUTER_API_KEY is missing. Add it to your environment to load models.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      throw new Error(`OpenRouter responded with ${res.status}`);
    }

    const data = (await res.json()) as any;
    const list = (data.data || data.models || []) as any[];

    // Minimal projection for the UI
    const models = list.map((m) => ({
      id: m.id,
      name: m.name ?? m.id,
      description: m.description ?? null,
      modelType: (m as any).modality ?? (m as any).type ?? "language",
      pricing: (m as any).pricing ?? (m as any).prices ?? null,
    }));

    return new Response(
      JSON.stringify({
        models,
        textModels: models.filter((m) => m.modelType === "language"),
        embeddingModels: models.filter((m) => m.modelType === "embedding"),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    const fallbackModels = [
      {
        id: "openai/gpt-4o-mini",
        name: "OpenAI GPT-4o Mini (OpenRouter)",
        description: "Fallback default model",
        modelType: "language",
        pricing: null,
      },
    ];

    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({
        error: message,
        models: fallbackModels,
        textModels: fallbackModels,
        embeddingModels: [],
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
