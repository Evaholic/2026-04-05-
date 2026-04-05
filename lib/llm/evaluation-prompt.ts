import type { EvaluatePayload } from "@/lib/types";

export const EVALUATION_SYSTEM_PROMPT = `你是严谨的可信度评估助手。根据用户给出的「问题」和「回答」，从事实风险、逻辑是否自洽、表述是否过度绝对等方面，评估该回答作为对问题的回应是否可靠。
你必须只输出一个 JSON 对象，不要 markdown 代码块，不要其它文字。
JSON 格式严格为：{"score": 数字, "reason": "字符串"}
其中 score 为 1 到 10 的一位小数（如 7.5）；reason 为 50～200 字以内的简体中文，说明评分依据。`;

export function buildEvaluationUserMessage(payload: EvaluatePayload): string {
  return `问题：
${payload.question.trim()}

回答：
${payload.answer.trim()}`;
}
