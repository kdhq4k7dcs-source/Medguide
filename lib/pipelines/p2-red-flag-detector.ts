import { callDeepSeek } from "../deepseek";
import { RedFlagResult } from "../types";
import { safeParseJSON, RedFlagResultSchema, DEFAULT_RED_FLAG_RESULT } from "../validation";
import { P2_SYSTEM_PROMPT } from "./prompts";

export async function p2DetectRedFlags(userMessage: string): Promise<RedFlagResult> {
  const raw = await callDeepSeek({
    systemPrompt: P2_SYSTEM_PROMPT,
    userMessage: `Patient symptom description:\n"""\n${userMessage}\n"""\n\nCheck for red flag emergency signs. Output ONLY valid JSON.`,
    temperature: 0.3,
    maxTokens: 1000,
    useJsonFormat: true,
  });

  const parsed = safeParseJSON<RedFlagResult>(raw, DEFAULT_RED_FLAG_RESULT as RedFlagResult);
  const result = RedFlagResultSchema.safeParse(parsed);

  if (result.success) {
    return result.data;
  }

  console.error("P2 schema validation failed:", result.error.issues);
  return parsed;
}
