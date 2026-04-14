import { useState, useRef } from "react";
import { api } from "../api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef(false);

  const typewriterReveal = (
    fullText: string,
    onUpdate: (partial: string) => void,
  ) => {
    return new Promise<void>((resolve) => {
      cancelRef.current = false;
      let i = 0;
      const chunkSize = 3;
      const baseDelay = 12;

      const tick = () => {
        if (cancelRef.current) {
          onUpdate(fullText);
          resolve();
          return;
        }
        if (i >= fullText.length) {
          resolve();
          return;
        }
        i = Math.min(i + chunkSize, fullText.length);
        onUpdate(fullText.slice(0, i));
        const nextDelay =
          fullText[i - 1] === "." || fullText[i - 1] === "\n"
            ? baseDelay * 6
            : baseDelay;
        setTimeout(tick, nextDelay);
      };
      tick();
    });
  };

  const sendMessage = async (content: string) => {
    const userMessage: ChatMessage = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post<{ reply: string }>("/chat", {
        message: content,
      });
      const fullReply = res.data.reply;

      // Add empty streaming message
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", streaming: true },
      ]);
      setIsLoading(false);

      // Typewriter reveal
      await typewriterReveal(fullReply, (partial) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "assistant") {
            updated[updated.length - 1] = { ...last, content: partial };
          }
          return updated;
        });
      });

      // Mark streaming done
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === "assistant") {
          updated[updated.length - 1] = { ...last, streaming: false };
        }
        return updated;
      });
    } catch {
      setIsLoading(false);
      setError("Failed to get a response. Try again.");
    }
  };

  const clearMessages = () => {
    cancelRef.current = true;
    setMessages([]);
    setError(null);
  };

  return { messages, isLoading, error, sendMessage, clearMessages };
}
