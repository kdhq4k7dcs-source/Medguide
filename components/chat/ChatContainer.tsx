"use client";

import type { Message } from "@/lib/types";
import type { DemographicsInfo } from "../DemographicsModal";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { TurnLimitBanner } from "./TurnLimitBanner";

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  followUpCount: number;
  conversationEnded: boolean;
  demographics: DemographicsInfo | null;
  onSend: (message: string) => void;
  onNewConversation: () => void;
}

export function ChatContainer({
  messages,
  isLoading,
  followUpCount,
  conversationEnded,
  demographics,
  onSend,
  onNewConversation,
}: ChatContainerProps) {
  const inputDisabled = isLoading || conversationEnded;

  const placeholder = conversationEnded
    ? "对话已结束，请点击「开启新对话」"
    : followUpCount > 0
      ? `补充更多症状信息...（剩余 ${3 - followUpCount} 次追问）`
      : "请详细描述您的症状，例如：头痛3天了，太阳穴一跳一跳地疼...";

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            demographics={demographics}
          />
        </div>
      </div>

      {/* Turn limit + New conversation */}
      <div className="shrink-0 border-t border-gray-100 bg-gray-50/50">
        <TurnLimitBanner current={followUpCount} max={3} />
        {conversationEnded && messages.length > 0 && (
          <div className="px-4 pb-3 text-center">
            <button
              onClick={onNewConversation}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
            >
              <span className="text-base">+</span>
              开启新对话
            </button>
          </div>
        )}

        {/* Input */}
        <ChatInput
          onSend={onSend}
          disabled={inputDisabled}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
