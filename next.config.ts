import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["pdf-parse", "mammoth"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
