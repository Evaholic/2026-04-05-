import type { UserSession } from "@/lib/types";

/**
 * TODO: 接入 Auth.js / Firebase / Supabase，从 cookie / token 解析用户。
 */
export async function getServerSession(): Promise<UserSession> {
  return {
    isLoggedIn: false,
    name: null,
    email: null,
    avatarUrl: null,
  };
}
