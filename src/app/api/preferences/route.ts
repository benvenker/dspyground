import { loadUserConfig } from "@/lib/config-loader";
import { NextResponse } from "next/server";

type Preferences = {
  selectedModel: string;
  useStructuredOutput: boolean;
  // Optimizer settings
  optimizationModel?: string;
  reflectionModel?: string;
  batchSize?: number;
  numRollouts?: number;
  selectedMetrics?: string[];
  optimizeStructuredOutput?: boolean;
};

const DEFAULT_PREFERENCES: Preferences = {
  selectedModel: "openai/gpt-4o-mini",
  useStructuredOutput: false,
  // Optimizer defaults
  optimizationModel: "openai/gpt-4o-mini",
  reflectionModel: "openai/gpt-4o",
  batchSize: 3,
  numRollouts: 10,
  selectedMetrics: ["accuracy"],
  optimizeStructuredOutput: false,
};

// GET: Read preferences from config (read-only)
export async function GET() {
  try {
    const config = await loadUserConfig();

    // Merge config preferences with defaults
    const preferences: Preferences = {
      ...DEFAULT_PREFERENCES,
      ...config.preferences,
    };

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error reading preferences:", error);
    return NextResponse.json(DEFAULT_PREFERENCES);
  }
}

// POST: Preferences editing disabled
export async function POST(req: Request) {
  try {
    const incoming = (await req.json()) as Partial<Preferences>;
    const config = await loadUserConfig();

    const preferences: Preferences = {
      ...DEFAULT_PREFERENCES,
      ...config.preferences,
      ...incoming,
    };

    // Note: preferences are not persisted server-side; UI keeps them in state.
    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error handling preferences POST:", error);
    return NextResponse.json(DEFAULT_PREFERENCES);
  }
}
