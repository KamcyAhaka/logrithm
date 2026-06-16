import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // output: standalone is required for Cloud Run — never remove
  output: 'standalone',
  reactCompiler: true,
  // Allow 127.0.0.1 to access Next.js HMR in dev — used to simulate beta domain locally
  allowedDevOrigins: ['127.0.0.1'],
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
