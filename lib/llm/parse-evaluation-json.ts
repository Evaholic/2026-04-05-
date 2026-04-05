import { clampScore } from "@/lib/trust";

export function parseEvaluationJson(raw: string): { score: number; reason: string } {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("no_json_object");
  }
  text = text.slice(start, end + 1);

  const parsed = JSON.parse(text) as { score?: unknown; reason?: unknown };
  const scoreNum = typeof parsed.score === "number" ? parsed.score : Number(parsed.score);
  if (!Number.isFinite(scoreNum)) {
    throw new Error("invalid_score");
  }
  const reasonStr = typeof parsed.reason === "string" ? parsed.reason.trim() : "";
  if (!reasonStr) {
    throw new Error("invalid_reason");
  }

  return {
    score: clampScore(scoreNum),
    reason: reasonStr.slice(0, 500),
  };
}
