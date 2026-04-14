import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, X } from "lucide-react";
import { useAiChat } from "./hooks/useAiChat";

const SUGGESTIONS = [
  "How much did I spend this month?",
  "What is my biggest expense category?",
  "How does my income compare to expenses?",
  "What were my top 3 expenses?",
];

export default function AiChat() {
  const { messages, isLoading, error, sendMessage, clearMessages } =
    useAiChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    await sendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col h-[600px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
            <p className="text-xs text-slate-400">
              Ask anything about your finances
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <p className="text-sm text-slate-500">Try asking:</p>
            <div className="grid grid-cols-1 gap-2 w-full">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left px-4 py-2.5 text-sm text-slate-300 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-white/5 text-slate-200 border border-white/5 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            </div>
          </div>
        )}

        {error && <p className="text-center text-xs text-red-400">{error}</p>}

        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your finances..."
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-xl glass-input text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
