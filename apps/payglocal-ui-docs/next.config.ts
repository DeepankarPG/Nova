import path from "path";
import type { NextConfig } from "next";

const monorepoRoot = path.resolve(process.cwd(), "../..");

const nextConfig: NextConfig = {
  transpilePackages: ["@payglocal/ui"],
  outputFileTracingRoot: monorepoRoot,
};

export default nextConfig;
