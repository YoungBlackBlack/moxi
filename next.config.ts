import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  outputFileTracingIncludes: {
    "/api/admin/import-assets": ["./public/catalog/**/*", "./public/catalog-manifest.json"]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb"
    }
  }
};

export default nextConfig;
