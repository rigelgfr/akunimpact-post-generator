import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false, 
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = ['canvas', ...config.externals];
    }

    return config;
  }
};

export default nextConfig;