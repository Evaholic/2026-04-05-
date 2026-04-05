import { FREE_LIMIT_PER_DAY, USE_MOCK_API } from "@/lib/constants";
import { computeEvaluateResponse } from "@/lib/evaluate-core";
import { sleep } from "@/lib/trust";
import type { EvaluatePayload, EvaluateResponse, QuotaResponse, UserSession } from "@/lib/types";

/**
 * Mock API（开发阶段占位）。真实持久化请替换为数据库 / 外部服务，Route Handlers 内同样可换实现。
 */
export const fakeApi = {
  async getSession(): Promise<UserSession> {
    await sleep(250);
    return {
      isLoggedIn: false,
      name: null,
      email: null,
      avatarUrl: null,
    };
  },

  async getQuota(): Promise<QuotaResponse> {
    await sleep(220);
    return {
      usedToday: 0,
      limitPerDay: FREE_LIMIT_PER_DAY,
    };
  },

  async evaluate(payload: EvaluatePayload, usedToday: number): Promise<EvaluateResponse> {
    await sleep(1300);
    return computeEvaluateResponse(payload, usedToday);
  },
};

/** 登录态始终走服务端 Session，与 USE_MOCK_API（仅影响评估 mock）无关 */
export async function apiGetSession(): Promise<UserSession> {
  const res = await fetch("/api/auth/session", { cache: "no-store" });
  if (!res.ok) throw new Error("获取登录状态失败");
  return res.json();
}

export async function apiGetQuota(): Promise<QuotaResponse> {
  if (USE_MOCK_API) return fakeApi.getQuota();
  const res = await fetch("/api/quota/today", { cache: "no-store" });
  if (!res.ok) throw new Error("获取今日额度失败");
  return res.json();
}

export async function apiEvaluate(payload: EvaluatePayload, usedToday: number): Promise<EvaluateResponse> {
  if (USE_MOCK_API) return fakeApi.evaluate(payload, usedToday);
  const res = await fetch("/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    try {
      const errBody = JSON.parse(text) as { error?: string; message?: string; missing?: string[] };
      if (errBody.error === "llm_not_configured" && errBody.missing?.length) {
        throw new Error(
          `三模型未配置：请在 .env.local（或 Vercel 环境变量）填写 ${errBody.missing.join("、")}，并将 lib/constants.ts 中 USE_MOCK_API 设为 false 后重启。`
        );
      }
      if (errBody.message) throw new Error(errBody.message);
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new Error("评估请求失败");
      }
      throw e;
    }
    throw new Error("评估请求失败");
  }
  return res.json();
}
