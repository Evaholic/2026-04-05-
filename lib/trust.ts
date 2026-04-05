import type { CompositeEvaluation, ModelEvaluation, TrustLabel } from "@/lib/types";

export function clampScore(score: number) {
  return Math.max(1, Math.min(10, Number(score.toFixed(1))));
}

export function scoreToLabel(score: number): TrustLabel {
  if (score < 5) return "非常不可信";
  if (score < 7) return "比较可以";
  if (score < 9) return "比较可信";
  return "十分可信";
}

export function getTrustStyles(label: TrustLabel) {
  switch (label) {
    case "非常不可信":
      return {
        text: "text-red-600",
        badge: "bg-red-50 text-red-700 border-red-200",
        panel: "bg-red-50 border-red-100",
      };
    case "比较可以":
      return {
        text: "text-amber-600",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        panel: "bg-amber-50 border-amber-100",
      };
    case "比较可信":
      return {
        text: "text-lime-700",
        badge: "bg-lime-50 text-lime-700 border-lime-200",
        panel: "bg-lime-50 border-lime-100",
      };
    case "十分可信":
      return {
        text: "text-emerald-700",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        panel: "bg-emerald-50 border-emerald-100",
      };
  }
}

export function buildComposite(evaluations: ModelEvaluation[]): CompositeEvaluation {
  const scores = evaluations.map((item) => item.score);
  const averageScore = clampScore(scores.reduce((sum, cur) => sum + cur, 0) / scores.length);
  const spread = Math.max(...scores) - Math.min(...scores);

  let disagreementLevel: "low" | "medium" | "high" = "low";
  if (spread >= 2.5) disagreementLevel = "high";
  else if (spread >= 1.3) disagreementLevel = "medium";

  let summary = "整体比较可信，逻辑方向基本站得住，但涉及关键事实时仍建议核对来源。";
  if (averageScore < 5) {
    summary = "整体可靠性偏低，不建议直接采纳这条回答。";
  } else if (averageScore < 7) {
    summary = "整体可参考，但还不足以直接当成结论，尤其不适合高风险场景。";
  } else if (averageScore >= 9) {
    summary = "整体可信度很高，多模型判断较一致，可以优先采信。";
  }

  if (disagreementLevel === "medium") {
    summary = "三个模型存在一定分歧，说明这条回答并非完全稳定，建议继续核对关键论据。";
  }
  if (disagreementLevel === "high") {
    summary = "三个模型分歧明显，说明该回答存在争议，建议人工复核或补充权威来源。";
  }

  return {
    averageScore,
    label: scoreToLabel(averageScore),
    summary,
    disagreementLevel,
  };
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
