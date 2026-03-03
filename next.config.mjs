/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'https://aiyjbushevyvlnwyegzz.supabase.co',
    ],
  },
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;
