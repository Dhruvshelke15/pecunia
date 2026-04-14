import { useState, useRef, useEffect } from "react";
import { Send, Loader2, X, Sparkles } from "lucide-react";
import { useAiChat } from "./hooks/useAiChat";

const SUGGESTIONS = [
  "How much did I spend this month?",
  "What is my biggest expense category?",
  "Compare my income vs expenses",
  "What were my top 3 expenses?",
];

export default function AiChat() {
  const { messages, isLoading, error, sendMessage, clearMessages } =
    useAiChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    await sendMessage(trimmed);
  };

  return (
    <div className="card flex flex-col" style={{ height: "420px" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#818cf8" }} />
          </div>
          <div>
            <p
              className="text-sm font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              AI Assistant
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Ask about your finances
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-hover)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-left text-xs px-3.5 py-2.5 rounded-xl transition-all duration-200"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface-hover)";
                  e.currentTarget.style.borderColor = "var(--border-hover)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--surface)";
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[85%] text-xs leading-relaxed px-3.5 py-2.5 rounded-2xl whitespace-pre-wrap"
                style={
                  msg.role === "user"
                    ? {
                        background: "rgba(0,212,170,0.12)",
                        border: "1px solid rgba(0,212,170,0.2)",
                        color: "var(--text-primary)",
                        borderBottomRightRadius: "4px",
                      }
                    : {
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                        borderBottomLeftRadius: "4px",
                      }
                }
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div
              className="px-3.5 py-2.5 rounded-2xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderBottomLeftRadius: "4px",
              }}
            >
              <Loader2
                className="w-3.5 h-3.5 animate-spin"
                style={{ color: "var(--accent)" }}
              />
            </div>
          </div>
        )}

        {error && (
          <p className="text-center text-xs" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 py-3 flex gap-2"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask anything..."
          disabled={isLoading}
          className="field-input flex-1 text-xs"
          style={{ padding: "8px 12px" }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0"
          style={{
            background:
              input.trim() && !isLoading
                ? "var(--accent-dim)"
                : "var(--surface)",
            border: `1px solid ${input.trim() && !isLoading ? "var(--accent-border)" : "var(--border)"}`,
            color:
              input.trim() && !isLoading
                ? "var(--accent)"
                : "var(--text-muted)",
          }}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
