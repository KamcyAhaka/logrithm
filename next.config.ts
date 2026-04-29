import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
  output: 'standalone',
  experimental: {
    serverExternalPackages: ['firebase-admin'],
  },
};

export default nextConfig;
