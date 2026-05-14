import type { DiseaseCandidate } from "@/lib/types";

const likelihoodColors = {
  high: "text-red-700 bg-red-50 border-red-200",
  moderate: "text-yellow-700 bg-yellow-50 border-yellow-200",
  low: "text-gray-600 bg-gray-50 border-gray-200",
};

const likelihoodLabels = {
  high: "可能性较高",
  moderate: "可能性中等",
  low: "可能性较低",
};

interface DiseaseListProps {
  diseases: DiseaseCandidate[];
}

export function DiseaseList({ diseases }: DiseaseListProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-base font-bold text-gray-700">可能疾病分析</h4>
      {diseases.map((disease, index) => (
        <div
          key={index}
          className={`rounded-lg border p-4 ${likelihoodColors[disease.likelihood]}`}
        >
          <div className="flex items-start justify-between">
            <span className="text-base font-bold">{disease.name}</span>
            <span className="ml-2 shrink-0 rounded-full px-2.5 py-0.5 text-sm font-semibold border-current">
              {likelihoodLabels[disease.likelihood]}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium leading-relaxed">{disease.rationale}</p>
          {disease.keyFindings.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {disease.keyFindings.map((finding, i) => (
                <span
                  key={i}
                  className="rounded bg-white/60 px-2 py-0.5 text-sm font-medium"
                >
                  {finding}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
