import { callDeepSeek } from "../deepseek";
import { safeParseJSON } from "../validation";
import { P0_SYSTEM_PROMPT } from "./prompts";

interface DemographicsResult {
  age: number | null;
  gender: "male" | "female" | null;
}

export async function p0ExtractDemographics(userMessage: string): Promise<DemographicsResult> {
  const raw = await callDeepSeek({
    systemPrompt: P0_SYSTEM_PROMPT,
    userMessage: `患者信息：\n"""\n${userMessage}\n"""\n\n请提取年龄和性别。只输出有效 JSON。`,
    temperature: 0.1,
    maxTokens: 200,
    useJsonFormat: true,
  });

  const parsed = safeParseJSON<DemographicsResult>(raw, { age: null, gender: null });

  // Validate and sanitize
  const age = typeof parsed.age === "number" && parsed.age > 0 && parsed.age < 150 ? parsed.age : null;
  const gender = parsed.gender === "male" || parsed.gender === "female" ? parsed.gender : null;

  return { age, gender };
}
