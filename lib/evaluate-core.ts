import { FREE_LIMIT_PER_DAY } from "@/lib/constants";
import { buildComposite, clampScore } from "@/lib/trust";
import type { EvaluatePayload, EvaluateResponse, ModelEvaluation } from "@/lib/types";

/**
 * 纯函数：根据输入生成评估结果。fakeApi 与 Route Handler 共用，后续可在此处接入真实模型调用。
 */
export function computeEvaluateResponse(payload: EvaluatePayload, usedToday: number): EvaluateResponse {
  const textMix = `${payload.question} ${payload.answer}`;
  const base = textMix.length % 3;

  const evaluations: ModelEvaluation[] = [
    {
      model: "chatgpt",
      score: clampScore(base === 0 ? 8.6 : base === 1 ? 8.2 : 7.8),
      reason: "逻辑结构比较完整，方向大致稳妥，但仍需要核对关键事实的来源。",
    },
    {
      model: "gemini",
      score: clampScore(base === 0 ? 7.9 : base === 1 ? 7.5 : 8.0),
      reason: "主要论点具备一定合理性，不过个别表述略偏绝对，可信但不宜无条件采纳。",
    },
    {
      model: "doubao",
      score: clampScore(base === 0 ? 6.8 : base === 1 ? 7.1 : 6.5),
      reason: "核心方向基本成立，但证据感略弱，属于可以参考但还不够扎实的结论。",
    },
  ];

  const composite = buildComposite(evaluations);
  const nextUsed = usedToday + 1;

  return {
    success: true,
    requestId: `req_${Date.now()}`,
    quota: {
      usedToday: nextUsed,
      limitPerDay: FREE_LIMIT_PER_DAY,
      remainingToday: Math.max(FREE_LIMIT_PER_DAY - nextUsed, 0),
      requiresUpgrade: nextUsed >= FREE_LIMIT_PER_DAY,
    },
    evaluations,
    composite,
  };
}
