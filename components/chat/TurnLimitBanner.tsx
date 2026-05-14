interface TurnLimitBannerProps {
  current: number;
  max: number;
}

export function TurnLimitBanner({ current, max }: TurnLimitBannerProps) {
  if (current === 0) return null;

  const remaining = max - current;

  return (
    <div className="mx-auto max-w-3xl px-4 py-2">
      <div className="flex items-center justify-center gap-2.5">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: max }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i < current ? "bg-blue-500 shadow-sm" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-gray-500">
          {remaining > 0
            ? `追问剩余 ${remaining} 次`
            : "追问次数已用完"}
        </span>
      </div>
    </div>
  );
}
