import type { RedFlagResult } from "@/lib/types";

interface RedFlagAlertProps {
  redFlag: RedFlagResult;
}

export function RedFlagAlert({ redFlag }: RedFlagAlertProps) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border-2 border-red-300 bg-red-50 shadow-lg">
      {/* Header */}
      <div className="bg-red-600 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚨</span>
          <div>
            <h3 className="text-xl font-bold text-white">紧急医疗警告</h3>
            <p className="text-base font-medium text-red-100">Emergency Medical Alert</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-4 p-5">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-base font-bold text-red-800">检测到的危险信号：</p>
          <ul className="mt-2 space-y-1.5">
            {redFlag.specificSigns.map((sign, i) => (
              <li key={i} className="flex items-start gap-2 text-base font-medium text-red-700">
                <span className="mt-0.5 shrink-0 text-red-500">▸</span>
                {sign}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-red-100 p-4">
          <p className="text-base font-bold text-red-900">分析说明：</p>
          <p className="mt-1 text-base font-medium text-red-800">{redFlag.explanation}</p>
        </div>

        <div className="rounded-lg bg-red-600 p-4 text-center">
          <p className="text-lg font-bold text-white">
            请立即拨打 120 或前往最近的医院急诊科
          </p>
          <p className="mt-1 text-base font-medium text-red-100">
            请勿自行驾车，生命优先于一切
          </p>
        </div>

        <p className="text-center text-sm font-medium text-gray-500">
          本提示由 AI 生成。如有任何疑虑，请务必以急诊医生判断为准。
        </p>
      </div>
    </div>
  );
}
