import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mediapool.bmwgroup.com",
        pathname: "/cache/**",
      },
      {
        protocol: "https",
        hostname: "mediapool.bmwgroup.com",
        pathname: "/download/**",
      },
      {
        protocol: "https",
        hostname: "media.mercedes-benz.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.mercedes-benz.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.mbusa.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.oneweb.mercedes-benz.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/**",
      },
      {
        protocol: "https",
        hostname: "file.kelleybluebookimages.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "web.archive.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mercedes-benz-media.co.uk",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "hips.hearstapps.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s1.cdn.autoevolution.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.auto-data.net",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "c.encycarpedia.com",
        pathname: "/ci/**",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
