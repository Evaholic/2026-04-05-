import { auth } from "@/auth";
import type { UserSession } from "@/lib/types";

export async function getServerSession(): Promise<UserSession> {
  const session = await auth();
  if (!session?.user) {
    return {
      isLoggedIn: false,
      name: null,
      email: null,
      avatarUrl: null,
    };
  }

  return {
    isLoggedIn: true,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    avatarUrl: session.user.image ?? null,
  };
}
