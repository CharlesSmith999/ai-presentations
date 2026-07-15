import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  eslint: {
    // ESLint currently crashes during `next build` due to a
    // @typescript-eslint plugin version mismatch. Linting still runs
    // in CI (.github/workflows/ci.yml) as a non-blocking check;
    // disabling it here only stops it from blocking the production build.
    ignoreDuringBuilds: true,
  },
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
