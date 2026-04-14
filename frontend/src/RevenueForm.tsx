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
          className="font-bold text-sm tracking-widest uppercase"
          style={{ color: "var(--text-secondary)" }}
        >
          New Entry
        </h2>
        <div
          className="flex rounded-lg p-0.5 gap-0.5"
          style={{
            background: "rgba(0,0,0,0.3)",
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
                  ? {
                      background:
                        type === "income"
                          ? "rgba(0,212,170,0.15)"
                          : "rgba(255,92,92,0.15)",
                      color:
                        type === "income" ? "var(--accent)" : "var(--danger)",
                      border: `1px solid ${type === "income" ? "var(--accent-border)" : "rgba(255,92,92,0.25)"}`,
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
            className="block text-xs mb-1.5 tracking-wider uppercase"
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
            className="block text-xs mb-1.5 tracking-wider uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Amount
          </label>
          <div className="relative">
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm mono"
              style={{ color: "var(--text-secondary)" }}
            >
              $
            </span>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              className="field-input mono pl-8"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label
            className="block text-xs mb-1.5 tracking-wider uppercase"
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
            className="block text-xs mb-1.5 tracking-wider uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Category
          </label>
          <select
            className="field-input appearance-none"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            style={{ cursor: "pointer" }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} style={{ background: "#111620" }}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={createTransaction.isPending}
          className="w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 mt-1"
          style={{
            background: isIncome
              ? "linear-gradient(135deg, rgba(0,212,170,0.9), rgba(0,180,145,0.9))"
              : "linear-gradient(135deg, rgba(255,92,92,0.9), rgba(220,60,60,0.9))",
            color: "#080c14",
            opacity: createTransaction.isPending ? 0.6 : 1,
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
              color:
                message.type === "success" ? "var(--accent)" : "var(--danger)",
              background:
                message.type === "success"
                  ? "var(--accent-dim)"
                  : "var(--danger-dim)",
            }}
          >
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
}
