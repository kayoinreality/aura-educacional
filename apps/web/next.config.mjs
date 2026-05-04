/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // necessário para imagem Docker enxuta no Cloud Run
  transpilePackages: ['@aura/ui', '@aura/auth', '@aura/types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'image.mux.com' },
    ],
  },
};

export default nextConfig;
