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
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Scroll only the message list; scrollIntoView would also scroll the page.
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
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
      <div
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <div>
          <h2 className="panel-title flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: "var(--brass)" }} />
            Ask Pecunia
          </h2>
          <p className="text-[0.8125rem] mt-0.5" style={{ color: "var(--ink-3)" }} aria-live="polite">
            {isStreaming ? "Writing an answer…" : "Answers come from your own entries"}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button onClick={clearMessages} className="btn-quiet w-8 h-8" aria-label="Clear conversation">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="btn-quiet w-8 h-8"
            aria-label={expanded ? "Collapse chat" : "Expand chat"}
          >
            {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm mb-1" style={{ color: "var(--ink-3)" }}>
              Try one of these
            </p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-left text-sm px-3.5 py-2.5 rounded-lg transition-colors hover:border-[var(--brass)]"
                style={{ background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--ink-2)" }}
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map((msg, i) =>
            msg.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div
                  className="max-w-[85%] text-sm leading-relaxed px-3.5 py-2 rounded-2xl rounded-br-md"
                  style={{ background: "var(--brass-soft)", color: "var(--ink)" }}
                >
                  {msg.content}
                </div>
              </div>
            ) : (
              <div key={i} className="text-sm leading-relaxed pl-3" style={{ borderLeft: "2px solid var(--line-strong)", color: "var(--ink-2)" }}>
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => (
                      <strong className="font-semibold" style={{ color: "var(--ink)" }}>
                        {children}
                      </strong>
                    ),
                    ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 my-1">{children}</ol>,
                    code: ({ children }) => (
                      <code className="px-1 rounded" style={{ background: "var(--surface-2)", color: "var(--ink)" }}>
                        {children}
                      </code>
                    ),
                    h3: ({ children }) => (
                      <h3 className="font-semibold mb-1 mt-2 first:mt-0" style={{ color: "var(--ink)" }}>
                        {children}
                      </h3>
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
                {msg.streaming && (
                  <span className="inline-block w-1.5 h-4 ml-0.5 animate-pulse align-middle" style={{ background: "var(--brass)" }} />
                )}
              </div>
            ),
          )
        )}

        {isLoading && (
          <div className="flex gap-1 items-center pl-3 py-2" aria-label="Thinking">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ background: "var(--brass)", animationDelay: `${i * 150}ms`, animationDuration: "800ms" }}
              />
            ))}
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm" style={{ color: "var(--expense)" }}>
            {error}
          </p>
        )}
      </div>

      <form
        className="px-4 py-3 flex gap-2 flex-shrink-0"
        style={{ borderTop: "1px solid var(--line)" }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="How much went on food in March?"
          aria-label="Ask a question"
          disabled={isLoading || isStreaming}
          className="field flex-1"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading || isStreaming}
          className="btn-primary w-11 flex-shrink-0"
          aria-label="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </>
  );

  if (expanded) {
    return (
      <>
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(6,14,12,0.55)", backdropFilter: "blur(3px)" }}
          onClick={() => setExpanded(false)}
        />
        <div
          role="dialog"
          aria-label="Ask Pecunia"
          className="fixed top-0 right-0 bottom-0 z-50 flex flex-col w-full sm:w-[min(640px,60vw)]"
          style={{ background: "var(--surface)", borderLeft: "1px solid var(--line-strong)" }}
          onKeyDown={(e) => e.key === "Escape" && setExpanded(false)}
        >
          {chatContent}
        </div>
      </>
    );
  }

  return (
    <section className="panel flex flex-col h-[460px]">
      {chatContent}
    </section>
  );
}
