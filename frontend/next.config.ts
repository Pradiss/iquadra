import type { NextConfig } from "next";

const railwayApiUrl = process.env.RAILWAY_API_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!railwayApiUrl) {
      return [];
    }

    return [
      {
        source: "/api/proxy/:path*",
       destination: `${railwayApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
