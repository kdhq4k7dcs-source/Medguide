// ========== P1: Symptom Extractor Output ==========
export interface SymptomData {
  bodyLocation: {
    region: string | null;
    laterality: "left" | "right" | "bilateral" | null;
    specific: string | null;
  };
  symptomNature: string | null;
  onset: {
    timing: "sudden" | "gradual" | "chronic" | "unknown" | null;
    duration: string | null;
    pattern: "constant" | "intermittent" | "worsening" | "improving" | null;
  };
  intensity: number | null;
  accompanyingSymptoms: string[];
  negativeFindings: string[];
  demographics: {
    age: number | null;
    gender: "male" | "female" | null;
    underlyingConditions: string | null;
  };
}

// ========== P2: Red Flag Detector Output ==========
export interface RedFlagResult {
  hasRedFlag: boolean;
  categories: string[];
  specificSigns: string[];
  urgencyLevel: "immediate" | "emergency_room" | "urgent_care" | "none";
  explanation: string;
}

// ========== P4: Medical Reasoning Output ==========
export interface DiseaseCandidate {
  name: string;
  likelihood: "high" | "moderate" | "low";
  rationale: string;
  keyFindings: string[];
}

export interface DepartmentRecommendation {
  name: string;
  reason: string;
}

export interface TriageResult {
  possibleDiseases: DiseaseCandidate[];
  severityLevel: "mild" | "moderate" | "severe";
  severityRationale: string;
  recommendedDepartments: DepartmentRecommendation[];
  generalAdvice: string;
  followUpQuestions: string[];
}

// ========== Chat Message ==========
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  triageResult?: TriageResult;
  redFlag?: RedFlagResult;
}

// ========== API Request / Response ==========
export interface TriageRequest {
  message: string;
  history: { role: "user" | "assistant"; content: string }[];
  mode: "demographics" | "initial" | "follow-up";
  followUpCount: number;
  existingSymptoms?: SymptomData | null;
}

export interface TriageResponse {
  mode: "demographics" | "initial" | "follow-up";
  content: string;
  redFlag: RedFlagResult | null;
  triageResult: TriageResult | null;
  structuredSymptoms: SymptomData | null;
  followUpCount: number;
  conversationEnded: boolean;
}
