"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Message, TriageResponse, SymptomData } from "@/lib/types";
import { ChatContainer } from "@/components/chat/ChatContainer";
import {
  DemographicsModal,
  type DemographicsInfo,
} from "@/components/DemographicsModal";

function buildInitialSymptomData(demo: DemographicsInfo): SymptomData {
  return {
    bodyLocation: { region: null, laterality: null, specific: null },
    symptomNature: null,
    onset: { timing: null, duration: null, pattern: null },
    intensity: null,
    accompanyingSymptoms: [],
    negativeFindings: [],
    demographics: {
      age: demo.age,
      gender: demo.gender,
      underlyingConditions: demo.underlyingConditions || "无",
    },
  };
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followUpCount, setFollowUpCount] = useState(0);
  const [conversationEnded, setConversationEnded] = useState(false);
  const [structuredSymptoms, setStructuredSymptoms] = useState<SymptomData | null>(null);
  const [demographicsReady, setDemographicsReady] = useState(false);
  const [demographics, setDemographics] = useState<DemographicsInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const addMessage = useCallback(
    (msg: Omit<Message, "id" | "timestamp">) => {
      const newMsg: Message = {
        ...msg,
        id: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        }),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, newMsg]);
      return newMsg;
    },
    []
  );

  const handleSend = useCallback(
    async (message: string) => {
      if (isLoading || conversationEnded) return;

      addMessage({ role: "user", content: message });

      setIsLoading(true);
      const mode = followUpCount === 0 ? "initial" : "follow-up";

      // Build the full symptom payload — merge demographics with any existing symptoms
      const base = demographics ? buildInitialSymptomData(demographics) : structuredSymptoms;

      try {
        const response = await fetch("/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            history: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            mode,
            followUpCount,
            existingSymptoms: base,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          addMessage({
            role: "assistant",
            content:
              err.content ||
              "抱歉，我遇到了一些技术问题。请稍后重试。如情况紧急，请立即前往医院就诊。",
          });
          return;
        }

        const data: TriageResponse = await response.json();

        if (data.structuredSymptoms) {
          // Preserve demographics when storing extracted symptoms
          if (base?.demographics) {
            data.structuredSymptoms.demographics = base.demographics;
          }
          setStructuredSymptoms(data.structuredSymptoms);
        }

        setFollowUpCount(data.followUpCount);

        if (data.conversationEnded) {
          setConversationEnded(true);
        }

        addMessage({
          role: "assistant",
          content: data.content,
          triageResult: data.triageResult ?? undefined,
          redFlag: data.redFlag ?? undefined,
        });
      } catch {
        addMessage({
          role: "assistant",
          content:
            "抱歉，我遇到了一些技术问题。请稍后重试。如情况紧急，请立即前往医院就诊（拨打120）。",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      isLoading,
      conversationEnded,
      followUpCount,
      structuredSymptoms,
      demographics,
      messages,
      addMessage,
    ]
  );

  const handleDemographicsSubmit = useCallback((info: DemographicsInfo) => {
    setDemographics(info);
    setDemographicsReady(true);
    setMessages([]);
    setFollowUpCount(0);
    setConversationEnded(false);
    setStructuredSymptoms(buildInitialSymptomData(info));
  }, []);

  const handleNewConversation = useCallback(() => {
    setMessages([]);
    setIsLoading(false);
    setFollowUpCount(0);
    setConversationEnded(false);
    setStructuredSymptoms(null);
    setDemographics(null);
    setDemographicsReady(false);
  }, []);

  return (
    <>
      {!demographicsReady && (
        <DemographicsModal onSubmit={handleDemographicsSubmit} />
      )}
      <ChatContainer
        messages={messages}
        isLoading={isLoading}
        followUpCount={followUpCount}
        conversationEnded={conversationEnded}
        demographics={demographics}
        onSend={handleSend}
        onNewConversation={handleNewConversation}
      />
    </>
  );
}
