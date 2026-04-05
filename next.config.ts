import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 避免 Stripe Node SDK 被打进 webpack 后出现运行时模块解析错误（如 e[o] is not a function）
  serverExternalPackages: ["stripe"],
};

export default nextConfig;
