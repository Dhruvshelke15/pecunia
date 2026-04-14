import { useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Trash2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTransactions, useDeleteTransaction } from "./hooks/useTransactions";
import type { TransactionDTO } from "./hooks/useTransactions";

function exportToCsv(transactions: TransactionDTO[]): void {
  const headers = [
    "Date",
    "Type",
    "Source",
    "Category",
    "Amount",
    "Description",
    "Created",
  ];
  const rows = transactions.map((t) => [
    t.date,
    t.transactionType,
    `"${t.source.replace(/"/g, '""')}"`,
    t.category,
    t.amount.toFixed(2),
    `"${(t.description ?? "").replace(/"/g, '""')}"`,
    t.createdAt,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pecunia-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

const INCOME_COLORS = ["#14b8a6", "#0ea5e9", "#22d3ee", "#34d399", "#6ee7b7"];
const EXPENSE_COLORS = ["#f87171", "#fb7185", "#f97316", "#fbbf24", "#e879f9"];

export default function Dashboard() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isFetching,
  } = useTransactions();
  const deleteMutation = useDeleteTransaction();

  const allEntries = data?.pages.flatMap((p) => p.items) ?? [];
  const [chartType, setChartType] = useState<"bar" | "pie" | "line">("bar");
  const [viewMode, setViewMode] = useState<"income" | "expense">("income");

  const incomeEntries = allEntries.filter(
    (e) => e.transactionType !== "expense",
  );
  const expenseEntries = allEntries.filter(
    (e) => e.transactionType === "expense",
  );

  const totalIncome = incomeEntries.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expenseEntries.reduce((s, i) => s + i.amount, 0);
  const net = totalIncome - totalExpense;

  const isIncome = viewMode === "income";
  const activeData = isIncome ? incomeEntries : expenseEntries;
  const MAIN = isIncome ? "#14b8a6" : "#f87171";
  const COLORS = isIncome ? INCOME_COLORS : EXPENSE_COLORS;

  const groupedData = activeData.reduce(
    (acc: { name: string; value: number }[], curr) => {
      const ex = acc.find((i) => i.name === curr.category);
      if (ex) ex.value += curr.amount;
      else acc.push({ name: curr.category, value: curr.amount });
      return acc;
    },
    [],
  );

  const tooltipStyle = {
    backgroundColor: "var(--tooltip-bg)",
    border: "1px solid var(--tooltip-border)",
    borderRadius: "10px",
    fontSize: "13px",
    color: "var(--text-primary)",
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Income",
            value: totalIncome,
            mode: "income" as const,
            teal: true,
            icon: TrendingUp,
          },
          {
            label: "Expenses",
            value: totalExpense,
            mode: "expense" as const,
            teal: false,
            icon: TrendingDown,
          },
          {
            label: "Net",
            value: net,
            mode: null,
            teal: net >= 0,
            icon: DollarSign,
          },
        ].map(({ label, value, mode, teal, icon: Icon }) => (
          <div
            key={label}
            onClick={() => mode && setViewMode(mode)}
            className="rounded-2xl p-4 transition-all duration-200"
            style={{
              background: teal
                ? "rgba(20,184,166,0.07)"
                : "rgba(248,113,113,0.07)",
              border: `1px solid ${
                viewMode === mode
                  ? teal
                    ? "rgba(20,184,166,0.3)"
                    : "rgba(248,113,113,0.3)"
                  : "var(--border)"
              }`,
              cursor: mode ? "pointer" : "default",
              outline:
                viewMode === mode
                  ? `1px solid ${teal ? "rgba(20,184,166,0.2)" : "rgba(248,113,113,0.2)"}`
                  : "none",
              opacity: mode && viewMode !== mode ? 0.75 : 1,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs uppercase tracking-widest font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </span>
              <Icon
                className="w-3.5 h-3.5"
                style={{ color: teal ? "#14b8a6" : "#f87171" }}
              />
            </div>
            <p
              className="text-2xl font-bold font-mono tracking-tight"
              style={{ color: teal ? "#14b8a6" : "#f87171" }}
            >
              ${value.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="card p-5">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {isIncome ? "Income" : "Expenses"}
            </h2>
            <span
              className="tag"
              style={{
                background: isIncome
                  ? "rgba(20,184,166,0.1)"
                  : "rgba(248,113,113,0.1)",
                color: isIncome ? "#14b8a6" : "#f87171",
              }}
            >
              {viewMode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex rounded-lg p-0.5 gap-0.5"
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border)",
              }}
            >
              {(["bar", "pie", "line"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className="px-3 py-1.5 text-xs rounded-md capitalize font-medium transition-all duration-200"
                  style={
                    chartType === t
                      ? {
                          background: "var(--bg-card-hover)",
                          color: "var(--text-primary)",
                        }
                      : { color: "var(--text-muted)" }
                  }
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={() => exportToCsv(allEntries)}
              className="btn-ghost px-3 py-1.5 text-xs gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>

            <button onClick={() => refetch()} className="btn-ghost w-8 h-8">
              <RefreshCw
                className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Chart */}
        {isLoading ? (
          <div className="h-52 flex items-center justify-center">
            <div
              className="w-5 h-5 border-2 rounded-full animate-spin"
              style={{
                borderColor: "var(--border)",
                borderTopColor: "#14b8a6",
              }}
            />
          </div>
        ) : activeData.length === 0 ? (
          <div className="h-52 flex items-center justify-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No {viewMode} data yet
            </p>
          </div>
        ) : (
          <div className="h-52 w-full mb-5">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={groupedData} barSize={28}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--grid-color)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="var(--axis-color)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--axis-color)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "var(--border)" }}
                  />
                  <Bar dataKey="value" fill={MAIN} radius={[5, 5, 0, 0]} />
                </BarChart>
              ) : chartType === "pie" ? (
                <PieChart>
                  <Pie
                    data={groupedData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={48}
                    stroke="none"
                  >
                    {groupedData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              ) : (
                <LineChart data={activeData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--grid-color)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="var(--axis-color)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--axis-color)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke={MAIN}
                    strokeWidth={2}
                    dot={{
                      r: 3,
                      fill: "var(--bg-base)",
                      strokeWidth: 2,
                      stroke: MAIN,
                    }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Transaction list */}
        <div>
          <p
            className="text-xs uppercase tracking-widest font-medium mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            Recent {viewMode} transactions
          </p>
          <div className="space-y-2">
            <AnimatePresence>
              {activeData.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-card-hover)";
                    e.currentTarget.style.borderColor = "var(--border-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--bg-card)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          entry.transactionType === "expense"
                            ? "rgba(248,113,113,0.1)"
                            : "rgba(20,184,166,0.1)",
                      }}
                    >
                      {entry.transactionType === "expense" ? (
                        <TrendingDown
                          className="w-3.5 h-3.5"
                          style={{ color: "#f87171" }}
                        />
                      ) : (
                        <TrendingUp
                          className="w-3.5 h-3.5"
                          style={{ color: "#14b8a6" }}
                        />
                      )}
                    </div>
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {entry.source}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {entry.date} · {entry.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="text-sm font-bold font-mono"
                      style={{
                        color:
                          entry.transactionType === "expense"
                            ? "#f87171"
                            : "#14b8a6",
                      }}
                    >
                      {entry.transactionType === "expense" ? "-" : "+"}$
                      {entry.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete?")) deleteMutation.mutate(entry.id);
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(248,113,113,0.1)";
                        e.currentTarget.style.color = "#f87171";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--text-muted)";
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-2.5 text-xs rounded-xl transition-all duration-200 font-medium"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                {isFetchingNextPage ? "Loading..." : "Load more"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
