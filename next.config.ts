import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // ponytail: picsum placeholders until real project photos land
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      // Vercel Blob (admin photo uploads)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
