import { useState, useRef, useEffect } from "react";
import { Send, X, Sparkles, Maximize2, Minimize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
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
  const [expanded, setExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (expanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [expanded]);

  // Lock body scroll when expanded
  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [expanded]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    await sendMessage(trimmed);
  };

  const isStreaming = messages.some((m) => m.streaming);

  const chatContent = (
    <>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#818cf8" }} />
          </div>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              AI Assistant
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {isStreaming ? (
                <span className="flex items-center gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "#818cf8" }}
                  />
                  Typing...
                </span>
              ) : (
                "Ask about your finances"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="btn-ghost w-7 h-7"
              title="Clear chat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="btn-ghost w-7 h-7"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-left text-xs px-3.5 py-2.5 rounded-xl transition-all duration-200"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-hover)";
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.background = "var(--bg-card-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.background = "var(--bg-card)";
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
                className="max-w-[85%] text-xs leading-relaxed px-3.5 py-2.5 rounded-2xl"
                style={
                  msg.role === "user"
                    ? {
                        background: "rgba(20,184,166,0.12)",
                        border: "1px solid rgba(20,184,166,0.2)",
                        color: "var(--text-primary)",
                        borderBottomRightRadius: "4px",
                      }
                    : {
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                        borderBottomLeftRadius: "4px",
                        minWidth: "40px",
                      }
                }
              >
                {msg.role === "assistant" ? (
                  <>
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-1.5 last:mb-0">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <span
                            className="font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {children}
                          </span>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-none space-y-1 mt-1">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-none space-y-1 mt-1">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li
                            className="flex gap-1.5"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            <span style={{ color: "var(--text-muted)" }}>
                              –
                            </span>
                            <span>{children}</span>
                          </li>
                        ),
                        code: ({ children }) => (
                          <code
                            className="font-mono px-1 py-0.5 rounded text-[11px]"
                            style={{
                              color: "#14b8a6",
                              background: "rgba(20,184,166,0.1)",
                            }}
                          >
                            {children}
                          </code>
                        ),
                        h3: ({ children }) => (
                          <h3
                            className="font-semibold mb-1 mt-2 first:mt-0"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {children}
                          </h3>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                    {msg.streaming && (
                      <span
                        className="inline-block w-1.5 h-3.5 ml-0.5 rounded-sm animate-pulse align-middle"
                        style={{ background: "#818cf8", opacity: 0.8 }}
                      />
                    )}
                  </>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div
              className="px-3.5 py-3 rounded-2xl"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderBottomLeftRadius: "4px",
              }}
            >
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{
                      background: "#818cf8",
                      animationDelay: `${i * 150}ms`,
                      animationDuration: "800ms",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-center text-xs" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 py-3 flex gap-2 flex-shrink-0"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <input
          ref={inputRef}
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
          disabled={isLoading || isStreaming}
          className="field-input flex-1 text-xs py-2 px-3"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading || isStreaming}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 border"
          style={
            input.trim() && !isLoading && !isStreaming
              ? {
                  background: "rgba(20,184,166,0.15)",
                  borderColor: "rgba(20,184,166,0.25)",
                  color: "#14b8a6",
                }
              : {
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                  color: "var(--text-muted)",
                }
          }
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );

  if (expanded) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 transition-opacity duration-200"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setExpanded(false)}
        />

        {/* Expanded panel */}
        <div
          className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
          style={{
            width: "50%",
            background: "var(--bg-base)",
            borderLeft: "1px solid var(--border)",
            boxShadow: "-8px 0 32px rgba(0,0,0,0.3)",
          }}
        >
          {chatContent}
        </div>
      </>
    );
  }

  return (
    <div className="card flex flex-col" style={{ height: "400px" }}>
      {chatContent}
    </div>
  );
}
