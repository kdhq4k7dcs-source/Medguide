import { z } from "zod";
import type { SymptomData, RedFlagResult, TriageResult } from "./types";

// ========== Zod Schemas ==========

export const SymptomDataSchema = z.object({
  bodyLocation: z.object({
    region: z.string().nullable(),
    laterality: z.enum(["left", "right", "bilateral"]).nullable(),
    specific: z.string().nullable(),
  }),
  symptomNature: z.string().nullable(),
  onset: z.object({
    timing: z.enum(["sudden", "gradual", "chronic", "unknown"]).nullable(),
    duration: z.string().nullable(),
    pattern: z.enum(["constant", "intermittent", "worsening", "improving"]).nullable(),
  }),
  intensity: z.number().min(1).max(10).nullable(),
  accompanyingSymptoms: z.array(z.string()),
  negativeFindings: z.array(z.string()),
  demographics: z.object({
    age: z.number().nullable(),
    gender: z.enum(["male", "female"]).nullable(),
    underlyingConditions: z.string().nullable(),
  }),
});

export const RedFlagResultSchema = z.object({
  hasRedFlag: z.boolean(),
  categories: z.array(z.string()),
  specificSigns: z.array(z.string()),
  urgencyLevel: z.enum(["immediate", "emergency_room", "urgent_care", "none"]),
  explanation: z.string(),
});

export const TriageResultSchema = z.object({
  possibleDiseases: z.array(
    z.object({
      name: z.string(),
      likelihood: z.enum(["high", "moderate", "low"]),
      rationale: z.string(),
      keyFindings: z.array(z.string()),
    })
  ).length(3),
  severityLevel: z.enum(["mild", "moderate", "severe"]),
  severityRationale: z.string(),
  recommendedDepartments: z.array(
    z.object({
      name: z.string(),
      reason: z.string(),
    })
  ).min(1).max(2),
  generalAdvice: z.string(),
  followUpQuestions: z.array(z.string()),
});

// ========== Safe JSON Parse ==========

export function safeParseJSON<T>(raw: string, fallback: T): T {
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    console.error("Failed to parse LLM output:", raw.slice(0, 300));
    return fallback;
  }
}

export const DEFAULT_SYMPTOM_DATA: SymptomData = {
  bodyLocation: { region: null, laterality: null, specific: null },
  symptomNature: null,
  onset: { timing: null, duration: null, pattern: null },
  intensity: null,
  accompanyingSymptoms: [],
  negativeFindings: [],
  demographics: { age: null, gender: null, underlyingConditions: null },
};

export const DEFAULT_RED_FLAG_RESULT: RedFlagResult = {
  hasRedFlag: false,
  categories: [],
  specificSigns: [],
  urgencyLevel: "none",
  explanation: "Unable to complete red flag detection.",
};

export const DEFAULT_TRIAGE_RESULT: TriageResult = {
  possibleDiseases: [
    {
      name: "Unable to determine",
      likelihood: "low",
      rationale: "Insufficient information for analysis.",
      keyFindings: [],
    },
    {
      name: "Unable to determine",
      likelihood: "low",
      rationale: "Insufficient information for analysis.",
      keyFindings: [],
    },
    {
      name: "Unable to determine",
      likelihood: "low",
      rationale: "Insufficient information for analysis.",
      keyFindings: [],
    },
  ],
  severityLevel: "moderate",
  severityRationale: "Unable to assess severity due to technical issues.",
  recommendedDepartments: [
    {
      name: "General Practice / General Internal Medicine (全科/普通内科)",
      reason: "We recommend starting with a general consultation for your symptoms.",
    },
  ],
  generalAdvice:
    "We encountered a technical issue while analyzing your symptoms. Please consult a healthcare professional in person for proper evaluation. If this is an emergency, call 120 immediately.",
  followUpQuestions: [],
};
