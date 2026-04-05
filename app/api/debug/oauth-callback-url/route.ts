import { NextResponse } from "next/server";

/**
 * 仅开发：返回当前环境算出的 Google OAuth 回调地址，便于与 Cloud 控制台「已获授权的重定向 URI」逐字对照。
 * 生产环境返回 404。
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  const authUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "";
  let origin = "";
  try {
    if (authUrl) origin = new URL(authUrl).origin;
  } catch {
    origin = "";
  }

  const callbackPath = "/api/auth/callback/google";
  const expectedRedirectUri = origin ? `${origin}${callbackPath}` : null;

  const clientId = process.env.GOOGLE_CLIENT_ID ?? "";

  return NextResponse.json({
    hint: "在 Google Cloud 凭据 → 你的网页客户端 → 已获授权的重定向 URI 中，必须包含下面 expectedRedirectUri 的完整字符串（含 http/https、端口、路径，无多余尾斜杠）。",
    AUTH_URL: process.env.AUTH_URL ?? null,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? null,
    resolvedOrigin: origin || null,
    expectedRedirectUri,
    ifExpectedRedirectUriIsNull:
      "请在本机 .env.local 设置 AUTH_URL（与浏览器地址栏协议+主机+端口一致，无尾斜杠），保存后重启 npm run dev。",
    GOOGLE_CLIENT_ID_prefix: clientId ? `${clientId.slice(0, 28)}…` : null,
    verifySameClient:
      "请确认控制台里编辑的 OAuth 客户端 ID 与 .env.local 里 GOOGLE_CLIENT_ID 为同一串。",
  });
}
