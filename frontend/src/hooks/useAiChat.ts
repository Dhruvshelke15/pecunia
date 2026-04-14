import { useState } from "react";
import { api } from "../api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    const userMessage: ChatMessage = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post<{ reply: string }>("/chat", {
        message: content,
      });
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: res.data.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setError("Failed to get a response. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => setMessages([]);

  return { messages, isLoading, error, sendMessage, clearMessages };
}
