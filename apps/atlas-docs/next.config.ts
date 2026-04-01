import path from "path";
import type { NextConfig } from "next";

/** Repo root when `next build` runs from `apps/atlas-docs` (local + Vercel). */
const monorepoRoot = path.resolve(process.cwd(), "../..");

const nextConfig: NextConfig = {
  transpilePackages: ["@payglocal/ui"],
  outputFileTracingRoot: monorepoRoot,
};

export default nextConfig;
