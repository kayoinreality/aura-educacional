/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@aura/ui', '@aura/auth', '@aura/types'],
};
export default nextConfig;
