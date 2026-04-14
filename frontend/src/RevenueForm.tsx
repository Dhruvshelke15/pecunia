import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useCreateTransaction } from "./hooks/useTransactions";

const CATEGORIES = [
  "Freelance",
  "Salary",
  "Investments",
  "Food",
  "Utilities",
  "Entertainment",
  "Other",
];

export default function RevenueForm() {
  const createTransaction = useCreateTransaction();
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    "income",
  );
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    source: "",
    category: "Freelance",
  });

  const isIncome = transactionType === "income";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await createTransaction.mutateAsync({
        ...formData,
        amount: Number(formData.amount),
        transactionType,
      });
      setMessage({ text: "Transaction recorded", type: "success" });
      setFormData({ ...formData, amount: "", source: "" });
    } catch {
      setMessage({ text: "Failed to save", type: "error" });
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          New Entry
        </h2>
        <div
          className="flex rounded-lg p-0.5 gap-0.5"
          style={{
            background: "var(--bg-input)",
            border: "1px solid var(--border)",
          }}
        >
          {(["income", "expense"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTransactionType(type)}
              className="px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all duration-200"
              style={
                transactionType === type
                  ? type === "income"
                    ? {
                        background: "rgba(20,184,166,0.15)",
                        color: "#14b8a6",
                        border: "1px solid rgba(20,184,166,0.25)",
                      }
                    : {
                        background: "rgba(248,113,113,0.15)",
                        color: "#f87171",
                        border: "1px solid rgba(248,113,113,0.25)",
                      }
                  : {
                      color: "var(--text-muted)",
                      border: "1px solid transparent",
                    }
              }
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label
            className="block text-xs mb-1.5 uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Date
          </label>
          <input
            type="date"
            required
            className="field-input"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div>
          <label
            className="block text-xs mb-1.5 uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Amount
          </label>
          <div className="relative">
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono"
              style={{ color: "var(--text-muted)" }}
            >
              $
            </span>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              className="field-input font-mono pl-8"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label
            className="block text-xs mb-1.5 uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Source
          </label>
          <input
            type="text"
            required
            placeholder={
              isIncome ? "e.g. Salary, Freelance" : "e.g. Netflix, Rent"
            }
            className="field-input"
            value={formData.source}
            onChange={(e) =>
              setFormData({ ...formData, source: e.target.value })
            }
          />
        </div>

        <div>
          <label
            className="block text-xs mb-1.5 uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Category
          </label>
          <select
            className="field-input cursor-pointer"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            style={{ background: "var(--bg-input)" }}
          >
            {CATEGORIES.map((c) => (
              <option
                key={c}
                value={c}
                style={{ background: "var(--option-bg)" }}
              >
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={createTransaction.isPending}
          className="w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: isIncome
              ? "linear-gradient(135deg, #14b8a6, #0d9488)"
              : "linear-gradient(135deg, #f87171, #ef4444)",
            color: isIncome ? "#f0fdf4" : "#fff1f2",
          }}
        >
          {createTransaction.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            `Add ${isIncome ? "Income" : "Expense"}`
          )}
        </button>

        {message && (
          <p
            className="text-center text-xs py-2 rounded-lg"
            style={{
              color: message.type === "success" ? "#14b8a6" : "#f87171",
              background:
                message.type === "success"
                  ? "rgba(20,184,166,0.1)"
                  : "rgba(248,113,113,0.1)",
            }}
          >
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
}
