import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  /* config options here */
  images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "*",
      port: "",
      pathname: "/**",
    }
  ],
},
};

export default nextConfig;
