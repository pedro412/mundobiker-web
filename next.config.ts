import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      'localhost',
      '127.0.0.1',
      // Add your production API domain here
      'api.mundobiker.com', // Replace with your actual API domain
      // Add any CDN domains where images might be hosted
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        pathname: '/**',
      },
      // Add patterns for your production API
      {
        protocol: 'https',
        hostname: 'api.mundobiker.com', // Replace with your actual API domain
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
