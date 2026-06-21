import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the native better-sqlite3 module out of the server bundle so Next.js
  // loads it via Node's native `require` at runtime instead of trying to bundle
  // the prebuilt `.node` binary.
  serverExternalPackages: ["better-sqlite3"],
  // Allow the WSL host IP to reach the dev server. Without this, Next.js treats
  // requests from http://192.168.210.1:3000 as cross-origin and blocks /api
  // calls, which breaks adding trades and closing the daily review.
  allowedDevOrigins: ["192.168.210.1"],
};

export default nextConfig;
