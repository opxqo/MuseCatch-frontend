import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for EdgeOne Pages
  output: "export",
  
  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },
  
  // Turbopack for faster builds
  turbopack: {},
  
  // Trailing slash for better static hosting compatibility
  trailingSlash: true,
  
  // Generate source maps for debugging (optional, can disable for smaller builds)
  productionBrowserSourceMaps: false,
};

export default nextConfig;
