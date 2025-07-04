import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "uploadthing.com",
      "gwlxcbjf2z.ufs.sh"
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
