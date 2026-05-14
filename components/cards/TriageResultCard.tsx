import type { TriageResult } from "@/lib/types";
import { SeverityBadge } from "./SeverityBadge";
import { DiseaseList } from "./DiseaseList";
import { DepartmentRecommendation } from "./DepartmentRecommendation";
import { MedicalDisclaimer } from "./MedicalDisclaimer";

interface TriageResultCardProps {
  result: TriageResult;
}

export function TriageResultCard({ result }: TriageResultCardProps) {
  return (
    <div className="mt-3 space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Severity */}
      <SeverityBadge
        level={result.severityLevel}
        rationale={result.severityRationale}
      />

      {/* Department — moved up, right after severity */}
      <DepartmentRecommendation departments={result.recommendedDepartments} />

      {/* Diseases */}
      <DiseaseList diseases={result.possibleDiseases} />

      {/* General Advice */}
      <div>
        <h4 className="text-base font-bold text-gray-700">就医建议</h4>
        <p className="mt-1.5 text-sm font-medium leading-relaxed text-gray-600">
          {result.generalAdvice}
        </p>
      </div>

      {/* Follow-up questions */}
      {result.followUpQuestions.length > 0 && (
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-500">您可以继续补充以下信息：</p>
          <ul className="mt-2 space-y-1.5">
            {result.followUpQuestions.map((q, i) => (
              <li key={i} className="text-sm font-medium text-gray-600">
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      <MedicalDisclaimer />
    </div>
  );
}
