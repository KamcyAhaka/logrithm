import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // output: standalone is required for Cloud Run — never remove
  output: 'standalone',
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
