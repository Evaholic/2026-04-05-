import { NextResponse } from "next/server";
import { finalizeEvaluateResponse } from "@/lib/evaluate-core";
import { getMissingLlmEnvKeys } from "@/lib/llm/env-check";
import { runTripleModelEvaluation } from "@/lib/llm/run-triple-evaluation";
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

    const missing = getMissingLlmEnvKeys();
    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: "llm_not_configured",
          message: "请在环境变量中配置三模型密钥后再使用真实评估。",
          missing,
        },
        { status: 503 }
      );
    }

    const { usedToday } = quotaStore.get();
    const evaluations = await runTripleModelEvaluation(body);
    const result = finalizeEvaluateResponse(evaluations, usedToday);
    quotaStore.setUsedToday(result.quota.usedToday);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/evaluate]", err);
    return NextResponse.json({ error: "evaluate_failed" }, { status: 500 });
  }
}
