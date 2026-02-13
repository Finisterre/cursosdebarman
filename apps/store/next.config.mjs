/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "uvywhsighkfjrzyceijp.supabase.co"
      },
      {
        protocol: "https",
        hostname: "http2.mlstatic.com"
      }
    ]
  }
};

export default nextConfig;

