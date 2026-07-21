import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow HMR when opening dev site via LAN IP (e.g. 192.168.1.2:3000)
  allowedDevOrigins: ["192.168.1.2", "localhost"],
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
