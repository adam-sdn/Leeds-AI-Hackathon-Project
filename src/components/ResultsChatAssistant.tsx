import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { AnalysisResult } from "../utils/riskEngine";
import type { FaceScanResult } from "./FaceScan";
import { generateChatAssistantReply } from "../utils/aiReasoningEngine";
import type { ChatMessage, TailoredInsight } from "../utils/aiReasoningEngine";
import type { ConnectedHealthData } from "../types/health";
import type { AppLanguage } from "../types/language";
import { languageLabels } from "../types/language";
import { translateText } from "../utils/translation";

type Props = {
  result: AnalysisResult;
  scanResult?: FaceScanResult | null;
  healthData?: ConnectedHealthData | null;
  tailoredInsight?: TailoredInsight | null;
  language: AppLanguage;
};

const quickPrompts = [
  "What should I do next?",
  "What should I tell my GP?",
  "How does my health data affect this?",
];

export default function ResultsChatAssistant({ result, scanResult, healthData, tailoredInsight, language }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: "assistant",
      content: "I can help explain this result using your symptoms, connected health data, and facial wellness scan context. I cannot diagnose, but I can help you prepare next steps.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const reasoningInput = useMemo(() => ({
    analysis: result,
    scan: scanResult,
    healthData,
  }), [result, scanResult, healthData]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking, isOpen]);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isThinking) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsThinking(true);

    try {
      const reply = await generateChatAssistantReply(reasoningInput, nextMessages, tailoredInsight, language);
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch (error) {
      console.error("Results chat assistant failed:", error);
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: "I could not generate a tailored reply just now. The key safety point still stands: this is not a medical diagnosis, and if symptoms are severe, sudden, worsening, or worrying, seek medical advice.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <div style={styles.shell} aria-live="polite">
      {isOpen && (
        <section style={styles.panel} aria-label="Kashf AI chat assistant">
          <div style={styles.panelGlow} />
          <header style={styles.header}>
            <div>
              <p style={styles.kicker}>Kashf assistant</p>
              <h3 style={styles.title}>Ask about your result</h3>
              <p style={styles.languageHint}>Replying in {languageLabels[language]} or matching your message.</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} style={styles.closeButton} aria-label="Close assistant">
              x
            </button>
          </header>

          <div style={styles.contextRow}>
            <span style={styles.contextPill}>{result.riskLabel}</span>
            <span style={styles.contextPill}>{healthData?.metrics ? "Health data linked" : "No health data"}</span>
            <span style={styles.contextPill}>{scanResult ? "Face scan linked" : "No face scan"}</span>
          </div>

          <div ref={scrollRef} style={styles.messages}>
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                style={{
                  ...styles.message,
                  ...(message.role === "user" ? styles.userMessage : styles.assistantMessage),
                }}
              >
                {message.content}
              </div>
            ))}
            {isThinking && (
              <div style={{ ...styles.message, ...styles.assistantMessage }}>
                Thinking across your result...
              </div>
            )}
          </div>

          <div style={styles.quickRow}>
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                style={styles.quickButton}
                onClick={() => void sendMessage(prompt)}
                disabled={isThinking}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a follow-up..."
              rows={2}
              style={styles.input}
            />
            <button type="submit" style={styles.sendButton} disabled={!input.trim() || isThinking}>
              Send
            </button>
          </form>

          <p style={styles.disclaimer}>Guidance only. For urgent symptoms, call 999 or go to A&E.</p>
          {language !== "en" && (
            <p style={styles.disclaimer}>{translateText("This is not a medical diagnosis.", language)}</p>
          )}
        </section>
      )}

      <button type="button" style={styles.launcher} onClick={() => setIsOpen((value) => !value)} aria-expanded={isOpen}>
        <span style={styles.launcherMark}>AI</span>
        <span style={styles.launcherText}>Ask Kashf</span>
      </button>
    </div>
  );
}

const styles = {
  shell: {
    position: "fixed" as const,
    right: "24px",
    bottom: "24px",
    zIndex: 1200,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-end",
    gap: "14px",
    pointerEvents: "none" as const,
  },
  panel: {
    position: "relative" as const,
    width: "min(380px, calc(100vw - 32px))",
    maxHeight: "min(680px, calc(100vh - 112px))",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    borderRadius: "22px",
    border: "1px solid rgba(147, 197, 253, 0.42)",
    background: "linear-gradient(145deg, rgba(8, 47, 73, 0.96), rgba(15, 23, 42, 0.96))",
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.38), inset 0 1px 0 rgba(255,255,255,0.12)",
    backdropFilter: "blur(18px)",
    pointerEvents: "auto" as const,
  },
  panelGlow: {
    position: "absolute" as const,
    inset: 0,
    background: "radial-gradient(circle at 20% 0%, rgba(96, 165, 250, 0.28), transparent 32%), linear-gradient(135deg, rgba(59, 130, 246, 0.12), transparent 45%)",
    pointerEvents: "none" as const,
  },
  header: {
    position: "relative" as const,
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    padding: "20px 20px 14px",
    color: "white",
  },
  kicker: {
    margin: "0 0 4px",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#93C5FD",
  },
  title: {
    margin: 0,
    fontSize: "19px",
    lineHeight: 1.2,
    color: "#FFFFFF",
  },
  languageHint: {
    margin: "6px 0 0",
    color: "#BFDBFE",
    fontSize: "11px",
  },
  closeButton: {
    width: "34px",
    height: "34px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.08)",
    color: "#DBEAFE",
    cursor: "pointer",
    fontWeight: 800,
  },
  contextRow: {
    position: "relative" as const,
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "8px",
    padding: "0 20px 14px",
  },
  contextPill: {
    padding: "6px 9px",
    borderRadius: "999px",
    background: "rgba(37, 99, 235, 0.2)",
    border: "1px solid rgba(147, 197, 253, 0.2)",
    color: "#BFDBFE",
    fontSize: "11px",
    fontWeight: 700,
  },
  messages: {
    position: "relative" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
    overflowY: "auto" as const,
    padding: "16px 20px",
    minHeight: "220px",
  },
  message: {
    maxWidth: "88%",
    borderRadius: "16px",
    padding: "11px 13px",
    fontSize: "13px",
    lineHeight: 1.48,
    boxShadow: "0 10px 24px rgba(2, 6, 23, 0.15)",
  },
  assistantMessage: {
    alignSelf: "flex-start",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#E0F2FE",
  },
  userMessage: {
    alignSelf: "flex-end",
    background: "linear-gradient(135deg, #2563EB, #0EA5E9)",
    color: "white",
  },
  quickRow: {
    position: "relative" as const,
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "8px",
    padding: "0 20px 14px",
  },
  quickButton: {
    border: "1px solid rgba(147, 197, 253, 0.25)",
    background: "rgba(15, 23, 42, 0.24)",
    color: "#BFDBFE",
    borderRadius: "999px",
    padding: "8px 10px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  form: {
    position: "relative" as const,
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "10px",
    padding: "0 20px 14px",
  },
  input: {
    minHeight: "48px",
    maxHeight: "92px",
    resize: "vertical" as const,
    borderRadius: "14px",
    border: "1px solid rgba(147, 197, 253, 0.28)",
    background: "rgba(15, 23, 42, 0.54)",
    color: "#EFF6FF",
    padding: "11px 12px",
    fontFamily: "inherit",
    fontSize: "13px",
    outline: "none",
  },
  sendButton: {
    minWidth: "70px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #2563EB, #38BDF8)",
    color: "white",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.32)",
  },
  disclaimer: {
    position: "relative" as const,
    margin: 0,
    padding: "0 20px 18px",
    color: "#93C5FD",
    fontSize: "11px",
    lineHeight: 1.45,
  },
  launcher: {
    pointerEvents: "auto" as const,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minHeight: "54px",
    padding: "10px 16px 10px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(147, 197, 253, 0.54)",
    background: "linear-gradient(135deg, #0F172A, #1D4ED8)",
    color: "white",
    boxShadow: "0 18px 44px rgba(30, 64, 175, 0.38)",
    cursor: "pointer",
  },
  launcherMark: {
    display: "grid",
    placeItems: "center",
    width: "34px",
    height: "34px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #60A5FA, #38BDF8)",
    color: "#082F49",
    fontSize: "12px",
    fontWeight: 900,
  },
  launcherText: {
    fontSize: "14px",
    fontWeight: 800,
  },
};
