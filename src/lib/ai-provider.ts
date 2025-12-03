import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// Configure OpenRouter as the default AI SDK provider for the app.
const openrouterProvider = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

// Make the provider globally available to ai-sdk calls (streamText/streamObject).
// @ts-ignore - global value set for ai-sdk runtime
globalThis.AI_SDK_DEFAULT_PROVIDER = openrouterProvider;

export { openrouterProvider };
