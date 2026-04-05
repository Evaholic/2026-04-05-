/** 服务端三模型评估所需环境变量（均不含 NEXT_PUBLIC，不会暴露给浏览器） */
export function getMissingLlmEnvKeys(): string[] {
  const missing: string[] = [];
  if (!process.env.OPENAI_API_KEY?.trim()) missing.push("OPENAI_API_KEY");
  if (!process.env.GEMINI_API_KEY?.trim()) missing.push("GEMINI_API_KEY");
  if (!process.env.DOUBAO_API_KEY?.trim()) missing.push("DOUBAO_API_KEY");
  if (!process.env.DOUBAO_MODEL?.trim()) missing.push("DOUBAO_MODEL");
  return missing;
}
