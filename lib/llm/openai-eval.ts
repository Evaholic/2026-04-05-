import OpenAI from "openai";
import type { EvaluatePayload } from "@/lib/types";
import { buildEvaluationUserMessage, EVALUATION_SYSTEM_PROMPT } from "@/lib/llm/evaluation-prompt";
import { parseEvaluationJson } from "@/lib/llm/parse-evaluation-json";

export async function evaluateWithOpenAI(payload: EvaluatePayload): Promise<{ score: number; reason: string; raw: string }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.25,
    max_tokens: 800,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: EVALUATION_SYSTEM_PROMPT },
      { role: "user", content: buildEvaluationUserMessage(payload) },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  const parsed = parseEvaluationJson(raw);
  return { ...parsed, raw };
}
