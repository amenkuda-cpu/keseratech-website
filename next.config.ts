import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next treats @libsql/client as an external package by default, which makes the Netlify packager
  // symlink it (refused on Windows without Developer Mode). We only use its pure-JS web client,
  // so bundle it like any other code instead.
  transpilePackages: ["@libsql/client"],
};

export default nextConfig;
