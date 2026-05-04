import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: false,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const isExport = process.env.NEXT_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(isExport && { output: "export" }),
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {},
  basePath: isExport ? "/VOICEFORGE-" : "",
  assetPrefix: isExport ? "/VOICEFORGE-/" : "",
};

export default withPWA(nextConfig);
