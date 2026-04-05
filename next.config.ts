import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // next-auth/react 客户端只内联 NEXTAUTH_URL，不读 AUTH_URL；仅设 AUTH_URL 时会误用默认 localhost:3000，引发 redirect_uri 与 Google 控制台不一致
  env: {
    NEXTAUTH_URL: process.env.AUTH_URL || process.env.NEXTAUTH_URL || "",
  },
  // 避免 Stripe Node SDK 被打进 webpack 后出现运行时模块解析错误（如 e[o] is not a function）
  serverExternalPackages: ["stripe", "openai", "@google/generative-ai"],
};

export default nextConfig;
