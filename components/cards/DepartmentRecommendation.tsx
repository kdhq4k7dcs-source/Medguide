import type { DepartmentRecommendation as DeptRec } from "@/lib/types";

interface DepartmentRecommendationProps {
  departments: DeptRec[];
}

export function DepartmentRecommendation({ departments }: DepartmentRecommendationProps) {
  return (
    <div>
      <h4 className="text-base font-bold text-gray-700">推荐科室</h4>
      <div className="mt-2 space-y-2">
        {departments.map((dept, index) => (
          <div
            key={index}
            className="rounded-lg border border-blue-200 bg-blue-50 p-4"
          >
            <div className="flex items-center gap-2">
              {index === 0 && (
                <span className="rounded bg-blue-500 px-2 py-0.5 text-sm font-bold text-white">
                  首选
                </span>
              )}
              {index === 1 && (
                <span className="rounded bg-blue-300 px-2 py-0.5 text-sm font-bold text-blue-800">
                  备选
                </span>
              )}
              <span className="text-base font-bold text-blue-900">
                {dept.name}
              </span>
            </div>
            <p className="mt-1.5 text-sm font-medium text-blue-700">{dept.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
