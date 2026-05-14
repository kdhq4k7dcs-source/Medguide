import type { Message } from "@/lib/types";
import type { DemographicsInfo } from "../DemographicsModal";
import { TriageResultCard } from "../cards/TriageResultCard";
import { RedFlagAlert } from "../cards/RedFlagAlert";
import { MedicalDisclaimer } from "../cards/MedicalDisclaimer";
import { LoadingDots } from "../ui/LoadingDots";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  demographics: DemographicsInfo | null;
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex items-start justify-end gap-2">
      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm">
        {content}
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm">
        👤
      </div>
    </div>
  );
}

function AssistantBubble({ content }: { content: string }) {
  if (!content) return null;
  return (
    <div className="flex items-start gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm">
        🏥
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-base font-medium text-gray-700 shadow-sm border border-gray-100">
        {content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-1.5" : ""}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

export function MessageList({ messages, isLoading, demographics }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-sm">
            <span className="text-4xl">🏥</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">MedGuide 医路指引</h3>
          <p className="mt-2 text-base font-medium leading-relaxed text-gray-500">
            AI 驱动的初步分诊与就医导航助手
          </p>

          {/* Show collected demographics summary */}
          {demographics && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-2">
              <span className="text-sm font-medium text-green-700">
                {demographics.gender === "male" ? "男" : "女"} · {demographics.age}岁
                {demographics.underlyingConditions && demographics.underlyingConditions !== "无" && (
                  <> · {demographics.underlyingConditions}</>
                )}
              </span>
            </div>
          )}

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
              <div className="text-2xl">🔍</div>
              <p className="mt-2 text-sm font-medium text-gray-700">分析可能的<br />疾病方向</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
              <div className="text-2xl">📊</div>
              <p className="mt-2 text-sm font-medium text-gray-700">评估严重<br />程度</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
              <div className="text-2xl">🏥</div>
              <p className="mt-2 text-sm font-medium text-gray-700">推荐合适的<br />就诊科室</p>
            </div>
          </div>
          <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-sm font-medium text-amber-700">
              本产品不提供医学诊断，仅供就医参考
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === "user" && <UserBubble content={message.content} />}

          {message.role === "assistant" && (
            <div className="space-y-3">
              {message.redFlag && <RedFlagAlert redFlag={message.redFlag} />}
              {message.content && (
                <AssistantBubble content={message.content} />
              )}
              {message.triageResult && (
                <TriageResultCard result={message.triageResult} />
              )}
              {!message.redFlag && !message.triageResult && (
                <MedicalDisclaimer />
              )}
            </div>
          )}
        </div>
      ))}
      {isLoading && <LoadingDots />}
    </div>
  );
}
