/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ursrbmvgrpjhuogfimal.supabase.co', 'api.dicebear.com', 'www.thesportsdb.com'],
    unoptimized: true,
  },
};

module.exports = nextConfig;
