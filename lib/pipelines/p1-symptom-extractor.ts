import { callDeepSeek } from "../deepseek";
import { SymptomData } from "../types";
import { safeParseJSON, SymptomDataSchema, DEFAULT_SYMPTOM_DATA } from "../validation";
import { P1_SYSTEM_PROMPT } from "./prompts";

export async function p1ExtractSymptoms(userMessage: string): Promise<SymptomData> {
  const raw = await callDeepSeek({
    systemPrompt: P1_SYSTEM_PROMPT,
    userMessage: `Patient symptom description:\n"""\n${userMessage}\n"""\n\nExtract the structured symptom information as specified. Output ONLY valid JSON.`,
    temperature: 0.3,
    maxTokens: 1000,
    useJsonFormat: true,
  });

  const parsed = safeParseJSON<SymptomData>(raw, DEFAULT_SYMPTOM_DATA as SymptomData);
  const result = SymptomDataSchema.safeParse(parsed);

  if (result.success) {
    return result.data;
  }

  console.error("P1 schema validation failed:", result.error.issues);
  return parsed;
}
