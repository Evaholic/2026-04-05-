import { NextResponse } from "next/server";
import { computeEvaluateResponse } from "@/lib/evaluate-core";
import { quotaStore } from "@/lib/server/quota-store";
import type { EvaluatePayload } from "@/lib/types";

function isEvaluatePayload(body: unknown): body is EvaluatePayload {
  if (body === null || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  return typeof o.question === "string" && typeof o.answer === "string";
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!isEvaluatePayload(body)) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const { usedToday } = quotaStore.get();
    const result = computeEvaluateResponse(body, usedToday);
    quotaStore.setUsedToday(result.quota.usedToday);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "evaluate_failed" }, { status: 500 });
  }
}
