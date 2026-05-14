import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedGuide — AI 医疗分诊助手",
  description: "基于 AI 的初步分诊与就医导航工具，帮助您了解可能疾病、评估严重程度并推荐合适科室。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="flex h-screen flex-col bg-gradient-to-b from-blue-50/40 to-gray-50 antialiased">
        {/* Header */}
        <header className="shrink-0 border-b border-blue-100 bg-white/80 backdrop-blur-sm px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
                <span className="text-lg">🏥</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">MedGuide</h1>
                <p className="text-sm font-medium text-gray-500">AI 医疗分诊助手</p>
              </div>
            </div>
            <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
              不提供医学诊断
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
        </main>

        {/* Footer */}
        <footer className="shrink-0 border-t border-gray-100 bg-white/60 px-4 py-2">
          <p className="text-center text-sm font-medium text-gray-400">
            MedGuide Demo · 仅供演示与学习参考 · 不构成任何医疗建议
          </p>
        </footer>
      </body>
    </html>
  );
}
