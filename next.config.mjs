/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set Turbopack root to fix workspace root issue
  turbopack: {
    root: process.cwd(),
  },
  // Compression for smaller payloads
  compress: true,
  // Generate ETags for caching
  generateEtags: true,
  images: {
    // Enable image optimization for better LCP
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    // Optimize image formats
    formats: ["image/avif", "image/webp"],
    // Define device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimize layout shift
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },
  // Enable experimental features for better performance
  // Note: optimizeCss disabled due to critters compatibility issues with Next.js 16
  // experimental: {
  //   optimizeCss: true,
  // },
};

export default nextConfig;
