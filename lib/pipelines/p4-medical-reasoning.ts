import { callDeepSeek } from "../deepseek";
import { SymptomData, TriageResult } from "../types";
import { safeParseJSON, TriageResultSchema, DEFAULT_TRIAGE_RESULT } from "../validation";
import { P4_SYSTEM_PROMPT, P4_FOLLOWUP_SYSTEM_PROMPT } from "./prompts";

function formatSymptomContext(symptoms: SymptomData): string {
  return JSON.stringify(symptoms, null, 2);
}

export async function p4MedicalReasoning(
  symptoms: SymptomData,
  userMessage: string,
  mode: "initial" | "follow-up"
): Promise<TriageResult> {
  const systemPrompt = mode === "initial" ? P4_SYSTEM_PROMPT : P4_FOLLOWUP_SYSTEM_PROMPT;

  const symptomContext = formatSymptomContext(symptoms);

  const userPrompt =
    mode === "initial"
      ? `Structured symptom data:\n${symptomContext}\n\nOriginal patient description: "${userMessage}"\n\nProvide your differential diagnosis analysis. Output ONLY valid JSON.`
      : `Structured symptom data from initial assessment:\n${symptomContext}\n\nThe patient has provided this additional information: "${userMessage}"\n\nUpdate the differential diagnosis. Output ONLY valid JSON.`;

  const raw = await callDeepSeek({
    systemPrompt,
    userMessage: userPrompt,
    temperature: 0.5,
    maxTokens: 2000,
    useJsonFormat: true,
  });

  const parsed = safeParseJSON<TriageResult>(raw, DEFAULT_TRIAGE_RESULT as TriageResult);
  const result = TriageResultSchema.safeParse(parsed);

  if (result.success) {
    return result.data;
  }

  console.error("P4 schema validation failed:", result.error.issues);
  // If length is wrong, pad or trim to 3
  if (parsed.possibleDiseases && parsed.possibleDiseases.length !== 3) {
    while (parsed.possibleDiseases.length < 3) {
      parsed.possibleDiseases.push({
        name: "Insufficient data to determine",
        likelihood: "low",
        rationale: "Not enough information for reliable inference.",
        keyFindings: [],
      });
    }
    parsed.possibleDiseases = parsed.possibleDiseases.slice(0, 3);
  }
  return parsed;
}
