import type { ModelKey } from "@/lib/types";

export const APP_NAME = "回答站得住吗？";
export const APP_EN_NAME = "AnswerTrust";
export const FREE_LIMIT_PER_DAY = 5;

/**
 * true：评估走浏览器内 mock（不调 OpenAI/Gemini/豆包）。
 * false：走 /api/evaluate，需在环境变量中配置 OPENAI_API_KEY、GEMINI_API_KEY、DOUBAO_API_KEY、DOUBAO_MODEL。
 */
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
