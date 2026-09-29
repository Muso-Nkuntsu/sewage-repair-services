import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // No ESLint setup is shipped with this prototype, so don't let a missing
  // linter config block `npm run build`. TypeScript errors still fail the build.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
