import { useState, useCallback } from "react";
import { api } from "../api";

export type InsightType = "health_score" | "forecast" | "personality";

export interface HealthScore {
  score: number;
  grade: string;
  breakdown: {
    savingsRate: number;
    expenseConsistency: number;
    diversification: number;
  };
  summary: string;
  tips: string[];
}

export interface Forecast {
  projectedIncome: number;
  projectedExpenses: number;
  projectedNet: number;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  categoryForecasts: { category: string; projected: number }[];
}

export interface Personality {
  archetype: string;
  emoji: string;
  tagline: string;
  dominantCategory: string;
  description: string;
  strengths: string[];
  watchouts: string[];
  recommendation: string;
}

export function useInsight<T>(type: InsightType) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ type: InsightType; data: T }>("/insights", {
        type,
      });
      setData(res.data.data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to generate insight.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [type]);

  return { data, loading, error, generate };
}
