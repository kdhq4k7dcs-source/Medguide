import { NextRequest, NextResponse } from "next/server";
import { TriageRequest, TriageResponse, SymptomData } from "@/lib/types";
import { p0ExtractDemographics } from "@/lib/pipelines/p0-demographics";
import { p1ExtractSymptoms } from "@/lib/pipelines/p1-symptom-extractor";
import { p2DetectRedFlags } from "@/lib/pipelines/p2-red-flag-detector";
import { p4MedicalReasoning } from "@/lib/pipelines/p4-medical-reasoning";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_FOLLOWUPS = 3;

function buildNaturalLanguageReply(
  triageResult: TriageResponse["triageResult"],
  redFlag: TriageResponse["redFlag"],
  mode: "initial" | "follow-up"
): string {
  if (redFlag?.hasRedFlag) {
    const categories = redFlag.categories.join("、");
    return `检测到紧急危险信号（${categories}）。${redFlag.explanation}\n\n请立即停止一切活动，拨打 120 或前往最近的医院急诊科。请勿自行驾车，生命安全第一。`;
  }

  if (!triageResult) return "";

  const likelihoodLabel: Record<string, string> = {
    high: "可能性较高",
    moderate: "可能性中等",
    low: "可能性较低",
  };

  const diseases = triageResult.possibleDiseases
    .map((d) => `${likelihoodLabel[d.likelihood] || d.likelihood}：${d.name}`)
    .join("；");

  const dept = triageResult.recommendedDepartments
    .map((d) => d.name)
    .join("、");

  const severityLabel =
    triageResult.severityLevel === "severe"
      ? "重度"
      : triageResult.severityLevel === "moderate"
        ? "中度"
        : "轻度";

  if (mode === "initial") {
    return `根据您的描述，以下是初步分诊分析：\n\n可能疾病：${diseases}\n\n严重程度：${severityLabel} — ${triageResult.severityRationale}\n\n推荐科室：${dept}\n\n${triageResult.generalAdvice}`;
  }

  return `感谢您补充的信息。根据更新后的评估：${diseases}\n\n严重程度：${severityLabel} — ${triageResult.severityRationale}\n\n推荐科室：${dept}\n\n${triageResult.generalAdvice}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: TriageRequest = await request.json();
    const { message, mode, followUpCount, existingSymptoms } = body;

    // Input validation
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.` },
        { status: 400 }
      );
    }

    const trimmedMessage = message.trim();

    // ---------- DEMOGRAPHICS COLLECTION ----------
    if (mode === "demographics") {
      const { age, gender } = await p0ExtractDemographics(trimmedMessage);

      // Build a basic SymptomData with demographics filled
      const demographicSymptoms: SymptomData = {
        bodyLocation: { region: null, laterality: null, specific: null },
        symptomNature: null,
        onset: { timing: null, duration: null, pattern: null },
        intensity: null,
        accompanyingSymptoms: [],
        negativeFindings: [],
        demographics: { age, gender, underlyingConditions: null },
      };

      const ageStr = age ? `${age}岁` : "未知年龄";
      const genderStr = gender === "male" ? "男性" : gender === "female" ? "女性" : "未知性别";

      const response: TriageResponse = {
        mode: "demographics",
        content: `已记录您的基本信息：${ageStr}，${genderStr}。\n\n接下来请详细描述您的不适症状，例如：\n- 哪里不舒服？\n- 从什么时候开始的？\n- 疼痛/不适的程度如何？\n- 有没有其他伴随症状？\n\n请尽可能详细地告诉我，以便我为您分析。`,
        redFlag: null,
        triageResult: null,
        structuredSymptoms: demographicSymptoms,
        followUpCount: 0,
        conversationEnded: false,
      };
      return NextResponse.json(response);
    }

    // ---------- INITIAL TRIAGE ----------
    if (mode === "initial") {
      // Run P1 + P2 concurrently (they are independent)
      const [symptomData, redFlagResult] = await Promise.all([
        p1ExtractSymptoms(trimmedMessage),
        p2DetectRedFlags(trimmedMessage),
      ]);

      // Merge demographics from the first step if available
      if (existingSymptoms?.demographics) {
        symptomData.demographics = existingSymptoms.demographics;
      }

      // Red flag short-circuit: skip P4, return emergency response immediately
      if (redFlagResult.hasRedFlag) {
        const response: TriageResponse = {
          mode: "initial",
          content: buildNaturalLanguageReply(null, redFlagResult, "initial"),
          redFlag: redFlagResult,
          triageResult: null,
          structuredSymptoms: symptomData,
          followUpCount: 0,
          conversationEnded: true, // end conversation on red flag
        };
        return NextResponse.json(response);
      }

      // No red flag — run P4 medical reasoning
      let triageResult;
      try {
        triageResult = await p4MedicalReasoning(symptomData, trimmedMessage, "initial");
      } catch (p4Error) {
        console.error("P4 failed:", p4Error);
        // Fallback: return P1 + P2 results with a generic message
        const response: TriageResponse = {
          mode: "initial",
          content:
            "已成功提取您的症状信息，但在详细分析过程中遇到了技术问题。建议您咨询专业医生进行全面评估。如有紧急情况，请立即前往最近的急诊科就诊。",
          redFlag: null,
          triageResult: null,
          structuredSymptoms: symptomData,
          followUpCount: 0,
          conversationEnded: false,
        };
        return NextResponse.json(response);
      }

      const response: TriageResponse = {
        mode: "initial",
        content: buildNaturalLanguageReply(triageResult, null, "initial"),
        redFlag: null,
        triageResult,
        structuredSymptoms: symptomData,
        followUpCount: 0,
        conversationEnded: false,
      };
      return NextResponse.json(response);
    }

    // ---------- FOLLOW-UP TRIAGE ----------
    if (mode === "follow-up") {
      const currentFollowUpCount = followUpCount + 1;

      if (currentFollowUpCount > MAX_FOLLOWUPS) {
        const response: TriageResponse = {
          mode: "follow-up",
          content:
            "追问次数已达上限。请根据已提供的信息指导您的下一步。如需进一步帮助，可以开启新对话。",
          redFlag: null,
          triageResult: null,
          structuredSymptoms: existingSymptoms ?? null,
          followUpCount: currentFollowUpCount,
          conversationEnded: true,
        };
        return NextResponse.json(response);
      }

      if (!existingSymptoms) {
        return NextResponse.json(
          { error: "existingSymptoms is required for follow-up mode" },
          { status: 400 }
        );
      }

      // For follow-ups: re-run P2 first (new info might contain red flags),
      // then run P4 with updated info
      const redFlagResult = await p2DetectRedFlags(trimmedMessage);

      if (redFlagResult.hasRedFlag) {
        const response: TriageResponse = {
          mode: "follow-up",
          content: buildNaturalLanguageReply(null, redFlagResult, "follow-up"),
          redFlag: redFlagResult,
          triageResult: null,
          structuredSymptoms: existingSymptoms,
          followUpCount: currentFollowUpCount,
          conversationEnded: true,
        };
        return NextResponse.json(response);
      }

      let triageResult;
      try {
        triageResult = await p4MedicalReasoning(existingSymptoms, trimmedMessage, "follow-up");
      } catch (p4Error) {
        console.error("P4 follow-up failed:", p4Error);
        const response: TriageResponse = {
          mode: "follow-up",
          content:
            "已收到您的补充信息，但在更新分析时遇到了技术问题。请咨询专业医生进行全面评估。",
          redFlag: null,
          triageResult: null,
          structuredSymptoms: existingSymptoms,
          followUpCount: currentFollowUpCount,
          conversationEnded: currentFollowUpCount >= MAX_FOLLOWUPS,
        };
        return NextResponse.json(response);
      }

      const response: TriageResponse = {
        mode: "follow-up",
        content: buildNaturalLanguageReply(triageResult, null, "follow-up"),
        redFlag: null,
        triageResult,
        structuredSymptoms: existingSymptoms,
        followUpCount: currentFollowUpCount,
        conversationEnded: currentFollowUpCount >= MAX_FOLLOWUPS,
      };
      return NextResponse.json(response);
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (error) {
    console.error("Triage API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        content:
          "系统遇到技术问题。请稍后重试，如情况紧急请立即就医。",
      },
      { status: 500 }
    );
  }
}
