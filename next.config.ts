import type { NextConfig } from "next";
import path from "path";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "standalone",
  // Keep file tracing scoped to the project. In dev, widening the root makes
  // Turbopack scan the entire home directory (slow cold starts). We only widen
  // for production builds when preparing the standalone output.
  outputFileTracingRoot: isProd ? path.join(__dirname) : undefined,
  eslint: {
    // Don't fail build on pre-existing lint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail build on pre-existing type errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
