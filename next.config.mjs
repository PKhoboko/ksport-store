/** @type {import('next').NextConfig} */
/*const nextConfig = {
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

export default nextConfig;*/

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      // Keep your Supabase one here as well if you are using it
      {
        protocol: 'https',
        hostname: 'https://aiyjbushevyvlnwyegzz.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
