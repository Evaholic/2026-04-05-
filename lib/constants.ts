import type { ModelKey } from "@/lib/types";

export const APP_NAME = "回答站得住吗？";
export const APP_EN_NAME = "AnswerTrust";
export const FREE_LIMIT_PER_DAY = 5;

/** 设为 false 时，前端 `api*` 会请求本仓库的 Route Handlers。 */
export const USE_MOCK_API = true;

export const modelMeta: Record<
  ModelKey,
  {
    title: string;
    subtitle: string;
  }
> = {
  chatgpt: {
    title: "ChatGPT",
    subtitle: "OpenAI 模型评估",
  },
  gemini: {
    title: "Gemini",
    subtitle: "Google 模型评估",
  },
  doubao: {
    title: "豆包",
    subtitle: "字节模型评估",
  },
};
