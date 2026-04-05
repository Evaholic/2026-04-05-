import { GoogleGenerativeAI } from "@google/generative-ai";
import type { EvaluatePayload } from "@/lib/types";
import { buildEvaluationUserMessage, EVALUATION_SYSTEM_PROMPT } from "@/lib/llm/evaluation-prompt";
import { parseEvaluationJson } from "@/lib/llm/parse-evaluation-json";

export async function evaluateWithGemini(payload: EvaluatePayload): Promise<{ score: number; reason: string; raw: string }> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.25,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    },
    systemInstruction: EVALUATION_SYSTEM_PROMPT,
  });

  const result = await model.generateContent(buildEvaluationUserMessage(payload));
  const raw = result.response.text();
  const parsed = parseEvaluationJson(raw);
  return { ...parsed, raw };
}
