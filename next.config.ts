import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next treats @libsql/client as an external package by default, which makes the Netlify packager
  // symlink it (refused on Windows without Developer Mode). We only use its pure-JS web client,
  // so bundle it like any other code instead.
  transpilePackages: ["@libsql/client"],
  async headers() {
    // Baseline protection for every page; the admin is also kept out of search and caches.
    const base = [
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
    ];
    return [
      { source: "/:path*", headers: base },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
  async redirects() {
    // Smart Irrigation became AgriSera Horizon.
    return [{ source: "/projects/smart-irrigation", destination: "/projects/agrisera-horizon", permanent: true }];
  },
};

export default nextConfig;
