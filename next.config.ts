import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: '*.clerk.accounts.dev' },
      { protocol: 'https', hostname: 'yyfujjkmzhxqhpdtbxda.supabase.co' },
    ],
  },
};

export default nextConfig;
