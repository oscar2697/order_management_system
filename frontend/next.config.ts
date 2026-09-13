import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output produces a minimal server for the Docker image.
  output: "standalone",
};

export default nextConfig;
