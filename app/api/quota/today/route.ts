import { NextResponse } from "next/server";
import { quotaStore } from "@/lib/server/quota-store";

export async function GET() {
  try {
    const quota = quotaStore.get();
    return NextResponse.json(quota);
  } catch {
    return NextResponse.json({ error: "quota_failed" }, { status: 500 });
  }
}
