import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF is typically 20-30% smaller than WebP; browsers without it get WebP.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Blog images uploaded through the admin (Vercel Blob).
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
