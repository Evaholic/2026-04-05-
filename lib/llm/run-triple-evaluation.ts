import type { EvaluatePayload, ModelEvaluation } from "@/lib/types";
import { evaluateWithDoubao } from "@/lib/llm/doubao-eval";
import { evaluateWithGemini } from "@/lib/llm/gemini-eval";
import { evaluateWithOpenAI } from "@/lib/llm/openai-eval";

function failCard(model: ModelEvaluation["model"], message: string): ModelEvaluation {
  return {
    model,
    score: 5,
    reason: `该模型调用失败：${message}。请检查对应 API 密钥、模型名/推理接入点及网络。`,
  };
}

export async function runTripleModelEvaluation(payload: EvaluatePayload): Promise<ModelEvaluation[]> {
  const settled = await Promise.allSettled([
    evaluateWithOpenAI(payload),
    evaluateWithGemini(payload),
    evaluateWithDoubao(payload),
  ]);

  const keys: ModelEvaluation["model"][] = ["chatgpt", "gemini", "doubao"];

  return settled.map((result, i) => {
    const model = keys[i];
    if (result.status === "fulfilled") {
      const v = result.value;
      return {
        model,
        score: v.score,
        reason: v.reason,
        rawVerdict: v.raw.slice(0, 4000),
      };
    }
    const err = result.reason;
    const msg = err instanceof Error ? err.message : String(err);
    return failCard(model, msg);
  });
}
