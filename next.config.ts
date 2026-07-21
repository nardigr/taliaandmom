import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow HMR when opening dev site via LAN IP (e.g. 192.168.1.2:3000)
  allowedDevOrigins: ["192.168.1.2", "localhost"],
  // Low-RAM VPS Docker builds: skip tsc during image build (run locally / CI separately).
  typescript: {
    ignoreBuildErrors: process.env.DOCKER_BUILD === "1",
  },
  // Native sharp binaries are required for /api/admin/upload in standalone Docker.
  outputFileTracingIncludes: {
    "/api/admin/upload": [
      "./node_modules/sharp/**/*",
      "./node_modules/@img/**/*",
    ],
    "/api/uploads/*": [
      "./node_modules/sharp/**/*",
      "./node_modules/@img/**/*",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
