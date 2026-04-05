import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/session-provider";

export async function GET() {
  try {
    const session = await getServerSession();
    return NextResponse.json(session);
  } catch {
    return NextResponse.json({ error: "session_failed" }, { status: 500 });
  }
}
