import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Auth.js (NextAuth v5)。环境变量见 .env.example。
 * Google Cloud「已获授权的重定向 URI」须与下面完全一致：{AUTH_URL 或 NEXTAUTH_URL 的 origin}/api/auth/callback/google
 * 开发时可访问 GET /api/debug/oauth-callback-url 查看当前环境算出的 expectedRedirectUri。
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});
