import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
<<<<<<< HEAD
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
=======
    typedRoutes: false, 
>>>>>>> Issue3
  },
};

export default nextConfig;