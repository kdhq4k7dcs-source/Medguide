const severityConfig = {
  mild: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
    label: "轻度",
    emoji: "🟢",
    advice: "建议择期就诊或居家观察",
  },
  moderate: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-300",
    label: "中度",
    emoji: "🟡",
    advice: "建议近期到医院就诊",
  },
  severe: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
    label: "重度",
    emoji: "🔴",
    advice: "需尽快就医，请勿拖延",
  },
};

interface SeverityBadgeProps {
  level: "mild" | "moderate" | "severe";
  rationale?: string;
}

export function SeverityBadge({ level, rationale }: SeverityBadgeProps) {
  const config = severityConfig[level];

  return (
    <div className={`rounded-lg border ${config.border} ${config.bg} p-4`}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{config.emoji}</span>
        <div>
          <span className={`text-base font-bold ${config.text}`}>
            严重程度：{config.label}
          </span>
          <span className={`ml-2 text-sm font-medium ${config.text}`}>{config.advice}</span>
        </div>
      </div>
      {rationale && (
        <p className={`mt-2 text-sm font-medium ${config.text}`}>{rationale}</p>
      )}
    </div>
  );
}
