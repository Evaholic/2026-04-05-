import OpenAI from "openai";
import type { EvaluatePayload } from "@/lib/types";
import { buildEvaluationUserMessage, EVALUATION_SYSTEM_PROMPT } from "@/lib/llm/evaluation-prompt";
import { parseEvaluationJson } from "@/lib/llm/parse-evaluation-json";

/**
 * 豆包通过火山引擎「方舟」OpenAI 兼容接口调用。
 * @see https://www.volcengine.com/docs/82379/1099455
 */
export async function evaluateWithDoubao(payload: EvaluatePayload): Promise<{ score: number; reason: string; raw: string }> {
  const apiKey = process.env.DOUBAO_API_KEY?.trim();
  const model = process.env.DOUBAO_MODEL?.trim();
  if (!apiKey) throw new Error("DOUBAO_API_KEY missing");
  if (!model) throw new Error("DOUBAO_MODEL missing");

  const baseURL = process.env.DOUBAO_BASE_URL?.trim() || "https://ark.cn-beijing.volces.com/api/v3";

  const client = new OpenAI({
    apiKey,
    baseURL,
  });

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.25,
    max_tokens: 800,
    messages: [
      { role: "system", content: EVALUATION_SYSTEM_PROMPT },
      { role: "user", content: buildEvaluationUserMessage(payload) },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  const parsed = parseEvaluationJson(raw);
  return { ...parsed, raw };
}
