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
      setMessage({
        text: `${isIncome ? "Income" : "Expense"} added`,
        type: "success",
      });
      setFormData({ ...formData, amount: "", source: "" });
    } catch {
      setMessage({
        text: "Couldn't save this entry. Check your connection and try again.",
        type: "error",
      });
    }
  };

  return (
    <section className="panel p-5 sm:p-6" aria-labelledby="entry-title">
      <h2 id="entry-title" className="panel-title">
        Add an entry
      </h2>

      <div
        className="mt-4 grid grid-cols-2 p-1 rounded-[10px]"
        style={{ background: "var(--surface-2)", border: "1px solid var(--line)" }}
        role="group"
        aria-label="Entry type"
      >
        {(["income", "expense"] as const).map((type) => {
          const active = transactionType === type;
          const tone = type === "income" ? "income" : "expense";
          return (
            <button
              key={type}
              type="button"
              aria-pressed={active}
              onClick={() => setTransactionType(type)}
              className="py-2 rounded-[7px] text-sm font-semibold transition-colors"
              style={
                active
                  ? { background: `var(--${tone}-soft)`, color: `var(--${tone})` }
                  : { color: "var(--ink-3)" }
              }
            >
              {type === "income" ? "Money in" : "Money out"}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="amount" className="label">
            Amount
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 font-display text-xl"
              style={{ color: "var(--ink-3)" }}
            >
              $
            </span>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              className="field font-display !text-2xl !py-3 pl-8"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label htmlFor="source" className="label">
            {isIncome ? "From" : "Paid to"}
          </label>
          <input
            id="source"
            type="text"
            required
            placeholder={isIncome ? "Acme Corp" : "Landlord"}
            className="field"
            value={formData.source}
            onChange={(e) =>
              setFormData({ ...formData, source: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="date" className="label">
              Date
            </label>
            <input
              id="date"
              type="date"
              required
              className="field"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>
          <div>
            <label htmlFor="category" className="label">
              Category
            </label>
            <select
              id="category"
              className="field cursor-pointer"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={createTransaction.isPending}
          className="btn-primary w-full h-11"
        >
          {createTransaction.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            `Add ${isIncome ? "income" : "expense"}`
          )}
        </button>

        {message && (
          <p
            role="status"
            className="text-sm"
            style={{
              color: message.type === "success" ? "var(--income)" : "var(--expense)",
            }}
          >
            {message.text}
          </p>
        )}
      </form>
    </section>
  );
}
