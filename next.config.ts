import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the native better-sqlite3 module out of the server bundle so Next.js
  // loads it via Node's native `require` at runtime instead of trying to bundle
  // the prebuilt `.node` binary.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
