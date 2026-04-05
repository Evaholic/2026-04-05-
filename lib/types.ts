export type ModelKey = "chatgpt" | "gemini" | "doubao";

export type TrustLabel = "非常不可信" | "比较可以" | "比较可信" | "十分可信";

export type ModelEvaluation = {
  model: ModelKey;
  score: number;
  reason: string;
  rawVerdict?: string;
};

export type CompositeEvaluation = {
  averageScore: number;
  label: TrustLabel;
  summary: string;
  disagreementLevel: "low" | "medium" | "high";
};

export type EvaluateResponse = {
  success: boolean;
  requestId: string;
  quota: {
    usedToday: number;
    limitPerDay: number;
    remainingToday: number;
    requiresUpgrade: boolean;
  };
  evaluations: ModelEvaluation[];
  composite: CompositeEvaluation;
};

export type QuotaResponse = {
  usedToday: number;
  limitPerDay: number;
};

export type UserSession = {
  isLoggedIn: boolean;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
};

export type EvaluatePayload = {
  question: string;
  answer: string;
};
