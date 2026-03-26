import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@digiko-npm/cms', '@digiko-npm/ds-admin'],
};

export default nextConfig;
