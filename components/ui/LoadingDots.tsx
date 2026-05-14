export function LoadingDots() {
  return (
    <div className="flex items-start gap-3 px-1 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
        <span className="text-base">🏥</span>
      </div>
      <div className="rounded-2xl rounded-bl-md border border-gray-100 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" />
          <span className="ml-1 text-base font-medium text-gray-400">正在分析您的症状...</span>
        </div>
      </div>
    </div>
  );
}
