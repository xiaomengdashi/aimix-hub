import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    // 避免 Next.js 误将上级目录的 lockfile 当作 monorepo 根目录
    root: projectRoot,
  },
};

export default nextConfig;
